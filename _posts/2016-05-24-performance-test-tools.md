---
layout: post
title: 谈谈我用过的性能测试工具
categories: [技术]
excerpt: "总结和记录一些性能测试的指标，和一些目前为止用过的性能测试工具。"
comments: true
---

### 一些性能指标

性能测试包括很多方面。目前为止，我所做的性能测试包括云平台虚拟机的各项性能测试和 Ceph 平台的性能测试。

对于虚拟机，性能指标一般包括：

* **网络性能**：不同宿主机上两台虚拟机之间的网络带宽；
* **磁盘性能**：虚拟机磁盘读写的 IOPS、带宽等性能；
* **CPU 性能**：虚拟机获得的 CPU 性能；
* **内存性能**：虚拟机获得的内存性能。

具体性能说明如下：

- **CPU 性能**：通过计算出一定范围数值内所有的质数的时间来判断云主机CPU性能
- **内存吞吐**：内存每秒进行读写的数据量的大小
- **存储**：
  - IOPS：IOPS是每秒磁盘连续读次数和连续写次数之和。当传输小块不连续数据时，该指标越高，磁盘性能越好。
  - 吞吐量：吞吐量通常指在一秒时间内磁盘传输的总数据量。当传输大块不连续数据时时，此值越高磁盘性能越好。
- **网络**：
  - 内网带宽：两台云主机使用内网传输的带宽；
  - 外网带宽：云主机与外网链接的流入、流出带宽；
  - 响应时间：c访问云主机时的响应时间；
  - 抖动：网络的稳定性，抖动值越低，网络稳定性越好；
  - 丢包率：网络传输的丢包率；
  - 重传：使用 TCP 发送一定量的包进行传输时的重传次数；

对于 Ceph 平台，性能指标一般包括：

* **吞吐率**：平台平均每秒处理的请求数；
* **响应时间**：平台每个成功请求的平均响应时间；
* **支持最大并发**：平台能够承受的最大并发数。

### 虚拟机性能测试

#### 网络性能

