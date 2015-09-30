var layerSrv = require('./services/layer');
var LayerMdl = require('./models/layer');

/**
 * [insOrUpdLayer description]
 *
 * @method insOrUpdLayer
 *
 * @param  {[type]}      name          [description]
 * @param  {[type]}      lang          [description]
 * @param  {[type]}      platfrm_index [description]
 * @param  {[type]}      layer_index   [description]
 * @param  {Function}    callback      [description]
 *
 * @return {[type]}      [description]
 */
exports.insOrUpdLayer = function(name, lang, order, callback) {
    layerSrv.findLayerByName(name, function(err_lay, res_lay) {
        if (err_lay) {
            return callback(err_lay, null);
        } else if (res_lay) {
            var set_obj = {};
            if (name && name != res_lay.name) {
                set_obj.name = name;
                res_lay.name = name;
            }
            if (lang && lang != res_lay.lang) {
                set_obj.lang = lang;
                res_lay.lang = lang;
            }
            if (order && order != res_lay.order) {
                set_obj.order = order;
                res_lay.order = order;
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
            var layer = new LayerMdl(name, lang, order);
            layerSrv.insertLayer(layer, function(err_ins, res_ins) {
                if (err_ins) return callback(err_ins, null);
                else return callback(null, res_ins);
            });
        }
    });
};