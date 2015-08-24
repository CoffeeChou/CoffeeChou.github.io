---
layout: post
title: 以 Apache Mesos 计算的开源数据中心
category: 翻译学习
---

原文链接：[点我点我](http://opensource.com/business/14/9/open-source-datacenter-computing-apache-mesos)

# Apache Mesos

[Apache Mesos](http://mesos.apache.org) 是一个管理器，它通过分布式的应用或框架提供了一种高效的资源隔离和共享。Mesos 最初是由加州大学的伯克利分校开发的开源软件。它处于应用层和操作系统之间，使其易于部署，并使得在大规模集群环境中部署应用变得更高效。它可以在一个节点动态共享的池中运行很多应用。Mesos 的突出用户包括 [Twitter](http://opensource.com/business/14/8/interview-chris-aniszczyk-twitter-apache-mesos)、Airbnb、MediaCrossing、Xogito 以及 Categorize。

Mesos 利用了现代内核的特性 -- Linux 中的 "cgroups" 和 Solaris 中的 "zone" -- 来提供 CPU、内存、I/O、文件系统、机架位置等等的隔离。它最大的思想是形成异构资源的一个庞大集合。Mesos 介绍了一个称为资源提供的分布式的两层调度机制。Mesos 会决定给每个框架提供多少资源，而框架决定接受多少资源和在其上运行多少计算。这是一个轻量的资源共享层，通过给框架一个通用接口来访问集群资源，它使得细粒度的共享跨越了不同的集群计算框架。其想法是部署多种分布式系统到节点的一个共享池中，这样能够提高资源利用率。很多现代的工作负载和框架都可以运行在 Mesos 上，包括 Hadoop、Memecached、Ruby on Rails、Storm、JBoss Data Grid、MPI、Spark 和 Node.js，以及各种 web 服务器、数据库和应用服务器。

![Apache Mesos 中的节点抽象]()

类似于在 PC 操作系统管理桌面电脑上的资源访问，Mesos 保证应用程序能够在集群中访问它们所需要的资源。不同于为应用的不同部分配置各种服务器集群的方式，Mesos 允许你共享服务器的一个池，它可以运行你应用程序的不同部分，它们不会相互干扰并能够根据需求通过集群分配资源。这就意味着，它能够很容易地切换资源，如果发生了严重地堵塞，它可以离开 framework1（例如，进行一个大数据分析）然后将它们分配到 framework2（例如，web 服务器） 中。这也减少了部署应用中的很多人为步骤，并能够自动转移工作负载，以提供容错和保持高的利用率。

![图]()

Mesos 本质上是一个数据中心内核 -- 这意味着它是一个实际上将运行的工作负载彼此分离的软件。当这些任务实际运行时，它也需要额外的工具来使 engineer 获得它们在系统中运行的工作流并进行管理。否则，一些工作负载可能会消费所有的资源，或者重要的工作负载可能会与需要更多资源但不那么重要的工作负载发生冲突。因此 Mesos 需要的不仅仅是一个内核 -- **Chronos scheduler**，一个 cron 的替代品，用于自动启动或关闭（并处理故障）运行在 Mesos 之上的服务。Mesos 的另一个部分是 Marathon，它提供 API 来启动、关闭和扩展服务（而 Chronos 可能是其中的一个服务）。

![图]()

## 架构

Mesos 由管理运行在各个集群节点上的 slave 守护进程的 **master 进程**以及在这些 slave 上运行任务的 **framework** 组成。master 通过 framework 使用资源提供实现了细粒度的共享。每个资源提供是一个各个 slave 上空闲资源的列表。master 通过编制的策略，如公平共享或设置优先级，来决定为每个 framework 提供多少资源。为了支持一组不同内部框架分配策略，Mesos 允许组织者通过可插拔的配置模块定义他们自己的策略。

![图]()

每个运行在 Mesos 上的框架由两个组件组成：一个由 master 注册的用于提供资源的 scheduler(调度器)，以及在 slave 节点上启动来运行框架任务的 executor process(执行进程)。当 master 决定了提供多少资源给框架，framework 的 scheduler 就选择所请求的资源以使用。当 framework 接受了请求的资源，它会向 Mesos 传递一个它要启动的任务的描述信息。

![图]()


