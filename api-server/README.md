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
If the version of npm shown in the terminal means that is already installed.

Node.js comes with so npm can also use the command npm.

Also Alternatively , you can perform the installation of node.js and npm using the apt-get command.
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

###Running fermat.org locally

* Install apache.
	* To install apache, open terminal and type in these commands:
```bash
sudo apt-get update
```
```bash
sudo apt-get install apache2
```
* Verify that the Apache Server is working properly.
	* Open your Web browser and type http://localhost/index.html
	* If the page is visualized correctly it means that the server was successfully installed.

* Open the terminal and move to the folder platform-visualization and run gulp.

* Publish the application fermat.org on your apache server.
	* Copy the folder platform-visualization in /var/www/html.

* Finally open your Web browser and type http://localhost/platform-visualization/index.html

###Project structure

The project is structured as follows:

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
	* **Gruntfile.js [file]** provides the setting for Grunt. It is responsible for verifying that the JavaScript syntax is correct.
	* **image-loader.js [file]** it contains a script used to generate a JSON object with the images that are within the repository.
	* **manual_update.js [file]** t serves to update the database manually
	* **package.json [file]** here are all the dependencies.
	* **proxy.js [file]** creates proxy servers and starts http server to redirect requests according to version.
	* **starter.sh [file]** starts the server.
	* **test.js [file]** tests are implemented here to generate documentation that is in the repository.
	* **update.js [file]** you download all the repository and updates the database.

* **p2p-network-visualization** which has all the logic that is used to plot the Fermat p2p network that includes servers, clients, each client wallets etc.

* **platform-visualization** It contains the logic that is responsible for plotting the repository Fermat.
	* **books** contains documentation of fermat in PDF format and in a normal version and BIG.
	* **common** it contains the libraries used in the project.
	* **images** it contains all the images used in the page properly sorted.
	* **node_modules** it is created by Node.js when installing gulp. (Gulp.js is a build system to automate common development tasks, such as minification of JavaScript, recharge browser, image compression, syntax validation code and a myriad of other tasks)
	* **src** it contains the source files, each representing a class and is the main viewer.js. Gulp reviews each time you change one of these files and generates the final main.js file, this is using the page.
	* **config_map.json [file]** it contains information on how they set the different views of the page (table, workflow, architecture, learn, etc.). If this file is changed the navigational structure is modified.
	* **gulpfile** it is the configuration file gulp.
	* **images.json** it contains a list of all images that are in the images folder. This is to preload all the images while the page loads, so that no black boxes or sheets without displaying images because they have not downloaded yet.
	* **package.json** it is the configuration file of Node.js and has a list of applications it (in this case only gulp)