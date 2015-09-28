var suprlaySrv = require('./services/suprlay');
var SuprlayMdl = require('./models/suprlay');

exports.insOrUpdSuprlay = function(code, name, logo, deps, platfrm_index, layer_index, callback) {
    //console.dir(arguments);
    suprlaySrv.findSuprlayByCode(code, function(err_supr, res_supr) {
        //console.dir(err_supr);
        //console.dir(res_supr);
        if (err_supr) {
            //console.log('step 1')
            return callback(err_supr, null);
        } else if (res_supr) {
            //console.log('step 2')
            //TODO: update
            var set_obj = {};
            if (name != res_supr.name) {
                set_obj.name = name;
                res_supr.name = name;
            }
            if (logo != res_supr.logo) {
                set_obj.logo = logo;
                res_supr.logo = logo;
            }
            if (deps != res_supr.deps) {
                set_obj.deps = deps;
                res_supr.deps = deps;
            }
            if (platfrm_index != res_supr.platfrm_index) {
                set_obj.platfrm_index = platfrm_index;
                res_supr.platfrm_index = platfrm_index;
            }
            if (layer_index != res_supr.layer_index) {
                set_obj.layer_index = layer_index;
                res_supr.layer_index = layer_index;
            }
            if (Object.keys(set_obj).length > 0) {
                suprlaySrv.updateSuprlayById(res_supr._id, set_obj, function(err_upd, res_upd) {
                    if (err_upd) return callback(err_upd, null);
                    else return callback(null, res_supr);
                });
            } else {
                return callback(null, res_supr);
            }
        } else {
            //console.log('step 3')
            //TODO: insert
            var suprlay = new SuprlayMdl(code, name, logo, deps, platfrm_index, layer_index);
            suprlaySrv.insertSuprlay(suprlay, function(err_ins, res_ins) {
                if (err_ins) return callback(err_ins, null);
                else return callback(null, res_ins);
            });
        }
    });
};