---
layout: post
title: Locust 学习笔记
excerpt: "学习使用 Locust，边学边记。"
categories: [技术]
---

大部分是从官方文档翻译和总结过来的，只进行过简单实践。

## Locust 的安装

根据官方文档（[https://docs.locust.io/en/stable/index.html](https://docs.locust.io/en/stable/index.html)），安装步骤非常简单：
```shell
$ pip3 install locust
```

安装完成时，发现没有 <code>locust</code> 命令，翻看 [wiki](https://github.com/locustio/locust/wiki/Installation)，找到解决方案：
```shell
// 在执行 pip 安装时，出现了一些 Warning 信息：
  WARNING: The script flask is installed in '/home/coffee/.local/bin' which is not on PATH.
  Consider adding this directory to PATH or, if you prefer to suppress this warning, use --no-warn-script-location.

// 把信息中的路径添加到 PATH 里就可以了：
$ export PATH=$PATH:/home/coffee/.local/bin

// 执行 locust 命令，验证是否安装好了。输出如下，就可以用了：
$ locust -V
locust 1.4.1
```

## Locust 的使用

locust 文件其实是一个 python 模块，它可以被 import 到 python 文件中。

查看 locust 命令的 help 信息，看看都有什么吧：
```shell
$ locust -h
Usage: locust [OPTIONS] [UserClass ...]

Common options:
  -h, --help            show this help message and exit
  -f LOCUSTFILE, --locustfile LOCUSTFILE
                        Python module file to import, e.g. '../other.py'. Default: locustfile
  --config CONFIG       Config file path
  -H HOST, --host HOST  Host to load test in the following format: http://10.21.32.33
  -u NUM_USERS, --users NUM_USERS
                        Number of concurrent Locust users. Primarily used together with --headless. Can be changed during a test by inputs w, W(spawn 1, 10 users) and s, S(stop 1, 10 users)
  -r SPAWN_RATE, --spawn-rate SPAWN_RATE
                        The rate per second in which users are spawned. Primarily used together with --headless
  -t RUN_TIME, --run-time RUN_TIME
                        Stop after the specified amount of time, e.g. (300s, 20m, 3h, 1h30m, etc.). Only used together with --headless. Defaults to run forever.
  -l, --list            Show list of possible User classes and exit

Web UI options:
  --web-host WEB_HOST   Host to bind the web interface to. Defaults to '*' (all interfaces)
  --web-port WEB_PORT, -P WEB_PORT
                        Port on which to run web host
  --headless            Disable the web interface, and instead start the load test immediately. Requires -u and -t to be specified.
  --web-auth WEB_AUTH   Turn on Basic Auth for the web interface. Should be supplied in the following format: username:password
  --tls-cert TLS_CERT   Optional path to TLS certificate to use to serve over HTTPS
  --tls-key TLS_KEY     Optional path to TLS private key to use to serve over HTTPS


... ...
(内容比较多)
```

- **-f**: 指定测试文件，是必须指定的参数，测试文件是 Python 文件。
- **-t**: 指定测试时间，使用该参数时必须使用 <code>--headless</code> 参数，此时，将不会启动 GUI 模式，而是直接执行该测试（此时如果尝试打开 Locust 的网页接口，是 <code>This site can’t be reached</code> 的。所以，还必须指定 <code>-H/--host</code> 参数（测试文件里没有指定所测试的 URL）。默认是永远运行。
- **-l**: 列出测试文件中可用的用户。
- **-u**: 指定测试的用户数量。


## 如何写一个 locust 文件

locust 文件其实是一个普通的 python 文件，它唯一必须要有的内容是定义至少一个继承自 <code>User</code> 的类。

### User 类

一个 user 类表示一个用户。在模拟测试时，Locust 会为每一个用户启动一个用户实例。<code>User</code> 类的一些属性如下。

#### wait_time 属性

两个任务之间需要等待的时间。

- <code>constant</code>:
- <code>between</code>:
- <code>constant_pacing</code>: 

也可以自定义 <code>wait_time</code>，比如：

```python
class MyUser(User):
    last_wait_time = 0

    def wait_time(self):
        self.last_wait_time += 1
        return self.last_wait_time

        ... ...
```

#### weight 属性

如果测试文件中有多个用户，并且在命令行中没有指定使用哪个用户来执行，Locust 会为每个 <code>User</code> 类启动相同数量的用户。如果指定用户的话，命令行是这样子的：
```shell
$ locust -f locust_file.py WebUser MobileUser
```

如果对不同用户的模拟比例不一样，就需要使用 <code>weight</code> 属性来设置了：
```python
class WebUser(User):
    weight = 3
    ...

class MobileUser(User):
    weight = 1
    ...
```

#### host 属性

即指定测试的 URL，同命令行中的 <code>--host</code> 参数，以及 UI 模式下的 HOST 参数。

#### tasks 属性

测试任务类需要用 <code>@task</code> 来装饰。（下面还有关于 task 的详细说明）

#### enviorenment 属性

比如可以在一个 task 方法中停止 ruuner：
```python
self.environment.runner.quit()
```

#### on_start 和 on_stop 属性

在 <code>User</code> （任务集 TaskSet）中可以声明 <code>on_start</code> 和 <code>on_stop</code> 方法。开始执行任务时，会调用 <code>on_start</code> 方法，任务执行结束时，会调用 <code>on_stop</code> 方法。

### Task

执行压力测试时，每个模拟用户会创建 User 类的实例，运行在线程中。这些模拟的用户选择一个任务执行，等待一会儿，再执选择一个新的任务执行，如此往复。

#### @task 装饰器

为 User 添加任务的最简单的方式是使用 <code>@task</code> 来装饰方法：

```python
from locust import User, task, constant

class MyUser(User):
    wait_time = constant(1)

    @task
    def my_task(self):
        print("User instance (%r) executing my_task" % self)
```

可以给 <code>@task</code> 设置权重，来指定 task 的执行比率。比如在下面的例子中，task2 被选择执行的概率是 task1 的两倍：
```python
from locust import User, task

class MyUser(User):
    @task(3)
    def task1(self):
        pass

    @task(6)
    def task2(self):
        pass
```

#### tasks 属性

另一个定义 User 类的任务的方法是设置 <code>tasks</code> 属性。

<code>tasks</code> 属性是一个任务列表，或者一个任务的字典 <code>\<Task: int\></code>，如：
```python
from locust import User, constant

def my_task(user):
    pass

class MyUser(User):
    tasks = [my_task]
```

如果设置的 tasks 属性是一个列表，那么在执行时是随机选择的；如果是一个字典，仍然会随机选择执行，但会以设置的 <code>int</code> 值考虑权重。
```python
# my_task 的执行概率是 another_task 的 3 倍
{my_task: 3, another_task: 1}

# 将上面的字典转换为列表，可以表示为：
[my_task, my_task, my_task, another_task]
```

#### @tag 装饰器

还可以给 task 设置 <code>@tag</code> 装饰器，执行 <code>locust</code> 命令时就可以使用<code>--tags</code> 或者 <code>--exclude-tags</code> 参数来指定所要执行的任务了。
```python
from locust import User, constant, task, tag

class MyUser(User):
    wait_time = constant(1)

    @tag('tag1')
    @task
    def task1(self):
        pass

    @tag('tag1', 'tag2')
    @task
    def task2(self):
        pass

    @tag('tag3')
    @task
    def task3(self):
        pass

    @task
    def task4(self):
        pass
```

执行时，如果使用参数 <code>--tags tag1</code>，那么只有 ***task1*** 和 ***task2*** 被执行；如果使用参数 <code>--tags tag2 tag3</code>，那么只有 ***task2*** 和 ***task3*** 被执行。

而 <code>--exclude-tags</code> 的效果相反（就是不包含的意思），如果使用参数 <code>--exclude-tags tag3</code>，那么将会执行 ***task***, ***task2***, ***task4***。

### Events

#### test_start 和 test_stop

#### init

#### 其他 events

### HttpUser 类

<code>HttpUser</code> 是最常用的用户类，它可以添加 <code>client</code> 属性来发起 HTTP 请求。
```python
from locust import HttpUser, task, between

class MyUser(HttpUser):
    wait_time = between(5, 15)

    @task(4)
    def index(self):
        self.client.get("/")

    @task(1)
    def about(self):
        self.client.get("/about/")
```

#### client 属性/HttpSession

<code>client</code> 是 <code>HttpSession</code> 的一个实例。<code>HttpSession</code> 是 <code>requests.Session</code> 的子类，它包含了所有的 HTTP 方法：<code>get</code>, <code>post</code>, <code>put</code>, ...

用法和 HttpSession 是一样的。
```python
response = self.client.post("/login", {"username":"testuser", "password":"secret"})
print("Response status code:", response.status_code)
print("Response text:", response.text)
response = self.client.get("/my-profile")
```

#### 验证结果

可以通过 <code>catch_response</code> 参数及调用 <code>response.failure()<code> 来验证一个失败的结果。
```python
with self.client.get("/", catch_response=True) as response:
    if response.text != "Success":
        response.failure("Got wrong response")
    elif response.elapsed.total_seconds() > 0.5:
        response.failure("Request took too long")
```

即使返回的 code 是失败的，也可以把请求标记为成功：
```python
with self.client.get("/does_not_exist/", catch_response=True) as response:
    if response.status_code == 404:
        response.success()
```

还可以通过抛出异常来避免记录该结果，抛出一个 locust exception 即可：
```python
from locust.exception import RescheduleTask
...
with self.client.get("/does_not_exist/", catch_response=True) as response:
    if response.status_code == 404:
        raise RescheduleTask()
```

#### 用动态参数来发起一组请求

使用 <code>HttpSession</code> 的 <code>name</code> 参数：
```python
# Statistics for these requests will be grouped under: /blog/?id=[id]
for i in range(10):
    self.client.get("/blog?id=%i" % i, name="/blog?id=[id]")
```

#### HTTP 代理设置

为了提高性能，Locust 将 HttpSession 的 <code>trust_env</code> 设置为 <code>False</code>，以关闭代理。如要开启，将 <code>locust_instance.client.trust_env</code> 设置为 <code>True</code>。

### 任务集

### 如何组织测试代码？

对于小型测试，把测试内容写到单独的一个 <code>locustfile.py</code> 即可。但对于大的测试项目，需要把测试代码放到不同的测试文件和目录中，遵循 Python 的最佳实践就可以了。比如：

- **Project root**
    - <code>common/</code>
        - <code>__init__.py</code>
        - <code>auth.py</code>
        - <code>config.py</code>
    - <code>locustfile.py</code>
    - <code>requirements.txt</code>

再复杂点的可能是这样：

- **Project root**
    - <code>common/</code>
        - <code>__init__.py</code>
        - <code>auth.py</code>
        - <code>config.py</code>
    - <code>locustfiles/</code>
        - <code>api.py</code>
        - <code>website.py</code>
    - <code>requirements.txt</code>

## Locust 的配置文件

可以将一些测试配置写入配置文件（如：<code>locust.conf</code>），就不需要命令行的参数来完成了。如：
```shell
locustfile = test.py
host = http://www.example.com
headless = true
users = 10
spawn-rate = 2
run-time = 30s
```

执行命令时可以这样：
```shell
$ locust --config=locust.conf
```

该配置将进入非 GUI 模式。

如果不指定 <code>headless</code> 和 <code>run-time</code>，则进入 GUI 模式。
