var platfrmSrv = require('../platform/services/platfrm');
var suprlaySrv = require('../superlayer/services/suprlay');
var mapPlatfrms = {};
var mapSuprlay = {};
var createMapsPlatfrm = function(platfrms) {
	try {
		for (var i = 0; i < platfrms.length; i++) {
			mapPlatfrms[platfrms[i]._id] = platfrms[i].code;
		}
		return mapPlatfrms;
	} catch (err) {
		throw err;
	}
};
var createMapsSuprlay = function(suprlays) {
	try {
		for (var i = 0; i < suprlays.length; i++) {
			mapSuprlay[suprlays[i]._id] = suprlays[i].code;
		}
		return mapSuprlay;
	} catch (err) {
		throw err;
	}
};
exports.loadCodesPlatform = function(callback) {
	try {
		platfrmSrv.findAllPlatfrms({}, {
			order: 1
		}, function(err, platfrms) {
			if (err) {
				return callback(err, null);
			}
			if (platfrms) {
				mapPlatfrms = createMapsPlatfrm(platfrms);
				return callback(null, mapPlatfrms);
			} else return callback('platforms not found', null);
		});
	} catch (err) {
		return callback(err, null);
	}
};

exports.loadCodesSuprlays = function(callback) {
	try {
		suprlaySrv.findAllSuprlays({}, {
			order: 1
		}, function(err, suprlays) {
			if (err) {
				return callback(err, null);
			}
			if (suprlays) {
				mapSuprlay = createMapsSuprlay(suprlays);
				return callback(null, mapSuprlay);
			} else return callback('super layers not found', null);
		});
	} catch (err) {
		return callback(err, null);
	}
};

exports.existDeps = function(deps, callback) {
	var platfrmCode = null;
	var suprlayCode = null;
	var notExis = {};
	 if (deps) {
		var loopDeps = function(i) {
			if (i < deps.length) {
				platfrmSrv.findPlatfrmById(deps[i], function(err, platfrm) {
					if (err) return callback(err, null);
					if (platfrm) {
						loopDeps(++i);
					} else {
						suprlaySrv.findSuprlayById(deps[i], function(err, suprlay) {
							if (err) return callback(err, null);
							if (suprlay) {
								loopDeps(++i);
							} else {
								notExis._id = deps[i];
								notExis.valid = false;
								return callback(null, notExis);
							}
						});
					}
				});
			} else {
				notExis.valid = true;
				return callback(null, notExis);
			}
		};
		loopDeps(0);
	} else {
		notExis.valid = true;
		return callback(null, notExis);
	}
};