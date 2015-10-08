var mongoose = require('mongoose');
var Dao = require('../../../database/dao');
var procMdl = require('../models/proc');
var procSch = require('../schemas/proc');
var stepMdl = require('../models/step');
var stepSch = require('../schemas/step');
var devMdl = require('../../developer/models/dev');
var devSch = require('../../developer/schemas/dev');

var procDao = new Dao('Proc', procSch, procMdl, 'Step', stepSch, stepMdl);

exports.insertProc = function(proc_mdl, callback) {
    procDao.insertSchema(proc_mdl, function(err, proc) {
        callback(err, proc);
    });
};

exports.findProcById = function(_id, callback) {
    procDao.findAndPopulateSchemaById(_id, 'steps', function(err, proc) {
        callback(err, proc);
    });
};

exports.findProc = function(query, callback) {
    procDao.findAndPopulateSchema(query, 'steps', function(err, proc) {
        callback(err, proc);
    });
};

exports.findProcs = function(query, limit, order, callback) {
    procDao.findAndPopulateSchemaLst(query, limit, order, 'steps', function(err, proc) {
        callback(err, proc);
    });
};

exports.findAllProcs = function(query, order, callback) {
    procDao.findAndPopulateAllSchemaLst(query, order, 'steps', function(err, proc) {
        callback(err, proc);
    });
};

exports.updateProcById = function(_id, set, callback) {
    set.upd_at = new mongoose.Types.ObjectId();
    procDao.updateSchema({
        _id: _id
    }, set, {}, function(err, proc) {
        callback(err, proc);
    });
};