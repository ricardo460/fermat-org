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
exports.insOrUpdLayer = function (name, lang, suprlay, order, callback) {
    'use strict';
    try {
        layerSrv.findLayerByName(name, function (err_lay, res_lay) {
            if (err_lay) {
                return callback(err_lay, null);
            }
            if (res_lay) {
                var set_obj = {};
                if (name && name !== res_lay.name) {
                    set_obj.name = name;
                    res_lay.name = name;
                }
                if (lang && lang !== res_lay.lang) {
                    set_obj.lang = lang;
                    res_lay.lang = lang;
                }
                if (suprlay && suprlay !== res_lay.suprlay) {
                    set_obj.suprlay = suprlay;
                    res_lay.suprlay = suprlay;
                }
                if (order !== -1 && order !== res_lay.order) {
                    set_obj.order = order;
                    res_lay.order = order;
                }
                if (Object.keys(set_obj).length > 0) {
                    layerSrv.updateLayerById(res_lay._id, set_obj, function (err_upd, res_upd) {
                        if (err_upd) {
                            return callback(err_upd, null);
                        }
                        return callback(null, res_lay);
                    });
                } else {
                    return callback(null, res_lay);
                }
            } else {
                if (name && lang) {
                    var layer = new LayerMdl(name, lang, suprlay || null, order);
                    layerSrv.insertLayer(layer, function (err_ins, res_ins) {
                        if (err_ins) {
                            return callback(err_ins, null);
                        }
                        return callback(null, res_ins);
                    });
                } else {
                    return callback(null, null);
                }
            }
        });
    } catch (err) {
        return callback(err, null);
    }
};

/**
 * [getLayers description]
 *
 * @method getLayers
 *
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.getLayers = function (callback) {
    'use strict';
    try {
        layerSrv.findAllLayers({}, {
            order: 1
        }, function (err, layers) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, layers);
        });
    } catch (err) {
        return callback(err, null);
    }
};