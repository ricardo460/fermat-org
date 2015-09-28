var compSrv = require('./services/comp');
var CompMdl = require('./models/comp');
var compDevSrv = require('./services/compDev');
var CompDevMdl = require('./models/compDev');

exports.getComps = function(callback) {
    compSrv.findAllComps({}, {}, function(err, comps) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, comps);
        }
    });
};

exports.insOrUpdComp = function(_platfrm_id, _suprlay_id, _layer_id, name, type, description, difficulty, code_level, repo_dir, callback) {
    //console.dir(arguments);
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
        //console.dir(err_comp);
        //console.dir(res_comp);
        if (err_comp) {
            //console.log('step 1')
            return callback(err_comp, null);
        } else if (res_comp) {
            //console.log('step 2')
            //TODO: update
            var set_obj = {};
            if (type != res_comp.type) {
                set_obj.type = type;
                res_comp.type = type;
            }
            if (description != res_comp.description) {
                set_obj.description = description;
                res_comp.description = description;
            }
            if (difficulty != res_comp.difficulty) {
                set_obj.difficulty = difficulty;
                res_comp.difficulty = difficulty;
            }
            if (code_level != res_comp.code_level) {
                set_obj.code_level = code_level;
                res_comp.code_level = code_level;
            }
            if (repo_dir != res_comp.repo_dir) {
                set_obj.repo_dir = repo_dir;
                res_comp.repo_dir = repo_dir;
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
            //console.log('step 3')
            //TODO: insert
            var comp = new CompMdl(_platfrm_id, _suprlay_id, _layer_id, name, type, description, difficulty, code_level, repo_dir);
            //console.dir(comp);
            compSrv.insertComp(comp, function(err_ins, res_ins) {
                if (err_ins) return callback(err_ins, null);
                else return callback(null, res_ins);
            });
        }
    })
};

exports.insOrUpdCompDev = function(_comp_id, _dev_id, role, scope, percnt, callback) {
    //console.dir(arguments);
    var find_obj = {
        '$and': []
    };
    if (_comp_id) {
        find_obj['$and'].push({
            '_comp_id': _comp_id
        });
    }
    if (_dev_id) {
        find_obj['$and'].push({
            '_dev_id': _dev_id
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
        //console.dir(err_compDev);
        //console.dir(res_compDev);
        if (err_compDev) {
            //console.log('step 1')
            return callback(err_compDev, null);
        } else if (res_compDev) {
            //console.log('step 2')
            //TODO: update
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
            //console.log('step 3')
            //TODO: insert
            var compDev = new CompDevMdl(_comp_id, _dev_id, role, scope, percnt);
            //console.dir(compDev);
            compDevSrv.insertCompDev(compDev, function(err_ins, res_ins) {
                if (err_ins) return callback(err_ins, null);
                else return callback(null, res_ins);
            });
        }
    })
};

exports.insOrUpdStatus = function(_comp_id, name, target, reached, callback) {
    //console.dir(arguments);
    var find_obj = {
        '$and': []
    };
    if (_comp_id) {
        find_obj['$and'].push({
            '_comp_id': _comp_id
        });
    }
    if (name) {
        find_obj['$and'].push({
            'name': name
        });
    }
    statusSrv.findStatus(find_obj, function(err_status, res_status) {
        //console.dir(err_status);
        //console.dir(res_status);
        if (err_status) {
            //console.log('step 1')
            return callback(err_status, null);
        } else if (res_status) {
            //console.log('step 2')
            //TODO: update
            var set_obj = {};
            if (percnt != res_status.percnt) {
                set_obj.percnt = percnt;
                res_status.percnt = percnt;
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
            //console.log('step 3')
            //TODO: insert
            var status = new StatusMdl(_comp_id, name, target, reached);
            //console.dir(status);
            statusSrv.insertStatus(status, function(err_ins, res_ins) {
                if (err_ins) return callback(err_ins, null);
                else return callback(null, res_ins);
            });
        }
    })
};