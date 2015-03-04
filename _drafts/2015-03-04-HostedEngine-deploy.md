---
layout: post
title: Hosted Engine 的部署和遇到的一些问题
---

将以前的博客搬运过来 ;-)

此文时间：2014 年 10 月 8 日

## 环境


* 作为主机的机器：使用 CentOS 7
* 作为engine的虚拟机：使用CentOS 6.5
* 存储：使用iSCSI


## 部署前的准备

### 配置epel

目前 CentOS 7 上默认没有配置 epel 的源，有些 rpm 包会找不到，所以要加入 epel 源。

1. 更新系统的包

  为了能使部署正常执行，系统的包需要更新到最新，使用命令：

  ```
# yum -y update
  ```

1. 设定好 engine 虚拟机的 ip

  虚拟机的 ip 要提前定好，并将对应的ip和域名写到主机的`/etc/hosts`中（因为 Hosted-Engine 中，和 engine 虚拟机的交互使用的是 FQDN）

1. 虚拟机的系统安装镜像

  在部署 hosted engine 过程中，会询问虚拟机系统安装镜像的位置（默认是 none），需要保存一个安装镜像到主机的某个目录下，然后填写这个镜像的目录

  > **注意**:
  >
  >在部署 hosted engine 过程中，配置网桥时，网络可能会断开，然后重启，有可能导致远程ssh连接中断，安装过程也会中断。如果可以，直接在主机上操作是最佳选择。
部署

1. 配置 ovirt-3.5 的源

  ```
# yum install http://resources.ovirt.org/pub/yum-repo/ovirt-release35.rpm
  ```

1. 安装 ovirt-hosted-engine-setup 的包

  ```
# yum install ovirt-hosted-engine-setup
  ```

### 部署 hosted engine

