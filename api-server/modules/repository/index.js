var compMod = require('./component');
var loadLib = require('./libs/loader');

exports.getComps = function (req, next) {
	try {
		compMod.getComps(function(err, comps) {
			if (err) {
				next(err, null);
			} else {
				next(null, comps);
			}
		});
	} catch (err) {
		next(err, null);
	}
};


exports.loadComps = function (req, next) {
	try {
		loadLib.loadComps(function(err, res) {
			if (err) {
				next(err, null);
			} else {
				next(null, res);
			}
		});
	} catch (err) {
		next(err, null);
	}
};

exports.updDevs = function (req, next) {
	try {
		loadLib.updDevs(function(err, res) {
			if (err) {
				next(err, null);
			} else {
				next(null, res);
			}
		});
	} catch (err) {
		next(err, null);
	}
};