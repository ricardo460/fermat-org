var platfrmSrv = require('../platform/services/platfrm');
var suprLayMod = require('../superlayer');
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

function CodePlatfSuprl() {
	try {
		platfrmSrv.findAllPlatfrms({}, {
			order: 1
		}, function(err, platfrms) {
			if (err) {
				throw err;
			} else {
				createMapsPlatfrm(platfrms);
				suprLayMod.getSuprlays(function(err, suprlays) {
					if (err) throw err;
					else {
						createMapsSuprlay(suprlays);
						return true;
					}
				});
			}
		});
	} catch (err) {
		throw err;
	}
}
CodePlatfSuprl.prototype.existDeps = function(deps) {
	var platfrmCode = null;
	var suprlayCode = null;
	var notExis = {};
	for (var i = 0; i < deps.length; i++) {
		platfrmCode = mapPlatfrms[deps[i]];
		suprlayCode = mapSuprlay[deps[i]];
		if ((platfrmCode === undefined || platfrmCode === null) && (suprlayCode === undefined || suprlayCode === null)) {
			notExis._id = deps[i];
			notExis.valid = false;
			return notExis;
		}
	}
	notExis.valid = true;
	return notExis;
};
CodePlatfSuprl.prototype.mapsCodePlatfrm = function mapsCodePlatfrm() {
	return mapPlatfrms;
};
CodePlatfSuprl.prototype.mapsCodeSuprlay = function mapsCodeSuprlay() {
	return mapSuprlay;
};
module.exports = CodePlatfSuprl;