1. 执行：`ovirt-hosted-engine-setup` 或者：`hosted-engine --deploy`


  ```
[root@hosted-engine-iscsi ~ ]@ .@  ovirt-hosted-engine-setup 
[ INFO  ] Stage: Initializing
          Continuing will configure this host for serving as hypervisor and create a VM where you have to install oVirt Engine afterwards.
          Are you sure you want to continue? (Yes, No)[Yes]: 
          It has been detected that this program is executed through an SSH connection without using screen.
          Continuing with the installation may lead to broken installation if the network connection fails.
          It is highly recommended to abort the installation and run it inside a screen session using command "screen".
          Do you want to continue anyway? (Yes, No)[No]: yes
[ INFO  ] Generating a temporary VNC password.
[ INFO  ] Stage: Environment setup
          Configuration files: []
          Log file: /var/log/ovirt-hosted-engine-setup/ovirt-hosted-engine-setup-20140928190119-cerf4u.log
          Version: otopi-1.3.0_master (otopi-1.3.0-0.0.master.20140911.git7c7d631.el7.centos)
[ INFO  ] Hardware supports virtualization
[ INFO  ] Stage: Environment packages setup
[ INFO  ] Stage: Programs detection
[ INFO  ] Stage: Environment setup
[ INFO  ] Waiting for VDSM hardware info
[ INFO  ] Generating libvirt-spice certificates
[ INFO  ] Stage: Environment customization

          --== STORAGE CONFIGURATION ==--

          During customization use CTRL-D to abort.
          Please specify the storage you would like to use (iscsi, nfs3, nfs4)[nfs3]: iscsi  #选择存储类型
          Please specify the iSCSI portal IP address: 192.168.3.221
          Please specify the iSCSI portal port [3260]: 
          Please specify the iSCSI portal user: 
          Please specify the target name (iqn.2014-09-28.iscsi.com:server.target0) [iqn.2014-09-28.iscsi.com:server.target0]: 
[ INFO  ] Discovering iSCSI node
[ INFO  ] Connecting to the storage server
          The following luns have been found on the requested target:
               1 - sdc - 40000MB
               2 - sdd - 40000MB
               3 - sde - 40000MB
               4 - sdf - 40000MB
               5 - sdg - 40000MB
               6 - sdh - 40000MB
               7 - sdi - 40000MB
          Please specify the lun id (1, 2, 3, 4, 5, 6, 7) [1]: 
[ INFO  ] Installing on first host
          Please provide storage domain name. [hosted_storage]: storage-iscsi
          Local storage datacenter name is an internal name and currently will not be shown in engine's admin UI.Please enter local datacenter name [hosted_datacenter]: hosted-engine-DC  #这个数据中心不会显示在web上，而虚拟机属于这个数据中心

          --== SYSTEM CONFIGURATION ==--


          --== NETWORK CONFIGURATION ==--

          Please indicate a nic to set ovirtmgmt bridge on: (enp1s0f1, enp1s0f0) [enp1s0f1]: enp1s0f0
          iptables was detected on your computer, do you wish setup to configure it? (Yes, No)[Yes]:    
          Please indicate a pingable gateway IP address [192.168.0.1]: 

          --== VM CONFIGURATION ==--

          Please specify the device to boot the VM from (cdrom, disk, pxe) [cdrom]:   #选择cdrom，使用的是iso镜像；选择disk，选择的是ova镜像
          The following CPU types are supported by this host:
               - model_SandyBridge: Intel SandyBridge Family
               - model_Westmere: Intel Westmere Family
               - model_Nehalem: Intel Nehalem Family
               - model_Penryn: Intel Penryn Family
               - model_Conroe: Intel Conroe Family
          Please specify the CPU type to be used by the VM [model_SandyBridge]: 
          Please specify path to installation media you would like to use [None]: /tmp/CentOS-6.5-x86_64-bin-DVD1.iso  #就是之前放在主机某个目录下
          Please specify the number of virtual CPUs for the VM [Defaults to minimum requirement: 2]: 
          Please specify the disk size of the VM in GB [Defaults to minimum requirement: 25]: 
          You may specify a unicast MAC address for the VM or accept a randomly generated default [00:16:3e:3d:ca:30]: 
          Please specify the memory size of the VM in MB [Defaults to minimum requirement: 4096]: 
          Please specify the console type you would like to use to connect to the VM (vnc, spice) [vnc]: 

          --== HOSTED ENGINE CONFIGURATION ==--

          Enter the name which will be used to identify this host inside the Administrator Portal [hosted_engine_1]: hosted-engine-iscsi  #主机的名称
          Enter 'admin@internal' user password that will be used for accessing the Administrator Portal: #管理端的密码，要与虚拟机配置时密码一致
          Confirm 'admin@internal' user password: 
          Please provide the FQDN for the engine you would like to use.
          This needs to match the FQDN that you will use for the engine installation within the VM.
          Note: This will be the FQDN of the VM you are now going to create,
          it should not point to the base host or to any other existing machine.
          Engine FQDN: hosted-engine-iscsi.yanran.eayunos.eayun.com  #事先在/etc/hosts写好的域名，主机和engine的通信是通过域名了进行的，所以不能写错
[WARNING] Failed to resolve hosted-engine-iscsi.yanran.eayunos.eayun.com using DNS, it can be resolved only locally
          Please provide the name of the SMTP server through which we will send notifications [localhost]: 
          Please provide the TCP port number of the SMTP server [25]: 
          Please provide the email address from which notifications will be sent [root@localhost]: 
          Please provide a comma-separated list of email addresses which will get notifications [root@localhost]: 
[ INFO  ] Stage: Setup validation

          --== CONFIGURATION PREVIEW ==--  #对配置的一个预览

          Bridge interface                   : enp1s0f0
          Engine FQDN                        : hosted-engine-iscsi.yanran.eayunos.eayun.com
          Bridge name                        : ovirtmgmt
          SSH daemon port                    : 22
          Firewall manager                   : iptables
          Gateway address                    : 192.168.0.1
          Host name for web application      : hosted-engine-iscsi
          iSCSI Target Name                  : iqn.2014-09-28.iscsi.com:server.target0
          iSCSI Portal port                  : 3260
          Host ID                            : 1
          iSCSI LUN ID                       : 1
          Image size GB                      : 25
          iSCSI Portal IP Address            : 192.168.3.221
          iSCSI Portal user                  : 
          Console type                       : vnc
          Memory size MB                     : 4096
          MAC address                        : 00:16:3e:3d:ca:30
          Boot type                          : cdrom
          Number of CPUs                     : 2
          ISO image (for cdrom boot)         : /tmp/CentOS-6.5-x86_64-bin-DVD1.iso
          CPU Type                           : model_SandyBridge

          Please confirm installation settings (Yes, No)[Yes]: 
[ INFO  ] Generating answer file '/etc/ovirt-hosted-engine/answers.conf'
[ INFO  ] Stage: Transaction setup
[ INFO  ] Stage: Misc configuration
[ INFO  ] Stage: Package installation
[ INFO  ] Stage: Misc configuration
[ INFO  ] Configuring libvirt
[ INFO  ] Configuring VDSM
[ INFO  ] Starting vdsmd
[ INFO  ] Waiting for VDSM hardware info
[ INFO  ] Configuring the management bridge
[ INFO  ] Creating Volume Group
[ INFO  ] Creating Storage Domain
[ INFO  ] Creating Storage Pool
[ INFO  ] Connecting Storage Pool
[ INFO  ] Verifying sanlock lockspace initialization
[ INFO  ] Creating VM Image
[ INFO  ] Disconnecting Storage Pool
[ INFO  ] Start monitoring domain
[ INFO  ] Configuring VM
[ INFO  ] Updating hosted-engine configuration
[ INFO  ] Stage: Transaction commit
[ INFO  ] Stage: Closing up
[ INFO  ] Creating VM  #创建虚拟机，给虚拟机安装操作系统
          You can now connect to the VM with the following command:
              /bin/remote-viewer vnc://localhost:5900  #在本地终端上运行这个命令，以打开控制台，为虚拟机安装操作系统，当然了，localhost要改成主机的ip
          Use temporary password "8474yKhl" to connect to vnc console.  #打开控制台所使用的密码，可以通过hosted-engine --add-console-password修改密码
          Please note that in order to use remote-viewer you need to be able to run graphical applications.
          This means that if you are using ssh you have to supply the -Y flag (enables trusted X11 forwarding).
          Otherwise you can run the command from a terminal in your preferred desktop environment.
          If you cannot run graphical applications you can connect to the graphic console from another host or connect to the console using the following command:
          virsh -c qemu+tls://Test/system console HostedEngine
          If you need to reboot the VM you will need to start it manually using the command:
          hosted-engine --vm-start  #手动启动虚拟机的命令
          You can then set a temporary password using the command:
          hosted-engine --add-console-password  #修改控制台密码的命令
          The VM has been started.  Install the OS and shut down or reboot it.  To continue please make a selection:

          (1) Continue setup - VM installation is complete
          (2) Reboot the VM and restart installation
          (3) Abort setup

          (1, 2, 3)[1]:
  ```


