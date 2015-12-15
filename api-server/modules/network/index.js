/*jshint -W069 */
'use strict';
var nodSrv = require('./node/services/nod');
var NodMdl = require('./node/models/nod');
var linkSrv = require('./link/services/link');
var LinkMdl = require('./link/models/link');
var waveSrv = require('./wave/services/wave');
var WaveMdl = require('./wave/models/wave');

exports.getLastNetwork = function(callback) {};
exports.getServerNetwork = function(callback) {};
exports.getChildren = function(prnt_hash, callback) {};

/*jshint +W069 */