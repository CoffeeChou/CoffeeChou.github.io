---
layout: post
title: 什么是 OpenStack ?
category: 翻译学习
---

刚开始接触 OpenStack，只能从文档开始。于是打算先翻译点东西。

# 什么是 OpenStack？

[OpenStack](http://www.openstack.org/) 是一套构建和管理公有以及私有云计算平台的软件工具。由于得到一些大公司的软件开发和托管的支持，再加上数千位社区成员的支持，很多人认为 OpenStack 是云计算的未来。OpenStack 项目是由 [OpenStack Foundation](http://www.openstack.org/foundation/) 管理的，OpenStack Foundation 是一个监管项目开发和社区建设的一个非营利性组织。

## OpenStack 的介绍

OpenStack 允许用户部署虚拟机和其他在其上管理云环境的处理不同任务的实例。它使得横向衡量更加简单，这意味着对当前运行有好处的任务能够更容易地通过附加实例以或多或少地为其上的用户服务。例如，一个需要与远程服务器通信的移动应用，可以通过不同的实例分开运作与每个用户进行通信，所有的都能与彼此进行通信，但扩展迅速而简单，这样就能获得更多的用户。

而更重要的是，OpenStack 是一个[开源](https://opensource.com/resources/what-open-source)软件，这意味着任何选择了 OpenStack 的人都可以查看源代码，可以做任何他们所需要的修改，并自由地最大程度地将这些修改反馈给社区。这也意味着来自世界各地的开发者们将尽自己的努力共同把 OpenStack 开发成为最强大的、最健壮的以及最安全的产品。

## 如何在一个云环境中使用 OpenStack？

云是在远程环境中为最终用户提供计算服务的，其实际软件作为一个服务运行在一个可靠的、可扩展的服务器上，而不是在每个最终用户的计算机上。云计算可以与很多不同的事情相关，但在通常情况下，在行业中谈论运行不同的事物“作为服务” —— 软件，平台和基础架构。OpenStack 属于最后一类，被认为是基础架构即服务(IaaS)。提供基础架构意味着 OpenStack 便于用户快速添加新的实例，使其能够在其他云计算组件上运行。通常情况下，在基础设施上运行一个“平台”，开发者们可以在其上创建软件应用，并交付给最终用户。

## OpenStack 的组件

OpenStack 是由许多不同的活动的部分组成的。由于其开放性，任何人都可以添加额外的组件到 OpenStack 中，以帮助他们达到他们的需求。但是，OpenStack 的社区已经非常合作地确定了 9 个 OpenStack 的“核心”组件，它们是分布式的任何 OpenStack 系统的一部分，并且由 OpenStack 社区正式维护。

* **Nova**: Nova 是在 OpenStack 后台的一个主要计算引擎。它是一个“构造控制器”，用来部署和管理大量的虚拟机和其他实例，以处理计算任务。

* **Swift**: Swift 是一个块存储系统或文件存储系统。与其使用传统的磁盘驱动上的相关文件的方式，开发者们不如转而使用具有唯一标识的相关文件或一条信息，并让 OpenStack 决定这些信息的存储位置。这使得检测变得简单，因为开发者们不需要担心软件后面的单个系统的能力问题了。它也使系统（而不是开发者们）去关注如何最好地保证数据的备份，以防机器和网络链接的故障。

* **Cinder**: Cinder 是一个块存储组件，它更类似于传统的计算机能够访问指定的磁盘驱动的概念。这种更加传统的访问文件的方式在优先考虑数据访问速度的场景下是非常重要的。

* **Neutron**: Neutron 为 OpenStack 提供网络功能。它帮助确保 OpenStack 部署中的每一个组件能够快速高效地与其他组件相互通信。

* **Horizon**: Horizon 是 OpenStack 的一个仪表盘。它是 OpenStack 唯一的图形化接口，因此对于想要尝试 OpenStack 的用户来说，这是他们实际上所“看到”的第一个组件。开发者们可以通过应用程序接口(API)访问单独地访问 OpenStack 的所有组件，但是提供给系统管理员一个云的运行状况的视图，并且能够根据需要对其进行管理。

* **Keystone**: Keystone 为 OpenStack 提供验证服务。其本是上是一个核心的 OpenStack 云的用户列表，映射所有他们有权使用的云所提供的服务。它提供了多种访问方式，意味着开发者们可以通过 Keystone 简单地映射他们现有地用户访问方式。

* **Glance**: Glance 向 OpenStack 提供镜像服务。在这里，“镜像”指的是硬盘的镜像（或虚拟机副本）。当部署新的虚拟机实例时，Glance 允许这些镜像作为模板来使用。

* **Ceilometer**: Ceilometer 提供遥测服务，允许云对其单个用户提供计费服务。它也保存了每个用户对 OpenStack 云的每个不同组件的系统使用量的验证数。

* **Heat**: Heat 是 OpenStack 的业务流程组件，它允许开发者们将云应用的需求保存到一个文件中，在其中定义这个云应用所需要的资源。通过这种方式，有助于帮助管理云服务运行所需的基础设施。

## OpenStack 为谁使用？

您现在很可能是一位 OpenStack 的用户而自己却不知道！由于越来越多的公司采用 OpenStack 作为他们云工具包的一部分，运行在 OpenStack 后台上的应用领域是不断扩大的。

## 我应该如何着手使用 OpenStack？

如果您仅仅是想要尝试一下 OpenStack，其中您值得一试的不需要保证任何物理资源的资源就是 [TryStack](http://trystack.org/)。TryStack 可以让您在一个 sandbox 中测试您的应用，以更好地了解 OpenStack 是如何运作的以及这是否是您所需要的解决方案。

已经准备好尝试更多的内容了吗？每个月，我们都会公布一些收集到的 OpenStack 相关的最好的新的 [guides、tips、tricks、tutorials](http://opensource.com/resources/openstack-tutorials)。

OpenStack 一直在寻找心的贡献者。可以考虑[加入](https://www.openstack.org/join) OpenStack Foundation 或阅读[如何贡献于 OpenStack](http://opensource.com/business/14/2/how-contribute-openstack)。

## 如何跟进 OpenStack 的进展？

由于 OpenStack 并不属于单个公司，要获取 OpenStack 相关的信息可能会有点令人困惑。opensource.com 能够帮助您以某种格式获得 OpenStack 的相关信息，提供最终用户、开发者和决策者在他们的组织下使用 OpenStack 部署过程中的常见问题的答案。要获得这些内容，请看 opensource.com 中的 [OpenStack tags](https://opensource.com/tags/openstack)，或者阅读以下文章，帮助您学习更多 OpenStack 及其社区相关的内容：

* [The Women of OpenStack talk outreach, education, and mentoring.](http://opensource.com/business/14/2/women-of-openstack-conference-group)
* [Copyright statements proliferate inside open source code.](http://opensource.com/law/14/2/copyright-statements-source-files)
* [How OpenStack differs from Amazon and must rise to the occasion.](http://opensource.com/business/13/12/openstack-amazon-open-cloud)
* [Open source private cloud storage with OpenStack Swift.](http://opensource.com/business/13/7/openstack-swift)
* [How to analyze corporate contributions to open source projects.](http://opensource.com/business/14/1/corporate-contributions-to-openstack)


* 译者注：本文基本基于原文翻译，原文请点击[此处](http://opensource.com/resources/what-is-openstack)。