1. 虚拟机安装操作系统

  此时，hosted engine 的部署会停留在这个地方，等待虚拟机的操作系统安装完成：


  ```
          Waiting for VM to shut down...
[ INFO  ] Creating VM  #操作系统完成以后，会重新启动一下这个虚拟机，以安装engine
          You can now connect to the VM with the following command:
              /bin/remote-viewer vnc://localhost:5900
          Use temporary password "8474yKhl" to connect to vnc console.
          Please note that in order to use remote-viewer you need to be able to run graphical applications.
          This means that if you are using ssh you have to supply the -Y flag (enables trusted X11 forwarding).
          Otherwise you can run the command from a terminal in your preferred desktop environment.
          If you cannot run graphical applications you can connect to the graphic console from another host or connect to the console using the following command:
          virsh -c qemu+tls://Test/system console HostedEngine
          If you need to reboot the VM you will need to start it manually using the command:
          hosted-engine --vm-start
          You can then set a temporary password using the command:
          hosted-engine --add-console-password
          Please install and setup the engine in the VM.
          You may also be interested in installing ovirt-guest-agent-common package in the VM.
          To continue make a selection from the options below:
          (1) Continue setup - engine installation is complete
          (2) Power off and restart the VM
          (3) Abort setup

          (1, 2, 3)[1]:
  ```


