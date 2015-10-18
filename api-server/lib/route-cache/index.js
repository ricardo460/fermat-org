var Cache = require('./lib/cache');

function RouteCache(options) {
    'use strict';
    this.cache = new Cache(options);
}

RouteCache.prototype.getBody = function (req) {
    'use strict';
    var url = req.method + ' ' + req.url;
    var route = this.cache.get(url);
    if (route) {
        this.body = route.body;
    } else {
        this.body = undefined;
    }
    return this.body;
};

RouteCache.prototype.setBody = function (req, body) {
    'use strict';
    var url = req.method + ' ' + req.url;
    var route = this.cache.set(url, body);
    if (route) {
        this.body = route.body;
    } else {
        this.body = undefined;
    }
    return this.body;
};

module.exports = RouteCache;