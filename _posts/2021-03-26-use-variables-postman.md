---
layout: post
title: PostMan 学习之使用参数
categories: ["技术"]
comments: true
---

在很多时候，测试需要使用不同的参数，如果每个参数都手动输入，就会很麻烦。Postman 是可以通过变量的方式给测试传一些参数的，Postman 支持在不同的范围内使用参数。

<!--more-->

{% include image.html src="/img/postman/var-scope.jpg" alt="参数范围" desc="PostMan 参数的作用范围比较" %}

> 如果在不同的范围内有两个名称相同的变量，则范围小的那个变量会生效。

- Global variables (全局变量): 在不同测试集、请求、测试脚本和环境中都能访问，是范围最大的变量，它作用于整个 workspace。
- Collection variables (测试集变量): 可以被测试集里的不同请求访问到，独立于环境 (evironment)，所以不会改变所选择的环境变量。
- Environment variables (环境变量): 可以定义执行在不同环境里的变量，如开发环境、测试环境、生产环境这样。每次次只有一种环境变量被使用，也就是不能同时使用开发环境和测试环境的环境变量。
  - 如果你只有一个环境，直接使用测试集变量会更高效一些，不过环境变量可以定义基于角色的访问权限。
- Local variable (本地变量): 是暂时的，而且智能在请求脚本里访问。本地变量的作用范围是一个运行的请求或测试集，而且一旦执行结束，这些变量就不可用了。
  - 本地变量适用于需要覆盖某个更大范围内的变量的值而又不希望这个值被永久改变的情况（因为本地变量只在执行过程中生效）。
- Data variable (数据变量): 数据变量来自外部的 CSV 或 JSON 文件。

{% include image.html src="/img/postman/Variables-Chart.png" alt="参数使用" desc="PostMan 参数的使用和作用范围" %}

### 定义变量

定义变量的方法有很多种，点界面的那种就不说了，就记录通过脚本来定义变量的方式吧。

```javascript
// set global variable
pm.globals.set("variable_key", "variable_value");

// set collection variable
pm.collectionVariables.set("variable_key", "variable_value");

// set environment variable
pm.environment.set("variable_key", "variable_value");
```

还可以通过 <code>.unset</code> 来移除变量：
```javascript
pm.environment.unset("variable_key");
```

定义本地变量，是这样的：
```javascript
pm.variables.set("variable_key", "variable_value");
```

### 访问变量

在配置中访问变量，只需要写成 <code>{ {variable_key}}</code> 就可以了。

> **注意**：
> 这里实际是没有 <code>空格</code> 的，只是 markdown 的格式会导致大括号显示不出来，需要加空格让它不要识别为网页元素。下同。

在脚本里访问变量可以这样：
```javascript
// get global variable
pm.globals.get("variable_key");

// get collection variable
pm.collectionVariables.get("variable_key");

// get environment variable
pm.environment.get("variable_key");

// access a variable at any scope including local
pm.variables.get("variable_key");
```

### 动态参数

Postman 还提供了动态参数，比如：

- <code>{ {$guid}}</code> : 可以生成一个 v4 的 guid
- <code>{ {$timestamp}}</code> : 可以获取当前的时间戳（单位是秒）
- <code>{ {$randomInt}}</code> : 随机生成一个 1-1000 之间的整数

如果要在 pre-request 里使用动态参数，可以使用： <code>pm.variables.replaceIn()</code>：
```javascript
pm.variables.replaceIn("{ {$randomFirstName}}");
```


