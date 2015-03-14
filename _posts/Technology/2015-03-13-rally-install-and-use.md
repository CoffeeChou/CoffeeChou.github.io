---
layout: post
title: Rally 的安装和使用
category: 技术探讨
keywords: OpenStack, Rally, 安装, 使用
---

之前在 CentOS 6.5 上安装的 rally，虽然最后是能用，但由于支持不好，问题很多，这次在 CentOS 7 上做尝试。

## 环境

之前在 CentOS 6.5 上安装的 rally，虽然最后是能用，但由于支持不好，问题很多，这次在 CentOS 7 上做尝试。


## 安装

1. 克隆 Rally 的 git 仓库到本地。

    ```
    $ git clone https://git.openstack.org/stackforge/rally
    ```

1. 切换到 Rally 的目录下，安装 Rally。

    ```
    cd rally/
    # ./install_rally.sh -v
    ```

  * 在这个步骤中，rally 的安装脚本会自动安装需要的依赖。
  * 安装完成后，提示如下：

    ```
    ======================================================================
    Before every Rally session, activate the virtualenv of Rally:
    $ source /opt/rally/bin/activate
    
    You may put the following in your ~/.bashrc file for convenience:
    alias initrally='source /opt/rally/bin/activate'
    ======================================================================
    ======================================================================
    Information about your Rally installation:
     * Method: isolated
     * Virtual Environment at: /opt/rally
     * Database at: /opt/rally/database
     * Configuration file at: /etc/rally
    ======================================================================
    ```

    * 然后就可以用了，多么简单0.0

## 使用方法

由于我们之前安装 Rally 的时候使用的是 `./install_rally.sh -v`，即使用了虚拟环境，所以，每次使用 rally 之前，要先激活虚拟环境，才能使用 rally：

```
# source /opt/rally/bin/activate
```

* 使用之前，可以用 `rally --help` 看一下帮助信息。

```
# 内容太多就搬运一点点
Command categories:
  {version,bash-completion,info,use,task,show,verify,deployment}
```

* 说明 rally 之后可以加上以上参数，要查看各个参数的帮助信息可以像这样：

```
# rally [Command] --help
```


### 创建环境
1. 先列出现有的环境：

    ```
    rally deployment list
    # 由于还没有创建测试环境，提示如下：
    There are no deployments. To create a new deployment, use:
    rally deployment create
    ```

1. 创建测试环境：

    创建测试环境有两种方法：
    
    如果安装 rally 的机器上正好有一套环境，要测试这套环境，可以使用命令：

    ```
    # rally deployment create --fromenv --name local_deployment
    +--------------------------------------+----------------------------+------------------+------------------+--------+
    | uuid                                 | created_at                 | name             | status           | active |
    +--------------------------------------+----------------------------+------------------+------------------+--------+
    | 85ba9834-10a9-45d3-8a22-859c57eb4c02 | 2015-03-13 08:52:56.873452 | local_deployment | deploy->finished |        |
    +--------------------------------------+----------------------------+------------------+------------------+--------+
    Using deployment: 85ba9834-10a9-45d3-8a22-859c57eb4c02
    ~/.rally/openrc was updated
    
    HINTS:
    * To get your cloud resources, run:
            rally show [flavors|images|keypairs|networks|secgroups]
  
    * To use standard OpenStack clients, set up your env by running:
            source ~/.rally/openrc
      OpenStack clients are now configured, e.g run:
            glance image-list
    ```       

    如果安装 rally 的机器上没有环境，想要测试其他环境，则将环境信息写入配置文件中，使用以下命令：

    ```
    # rally deployment create --filename existing.json --name other_deployment
    +--------------------------------------+----------------------------+------------------+------------------+--------+
    | uuid                                 | created_at                 | name             | status           | active |
    +--------------------------------------+----------------------------+------------------+------------------+--------+
    | 7e960dae-5235-4f6b-b51d-f4ddb6fc13c7 | 2015-03-13 08:58:30.635758 | other_deployment | deploy->finished |        |
    +--------------------------------------+----------------------------+------------------+------------------+--------+
    Using deployment: 7e960dae-5235-4f6b-b51d-f4ddb6fc13c7
    ~/.rally/openrc was updated

    HINTS:
    * To get your cloud resources, run:
            rally show [flavors|images|keypairs|networks|secgroups]

    * To use standard OpenStack clients, set up your env by running:
            source ~/.rally/openrc
      OpenStack clients are now configured, e.g run:
            glance image-list
    ```

    其中，在 `~/rally/samples/deployments` 目录下有配置文件样例 `existing.json`，根据该配置文件中的格式写好配置文件即可。以下是该文件的样例：

    ```json
    {
        "type": "ExistingCloud",
        "auth_url": "http://example.net:5000/v2.0/",
        "region_name": "RegionOne",
        "endpoint_type": "public",
        "admin": {
            "username": "admin",
            "password": "myadminpass",
            "tenant_name": "demo"
        }
    }
    ```

