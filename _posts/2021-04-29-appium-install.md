---
layout: post
title: Appium 的安装和使用
categories: [技术, 翻译]
comments: true
---

这篇文章是翻译的文档。

将带你了解和执行一个简单 Appium 测试，介绍一些基本的 Appium 的概念。要了解更详细的 Appium 的概念，还得读这篇[概念介绍](https://appium.io/docs/en/about-appium/intro/index.html)。

<!--more-->

### 安装 Appium

Appium 可以通过两种方式安装：通过 <code>npm</code> 安装或下载 [Appium Desktop](https://github.com/appium/appium-desktop) 源码安装。Appium Desktop 是一个图形化的、基于桌面启动的 Appium server。

#### 通过 npm 安装

如果你想通过 <code>npm</code> 安装，hack 它，或者贡献代码，那么你需要有 [Node.js 和 NPM](https://nodejs.org/en/)（使用 nvm, n 或 brew install node 来安装 Node.js 时，要确保安装时**不要使用** sudo，否则运行的时候会出问题）。推荐安装最新的稳定版本，实际上安装很简单：
```shell
$ npm install -g appium
```

#### 通过源代码安装

从 [release page](https://github.com/appium/appium-desktop/releases) 下载最新的版本就可以了。

### 指定驱动的安装

你可能想使用 Appium 来自动化测试一些特定的应用，如 iOS, Android。Appium "driver" 提供了主流平台的自动化支持，所以你可以使用不同的自动化技术，它们都有自己特定的安装依赖。对一个特定的 App 开发平台来说，大多数的依赖是一样的。比如，使用 Android 驱动来将其自动化，你需要在系统中配置好 SDK。

有时，需要查看所要自动化的平台的驱动文档，确保系统已经正确安装：

- The XCUITest Driver (for iOS and tvOS apps)
- The Espresso Driver (for Android apps)
- The UiAutomator2 Driver (for Android apps)
- The Windows Driver (for Windows Desktop apps)
- The Mac Driver (for Mac Desktop apps)

### 验证安装

要想知道 Appium 的所有依赖是否都已经安装好了，可以执行 <code>appium-doctor</code> 命令验证一下。需要执行命令 <code>npm install -g appium-doctor</code> 安装，然后执行 <code>appium-doctor</code> 命令，可以加上 <code>--ios</code> 或 <code>--android</code> 参数。

### Appium Client

正如之前说过的一样，Appium 只是一个 HTTP server，它等待来自 client 的连接。也就是说，当一个 session 启动的时候，Appium 就知道是一个什么样的 session 以及要执行一个什么样的自动化。这意味着，你无法只是使用 Appium 本身，你还需要某种 client 库来使用它（或者 cURL 也可以）。

好在，Appium 的协议和 [Selenium](https://www.selenium.dev/) 是一样的，即 WebDriver 协议。因此，可以使用标准的 Selenium client 来对 Appium 做很多事情。如果已经在系统里有一个了，如果你想使用 Appium 来测试移动平台上的 web 浏览器时，这就可以开始了。

Appium 可以做一些 Selenium 所不能做的事情，这就好比，有些事情移动设备可以做，而网页浏览器做不了一样。由于这个原因，我们将 Appium client 设置成各种不同的编程语言，扩展了常规的 Selenium client，有了一些额外的功能。可以查看 client 的列表和下载链接说明：[Appium client list](https://appium.io/docs/en/about-appium/appium-clients/index.html)

在进入下一步之前，请确保你已经下载了一个你喜欢的语言的 client。

### Start Appium

现在，可以启动 Appium server 了。可以通过命令行启动（即通过 npm 安装的）：
```shell
$ appium
```

也可以点击那个大大的 Start Server 图标启动桌面模式。

然后 Appium 会显示一个小小的欢迎信息，显示当前所运行的版本以及它监听的端口（默认端口是 <code>4723</code>）。这里的端口信息是必不可少的，因为要检查测试 client 确认 Appium 连接到这个端口。可以在运行 Appium 时通过 <code>-p</code> 参数来指定端口。这里是 server 的参数列表：[server parameters](https://appium.io/docs/en/writing-running-appium/server-args/index.html)

### 运行第一个测试

在这里将运行一个基本的 "Hello World" 安卓测试。选择安卓是因为它在所有平台上可用。要使用 [UiAutomator2 Driver](https://appium.io/docs/en/drivers/android-uiautomator2/index.html)，所以要先阅读相关文档，并配置好系统。这里要使用 JavaScript 语言，所以要处理一些额外的依赖。

（如果你最后想尝试一些其他的不是 Android 也不是 JavaScript 的自动化，可以阅读：[sample-code](https://github.com/appium/appium/tree/master/sample-code)，这里有一些各种语言和平台的代码示例。

#### 前置条件

- 假设你已经配置并运行了一个 Android 8.0 模拟器（下面的例子运行在更低的版本上，根据需要改一下版本号就好）
- 假设你在本地系统上已经下载了 [测试 APK](https://raw.githubusercontent.com/appium/appium/master/sample-code/apps/ApiDemos-debug.apk)

#### 配置 Appium client

在这个例子里，要使用 [Webdriver.io](https://webdriver.io/) 作为 Appium client。为这个示例创建一个目录，然后执行：
```shell
$ npm init -y
```

项目初始化好之后，安装 <code>webdriverio</code>：
```shell
$ npm install webdriverio
```

#### Session 初始化

现在可以创建测试文件了，名为 <code>index.js</code>，初始化 client 对象：
```javascript
const wdio = require("webdriverio");
```

下一步需要做的事情就是启动一个 Appium session。我们需要定义一组 server 的选项和需要的参数，然后调用 <code>wdio.remote()</code>。需要的参数是一个 key-value 的集合，会在 session 初始化的时候发送给 Appium server，它会告诉 Appium 我们想要一个什么样的自动化。对于任何一个 Appium 驱动的参数最小配置需要包含下列参数：

- <code>platformName</code>: 自动化平台的名称
- <code>platformVersion</code>: 自动化平台的版本
- <code>deviceName</code>: 自动化的设备类型
- <code>app</code>: 要进行测试的 App 的路径（如果是要测试网页浏览器，要把这个参数的名称改为 <code>browserName</code>）
- <code>automationName</code>: 要使用的驱动的名称

要查看更多关于 Appium 可使用的参数信息，可查看 [Capabilities 文档](https://appium.io/docs/en/writing-running-appium/caps/index.html)

所以，在这个例子中，测试文件是这样的：
```javascript
// javascript
const opts = {
  path: '/wd/hub',
  port: 4723,
  capabilities: {
    platformName: "Android",
    platformVersion: "8",
    deviceName: "Android Emulator",
    app: "/path/to/the/downloaded/ApiDemos-debug.apk",
    appPackage: "io.appium.android.apis",
    appActivity: ".view.TextFields",
    automationName: "UiAutomator2"
  }
};

async function main () {
  const client = await wdio.remote(opts);

  await client.deleteSession();
}

main();
```

#### 执行测试命令

我们已经指定的 Appium 的端口，也组织好必要的参数。继续进行下一步，启动 session，执行一些测试命令，然后停止 session。

在这个示例中，我们输入一个文本，然后验证文本是否正确输入：

```javascript
// javascript

const field = await client.$("android.widget.EditText");
await field.setValue("Hello World!");
const value = await field.getText();
assert.strictEqual(value, "Hello World!");
```

这里发生了什么事情呢？创建了一个 session 并启动 App 之后，我们让 Appium 在 App 里找一个元素，将这个文本输入。然后我们查找这个字段，验证它是不是我们所期望的那样。

将上述内容写在一起，就是这样：
```javascript
// javascript

const wdio = require("webdriverio");
const assert = require("assert");

const opts = {
  path: '/wd/hub',
  port: 4723,
  capabilities: {
    platformName: "Android",
    platformVersion: "8",
    deviceName: "Android Emulator",
    app: "/path/to/the/downloaded/ApiDemos-debug.apk",
    appPackage: "io.appium.android.apis",
    appActivity: ".view.TextFields",
    automationName: "UiAutomator2"
  }
};

async function main () {
  const client = await wdio.remote(opts);

  const field = await client.$("android.widget.EditText");
  await field.setValue("Hello World!");
  const value = await field.getText();
  assert.strictEqual(value,"Hello World!");

  await client.deleteSession();
}

main();
```

尝试运行这个测试，使用 <code>node</code> 命令执行即可：
```shell
$ node index.js
```

（我习惯于用 python，所以执行起来就是 <code>$ python index.py</code>）

如果一切都正确设置，你会看到 Appium 开始输出很多日志，最后 App 会在屏幕上弹出，然后就表现得好像真的有一个用户在用它一样！

### 更多文档

- The Appium [command reference](https://appium.io/docs/en/commands/status/): 学习命令的使用
- [sample-code](https://github.com/appium/appium/tree/master/sample-code): 有很多代码示例
- [discuss.appium.io](https://discuss.appium.io/): Appium 的社区讨论
- Appium [issue tracker](https://github.com/appium/appium/issues): Appium 的 issue 列表

### 译者后记

翻译完这两篇文档之后，我发现自己还是没弄明白 Appium 是什么情况，稀里糊涂。

过了两个多月，终于又有时间，于是重新看了 Appium，去看 github 上的示例代码，去尝试自己写一些代码，才渐渐弄明白了是怎么回事。

但对我来说，这实在是太难用了。。。

最难用的莫过于定位页面上的元素了。我不知道元素的 id，不知道元素的 class name，这个元素又是个 icon 没有 text，最后还是要安装一个可以查看页面元素的软件（不过 appium 自己也可以连接到模拟器查看），有时候还定位不到某个元素，到头来装了一堆的软件。

啊，简直被逼疯。。。

大概是我自己没有用熟练吧。

就这样，Appium 是用来测试界面的，并非接口，对于界面的自动化测试来说，确实是很不错的了，也许只是我没有需求而已。
