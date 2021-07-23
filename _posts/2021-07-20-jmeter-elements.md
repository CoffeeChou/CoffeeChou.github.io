---
layout: post
title: Jmeter 的测试文件参数解读
categories: ["技术"]
comments: true
---

上一次学习 Jmeter 已经是半年前了呜呜呜～

学习了不用，就特别容易忘记。

最近又有时间了，重新看一次，把测试文件的参数吃透，做个笔记，以后翻看笔记就直接会用啦，我是不是很聪明～

<!--more-->

这篇文章记录的是 HTTP 请求类型的测试文件参数。

首先，参数有几种类型：

| 参数名称 | 参数含义 |
| -------- | -------- |
| **stringProp** | string 类型的参数 |
| **boolProp** | bool 类型的参数，即 true 或 false |
| **intProp** | int 类型的参数 |
| **longPop** | long 类型的参数 |
| **elementProp** | 元素属性，如 TestPlan, ThreadGroup, HTTPSampler 等都是一个一个的元素 |

### TestPlan 的参数

一个文件中，TestPlan 只有一个。

| 参数名称 | 参数含义 |
| -------- | -------- |
| **TestPlan.comments** | string 类型，注释信息 |

### ThreadGroup 的参数

每个 TestPlan 下可以有多个 ThreadGroup。

| 参数名称 | 参数含义 |
| -------- | -------- |
| **ThreadGroup.on_sampler_error** | string 类型，可用值是：continue, startnextloop, stopthread, stoptest, stoptestnow |
| **ThreadGroup.main_controller** | 线程组的控制器，主要关注下面两个参数：<br>- LoopController.continue_forever: bool 类型，是否永远执行；<br>- LoopController.loops: int 类型，循环次数 |
| **ThreadGroup.num_threads** | 线程组数，即并行数 |
| **ThreadGroup.ramp_time** | string 类型，设为数字，可以认为是每秒并行产生多少线程数，如：设置 num_threads 为 100，ramp_time 为 10，那么就需要 10s 的时间来产生 100 个线程。这样可以模拟逐渐增加的压力 |
| **ThreadGroup.start_time** | long 类型，开始时间，不可为空，如果不需要这个参数，可以删除（置空的话执行会报错） |
| **ThreadGroup.end_time** | long 类型，结束时间，不可为空，如果不需要这个参数，可以删除（置空的话执行会报错） |
| **ThreadGroup.scheduler** | bool 类型，是否顺序执行 |
| **ThreadGroup.duration** | string 类型，执行的时间，填写数字，单位是秒，<br>- 可以为空，如果填写为空，那么执行完所有的循环后，就会停止；<br>- 如果不为空，需要把上述的 LoopController.loops 设置为 -1，即表示一直执行，这样执行时间才会生效 |
| **ThreadGroup.delay** | string 类型，填写数字，单位是秒，可以为空 |

### Samples 的参数

一些统一的信息可以使用 HTTP Request Defaults 来设置，就不需要在每一个 sampler 里填写地址、端口等信息了。

HTTP Request Defaults 在 jmx 文件中显示为 <code>ConfigTestElement</code>，可配置的参数如下：

| 参数名称 | 参数含义 |
| -------- | -------- |
| **HTTPSampler.domain** | string 类型，要测试的地址 |
| **HTTPSampler.port** | string 类型，要测试的端口 |
| **HTTPSampler.connect_timeout** | string 类型，设置连接的超时时间，单位是毫秒 |
| **HTTPSampler.response_timeout** | string 类型，设置返回的超时时间，单位是毫秒 |
| **HTTPSampler.protocol** | string 类型，协议类型，默认是 http |
| **HTTPSampler.path** | string 类型，请求的路径，如：/test |

每个 HTTPSampler 以 HTTPSamplerProxy 来设置，配置项如下：

