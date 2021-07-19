---
layout: post
title: Apache Bench 的学习
categories: ["技术", "翻译"]
comments: true
---

Apache Bench 也就是 ab，是 Apache 开发的一个超文本传输协议（HTTP）的基准测试工具。

前不久刚被 Appium 虐完之后，觉得 ab 用起来实在太简单太好用了！

不过他俩不是一个东西，测试的方向也不一样（一个测试界面，一个测试接口），不能直接做比较的。

嘛，但也阻止不了我这样觉得。

<!--more-->

原文链接：[https://www.tutorialspoint.com/apache_bench/apache_bench_quick_guide.htm](https://www.tutorialspoint.com/apache_bench/apache_bench_quick_guide.htm)

### 安装

在 linux 上的安装特别简单，一个命令就可以搞定了：

```shell
$ sudo apt-get install apache2-utils
```

### 基本使用

比如，要对某一个 url (http://postman-echo.com/get) 进行测试，发起 100 个请求，并行数为 10，执行 60s：
```shell
$ ab -n 100 -c 10 -t 60 http://postman-echo.com/get
```

然后等待测试结果即可。

将结果输出到文件：
```shell
$ab -n 100 -c 10 -t 60 -g tmp/data.out http://postman-echo.com/get
```

### 结果输出

其实我写这篇文章主要是为了记录结果输出的。。。

- **Server Software**: 所测试的 web server 的名称，是从 HTTP header 获取的。
- **Server Hostname**: 执行命令时所指定的 DNS 或 IP 地址。
- **Server Port**: 测试时所连接的端口。如果执行命令时没有指定端口，会使用默认的 80（用于 http）或 443（用于 https）端口。
- **SSL/TLS Protocol**: 处理客户端和服务端之间的协议的参数，只有在使用 SSL 的情况下才会打印这个参数的值。
- **Document Path**: 请求的 URI。
- **Document Length**: 第一次成功返回的内容的大小（单位是 bytes），如果在测试过程中 length 发生改变，将认为发生了错误。
- **Concurrency Level**: 测试过程中并发的客户端数（等同于浏览网页的用户数）。
- **Time Taken for Tests**: 从创建第一个连接至接收到最后一个返回所花费的时间。
- **Complete Requests**: 成功返回的请求数。
- **Failed Requests**: 被认为是失败的请求的数量。如果该数字大于 0，会增加一行信息，展示由于连接、读取、错误 content length 或异常导致的错误的数量。
- **Total Transferred**: 从服务端接收到的总大小（单位是 bytes），这个值本质上是通过导线传递的总的大小。
- **HTML Transferred**: 从服务端接收的总的 document 的大小（单位是 bytes），这个值不包括从 HTTP headers 获取的内容的大小。
- **Requests per second**: 每秒钟的请求数。这个值是以请求的总数除以所花费的时间得到的结果。
-  **Time per request**: 每个请求平均花费的时间。第一个值的公式为：并发数 x 所花费的时间 x 1000，第二个值的公式为：所花费的时间 x 1000（上面例子里，请求数是 100，并发数是 10，所以总数是 1000）
- **Transfer rate**: 传输率，计算公式为：总读取数 / 1024 / 所花费的时间

现在看下将结果输出到文件的话，输出的文件是什么样子的：
```shell
$ vim tmp/data.out
... ...
```

- **starttime**: 请求开始的日期时间。
- **seconds**: 和 starttime 是一样的，但它是 Unix 下的时间戳格式，可以通过命令 `$ date -d @1496160697` 得到时间信息。
- **ctime**: 连接时间。
- **dtime**: 执行时间。
- **ttime**: 总的时间，即 ttime = ctime + dtime
- **wait**: 等待时间。

这几个时间的定义和区别可以看下面这个图，就很容易区分了（不过图不是很清晰）：

{% include image.html src="/img/multiple_items.jpg" desc="" alt="" %}

还有一些其他的命令参数，看 help 命令就好了。

就酱。
