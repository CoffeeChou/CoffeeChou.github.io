---
layout: post
title: 可以构建在 Mesos 之上的软件工程
category: 翻译之路
---

上一篇 blog 翻译了 Mesos 的一些介绍，Mesos 的主要架构是：Master、Slave、Framework。

所以这里翻译一篇文章，记录一些可以运行在 Mesos 之上的 Framework。

原文连接：[http://mesos.apache.org/documentation/latest/mesos-frameworks/](http://mesos.apache.org/documentation/latest/mesos-frameworks/)

## 长期运行的服务

* [Aurora](http://aurora.apache.org/) -- 是一个服务调度器，运行在 Mesos 之上，允许你运行一些长期运行的服务，以利用 Mesos 的可扩展性、容错性和资源的隔离。
* [Marathon](https://github.com/mesosphere/marathon) -- 是一个构建在 Mesos 之上的私有 PaaS。它可以自动地处理硬件或软件故障，并保证一个应用“总是可用“的。
* [Singularity](https://github.com/HubSpot/Singularity) -- 是一个用于运行 Mesos 任务的调度器（HTTP API 和 web 接口）：长期运行的进程、一次性任务以及调度作业。
* [SSSP](https://github.com/mesosphere/sssp) -- 是一个简单的 web 应用，它为在 S3 中存储和共享文件提供了一个白色标签 "Megaupload"。

## 大数据处理

* [Cray Chapel](https://github.com/nqn/mesos-chapel) -- 是一种高效的并行编程语言。Chapel Mesos 调度器让你可以在 Mesos 上运行 Chapel 程序。
* [Dpark](https://github.com/douban/dpark) -- 是一个 Spark 的 Python 克隆，是一个以 Python 编写的类 MapReduce 框架，它运行在 Mesos 上。
* [Exelixi](https://github.com/mesosphere/exelixi) -- 是一个分布式框架，用于大规模运行遗传算法。
* [Hadoop](https://github.com/mesos/hadoop) -- 在 Mesos 上运行 Hadoop 通过整个集群高效地分配 MapReduce 作业。
* [Hama](http://wiki.apache.org/hama/GettingStartedMesos) -- 是一个基于 Bulk Synchronous Parallel 计算技术的分布式计算框架，用于进行大规模的科学计算，如矩阵、图表、和网络算法等。
* [MPI](https://github.com/mesosphere/mesos-hydra) -- 是一个消息传递系统，设计于在各种各样并行计算机上的功能。
* [Spark](http://spark.apache.org/) -- 是一个快速且通用的集群计算系统，它可以使并行作业更易于写。
* [Storm](https://github.com/mesosphere/storm-mesos) -- 是一个分布式的实时计算系统。Storm 使可靠地处理数据的无界流变得简单，实时处理 Hadoop 所进行批处理的内容。

## 批量调度

* [Chronos](https://github.com/mesos/chronos) -- 是一个分布式作业调度器，支持复杂作业拓扑。它可以以容错性更强的特性代替 Cron。
* [Jenkins](https://github.com/jenkinsci/mesos-plugin) -- 是一个持续集成服务器。mesos-jenkins 插件可以根据工作负载在 Mesos 集群上动态地启动 worker。
* [JobServer](http://www.grandlogic.com/content/html_docs/products.shtml#jobserverprod) -- 是一个分布式任务调度器和处理器，允许开发者们通过在 web 界面上点击来构建自定义批处理任务对列。

## 数据存储

* [Cassandra](https://github.com/mesosphere/cassandra-mesos) -- 是一个高性能且高可用的分布式数据库。线性可扩展性以及在商业硬件或云基础设施中已经证明的容错性使其成为关键任务数据的最佳平台。
* [ElasticSearch](https://github.com/mesosphere/elasticsearch-mesos) -- 是一个分布式搜索引擎。Mesos 使其易于运行和扩展。
* [Hypertable](https://code.google.com/p/hypertable/wiki/Mesos) -- 是一个高性能、可扩展、分布式的存储和处理系统，用于结构化和非结构化数据。
