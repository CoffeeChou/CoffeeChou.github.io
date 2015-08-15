---
layout: post
title: 让 BUG 带你去看代码
category: 技术探讨
keywords: Rally, OpenStack, test
---

<i>是谁说过：了解一个项目的最好办法是对它测试，了解它的代码的最好办法是为它修 bug。</i>

<p align="right">-- 如果没有人认领，那就是我说的哈哈。</p>

玩笑开完，进入正题。

前面有几篇 blog 写过关于 Rally 的东西，基本是以一个使用者的角度去看 Rally。

刚开始使用 Rally 的时候，也是刚开始学习 Python 的时候。

总想找点代码来看看，于是，开始看 Rally 的代码。

当时已经比较熟悉 Rally 的使用了，但是把代码通看一遍，一点也没看明白。

直到开始修 bug ...

Rally 是一个还非常不成熟的项目，虽然已经可以进行基本的测试，深入到细节之后，会发现有很多 bug，也有很多不能满足测试需求的地方。

## 发现 bug

举个例子，Rally 中有一组虚拟机相关的测试 -- VMTasks

```
# rally info find VMTasks
------------------------------------
 VMTasks (benchmark scenario group) 
------------------------------------

Benchmark scenarios that are to be run inside VM instances.
 Benchmark scenarios:
------------------------------------------------------------------------------------------------------
 Name                             Description
------------------------------------------------------------------------------------------------------
 VMTasks.boot_runcommand_delete   Boot a server, run a script that outputs JSON, delete the server.
------------------------------------------------------------------------------------------------------
```

其对应的测试文件在：

```
# ls rally/samples/tasks/scenarios/vm/
boot-runcommand-delete.json  boot-runcommand-delete-with-disk.json  boot-runcommand-delete-with-disk.yaml  boot-runcommand-delete.yaml
```

打开测试文件：

```
# cat boot-runcommand-delete.yaml
---
  VMTasks.boot_runcommand_delete:
    -
      args:
        flavor:
            name: "m1.nano"
        image:
            name: "^cirros.*uec$"
        floating_network: "public"
        force_delete: false
        script: "samples/tasks/support/instance_dd_test.sh"
        interpreter: "/bin/sh"
        username: "cirros"
      runner:
        type: "constant"
        times: 10
        concurrency: 2
      context:
        users:
          tenants: 3
          users_per_tenant: 2
        network: {}
```

直观上获得以下信息：

* Rally 将启动 N 台虚拟机，然后在虚拟机里执行指定脚本；
* 可以指定创建虚拟机的相关参数；
* 脚本不一定是 shell，可以通过 `interpreter` 参数指定所用的执行脚本的命令。

执行测试命令：`rally -d task start boot-runcommand-delete.yaml`

测试流程如下：

1. 创建虚拟机；
1. 为虚拟机分配 floating ip；
1. PING，等待虚拟机网络接通；
1. SSH 到虚拟机，将脚本扔到虚拟机里；
1. 执行脚本；
1. 向 Rally 返回脚本执行结果；
1. 获取结果，显示。

问题来了，SSH 一直超时。

查了日志之后，发现 Rally 创建虚拟机时，没有指定 key name，但 SSH 时使用 key name 去连接。  --当然连不上了。

## BUG 跟踪

找到 VMTasks 测试的代码：`rally/rally/benchmark/scenarios/vm/vmtasks.py`

