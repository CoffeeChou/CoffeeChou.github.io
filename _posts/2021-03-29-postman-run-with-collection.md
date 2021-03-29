---
layout: post
title: PostMan 学习之批量测试
categories: ["技术"]
comments: true
---

有时候，每个测试不仅仅执行一次，那就需要通过 collection 来执行（即使用测试集）。

<!--more-->

但是，如果仅仅是使用某个参数重复执行，意义不大。比如，我们测试登录时，可能需要测试使用不同的的用户名密码登录，这些请求的 API 不变，只是传递的参数有变化，对返回值的预期也没有变化（假设要验证一系列正确的用户名密码的登录，不考虑错误密码的情况），因此也没有必要写多个用例，因此，需要考虑使用参数来执行。

### 使用测试集进行批量测试

针对上述的情况，考虑使用测试集来进行测试。

执行测试集的测试时，可以选择以下几个选项：

- <code>Iterations</code>: 该测试集的执行次数，即该测试集下所有的每一个请求执行的次数；
- <code>Delay</code>: 执行每个请求之间的时间间隔，单位为 ms；
- <code>Data</code>: 上传测试数据文件，作为测试的数据源，这就是参数的灵魂所在了；
- <code>Save responses</code>: 是否保存返回信息，如果勾选，测试完成后，点击每个请求的名称可以看到这个请求返回的详细信息（不勾选就不会看到 Response Headers 和 Response Body，内容是空的）；当执行的测试集比较庞大时，勾选这个选项可能会影响测试的性能（小问号说明里写的）。

在登录测试中，假设登录所需要的参数是：<code>loginName</code> 和 <code>password</code>，在参数处可以用 <code>{{loginName}}</code> 和 <code>{{password}}</code> 表示。那么，我们可以在一个 <code>login.csv</code> 文件中写入以下内容：
```
loginName, password
username1, "000000"
username2, "000001"
username3, "000002"
```

> 这里需要特别注意的是，如果用数字作为密码，特别是以 "0" 开头的密码，要把 csv 文件的密码用 <code>" "</code> 引用起来，否则会读取到 0, 1, 2 这样的密码，而不是 000000, 000001, 000002 ...
> 在 PostMan UI 下选择了测试源文件以后，可以点击 <code>Preview</code> 按钮，看一下内容。

执行时，就会读取每一对 <code>loginName</code> 和 <code>password</code> 来进行测试了。

上述文件是 <code>.csv</code> 格式，换成 <code>.json</code> 格式也是可以的：
```
{"loginName": "username1", "password": "000000"},
{"loginName": "username2", "password": "000001"},
{"loginName": "username3", "password": "000002"},
```
