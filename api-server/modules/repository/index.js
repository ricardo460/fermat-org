var compSrv = require('./component/services/comp');

exports.getComps = function (req, next) {
	try {
		compSrv.findAllComps({}, {}, function(err, comps) {
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