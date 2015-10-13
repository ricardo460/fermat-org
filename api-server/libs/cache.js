var fs = require('fs');
var Route = require('./route');

function Cache(options) {
    this.type = options.type || 'memory';
    this.time = options.time || 3600000;
    if (this.type === 'file') {
        this.filename = this.filename ? process.cwd() + '/cache/' + options.filename : process.cwd() + '/cache/filecache.json';
    }
}

Cache.prototype.clear = function() {
	//fs.unlinkSync(path);
};

Cache.prototype.set = function(url, body, status) {
    /*var myOptions = {
        name: 'Avian',
        dessert: 'cake'
        flavor: 'chocolate',
        beverage: 'coffee'
    };

    var data = JSON.stringify(myOptions);

    fs.writeFile('./config.json', data, function(err) {
        if (err) {
            console.log('There has been an error saving your configuration data.');
            console.log(err.message);
            return;
        }
        console.log('Configuration saved successfully.')
    });*/
};

Cache.prototype.get = function(url) {
    /*var data = fs.readFileSync('./config.json'),
        myObj;

    try {
        myObj = JSON.parse(data);
        console.dir(myObj);
    } catch (err) {
        console.log('There has been an error parsing your JSON.')
        console.log(err);
    }*/
};

Cache.prototype.del = function(url) {
    
};


//global.memcache = {};
//global.memcache.test = "hola mundo";
//require('./test');
//console.dir(global);
//var route = new Route(null, null, null, null)
//console.dir(route);
//console.log(route.date.getTime());
//console.log(process.cwd());