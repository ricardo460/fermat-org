![alt text](https://github.com/bitDubai/media-kit/blob/master/Readme%20Image/Fermat%20Logotype/Fermat_Logo_3D.png "Fermat Logo")

# fermat-org

## Installation Guide

###Installing Node.js and npm

* Go to the [official website](https://nodejs.org/en/) and download the version for linux.

* Unzip the downloaded file in the folder of your choice.

* Please go to your home folder and press CTRL + H to see hidden files.

* Locate the .bashrc file and double-click on it.

* Add the environment variables NODEJS_HOME to file .bashrc.
	NODEJS_HOME=/URL_NODE_JS

* Add the environment variables to PATH.
	
	PATH=$PATH:$JAVA_HOME/bin:$NODEJS_HOME/bin

	If the PATH is not created then write this
	
	PATH=$PATH:$NODEJS_HOME/bin
	
	export PATH

* Save your changes.

* Close the .bashrc file and open the terminal.

* Type in the terminal the following command.

	```bash
	node --version
	```
If Node.js version shown in the terminal means that is already installed.

* Type in the terminal the following command.
	```bash
	npm --version
	```
If the version of NPM shown in the terminal means that is already installed.

Node.js comes with so NPM can also use the command npm.

###Installing MongoDB

Open the terminal and type the command
```bash
sudo apt-get install mongodb
```
