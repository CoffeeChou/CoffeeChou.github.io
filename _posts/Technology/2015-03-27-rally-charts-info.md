---
layout: post
title: Rally 生成 HTML 的图表信息
category: 技术之旅
keywords: OpenStack, Rally
---

Rally 相对于 Tempest 的一大好处就是：执行完 task 之后，可以生成 HTML 格式的测试结果，使测试结果更直观。

那么，对于这些图表所表示的意义，定是有必要了解的。在此对读到的一些数据做一些简单记录。

## Overview

显示测试结果的预览信息：该测试的概况、时间、出错率等。

<center>![Rally - Overview](/public/imgs/rally_overview.png)</center>
<center><i>Rally - Overview</i></center>

在图中显示内容的顶部，显示了以下信息：

* **Load duration**: 加载持续时间。（老实说还不太清楚指的是什么时间）
* **Full duration**: 总的持续时间。应该是指整个测试所用的时间。
* **Iterations**: 执行的次数，与下文的 **Count** 意义相同。
* **Failures**: 失败的次数。

### 菜单栏

菜单栏，即左侧 [1] 处，点击相应的选项，可以显示以下内容：

* **Benchmark overview**: 测试的预览信息，显示测试成功或失败，使用的总时间。
* **Input file**: 显示测试时所输入的文件，即所使用的测试用例。
* **测试组**: 展开可查看各个测试的名称。

### Total durations

如上图的 [2]。显示的是一张表格，展示一些持续时间信息。

* **Action**: 在执行一次测试用例时所包括的操作。可以根据名称了解到该测试用例都做了什么。
* **Min (sec)**: 执行的 n 次测试中，(每个操作)所用的最少时间。以秒计算。
* **Avg (sec)**: 执行的 n 次测试中，(每个操作)所用的平均时间。以秒计算。
* **Max (sec)**: 执行的 n 次测试中，(每个操作)所用的最大时间。以秒计算。
* **90 percentile**: 第 90 个百分位数对应的数值。
* **95 percentile**: 第 95 个百分位数对应的数值。
* **Success**: 测试成功率。以 % 为单位。
* **Count**: 执行的次数。

> #### 笔者注：
> 原本不太明白百分位数的含义，查了一下。如果不明白百分位数的含义，请戳[这里](http://zh.wikipedia.org/zh/%E7%99%BE%E5%88%86%E4%BD%8D%E6%95%B0)。

### Charts for the Total durations

如上图的 [3]。由上表中的数据生成的一些图。

* **面积图**：在面积图中，显示了每次执行测试用例所用的时间，通过该图，可以看出执行的大致趋势。
* **柄状图**：显示执行的成功率。
* **条形图**：X 轴表示时间，Y 轴表示次数，表示花费某个时间范围内的测试的次数。

## Details

显示各个操作的详细信息，以图的形式表现。

<center>![Rally - Details](/public/imgs/rally_details.png)</center>
<center><i>Rally - Details</i></center>

* **面积图**：以不同颜色显示每个操作所用的时间，在 [1] 区域，可以点击显示/取消某个操作的信息，直观的表示了每个操作的每次执行所用的时间。
* **饼状图**：图中 [2] 区域。以不同颜色显示了总的执行时间中，每个操作所占的百分比。
* **条形图**：图中 [3] 区域。含义与 Overview 中相同，可以点击显示/取消某个操作的信息。

## Input task

显示该测试所使用的任务的文件信息。与上文中的 Input file 有些许区别。

<center>![Rally - Input task](/public/imgs/rally_inputtask.png)</center>
<center><i>Rally - Input task</i></center>

## Failures

正如前一篇 blog 提到过，当测试中出现错误时，会多出 Failures 一栏，收集一些错误信息。

<center>![Rally with failures - Overview](/public/imgs/rally_failure_overview.png)</center>
<center><i>Rally with failures - Overview</i></center>

<center>![Rally - Failures](/public/imgs/rally_failures.png)</center>
<center><i>Rally - Failures</i></center>

