---
layout: post
title: 使用 Docker 运行 Rally
categories: [翻译]
comments: true
---

本文整理摘要了一些 Rally 相关的东西，来自于 [OpenStack wiki](https://wiki.openstack.org/wiki/Rally)。今天又刚好看到 [Rally & Docker](https://registry.hub.docker.com/u/rallyforge/rally/) 这篇文章，所以放到一起。

本文将对 Rally 作一些介绍以及 Rally & Docker 的整合使用。后续还会写一些 Rally 的安装和使用的文章。

<!--more-->

### 介绍

OpenStack，毫无疑问是各种服务联合的一个庞大的生态系统。

Rally 作为一个标准测试工具，回答了 "OpenStack 如何大规模运作？" 的问题。

为了使其成为可能，Rally 自动化并统一了多个节点的 OpenStack 部署、云的验证、标准测试和分析。Rally 使用一个通用的方法，使得我们能够检查 OpenStack 是否正常运作，也即，在高负荷下 1K 服务器的安装是否成功。因此，它可以作为 OpenStack CI/CD 系统的基本工具来使用，可以持续改进其 SLA、运作和稳定性。

Rally 的操作如下图所示：

![Rally 的操作](/img/rally_actions.png)

* ***Deploy engine*** 还不算是另一个 OpenStack 的部署工具，而仅仅是一个可插入的机制，它通过各种各样的部署工具，如：DevStack、Fuel、Anvil on hardware/VMs 等，可以使我们统一和简化工作。
* ***Verification*** - (正运作着) 使用 Tempest 来验证一个部署好的 OpenStack 云的功能。在未来，Rally 将支持其他 OS 的验证。
* ***Benchmark engine*** - 允许基于一个标准测试的大仓库在云上创建一个参数化的负载。

#### Rally 架构

通常 OpenStack 的项目是作为服务的，所以，Rally 也提供这种方法和一种不需要守护进程的 CLI 驱动的方法：

1. Rally as-a-Service: 将 Rally 作为守护进程运行，可以展示 Web UI (正运作着)，因此 1 RaaS 可以用于整个团队。
1. Rally as-an-APP: Rally 仅仅作为一个轻量级的 CLI App (没有任何守护进程)，可以使部署更简单且更轻便。

这是如何做到的？请看下图：


![Rally 架构](/img/rally_arch.png)


#### Rally 组件

Rally 由 4 个主要组件构成：

* ***Server Providers*** - 提供服务器 (虚拟服务器)，用 ssh 访问，在一个 L3 网络中。
* ***Deploy Engines*** - 在由 ***Server Providers*** 提供的服务器上部署 OpenStack 云。
* ***Verification*** - 针对一个部署好的云环境运行 tempest (或其他特定测试) 的组件，收集结果并以人们能够解读的方式展现出来。
* ***Benchmark engine*** - 可以写一些参数化的标准测试场景并在云环境上运行。

那么，**为什么** Rally 会需要这些组件呢？

如果我们想象一下：我会如何对大规模的云进行标准测试呢？这个问题将非常清晰：

![How to Benchmark](/img/how_to_benchmark.png)


### Rally & Docker 怎么使用

#### 安装 Docker (如果你环境中没有的话)

~~~
# yum update
# yum install docker
# usermod -a -G docker `id -u -n` # 把自己添加到 docker 的组里
# exit   # 重新登录是很重要的！
~~~

#### 为 Rally 准备一个环境

Rally 需要一个额外的目录来保存结果。否则，在退出之后所有的结果会被清除。

~~~
# 注意：docker container 用户对这些目录要有访问权
mkdir ~/rally_home ~/rally_db
~~~

#### Pull Rally 镜像并运行 container

1. 启动 docker 服务，随手设置为随系统启动了：

    ~~~
    # systemctl start docker
    # systemctl enable docker
    ~~~

1. pull docker 镜像：

    ~~~
    docker pull rallyforge/rally
    ~~~

    ~~~
    docker run -t -i -v ~/rally_home:/home/rally -v ~/rally_db:/var/lib/rally/database rallyforge/rally
    # 这个命令会在含有 rally 的 container 里打开 bash
    ~~~

#### 设置 alias 以简化命令行

~~~
echo 'alias dock_rally="docker run -t -i -v ~/rally_home:/home/rally -v ~/rally_db:/var/lib/rally/database rallyforge/rally"' >> ~/etc/bashrc
# 在 CentOS 7 中，"~/.bashrc" 中写了个 if 语句，配置写在 "～/etc/bashrc" 中
# 现在可以直接执行 "dock_rally" 来代替上面的命令了
~~~

#### 运行第一个 Rally

~~~
# 运行 bash 来启动并登录到 Rally container 中
dock_rally

# 运行 Rally 之前，需要创建其数据库
# 只在第一次运行时执行以下命令！否则会清除你所有的结果
rally-manage db recreate   

# 列出所有的部署环境
rally deployment list

# 提示没有可用环境，可以用下列命令创建：
rally deployment create

# 更多步骤可以看： [step by step guide]
~~~

Rally 的更多使用方法，请参考：[Rally 官方文档](https://rally.readthedocs.org/en/latest/tutorial/step_1_setting_up_env_and_running_benchmark_from_samples.html)。

#### 译者注
* 进入 container 后，执行 `rally deployment list` 会报错：
  ~~~
  TRACE rally OperationalError: (OperationalError) unable to open database file None None
  ~~~
* 发现 rally 的数据库 `/var/lib/rally/database` 没有访问权限：
  ~~~
rally@47ee9f93dcb4:~$ ls -l /var/lib/rally/database/
ls: cannot open directory .: Permission denied
  ~~~
* 尝试更改访问权限，结果失败～用 root 进入 container，也没有权限... 
  * 最后的解决办法是**关闭 SELinux**: `setenforce 0`

### 参考文档

[Rally 文档](https://rally.readthedocs.org/en/latest/)包含了很多有用的信息，可以帮助你更高效地使用 Rally。所以，安装完成后请阅读 [step by step guide](https://rally.readthedocs.org/en/latest/tutorial/step_1_setting_up_env_and_running_benchmark_from_samples.html)。
