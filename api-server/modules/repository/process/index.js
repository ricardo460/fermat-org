/*jshint -W069 */
var stepSrv = require('./services/step');
var StepMdl = require('./models/step');
var procSrv = require('./services/proc');
var ProcMdl = require('./models/proc');
var platfrmSrv = require('../platform/services/platfrm');
var suprlaySrv = require('../superlayer/services/suprlay');
var layerSrv = require('../layer/services/layer');
var compSrv = require('../component/services/comp');

var findComp = function(platfrm_code, suprlay_code, layer_name, comp_name, callback) {
    layerSrv.findLayerByName(layer_name.toLowerCase(), function(err_lay, res_lay) {
        if (err_lay) {
            return callback(err_lay, null);
        } else {
            if (platfrm_code) {
                platfrmSrv.findPlatfrmByCode(platfrm_code, function(err_pla, res_pla) {
                    if (err_pla) {
                        return callback(err_pla, null);
                    } else {
                        compSrv.findComp({
                            _layer_id: res_lay._id,
                            name: comp_name,
                            _platfrm_id: res_pla._id
                        }, function(err_comp, res_comp) {
                            if (err_comp) {
                                return callback(err_comp, null);
                            } else {
                                return callback(null, res_comp);
                            }
                        });
                    }
                });
            } else if (suprlay_code) {
                suprlaySrv.findSuprlayByCode(suprlay_code, function(err_sup, res_sup) {
                    if (err_sup) {
                        return callback(err_sup, null);
                    } else {
                        compSrv.findComp({
                            _layer_id: res_lay._id,
                            name: comp_name,
                            _suprlay_id: res_sup._id
                        }, function(err_comp, res_comp) {
                            if (err_comp) {
                                return callback(err_comp, null);
                            } else {
                                return callback(null, res_comp);
                            }
                        });
                    }
                });
            } else {
                return callback(new Error('invalid search'), null);
            }
        }
    });
};

exports.findProcsByComp = function(platfrm_code, suprlay_code, layer_name, comp_name, callback) {
    findComp(platfrm_code, suprlay_code, layer_name, comp_name, function(err_comp, res_comp) {
        if (err_comp) {
            return callback(err_comp, null);
        } else {
            stepSrv.findSteps({
                _comp_id: res_comp._id
            }, {}, function(err, steps) {
                if (err) {
                    return callback(err, null);
                } else {
                    var _procs = [];
                    /**
                     * [contains description]
                     *
                     * @method contains
                     *
                     * @param  {[type]} _id [description]
                     *
                     * @return {[type]} [description]
                     */
                    _procs.contains = function(_id) {
                        for (var i = this.length - 1; i >= 0; i--) {
                            if (this[i]._id + '' == _id + '') {
                                return true;
                            }
                        }
                        return false;
                    };
                    var loopSteps = function(i) {
                        if (i < steps.length) {
                            var _step = steps[i];
                            if (_procs.contains(_step._proc_id)) {
                                loopSteps(++i);
                            } else {
                                procSrv.findProc({
                                    _id: _step._proc_id
                                }, function(err_proc, res_proc) {
                                    if (err_proc) {
                                        loopSteps(++i);
                                    } else {
                                        _procs.push(res_proc);
                                        loopSteps(++i);
                                    }

                                });
                            }
                        } else {
                            callback(null, _procs);
                        }
                    };
                    loopSteps(0);
                }
            });
        }
    });
};

exports.findStepsByProc = function(proc_name, callback) {
    procSrv.findProc({
        name: proc_name.toLowerCase()
    }, function(err, res) {
        if (err) return callback(err, null);
        else return callback(null, res);
    });
};

exports.insOrUpdProc = function(name, desc, steps, callback) {
    var find_obj = {
        '$and': []
    };
    if (name) {
        find_obj['$and'].push({
            "name": name
        });
    }
    procSrv.findProc(find_obj, function(err_proc, res_proc) {
        if (err_proc) {
            return callback(err_proc, null);
        } else if (res_proc) {
            var set_obj = {};
            if (desc != res_proc.desc) {
                set_obj.desc = desc;
                res_proc.desc = desc;
            }
            if (steps != res_proc.steps) {
                set_obj.steps = steps;
                res_proc.steps = steps;
            }
            if (Object.keys(set_obj).length > 0) {
                procSrv.updateProcById(res_proc._id, set_obj, function(err_upd, res_upd) {
                    if (err_upd) return callback(err_upd, null);
                    else return callback(null, res_proc);
                });
            } else {
                return callback(null, res_proc);
            }
        } else {
            var proc = new ProcMdl(name, desc, steps);
            procSrv.insertProc(proc, function(err_ins, res_ins) {
                if (err_ins) return callback(err_ins, null);
                else return callback(null, res_ins);
            });
        }
    });
};

exports.insOrUpdStep = function(_proc_id, platfrm_code, suprlay_code, layer_name, comp_name, type, title, description, order, next, callback) {
    findComp(platfrm_code, suprlay_code, layer_name, comp_name, function(err_comp, res_comp) {
        if (err_comp) {
            return callback(err_comp, null);
        } else {
            var find_obj = {
                '$and': []
            };
            if (_proc_id) {
                find_obj['$and'].push({
                    '_proc_id': _proc_id
                });
            }
            if (_comp_id) {
                find_obj['$and'].push({
                    '_comp_id': res_comp._id
                });
            }
            if (order) {
                find_obj['$and'].push({
                    'order': order
                });
            }
            stepSrv.findStep(find_obj, function(err_step, res_step) {
                if (err_step) {
                    return callback(err_step, null);
                } else if (res_step) {
                    var set_obj = {};
                    if (type && type != res_step.type) {
                        set_obj.type = type;
                        res_step.type = type;
                    }
                    if (title && title != res_step.title) {
                        set_obj.title = title;
                        res_step.title = title;
                    }
                    if (description && description != res_step.description) {
                        set_obj.description = description;
                        res_step.description = description;
                    }
                    if (next && next != res_step.next) {
                        set_obj.next = next;
                        res_step.next = next;
                    }
                    if (Object.keys(set_obj).length > 0) {
                        stepSrv.updateStepById(res_step._id, set_obj, function(err_upd, res_upd) {
                            if (err_upd) return callback(err_upd, null);
                            else return callback(null, res_step);
                        });
                    } else {
                        return callback(null, res_step);
                    }
                } else {
                    var step = new StepMdl(_proc_id, _comp_id, type, title, description, order, next);
                    stepSrv.insertStep(step, function(err_ins, res_ins) {
                        if (err_ins) return callback(err_ins, null);
                        else return callback(null, res_ins);
                    });
                }
            });
        }
    });
};
/*jshint +W069 */