[iperf/iperf3](https://iperf.fr/) 是一个用于测试网络可实现的最大带宽的工具。

将其中一台虚拟机作为 iperf 的服务端，另一台虚拟机作为 iperf 的客户端，可以测试两台虚拟机之间的网络带宽。这两台虚拟机应运行在**不同的宿主机**上，否则，测试数据是无意义的。

* 在服务端执行：

    ~~~
    # iperf -s
    ~~~
* 在客户端执行：

    ~~~
    # iperf -c 192.168.0.14
    ~~~
在这个测试过程中，除了测试两台虚拟机之间的带宽，还可以继续测试虚拟机和宿主机之间、两台宿主机之间的带宽，作为一个数据比较。

|测试内容|虚拟机之间|虚拟机与宿主机之间|宿主机之间|
|--------|----------|------------------|----------|
|内网带宽||||

对比虚拟机之间、虚拟机与宿主机之间、宿主机之间的带宽，可以粗略计算出虚拟机网络性能的损耗：

> 网络性能损耗 = (宿主机之间的带宽 - 虚拟机之间的带宽)/宿主机之间的带宽 * 100%
                                                                              
#### 磁盘性能                                                                  

[fio](http://freecode.com/projects/fio) 是一个可用与测试磁盘 I/O、带宽等性能的工具。它可以支持 19 种不同的 I/O 引擎。

为虚拟机挂载一个 vdb 磁盘，在虚拟机中运行 fio 测试，可以获取磁盘的性能数据：

~~~shell
# fio -name="FIO with bs, iodepth, rw" -ioengine=libaio -direct=1 -thread -filename=/dev/vdb -time_based -runtime=30 -bs=4K -iodepth=64 -rw=read 
FIO with bs, iodepth, rw: (g=0): rw=read, bs=4K-4K/4K-4K/4K-4K, ioengine=libaio, iodepth=64
fio-2.1.10
Starting 1 thread
Jobs: 1 (f=1): [R] [100.0% done] [124.5MB/0KB/0KB /s] [31.9K/0/0 iops] [eta 00m:00s]
FIO with bs, iodepth, rw: (groupid=0, jobs=1): err= 0: pid=5847: Wed May 25 06:27:34 2016
  read : io=3737.5MB, bw=127568KB/s, iops=31892, runt= 30001msec
    slat (usec): min=2, max=704, avg= 6.28, stdev= 4.08
    clat (usec): min=384, max=202560, avg=1998.49, stdev=1644.33
     lat (usec): min=695, max=202564, avg=2005.03, stdev=1644.28
    clat percentiles (usec):
     |  1.00th=[ 1832],  5.00th=[ 1864], 10.00th=[ 1880], 20.00th=[ 1896],
     | 30.00th=[ 1928], 40.00th=[ 1944], 50.00th=[ 1976], 60.00th=[ 1976],
     | 70.00th=[ 1992], 80.00th=[ 2008], 90.00th=[ 2064], 95.00th=[ 2096],
     | 99.00th=[ 2896], 99.50th=[ 2960], 99.90th=[ 3376], 99.95th=[ 3600],
     | 99.99th=[ 7776]
    bw (KB  /s): min=85476, max=131136, per=100.00%, avg=127763.93, stdev=6383.98
    lat (usec) : 500=0.01%, 750=0.01%, 1000=0.01%
    lat (msec) : 2=72.54%, 4=27.44%, 10=0.01%, 250=0.01%
  cpu          : usr=10.75%, sys=26.19%, ctx=184651, majf=0, minf=70
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=0.1%, 32=0.1%, >=64=100.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.1%, >=64=0.0%
     issued    : total=r=956795/w=0/d=0, short=r=0/w=0/d=0
     latency   : target=0, window=0, percentile=100.00%, depth=64

Run status group 0 (all jobs):
   READ: io=3737.5MB, aggrb=127568KB/s, minb=127568KB/s, maxb=127568KB/s, mint=30001msec, maxt=30001msec

Disk stats (read/write):
  vdb: ios=948055/0, merge=0/0, ticks=1815873/0, in_queue=1815559, util=96.65%
~~~

> ##### 参数解释：
> * *-ioengine*：I/O 引擎，libaio 是 Linux 的原生异步 I/O 引擎；
> * *-direct*：默认值是 false(0)，如果设置为 true(1)，则绕过缓存；
> * *-filename*：要测试的磁盘路径；
> * *-runtime*：要执行的测试时间，即测试时长；
> * *-time_based*：即使已经完成读/写操作，也以 runtime 所设置的测试时间为准，即直到 runtime 结束，才结束测试；
> * *-bs*：block size，即 IO 大小；
> * *-iodepth*：队列深度；
> * *-rw*：读写模式，有 read(顺序读)、write(顺序写)、randread(随机读)、randwrite(随机写) 等模式。

其中 iodepth 是一个可影响 iops 的参数。

对于上述测试结果，我们需要关注的主要有几个值：

> * *bw*：I/O 带宽；
> * *iops*：每秒的 I/O 值，表示磁盘的 IO 速度。

一般情况下，读的速度应该比写的速度快，随机读的速度应该比顺序读的速度快，顺序写的速度应该比随机写的速度快。

> ##### 参考链接：
> * [https://www.ustack.com/blog/how-benchmark-ebs/](https://www.ustack.com/blog/how-benchmark-ebs/).

#### CPU 性能

[UnixBench](https://github.com/kdlucas/byte-unixbench) 是一个类 unix (Unix, BSD, Linux 等) 系统下的性能测试工具，它是一个开源工具。可以用于测试系统主机的性能。

UnixBench 进行的测试不仅仅是 CPU 的测试，其测试结果反映的是一台主机的综合性能。从理论上说，UnixBench 的测试结果与被测试主机的 CPU、内存、存储、操作系统都有直接的关系，但受到 CPU 的影响更大一些。

因此，我们采用 UnixBench 来测试虚拟机的 CPU 性能。

由于性能与硬件有很大的关系，而虚拟机的 CPU 等设备由宿主机提供，那么，理论上：虚拟机的性能不可能高于其宿主机的性能，如果在虚拟机上的测试结果与在宿主机上的测试结果接近，我们将认为虚拟机获得了良好的性能，资源得到了充分的利用，并且可以根据测试结果估计虚拟机的性能损耗。

##### UnixBench 测试项介绍

* **Dhrystone 2 using register variables**

    用于测试和比较计算机之间的性能。由于该项测试中没有浮点操作，它主要关注的是字符串处理，深受硬件和软件设计、编译和链接、代码优化、内存 cache、等待状态和整数数据类型的影响。
    <br/><br/>

* **Double-Precision Whetstone**

    该项测试用于测量浮点操作的速度和效率。这项测试包含了几个模块，一般在科学应用中表现为混合操作。其中有各种各样的 C 函数，包括 sin, cos, sqrt, exp 以及 log，用于整数和浮点的数学运算、数组访问、条件分支和程序调用。该项测试同时测量了整数和浮点的运算。
    <br/><br/>

* **Execl Throughput**

    该项测试测量每秒可执行的 excel 调用次数。excel 是 exec 函数族的成员之一，它将当前处理的图像替换为新的图像。它和其他一些与之相似的命令都是 execve() 函数的前端。
    <br/><br/>

* **File Copy**

    使用不同大小的缓冲区，测量从一个文件向另一个文件传输数据的速率。对文件读、写、复制的操作进行测试，从而获得文件在特定时间内（默认是 10 秒）进行写、读和复制操作的字符数目。
    <br/><br/>

* **Pipe Throughput**

    管道是进程交流中最简单的一种方式。Pipe Throughput(管道吞吐量)是指进程（每秒）能够将 512 字节写入管道并读取返回的次数。但是，管道吞吐量在现实世界的编程中并没有真正的对应。
    <br/><br/>

* **Pipe-based Context Switching**

    该项测试测量两个进程之间（每秒）通过管道交换一个不段增长的整数的次数。基于管道的上下文切换更像是一个真实的应用程序。这个测试程序创建一个子进程，再与这个子进程进行双向管道传输。
    <br/><br/>

* **Process Creation**

    该项测试测量一个进程可以创建然后收回子进程的次数（子进程立即退出）。Process Creation 是指实际创建进程控制块并为新进程分配内存，因此这可以直接测试内存带宽。一般来说，这项测试用于比较操作系统进程创建调用的不同实现。
    <br/><br/>

* **Shell Scripts**

    该项用于测试每分钟内一个进程可以并发地开始并获得一个 shell 脚本的 N 个拷贝的次数，N 取值为 1, 2, 4, 8。这个脚本对一个数据文件进行一系列的变形操作。
    <br/><br/>

* **System Call Overhead**

    该项估计进入和离开操作系统内核的成本，即进行系统调用的开销。它由一个简单的程序反复调用系统调用函数 getpid (这将返回所调用进程的 id)，执行这一调用的时间来估计进入和退出内核的成本。
    <br/><br/>

* **Graphical Tests**

    可以提供 2D 和 3D 图形，目前，特别是 3D 套件是非常有限的，它由 “ubgears” 组成。这些测试的目的是提供非常粗略的 2D 和 3D 的图形性能。但是，所报告的性能不仅取决于硬件，还取决于系统中是否有合适的驱动。
    <br/><br/>

分别在虚拟机和宿主机上执行 UnixBench 测试，比较其测试结果。

##### 在虚拟机上测试

虚拟机的配置为：

* CPU：2
* RAM：4G
* Size：40G

~~~shell
# ./Run -c 2

------------------------------------------------------------------------
Benchmark Run: 三 5月 25 2016 08:16:46 - 08:45:05
2 CPUs in system; running 2 parallel copies of tests

Dhrystone 2 using register variables       53711691.2 lps   (10.0 s, 7 samples)
Double-Precision Whetstone                     6692.9 MWIPS (9.9 s, 7 samples)
Execl Throughput                               6031.8 lps   (29.9 s, 2 samples)
File Copy 1024 bufsize 2000 maxblocks       1403795.7 KBps  (30.0 s, 2 samples)
File Copy 256 bufsize 500 maxblocks          376258.7 KBps  (30.0 s, 2 samples)
File Copy 4096 bufsize 8000 maxblocks       3642184.2 KBps  (30.0 s, 2 samples)
Pipe Throughput                             2540389.1 lps   (10.0 s, 7 samples)
Pipe-based Context Switching                 474679.9 lps   (10.0 s, 7 samples)
Process Creation                              20435.8 lps   (30.0 s, 2 samples)
Shell Scripts (1 concurrent)                   3558.8 lpm   (60.0 s, 2 samples)
Shell Scripts (8 concurrent)                    898.1 lpm   (60.2 s, 2 samples)
System Call Overhead                        2876355.7 lps   (10.0 s, 7 samples)

System Benchmarks Index Values               BASELINE       RESULT    INDEX
Dhrystone 2 using register variables         116700.0   53711691.2   4602.5
Double-Precision Whetstone                       55.0       6692.9   1216.9
Execl Throughput                                 43.0       6031.8   1402.8
File Copy 1024 bufsize 2000 maxblocks          3960.0    1403795.7   3544.9
File Copy 256 bufsize 500 maxblocks            1655.0     376258.7   2273.5
File Copy 4096 bufsize 8000 maxblocks          5800.0    3642184.2   6279.6
Pipe Throughput                               12440.0    2540389.1   2042.1
Pipe-based Context Switching                   4000.0     474679.9   1186.7
Process Creation                                126.0      20435.8   1621.9
Shell Scripts (1 concurrent)                     42.4       3558.8    839.3
Shell Scripts (8 concurrent)                      6.0        898.1   1496.8
System Call Overhead                          15000.0    2876355.7   1917.6
                                                                   ========
System Benchmarks Index Score                                        1986.0

~~~

##### 在宿主机上测试

~~~shell
# ./Run -c 2

... ...

------------------------------------------------------------------------
Benchmark Run: 三 5月 25 2016 17:01:49 - 17:29:58
12 CPUs in system; running 2 parallel copies of tests

Dhrystone 2 using register variables       53423747.2 lps   (10.0 s, 7 samples)
Double-Precision Whetstone                     6729.4 MWIPS (9.9 s, 7 samples)
Execl Throughput                               6168.3 lps   (30.0 s, 2 samples)
File Copy 1024 bufsize 2000 maxblocks       1012659.8 KBps  (30.0 s, 2 samples)
File Copy 256 bufsize 500 maxblocks          267226.4 KBps  (30.0 s, 2 samples)
File Copy 4096 bufsize 8000 maxblocks       2948779.9 KBps  (30.0 s, 2 samples)
Pipe Throughput                             2910281.4 lps   (10.0 s, 7 samples)
Pipe-based Context Switching                 280195.1 lps   (10.0 s, 7 samples)
Process Creation                              19210.6 lps   (30.0 s, 2 samples)
Shell Scripts (1 concurrent)                  13061.9 lpm   (60.0 s, 2 samples)
Shell Scripts (8 concurrent)                   4714.9 lpm   (60.0 s, 2 samples)
System Call Overhead                        3105763.2 lps   (10.0 s, 7 samples)

System Benchmarks Index Values               BASELINE       RESULT    INDEX
Dhrystone 2 using register variables         116700.0   53423747.2   4577.9
Double-Precision Whetstone                       55.0       6729.4   1223.5
Execl Throughput                                 43.0       6168.3   1434.5
File Copy 1024 bufsize 2000 maxblocks          3960.0    1012659.8   2557.2
File Copy 256 bufsize 500 maxblocks            1655.0     267226.4   1614.7
File Copy 4096 bufsize 8000 maxblocks          5800.0    2948779.9   5084.1
Pipe Throughput                               12440.0    2910281.4   2339.5
Pipe-based Context Switching                   4000.0     280195.1    700.5
Process Creation                                126.0      19210.6   1524.7
Shell Scripts (1 concurrent)                     42.4      13061.9   3080.6
Shell Scripts (8 concurrent)                      6.0       4714.9   7858.2
System Call Overhead                          15000.0    3105763.2   2070.5
                                                                   ========
System Benchmarks Index Score                                        2293.0
~~~

比较虚拟机和宿主机的 CPU 性能，计算得到性能损失为 (2293.0 - 1986.0)/2293.0 * 100% = 13.39%

#### 内存性能

[mbw](https://github.com/raas/mbw) 用于测试可提供给用户空间程序的内存拷贝带宽，可用于测试内存性能，通常用来评估用户层应用程序进行内存拷贝操作所能够达到的带宽。

对虚拟机的内存性能测试与 CPU 测试同理，分别在虚拟机和宿主机上进行测试，对比测试结果，估计虚拟机的性能损失。

##### 在虚拟机上测试

虚拟机配置：

* CPU：2
* RAM：4G
* Size：40G

~~~shell
# mbw 1024
Long uses 8 bytes. Allocating 2*134217728 elements = 2147483648 bytes of memory.
Using 262144 bytes as blocks for memcpy block copy test.
Getting down to business... Doing 10 runs per test.
0       Method: MEMCPY  Elapsed: 0.41287        MiB: 1024.00000 Copy: 2480.200 MiB/s
1       Method: MEMCPY  Elapsed: 0.41315        MiB: 1024.00000 Copy: 2478.489 MiB/s
2       Method: MEMCPY  Elapsed: 0.41326        MiB: 1024.00000 Copy: 2477.853 MiB/s
3       Method: MEMCPY  Elapsed: 0.41554        MiB: 1024.00000 Copy: 2464.287 MiB/s
4       Method: MEMCPY  Elapsed: 0.41424        MiB: 1024.00000 Copy: 2472.015 MiB/s
5       Method: MEMCPY  Elapsed: 0.41399        MiB: 1024.00000 Copy: 2473.496 MiB/s
6       Method: MEMCPY  Elapsed: 0.41515        MiB: 1024.00000 Copy: 2466.572 MiB/s
7       Method: MEMCPY  Elapsed: 0.41682        MiB: 1024.00000 Copy: 2456.702 MiB/s
8       Method: MEMCPY  Elapsed: 0.41446        MiB: 1024.00000 Copy: 2470.709 MiB/s
9       Method: MEMCPY  Elapsed: 0.41519        MiB: 1024.00000 Copy: 2466.335 MiB/s
AVG     Method: MEMCPY  Elapsed: 0.41447        MiB: 1024.00000 Copy: 2470.646 MiB/s
0       Method: DUMB    Elapsed: 0.23104        MiB: 1024.00000 Copy: 4432.095 MiB/s
1       Method: DUMB    Elapsed: 0.23022        MiB: 1024.00000 Copy: 4447.842 MiB/s
2       Method: DUMB    Elapsed: 0.22887        MiB: 1024.00000 Copy: 4474.097 MiB/s
3       Method: DUMB    Elapsed: 0.22884        MiB: 1024.00000 Copy: 4474.723 MiB/s
4       Method: DUMB    Elapsed: 0.22805        MiB: 1024.00000 Copy: 4490.165 MiB/s
5       Method: DUMB    Elapsed: 0.22869        MiB: 1024.00000 Copy: 4477.756 MiB/s
6       Method: DUMB    Elapsed: 0.22887        MiB: 1024.00000 Copy: 4474.214 MiB/s
7       Method: DUMB    Elapsed: 0.22998        MiB: 1024.00000 Copy: 4452.503 MiB/s
8       Method: DUMB    Elapsed: 0.22911        MiB: 1024.00000 Copy: 4469.430 MiB/s
9       Method: DUMB    Elapsed: 0.22924        MiB: 1024.00000 Copy: 4466.876 MiB/s
AVG     Method: DUMB    Elapsed: 0.22929        MiB: 1024.00000 Copy: 4465.911 MiB/s
0       Method: MCBLOCK Elapsed: 0.15273        MiB: 1024.00000 Copy: 6704.774 MiB/s
1       Method: MCBLOCK Elapsed: 0.15371        MiB: 1024.00000 Copy: 6661.939 MiB/s
2       Method: MCBLOCK Elapsed: 0.15403        MiB: 1024.00000 Copy: 6647.883 MiB/s
3       Method: MCBLOCK Elapsed: 0.15243        MiB: 1024.00000 Copy: 6718.058 MiB/s
4       Method: MCBLOCK Elapsed: 0.15372        MiB: 1024.00000 Copy: 6661.636 MiB/s
5       Method: MCBLOCK Elapsed: 0.15306        MiB: 1024.00000 Copy: 6690.012 MiB/s
6       Method: MCBLOCK Elapsed: 0.15303        MiB: 1024.00000 Copy: 6691.498 MiB/s
7       Method: MCBLOCK Elapsed: 0.15247        MiB: 1024.00000 Copy: 6716.207 MiB/s
8       Method: MCBLOCK Elapsed: 0.15254        MiB: 1024.00000 Copy: 6712.993 MiB/s
9       Method: MCBLOCK Elapsed: 0.15373        MiB: 1024.00000 Copy: 6660.942 MiB/s
AVG     Method: MCBLOCK Elapsed: 0.15314        MiB: 1024.00000 Copy: 6686.500 MiB/s
~~~

##### 在宿主机上测试

~~~shell
# mbw 1024
Long uses 8 bytes. Allocating 2*134217728 elements = 2147483648 bytes of memory.
Using 262144 bytes as blocks for memcpy block copy test.
Getting down to business... Doing 10 runs per test.
0       Method: MEMCPY  Elapsed: 0.39870        MiB: 1024.00000 Copy: 2568.360 MiB/s
1       Method: MEMCPY  Elapsed: 0.40264        MiB: 1024.00000 Copy: 2543.215 MiB/s
2       Method: MEMCPY  Elapsed: 0.40111        MiB: 1024.00000 Copy: 2552.916 MiB/s
3       Method: MEMCPY  Elapsed: 0.40056        MiB: 1024.00000 Copy: 2556.440 MiB/s
4       Method: MEMCPY  Elapsed: 0.39971        MiB: 1024.00000 Copy: 2561.883 MiB/s
5       Method: MEMCPY  Elapsed: 0.40160        MiB: 1024.00000 Copy: 2549.807 MiB/s
6       Method: MEMCPY  Elapsed: 0.40178        MiB: 1024.00000 Copy: 2548.639 MiB/s
7       Method: MEMCPY  Elapsed: 0.39959        MiB: 1024.00000 Copy: 2562.607 MiB/s
8       Method: MEMCPY  Elapsed: 0.40139        MiB: 1024.00000 Copy: 2551.135 MiB/s
9       Method: MEMCPY  Elapsed: 0.39770        MiB: 1024.00000 Copy: 2574.831 MiB/s
AVG     Method: MEMCPY  Elapsed: 0.40048        MiB: 1024.00000 Copy: 2556.950 MiB/s
0       Method: DUMB    Elapsed: 0.22250        MiB: 1024.00000 Copy: 4602.185 MiB/s
1       Method: DUMB    Elapsed: 0.22223        MiB: 1024.00000 Copy: 4607.859 MiB/s
2       Method: DUMB    Elapsed: 0.22089        MiB: 1024.00000 Copy: 4635.729 MiB/s
3       Method: DUMB    Elapsed: 0.22200        MiB: 1024.00000 Copy: 4612.530 MiB/s
4       Method: DUMB    Elapsed: 0.22234        MiB: 1024.00000 Copy: 4605.497 MiB/s
5       Method: DUMB    Elapsed: 0.22092        MiB: 1024.00000 Copy: 4635.141 MiB/s
6       Method: DUMB    Elapsed: 0.22155        MiB: 1024.00000 Copy: 4621.961 MiB/s
7       Method: DUMB    Elapsed: 0.22166        MiB: 1024.00000 Copy: 4619.709 MiB/s
8       Method: DUMB    Elapsed: 0.22081        MiB: 1024.00000 Copy: 4637.450 MiB/s
9       Method: DUMB    Elapsed: 0.22037        MiB: 1024.00000 Copy: 4646.667 MiB/s
AVG     Method: DUMB    Elapsed: 0.22153        MiB: 1024.00000 Copy: 4622.426 MiB/s
0       Method: MCBLOCK Elapsed: 0.14576        MiB: 1024.00000 Copy: 7025.392 MiB/s
1       Method: MCBLOCK Elapsed: 0.14662        MiB: 1024.00000 Copy: 6983.850 MiB/s
2       Method: MCBLOCK Elapsed: 0.14730        MiB: 1024.00000 Copy: 6952.035 MiB/s
3       Method: MCBLOCK Elapsed: 0.14555        MiB: 1024.00000 Copy: 7035.576 MiB/s
4       Method: MCBLOCK Elapsed: 0.14496        MiB: 1024.00000 Copy: 7064.213 MiB/s
5       Method: MCBLOCK Elapsed: 0.14586        MiB: 1024.00000 Copy: 7020.527 MiB/s
6       Method: MCBLOCK Elapsed: 0.14525        MiB: 1024.00000 Copy: 7050.108 MiB/s
7       Method: MCBLOCK Elapsed: 0.14741        MiB: 1024.00000 Copy: 6946.611 MiB/s
8       Method: MCBLOCK Elapsed: 0.14633        MiB: 1024.00000 Copy: 6997.977 MiB/s
9       Method: MCBLOCK Elapsed: 0.14508        MiB: 1024.00000 Copy: 7058.078 MiB/s
AVG     Method: MCBLOCK Elapsed: 0.14601        MiB: 1024.00000 Copy: 7013.209 MiB/s
~~~

根据以上测试数据，结果如下：

|测试内容|虚拟机|宿主机|
|--------|------|------|
|MEMCPY|2470.646|2556.950|
|DUMB|4465.911|4622.426|
|MCBLOCK|6686.500|7013.209|

虚拟机的性能损耗为：

> * MEMCPY = (2556.950 - 2470.646)/2556.950 * 100% = 3.38%
> * DUMB = (4622.426 - 4465.911)/4622.426 * 100% = 3.39%
> * MCBLOCK = (7013.209 - 6686.500)/7013.209 * 100% = 4.66%

### Ceph 平台性能（对象存储性能）

#### 吞吐率和响应时间

[COSBench](https://github.com/intel-cloud/cosbench/) 是 Inter 的一套开源对象存储测试套件。它是一个分布式的基准测试工具，目前已经可以支持不同的对象存储系统。

COSBench 由两个关键组件组成：

* Driver（也称 COSBench Driver 或负载生成器 (Load Generator)）：
  * 负责负载的生成、对目标云对象存储发起操作以及收集性能数据；
  * 可以通过 `http://[driver-host]:18088/driver/index.html` 访问。
* Controller（也称 COSBench Controller）：
  * 负责协调 driver，以整体执行负载、收集并集合运行时状态和运行的结果；
  * 可以通过 `http://[controller-host]:19088/controller/index.html` 访问。

##### 测试文件说明

COSBench 的配置文件位于 `conf/` 目录中，使用 xml 个是，将测试文件提交到 Controller 页面，可执行测试。

Ceph 使用 s3 的配置进行测试，配置文件样例为 `conf/s3-config-sample.xml`：

~~~xml
<?xml version="1.0" encoding="UTF-8" ?>
<workload name="s3-sample" description="sample benchmark for s3">

  <storage type="s3" config="accesskey=<accesskey>;secretkey=<scretkey>;proxyhost=<proxyhost>;proxyport=<proxyport>;endpoint=<endpoint>" />

  <workflow>

    <workstage name="init">
      <work type="init" workers="1" config="cprefix=s3testqwer;containers=r(1,2)" />
    </workstage>

    <workstage name="prepare">
      <work type="prepare" workers="1" config="cprefix=s3testqwer;containers=r(1,2);objects=r(1,10);sizes=c(64)KB" />
    </workstage>

    <workstage name="main">
      <work name="main" workers="8" runtime="30">
        <operation type="read" ratio="80" config="cprefix=s3testqwer;containers=u(1,2);objects=u(1,10)" />
        <operation type="write" ratio="20" config="cprefix=s3testqwer;containers=u(1,2);objects=u(11,20);sizes=c(64)KB" />
      </work>
    </workstage>

    <workstage name="cleanup">
      <work type="cleanup" workers="1" config="cprefix=s3testqwer;containers=r(1,2);objects=r(1,20)" />
    </workstage>

    <workstage name="dispose">
      <work type="dispose" workers="1" config="cprefix=s3testqwer;containers=r(1,2)" />
    </workstage>

  </workflow>

</workload>
~~~

###### workload

\<storage\> 中：

* **type**: 表示所使用的云对象存储类型，Ceph 使用 s3 类型；
* **config**: 用于配置认证方式，'accesskey' 中写入测试用户的 accesskey，'secretkey' 中写入测试用户的 secretkey，'endpoint' 中写入 Ceph 的 URL。

> ##### 注意：
> * endpoint 中需要使用 'http'，否则将默认使用 'https'，导致测试失败。

###### workflow

\<workstage\> 表示测试的不同阶段，其中 workers 表示并发数目：

* **init**: 创建测试 bucket；
* **prepare**: 创建测试 object，object 大小可通过 sizes 设置；
* **main**: 测试主体，其中的 'operation' 为测试执行的操作，可执行的操作包括：read, write, filewrite, delete；
* **cleanup**: 清理测试所创建的 object；
* **dispose**: 清理测试所创建的 bucket。

##### 执行测试

执行测试时，只需要登录 COSBench 的 Controller 节点界面，将测试配置文件提交即可。也可以通过界面上的配置生成配置文件来进行测试。

#### 支持最大并发

[Apache JMeter](http://jmeter.apache.org/)、[http_load](http://acme.com/software/http_load/)、[webbench](http://home.tiscali.cz/~cz210552/webbench.html) 可以测试支持的最大并发。

其中 http_load 和 webbench 都比较简单，而 Apache JMeter 就复杂的多。

JMeter 是有操作界面的，支持远程启动，也可以组成集群去测试，是一个强大的测试工具。

笔者也没有研究的太深入，就不多说了～
