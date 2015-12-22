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

Also Alternatively , you can perform the installation of nodejs and NPM using the apt-get command.
```bash
	sudo apt-get update
	sudo apt-get install nodejs
```

```bash
	sudo apt-get install npm
```
###Installing MongoDB

Open the terminal and type the command
```bash
sudo apt-get install mongodb
```

###Running the project (api-server)

Para ejecutar el proyecto siga los siguientes pasos:

* Abra el terminal y ubiquese en la carpeta api-server del proyecto.

* Escriba en el terminal el siguiente comando.
```bash
 sudo npm install
```
* Luego escriba:
```bash
 sudo npm install forever -g
```
* Ahora ejecute el comando:
```bash
 sh starter.sh
```
Ejecutados estos comandos ya estaria el proyecto corriendo, un proxy en el puerto 3000 el branch master en el 3001 y develop en el 3002 

###Estructura del proyecto

El proyecto tiene la siguiente estructura de carpetas:

* **api-server** la cual contiene el servidor y la logica del negocio.


* **p2p-network-visualization** la cual tiene toda la logica que se usa para graficar la red p2p de Fermat, eso incluye servidores, clientes, wallets de cada cliente etc.

* **platform-visualization** contiene la logica que se encarga de graficar el repositorio Fermat.
