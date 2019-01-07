---
layout: post
title: Docker 的翻译和学习
categories: [翻译]
comments: true
---

最近折腾 OpenStack，比如 Fuel，比如 Rally，会看到一些跟 Docker 相关的东西，突然就来了兴趣。

还是一样的习惯，从翻译开始，从了解架构开始。

<!--more-->

## 了解 Docker

### 什么是 Docker？

Docker 是一个用于开发、传输和运行应用程序的开放平台。Docker 的设计能使你的应用更快速地交付。使用 Docker，你可以将你的应用程序从基础设施中分离出来，**而且**，可以将你的基础设施当作一个管理应用程序。Docker 可以帮助你更快地传输代码、更快地测试、更快地部署，缩短编写代码和运行代码的周期。

Docker 通过结合一个轻量级的虚拟化平台的工作流和能够帮助你管理和部署应用程序的工具来实现上述功能。

在其内核中，Docker 提供了一个能够在容器中安全并隔离地运行几乎所有应用的方法。安全和隔离这两个特性使你能够在你的主机上同时运行很多个container。container 的轻量级本质，即不会有虚拟化宿主机的额外负荷，意味着你可以更有效地利用你的硬件设备。

container 的虚拟化能够让你在以下几个方面获得帮助：

* 将你的应用（和组件）放到 Docker container 中
* 将这些 container 分配和传输给你的团队，以进行深入开发和测试
* 部署这些应用程序到你的生产环境中，本地数据中心或云均可

### 我能用 Docker 干什么？

***快速交付你的应用***

在开发的周期中，有了 Docker 的帮助将是极好的。Docker 可以让你的研发人员在包含了你的应用和服务的本地 container 中进行开发，这样可以形成一个持续集成和开发工作流。

例如，开发人员编写了一些本地代码，并通过 Docker 将他们的开发栈堆共享给同事。完成时，他们将自己正在开发的代码和栈堆推送到测试环境中并执行必要的测试。然后，你可以从测试环境中将 Docker 镜像推送到生产环境并部署你的代码。

***更易部署和衡量***

Docker 的基于 container 的平台是可以高度移植的。Docker container 可以运行在开发者的本地主机上，物理机、数据中心里的虚拟机或云中均可。

Docker 的可移植性和轻量级的天性也使动态管理的工作变得简单。你可以使用 Docker 来快速增加或推掉你的应用和服务。Docker 的速度意味着增加（应用和服务）接近于实时。

***实现更高的密度并运行更多的工作负载***

Docker 是轻量级且快速的。它向基于宿主机的虚拟机提供一个可行的、合算的选择。这在高密度的环境中是特别有用的：如，构建你自己的云或平台即服务 (Platform-as-a-Service)。如果你想更充分的利用你的硬件资源，这在中小型的部署中也是非常有用的。

### Docker 有哪些主要组件？

Docker 有两个主要组件：