| 参数名称 | 参数含义 |
| -------- | -------- |
| **HTTPSampler.domain** | string 类型，要测试的地址，如果在 HTTP Request Defaults 已经填写，该值可以为空 |
| **HTTPSampler.port** | string 类型，要测试的端口，如果在 HTTP Request Defaults 已经填写，该值可以为空 |
| **HTTPSampler.connect_timeout** | string 类型，设置连接的超时时间，单位是毫秒，如果在 HTTP Request Defaults 已经填写，该值可以为空 |
| **HTTPSampler.response_timeout** | string 类型，设置返回的超时时间，单位是毫秒，如果在 HTTP Request Defaults 已经填写，该值可以为空 |
| **HTTPSampler.protocol** | string 类型，协议类型，默认是 http，如果在 HTTP Request Defaults 已经填写，该值可以为空 |
| **HTTPSampler.path** | string 类型，请求的路径，如：/test |
| **HTTPSampler.method** | string 类型，HTTP 的请求方法，如：GET, POST, DELETE 等 |
| **HTTPSampler.follow_redirects** | bool 类型，跟随重定向，有些链接会重定向到别的链接，设置为 True，可以跟随重定向 |
| **HTTPSampler.auto_redirects** | bool 类型，自动重定向，默认是 False |
| **HTTPSampler.use_keepalive** | bool 类型，是否使用长连接，一般测试时需要进行登录操作，就需要 keepalive 设置，把这个参数设置为 True |

### Assertion 的参数

Assertion 用于定义断言，也就是判断该返回是否成功，如果不成功，可以自定义错误信息。

| 参数名称 | 参数含义 |
| -------- | -------- |
| **Assertion.test_field** | string 类型，可用值如下（从字面就知道验证的内容了，不作解释）：<br>- Assertion.response_code<br>- Assertion.response_data<br>- Assertion.response_message<br>- Assertion.response_headers<br>- Assertion.request_headers<br>- Assertion.response_data_as_document<br>- Assertion.request_data |
| **Assertion.costom_message** | string 类型，设置出错时的错误信息 |
| **Assertion.test_type** | int 类型，我也不知道应该填什么 |
| **Assertion.assume_success** | bool 类型，验证时是否忽略返回的状态 |

### 报告里的内容

在测试文件中可以定义输出的报告（其实就是 .csv 文件）的内容，这些内容有（反正其实全都设置为 True 好像也没问题）：

- **time**
- **latency**
- **timestamp**
- **success**
- **label**
- **code**
- **message**
- **threadNam**
- **dataType**
- **encoding**
- **assertions**
- **subresults**
- **responseData**
- **samplerData**
- **xml**
- **fieldNames**
- **responseHeaders**
- **requestHeaders**
- **responseDataOnError**
- **saveAssertionResultsFailureMessage**
- **assertionsResultsToSave**
- **bytes**
- **threadCounts**
- **idleTime**
- **connectTime**

我们也要看懂输出的结果。在输出的 csv 文件中，包含这些数据内容：

| 参数名称 | 参数含义 |
| -------- | -------- |
| **timeStamp** | 执行的时间戳，即着一条记录请求的时间，是 13 位的时间，精确到毫秒 |
| **elapsed** | 该请求持续的时间，是总的时间 |
| **label** | HTTP Request 的名称，即在 HTTPSamplerProxy 中定义的 testname |
| **responseCode** | 请求返回的 code |
| **responseMessage** | 请求返回的 message |
| **threadName** | 线程的名称，命名规则是 [threadgroup_name] [loop_num]-[thread_num]，如：<code>demo 1-1</code> |
| **dataType** | 返回的数据类型，一般是 text |
| **success** | 是否成功 |
| **failureMessage** | 失败信息，是指上述在 Assertion 中定义的 <code>Assertion.custom_message</code> |
| **bytes** | 传输的数据大小，单位是 bytes |
| **sentBytes** | 发送的数据大小，单位是 bytes |
| **grpThreads** | |
| **allThreads** | |
| **URL** | 请求的 URL |
| **Latency** | 延迟时间，单位是毫秒 |
| **IdleTime** | 空闲时间，单位是毫秒 |
| **Connect** | 连接时间，单位是毫秒 |

### 关于登录

有很多系统，都需要 登录之后才能进行操作，并不是开放的 API，所以要怎么让 Jmeter 登录之后就带着登录信息，不需要手动把认证信息或者 Cookie 写到每一个 HTTP 请求里呢？

查了一下方法，尝试了一下，步骤如下（通过 Jmeter GUI 模式操作的）：

1. 给 ThreadGroup 添加 HTTP Cookie Manager，这个 Cookie Manager 可以什么都不用填；
1. 添加登录的 HTTP Request；
1. 添加其他 HTTP Request；
1. 运行验证请求是否返回 200；

