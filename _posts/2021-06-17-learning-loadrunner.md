---
layout: post
title: 学习 LoadRunner
categories: ["技术"]
comments: true
---

**写在前面**

这篇文章没有什么干货，大多数是概念性的东西。倒是在学习过程中发现了 [https://www.perfmatrix.com/](https://www.perfmatrix.com/) 这么个网站，还挺有用的，先记录着，很多内容也是从这里面翻译过来的。

怎么说呢，用了 LoadRunner 之后，大概知道为什么有那么多人用它了：容易上手啊！

一些细节的内容，比如怎么进行参数化配置啦，其他人都有很详细的记录了，我这里也不写了。不过在根据那些文章去设置参数的时候，发现实际配置和文章里说的还是有一些出入的。

<!--more-->

{% include split_lines.html %}

"LoadRunner" 的名气可谓是性能测试界里最大的了。LoadRunner 支持各种各样的协议，几乎覆盖了所有的软件平台类型。它有一段很长的历史，这里就不说了。

### LoadRunner 是如何工作的？

LoadRunner 是通过录制和回放用户的行为并对服务器生成想要的负载来实现测试的。它只是模拟了真实世界的用户行为，然后通过生成虚拟负载来验证软件或系统的性能。其中的主要步骤是：
1. **Recording/Scripting**: 将用户行为写入脚本中；
2. **Test Execution**: 使用虚拟负载回放脚本，在测试环境中模拟真实世界的情况；
3. **Result Analysis**: 根据应用程序对负载的处理能力和响应能力，生成准确的结果。

LoadRunner 以脚本（程序）的形式来模拟真实用户的行为，然生成虚拟的用户（线程/进程）来运行这些脚本。这里的虚拟用户即我们所知道的"Vuser"。在性能测试执行期间，LoadRunner 整理测试结果并将它们保存到一个文件中（即原始结果）。这些文件通过 MicroFocus 分析工具打开，并做深入的分析。最后，分析工具会成一份总结式的测试报告（pdf, HTML, Excel 等格式）。

### LoadRunner 的组件

Micro Focus LoadRunner 包含以下概念：

- **Virtual User Generator** 或 **VuGen**: 录制最终用户的业务过程，并以编程语言的形式创建一份自动化脚本，这份生成的脚本成为 "VuGen Script" 或 "Test Script"；
- **Load Generators**: 是用来为每个请求生成虚拟负载的。在测试执行期间，Controller 分发每一个场景里的 Vuser 给负载生成器。负载生成器也用来模拟用户的地理位置。
- **Controller**: 组织、驱动、管理、监控负载测试。Controller 也用户工作负载的建模。工作负载建模包含了每一个 NFR ([Non-Functional Requirement](https://www.perfmatrix.com/non-functional-requirement-gathering/))。
- **Agent**: 在 Controller 和负载生成器之间发送信息；
- **Analysis**: 帮助查看、剖析、比较负载测试的结果。分析工具展示结果的图标和统计数据来验证测试的结果并找出瓶颈（性能问题）。分析工具也可以根据结果生成报告。


例如：在负载测试期间，50 个虚拟用户每秒要生成 2 个请求的负载给服务器。

要进行性能测试，至少需要一个 Controller。在缺少 LG 时，一个 Controller 也能将负载生成到某个值（取决于 Controller 的硬件配置）。Controller 的另一个功能是在测试执行期间通过 Agent 去指挥负载生成器，包括：

- 要用哪个脚本？
- 在什么时候要生成多少负载？
- 什么时候停止测试？等等

### LoadRunner 的基本术语

LoadRunner 的初学者需要了解一些基本术语。基本术语可以帮助我们在进行性能测试过程中理解 LoadRunner 的核心内容。

- **SLA**: 即 Service Level Agreement，服务水平协议，是测试者和客户端之间认同的一个测试指标，也可以认为是性能需求。例如：某应用程序 X 要在一个小时内以 2TPS 处理 100 个用户的负载。
- **Performance Metrics**: 性能指标，是对客户端、服务端、网络的统计数据的衡量标准。例如：每秒处理的事务数 (TPS)，响应时间 (Response Time)，吞吐 (Throughout) 等。
- **Transaction**: 事务，事务是终端用户操作的集合，展示了真实用户对应用程序的行为。例如：登录 (Login)，点击链接 (Click\_on\_Link)，点击提交按钮 (Click\_Submit\_button)，退出登录 (Logout) 等。
- **Business Process**: 业务流程，展示一个用例或功能的一系列步骤，包含一个或多个事务。例如：产品订购、搜索产品等。
- **Scenario**: 场景，是基于性能需求的业务流程的集合。场景是一个窗口，可以定义与业务流程相关的用户数量、测试持续时间、虚拟机用户模型等。场景的创建也称为工作负载的建模 (Workload Modeling)。
- **Virtual Users or Vusers**: Vusers 模拟了真实世界的用户，它等同于在服务器上施加期望的负载。
- **Protocol**: 协议，即客户端和服务端之间的通信方式。协议的选择取决于应用程序所使用的语言或技术。例如：Web HTTP/HTML, Ajax TruClient 等。
- **Load Generator**: 负载生成器，用于生成虚拟用户的机制。
- **Controller**: 控制器，组织、驱动、管理和监控性能测试。Controller 在测试期间通过 Agent 与负载发生器 (Load Generator) 通信。
- **Iteration**: 迭代，在 Vuser 脚本里指定的事务流的重复次数。
- **Pacing**: 两次迭代之间的延迟时间。
- **Think Time**: 两个事务时间的延迟时间。
- **vuser_init()**: 脚本的初始化部分，如：用户定义的方法、用户定义的参数、登录等。在测试期间只运行一次。
- **Action()**: 包含业务流程的部分，每次迭代都会执行。是真实用户的操作部分，这些操作是可以以事务的形式一个一个分开的，它可以包含也可以不包含登录和登出的事务，这取决于脚本创建的逻辑。
- **vuser_end()**: 脚本退出的阶段，它和 vuser_init() 一样，只运行一次。它可能包含了应用程序的登出步骤。
- **Run Logic**: 运行逻辑定义了所有操作要执行的次数（除了 vuser_init 和 vuser_end）
- **Correlation**: 这个方法用于处理服务端产生的动态值。LoadRunner 有自动和手动关联的选项。在自动关联中，LoadRunner 扫描录制好的脚本，然后确认动态值。有些情况下，LoadRunner 无法这么做，所以我们需要通过录制和回放的日志手动找到这些动态值。
- **Parameterization**: 参数化，用于在测试过程中给定义的变量传递不同的值。例如：一个场景有 5 个 Vusers，他们的 UserID 分别是 AA, BB, CC, DD, EE，会通过已经定义好的 _userID 参数将这些值传递给单独的用户。
- **Rendezvous Points**: 一个 Vuser 等待其他 Vusers 抵达的点，且同时会命中下一个事务。一般用来在指定的功能上产生全部的流量。

### 基本步骤

这里要讨论一下使用 LoadRunner 测试的步骤，但并不打算讨论性能测试生命周期 (Performance Testing Life Cycle, PTLC)，因为这是一个很宽泛的问题，不过这里要讨论的内容，也可以认为是 PTLC 的一部分。

大致上，分为 5 个步骤。其他的性能测试工具，或多或少都会和 LoadRunner 一样遵循 5 个步骤。虽然工作方式不一样，但基本的概念还是一样的。这 5 个步骤是：

1. 脚本的创建
2. 场景的创建
3. 测试的执行和监控
4. 汇总结果和分析
5. 输出报告

#### 脚本的创建

LoadRunner 有一个专门的组件叫 "VuGen"，也就是我们所知道的 "Virtual User Generator"，用于录制业务流程。VuGen 捕获用户在网页上的操作，并将其转化成代码脚本，即 "Script"。VuGen 支持 C 语言，可以定义变量、方法，写一些自定义的代码，应用一些新的逻辑。LoadRunner 的脚本包含 3 个主要部分：

1. **Protocol Identification**: 协议确认，在创建脚本之前，要知道所测试的应用程序所使用的平台或技术，如果不知道，就得去问研发或者架构师了。
2. **Script Recording**: 脚本录制，脚本录制功能是 LoadRunner 最大的优点了。它支持录制 90%-95% 的协议，节省了性能测试者的时间和精力，不需要去手动写代码。在一些情况下，还是需要手动写代码的，但那都是简单的逻辑。选择了正确的协议后，就可以开始录制脚本了，业务逻辑结束后，停止录制即可。VuGen 需要一些时间来扫描录制日志并生成脚本。网页服务不会遵循脚本的行为，因此脚本生成的步骤会有些不一样。
3. **Script Enhancement**: 脚本的改善。LoadRunner 生成的是一个非常基本的基本，缺乏参数化、复杂的关联性等。脚本改善要做的是修改脚本以适应需求，编写一些自定义的逻辑。完成录制后，改善脚本会使脚本变成 100% 的自动化。要做的事情如下：
    - 参数化；
    - 关联；
    - 插入事务（如果在录制的时候没有添加事务的话，现在添加一下）；
    - 新增同步点；
    - 插入基本方法（例如：lr\_think\_time()）；
    - 插入注释
    - 开启日志（如果需要的话）
    - 插入同步点（针对 RTE Vuser）
    - 配置运行时设置

其中，有些步骤是可选的，可以跳过。完成脚本的完善后，脚本就准备好了。

#### 场景的创建

场景定义的是要执行什么测试以及怎样去执行这个测试。LoadRunner 的一个场景是由脚本、定义好的工作模型、机器列表（即 Load Generator，负载生成器）和持续时间组成的。

场景是在 LoadRunner 的 "Controller" 组件里创建的。设计场景时，要设置所有的负载生成器和 Vusers 在测试过程中要做的事情。创建场景要有合适的非功能性需求，特别是用户量和期望的 TPS。有时候，需要增加一些 Think time (两个事务时间的延迟时间) 或 Pacing (两次迭代之间的延迟时间)，来使脚本达到期望的数值。

各个值的计算器参考如下：

- [Pacing](https://www.perfmatrix.com/pacing-calculator/)
- [Think Time](https://www.perfmatrix.com/think-time-calculator/)
- [No. of Users](https://www.perfmatrix.com/virtual-user-calculator/)
- [TPS](https://www.perfmatrix.com/tps-calculator/)
- [No. of required LGs](https://www.perfmatrix.com/load-generator-calculator/)

#### 测试的执行和监控

在这个步骤里，只要运行 ("Run") 已经创建好的场景，监控运行过程中的图标即可。在测试执行过程中，LoadRunner 计算和记录 Vuser 脚本里的事务，将它们展示在仪表板上。LoadRunner 提供了一个范围很广的监控图表来显示客户端的数据。

#### 结果的生成和分析

完成测试后，Controller 会生成和整理结果。整理好的结果是 Raw 的格式。如果使用的是 Performance Center，选择 "Collate and Analysis" (整理和分析) 选项，就可以得到 HTML 格式的测试结果。可以下载这些测试结果文件到本地机器上。

LoadRunner 有一个专用的工具来分析结果，叫做 "Analysis"。这个分析工具为阅读这些原始结果文件提供了方便，以图表和表格的形式展现。分析工具有很多特性可以帮助进行更进一步的分析，找到真正的瓶颈。可以对图表进行筛选、关联、合并、覆盖，来完成问题的诊断。

#### 输出报告

分析工具有很多种报告的格式。一旦测试分析完成，就可以写一个测试结果的汇总、瓶颈的寻找、瓶颈的描述，选择想要在报告中展示的图表，然后以所需的格式生成报告，如 .doc, .docx, .pdf, .html 等。报告的生成还有一个功能，可以添加组织的 logo、作者姓名、测试者姓名等，可以让项目指导是谁致力于这次测试。

以上就是 LoadRunner 进行性能测试的 5 个基本步骤了。
