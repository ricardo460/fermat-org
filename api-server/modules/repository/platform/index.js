var platfrmSrv = require('./services/platfrm');
var PlatfrmMdl = require('./models/platfrm');

exports.insOrUpdPlatfrm = function(code, name, logo, deps, platfrm_index, layer_index, callback) {
    //console.dir(arguments);
    platfrmSrv.findPlatfrmByCode(code, function(err_plat, res_plat) {
        //console.dir(err_plat);
        //console.dir(res_plat);
        if (err_plat) {
            //console.log('step 1')
            return callback(err_plat, null);
        } else if (res_plat) {
            //console.log('step 2')
            //TODO: update
            var set_obj = {};
            if (name != res_plat.name) {
                set_obj.name = name;
                res_plat.name = name;
            }
            if (logo != res_plat.logo) {
                set_obj.logo = logo;
                res_plat.logo = logo;
            }
            if (deps != res_plat.deps) {
                set_obj.deps = deps;
                res_plat.deps = deps;
            }
            if (platfrm_index != res_plat.platfrm_index) {
                set_obj.platfrm_index = platfrm_index;
                res_plat.platfrm_index = platfrm_index;
            }
            if (layer_index != res_plat.layer_index) {
                set_obj.layer_index = layer_index;
                res_plat.layer_index = layer_index;
            }
            if (Object.keys(set_obj).length > 0) {
                platfrmSrv.updatePlatfrmById(res_plat._id, set_obj, function(err_upd, res_upd) {
                    if (err_upd) return callback(err_upd, null);
                    else return callback(null, res_plat);
                });
            } else {
                return callback(null, res_plat);
            }
        } else {
            //console.log('step 3')
            //TODO: insert
            var platfrm = new PlatfrmMdl(code, name, logo, deps, platfrm_index, layer_index);
            platfrmSrv.insertPlatfrm(platfrm, function(err_ins, res_ins) {
                if (err_ins) return callback(err_ins, null);
                else return callback(null, res_ins);
            });
        }
    });
};