上面这是用一个用户登录的情况，还要再试试用多个用户登录的情况。

多个用户登录时，需要用到 CSV Data Set Config，即 CSV 数据配置文件。大致步骤如下：

1. 写好 csv 文件，比如这里要用到的是用户名和密码，参数分别为 username, password（这里要特别注意，在 csv 文件里，逗号之间不要有空格，不然会把空格读到变量值里）：
```
coffee1,pwd1
coffee2,pwd2
coffee3,pwd3
coffee4,pwd4
```
1. 在 GUI 模式下操作，添加 CSV Data Set Config 到 ThreadGroup 中，选择上述文件，填写变量名称（自己起名称就可以，在下面使用变量的时候就使用的是这个名称）；
1. 在登录的 HTTP Request 中，用变量的方式填写参数的值：

| Name     | Value       |
| -------- | ----------- |
| username | ${username} |
| password | ${password} |

保存后，执行测试，看是否成功登录。成功登录的话，再添加一个其他的 HTTP Request 看看是否成功访问。

对应的 jmx 文件里，CSV Data set Config 是这样写的：
```jmx
<CSVDataSet guiclass="TestBeanGUI" testclass="CSVDataSet" testname="CSV Data Set Config" enabled="true">
  <stringProp name="delimiter">,</stringProp>
  <stringProp name="fileEncoding">UTF-8</stringProp>
  <stringProp name="filename">{PATH_OF_CSV_FILE}</stringProp>
  <boolProp name="ignoreFirstLine">false</boolProp>
  <boolProp name="quotedData">false</boolProp>
  <boolProp name="recycle">true</boolProp>
  <stringProp name="shareMode">shareMode.all</stringProp>
  <boolProp name="stopThread">false</boolProp>
  <stringProp name="variableNames">username,password</stringProp>
</CSVDataSet>
```

### 最后的最后

在仔细查看了一下命令行之后，发现了几个跟 report 相关的很“酷炫”的参数诶：
```shell
./jmeter -?
    _    ____   _    ____ _   _ _____       _ __  __ _____ _____ _____ ____
   / \  |  _ \ / \  / ___| | | | ____|     | |  \/  | ____|_   _| ____|  _ \
  / _ \ | |_) / _ \| |   | |_| |  _|    _  | | |\/| |  _|   | | |  _| | |_) |
 / ___ \|  __/ ___ \ |___|  _  | |___  | |_| | |  | | |___  | | | |___|  _ <
/_/   \_\_| /_/   \_\____|_| |_|_____|  \___/|_|  |_|_____| |_| |_____|_| \_\ 5.4

Copyright (c) 1999-2020 The Apache Software Foundation
... ...

	-g, --reportonly <argument>
		generate report dashboard only, from a test results file
	-e, --reportatendofloadtests
		generate report dashboard after load test
	-o, --reportoutputfolder <argument>
		output folder for report dashboard
```

首先，<code>-g</code> 这个参数是配合 GUI 使用的，在非 GUI 模式下用这个参数，就会报错两个参数不兼容，忽略它：
```
Error: Incompatible options --n/--nongui and -g/--reportonly found.
```

然后呢，就是 <code>-e</code> 和 <code>-o</code> 两个参数：
- **-e**: 测试结束之后生成 dashboard 的报告，即图表类的报告；
- **-o**: 上述报告输出的目录，如果不指定，使用上述参数后会默认生成一个 <code>result-output</code> 目录，把结果保存在这个目录里；

执行测试就是这个样子：
```shell
$ ./jmeter -n -t test-plans/demo.jmx -l test-results/demo.csv -e -o test-results/demo-output
```

然后呢，看看 dashboard 的样子，它涵盖了很多类型的图表，足够满足我们进行测试分析了，截了几张图：

{% include image.html src="/img/jmeter-dashboard-1.png" desc="概览" alt="" %}
{% include image.html src="/img/jmeter-dashboard-2.png" desc="吞吐量相关" alt="" %}
{% include image.html src="/img/jmeter-dashboard-3.png" desc="响应时间相关" alt="" %}

这里面的图片还能点击保存呢（都不用截图的）:-)

就酱，仍然没有太多干货。
