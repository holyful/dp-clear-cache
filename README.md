## 点评清缓存外挂程序

由于众所周知的原因，现在缓存清理使用web集群名来清经常清不了，但是用ip地址的话比较稳定，以前的做法是在cat上拷ip地址一个个放到gitlab上来清理，这个命令将以上过程自动化。

### 安装

你看见这篇文章，就是默认你已经有node和npm了。

<code>

	# npm install dp-clear-cache -g

</code>

### 使用

以下参数缺一不可
<code>

	# dpcc -a <web集群名称，如tuangou-web> -e <环境，prelease或者release> -c <gitlab的private key，下文会具体说在那里拿> -p <静态应用的名称，如app-m-refund>

</code>

可以查看帮助

<code>

	# dpcc -h 

	Usage:
	  dpcc [OPTIONS] [ARGS]

	Options: 
	  -a, --domain STRING    Target web app
	  -e, --env STRING       Environment, prelease or release
	  -c, --credential STRINGPrivate key of gitlab, check your gitlab account page 
	  -p, --project STRING   static project name
	  -k, --no-color         Omit color from output
	      --debug            Show debug information
	  -v, --version          Display the current version
	  -h, --help             Display help and usage details

</code>

### 如何获得 private key 

登录code.dianpingoa.com

<code>

	http://code.dianpingoa.com

</code>

进去Account页面

<code>

	http://code.dianpingoa.com/profile/account

</code>

没错第一个section就是Private Key，将private key传进去 -c/--credential 参数即可


