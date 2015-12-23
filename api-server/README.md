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

To run the project, follow these steps:

* Open the terminal and go to the api-server project folder.

* Type the following command in the terminal.
```bash
 sudo npm install
```
* Then type:
```bash
 sudo npm install forever -g
```
* Now run the command:
```bash
 sh starter.sh
```
The project should be running. a proxy on port 3000, the master branch in port 3001 and the branch Develop in port 3002.

###Project structure

El proyecto tiene la siguiente estructura de carpetas:

* **api-server** it contains the server and business logic.
	* **assets**  it contains image and css style resources for doc book.
	* **bin** server executable file.
	* **cache** where the fermat repo is saved (master and develop branches).
	* **lib** it contains libraries of our creation.
	* **modules** it contains modules folder (where main development is made).
	* **public** web access (not developed yet).
	* **routes** it contains route files.
	* **views**  it contains template files for web access.
	* **app.js [file]** it contains the main server code.
	* **config.js [file]** it contains the configuration of the connection to the database.
	* **db.js [file]** establishes the connection to the database.
	* **Gruntfile.js [file]**
	* **image-loader.js [file]** it contains a script used to generate a JSON object with the images that are within the repository.
	* **manual_update.js [file]**
	* **package.json [file]** here are all the dependencies.
	* **proxy.js [file]** creates proxy servers and starts http server to redirect requests according to version.
	* **starter.sh [file]** starts the server.
	* **test.js [file]** tests are implemented here to generate documentation that is in the repository.
	* **update.js [file]** you download all the repository and updates the database.

* **p2p-network-visualization** which has all the logic that is used to plot the Fermat p2p network that includes servers, clients, each client wallets etc.

* **platform-visualization** It contains the logic that is responsible for plotting the repository Fermat.
