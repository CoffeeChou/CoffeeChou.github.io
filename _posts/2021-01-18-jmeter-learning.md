---
layout: post
title: JMeter 学习笔记
excerpt: "学习使用 JMeter，作为记录。"
categories: [技术]
---

## JMeter 的安装

根据 JMeter 的文档进行安装，过程很简单：

1. 安装 JDK；
2. 设置 <code>JAVA_HOME</code>；
```
$ export JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
// 该命令执行后本次开机有效，如果电脑重启，就需要重新执行
// 也可以将上述命令行写入 ~/.bashrc 中，重启时就不用重新执行了
```
3. 下载 JMeter 的压缩包（我是 Debian 操作系统），解压（下载地址：[https://jmeter.apache.org/download_jmeter.cgi](https://jmeter.apache.org/download_jmeter.cgi)）；
```
$ tar -xzvf apache-jmeter-5.4.tgz
```

这样就可以使用了。

## JMeter 的 Test Plan

一个 JMeter 的测试由测试计划 (Ttest Plan)、线程组 (Thread Group) 以及一个或多个采样器 (Sampler) 组成。

这个小节是从官方文档概括过来的，官方文档链接在这里：[https://jmeter.apache.org/usermanual/test_plan.html](https://jmeter.apache.org/usermanual/test_plan.html)

### Test Plan (测试计划)

Test Plan 中有一个 <code>Functional Test Mode</code> 的选项，如果勾选上，JMeter 会对 Sampler 的测试结果返回 Data 信息。如果在 Listener 添加了输出结果的文件，此时测试 Data 会写入该文件中。如果要进行压力测试，就不要勾选这个选项了（默认是不勾选的）。如果没有指定文件来保存 Data，那么这个选项勾选与否都无所谓。

### Thread Group (线程组)

Thread Group 是 Test Plan 里最重要的一个配置。其中有三个重要参数：

- **Number of Threads**: 即模拟多少并发量（用户）。
- **Ramp of period**: 告诉 JMeter 花多长时间达到所设置的并发量。如，设置 Threads 为 10，Ramp 时间为 100，那么每 10s (100/10) 就会启动一个 Thread。进行压力测试时，要将 Ramp 的值设置得大一些，避免突然产生太大的访问量；也不能设置得太长，至少最后一个 Thread 的启动要在第一个结束之前吧。
- **Loop Count**: 测试执行的次数。

此外，还可以设置测试持续的时间：勾选 <code>Specify Thread lifetime</code>，可以设置 Duration (持续时间) 和 Startup Delay (延迟启动时间)。

### Controllers (控制器)

JMeter 有两种控制器： Samplers (采样器) 和 Logical Controllers (逻辑控制器)。

#### Samplers

**Samplers**: 让 JMeter 发送给测试服务器发送请求，如 HTTP 请求。

Samplers 可以发送的请求类型有：

* FTP Request
* HTTP Request (也可以用来模拟 SOAP 请求和 REST 请求)
* JDBC Request
* Java object request
* JMS request
* JUnit Test request
* LDAP Request
* Mail request
* OS Process request
* TCP request

如果对测试服务器发送同一种请求类型，可以考虑用 <code>Default Configuration</code> 对 Sampler 进行配置。

如果做一些基本验证，可以在 Sampler 中添加 <code>Assertion</code>，来验证返回的具体内容。

#### Logical Controllers

**Logical Controllers**: 可以自定义一些逻辑，让 JMeter 来决定什么时候发送请求，可以配置请求的顺序。

逻辑控制器使用时，测试计划的树状结构是这样的：

* Test Plan
    * Thread Group
        * Once Only Controller
            * Login Request (an HTTP Request)
        * Load Search Page (HTTP Sampler)
        * Interleave Controller
            * Search "A" (HTTP Sampler)
            * Search "B" (HTTP Sampler)
            * HTTP default request (Configuration Element)
        * HTTP default request (Configuration Element)
        * Cookie Manager (Configuration Element)

### Listener (监听器)

**Listener** 可以查看 JMeter 测试用例的返回信息等，还可以把输出信息保存到文件。

如果 Sample 比较多，那么 Listener 会占用很多内存。

### Timers (计时器)

### Assertions

**Assertions** 可以用来验证测试的返回是否符合预期。

### Configuration Elements (配置参数)

可以配置 Sampler 的参数，分支中的参数只对分支有效，而且优先级高于父分支。

### Pre-Processor Elements (预处理参数)

在 Sampler 之前执行一些预处理操作。

### Post-Processor Elements (后处理参数)

在 Sampler 之后执行一些操作。

### Execution order (执行顺序)

在一个测试中，执行顺序是这样的：

```
0. Configuration elements
1. Pre-Processors
2. Timers
3. Sampler
4. Post-Processors (unless SampleResult is null)
5. Assertions (unless SampleResult is null)
6. Listeners (unless SampleResult is null)
```

> 注意：Samplers 和 Logical Controllers 会按照树状结构里的顺序执行。

例如：如果 Test Plan 是这样的结构：

- Controller
    - Post-Processor 1
    - Sampler 1
    - Sampler 2
    - Timer 1
    - Assertion 1
    - Pre-Processor 1
    - Timer 2
    - Post-Processor 2

那么，这个测试的执行顺序将是：
```
Pre-Processor 1
Timer 1
Timer 2
Sampler 1
Post-Processor 1
Post-Processor 2
Assertion 1

Pre-Processor 1
Timer 1
Timer 2
Sampler 2
Post-Processor 1
Post-Processor 2
Assertion 1
```

### Scoping Rules

## JMeter 的使用

切换到 JMeter 的 <code>bin/</code> 目录下，执行 <code>jmeter.sh</code> 或 <code>jmeter</code> 脚本文件，就可以使用 JMeter 了。

### GUI 模式

直接运行 <code>jmeter.sh</code> 或 <code>jmeter</code> 脚本，即可打开 GUI 界面。

点击模板按钮，可以导入官方已有的一些测试计划的模板，这里不展开了。

### CLI 模式

查看 help 信息：

```
# ./jmeter -?    
    _    ____   _    ____ _   _ _____       _ __  __ _____ _____ _____ ____
   / \  |  _ \ / \  / ___| | | | ____|     | |  \/  | ____|_   _| ____|  _ \
  / _ \ | |_) / _ \| |   | |_| |  _|    _  | | |\/| |  _|   | | |  _| | |_) |
 / ___ \|  __/ ___ \ |___|  _  | |___  | |_| | |  | | |___  | | | |___|  _ <
/_/   \_\_| /_/   \_\____|_| |_|_____|  \___/|_|  |_|_____| |_| |_____|_| \_\ 5.4

Copyright (c) 1999-2020 The Apache Software Foundation

	--?
		print command line options and exit
	-h, --help
		print usage information and exit
	-v, --version
		print the version information and exit
	-p, --propfile <argument>
		the jmeter property file to use
	-q, --addprop <argument>
		additional JMeter property file(s)
	-t, --testfile <argument>
		the jmeter test(.jmx) file to run. "-t LAST" will load last 
		used file
	-l, --logfile <argument>
		the file to log samples to
	-i, --jmeterlogconf <argument>
		jmeter logging configuration file (log4j2.xml)
	-j, --jmeterlogfile <argument>
		jmeter run log file (jmeter.log)
	-n, --nongui
		run JMeter in nongui mode
	-s, --server
		run the JMeter server
	-E, --proxyScheme <argument>
		Set a proxy scheme to use for the proxy server
	-H, --proxyHost <argument>
		Set a proxy server for JMeter to use
	-P, --proxyPort <argument>
		Set proxy server port for JMeter to use
	-N, --nonProxyHosts <argument>
		Set nonproxy host list (e.g. *.apache.org|localhost)
	-u, --username <argument>
		Set username for proxy server that JMeter is to use
	-a, --password <argument>
		Set password for proxy server that JMeter is to use
	-J, --jmeterproperty <argument>=<value>
		Define additional JMeter properties
	-G, --globalproperty <argument>=<value>
		Define Global properties (sent to servers)
		e.g. -Gport=123
		 or -Gglobal.properties
	-D, --systemproperty <argument>=<value>
		Define additional system properties
	-S, --systemPropertyFile <argument>
		additional system property file(s)
	-f, --forceDeleteResultFile
		force delete existing results files and web report folder if
		 present before starting the test
	-L, --loglevel <argument>=<value>
		[category=]level e.g. jorphan=INFO, jmeter.util=DEBUG or com
		.example.foo=WARN
	-r, --runremote
		Start remote servers (as defined in remote_hosts)
	-R, --remotestart <argument>
		Start these remote servers (overrides remote_hosts)
	-d, --homedir <argument>
		the jmeter home directory to use
	-X, --remoteexit
		Exit the remote servers at end of test (non-GUI)
	-g, --reportonly <argument>
		generate report dashboard only, from a test results file
	-e, --reportatendofloadtests
		generate report dashboard after load test
	-o, --reportoutputfolder <argument>
		output folder for report dashboard
```

- **-n**: 运行时，使用 -n 参数，JMeter 就会启动非 GUI 模式，即命令行模式（如果不用这个参数的话，会启动 GUI 模式）。
- **-t**: 指定测试计划文件，jmx 格式，在 JMeter 的 <code>bin/templates/</code> 目录下有例子。
- **-l**: 指定测试写入测试结果的文件，格式是 csv。JMeter 执行时默认会将结果写入 <code>jmeter.log</code>，每次运行时会重新生成。如果想保存结果，需要用 -l 指定结果文件。
- **-J**: 运行时设置 JMeter 的参数，可设置的参数可以参考 <code>jmeter.properties</code>。

以上是常用参数，其他的先不展开了。

#### 举个例子

通过一个例子来学习 jmx 文件是如何定义测试的吧。使用 <code>bin/templates/build-web-test-plan.jmx</code> 文件进行测试：
```
$ ./jmeter -n -t templates/build-web-test-plan.jmx -l test-results/example-results.csv
Creating summariser <summary>
Created the tree successfully using templates/build-web-test-plan.jmx
Starting standalone test @ Thu Jan 21 16:27:32 CST 2021 (1611217652493)
Waiting for possible Shutdown/StopTestNow/HeapDump/ThreadDump message on port 4445
summary +     87 in 00:00:28 =    3.2/s Avg:   638 Min:   210 Max:  3387 Err:     0 (0.00%) Active: 5 Started: 5 Finished: 0
summary +    161 in 00:00:31 =    5.3/s Avg:   422 Min:   219 Max:  2185 Err:     0 (0.00%) Active: 5 Started: 5 Finished: 0
summary =    248 in 00:00:58 =    4.3/s Avg:   498 Min:   210 Max:  3387 Err:     0 (0.00%)
summary +     38 in 00:00:07 =    5.4/s Avg:   453 Min:   221 Max:  1804 Err:     0 (0.00%) Active: 0 Started: 5 Finished: 5
summary =    286 in 00:01:05 =    4.4/s Avg:   492 Min:   210 Max:  3387 Err:     0 (0.00%)
Tidying up ...    @ Thu Jan 21 16:28:37 CST 2021 (1611217717743)
... end of run
```

结果输出到 <code>test-results/example-results.csv</code> 文件中，内容如下（仅截取部分结果）：
```
timeStamp,elapsed,label,responseCode,responseMessage,threadName,dataType,success,failureMessage,bytes,sentBytes,grpThreads,allThreads,URL,Latency,IdleTime,Connect
1611217657791,1710,Home Page,200,OK,Scenario 1 1-1,text,true,,1005,307,2,2,http://example.org/,1704,0,1374
1611217658640,1549,Home Page,200,OK,Scenario 1 1-2,text,true,,1005,307,3,3,http://example.org/,1549,0,1240
1611217659641,548,Home Page,200,OK,Scenario 1 1-3,text,true,,1022,307,3,3,http://example.org/,548,0,239
1611217660548,255,Page Returning 404,404,Not Found,Scenario 1 1-1,text,true,,991,311,4,4,http://example.org/test,255,0,0
1611217660641,470,Home Page,200,OK,Scenario 1 1-4,text,true,,1022,307,4,4,http://example.org/,469,0,233
1611217661205,315,Page Returning 404,404,Not Found,Scenario 1 1-3,text,true,,991,311,4,4,http://example.org/test,315,0,0
1611217660807,1122,Home Page,200,OK,Scenario 1 1-1,text,true,,1005,307,5,5,http://example.org/,1122,0,0
1611217661262,938,Page Returning 404,404,Not Found,Scenario 1 1-2,text,true,,991,311,5,5,http://example.org/test,938,0,0
1611217661522,1022,Home Page,200,OK,Scenario 1 1-3,text,true,,1022,307,5,5,http://example.org/,1022,0,0
1611217661639,1268,Home Page,200,OK,Scenario 1 1-5,text,true,,1022,307,5,5,http://example.org/,1268,0,289
1611217662160,1002,Page Returning 404,404,Not Found,Scenario 1 1-4,text,true,,991,311,5,5,http://example.org/test,1002,0,0
1611217662964,232,Page Returning 404,404,Not Found,Scenario 1 1-1,text,true,,991,311,5,5,http://example.org/test,232,0,0
```

对比测试文件、输出结果以及 curl 的执行结果，来理解这个测试文件 (<code>templates/build-web-test-plan.jmx</code>)：
```
// 只截取有用部分
$ curl -v http://example.org
* Connected to example.org (93.184.216.34) port 80 (#0)
> GET / HTTP/1.1
> Host: example.org
> User-Agent: curl/7.74.0
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< Accept-Ranges: bytes
< Age: 480938
< Cache-Control: max-age=604800
< Content-Type: text/html; charset=UTF-8
< Date: Thu, 21 Jan 2021 08:49:28 GMT
< Etag: "3147526947"
< Expires: Thu, 28 Jan 2021 08:49:28 GMT
< Last-Modified: Thu, 17 Oct 2019 07:18:26 GMT
< Server: ECS (sjc/16DF)
< Vary: Accept-Encoding
< X-Cache: HIT
< Content-Length: 1256
< 
<!doctype html>
<html>

... ...

<body>
<div>
    <h1>Example Domain</h1>
    <p>This domain is for use in illustrative examples in documents. You may use this
    domain in literature without prior coordination or asking for permission.</p>
    <p><a href="https://www.iana.org/domains/example">More information...</a></p>
</div>
</body>
</html>

$ curl -v http://example.org/test
* Connected to example.org (93.184.216.34) port 80 (#0)
> GET /test HTTP/1.1
> Host: example.org
> User-Agent: curl/7.74.0
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 404 Not Found
< Accept-Ranges: bytes
< Age: 176338
< Cache-Control: max-age=604800
< Content-Type: text/html; charset=UTF-8
< Date: Thu, 21 Jan 2021 08:49:58 GMT
< Expires: Thu, 28 Jan 2021 08:49:58 GMT
< Last-Modified: Tue, 19 Jan 2021 07:51:00 GMT
< Server: ECS (sjc/4E65)
< Vary: Accept-Encoding
< X-Cache: 404-HIT
< Content-Length: 1256
< 
<!doctype html>
<html>

... ...

<body>
<div>
    <h1>Example Domain</h1>
    <p>This domain is for use in illustrative examples in documents. You may use this
    domain in literature without prior coordination or asking for permission.</p>
    <p><a href="https://www.iana.org/domains/example">More information...</a></p>
</div>
</body>
</html>
```

分析可以看到：
* 测试文件中的 <code>HTTPSamplerProxy</code> 即一个 HTTP Sampler，相关参数设置可以在文件中看到；
* 验证 <code>Home Page</code> 时（用 testname 来定义 sampler 的名称），设置 <code>HTTPSampler.method</code> 为 <code>GET</code>，通过一个 <code>ResponseAssertion</code> 设置了一个 Asserttion，验证的类型是 <code>Assertion.response_data</code>，内容是 <code>Example Domain</code>：


```
// HTTPSampler 的设置：
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="Home Page" enabled="true">
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments" guiclass="HTTPArgumentsPanel" testclass="Arguments" testname="Variables pré-définies" enabled="true">
            <collectionProp name="Arguments.arguments"/>
          </elementProp>
          <stringProp name="HTTPSampler.domain"></stringProp>
          <stringProp name="HTTPSampler.port"></stringProp>
          <stringProp name="HTTPSampler.connect_timeout"></stringProp>
          <stringProp name="HTTPSampler.response_timeout"></stringProp>
          <stringProp name="HTTPSampler.protocol"></stringProp>
          <stringProp name="HTTPSampler.contentEncoding"></stringProp>
          <stringProp name="HTTPSampler.path">/</stringProp>
          <stringProp name="HTTPSampler.method">GET</stringProp>
          <boolProp name="HTTPSampler.follow_redirects">true</boolProp>
          <boolProp name="HTTPSampler.auto_redirects">false</boolProp>
          <boolProp name="HTTPSampler.use_keepalive">true</boolProp>
          <boolProp name="HTTPSampler.DO_MULTIPART_POST">false</boolProp>
          <boolProp name="HTTPSampler.monitor">false</boolProp>
          <stringProp name="HTTPSampler.embedded_url_re"></stringProp>
        </HTTPSamplerProxy>

// 对应的 ResponseAssertion 的设置：
          <ResponseAssertion guiclass="AssertionGui" testclass="ResponseAssertion" testname="Assertion" enabled="true">
            <collectionProp name="Asserion.test_strings">
              <stringProp name="-868354929">&lt;h1&gt;Example Domain&lt;/h1&gt;</stringProp>    // 验证内容
            </collectionProp>
            <stringProp name="Assertion.test_field">Assertion.response_data</stringProp>    // 验证类型
            <boolProp name="Assertion.assume_success">false</boolProp>
            <intProp name="Assertion.test_type">16</intProp>
          </ResponseAssertion>
```


* 验证 <code>Page Returning 404</code> 结果时，设置 <code>HTTPSampler.method</code> 为 <code>GET</code>，通过一个 <code>ResponseAssertion</code> 设置一个 Assertion，验证类型是 <code>Assertion.response_code</code>，内容是 <code>404</code>：


```
// HTTPSampler 的设置：
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="Page Returning 404" enabled="true">
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments" guiclass="HTTPArgumentsPanel" testclass="Arguments" testname="Variables pré-définies" enabled="true">
            <collectionProp name="Arguments.arguments"/>
          </elementProp>
          <stringProp name="HTTPSampler.domain"></stringProp>
          <stringProp name="HTTPSampler.port"></stringProp>
          <stringProp name="HTTPSampler.connect_timeout"></stringProp>
          <stringProp name="HTTPSampler.response_timeout"></stringProp>
          <stringProp name="HTTPSampler.protocol"></stringProp>
          <stringProp name="HTTPSampler.contentEncoding"></stringProp>
          <stringProp name="HTTPSampler.path">/test</stringProp>
          <stringProp name="HTTPSampler.method">GET</stringProp>
          <boolProp name="HTTPSampler.follow_redirects">true</boolProp>
          <boolProp name="HTTPSampler.auto_redirects">false</boolProp>
          <boolProp name="HTTPSampler.use_keepalive">true</boolProp>
          <boolProp name="HTTPSampler.DO_MULTIPART_POST">false</boolProp>
          <boolProp name="HTTPSampler.monitor">false</boolProp>
          <stringProp name="HTTPSampler.embedded_url_re"></stringProp>
          <stringProp name="TestPlan.comments">It does not fails because we use an assertion that ignores status</stringProp>
        </HTTPSamplerProxy>

// 对应的 ResponseAssertion 的设置：
          <ResponseAssertion guiclass="AssertionGui" testclass="ResponseAssertion" testname="Assertion_404" enabled="true">
            <collectionProp name="Asserion.test_strings">
              <stringProp name="51512">404</stringProp>     // 验证内容
            </collectionProp>
            <stringProp name="TestPlan.comments">The assertion is specia:
- It ignores status which would make it in error by default (404)
- It checks Response Code is equal to 404</stringProp>
            <stringProp name="Assertion.test_field">Assertion.response_code</stringProp>    // 验证类型
            <boolProp name="Assertion.assume_success">true</boolProp>
            <intProp name="Assertion.test_type">8</intProp>
          </ResponseAssertion>
```
* 对输出结果的设置是通过 <code>ResultCollector</code> 设置的，设置如下：


```
      <ResultCollector guiclass="ViewResultsFullVisualizer" testclass="ResultCollector" testname="View Results Tree" enabled="true">
        <boolProp name="ResultCollector.error_logging">false</boolProp>
        <objProp>
          <name>saveConfig</name>
          <value class="SampleSaveConfiguration">
            <time>true</time>
            <latency>true</latency>
            <timestamp>true</timestamp>
            <success>true</success>
            <label>true</label>
            <code>true</code>
            <message>true</message>
            <threadName>true</threadName>
            <dataType>false</dataType>
            <encoding>false</encoding>
            <assertions>true</assertions>
            <subresults>true</subresults>
            <responseData>false</responseData>
            <samplerData>false</samplerData>
            <xml>false</xml>
            <fieldNames>true</fieldNames>
            <responseHeaders>false</responseHeaders>
            <requestHeaders>false</requestHeaders>
            <responseDataOnError>false</responseDataOnError>
            <saveAssertionResultsFailureMessage>true</saveAssertionResultsFailureMessage>
            <assertionsResultsToSave>0</assertionsResultsToSave>
            <bytes>true</bytes>
            <threadCounts>true</threadCounts>
            <idleTime>true</idleTime>
            <connectTime>true</connectTime>
          </value>
        </objProp>
```





> 有用文档： [https://jmeter.apache.org/usermanual/component_reference.html#View_Results_Tree](https://jmeter.apache.org/usermanual/component_reference.html#View_Results_Tree)
