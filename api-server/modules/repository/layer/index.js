var layerSrv = require('./services/layer');
var LayerMdl = require('./models/layer');
/**
 * [sort description]
 *
 * @method sort
 *
 * @param  {[type]} point [description]
 * @param  {[type]} dir   [description]
 *
 * @return {[type]} [description]
 */
var swapOrder = function (action, oldSpot, newSpot, callback) {
    if (action == 'insert') {
        var range = newSpot - 1;
        var query = {
            'order': {
                '$gt': range
            }
        };
        var set = {
            '$inc': {
                'order': 1
            }
        };
        layerSrv.updateLayers(query, set, function (err_srt, res_srt) {
            if (err_srt) {
                return callback(err_srt, null);
            } else {
                return callback(null, res_srt);
            }
        });
    } else if (action == 'update') {
        var rangeMin = oldSpot;
        var rangeMax = newSpot + 1;
        var query = {
            '$and': [{
                'order': {
                    '$gt': rangeMin
                }
            }, {
                'order': {
                    '$lt': rangeMax
                }
            }]
        };
        var set = {
            '$inc': {
                'order': -1
            }
        };
        layerSrv.updateLayers(query, set, function (err_srt, res_srt) {
            if (err_srt) {
                return callback(err_srt, null);
            } else {
                return callback(null, res_srt);
            }
        });
    } else {
        return callback(new Error('invalid swap action'), null);
    }
};
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
                    if (typeof set_obj.order != 'undefined' && set_obj.order > -1) {
                        swapOrder('update', res_lay.order, set_obj.order, function (err_sld, res_sld) {
                            if (err_sld) {
                                return callback(err_sld, null):
                            } else {
                                layerSrv.updateLayerById(res_lay._id, set_obj, function (err_upd, res_upd) {
                                    if (err_upd) {
                                        return callback(err_upd, null);
                                    }
                                    return callback(null, res_lay);
                                });
                            }
                        });
                    } else {
                        layerSrv.updateLayerById(res_lay._id, set_obj, function (err_upd, res_upd) {
                            if (err_upd) {
                                return callback(err_upd, null);
                            }
                            return callback(null, res_lay);
                        });
                    }
                } else {
                    return callback(null, res_lay);
                }
            } else {
                if (name && lang) {
                    // TODO: pre-ordering
                    var layer = new LayerMdl(name, lang, suprlay || null, order);
                    swapOrder('insert', null, layer.order, function (err_sld, res_sld) {
                        if (err_sld) {
                            return callback(err_sld, null):
                        } else {
                            layerSrv.insertLayer(layer, function (err_ins, res_ins) {
                                if (err_ins) {
                                    return callback(err_ins, null);
                                }
                                return callback(null, res_ins);
                            });
                        }
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
/**
 * [delAllLayers description]
 *
 * @method delAllLayers
 *
 * @param  {Function}   callback [description]
 *
 * @return {[type]}     [description]
 */
exports.delAllLayers = function (callback) {
    'use strict';
    try {
        layerSrv.delAllLayers(function (err, layers) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, true);
        });
    } catch (err) {
        return callback(err, null);
    }
};
/**
 * [findLayerById description]
 *
 * @method findLayerById
 *
 * @param  {[type]}     _id       [description]
 * @param  {[type]}     callback  [description]
 *
 * @return {[type]}     [description]
 */
exports.findLayerById = function (_id, callback) {
    layerSrv.findLayerById(_id, function (err_lay, res_lay) {
        if (err_lay) {
            return callback(err_lay, null);
        }
        return callback(null, res_lay);
    });
};
/**
 * [updateLayerById description]
 *
 * @method updateLayerById
 *
 *
 * @param  {[type]}     _lay_id         [description]
 * @param  {[type]}     name            [description]
 * @param  {[type]}     lang            [description]
 * @param  {[type]}     suprlay         [description]
 * @param  {[type]}     order           [description]
 * @param  {Function}   callback        [description]
 *
 * @return {[type]}    [description]
 */
exports.updateLayerById = function (_lay_id, name, lang, suprlay, order, callback) {
    'use strict';
    try {
        var set_obj = {};
        if (name) {
            set_obj.name = name;
        }
        if (lang) {
            set_obj.lang = lang;
        }
        if (suprlay) {
            set_obj.suprlay = suprlay;
        }
        if (order) {
            set_obj.order = order;
        }
        layerSrv.updateLayerById(_lay_id, set_obj, function (err, lay) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, lay);
        });
    } catch (err) {
        return callback(err, null);
    }
};
/**
 * [deleteLayerById description]
 *
 * @method deleteLayerById
 *
 * @param  {[type]}        _id      [description]
 * @param  {Function}      callback [description]
 *
 * @return {[type]}        [description]
 */
exports.deleteLayerById = function (_id, callback) {
    'use strict';
    try {
        layerSrv.findLayerById(_id, function (err_lay, res_lay) {
            if (err_lay) {
                return callback(err_lay, null);
            }
            // ordering function
            slideOrder(res_lay.order, '>', -1, function (err_sld, res_sld) {
                if (err_sld) {
                    return callback(err_sld, null):
                } else {
                    layerSrv.delLayerById(res_lay._id, function (err_del, res_del) {
                        if (err_upd) {
                            return callback(err_del, null);
                        }
                        return callback(null, res_lay);
                    });
                }
            });
        });
    } catch (err) {
        return callback(err, null);
    }
};