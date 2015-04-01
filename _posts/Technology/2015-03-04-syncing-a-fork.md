---
layout: post
title: Github -- 同步一个上游的 Fork
category: 技术探讨
---

Fork 一个上游的项目，然后将 Fork 的项目 clone 到本地，使劲写。有一天突然发现，诶，上游更新了～那么问题来了，要把上游的更新内容同步到本地来。

所以找到了 [Fork a repo](https://help.github.com/articles/fork-a-repo/) 和 [Syncing a fork](https://help.github.com/articles/syncing-a-fork/)。

## 步骤如下

1. Fork 一个项目，只要在 github 上点击源项目的 fork 就行了，界面操作简单易懂。
1. 项目 Fork 过来后，clone 到本地。
1. 配置与源项目的同步：
  1. 切换到本地项目的目录，执行 `git remote -v`，输出如下内容：
    
        ```
        origin  https://github.com/YOUR_USERNAME/YOUR_FORK.git (fetch)
        origin  https://github.com/YOUR_USERNAME/YOUR_FORK.git (push)
        ```
    
  1. 把上游的仓库加进来：

        ```
        $ git remote add upstream https://github.com/ORIGINAL_OWNER/ORIGINAL_REPOSITORY.git
        ```
    
  1. 再执行一次 `git remote -v`，输出如下内容：

        ```
        origin  https://github.com/YOUR_USERNAME/YOUR_FORK.git (fetch)
        origin  https://github.com/YOUR_USERNAME/YOUR_FORK.git (push)
        upstream	https://github.com/ORIGINAL_OWNER/ORIGINAL_REPOSITORY.git (fetch)
        upstream	https://github.com/ORIGINAL_OWNER/ORIGINAL_REPOSITORY.git (push)
        ```
      * 这样，就配置好了，但是这个时候还没有同步，只是进行了同步的配置。

1. 进行同步。

  1. 切换到 `master` 分支：

        ```
        $ git checkout master
        Switched to branch 'master'
        ```

  1. 获取上游分支：

        ```
        $ git fetch upstream
        ```

  1. 合并上游的 `master` 分支到本地的 `master` 分支上：

        ```
        $ git merge upstream/master
        Updating 34e91da..16c56ad
        Fast-forward
        README.md                 |    5 +++--
        1 file changed, 3 insertions(+), 2 deletions(-)
        ```

1. 合并后，使用命令 `git status`，可以看到如下信息：

      ```
      位于分支 master
      您的分支领先 'origin/master' 共 8 个提交。
        （使用 "git push" 来发布您的本地提交）
      无文件要提交，干净的工作区
      ```

1. 用 `git push` 把从上游 merge 到本地的新代码 push 到自己的 master 分支上：

      ```
      Counting objects: 45, done.
      Delta compression using up to 4 threads.
      Compressing objects: 100% (30/30), done.
      Writing objects: 100% (31/31), 3.67 KiB | 0 bytes/s, done.
      Total 31 (delta 12), reused 0 (delta 0)
      To https://github.com/OUR_USERNAME/YOUR_FORK.git
         226e4dc..61a1fc6  master -> master
      ```


* 这次是真的大功告成了～
