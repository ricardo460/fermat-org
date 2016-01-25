/*jshint -W069 */
var winston = require('winston');
var stepSrv = require('./services/step');
var StepMdl = require('./models/step');
var procSrv = require('./services/proc');
var ProcMdl = require('./models/proc');
var platfrmSrv = require('../platform/services/platfrm');
var suprlaySrv = require('../superlayer/services/suprlay');
var layerSrv = require('../layer/services/layer');
var compSrv = require('../component/services/comp');
/**
 * [findComp description]
 *
 * @method findComp
 *
 * @param  {[type]}   platfrm_code [description]
 * @param  {[type]}   suprlay_code [description]
 * @param  {[type]}   layer_name   [description]
 * @param  {[type]}   comp_name    [description]
 * @param  {Function} callback     [description]
 *
 * @return {[type]}   [description]
 */
var findComp = function (platfrm_code, suprlay_code, layer_name, comp_name, callback) {
    'use strict';
    try {
        layerSrv.findLayerByName(layer_name.toLowerCase(), function (err_lay, res_lay) {
            if (err_lay) {
                return callback(err_lay, null);
            }
            if (res_lay) {
                if (platfrm_code) {
                    platfrmSrv.findPlatfrmByCode(platfrm_code, function (err_pla, res_pla) {
                        if (err_pla) {
                            return callback(err_pla, null);
                        }
                        if (res_pla) {
                            compSrv.findComp({
                                _layer_id: res_lay._id,
                                name: comp_name,
                                _platfrm_id: res_pla._id
                            }, function (err_comp, res_comp) {
                                if (err_comp) {
                                    return callback(err_comp, null);
                                }
                                return callback(null, res_comp);
                            });
                        } else {
                            return callback(null, null);
                        }
                    });
                } else if (suprlay_code) {
                    suprlaySrv.findSuprlayByCode(suprlay_code, function (err_sup, res_sup) {
                        if (err_sup) {
                            return callback(err_sup, null);
                        }
                        if (res_sup) {
                            compSrv.findComp({
                                _layer_id: res_lay._id,
                                name: comp_name,
                                _suprlay_id: res_sup._id
                            }, function (err_comp, res_comp) {
                                if (err_comp) {
                                    return callback(err_comp, null);
                                }
                                return callback(null, res_comp);
                            });
                        } else {
                            return callback(null, null);
                        }
                    });
                } else {
                    return callback(new Error('invalid search'), null);
                }
            } else {
                return callback(null, null);
            }
        });
    } catch (err) {
        callback(err, null);
    }
};
/**
 * [findProcsByComp description]
 *
 * @method findProcsByComp
 *
 * @param  {[type]}        platfrm_code [description]
 * @param  {[type]}        suprlay_code [description]
 * @param  {[type]}        layer_name   [description]
 * @param  {[type]}        comp_name    [description]
 * @param  {Function}      callback     [description]
 *
 * @return {[type]}        [description]
 */
