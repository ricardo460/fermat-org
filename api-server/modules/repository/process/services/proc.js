'use strict';
var mongoose = require('mongoose');
var Dao = require('../../../database/dao');
var procMdl = require('../models/proc');
var procSch = require('../schemas/proc');
var stepMdl = require('../models/step');
var stepSch = require('../schemas/step');
var stepSrv = require('../services/step');
var devMdl = require('../../developer/models/dev');
var devSch = require('../../developer/schemas/dev');

var procDao = new Dao('Proc', procSch, procMdl, 'Step', stepSch, stepMdl);

exports.insertProc = function (proc_mdl, callback) {
    procDao.insertSchema(proc_mdl, function (err, proc) {
        callback(err, proc);
    });
};

exports.findAndPopulateProc = function (query, callback) {
    procDao.findSchema(query, function (err, proc) {
        if (err) {
            callback(err, null);
        } else {
            stepSrv.findAllSteps({
                _proc_id: proc._id
            }, {
                order: 1
            }, function (err, steps) {
                if (err) {
                    callback(err, null);
                } else {
                    var _steps = [];
                    if (steps && Array.isArray(steps)) {

                        var getStep = function (i) {
                            var _step = steps[i];
                            var step = {};
                            step.id = _step.order;
                            step.title = _step.title || null;
                            step.desc = _step.desc || null;
                            step.type = _step.type || null;
                            step.next = _step.next || [];
                            if (_step.comp) {
                                step.name = _step.comp.name;
                                step.layer = _step.comp._layer_id.name;
                                if (_step.comp._platfrm_id) {
                                    step.platfrm = _step.comp._platfrm_id.code;
                                } else if (_step.comp._suprlay_id) {
                                    step.suprlay = _step.comp._suprlay_id.code;
                                }
                            }
                            return step;
                        };
                        var j;
                        for (j = 0; j < steps.length; j++) {
                            _steps.push(getStep(j));
                        }
                    }
                    //console.dir(_steps);
                    proc.steps = _steps;
                    callback(null, proc);
                }
            });
        }
    });
};

exports.findProc = function (query, callback) {
    procDao.findSchema(query, function (err, proc) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, proc);
        }
    });
};

exports.updateProcById = function (_id, set, callback) {
    set.upd_at = new mongoose.Types.ObjectId();
    procDao.updateSchema({
        _id: _id
    }, set, {}, function (err, proc) {
        callback(err, proc);
    });
};