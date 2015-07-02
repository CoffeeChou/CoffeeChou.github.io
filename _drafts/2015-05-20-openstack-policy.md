---
layout: post
title: 从测试者的角度玩 OpenStack 的权限控制
category: 技术探讨
keywords: OpenStack, policy
---

在 OpenStack 的 Keystone 身份认证服务中，可以定义 role，为用户分配不同的角色。

而 keystone 没有提供相关的命令行来定义一个 role 拥有什么权限的，看了相关[文档](http://docs.openstack.org/admin-guide-cloud/content/keystone-user-management.html) 后，对此进行了一些测试和研究，总结如下。

## 如何控制

OpenStack 的权限控制通过配置文件 policy.json 来实现。

对于比较熟悉 OpenStack 的读者已经知道，OpenStack 里有 tenant(租户)、user(用户) 和 role(角色) 的概念。

* **tenant**: 即 *project*，相当于一个组织或一个项目。当请求 OpenStack 服务时，必须指定一个 project。
* **user**: 即项目中的真正的用户。可以将一个用户添加到多个项目中，一个项目也可以包含多个用户。
* **role**: 即项目中的角色。将用户添加到项目中时，需要指定该用户的角色，也就定义了这个用户在项目里的权限。

一个用户在一个项目里，可以有不同的角色。同时，用户在不同项目里也可以分配不同的角色。

例如：

```
用户 *user1* 在项目 *tenant1* 中分配了角色 *role1*，同时，他被添加到项目 *tenant2* 中，分配 *role2*, *role3* 的角色。

那么，这个用户在 tenant1 中的角色是 role1，在 tenant2 中的角色是 role2 和 role3。
```

> #### 注：
> OpenStack 与 oVirt 不同：
>
> * oVirt 中，只有一个拥有最高权限的 admin 管理员，是搭建环境后内部创建的用户，是唯一的，并且拥有最高权限。
> * OpenStack 中，搭建环境后，创建了一个 admin 角色。可以为用户分配 admin 角色，所有被分配 admin 角色的用户都拥有相同的权限，不是唯一的。

角色的分配可以通过命令行或在 dashboard 上进行。而角色的权限需要通过配置文件实现。

这个配置文件为 `/etc/[SERVICE_CODENAME]/policy.json`。

```
# find /etc -name *policy.json
  /etc/keystone/policy.json
  /etc/openstack-dashboard/glance_policy.json
  /etc/openstack-dashboard/cinder_policy.json
  /etc/openstack-dashboard/keystone_policy.json
  /etc/openstack-dashboard/heat_policy.json
  /etc/openstack-dashboard/neutron_policy.json
  /etc/openstack-dashboard/nova_policy.json
  /etc/nova/policy.json
  /etc/heat/policy.json
  /etc/ceilometer/policy.json
  /etc/cinder/policy.json
  /etc/neutron/policy.json
  /etc/glance/policy.json
```

下面以 `/etc/nova/policy.json` 来作简单说明。

## 设置示例说明

默认的配置文件为：

```
# cat /etc/nova/policy.json
  {
      "context_is_admin":  "role:admin",
      "admin_or_owner":  "is_admin:True or project_id:%(project_id)s",
      "default": "rule:admin_or_owner",
  
      "cells_scheduler_filter:TargetCellFilter": "is_admin:True",
  
      "compute:create": "",
      "compute:create:attach_network": "",
      "compute:create:attach_volume": "",
      "compute:create:forced_host": "is_admin:True",
      "compute:get_all": "",
      "compute:get_all_tenants": "",
      "compute:start": "rule:admin_or_owner",
      "compute:stop": "rule:admin_or_owner",
      "compute:unlock_override": "rule:admin_api",
  
      "compute:shelve": "",
      "compute:shelve_offload": "",
      "compute:unshelve": "",
  
      "compute:volume_snapshot_create": "",
      "compute:volume_snapshot_delete": "",
  
      ... ...
  
      "volume:create": "",
      "volume:get_all": "",
      "volume:get_volume_metadata": "",
      "volume:get_snapshot": "",
      "volume:get_all_snapshots": "",
  
  
      "volume_extension:types_manage": "rule:admin_api",
      "volume_extension:types_extra_specs": "rule:admin_api",
      "volume_extension:volume_admin_actions:reset_status": "rule:admin_api",
      "volume_extension:snapshot_admin_actions:reset_status": "rule:admin_api",
      "volume_extension:volume_admin_actions:force_delete": "rule:admin_api",
  
      ... ...
  }

```

* 一般，配置文件的规则是 `"actions": "role"`。
* 在文件的开头处，有以下内容：

    ```
    "context_is_admin":  "role:admin",                                # admin 角色可执行
    "admin_or_owner":  "is_admin:True or project_id:%(project_id)s",  # admin 或 project owner 可执行
    "default": "rule:admin_or_owner",                                 # 默认
    ```
    并不是对应的 `"actions": "role"`，这相当于定义(或配置)了一些对象，这些对象包含所定义的角色，即 `"object": "rule"`。

    而在下面的配置中，就可以使用 `"actions": "rule:object"` 的方式去定义规则，如：

    ```
    "compute:start": "rule:admin_or_owner",
    "compute:stop": "rule:admin_or_owner",
    "compute:unlock_override": "rule:admin_api",
    ```
* 若规则设置为空，则所有用户均可执行该操作。


## 测试

### 操作步骤

1. 创建角色 "test\_role"：

    ```
# keystone role-create --name test_role
+----------+----------------------------------+
| Property |              Value               |
+----------+----------------------------------+
|    id    | 966c7bf2a5de449d9fe86bd7a4cf7056 |
|   name   |            test_role             |
+----------+----------------------------------+
    ```
1. 创建 3 个用户 "test\_member", "test\_admin", "test\_role"；

    ```
# keystone user-create --name test_member --pass abc123
+----------+----------------------------------+
| Property |              Value               |
+----------+----------------------------------+
|  email   |                                  |
| enabled  |               True               |
|    id    | fa9a271d8fa94a3ca56d761689fef037 |
|   name   |           test_member            |
| username |           test_member            |
+----------+----------------------------------+
[root@node-1 ~]# keystone user-create --name test_role --pass abc123
+----------+----------------------------------+
| Property |              Value               |
+----------+----------------------------------+
|  email   |                                  |
| enabled  |               True               |
|    id    | bb5487cbc0f94894b09704fc3aad23c8 |
|   name   |            test_role             |
| username |            test_role             |
+----------+----------------------------------+
[root@node-1 ~]# keystone user-create --name test_admin --pass abc123
+----------+----------------------------------+
| Property |              Value               |
+----------+----------------------------------+
|  email   |                                  |
| enabled  |               True               |
|    id    | b4d4d7b7080f4550903c49c85eff747b |
|   name   |            test_admin            |
| username |            test_admin            |
+----------+----------------------------------+
    ```
1. 创建项目 "test\_project"：

    ```
# keystone tenant-create --name test_project
+-------------+----------------------------------+
|   Property  |              Value               |
+-------------+----------------------------------+
| description |                                  |
|   enabled   |               True               |
|      id     | d2058c82eb83413c871ac01c0a7709a8 |
|     name    |           test_project           |
+-------------+----------------------------------+
    ```
1. 修改配置文件 `/etc/nova/policy.json`，定义一个角色：

    ```
    "super_admin": "is_admin:True and project_id:%(project_id)"  # 把 %(project_id) 替换为 admin 租户的 id
    ```
1. 修改配置文件 `/etc/nova/policy.json`，定义一些规则：

    ```
    "compute:create": "role:admin",
    ... ...
    "volume:create": "rule:super_admin or role:test_role",
    ... ...
    ```
1. 保存配置文件，并重启**所有控制节点**的 nova 相关的服务；
1. 将用户 "test\_member", "test_role" 和 "test\_admin" 添加到 "test\_project" 租户(项目)中：为 "test\_member" 分配 "\_member\_" 角色，为 "test\_role" 分配 "test\_role" 角色，为 "test\_admin" 分配 "admin" 角色；
1. 尝试以 "test\_member" 用户创建实例和卷；
1. 尝试以 "test\_role" 用户创建实例和卷；
1. 尝试以 "test\_admin" 用户创建实例和卷；
1. 尝试以 "admin" 用户创建实例和卷；

> #### 注：
> * "admin" 用户是用 fuel 部署后默认创建的用户，属于 admin 租户，具有 admin 角色权限；
> * "\_member\_" 角色是 fuel 部署后默认创建的角色；

### 预期结果

* 只有 `test_role` 角色和 `admin` 角色可以创建实例
* 只有 `admin 租户里的 admin 角色` 和拥有 `test_role` 角色的用户才能创建卷
  * "test\_member" 用户不能创建实例，也不能创建卷；
  * "test\_admin" 用户可以创建实例，但不能创建卷；
  * "test\_role" 用户不能创建实例，但能创建卷；
  * "admin" 用户能创建实例，也可以创建卷；


> 测完记得把环境**改回去喔**~