exports.findProcsByComp = function (platfrm_code, suprlay_code, layer_name, comp_name, callback) {
    'use strict';
    try {
        findComp(platfrm_code, suprlay_code, layer_name, comp_name, function (err_comp, res_comp) {
            if (err_comp) {
                return callback(err_comp, null);
            }
            stepSrv.findSteps({
                _comp_id: res_comp._id
            }, {}, function (err, steps) {
                if (err) {
                    return callback(err, null);
                }
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
                _procs.contains = function (_id) {
                    var i;
                    for (i = this.length - 1; i >= 0; i--) {
                        if (this[i]._id + ' ' === _id + ' ') {
                            return true;
                        }
                    }
                    return false;
                };
                var loopSteps = function (i) {
                    if (i < steps.length) {
                        var _step = steps[i];
                        if (_procs.contains(_step._proc_id)) {
                            loopSteps(++i);
                        } else {
                            procSrv.findAndPopulateProc({
                                _id: _step._proc_id
                            }, function (err_proc, res_proc) {
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
            });
        });
    } catch (err) {
        callback(err, null);
    }
};
/**
 * [findStepsByProc description]
 *
 * @method findStepsByProc
 *
 * @param  {[type]}        platfrm   [description]
 * @param  {[type]}        proc_name [description]
 * @param  {Function}      callback  [description]
 *
 * @return {[type]}        [description]
 */
exports.findStepsByProc = function (platfrm, proc_name, callback) {
    'use strict';
    try {
        procSrv.findAndPopulateProc({
            platfrm: platfrm.toUpperCase(),
            name: proc_name.toLowerCase()
        }, function (err, res) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, res);
        });
    } catch (err) {
        callback(err, null);
    }
};
/**
 * [insOrUpdProc description]
 *
 * @method insOrUpdProc
 *
 * @param  {[type]}     platfrm  [description]
 * @param  {[type]}     name     [description]
 * @param  {[type]}     desc     [description]
 * @param  {[type]}     prev     [description]
 * @param  {Function}   next     [description]
 * @param  {Function}   callback [description]
 *
 * @return {[type]}     [description]
 */
exports.insOrUpdProc = function (platfrm, name, desc, prev, next, callback) {
    'use strict';
    try {
        //console.dir(arguments);
        var find_obj = {
            '$and': []
        };
        if (platfrm) {
            find_obj['$and'].push({
                "platfrm": platfrm
            });
        }
        if (name) {
            find_obj['$and'].push({
                "name": name
            });
        }
        procSrv.findProc(find_obj, function (err_proc, res_proc) {
            if (err_proc) {
                return callback(err_proc, null);
            }
            if (res_proc) {
                var set_obj = {};
                if (desc !== res_proc.desc) {
                    set_obj.desc = desc;
                    res_proc.desc = desc;
                }
                if (prev !== res_proc.prev) {
                    set_obj.prev = prev;
                    res_proc.prev = prev;
                }
                if (next !== res_proc.next) {
                    set_obj.next = next;
                    res_proc.next = next;
                }
                if (Object.keys(set_obj).length > 0) {
                    procSrv.updateProcById(res_proc._id, set_obj, function (err_upd, res_upd) {
                        if (err_upd) {
                            return callback(err_upd, null);
                        }
                        return callback(null, res_proc);
                    });
                } else {
                    return callback(null, res_proc);
                }
            } else {
                var proc = new ProcMdl(platfrm, name, desc, prev, next, []);
                procSrv.insertProc(proc, function (err_ins, res_ins) {
                    if (err_ins) {
                        return callback(err_ins, null);
                    }
                    return callback(null, res_ins);
                });
            }
        });
    } catch (err) {
        callback(err, null);
    }
};
/**
 * [findProcById description]
 *
 * @method findProcById
 *
 * @param  {[type]}     _id       [description]
 * @param  {[type]}     callback  [description]
 *
 * @return {[type]}     [description]
 */
exports.findProcById = function (_id, callback) {
    procSrv.findProcById(_id, function (err_proc, res_proc) {
        if (err_proc) {
            return callback(err_proc, null);
        }
        return callback(null, res_proc);
    });
};
exports.delProcById = function (_id, callback) {
    procSrv.findProcById(_id, function (err_proc, res_proc) {
        if (err_proc) {
            return callback(err_proc, null);
        }
        if (res_proc) {
            var steps = res_proc.steps;
            var loopDelSteeps = function () {
                if (steps.length <= 0) {
                    procSrv.delSchemaById(_id, function (err_del_proc, res_del_proc) {
                        if (err_del_proc) {
                            return callback(err_del_proc, null);
                        }
                        return callback(null, res_del_proc);
                    });
                } else {
                    var _idStep = steps.pop()
                    stepSrv.delSchemaById(_idStep, function (err_del_step, res_delstep) {
                        if (err_del_step) {
                            return callback(err_del_step, null);
                        } else {
                            loopDelSteeps();
                        }
                    });
                }
            };
            loopDelSteeps();
        } else {
            return callback(null, null);
        }
    });
};
/**
 * [insOrUpdStep description]
 *
 * @method insOrUpdStep
 *
 * @param  {[type]}     _proc_id     [description]
 * @param  {[type]}     platfrm_code [description]
 * @param  {[type]}     suprlay_code [description]
 * @param  {[type]}     layer_name   [description]
 * @param  {[type]}     comp_name    [description]
 * @param  {[type]}     type         [description]
 * @param  {[type]}     title        [description]
 * @param  {[type]}     desc         [description]
 * @param  {[type]}     order        [description]
 * @param  {Function}   next         [description]
 * @param  {Function}   callback     [description]
 *
 * @return {[type]}     [description]
 */
exports.insOrUpdStep = function (_proc_id, platfrm_code, suprlay_code, layer_name, comp_name, type, title, desc, order, next, callback) {
    'use strict';
    try {
        findComp(platfrm_code, suprlay_code, layer_name, comp_name, function (err_comp, res_comp) {
            if (err_comp) {
                winston.log('info', 'component not found');
            }
            var find_obj = {
                '$and': []
            };
            if (_proc_id) {
                find_obj['$and'].push({
                    '_proc_id': _proc_id
                });
            }
            if (order) {
                find_obj['$and'].push({
                    'order': order
                });
            } else {
                order = 0;
                find_obj['$and'].push({
                    'order': order
                });
            }
            var _comp_id = res_comp && res_comp._id ? res_comp._id : null;
            stepSrv.findStep(find_obj, function (err_step, res_step) {
                if (err_step) {
                    return callback(err_step, null);
                }
                if (res_step) {
                    var set_obj = {};
                    if (_comp_id && _comp_id !== res_step._comp_id) {
                        set_obj._comp_id = _comp_id;
                        res_step._comp_id = _comp_id;
                    }
                    if (type && type !== res_step.type) {
                        set_obj.type = type;
                        res_step.type = type;
                    }
                    if (title && title !== res_step.title) {
                        set_obj.title = title;
                        res_step.title = title;
                    }
                    if (desc && desc !== res_step.desc) {
                        set_obj.desc = desc;
                        res_step.desc = desc;
                    }
                    if (next && next !== res_step.next) {
                        set_obj.next = next;
                        res_step.next = next;
                    }
                    if (Object.keys(set_obj).length > 0) {
                        stepSrv.updateStepById(res_step._id, set_obj, function (err_upd, res_upd) {
                            if (err_upd) {
                                return callback(err_upd, null);
                            }
                            return callback(null, res_step);
                        });
                    } else {
                        return callback(null, res_step);
                    }
                } else {
                    var step = new StepMdl(_proc_id, res_comp ? res_comp._id : null, type, title, desc, order, next);
                    stepSrv.insertStep(step, function (err_ins, res_ins) {
                        if (err_ins) {
                            return callback(err_ins, null);
                        }
                        return callback(null, res_ins);
                    });
                }
            });
        });
    } catch (err) {
        callback(err, null);
    }
};
/**
 * [getAllProces description]
 *
 * @method getAllProces
 *
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.getAllProces = function (callback) {
    'use strict';
    try {
        procSrv.findAllProcs({}, {}, function (err, procs) {
            if (err) {
                return callback(err, null);
            }
            var loopProcs = function (j) {
                if (j < procs.length) {
                    var _proc = procs[j];
                    stepSrv.findSteps({
                        _proc_id: _proc._id
                    }, {}, function (err, steps) {
                        if (err) {
                            return callback(err, null);
                        }
                        var _procs = [];
                        var _steps = [];
                        /**
                         * [contains description]
                         *
                         * @method contains
                         *
                         * @param  {[type]} _id [description]
                         *
                         * @return {[type]} [description]
                         */
                        _procs.contains = function (_id) {
                            var i;
                            for (i = this.length - 1; i >= 0; i--) {
                                if (this[i]._id + ' ' === _id + ' ') {
                                    return true;
                                }
                            }
                            return false;
                        };
                        var loopSteps = function (i) {
                            if (i < steps.length) {
                                var _step = steps[i];
                                if (_procs.contains(_step._proc_id)) {
                                    loopSteps(++i);
                                } else {
                                    procSrv.findAndPopulateProc({
                                        _id: _step._proc_id
                                    }, function (err_proc, res_proc) {
                                        if (err_proc) {
                                            loopSteps(++i);
                                        } else {
                                            _procs.push(res_proc);
                                            _steps = res_proc.steps;
                                            loopSteps(++i);
                                        }
                                    });
                                }
                            } else {
                                procs[j].steps = _steps;
                                loopProcs(++j);
                            }
                        };
                        loopSteps(0);
                    });
                } else {
                    return callback(null, procs);
                }
            }
            loopProcs(0);
        });
    } catch (err) {
        return callback(err, null);
    }
};
/**
 * [delAllProcs description]
 *
 * @method delAllProcs
 *
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.delAllProcs = function (callback) {
    'use strict';
    try {
        procSrv.delAllProcs(function (err, procs) {
            if (err) {
                return callback(err, null);
            }
            stepSrv.delAllSteps(function (err, steps) {
                if (err) {
                    return callback(err, null);
                }
                return callback(null, true);
            });
        });
    } catch (err) {
        return callback(err, null);
    }
};
/*jshint +W069 */