1. 虚拟机部署 engine

  此时，hosted engine 的部署会停留在这里，等待虚拟机部署完成engine：

  engine 是否是 up 的状态（通过 fqdn 来检查）

  正常情况下，确认以后会进行如下操作：


  ```
[ INFO  ] Engine replied: DB Up!Welcome to Health Status!
        Enter the name of the cluster to which you want to add the host (Default) [Default]: 
[ INFO  ] Waiting for the host to become operational in the engine. This may take several minutes...  #把自己加入到default数据中心里，即engine的环境中
[ INFO  ] Still waiting for VDSM host to become operational...
[ INFO  ] Still waiting for VDSM host to become operational...
[ INFO  ] The VDSM Host is now operational
        Please shutdown the VM allowing the system to launch it as a monitored service.
        The system will wait until the VM is down.
[ INFO  ] Enabling and starting HA services
        Hosted Engine successfully set up
[ INFO  ] Stage: Clean up
[ INFO  ] Stage: Pre-termination
[ INFO  ] Stage: Termination
部署engine虚拟机的过程：
[root@engine-vm ~]# engine-setup 
[ INFO  ] Stage: Initializing
[ INFO  ] Stage: Environment setup
          Configuration files: ['/etc/ovirt-engine-setup.conf.d/10-packaging-jboss.conf', '/etc/ovirt-engine-setup.conf.d/10-packaging.conf']
          Log file: /var/log/ovirt-engine/setup/ovirt-engine-setup-20140928200657-kqu1qy.log
          Version: otopi-1.3.0_master (otopi-1.3.0-0.0.master.20140911.git7c7d631.el6)
[ INFO  ] Stage: Environment packages setup
[ INFO  ] Yum Downloading: repomdQDWLtatmp.xml (0%)
[ INFO  ] Stage: Programs detection
[ INFO  ] Stage: Environment setup
[ INFO  ] Stage: Environment customization

          --== PRODUCT OPTIONS ==--

          Configure Engine on this host (Yes, No) [Yes]: 
          Configure WebSocket Proxy on this host (Yes, No) [Yes]: 

          --== PACKAGES ==--

[ INFO  ] Checking for product updates...
[ INFO  ] No product updates found

          --== ALL IN ONE CONFIGURATION ==--


          --== NETWORK CONFIGURATION ==--

          Setup can automatically configure the firewall on this system.
          Note: automatic configuration of the firewall may overwrite current settings.
          Do you want Setup to configure the firewall? (Yes, No) [Yes]: 
          The following firewall managers were detected on this system: iptables
          Firewall manager to configure (iptables): 
[ ERROR ] Invalid value
          Firewall manager to configure (iptables): iptables
[ INFO  ] iptables will be configured as firewall manager.
          Host fully qualified DNS name of this server [engine-vm]:   #在部署过程中，与主机上一样，需要在/etc/hosts写入域名解析，然后填写在这里
[WARNING] Host name engine-vm has no domain suffix
[ ERROR ] Host name is not valid: engine-vm did not resolve into an IP address
          Host fully qualified DNS name of this server [engine-vm]: hosted-engine-iscsi.yanran.eayunos.eayun.com
[WARNING] Failed to resolve hosted-engine-iscsi.yanran.eayunos.eayun.com using DNS, it can be resolved only locally

          --== DATABASE CONFIGURATION ==--

          Where is the Engine database located? (Local, Remote) [Local]: 
          Setup can configure the local postgresql server automatically for the engine to run. This may conflict with existing applications.
          Would you like Setup to automatically configure postgresql and create Engine database, or prefer to perform that manually? (Automatic, Manual) [Automatic]: 

          --== OVIRT ENGINE CONFIGURATION ==--

          Engine admin password: 
          Confirm engine admin password: 
          Application mode (Both, Virt, Gluster) [Both]: 

          --== PKI CONFIGURATION ==--

          Organization name for certificate [yanran.eayunos.eayun.com]: 

          --== APACHE CONFIGURATION ==--

          Setup can configure the default page of the web server to present the application home page. This may conflict with existing applications.
          Do you wish to set the application as the default page of the web server? (Yes, No) [Yes]: 
          Setup can configure apache to use SSL using a certificate issued from the internal CA.
          Do you wish Setup to configure that, or prefer to perform that manually? (Automatic, Manual) [Automatic]: 

          --== SYSTEM CONFIGURATION ==--

          Configure an NFS share on this server to be used as an ISO Domain? (Yes, No) [Yes]: 
          Local ISO domain path [/var/lib/exports/iso]: 
          Local ISO domain ACL - note that the default will restrict access to hosted-engine-iscsi.yanran.eayunos.eayun.com only, for security reasons [hosted-engine-iscsi.yanran.eayunos.eayun.com(rw)]: *(rw)
          Local ISO domain name [ISO_DOMAIN]: 

          --== MISC CONFIGURATION ==--


          --== END OF CONFIGURATION ==--

[ INFO  ] Stage: Setup validation
[WARNING] Cannot validate host name settings, reason: cannot resolve own name 'engine-vm'
[WARNING] Less than 16384MB of memory is available

          --== CONFIGURATION PREVIEW ==--

          Application mode                        : both
          Datacenter storage type                 : False
          Firewall manager                        : iptables
          Update Firewall                         : True
          Host FQDN                               : hosted-engine-iscsi.yanran.eayunos.eayun.com
          Engine database name                    : engine
          Engine database secured connection      : False
          Engine database host                    : localhost
          Engine database user name               : engine
          Engine database host name validation    : False
          Engine database port                    : 5432
          Engine installation                     : True
          NFS setup                               : True
          PKI organization                        : yanran.eayunos.eayun.com
          NFS mount point                         : /var/lib/exports/iso
          NFS export ACL                          : *(rw)
          Configure local Engine database         : True
          Set application as default page         : True
          Configure Apache SSL                    : True
          Configure WebSocket Proxy               : True

          Please confirm installation settings (OK, Cancel) [OK]: 
[ INFO  ] Stage: Transaction setup
[ INFO  ] Stopping engine service
[ INFO  ] Stopping ovirt-fence-kdump-listener service
[ INFO  ] Stopping websocket-proxy service
[ INFO  ] Stage: Misc configuration
[ INFO  ] Stage: Package installation
[ INFO  ] Stage: Misc configuration
[ INFO  ] Initializing PostgreSQL
[ INFO  ] Creating PostgreSQL 'engine' database
[ INFO  ] Configuring PostgreSQL
[ INFO  ] Creating/refreshing Engine database schema
[ INFO  ] Creating CA
[ INFO  ] Configuring WebSocket Proxy
[ INFO  ] Generating post install configuration file '/etc/ovirt-engine-setup.conf.d/20-setup-ovirt-post.conf'
[ INFO  ] Stage: Transaction commit
[ INFO  ] Stage: Closing up

          --== SUMMARY ==--

[WARNING] Less than 16384MB of memory is available
          SSH fingerprint: 0D:6B:7C:9C:A2:77:C7:10:A0:6D:BA:F6:3D:F6:13:A6
          Internal CA 87:E4:55:4E:BB:6D:A0:50:42:B1:8F:08:C6:93:C9:CE:0E:BF:CE:BF
          Web access is enabled at:
              http://hosted-engine-iscsi.yanran.eayunos.eayun.com:80/ovirt-engine
              https://hosted-engine-iscsi.yanran.eayunos.eayun.com:443/ovirt-engine
          Please use the user "admin" and password specified in order to login

          --== END OF SUMMARY ==--

[ INFO  ] Starting engine service
[ INFO  ] Restarting httpd
[ INFO  ] Restarting nfs services
[ INFO  ] Stage: Clean up
          Log file is located at /var/log/ovirt-engine/setup/ovirt-engine-setup-20140928200657-kqu1qy.log
[ INFO  ] Generating answer file '/var/lib/ovirt-engine/setup/answers/20140928201306-setup.conf'
[ INFO  ] Stage: Pre-termination
[ INFO  ] Stage: Termination
[ INFO  ] Execution of setup completed successfully
  ```



