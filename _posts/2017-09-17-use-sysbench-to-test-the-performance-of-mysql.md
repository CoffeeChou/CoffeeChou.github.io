---
layout: post
title: 使用 sysbench 测试 mysql 性能
categories: ["技术"]
comments: true
---

几年前写的关于使用 sysbench 测试 mysql 性能的笔记。

原本以为当时太忙了没有时间做笔记，没想到无意间找到了它。笔记的时间已经记不清了，就写了大概的时间吧。

<!--more-->

## 测试指标

* tps: 每秒事务数；
* qps: 每秒查询数，其实等于每秒读的次数；
* 每秒写的次数；(insert, update, delete 等修改操作)

## 测试方法

1. 起两台虚拟机，在同一个内网里（通过内网相互访问）；
2. 其中一台搭建 mysql，另一台作为 mysql 的测试机；
3. 不需要测试外网访问；

## mysqlslap

### 可能会用到的参数
```
--host=[host], -h  远程主机
--user=[user], -u  用户
--password, -p  密码
--concurrency=[number]  并行数
--iteration=[number]  执行几次
--number-int-cols=[number]
--number-char-cols=[number]
--engine=[myisam, innodb], -e  存储引擎（都有什么引擎？）
--no-drop  测试后不删除表

--auto-generate-sql, -a  自动生成数据库进行测试
--auto-generate-sql-load-type=[read, write, key, update, mixed]  测试类型
--auto-generate-sql-secondary-index  创建多少列索引
--number-of-queries=[number]  所有并发线程的请求次数和
```

## sysbench

### 参数记录

通用参数：
```
General options:
  --num-threads=N            number of threads to use [1]
  --max-requests=N           limit for total number of requests [10000]
  --max-time=N               limit for total execution time in seconds [0]
  --forced-shutdown=STRING   amount of time to wait after --max-time before forcing shutdown [off]
  --thread-stack-size=SIZE   size of stack per thread [32K]
  --init-rng=[on|off]        initialize random number generator [off]
  --test=STRING              test to run
  --debug=[on|off]           print more debugging info [off]
  --validate=[on|off]        perform validation checks where possible [off]
  --help=[on|off]            print help and exit
  --version=[on|off]         print version and exit

Compiled-in tests:
  fileio - File I/O test
  cpu - CPU performance test
  memory - Memory functions speed test
  threads - Threads subsystem performance test
  mutex - Mutex performance test
  oltp - OLTP test
```

数据库测试参数：
```
  sysbench 0.4.12:  multi-threaded system evaluation benchmark

oltp options:
  --oltp-test-mode=STRING         test type to use {simple,complex,nontrx,sp} [complex]
  --oltp-reconnect-mode=STRING    reconnect mode {session,transaction,query,random} [session]
  --oltp-sp-name=STRING           name of store procedure to call in SP test mode []
  --oltp-read-only=[on|off]       generate only 'read' queries (do not modify database) [off]
  --oltp-skip-trx=[on|off]        skip BEGIN/COMMIT statements [off]
  --oltp-range-size=N             range size for range queries [100]
  --oltp-point-selects=N          number of point selects [10]
  --oltp-simple-ranges=N          number of simple ranges [1]
  --oltp-sum-ranges=N             number of sum ranges [1]
  --oltp-order-ranges=N           number of ordered ranges [1]
  --oltp-distinct-ranges=N        number of distinct ranges [1]
  --oltp-index-updates=N          number of index update [1]
  --oltp-non-index-updates=N      number of non-index updates [1]
  --oltp-nontrx-mode=STRING       mode for non-transactional test {select, update_key, update_nokey, insert, delete} [select]
  --oltp-auto-inc=[on|off]        whether AUTO_INCREMENT (or equivalent) should be used on id column [on]
  --oltp-connect-delay=N          time in microseconds to sleep after connection to database [10000]
  --oltp-user-delay-min=N         minimum time in microseconds to sleep after each request [0]
  --oltp-user-delay-max=N         maximum time in microseconds to sleep after each request [0]
  --oltp-table-name=STRING        name of test table [sbtest]
  --oltp-table-size=N             number of records in test table [10000]
  --oltp-dist-type=STRING         random numbers distribution {uniform,gaussian,special} [special]
  --oltp-dist-iter=N              number of iterations used for numbers generation [12]
  --oltp-dist-pct=N               percentage of values to be treated as 'special' (for special distribution) [1]
  --oltp-dist-res=N               percentage of 'special' values to use (for special distribution) [75]

General database options:

  --db-driver=STRING  specifies database driver to use ('help' to get list of available drivers)
  --db-ps-mode=STRING prepared statements usage mode {auto, disable} [auto]


Compiled-in database drivers:
  mysql - MySQL driver
  pgsql - PostgreSQL driver

mysql options:
  --mysql-host=[LIST,...]       MySQL server host [localhost]
  --mysql-port=N                MySQL server port [3306]
  --mysql-socket=STRING         MySQL socket
  --mysql-user=STRING           MySQL user [sbtest]
  --mysql-password=STRING       MySQL password []
  --mysql-db=STRING             MySQL database name [sbtest]
  --mysql-table-engine=STRING   storage engine to use for the test table {myisam,innodb,bdb,heap,ndbcluster,federated} [innodb]
  --mysql-engine-trx=STRING     whether storage engine used is transactional or not {yes,no,auto} [auto]
  --mysql-ssl=[on|off]          use SSL connections, if available in the client library [off]
  --myisam-max-rows=N           max-rows parameter for MyISAM tables [1000000]
  --mysql-create-options=STRING additional options passed to CREATE TABLE []
```

### sysbench 测试结果中的一些指标

* read, write, other, total: 读、写、其他（除 SELECT, INSERT, UPDATE, DELETE 之外的操作）、总操作的次数
* transactions: 事务数（tps，每秒事务数）
* deadlock: 发生死锁数（每秒发生的死锁数）
* read/write requests: 读写总数，等于上述的 read+write（每秒执行的读写次数）
* other operations: 其他操作总数（每秒进行的其他操作总数）
* total time: 总耗时
* total number of events: 共发生多少事务数
* total time taken by event execution: 所有事务耗时相加

### 打算使用的参数

#### 准备时

* --oltp-tables-count
* --oltp-table-size
* --rand-init=on

#### 测试时

* --max-time
* --max-request
* --report-interval
* --oltp-read-only
* --num-threads
* --mysql-table-engine
* --oltp-skip-trx (做纯的 select 操作)

### 命令

* 准备
```
# sysbench --test=/usr/share/doc/sysbench/tests/db/oltp.lua --db-driver=mysql --mysql-host=10.0.0.4 --mysql-user=root --mysql-password=Eayun@2016 --num-threads=5 --oltp-table-size=1000000 --oltp-tables-count=5 prepare
```

### 其他一些乱七八糟的记录

* sysbench 中的 <code>--max-requests</code> 和 <code>--max-time</code> 参数，前者指请求多少次，后者指请求多长时间（即测试多长时间），二选一，如果两个都设置，那么哪个先执行完，就先停止；如果希望其中一个生效，可以把另一个设置为 0。
