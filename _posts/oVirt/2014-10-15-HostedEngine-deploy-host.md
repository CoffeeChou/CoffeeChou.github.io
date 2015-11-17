---
layout: post
title: 部署 Hosted-Engine 的主机
tag: oVirt
keywords: oVirt, Hosted Engine
---

## 部署 Hosted-Engine的主机

  要实现 engine 虚拟机的 HA，至少需要两台物理机来实现 engine 虚拟机的迁移。

  在 Hosted Engine 的 engine 部署过程中，是在某一台主机上填写一个存储路径，并启动一台虚拟机，而部署完成时，这台主机就作为 engine 环境中的第一台 hosted-engine 的主机而加入其中。

  当部署完成后，需要部署第二台 hosted engine 的主机。

1. 写好主机域名解析，与第一台主机部署相同，需要通过 FQDN 来通信。

1. 在这台主机上同样要安装 `ovirt-hosted-engine-setup`。

1. 执行 `ovirt-hosted-engine-setup` 或者 `hosted-engine --deploy` 命令。

1. 部署完成之后，会看到这台主机被加入到 engine 的环境中。

    部署过程的交互信息如下：


    ```
    [root@vm-centos7 ~]# ovirt-hosted-engine-setup 
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
              Log file: /var/log/ovirt-hosted-engine-setup/ovirt-hosted-engine-setup-20141014224835-qyc9tu.log
              Version: otopi-1.3.0_master (otopi-1.3.0-0.0.master.20140911.git7c7d631.el7.centos)
    [ INFO  ] Hardware supports virtualization
    [ INFO  ] Bridge ovirtmgmt already created
    [ INFO  ] Stage: Environment packages setup
    [ INFO  ] Stage: Programs detection
    [ INFO  ] Stage: Environment setup
    [ INFO  ] Stage: Environment customization
    
              --== STORAGE CONFIGURATION ==--
    
              During customization use CTRL-D to abort.
              Please specify the storage you would like to use (iscsi, nfs3, nfs4)[nfs3]: 
              Please specify the full shared storage connection path to use (example: host:/path): 192.168.3.221:/home/hosted-engine/storage #填写部署hosted-engine时所填写的路径，这样这台主机才能识别到这个存储路径，把自己加入到环境中
              The specified storage location already contains a data domain. Is this an additional host setup (Yes, No)[Yes]? #检测到这个存储域已经被使用，询问是否部署一台hosted engine主机
    [ INFO  ] Installing on additional host
              Please specify the Host ID [Must be integer, default: 2]: #填写主机的id，比如现在部署第二台主机，可以使用2，但是如果是第三台，即2的id已经被使用，则不能再填写2，否则会报错id已经使用
    
              --== SYSTEM CONFIGURATION ==--
    
    [WARNING] A configuration file must be supplied to deploy Hosted Engine on an additional host.
              The answer file may be fetched from the first host using scp.
              If you do not want to download it automatically you can abort the setup answering no to the following question.
              Do you want to scp the answer file from the first host? (Yes, No)[Yes]: #是否从第一台主机上scp answer文件到本地
              Please provide the FQDN or IP of the first host: 192.168.3.221 
              Enter 'root' user password for host 192.168.3.221: 
    [ INFO  ] Answer file successfully downloaded
    
              --== NETWORK CONFIGURATION ==--
    
              The following CPU types are supported by this host:
                   - model_SandyBridge: Intel SandyBridge Family
                   - model_Westmere: Intel Westmere Family
                   - model_Nehalem: Intel Nehalem Family
                   - model_Penryn: Intel Penryn Family
                   - model_Conroe: Intel Conroe Family
    
              --== HOSTED ENGINE CONFIGURATION ==--
    
              Enter the name which will be used to identify this host inside the Administrator Portal [hosted_engine_2]: 
              Enter 'admin@internal' user password that will be used for accessing the Administrator Portal: 
              Confirm 'admin@internal' user password: 
    [WARNING] Host name Hosted-Engine-VM has no domain suffix
    [WARNING] Failed to resolve Hosted-Engine-VM using DNS, it can be resolved only locally
    [ INFO  ] Stage: Setup validation
              The Host ID is already known. Is this a re-deployment on an additional host that was previously set up (Yes, No)[Yes]? 
    
              --== CONFIGURATION PREVIEW ==--
    
              Engine FQDN                        : Hosted-Engine-VM
              Bridge name                        : ovirtmgmt
              SSH daemon port                    : 22
              Firewall manager                   : iptables
              Gateway address                    : 192.168.0.1
              Host name for web application      : hosted_engine_2
              Host ID                            : 2
              Image size GB                      : 25
              Storage connection                 : 192.168.3.221:/home/hosted-engine/storage
              Console type                       : vnc
              Memory size MB                     : 4096
              MAC address                        : 00:16:3e:3c:4d:69
              Boot type                          : disk
              Number of CPUs                     : 2
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
    [ INFO  ] Waiting for VDSM hardware info
    [ INFO  ] Waiting for VDSM hardware info
    [ INFO  ] Connected to Storage Domain
    [ INFO  ] Configuring VM
    [ INFO  ] Updating hosted-engine configuration
    [ INFO  ] Stage: Transaction commit
    [ INFO  ] Stage: Closing up
    [ INFO  ] Waiting for the host to become operational in the engine. This may take several minutes...
    [ INFO  ] Still waiting for VDSM host to become operational...
    [ INFO  ] Still waiting for VDSM host to become operational...
    [ INFO  ] The VDSM Host is now operational
    [ INFO  ] Enabling and starting HA services
              Hosted Engine successfully set up
    [ INFO  ] Stage: Clean up
    [ INFO  ] Generating answer file '/etc/ovirt-hosted-engine/answers.conf'
    [ INFO  ] Answer file '/etc/ovirt-hosted-engine/answers.conf' has been updated
    [ INFO  ] Stage: Pre-termination
    [ INFO  ] Stage: Termination
    ```


## 一些问题

1. 当没有写域名解析到到 `/etc/hosts` 中时，会提示：

    ```
    [ ERROR ] Failed to execute stage 'Environment customization': Host name is not valid: Hosted-Engine-VM did not resolve into an IP address
    ```

    因为没有写解析到hosts文件里。

1. 当第一台主机还没有部署完成（已经填写了存储域，但是部署正在进行中，或者中断）而部署第二台主机，会提示：

    ```
    [ ERROR ] Failed to execute stage 'Setup validation': Answer file lacks lockspace UUIDs, please use an answer file generated from the same version you are using on this additional host
    ```

    应该说的是 answer 文件还不完整，因此，必须部署完环境以后，才能进行第二台主机的部署。

