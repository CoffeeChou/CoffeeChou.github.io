---
layout: post
title: Appium 的介绍
categories: [技术, 翻译]
comments: true
---

Appium 是一个开源的工具，它可以用于原生 APP、移动互联网、iOS 和安卓的混合应用以及 Windows 桌面平台的自动化测试。原生 APP 是指那些使用 iOS、安卓或 Windows SDK 的 APP。移动互联网 APP 是指那些使用手机浏览器（Appium 支持 iOS 的 Safafi、Chrome 以及内置于安卓 App 里的浏览器）访问的网页 App。混合 App 会被封装成看起来是一个 web -- 一个可以和网页内容交互的本机控件。一些项目，如 Appache Cordava，使用 web 技术可以让构建 App 变得更加简单，然后进行封装，建成一个混合型 App。

<!--more-->

重要的是，Appium 是跨平台的：它可以让你只需要写一个 API 的测试，就可以针对不同的平台来进行测试（iOS, Android, Windows）。这样，代码就可以在 iOS, Android, Windows 下重复使用了。

要想知道更多关于 Appium 对平台的支持和自动化的模式，请阅读文档：[平台支持](https://appium.io/docs/en/about-appium/platform-support/index.html)

### Appium 的哲学

Appium 是为移动端的自动化测试而设计的，它遵循以下四个原则：
1. 不需要为了能够自动化而去重新编译或修改 App；
2. 不要被锁定在某一种特定的语言或框架里去编写和执行测试；
3. 当它变成一个自动化 API 时，移动端的自动化框架不应该重新画轮子；
4. 移动端的自动化框架应该是开源的，精神上、实践上以及名字上都是！

### Appium 的设计

那么，Appium 项目是一个什么样的架构，才能符合上面的哲学呢？

我们需要依赖 #1. 使用供应商提供的自动化框架。这样，就不需要编译任何 Appium 特定的或第三方代码以及框架了。Appium 所使用的供应商提供的框架有：

- iOS 9.3 and above: Apple's XCUITest
- iOS 9.3 and lower: Apple's UIAutomation
- Android 4.3+: Google's UiAutomator/UiAutomator2
- Windows: Microsoft's WinAppDriver

我们还需要依赖 #2. 把供应商提供的框架封装到一个 API 里，即 [WebDriver](https://www.selenium.dev/projects/) API。WebDriver （又名 Selenium WebDriver）指定了一套 client-server 协议（即大家都知道的 [JSON Wire 协议](https://w3c.github.io/webdriver/)）。根据这个 client-server 的架构，在 client 编写的任何语言的内容都可以用于发送合适的 HTTP 请求给 server。Appium 现在已经支持很多流行的编程语言了：

- Ruby
- Python
- Java
- JavaScript
- PHP
- C#
- RobotFramework

这意味着你可以自由地使用任何你喜欢的测试 runner 和测试框架。client 的库是 simply HTTP client，并且可以加到你写的代码的任何地方。换句话说，Appium 和 WebDriver client 并不是技术上的“框架” -- 它们是“自动化库”。你可以用你喜欢的方式管理你的测试环境。

我们还需要依赖 #3. WebDriver 实际上已经成为自动化网页浏览器的标准了，它是一个 [W3C Working Draft](https://w3c.github.io/webdriver/)。为什么它对移动端来说有些地方完全不一样呢？相反，我们扩展了一些对移动端自动化游泳的额外 API 方法的[协议](https://github.com/SeleniumHQ/mobile-spec/blob/master/spec-draft.md)。

显然，还需要依赖 #4. 你能够读到这些是因为 Appium 是开源的！

### Appium 里的概念

#### Client/Server 的架构

Appium 的核心是一个公开 REST API 的网络服务器。它从客户端接收连接，监听命令，并在移动设备上执行那些命令，然后以 HTTP response 展现那些命令执行的结果。事实上，client/server 的架构提供了很多的可能性：我们可以使用任何语言来写一个含有 http client 的 API 测试代码，但是，使用 Appium client 库会更容易一些。可以将服务器放在不同的机器上来执行我们的测试。还可以使用一些云服务，如 Sauce Labs 和 Lambda Test 来接收结果并分析那些命令。

#### session

自动化总是在一个 session 的上下文中执行。Client 使用指定的库对 Server 初始化一个 Session，不过，最终都会以发送一个 <code>Post /session</code> 给 server 结束，里面包含一个称为 desired capabilities 的 JSON 对象。这时，server 会启动一个自动化的 session 并返回一个 session ID，这个 ID 可以用来发送其他命令。

#### Dsired Cpabilities

Dsired Cpabilities 是一个包含 key 和 values 的集合（如：map, hash 等），将它发送给 Appium 服务器，告诉服务器要启动一个什么样的自动化测试的 session。这在修改服务器在执行自动化过程中的行为上有很多用处。比如，我们可以设置 <code>platformName</code> 为 <code>ios</code> 来告诉 Appium 服务器，我们需要一个 iOS session，而不是 Android 或 Windows 的 session。又比如，我们可以设置 <code>safariAllowPopups</code> 为 <code>true</code>，来确保在执行 Safari session 自动化过程中，我们允许 JavaScript 打开新的窗口。

可以查看 [Capabilities 文档](https://appium.io/docs/en/writing-running-appium/caps/index.html)，了解 Appium 支持的 capabilities 的参数。

#### Appium Server

Appium Server 是用 Node.js 写的。它可以从源代码去构建和安装，或者直接通过 npm 安装：
```shell
$ npm install -g appium
$ appium
```

Appium 的 <code>beta</code> 版本可以通过 npm 安装：<code>npm install -g appium@beta</code>。这是一个开发者版本，所以可能有一些会导致问题的修改。如果要安装新的版本，请先执行 <code>npm uninstall -g appium@beta</code> 将 <code>appium@beta</code> 卸载。

#### Appium Client

有很多支持 Appium 扩展的 WebDriver 协议的 client 库（支持 Java, Ruby, Python, PHP, JavaScript, C# 编程语言）。使用 Appium 时，如果想使用这些 client 库，而不用普通的 WebDriver client 库，可以查看 [client 库](https://appium.io/docs/en/about-appium/appium-clients/index.html)的文档。

#### Appium Desktop

Appium Server 有 GUI 模式，可以从各种平台上下载到，它已经捆绑了所有需要在 Appium Server 执行时需要的软件，它也可以帮助你检查 App 的层级关系。这在编写测试时，可以派上用场。

### 开始吧

恭喜！现在已经大致了解了 Appium 的情况，可以[开始](https://appium.io/docs/en/about-appium/getting-started/index.html)尝试使用啦~
