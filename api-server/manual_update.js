var winston = require('winston');
var loadLib = require('./modules/repository/lib/loader');
var Cache = require('./lib/route-cache');
var db = require('./db');
var cache = new Cache({
	type: 'file'
});
winston.log('info', 'Attempting manual update...');
loadLib.loadComps(function (err, res) {
	'use strict';
	if (err) {
		winston.log('error', err.message, err);
	} else {
		winston.log('debug', 'Components and developers loaded', res);
		cache.clear();
	}
});