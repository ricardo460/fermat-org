/*jshint -W069 */
var compSrv = require('./services/comp');
var CompMdl = require('./models/comp');
var compDevSrv = require('./services/compDev');
var CompDevMdl = require('./models/compDev');
var statusSrv = require('./services/status');
var StatusMdl = require('./models/status');

exports.getComps = function(callback) {
    compSrv.findAllComps({}, {}, function(err, comps) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, comps);
        }
    });
};

exports.findComps = function(callback) {
    compSrv.findComps({}, {}, function(err, comps) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, comps);
        }
    });
};

exports.insOrUpdComp = function(_platfrm_id, _suprlay_id, _layer_id, name, type, description, difficulty, code_level, repo_dir, found, callback) {
    var find_obj = {
        '$and': []
    };
    if (_platfrm_id) {
        find_obj['$and'].push({
            '_platfrm_id': _platfrm_id
        });
    }
    if (_suprlay_id) {
        find_obj['$and'].push({
            '_suprlay_id': _suprlay_id
        });
    }
    if (_layer_id) {
        find_obj['$and'].push({
            '_layer_id': _layer_id
        });
    }
    if (name) {
        find_obj['$and'].push({
            'name': name
        });
    }
    compSrv.findComp(find_obj, function(err_comp, res_comp) {
        if (err_comp) {
            return callback(err_comp, null);
        } else if (res_comp) {
            var set_obj = {};
            if (type && type != res_comp.type) {
                set_obj.type = type;
                res_comp.type = type;
            }
            if (description && description != res_comp.description) {
                set_obj.description = description;
                res_comp.description = description;
            }
            if (difficulty && difficulty != res_comp.difficulty) {
                set_obj.difficulty = difficulty;
                res_comp.difficulty = difficulty;
            }
            if (code_level && code_level != res_comp.code_level) {
                set_obj.code_level = code_level;
                res_comp.code_level = code_level;
            }
            if (repo_dir && repo_dir != res_comp.repo_dir) {
                set_obj.repo_dir = repo_dir;
                res_comp.repo_dir = repo_dir;
            }
            if (found && found != res_comp.found) {
                set_obj.found = found;
                res_comp.found = found;
            }
            if (Object.keys(set_obj).length > 0) {
                compSrv.updateCompById(res_comp._id, set_obj, function(err_upd, res_upd) {
                    if (err_upd) return callback(err_upd, null);
                    else return callback(null, res_comp);
                });
            } else {
                return callback(null, res_comp);
            }
        } else {
            var comp = new CompMdl(_platfrm_id, _suprlay_id, _layer_id, name, type, description, difficulty, code_level, repo_dir);
            compSrv.insertComp(comp, function(err_ins, res_ins) {
                if (err_ins) return callback(err_ins, null);
                else return callback(null, res_ins);
            });
        }
    });
};

exports.insOrUpdCompDev = function(_comp_id, _dev_id, role, scope, percnt, callback) {
    var find_obj = {
        '$and': []
    };
    if (_comp_id) {
        find_obj['$and'].push({
            "name": _comp_id
        });
    }
    if (_dev_id) {
        find_obj['$and'].push({
            "desc": _dev_id
        });
    }
    if (role) {
        find_obj['$and'].push({
            'role': role
        });
    }
    if (scope) {
        find_obj['$and'].push({
            'scope': scope
        });
    }
    compDevSrv.findCompDev(find_obj, function(err_compDev, res_compDev) {
        if (err_compDev) {
            return callback(err_compDev, null);
        } else if (res_compDev) {
            var set_obj = {};
            if (percnt != res_compDev.percnt) {
                set_obj.percnt = percnt;
                res_compDev.percnt = percnt;
            }
            if (Object.keys(set_obj).length > 0) {
                compDevSrv.updateCompDevById(res_compDev._id, set_obj, function(err_upd, res_upd) {
                    if (err_upd) return callback(err_upd, null);
                    else return callback(null, res_compDev);
                });
            } else {
                return callback(null, res_compDev);
            }
        } else {
            var compDev = new CompDevMdl(_comp_id, _dev_id, role, scope, percnt);
            compDevSrv.insertCompDev(compDev, function(err_ins, res_ins) {
                if (err_ins) return callback(err_ins, null);
                else return callback(null, res_ins);
            });
        }
    });
};

exports.insOrUpdStatus = function(_comp_id, name, target, reached, callback) {
    var find_obj = {
        '$and': []
    };
    if (_comp_id) {
        find_obj['$and'].push({
            "name": _comp_id
        });
    }
    if (name) {
        find_obj['$and'].push({
            'name': name
        });
    }
    statusSrv.findStatus(find_obj, function(err_status, res_status) {
        if (err_status) {
            return callback(err_status, null);
        } else if (res_status) {
            var set_obj = {};
            if (target != res_status.target) {
                set_obj.target = target;
                res_status.target = target;
            }
            if (reached != res_status.reached) {
                set_obj.reached = reached;
                res_status.reached = reached;
            }
            if (Object.keys(set_obj).length > 0) {
                statusSrv.updateStatusById(res_status._id, set_obj, function(err_upd, res_upd) {
                    if (err_upd) return callback(err_upd, null);
                    else return callback(null, res_status);
                });
            } else {
                return callback(null, res_status);
            }
        } else {
            var status = new StatusMdl(_comp_id, name, target, reached);
            statusSrv.insertStatus(status, function(err_ins, res_ins) {
                if (err_ins) return callback(err_ins, null);
                else return callback(null, res_ins);
            });
        }
    });
};

exports.updCompDevAndLifCyc = function(_comp_id, devs, life_cycle, callback) {
    compSrv.findCompById(_comp_id, function(err_comp, res_comp) {
        if (err_comp) {
            return callback(err_comp, null);
        } else if (res_comp) {
            var set_obj = {};
            if (devs != res_comp.devs) {
                set_obj.devs = devs;
                res_comp.devs = devs;
            }
            if (life_cycle != res_comp.life_cycle) {
                set_obj.life_cycle = life_cycle;
                res_comp.life_cycle = life_cycle;
            }
            if (Object.keys(set_obj).length > 0) {
                compSrv.updateCompById(res_comp._id, set_obj, function(err_upd, res_upd) {
                    if (err_upd) return callback(err_upd, null);
                    else return callback(null, res_comp);
                });
            } else {
                return callback(null, res_comp);
            }
        } else {
            return callback(null, null);
        }
    });
};
/*jshint +W069 */