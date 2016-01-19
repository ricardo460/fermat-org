var mongoose = require('mongoose');
var objid = new mongoose.Types.ObjectId();
var timestamp = objid.getTimestamp();
var date = new Date(timestamp);
var milisec = date.getTime();
console.dir(objid);
console.dir(timestamp);
console.dir(date);
console.dir(milisec);