### 检查环境可用性

```
# rally deployment check
keystone endpoints are valid and following services are available:
+----------+----------------+-----------+
| services | type           | status    |
+----------+----------------+-----------+
| cinder   | volume         | Available |
| cinderv2 | volumev2       | Available |
| glance   | image          | Available |
| heat     | orchestration  | Available |
| heat-cfn | cloudformation | Available |
| keystone | identity       | Available |
| neutron  | network        | Available |
| nova     | compute        | Available |
| nova_ec2 | ec2            | Available |
| swift    | object-store   | Available |
| swift_s3 | s3             | Available |
+----------+----------------+-----------+
```

### 查看测试环境
1. 确认当前所使用的测试环境：

    ```
    # rally deployment list
    +--------------------------------------+----------------------------+------------------+------------------+--------+
    | uuid                                 | created_at                 | name             | status           | active |
    +--------------------------------------+----------------------------+------------------+------------------+--------+
    | 85ba9834-10a9-45d3-8a22-859c57eb4c02 | 2015-03-13 08:52:56.873452 | local_deployment | deploy->finished |        |
    | 7e960dae-5235-4f6b-b51d-f4ddb6fc13c7 | 2015-03-13 08:58:30.635758 | other_deployment | deploy->finished | *      |
    +--------------------------------------+----------------------------+------------------+------------------+--------+
    ```
  看到 `active` 中显示当前所使用的测试环境为 ***other_deployment***。