```python
def boot_runcommand_delete(self, image, flavor,
                           script, interpreter, username,
                           password=None,
                           volume_args=None,
                           floating_network=None,
                           port=22,
                           use_floating_ip=True,
                           force_delete=False,
                           **kwargs):
    """Boot a server, run a script that outputs JSON, delete the server.

    Example Script in samples/tasks/support/instance_dd_test.sh

    :param image: glance image name to use for the vm
    :param flavor: VM flavor name
    :param script: script to run on server, must output JSON mapping
                   metric names to values (see the sample script below)
    :param interpreter: server's interpreter to run the script
    :param username: ssh username on server, str
    :param password: Password on SSH authentication
    :param volume_args: volume args for booting server from volume
    :param floating_network: external network name, for floating ip
    :param port: ssh port for SSH connection
    :param use_floating_ip: bool, floating or fixed IP for SSH connection
    :param force_delete: whether to use force_delete for servers
    :param **kwargs: extra arguments for booting the server
    :returns: dictionary with keys `data' and `errors':
              data: dict, JSON output from the script
              errors: str, raw data from the script's stderr stream
    """

    if volume_args:
        volume = self._create_volume(volume_args["size"], imageRef=None)
        kwargs["block_device_mapping"] = {"vdrally": "%s:::1" % volume.id}

    server, fip = self._boot_server_with_fip(
        image, flavor, use_floating_ip=use_floating_ip,
        floating_network=floating_network,
        key_name=self.context["user"]["keypair"]["name"],
        **kwargs

... ...
```

看到创建虚拟机时，其实已经指定了 `key_name`，调用的是 `_boot_server_with_fip` 方法。

找到 "\_boot\_server\_with\_fip" 方法：`rally/rally/benchmark/scenarios/vm/utils.py`

```python
def _boot_server_with_fip(self, image, flavor,
                          use_floating_ip=True, floating_network=None,
                          wait_for_ping=True, **kwargs):
    """Boot server prepared for SSH actions."""
    kwargs["auto_assign_nic"] = True
    server = self._boot_server(image, flavor, **kwargs)

    if not server.networks:
        raise RuntimeError(
            "Server `%(server)s' is not connected to any network. "
            "Use network context for auto-assigning networks "
            "or provide `nics' argument with specific net-id." % {
                "server": server.name})

    if use_floating_ip:
        fip = self._attach_floating_ip(server, floating_network)
    else:
        internal_network = list(server.networks)[0]
        fip = {"ip": server.addresses[internal_network][0]["addr"]}

    if wait_for_ping:
        self._wait_for_ping(fip["ip"])

    return server, {"ip": fip.get("ip"),
                    "id": fip.get("id"),
                    "is_floating": use_floating_ip}
```

喔，看到 "server = self.\_boot\_server(image, flavor, **kwargs)"，这个家伙又调用了 `_boot_server` 方法：`rally/rally/benchmark/scenarios/nova/utils.py`

```python
def _boot_server(self, image_id, flavor_id,
                 auto_assign_nic=False, name=None, **kwargs):

    server_name = name or self._generate_random_name()
    secgroup = self.context.get("user", {}).get("secgroup")
    if secgroup:
        if "security_groups" not in kwargs:
            kwargs["security_groups"] = [secgroup["name"]]
        elif secgroup["name"] not in kwargs["security_groups"]:
            kwargs["security_groups"].append(secgroup["name"])

    if auto_assign_nic and not kwargs.get("nics", False):
        nets = [net["id"] for net in
                self.context.get("tenant", {}).get("networks", [])]
        if nets:
            # NOTE(amaretskiy): Balance servers among networks:
            #     divmod(iteration % tenants_num, nets_num)[1]
            net_idx = divmod(
                (self.context["iteration"]
                 % self.context["config"]["users"]["tenants"]),
                len(nets))[1]
            kwargs["nics"] = [{"net-id": nets[net_idx]}]

    server = self.clients("nova").servers.create(
        server_name, image_id, flavor_id, **kwargs)
... ...
```

终于找到根源了，我们倒回去看问题：

1. 最终 "\_boot\_server()" 方法调用的是 novaclient 的 "servers.create()"，这个就先不管了，至少知道：**server\_name**、**image\_id**、**flavor_id** 是必需参数，其余传进来的参数都作为 **kwarg 可变参数传给 novaclient 了；
1. 在 "\_boot\_runcommand\_delete()" 方法中，已经传递了 "key\_name" 参数，作为 **kwargs 可变参数传给 "\_boot\_server\_with\_fip()" 方法；
1. "\_boot\_server\_with\_fip()" 方法**本应该**将 **kwargs 可变参数传递给 "\_boot\_server()" 方法；
