var Cache = require('./cache');
var cache = new Cache({
    type: 'file'
});

console.dir(cache);

var save = cache.set('url', {
    test: true
}, 200);

console.dir(save);