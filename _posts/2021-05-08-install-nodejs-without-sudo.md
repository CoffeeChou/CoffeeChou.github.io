---
layout: post
title: 不使用 sudo 在 Debian 里安安装 Node.js
categories: ["技术"]
comments: true
---

最近在学习怎么使用 Appium，所以要安装 Node.js。

根据 Appium 的文档，不能通过 sudo 来安装 Node.js，不然会有问题。

我还是试了试，sudo 安装之后，npm 不能全局安装，会有权限问题。那好，不全局安装了，安装完之后没有 <code>appium</code> 命令。这应该也是可以解决的问题，不过我没有解决，就从头开始，乖乖按照文档的说明，想办法不用 sudo 来安装 Node.js 了，因为我感觉，还会在别的地方出现类似的权限问题...

好吧，最后找到了一个很通用的方法 -- 自己重新编译...

这里做个简单的记录吧，免得忘记了。

<!--more-->

1. 修改 PATH，把要安装 node.js 的路径写到 path 里：<code>vim .bashrc</code>
2. 写入的内容为：<code>export PATH="$HOME/local/bin:$PATH"</code>
3. 加载一下环境变量：<code>source .bashrc</code>
4. 创建 node.js 的安装目录，就是写到 path 里的目录：<code>mkdir local</code>
5. <code>mkdir node-latest-install</code>
6. <code>cd node-latest-install/</code>
7. 下载 node.js 的源码：<code>wget http://nodejs.org/dist/node-latest.tar.gz</code>
8. 解压：<code>tar xzf node-latest.tar.gz</code>
9. <code>cd node-v16.0.0/</code>
10. 加载配置，指定安装路径：<code>./configure --prefix=~/local/</code>
11. 漫长的编译过程（编译了一上午......）：<code>make install</code>
12. 验证是否安装成功：<code>node -v</code>
