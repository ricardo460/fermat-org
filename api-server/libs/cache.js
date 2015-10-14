var fs = require('fs');
var winston = require('winston');
var Route = require('./route');

console.log(process.cwd());

function Cache(options) {
    this.type = options.type || 'memory';
    this.time = options.time || 3600000;
    if (this.type === 'file') {
        this.filename = this.filename ? process.cwd() + options.filename : process.cwd() + '/filecache.json';
    }
}

Cache.prototype.clear = function() {
    if (this.type === 'file') {
        fs.unlinkSync(this.filename);
    } else {
        global.memcache = {};
    }
    return true;
};

Cache.prototype.set = function(url, body, status) {
    var cache;
    try {
        if (this.type === 'file') {
            var filecache = fs.readFileSync(this.filename);
            cache = JSON.parse(filecache);
        } else {
            cache = global.memcache;
        }
    } catch (err) {
        winston.log('info', 'Error reading or parsing file cache', err);
    }

    var route;
    if (cache) {
        if (cache[url]) {
            var routecache = new Route(cache[url].body, cache[url].status, cache[url].date, this.time);
            if (!routecache.isValid() || routecache.status != 200 || !routecache.body) {
                route = new Route(body, status, null, this.time);
                cache[url] = route;
            } else {
                winston.log('info', 'Route still in cache');
            }
        } else {
            route = new Route(body, status, null, this.time);
            cache[url] = route;
        }
    } else {
        cache = {};
        route = new Route(body, status, null, this.time);
        cache[url] = route;
    }

    if (this.type === 'file') {
        var data = JSON.stringify(cache);
        fs.writeFile(this.filename, data, {
            flags: 'w'
        }, function(err) {
            if (err) {
                winston.log('info', 'Error reading or parsing file cache', err);
            }
        });
        return cache[url];
    } else {
        global.memcache = cache;
        return cache[url];
    }
};

Cache.prototype.get = function(url) {
    var cache;
    try {
        if (this.type === 'file') {
            var filecache = fs.readFileSync(this.filename);
            cache = JSON.parse(filecache);
        } else {
            cache = global.memcache;
        }
    } catch (err) {
        winston.log('info', 'Error reading or parsing file cache', err);
    }

    if (cache) {
        return cache[url];
    } else {
        return undefined;
    }
};

Cache.prototype.del = function(url) {
    var cache;
    try {
        if (this.type === 'file') {
            var filecache = fs.readFileSync(this.filename);
            cache = JSON.parse(filecache);
        } else {
            cache = global.memcache;
        }
    } catch (err) {
        winston.log('info', 'Error reading or parsing file cache', err);
    }

    var route;
    if (cache) {
        if (cache[url]) {
            route = cache[url];
            delete cache[url];
        }
    }

    if (this.type === 'file') {
        var data = JSON.stringify(cache);
        fs.writeFile(this.filename, data, {
            flags: 'w'
        }, function(err) {
            if (err) {
                winston.log('info', 'Error reading or parsing file cache', err);
            }
        });
        return route;
    } else {
        global.memcache = cache;
        return route;
    }
};


//global.memcache = {};
//global.memcache.test = "hola mundo";
//require('./test');
//console.dir(global);
//var route = new Route(null, null, null, null)
//console.dir(route);
//console.log(route.date.getTime());
//console.log(process.cwd());
//
module.exports = Cache;