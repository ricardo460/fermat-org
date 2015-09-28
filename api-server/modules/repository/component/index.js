var compSrv = require('./services/comp');
var CompMdl = require('./models/comp');

exports.getComps = function(callback) {
    compSrv.findAllComps({}, {}, function(err, comps) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, comps);
        }
    });
};

exports.insOrUpdComp = function(_platfrm_id, _suprlay_id, _layer_id, name, type, description, difficulty, code_level, devs, certs, life_cycle, callback) {
    //console.dir(arguments);
    var find_obj = {};
    if (_platfrm_id) {
        find_obj._platfrm_id = _platfrm_id;
    }
    if (_suprlay_id) {
        find_obj._suprlay_id = _suprlay_id;
    }
    if (_layer_id) {
        find_obj._layer_id = _layer_id;
    }
    if (name) {
        find_obj.name = name;
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
            if (devs != res_comp.devs) {
                set_obj.devs = devs;
                res_comp.devs = devs;
            }
            if (certs != res_comp.certs) {
                set_obj.certs = certs;
                res_comp.certs = certs;
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
            //console.log('step 3')
            //TODO: insert
            var comp = new CompMdl(_platfrm_id, _suprlay_id, _layer_id, name, type, description, difficulty, code_level);
            //console.dir(comp);
            compSrv.insertComp(comp, function(err_ins, res_ins) {
                if (err_ins) return callback(err_ins, null);
                else return callback(null, res_ins);
            });
        }
    })
};