---
layout: post
title: Rally 的概念
category: 翻译学习
keywords: OpenStack, Rally
---

为了深入了解 Rally，又翻译一篇文章：[Rally 的概念](https://wiki.openstack.org/wiki/Rally/Concepts)。

# 主要概念

这篇文章将详细说明一些在整个 Rally 中使用的设计概念 (例如 **benchmark scenarios**、**contexts** 等)。对这些概念有一个很好的理解对于成功贡献于 Rally 来说是必要的。

## Benchmark scenarios

### 概念

**Benchmark scenarios** (标准测试场景) 的概念在 Rally 里是一个核心。标准测试场景就是 Rally 实际用来**测试 OpenStack 部署环境的性能**的。它们也在**标准测试任务配置文件**中发挥着主要的构建块的作用。每一个标准测试场景会执行一套**小的原子操作**，因此测试一些**简单的用例**，一般是一些特定的 OpenStack 项目。例如，***"NovaServers"*** 场景组包含了在 ***nova*** 中采用的几种可用的基本操作场景。例如，该组中的 ***"boot_and_delete_server"*** 标准测试场景能够测试只有**两个简单操作**的一系列性能：它首先 (以可定值的参数) **启动**一台服务器然后再**删除**它。

### 使用者的角度

从使用者的角度看，执行一些标准测试任务时，Rally 启动了不同的标准测试场景。**Benchmark task** 本质上是针对一些 OpenStack 部署环境执行的一套标准测试场景，通过 CLI 命令行特定 (以及可定值) 的方式执行的：

***rally task start --task=<task_config.json>***

因此，使用者可能需要指定**标准测试任务配置文件**中的标准场景测试的名称和参数以运行测试。一个典型的配置文件应该包含以下内容：

```json
{
    "NovaServers.boot_server": [
        {
            "args": {
                "flavor_id": 42,
                "image_id": "73257560-c59b-4275-a1ec-ab140e5b9979"
            },
            "runner": {"times": 3},
            "context": {...}
        },
        {
            "args": {
                "flavor_id": 1,
                "image_id": "3ba2b5f6-8d8d-4bbe-9ce5-4be01d912679"
            },
            "runner": {"times": 3},
            "context": {...}
        }
    ],
    "CinderVolumes.create_volume": [
        {
            "args": {
                "size": 42
            },
            "runner": {"times": 3},
            "context": {...}
        }
    ]
}
```

在这个示例中，任务配置文件中指定了两个要运行的标准测试，名为 **"NovaServers.boot_server"** 和 **"CinderVolumes.create_volume"** (标准测试的名称 = *ScenarioClassName.method_name*)。每一个标准测试场景可能会以不同的参数执行多次。在我们的示例中，用例 **"NovaServers.boot_server"** 就是用来测试从不同的 images 和 flavors 启动服务器的。

注意在其中的每一个场景的配置中，标准测试场景实际上启动了 **3 次** (在 **"runner"** 字段中指定)。可以在 **"runner"** 中指定更多细节，以定义标准测试场景究竟应该如何启动；我们将在下面的 **"Sceario Runners"** 部分进行详细说明。

### 开发者的角度

从开发者的角度看，标准测试场景是一个被 **@scenario** 修饰器标记的方法，并放在一个继承于基本 [**Scenario**](https://github.com/stackforge/rally/blob/master/rally/benchmark/scenarios/base.py#L40) 类和一些位于 [*rally.benchmark.scenarios*](https://github.com/stackforge/rally/tree/master/rally/benchmark/scenarios) 子包的类中。在一个 scenario 类中可能有任意多个标准测试场景；其中的每个类都应该 (在任务配置文件) 中被引用为 *ScenarioClassName.method_name*。

下面的一个小示例中，我们以一个标准测试场景 *MyScenario.scenario* 定义了一个场景的类 *MyScenario*。这个标准测试场景的测试会执行序列中的 2 个操作，在同一个类中通过私有方法实现。两个方法都以 **@atomic_action_timer** 修饰器进行标记。This allows Rally to handle those actions in a special way and, after benchmarks complete, show runtime statistics not only for the whole scenarios, but for separate actions as well.这使 Rally 可以以一个特定的方式处理这些操作，而且，标准测试完成后，不仅会显示整个场景的运行时间数据，也会显示其中各个方法的运行时间数据。

```python
from rally.benchmark.scenarios import base
from rally.benchmark.scenarios import utils


class MyScenario(base.Scenario):
    """My class that contains benchmark scenarios."""

    @base.scenario()
    def scenario(self, **kwargs):
        self._action_1()
        self._action_2()

    @utils.atomic_action_timer("action_1")
    def _action_1(self, **kwargs):
        """Do something with the cloud."""

    @utils.atomic_action_timer("action_2")
    def _action_2(self, **kwargs):
        """Do something with the cloud."""
```

## Scenario runners

### 概念

Rally 中的 **Scenario Runners** 是控制执行类型和标准测试场景顺序的实体对象。它支持**在云上创建负载的不同策略**，包括模拟不同用户的*并发请求*、周期性负载、日益增长的负载等等。

### 使用者角度

The user can specify which type of load on the cloud he would like to have through the "runner" section in the task configuration file:
使用者可以通过在**任务配置文件**中的 **"runner"** 部分指定他想对云进行测试的负载类型：

```json
{
    "NovaServers.boot_server": [
        {
            "args": {
                "flavor_id": 42,
                "image_id": "73257560-c59b-4275-a1ec-ab140e5b9979"
            },
            "runner": {
                "type": "constant",
                "times": 15,
                "concurrency": 2
            },
            "context": {
                "users": {
                    "tenants": 1,
                    "users_per_tenant": 3
                },
                "quotas": {
                    "nova": {
                        "instances": 20
                    }
                }
            }
        }
    ]
}
```

这个场景的运行策略是通过其中的 **type** 和一些特定类型的参数执行的。可用的类型包括：

* ***constant***，通过以一个固定次数运行场景，创建一个恒定的负载，可能是并行的 (这由 "concurrency" 参数控制)。
* ***constant_for_duration***，本质上与 **constant** 是一样的，但在指定的秒数 (***"duration"*** 参数) 之后才开始运行标准测试场景。
* ***periodic***，在执行两个连续的标准测试场景之间有一定的时间间隔，由 ***"period"*** 字段定义，单位是秒。
* ***serial***，在测试新的场景时非常有用，因为它在一个进程中只运行固定次数的标准测试场景。

而且，所有的 scenario runners 可以提供 (也是通过配置文件的 **"runner" 部分**) 一个**可选参数** *"timeout"*，**这个参数定义每个标准测试场景的超时时间 (以秒为单位)**。

### 开发者角度

如果需要的话，是可以扩展 Rally 的 Scenario Runner 类型的。基本上，每个 scenario runner 应该实现为基本 [**ScenarioRunner**](https://github.com/stackforge/rally/blob/master/rally/benchmark/runners/base.py#L137) 类的子类，且放在 [rally.benchmark.runners 包](https://github.com/stackforge/rally/tree/master/rally/benchmark/runners)中。

```python
from rally.benchmark.runners import base
from rally import utils

class MyScenarioRunner(base.ScenarioRunner):
    """My scenario runner."""

    # This string is what the user will have to specify in the task
    # configuration file (in "runner": {"type": ...})

    __execution_type__ = "my_scenario_runner"


    # CONFIG_SCHEMA is used to automatically validate the input
    # config of the scenario runner, passed by the user in the task
    # configuration file.

    CONFIG_SCHEMA = {
        "type": "object",
        "$schema": utils.JSON_SCHEMA,
        "properties": {
            "type": {
                "type": "string"
            },
            "some_specific_property": {...}
        }
    }

    def _run_scenario(self, cls, method_name, ctx, args):
        """Run the scenario 'method_name' from scenario class 'cls'
        with arguments 'args', given a context 'ctx'.

        This method should return the results dictionary wrapped in
        a base.ScenarioRunnerResult object (not plain JSON) 
        """
        results = ...

        return base.ScenarioRunnerResult(results)
```

## Benchmark contexts

### 概念

在 Rally 中，**contexts** 的概念本质上是用来定义在标准测试场景中以不同**环境**类型来启动的。这些环境通常由一些参数来定义的，如将在 OpenStack 项目中显示的 **tenant 和 users** 的数量、授权给这些用户的 **roles**、扩展或缩小**配额**等。

### 使用者的角度

从使用者的角度看，Rally 中的 context 是可以通过**任务配置文件**来管理的。在一个典型的配置文件中，每个要运行的标准测试场景不仅仅由参数信息和要启动多少次来提供，也由一个特殊的 **"context"** 部分提供。在这个部分中，用户可以配置他所希望他的场景运行的 context 的数量。

在下面的示例中，**"user" context** 指定了 "NovaServers.boot_server" 场景应该在其中运行 **1 个 tenant** 包含 **3 个 user** 的情况。请铭记，默认的实例配额数目是每个 tenant 10 个实例，将其扩展到，比如 **20 个实例**，也是合理的，可以在 **"quotas" context** 中写入内容。否则，场景最终会失败，因为它会尝试在每一个 tenant 中启动一台服务器 15 次。

```json
{
    "NovaServers.boot_server": [
        {
            "args": {
                "flavor_id": 42,
                "image_id": "73257560-c59b-4275-a1ec-ab140e5b9979"
            },
            "runner": {
                "type": "constant",
                "times": 15,
                "concurrency": 2
            },
            "context": {
                "users": {
                    "tenants": 1,
                    "users_per_tenant": 3
                },
                "quotas": {
                    "nova": {
                        "instances": 20
                    }
                }
            }
        }
    ]
}
```

### 开发者角度

从开发者的角度看，contexts 的管理是通过 **Context 类** 实现的。每个可以在任务配置文件中指定的 context 类型与一个特定的基本 [**Context**](https://github.com/stackforge/rally/blob/master/rally/benchmark/context/base.py) 类的子类相对应，放在 [**rally.benchmark.context**](https://github.com/stackforge/rally/tree/master/rally/benchmark/context) 模块中。每个 context 类要以一个特殊的 **@context()** 修饰器进行修饰，并实现一个相当简单的 **interface**：

```python
from rally import utils

@base.context(name="your_context",    # Corresponds to the context field name in task configuration files
              order=xxx,              # a 3-digit number specifying the priority with which the context should be set up
              hidden=True)            # True if the context cannot be configured through the task configuration file
                                      # (usually False and False by default)
class YourContext(base.Context):
    """Yet another context class."""

    # The schema of the context configuration format
    CONFIG_SCHEMA = {
        "type": "object",
        "$schema": utils.JSON_SCHEMA,
        "additionalProperties": False,
        "properties": {
            "property_1": <SCHEMA>,
            "property_2": <SCHEMA>
        }
    }

    def __init__(self, context):
        super(YourContext, self).__init__(context)
        # Initialize the necessary stuff

    def setup(self):
        # Prepare the environment in the desired way

    def cleanup(self):
        # Cleanup the environment properly
```

因此，初始化 contexts 的算法大致如下：

```python
context1 = Context1(ctx)
context2 = Context2(ctx)
context3 = Context3(ctx)

context1.setup()
context2.setup()
context3.setup()

<Run benchmark scenarios in the prepared environment>

context3.cleanup()
context2.cleanup()
context1.cleanup()
```

所设置的 context 的顺序是由 value of their _ctx_order 属性决定的。包含 lower _ctx_order 属性的 context 有更高的优先权：1xx contexts 为用户相关所保留的 (例如，users/tenants 的创建，roles 的分配等)，30x 是用于配额的，等。

作为参考，这里有目前 context 的 _ctx_order 的值的列表：

* base context (0)
* users (100)
* quotas (300)
* keypair (310)
* allow_ssh (320)
* roles (330)
* images (410)
* volumes (420)
* servers (430)
* sahara_image (440)
* sahara_cluster (441)
* sahara_edp (442)
* tempest (666)
* admin_cleanup (MAXINT - 1)
* user_cleanup (MAXINT)

**隐藏 context** 不能由最终使用者像上述那样通过任务配置文件案进行配置，但是可以通过标准测试场景的开发者通过一个特殊的 *@base.scenario(context={...})* 修饰器指定。隐藏 context 通常用来满足一些特定的标准测试场景 - 指定需求，不需要最终使用者去管住的。例如，隐藏的 [**"cleanup" context**](https://github.com/stackforge/rally/blob/master/rally/benchmark/context/cleanup/context.py#L70-L90) 用于在标准测试之后进行一般的清理。因此，使用者不能通过任务配置更改它的配置，而破坏了他的云环境。

如果您想要更深入了解，请阅读 [context manager](https://github.com/stackforge/rally/blob/master/rally/benchmark/context/base.py#L78-L117) 类，它实现了前面所描述的算法。


