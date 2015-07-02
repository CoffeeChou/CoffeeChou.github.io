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

## 查代码

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