## 一些问题

### 网络问题

  在配置网络过程中，用另一台机器去 ping 这个 ip，一直保持畅通的状态，也就是，配置网络桥接其实是一个很快的过程，不一定导致 ssh 中断

  原因：没有加网关，是个 bug

  * 笔者注：距离本文已有一段时间，该 bug 已经修复。

### 重新部署的问题

  在 Hosted Engine 中没有看到类似于 engine 中的 engine-cleanup 命令，即无法回滚部署。

  当创建了虚拟机以后，如果部署中断，需要重新部署时，会提示虚拟机已经存在，无法开始部署。

  遇到这个问题，解决办法为：

  * 确认下虚拟机的状态：hosted-engine —vm-start -> 因为部署中断，虚拟机是一个空的虚拟机，hosted engine连接不上虚拟机，无法使用 status 查询，但是使用 start，提示信息为：VM exists and its status is Up 证明虚拟机已经存在，并且已经启动。
  * 销毁这个虚拟机：hosted-engine —vm-poweroff -> 关闭电源，提示信息为：Machine destroyed，由于是一个空的虚拟机，关闭电源以后也就被销毁了。
  * 重新部署：`ovirt-hosted-engine-setup` 或 `hosted-engine --deploy`


### 虚拟机的问题

  虽然网络中断导致了 ssh 的中断，继而部署中断，但是虚拟机其实已经创建（在/var/log/ovirt-hosted-engine-setup/ovirt-hosted-engine-setup-xxx里会看到，其实已经有提示信息，只是因为中断了而没有出现）

  这时可以使用 vnc 打开这个虚拟机，安装系统。

  但是安装完系统以后，有个重启的操作，此时虚拟机是无法重启的。

  * 原因分析
  
    * 正常情况下，部署过程会停留，并等待虚拟机安装完操作系统，有个确认的操作。
    * 部署中断后，虚拟机虽然安装成功，但是安装的信息没有写入部署过程中（部署的 answer 文件）中，所以无法重启这个虚拟机。


