var compMod = require('./component');

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
		compMod.loadComps(function(err, comps) {
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