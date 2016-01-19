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
/*	
Update | Delete | New Field | Duplicate | Refresh | Text | Expand
{
   "_id": ObjectId("569e9409052e7aa37a08afe7"),
   "_usr_id": ObjectId("569e9409052e7aa37a08afe4"),
   "_item_id": ObjectId("569e9409052e7aa37a08afe5"),
   "item_type": "component",
   "upd_at": ObjectId("569e9409052e7aa37a08afe6"),
   "priority": NumberInt(9),
   "__v": NumberInt(0) 
}
TOP
#3	
Update | Delete | New Field | Duplicate | Refresh | Text | Expand
{
   "_id": ObjectId("569e9407052e7aa37a08afe2"),
   "_usr_id": ObjectId("569e9407052e7aa37a08afdf"),
   "_item_id": ObjectId("569e9407052e7aa37a08afe0"),
   "item_type": "superlayer",
   "upd_at": ObjectId("569e9407052e7aa37a08afe1"),
   "priority": NumberInt(1),
   "__v": NumberInt(0) 
}
TOP
#2	
Update | Delete | New Field | Duplicate | Refresh | Text | Expand
{
   "_id": ObjectId("569e9405052e7aa37a08afdd"),
   "_usr_id": ObjectId("569e9405052e7aa37a08afda"),
   "_item_id": ObjectId("569e9405052e7aa37a08afdb"),
   "item_type": "platform",
   "upd_at": ObjectId("569e9405052e7aa37a08afdc"),
   "priority": NumberInt(2),
   "__v": NumberInt(0) 
}
TOP
#1	
Update | Delete | New Field | Duplicate | Refresh | Text | Expand
{
   "_id": ObjectId("569e9403052e7aa37a08afd8"),
   "_usr_id": ObjectId("569e9403052e7aa37a08afd5"),
   "_item_id": ObjectId("569e9403052e7aa37a08afd6"),
   "item_type": "layer",
   "upd_at": ObjectId("569e9403052e7aa37a08afd7"),
   "priority": NumberInt(3),
   "__v": NumberInt(0) 
}
*/
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
		lockMod.insOrUpdLock(new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId("569e9403052e7aa37a08afd6"), 'layer', 3, function (err_ins, res_ins) {
			if (err_ins) {
				winston.log('error', err_ins.message, err_ins);
			} else {
				console.dir(res_ins);
			}
		});
		break;
	case 2:
		winston.log('info', 'Inserting lock');
		lockMod.insOrUpdLock(new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId("569e9405052e7aa37a08afdb"), 'platform', 2, function (err_ins, res_ins) {
			if (err_ins) {
				winston.log('error', err_ins.message, err_ins);
			} else {
				console.dir(res_ins);
			}
		});
		break;
	case 3:
		winston.log('info', 'Inserting lock');
		lockMod.insOrUpdLock(new mongoose.Types.ObjectId("569e9409052e7aa37a08afe4"), new mongoose.Types.ObjectId("569e9407052e7aa37a08afe0"), 'superlayer', 1, function (err_ins, res_ins) {
			if (err_ins) {
				winston.log('error', err_ins.message, err_ins);
			} else {
				console.dir(res_ins);
			}
		});
		break;
	case 4:
		winston.log('info', 'Inserting lock');
		lockMod.insOrUpdLock(new mongoose.Types.ObjectId("569e9409052e7aa37a08afe4"), new mongoose.Types.ObjectId("569e9409052e7aa37a08afe5"), 'component', 0, function (err_ins, res_ins) {
			if (err_ins) {
				winston.log('error', err_ins.message, err_ins);
			} else {
				console.dir(res_ins);
			}
		});
		break;
	case 5:
		winston.log('info', 'Killing process');
		process.exit(1);
		break;
	}
}, _INTERVAL);