1. 如果要使用另一个测试环境进行测试，可以执行以下命令：

    ```
    # rally use deployment --deployment local_deployment
    Using deployment: 85ba9834-10a9-45d3-8a22-859c57eb4c02
    ~/.rally/openrc was updated
  
    HINTS:
    * To get your cloud resources, run:
            rally show [flavors|images|keypairs|networks|secgroups]
  
    * To use standard OpenStack clients, set up your env by running:
            source ~/.rally/openrc
      OpenStack clients are now configured, e.g run:
            glance image-list
    ```

  > #### 笔者注：
  > * 如果懒，上述命令可以写成：`rally use deployment local_deployment`。
  > * 原本可以使用命令 `rally deployment use --deployment [ DEPLOYMENT_NAME | UUID ]` 完成上述操作的。但是由于 **Rally 0.0.2** 发布后将命令换为 `rally use XXX` 了。
  > * 关于 **Rally 0.0.2** 的信息，请看 [**Release Note**](https://github.com/stackforge/rally/releases)。

### 执行测试任务
  
  Rally 中写了一些测试用例的 samples，可以直接使用。

1. 切换到 `samples` 目录：

    ```
    # cd samples/tasks/scenarios/
    ```

    samples 目录下有很多测试用例，这里选用其中的 `task/scenarios/` 来进行一些说明。

1. 看看都有什么场景测试：

    ```
    # ls
    authenticate  cinder     dummy   heat      mistral  nova    README.rst  sahara                                 vm
    ceilometer    designate  glance  keystone  neutron  quotas  requests    tempest-do-not-run-against-production  zaqar
    ```

1. 以 `authenticate` 为例：

    切换到 `authenticate` 目录：

    ```
    # cd authenticate/
    ```

    查看可用的用例：

    ```
    # ls
    keystone.json  token_validate_cinder.json  token_validate_glance.json  token_validate_heat.json  token_validate_neutron.json  token_validate_nova.json
    keystone.yaml  token_validate_cinder.yaml  token_validate_glance.yaml  token_validate_heat.yaml  token_validate_neutron.yaml  token_validate_nova.yaml
    ```

1. vi 打开 `keystone.json` 看一下配置文件怎么写：

    ```json
    {
        "Authenticate.keystone": [
            {
                "runner": {
                    "type": "constant",
                    "times": 100,
                    "concurrency": 5
                },
                "context": {
                    "users": {
                        "tenants": 3,
                        "users_per_tenant": 50
                    }
                }
            }
        ]
    }
    ```

    关于其中各个参数的解释在另一篇博客 [Rally 的概念] 中有写，这里就不解释了。

    这里把 `"times": 100` 改为 10，`"users_per_tenant": 50` 改为 5。

1. 执行测试任务：

    ```
    # rally task start keystone.json
    --------------------------------------------------------------------------------
     Preparing input task
    --------------------------------------------------------------------------------
    
    Input task is:
    {
        "Authenticate.keystone": [
            {
                "runner": {
                    "type": "constant",
                    "times": 10,
                    "concurrency": 5
                },
                "context": {
                    "users": {
                        "tenants": 3,
                        "users_per_tenant": 5
                    }
                }
            }
        ]
    }
    
    --------------------------------------------------------------------------------
     Task  e940da9c-d2c5-499a-bad3-c744c211e78a: started
    --------------------------------------------------------------------------------
    
    Benchmarking... This can take a while...
    
    To track task status use:
    
            rally task status
            or
            rally task detailed
    
    
    --------------------------------------------------------------------------------
    Task e940da9c-d2c5-499a-bad3-c744c211e78a: finished
    --------------------------------------------------------------------------------
    
    test scenario Authenticate.keystone
    args position 0
    args values:
    OrderedDict([(u'runner', OrderedDict([(u'type', u'constant'), (u'concurrency', 5), (u'times', 10)])), (u'context', OrderedDict([(u'users', OrderedDict([(u'project_domain'
    , u'default'), (u'users_per_tenant', 5), (u'tenants', 3), (u'resource_management_workers', 30), (u'user_domain', u'default')]))]))])
    +--------+-----------+-----------+-----------+---------------+---------------+---------+-------+
    | action | min (sec) | avg (sec) | max (sec) | 90 percentile | 95 percentile | success | count |
    +--------+-----------+-----------+-----------+---------------+---------------+---------+-------+
    | total  | 0.132     | 0.239     | 0.368     | 0.353         | 0.361         | 100.0%  | 10    |
    +--------+-----------+-----------+-----------+---------------+---------------+---------+-------+
    Load duration: 0.618978023529
    Full duration: 29.6674039364
    
    HINTS:
    * To plot HTML graphics with this data, run:
            rally task report e940da9c-d2c5-499a-bad3-c744c211e78a --out output.html
    
    * To get raw JSON output of task results, run:
            rally task results e940da9c-d2c5-499a-bad3-c744c211e78a
    
    Using task: e940da9c-d2c5-499a-bad3-c744c211e78a
    ```

1. 根据提示，可以用以下命令将测试结果导出为 html 格式：

    ```
    # rally task report e940da9c-d2c5-499a-bad3-c744c211e78a --out output.html
    ```

    可以将其中的 `output.html` 替换为要存放这个 html 文件的路径及名称。

    然后就可以在网页上打开看啦，是这个样子：

<center>![Rally result.png](/public/imgs/rally_keystone.png)</center>
<center><i>Rally 的 html 输出</i></center>