### 启动设备选项

  ISO image (for cdrom boot)

  OVF archive (for disk boot)


### engine虚拟机的归属

  在部署 hosted-engine的过程中，有这样一句话：`Local storage datacenter name is an internal name and currently will not be shown in engine’s admin UI.`

  * 这个数据中心是不会显示在 web 管理端上的，而之前填写的用于启动虚拟机的存储域正属于会这个数据中心，所以这个数据中心以及存储都不会在web界面上显示。

  运行engine的虚拟机会被加入到自己的 default 集群里，但是它仅仅是放在 default 集群里，而不受到 default 集群的控制，也看不到磁盘、网卡之类的信息。


### 部署中断的问题

1. 手动中断

  在部署过程中，对虚拟机的状态有两次确认

  * 第一次确认虚拟机是否已经安装完系统
  * 第二次确认虚拟机是否已经安装完 engine

    * 如果在第一次确认过程中断了，那么虚拟机的安装信息不能写入到 answer 文件中，虚拟机处于不良状态，会重启失败：重启时提示没有可启动的设备。
    * 如果在第二次确认过程中断了，那么虚拟机配置了 engine 的信息无法传递给主机，主机也不能把自己加入到虚拟机engine的环境中。但是环境可以搭建起来，环境搭建起来后，可以看到这个环境中是没有主机，也没有虚拟机的。

