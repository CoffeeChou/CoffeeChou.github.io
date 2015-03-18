---
layout: post
title: Rally 的安装和简单使用
category: 技术探讨
keywords: OpenStack, Rally, 安装, 使用
---

## 环境

之前在 CentOS 6.5 上安装的 rally，虽然最后是能用，但由于 CentOS 6.5 上的 python 版本是 2.6，支持不是很好 (rally 的 python 版本是 2.7)，问题很多，这次在 CentOS 7 上做尝试。


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
> #### 笔者注：
> 如果安装 Rally 时，是直接使用命令 `./install_rally.sh` 而没有使用虚拟环境，可以直接使用 rally，不需要激活环境。

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

### 使用 info

  笔者以前没有太重视这个命令，现在发现这个命令给了我们很多的信息，是**非常有用**的。因此，在开始使用 Rally 执行测试之前，先看看 info 都给了我们什么重要的信息。
  
  Rally 中的测试用例在其代码中已经写好并实现，其测试用例放在 Rally 项目下的 `samples/` 目录中。如果需要查看场景测试的信息，并了解其测试目的，可以使用下列命令进行查看：

```
# rally info BenchmarkScenarios
-----------------------------
 Rally - Benchmark scenarios 
-----------------------------

Benchmark scenarios are what Rally actually uses to test the performance of an OpenStack deployment.
Each Benchmark scenario implements a sequence of atomic operations (server calls) to simulate
interesing user/operator/client activity in some typical use case, usually that of a specific OpenStack
project. Iterative execution of this sequence produces some kind of load on the target cloud.
Benchmark scenarios play the role of building blocks in benchmark task configuration files.

Scenarios in Rally are put together in groups. Each scenario group is concentrated on some specific 
OpenStack functionality. For example, the 'NovaServers' scenario group contains scenarios that employ
several basic operations available in Nova.

 List of Benchmark scenario groups:
--------------------------------------------------------------------------------------------
 Name                       Description
--------------------------------------------------------------------------------------------
 Authenticate               Benchmark scenarios for the authentication mechanism.
 CeilometerAlarms           Benchmark scenarios for Ceilometer Alarms API.
 CeilometerMeters           Benchmark scenarios for Ceilometer Meters API.
 CeilometerQueries          Benchmark scenarios for Ceilometer Queries API.
 CeilometerResource         Benchmark scenarios for Ceilometer Resource API.
 CeilometerStats            Benchmark scenarios for Ceilometer Stats API.
 CinderVolumes              Benchmark scenarios for Cinder Volumes.
 DesignateBasic             Basic benchmark scenarios for Designate.
 Dummy                      Dummy benchmarks for testing Rally benchmark engine at scale.
 GlanceImages               Benchmark scenarios for Glance images.
 HeatStacks                 Benchmark scenarios for Heat stacks.
 KeystoneBasic              Basic benchmark scenarios for Keystone.
 MistralWorkbooks           Benchmark scenarios for Mistral workbook.
 NeutronNetworks            Benchmark scenarios for Neutron.
 NovaKeypair                Benchmark scenarios for Nova keypairs.
 NovaSecGroup               Benchmark scenarios for Nova security groups.
 NovaServers                Benchmark scenarios for Nova servers.
 Quotas                     Benchmark scenarios for quotas.
 Requests                   Benchmark scenarios for HTTP requests.
 SaharaClusters             Benchmark scenarios for Sahara clusters.
 SaharaJob                  Benchmark scenarios for Sahara jobs.
 SaharaNodeGroupTemplates   Benchmark scenarios for Sahara node group templates.
 TempestScenario            Benchmark scenarios that launch Tempest tests.
 VMTasks                    Benchmark scenarios that are to be run inside VM instances.
 ZaqarBasic                 Benchmark scenarios for Zaqar.
--------------------------------------------------------------------------------------------

To get information about benchmark scenarios inside each scenario group, run:
  $ rally info find <ScenarioGroupName>

```
  该命令列出了所有可用的测试场景的组 (**ScenarioGroup**)，有这么多～

  其中，在 **Description** 部分，对每个组所进行的测试进行了描述。

  可以使用命令 `rally info find <ScenarioGroupName>` 查看某个组中，具体某个场景测试的功能，如：