* Docker: 开源的容器虚拟化平台。
* [Docker Hub](https://hub.docker.com/): 我们的软件即服务 (Software-as-a-Service) 平台，用以共享和管理 Docker container。

> **注意**：Docker 是在 Apache 2.0 的许可下采用的开源。

### Docker 的架构？

Docker 使用的是 client-server 的架构。Docker *client* 和 Docker *daemon* 进行会话，进行繁重的构建、运行和分发 Docker container 的工作。Docker client 和 Docker daemon 都*可以*运行在同一个系统中，或者你可以将一个 Docker client 连接到远程的 Docker daemon 中。Docker client 和 Docker daemon 通过 socket 或 RESTful API 进行会话。

![Docker 的架构](/img/architecture.svg)

#### Docker daemon

如上图所示，Docker daemon 运行在主机上。用户不会直接与 Docker daemon 而是通过 Docker client 进行交互。

#### Docker client

Docker client 是 `docker` 的二进制形式，是主要的用户接口。它从用户接收命令，并与 Docker daemon 来回沟通。

#### Docker 内部

要了解 Docker 的内部，你需要了解以下三个组件：

* Docker images
* Docker registries
* Docker containers

##### Docker images

Docker images 是一个只读的模板。例如，可以是一个包含了 Ubuntu 操作系统并安装了 Apache 和 web 应用程序的镜像。镜像用于创建 Docker container。Docker 提供了一个简单的方法来创建镜像或更新已有镜像，或者你也可以下载其他人创建好的Docker images。Docker images 是 Docker 的**构建**组件。

##### Docker registries 

Docker registries 持有镜像。它们是你所上传或下载的镜像的公开或私有存储。公开的 Docker registry 称为 [Docker Hub](http://hub.docker.com/)。它能提供庞大的已有镜像的集合供你使用，可以是你所创建的镜像或之前其他人创建的你能够使用的镜像。Docker registries 是 Docker 的**分配**组件。

##### Docker containers

Docker containers 类似于一个目录。Docker containers 持有运行应用程序所需要的一切。每一个 container 都是从 Docker image 中创建的。Docker containers 可以运行、开始、停止、移动和删除。每个 container 都是一个隔离且安全的应用平台。Docker containers 是 Docker 的**运行**组件。

### 那么，Docker 是如何工作的呢？

目前，我们已经知道：

1. 你可以构建持有你的应用的 Docker images。
1. 你可以从 Docker images 中创建 Docker containers 以运行你的应用。
1. 你可以通过 [Docker Hub](http://hub.docker.com/) 或你自己的 registry 来共享这些镜像。

让我们来看看这些组件是如何结合在一起使得 Docker 运作的。

#### Docker image 是如何工作的？

我们已经知道 Docker images 是只读的模板，是提供给 containers 启动的。每个镜像都由一系列 layer (层)组成。Docker 利用[联合文件系统 (union file systems)](http://en.wikipedia.org/wiki/UnionFS)来将这些 layer 结合到一个镜像中。联合文件系统允许不同文件系统的文件和目录（称为分支）透明地叠加，形成一个连贯的文件系统。

Docker 如此轻量的原因之一就是这些 layer。当你修改一个 Docker image -- 例如，将一个应用更新至新版本 -- 就会构建一个新的 layer。因此，并不是替换整个镜像或完全重新构建，正如你处理一台虚拟机一样，只有那个 layer 会被添加或更新。现在你不需要分配一个全新的镜像，只需要更新，这样使得分配 Docker images 变得更快速和简单。

每一个镜像都是从一个基本镜像启动的，例如 `ubuntu`，是一个基本的 Ubuntu 镜像，或者 `fedora`，是一个基本的 Fedora 镜像。你也可以使用自己的镜像作为一个新的基本镜像，例如，如果你有一个基本的 Apache 镜像，你可以将它作为所有 web 应用的基本镜像。

> **注意**：Docker 是从 [Docker Hub](https://hub.docker.com/account/signup/) 中获取这些镜像的。

接着，会通过一个简单的、我们称之为*指令*的描述集合步骤来从基本镜像中构建 Docker images。每个指令会在你的镜像中创建一个新的 layer。指令所包括的操作如下：

* 执行一个命令。
* 新增一个文件或目录。
* 创建一个环境变量。
* 从一个镜像启动 container 时所需要运行的进程。

这些指令被保存在一个称为 `dockerfile` 的文件中。当你请求构建一个镜像时，Docker 读取这个 `dockerfile`，执行这些指令，并返回最终镜像。

#### Docker registry 是如何工作的？

Docker registry 是用来保存你的 Docker images 的。一旦构建了一个 Docker image，你可以将它 *push* 到一个公共仓库 [Docker Hub](https://hub.docker.com/account/signup/) 或运行在防火墙之后的你自己的仓库。

使用 Docker 客户端，你可以搜索已经公开的镜像，然后将它们获取到你的 Docker 主机上，以创建 container。

[Docker Hub](https://hub.docker.com/account/signup/) 同时提供公共和私有的镜像存储。公共存储是可搜索的，并且可以被任何人下载。私有存储是排除在搜索结果之外的，且只有你和你的用户可以从私有存储中获取镜像以创建 container。你可以[在这里注册一个存储计划](https://registry.hub.docker.com/plans/)。

#### Docker container 是如何工作的？

Docker container 是由一个操作系统、user-added 文件和 meta-data 构成的。正如我们所见，每个 container 都是从镜像创建的。这个镜像会告诉 Docker 当该 container 启动时，它持有什么、要运行什么进程以及其他各种各样的配置信息。Docker image 是只读的。当 Docker 从一个镜像中运行一个 container，它会在镜像顶层添加一个读写 layer (使用之前所讲述的联合文件系统)，这样你的应用就可以在这个读写 layer 上运行。

### 运行一个 container 时，会发生什么样的过程？

无论时使用 `docker` 二进制还是通过 API，Docker 客户端都可以告诉 Docker daemon 运行一个 container。

```
$ sudo docker run -i -t ubuntu /bin/bash
```

让我们分析一下这个命令。Docker 客户端通过使用包含 `run` 选项的 `docker` 二进制来告诉它要启动一个 container。Docker 客户端需要告诉 Docker daemon 运行 container 的最小裸机是：

* container 需要从什么 Docker images 启动，这里用的是 `ubuntu`，一个基本的 Ubuntu 镜像；
* 启动 container 是，你想在 container 中执行的命令，这里用的是 `/bin/bash`，在这个新的 container 中执行 Bash Shell。

那么，当我们执行这个命令时，在里面会发生什么呢？

按顺序来说，Docker 做了以下事情：

* **获取 `ubuntu` 镜像**：Docker 检查 `ubuntu` 镜像是否存在，如果不在本地主机上，Docker 会从 [Docker Hub](https://hub.docker.com/account/signup/) 将它下载下来。如果镜像已经存在，Docker 就直接使用它。
* **创建新的 container**：一旦 Docker 有了镜像，就会使用这个镜像来创建 container。
* **分配一个文件系统并挂载一个读写的** ***layer***：container 会在文件系统中创建，然后读写的 layer 会被添加到镜像中。
* **分配一个网络/桥接接口**：创建一个网络接口，以允许 Docker container 与本地主机会话。
* **设置一个 IP 地址**：从池中获取并附加一个可用的 IP 地址。
* **执行你所指定的进程**：运行你的应用；
* **获取应用并输出**：连接并记录标准输入、输出和错误，以显示你的应用如何工作。

现在你已经运行了一个 container！从现在开始你可以管理你的 container，和你的应用进行交互，当结束时，可以停止并删除你的 container。

### 底层技术

Docker 是用 Go 语言写的，并利用了一些 Linux 内核的特性来传输一些我们所看到的功能。

#### Namespace (命名空间)

Docker 充分利用了一项称为 `namespace` 的技术，以提供隔离的工作环境（我们称之为 *container*）。当你运行一个 container，Docker 会为这个 container 创建一系列的 *namespace*。

这提供了 layer 的隔离：container 的每个部分都运行在自己的 namespace 中且不会访问到 namespace 之外。

Docker 所使用的一些 namespace 有：

* **The `pid` namespace**: 用于进程的隔离 (PID: Process ID).
* **The `net` namespace**: 用于管理网络接口 (NET: Networking).
* **The `ipc` namespace**: 用于管理 IPC 资源的访问 (IPC: InterProcess Communication).
* **The `mnt` namespace**: 用于管理挂载点 (MNT: Mount).
* **The `uts` namespace**: 用于隔离内核和版本定义 (UTS: Unix Timesharing System).

#### Controll groups (控制组)

Docker 还利用了另一项称为 `cgroup` 或 controll groups` 的技术。在隔离环境中运行应用的一个关键是只让它们拥有所需的资源。这保证了 container 在主机上做一个“好的多租户公民”（哈哈，直译了）。Controll group 允许 Docker 向 container 共享可用的硬件资源，并且如果需要的话，设置好限制和约束。例如，给某个 container 设置可用内存的限制。

#### Union file systems (联合文件系统)

Union file systems 或 UnionFS，就是通过创建 layer 使其变得轻量级和快速的文件系统。Docker 使用 Union file systems 以向 container 提供构建的 blocks。Docker 所能使用的 union file system 变体包括：AUFS、btrfs、vfs 和 DeviceMapper。

#### Container format (容器框架)

Docker 将这些组件结合到一个我们称之为 container format 的封装中。默认的 container format 称为 `libcontainer`。Docker 也支持传统的使用 [LXC](https://linuxcontainers.org/) 的 Linux container。未来，Docker 还有可能支持其他 container format，例如，与 BSD Jails 或 Solaris Zones 整合。

### 下一步

#### 安装 Docker

可以阅读[安装部分](https://docs.docker.com/installation/#installation)文档。

### Docker 的用户手册

[深入学习 Docker](https://docs.docker.com/userguide/)。

> #### 译者注：
> * 原文连接请萌萌哒戳[这里](https://docs.docker.com/introduction/understanding-docker/)。
> * 翻译水平有限，目的是理解≖‿≖✧
> * 喔，对了，这里有个[好玩的链接](https://www.docker.com/tryit/)，可以在线尝试下 Docker 的魅力～
