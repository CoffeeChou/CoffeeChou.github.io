---
layout: post
title: 常用命令行工具 -- curl
categories: ["技术"]
comments: true
---

几年前上班，这个命令行很常用，如今几年过去了，还是要重新学习一下。

PS： 今天找到了以前学习各种东西做的一些笔记，做笔记真是个好习惯，啊哈哈哈哈～～～

<!--more-->

惯例先看看 help 信息：
```shell
$ curl -h
Usage: curl [options...] <url>
 -d, --data <data>   HTTP POST data
 -f, --fail          Fail silently (no output at all) on HTTP errors
 -h, --help <category> Get help for commands
 -i, --include       Include protocol response headers in the output
 -o, --output <file> Write to file instead of stdout
 -O, --remote-name   Write output to a file named as the remote file
 -s, --silent        Silent mode
 -T, --upload-file <file> Transfer local FILE to destination
 -u, --user <user:password> Server user and password
 -A, --user-agent <name> Send User-Agent <name> to server
 -v, --verbose       Make the operation more talkative
 -V, --version       Show version number and quit

This is not the full help, this menu is stripped into categories.
Use "--help category" to get an overview of all categories.
For all options use the manual or "--help all".
```

因为最近在学习 PostMan，知道了 [postman-echo.com/get](http://postman-echo.com/get) 这个链接，另外还有 <code>/put</code>, <code>/post</code>, <code>/delete</code> 啦这些，用来 做测试和学习真的很不错～

### 发起不同的请求

默认是 GET 方法：
```shell
$ curl http://postman-echo.com/get
{"args":{},"headers":{"x-forwarded-proto":"http","x-forwarded-port":"80","host":"postman-echo.com","x-amzn-trace-id":"Root=1-605ac84d-32f18f135ac8bf7e0fd69091","user-agent":"curl/7.74.0","accept":"*/*"},"url":"http://postman-echo.com/get"}

// 加上 -i 参数，会返回响应的 HTTP 头：
$ curl -i http://postman-echo.com/get
HTTP/1.1 200 OK
Date: Wed, 24 Mar 2021 05:36:43 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 239
Connection: keep-alive
ETag: W/"ef-3aQTTmq8SB3Dr4mrav6z1axvuck"
Vary: Accept-Encoding
set-cookie: sails.sid=s%3Ar-E5g2iuljRd_wul9fZ2lTA8-k8tH924.p0LNsQcSwzEUo9s1o1h3Qnl5JtDnV%2BW6uJlFnasFf7Y; Path=/; HttpOnly

{"args":{},"headers":{"x-forwarded-proto":"http","x-forwarded-port":"80","host":"postman-echo.com","x-amzn-trace-id":"Root=1-605acfeb-5eb75bc977e530693ebbfa90","user-agent":"curl/7.74.0","accept":"*/*"},"url":"http://postman-echo.com/get"}
```

使用其他方法，如 <code>POST</code>, <code>PUT</code>, <code>DELETE</code> 方法等，需要使用 <code>-X</code> 或 <code>--request</code> 参数：
```shell
$ curl -X POST http://postman-echo.com/post
{"args":{},"data":{},"files":{},"form":{},"headers":{"x-forwarded-proto":"http","x-forwarded-port":"80","host":"postman-echo.com","x-amzn-trace-id":"Root=1-605acc80-11f179c41fccdc027505ce1f","user-agent":"curl/7.74.0","accept":"*/*"},"json":null,"url":"http://postman-echo.com/post"}

$ curl -X PUT http://postman-echo.com/put
{"args":{},"data":{},"files":{},"form":{},"headers":{"x-forwarded-proto":"http","x-forwarded-port":"80","host":"postman-echo.com","x-amzn-trace-id":"Root=1-605acefb-115e79906a05f67d0b889879","user-agent":"curl/7.74.0","accept":"*/*"},"json":null,"url":"http://postman-echo.com/put"}

$ curl -X DELETE http://postman-echo.com/delete
{"args":{},"data":{},"files":{},"form":{},"headers":{"x-forwarded-proto":"http","x-forwarded-port":"80","host":"postman-echo.com","x-amzn-trace-id":"Root=1-605acf2b-1bcceaf370c4c9784e74a9d5","user-agent":"curl/7.74.0","accept":"*/*"},"json":null,"url":"http://postman-echo.com/delete"}
```

### 常用参数记录

这里就记录一些常用的参数吧，如果以后有别的参数用的比较多，再加进来：

- <code>-i</code> 参数： 输出的返回值中包含头信息。
- <code>-v</code> 参数： 输出中包含请求信息。
- <code>-d</code> 参数： 即 HTTP POST data。
- <code>-H</code> 参数： 指定请求头。
- <code>-X</code> 参数： 请求操作，默认是 GET，还可以指定为 POST, DELETE, PUT 等。
- <code>-o</code> 参数： 将结果输出到指定文件。

举个栗子：
```shell
$ curl -i -v -X POST http://postman-echo.com/post -d '{"username": "coffee", "password": "12345"}'
Note: Unnecessary use of -X or --request, POST is already inferred.
*   Trying 3.226.45.131:80...
* Connected to postman-echo.com (3.226.45.131) port 80 (#0)
> POST /post HTTP/1.1
> Host: postman-echo.com
> User-Agent: curl/7.74.0
> Accept: */*
> Content-Length: 43
> Content-Type: application/x-www-form-urlencoded
> 
* upload completely sent off: 43 out of 43 bytes
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
HTTP/1.1 200 OK
< Date: Mon, 29 Mar 2021 07:52:20 GMT
Date: Mon, 29 Mar 2021 07:52:20 GMT
< Content-Type: application/json; charset=utf-8
Content-Type: application/json; charset=utf-8
< Content-Length: 466
Content-Length: 466
< Connection: keep-alive
Connection: keep-alive
< ETag: W/"1d2-AE1S/OzptdbxWInMmBSyd9BNamE"
ETag: W/"1d2-AE1S/OzptdbxWInMmBSyd9BNamE"
< Vary: Accept-Encoding
Vary: Accept-Encoding
< set-cookie: sails.sid=s%3A8aP8goOiVRqddCp0i8E4I_MQPKFE8JMc.1f0lHs8Z4VpDrAeTBDbox2Z3lpRiZjX%2FhAWM7tzBB5Q; Path=/; HttpOnly
set-cookie: sails.sid=s%3A8aP8goOiVRqddCp0i8E4I_MQPKFE8JMc.1f0lHs8Z4VpDrAeTBDbox2Z3lpRiZjX%2FhAWM7tzBB5Q; Path=/; HttpOnly

< 
* Connection #0 to host postman-echo.com left intact
{"args":{},"data":"","files":{},"form":{"{\"username\": \"coffee\", \"password\": \"12345\"}":""},"headers":{"x-forwarded-proto":"http","x-forwarded-port":"80","host":"postman-echo.com","x-amzn-trace-id":"Root=1-60618734-5bec0cee4cc86b596100044f","content-length":"43","user-agent":"curl/7.74.0","accept":"*/*","content-type":"application/x-www-form-urlencoded"},"json":{"{\"username\": \"coffee\", \"password\": \"12345\"}":""},"url":"http://postman-echo.com/post"}
```

其中，<code>-d</code> 的参数根据 API 的支持有不同的格式，比如：
- JSON 格式：<code>-d '{"username": "coffee", "password": "12345"}'</code>，相当于 <code>--data-raw [data]</code>。
- urlencode 格式：<code>-d "username=coffee&password=12345"</code>，相当于 <code>--data-urlencode [data]</code>。
- 二进制文件：<code>-d @filename</code>，相当于 <code>--data-binary [filename]</code>。

-----

先写这么多吧，目前暂时会用到这么多内容。




