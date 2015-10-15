'use strict';
var fs = require('fs');
var winston = require('winston');
var Route = require('./route');

/**
 * [Cache description]
 *
 * @method Cache
 *
 * @param  {[type]} options [description]
 */
function Cache(options) {
    this.type = options && options.type ? options.type : 'memory';
    this.time = options && options.time ? options.time : 3600000;
    if (this.type === 'file') {
        this.filename = options && options.filename ? process.cwd() + options.filename : process.cwd() + '/filecache.json';
    }
}

/**
 * [clear description]
 *
 * @method clear
 *
 * @return {[type]} [description]
 */
Cache.prototype.clear = function () {
    if (this.type === 'file') {
        fs.unlinkSync(this.filename);
    } else {
        global.memcache = {};
    }
    return true;
};

/**
 * [set description]
 *
 * @method set
 *
 * @param  {[type]} url    [description]
 * @param  {[type]} body   [description]
 */
Cache.prototype.set = function (url, body) {
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
            var routecache = new Route(cache[url].body, cache[url].date, this.time);
            if (!routecache.isValid() || !routecache.body) {
                route = new Route(body, null, this.time);
                cache[url] = route;
            } else {
                winston.log('info', 'Route still in cache');
            }
        } else {
            route = new Route(body, null, this.time);
            cache[url] = route;
        }
    } else {
        cache = {};
        route = new Route(body, null, this.time);
        cache[url] = route;
    }

    if (this.type === 'file') {
        var data = JSON.stringify(cache);
        fs.writeFile(this.filename, data, {
            flags: 'w'
        }, function (err) {
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

/**
 * [get description]
 *
 * @method get
 *
 * @param  {[type]} url [description]
 *
 * @return {[type]} [description]
 */
Cache.prototype.get = function (url) {
    var cache;
    try {
        if (this.type === 'file') {
            var filecache = fs.readFileSync(this.filename);
            cache = JSON.parse(filecache);
            winston.log('info', 'Searching on file cache');
        } else {
            cache = global.memcache;
            winston.log('info', 'Searching on memory cache');
        }
    } catch (err) {
        winston.log('info', 'Error reading or parsing file cache', err);
    }

    if (cache) {
        winston.log('info', 'Retrieving from cache');
        return cache[url];
    } else {
        winston.log('info', 'Not found in cache');
        return undefined;
    }
};

/**
 * [del description]
 *
 * @method del
 *
 * @param  {[type]} url [description]
 *
 * @return {[type]} [description]
 */
Cache.prototype.del = function (url) {
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
        }, function (err) {
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

module.exports = Cache;