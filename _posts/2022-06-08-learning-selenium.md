---
layout: post
title: Selenium 的学习
categories: [技术]
---

去年，我一直想着要搭建一套持续集成系统。通过 Jenkins 去拉取 GitLab 上的更新，然后自动部署到指定的服务器上。

这个初步的设想，其实是为了实现自动化测试做的准备。

半年过去后，我又回来了。

于是继续研究这套系统，该学习 Selenium 了。

<!--more-->

### 困扰

之前有学习过 Appium，困扰了我很久的问题不是怎么写测试代码，而是：**我不知道如何定位元素！**

大部分的时间都花在尝试寻找元素去了。

所以这次呢，恰好知道了可以用浏览器去找元素，就先从这里开始学习。记录一下。

#### 通过 XPath 定位

通过 Chrome 浏览器的调试模式，可以定位到页面的每一个元素。

1. 按下 `F12` 按钮，打开调试模式；
2. 在页面中找到元素之后，点击调试模式下该元素的 `Elements`，右键点击 `Copy`，选择 `Copy XPath`

就可以啦～

但是，通常这样获取到的 xpath 都很长，我一般的做法是，写 xpath 的时候，下尝试使用按钮的 span 去获取，获取不到的时候，才会用上面的方式去拿到 xpath。

#### 其他定位方式

除了通过 XPath 定位之外，还可以通过很多其他的方式，比如 `className`, `id`, `tagName` 等...但是很多前端布局没有写 id，className 和 tagName 又是不唯一的，最后我用的多的还是 XPath ...

### unit test

在组织脚本的时候，用到了 python 的 unittest 模块。unittest.TestCase 类里会执行所有以 test 开头的方法。

#### setUp 和 tearDown 方法

每一个测试的类，都有 setUp 和 tearDown 方法。但是呢，每次执行 test 方法的时候，都会先 setUp 之后，再 tearDown。

举个例子：

```python
import unittest
from selenium import webdriver

BASE_URL = "https://www.baidu.com/"

class TestBaidu(unittest.TestCase):
    def setUp(self):
        print("执行 setUp 开始测试")

    def tearDown(self):
        print("执行 tearDown 结束测试")
        print("----------------------")

    def test_1(self):
        print("测试： test_1")

    def test_2(self):
        print("测试： test_2")

    def test_2(self):
        print("测试： test_2")
```

执行上面的脚本，得到的结果是：
```
执行 setUp 开始测试
测试： test_1
执行 tearDown 结束测试
----------------------
执行 setUp 开始测试
测试： test_2
执行 tearDown 结束测试
----------------------
执行 setUp 开始测试
测试： test_2
执行 tearDown 结束测试
----------------------
```

这显然很不符合一般的测试操作习惯，在测试的时候，一般只需要登录一次就可以了。

所以要改一下，把 setUp 改成 setUpClass，并加上 `@classmethod`，tearDown 同理：
```python
import unittest
from selenium import webdriver

BASE_URL = "https://www.baidu.com/"

class TestBaidu(unittest.TestCase):
    @classmethod
    def setUpClass(self):
        print("执行 setUp 开始测试")

    @classmethod
    def tearDownClass(self):
        print("执行 tearDown 结束测试")
        print("----------------------")

    def test_1(self):
        print("测试： test_1")

    def test_2(self):
        print("测试： test_2")

    def test_2(self):
        print("测试： test_2")
```

此时，得到的结果是：
```
执行 setUp 开始测试
测试： test_1
测试： test_2
测试： test_2
执行 tearDown 结束测试
----------------------
```

这样，才符合我的预期行为。

### 使用 Remote 执行测试

由于测试脚本可能会扔到 linux 服务器上运行，没有桌面环境，也没有浏览器，那么这个测试就需要通过 Remote 的方式，在其他机器上启动浏览器进行测试了。

Remote 的使用方法如下：

1. 下载 selenium-server-standalone 的 jar 包。很有意思的是，selenium 说要运行这个 jar 包，但并没有给出下载这个 jar 包的地址，只好自己去找了，这里有：[https://github.com/adamhooper/selenium-server-standalone-jar](https://github.com/adamhooper/selenium-server-standalone-jar)
2. 在打算运行浏览器的机器上，运行上述 jar 包：
```
$ java -jar selenium-server-standalone-3.141.59.jar
```
3. 修改脚本代码为：
```python
import unittest
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
class TestBaidu(unittest.TestCase):
    @classmethod
    def setUpClass(self):
        print("执行 setUp 开始测试")
        # 这里的 command_executor 写上述运行 jar 包的机器地址，端口号默认是 4444，需要加 /wd/hub 路径
        self.driver = webdriver.Remote(command_executor="http://192.168.0.xxx:4444/wd/hub", desired_capabilities=DesiredCapabilities.FIREFOX)
        self.driver.get("http://www.baidu.com/")
    @classmethod
    def tearDownClass(self):
        print("执行 tearDown 结束测试")
        print("----------------------")
    def test_1(self):
        print("执行测试 1")
```
4. 在 Linux 服务器上运行脚本：
```shell
$ python test_baidu.py
```

此时，就会在运行 jar 包的机器上，打开 Firefox 浏览器，执行测试内容。
