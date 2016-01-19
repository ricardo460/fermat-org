var mongoose = require('mongoose');
var db = require('../../../db');
var lockMod = require('./index');
var objid = new mongoose.Types.ObjectId();
var dateLib = require('./libs/date');
var timestamp = objid.getTimestamp();
var date = new Date(timestamp);
console.dir(objid);
console.dir(timestamp);
console.dir(date);
console.dir(dateLib.getObjIdToMilis(objid));
/*lockMod.insOrUpdLock(new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId(), 'layer', 5, function (err_ins, res_ins) {
	if (err_ins) {
		console.dir(err_ins);
	} else {
		console.dir(res_ins);
	}
});*/