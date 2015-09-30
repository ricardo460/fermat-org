var layerSrv = require('./services/layer');
var LayerMdl = require('./models/layer');

exports.insOrUpdLayer = function(name, lang, platfrm_index, layer_index, callback) {
    //console.dir(arguments);
    layerSrv.findLayerByName(name, function(err_lay, res_lay) {
        //console.dir(err_lay);
        //console.dir(res_lay);
        if (err_lay) {
            //console.log('step 1')
            return callback(err_lay, null);
        } else if (res_lay) {
            //console.log('step 2')
            //TODO: update
            var set_obj = {};
            if (name && name != res_lay.name) {
                set_obj.name = name;
                res_lay.name = name;
            }
            if (lang && lang != res_lay.lang) {
                set_obj.lang = lang;
                res_lay.lang = lang;
            }
            if (platfrm_index && platfrm_index != res_lay.platfrm_index) {
                set_obj.platfrm_index = platfrm_index;
                res_lay.platfrm_index = platfrm_index;
            }
            if (layer_index && layer_index != res_lay.layer_index) {
                set_obj.layer_index = layer_index;
                res_lay.layer_index = layer_index;
            }
            if (Object.keys(set_obj).length > 0) {
                layerSrv.updateLayerById(res_lay._id, set_obj, function(err_upd, res_upd) {
                    if (err_upd) return callback(err_upd, null);
                    else return callback(null, res_lay);
                });
            } else {
                return callback(null, res_lay);
            }
        } else {
            //console.log('step 3')
            //TODO: insert
            var layer = new LayerMdl(name, lang, layer_index, layer_index);
            layerSrv.insertLayer(layer, function(err_ins, res_ins) {
                if (err_ins) return callback(err_ins, null);
                else return callback(null, res_ins);
            });
        }
    })
};