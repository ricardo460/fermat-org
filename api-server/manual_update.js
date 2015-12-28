var winston = require('winston');
var loadLib = require('./modules/repository/lib/loader');
var Cache = require('./lib/route-cache');
var cache = new Cache({
	type: 'file'
});

winston.log('info', 'Attempting manual update...');

loadLib.loadComps(function (err, res) {
	'use strict';
	if (err) {
		winston.log('info', err.message, err);
	} else {
		winston.log('info', 'Components and developers loaded', res);
		cache.clear();
	}
});