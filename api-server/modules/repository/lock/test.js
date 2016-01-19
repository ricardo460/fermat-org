var mongoose = require('mongoose');
var objid = new mongoose.Types.ObjectId();
var dateLib = require('./libs/date');
var timestamp = objid.getTimestamp();
var date = new Date(timestamp);
console.dir(objid);
console.dir(timestamp);
console.dir(date);
console.dir(dateLib.getObjIdToMilis(objid));