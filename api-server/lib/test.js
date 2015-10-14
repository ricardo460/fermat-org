var Cache = require('./cache');
var cache = new Cache();

console.dir(cache);

var save = cache.set('url', {
    test: true
}, 200);

console.dir(save);