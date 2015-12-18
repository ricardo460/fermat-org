var linkMod = require('./link');
var nodeMod = require('./node');
var waveMod = require('./wave');

exports.getServerNetwork = function (req, next) {
	'use strict';
	try {
		waveMod.findLastWave(function (err_wav, res_wav) {
			if (err_wav) {
				next(err_wav, null);
			} else {
				nodeMod.findNodsByWaveIdAndType(res_wav._id, 'server', function (err_nods, res_nods) {
					if (err_nods) {
						next(err_nods, null);
					} else {
						//TODO: search links
						//TODO: get hashes
					}
				});
			}
		});
	} catch (err) {
		next(err, null);
	}
};

exports.getChildren = function (req, next) {
	'use strict';
	try {
		waveMod.findLastWave(function (err_wav, res_wav) {
			if (err_wav) {
				next(err_wav, null);
			} else {
				nodeMod.findNodsByWaveIdAndHash(res_wav._id, req.query.hash, function (err_nods, res_nods) {
					if (err_nods) {
						next(err_nods, null);
					} else {
						//TODO: search links
						//TODO: get hashes
					}
				});
			}
		});
	} catch (err) {
		next(err, null);
	}
};

/*jshint +W069 */