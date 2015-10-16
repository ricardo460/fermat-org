var Cache = require('./lib/cache');

function RouteCache(options, req) {
    'use strict';
    this.cache = new Cache(options);
    this.url = req.method + ' ' + req.url;
    this.req = req;
}

RouteCache.prototype.getBody = function () {
    'use strict';
    var route = this.cache.get(this.url);
    if (route) {
        this.body = route.body;
    } else {
        this.body = undefined;
    }
    return this.body;
};

RouteCache.prototype.setBody = function (body) {
    'use strict';
    var route = this.cache.set(this.url, body);
    if (route) {
        this.body = route.body;
    } else {
        this.body = undefined;
    }
    return this.body;
};

module.exports = RouteCache;