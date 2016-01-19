var winston = require('winston');
var mongoose = require('mongoose');
var lockMod = require('./index');
var objid = new mongoose.Types.ObjectId();
var dateLib = require('./libs/date');
var timestamp = objid.getTimestamp();
var date = new Date(timestamp);
console.dir(objid);
console.dir(timestamp);
console.dir(date);
//console.dir(dateLib.getObjIdToMilis(objid));
var _INTERVAL = 2000;
var loop = 0;
winston.log('info', 'Update interval on every %s minutes', (_INTERVAL / 1000) / 60);
setInterval(function () {
	var mod = loop % 6;
	loop++;
	switch (mod) {
	case 0:
		winston.log('info', 'Starting database connexion');
		var db = require('../../../db');
		break;
	case 1:
		winston.log('info', 'Inserting lock');
		lockMod.insOrUpdLock(new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId(), 'layer', 3, function (err_ins, res_ins) {
			if (err_ins) {
				winston.log('error', err_ins.message, err_ins);
			} else {
				console.dir(res_ins);
			}
		});
		break;
	case 2:
		winston.log('info', 'Inserting lock');
		lockMod.insOrUpdLock(new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId(), 'platform', 2, function (err_ins, res_ins) {
			if (err_ins) {
				winston.log('error', err_ins.message, err_ins);
			} else {
				console.dir(res_ins);
			}
		});
		break;
	case 3:
		winston.log('info', 'Inserting lock');
		lockMod.insOrUpdLock(new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId(), 'superlayer', 1, function (err_ins, res_ins) {
			if (err_ins) {
				winston.log('error', err_ins.message, err_ins);
			} else {
				console.dir(res_ins);
			}
		});
		break;
	case 2:
		winston.log('info', 'Inserting lock');
		lockMod.insOrUpdLock(new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId(), 'component', 0, function (err_ins, res_ins) {
			if (err_ins) {
				winston.log('error', err_ins.message, err_ins);
			} else {
				console.dir(res_ins);
			}
		});
		break;
	case 3:
		winston.log('info', 'Killing process');
		process.exit(1);
		break;
	}
}, _INTERVAL);