```
# rally info find Authenticate
-----------------------------------------
 Authenticate (benchmark scenario group) 
-----------------------------------------

Benchmark scenarios for the authentication mechanism.

Benchmark scenarios for different types of OpenStack clients like Keystone,
Nova etc.
 Benchmark scenarios:
---------------------------------------------------------------------------------------
 Name                            Description
---------------------------------------------------------------------------------------
 Authenticate.keystone           Check Keystone Client.
 Authenticate.validate_cinder    Check Cinder Client to ensure validation of token.
 Authenticate.validate_glance    Check Glance Client to ensure validation of token.
 Authenticate.validate_heat      Check Heat Client to ensure validation of token.
 Authenticate.validate_neutron   Check Neutron Client to ensure validation of token.
 Authenticate.validate_nova      Check Nova Client to ensure validation of token.
---------------------------------------------------------------------------------------
```

> #### 笔者注：
> 可以通过 `rally info --help` 命令查看相关信息，了解 Rally 一些参数或测试的用法。

### 执行场景测试任务

1. 切换到 `samples` 目录：

    ```
    # cd samples/tasks/scenarios/
    ```

    samples 目录下有很多测试用例，这里选用其中的 `task/scenarios/` 来进行一些说明。

1. 看看都有什么场景测试 (对应上述的 `rally info find Authenticate` 的结果)：

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

    关于其中各个参数的解释在另一篇博客 [Rally 的概念](../../../2015/03/13/rally-concepts.html) 中有写，这里就不解释了。

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

    然后就可以在网页上打开看啦，是这个样子：</br></br>

    <center>![Rally Succeeded Result](/public/imgs/rally_keystone.png)</center>
    <center><i>Rally 测试成功时的 html 输出</i></center>

    当测试有失败时，输出的 html 文件会是这样子：</br></br>

    <center>![Rally Failed Result](/public/imgs/rally_failed_result1.png)</center>
    <center><i>Rally 测试失败时的 Overview 信息</i></center>
    </br>
    <center>![Rally Failed Result](/public/imgs/rally_failed_result2.png)</center>
    <center><i>Rally 测试失败时的 Failures 信息</i></center>

1. 此外，可以查看测试的状态和详细信息：

    ```
    # rally task status [TASK_UUID]
    * 这个命令会显示任务正在运行 (running)、完成 (finished) 或失败 (failed)。

    ```

    ```
    # rally task detailed [TASK_UUID]
    * 这个命令会显示任务的状态和执行结果。
    ```

### 用 Tempest 进行测试

  Rally 整合了 Tempest，因此，可以通过 Rally 使用 Tempest 对环境进行测试。

  使用 `rally verify [Commands]` 即可：

```
# rally verify start --help
usage: rally verify start [-h] [--deploy-id ACTION_KWARG_DEPLOYMENT]
                          [--deployment ACTION_KWARG_DEPLOYMENT]
                          [--set ACTION_KWARG_SET_NAME]
                          [--regex ACTION_KWARG_REGEX]
                          [--tempest-config ACTION_KWARG_TEMPEST_CONFIG]
                          [--no-use]
                          [action_args [action_args ...]]

Start set of tests.

optional arguments:
  -h, --help            show this help message and exit
  --deploy-id ACTION_KWARG_DEPLOYMENT
                        DEPRECATED! UUID of the deployment.
  --deployment ACTION_KWARG_DEPLOYMENT
                        UUID or name of a deployment.
  --set ACTION_KWARG_SET_NAME
                        Name of tempest test set. Available sets: full,
                        scenario, smoke, application_catalog, baremetal,
                        compute, data_processing, dns, identity, image,
                        network, object_storage, orchestration, telemetry,
                        volume
  --regex ACTION_KWARG_REGEX
                        Regular expression of test.
  --tempest-config ACTION_KWARG_TEMPEST_CONFIG
                        User specified Tempest config file location
  --no-use              Don't set new task as default for future operations
```

  由帮助命令，可知，我们可以使用的 tempest 测试设置有：*full, scenario, smoke, application_catalog, baremental, compute, date_processing, dns, identity, image, network, object_storage, orchestration, telemetry, volume*。

  这里就不列出 Tempest 的测试了。

Rally 的功能比想象中要强大一些，这只是使用的一小部分。