1. 尝试手动加入主机

  1. 关闭防火墙以及firewalld服务，添加主机。

    如果主机 install 进行途中，虚拟机 pause，使用命令 hosted-engine —vm-start 无法启动虚拟机，需要：

    1. hosted-engine --vm-poweroff
    1. hosted-engine --vvm-start

  1. 虚拟机启动，engine正常运行，打开web界面看到主机已经成功加入。


### 域名解析错误 FQDN

  在部署过程中，host 通过 FQDN 来和 engine 的虚拟机通信，所以 FQDN 需要配置正确

  如果配置不正确，会出现以下情况：


  ```
[ ERROR ] Failed to execute stage 'Closing up': The host name "hosted-engine-test-vm" contained in the URL doesn't match any of the names in the server certificate.
[ INFO  ] Stage: Clean up
[ INFO  ] Generating answer file '/etc/ovirt-hosted-engine/answers.conf'
[ INFO  ] Answer file '/etc/ovirt-hosted-engine/answers.conf' has been updated
[ INFO  ] Stage: Pre-termination
[ INFO  ] Stage: Termination
  ```


  由于所写的主机名和 engine 虚拟机配置的主机名不匹配，部署中断。

  这已经是部署的最后阶段，也就是 host 把自己加入 engine 环境的阶段，由于中断，host 没有成功加入环境中。

  但是 engine 环境已经搭建起来，可以通过 web 打开页面。

  可以手动将 host 加入到环境中，新建主机成功后，主机激活，此时看到 engine 虚拟机被自动加入到环境中，并运行在主机上。


### 主机和虚拟机上配置的密码不一致

  在 hosted engine 部署过程中，需要在主机上填写管理门户的密码，并且在虚拟机部署 engine 过程中也要填写管理门户的密码。

  两次填写密码要一致，原因如下：

  * 虽然过程是分开独立的，但是实际上它们又是关联的。
  * 虚拟机上填写的密码是真正的管理门户的密码，而主机上填写的密码只是要告诉主机，管理门户的密码是什么。

  当主机和虚拟机上的密码不一致时，部署中断，环境已经搭建起来，但是由于告诉主机的密码是错误的密码，主机无法访问到 engine 环境，所以也就不能把自己加入到环境中，提示如下：

  ```
[ ERROR ] Cannot automatically add the host to cluster None: HTTP Status 401 
[ ERROR ] Failed to execute stage 'Closing up': Cannot add the host to cluster None
[ INFO  ] Stage: Clean up
[ INFO  ] Generating answer file '/etc/ovirt-hosted-engine/answers.conf'
[ INFO  ] Answer file '/etc/ovirt-hosted-engine/answers.conf' has been updated
[ INFO  ] Stage: Pre-termination
[ INFO  ] Stage: Termination
  ```

  通过检查日志，确认 401 错误，也就是用户名密码不一致的问题。

  可以通过浏览器打开管理门户，手动添加主机，添加成功后，engine 环境会自动把 engine 虚拟机加入到环境中。


### 中断后添加主机

  中断后添加 hosted engine 的主机后，会自动加入 engine 虚拟机，即 HostedEngine。

  如果在 engine 环境中没有任何主机的情况下，添加一台额外的主机，会发生什么？

  主机可以正常添加成功

