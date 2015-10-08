var procMod = require('./process');
var compMod = require('./component');
var layerMod = require('./layer');
var suprlayMod = require('./superlayer');
var platfrmMod = require('./platform');
var loadLib = require('./libs/loader');

/**
 * [getComps description]
 *
 * @method getComps
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.getComps = function(req, next) {
    try {
        var res = {};
        platfrmMod.getPlatfrms(function(err, platfrms) {
            if (err) {
                next(err, null);
            } else {
                res.platfrms = platfrms;
                suprlayMod.getSuprlays(function(err, suprlays) {
                    if (err) {
                        next(err, null);
                    } else {
                        res.suprlays = suprlays;
                        layerMod.getLayers(function(err, layers) {
                            if (err) {
                                next(err, null);
                            } else {
                                res.layers = layers;
                                compMod.getComps(function(err, comps) {
                                    if (err) {
                                        next(err, null);
                                    } else {
                                        res.comps = comps;
                                        next(null, res);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    } catch (err) {
        next(err, null);
    }
};

/**
 * [loadComps description]
 *
 * @method loadComps
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.loadComps = function(req, next) {
    try {
        loadLib.loadComps(function(err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }
};

/**
 * [updComps description]
 *
 * @method updComps
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.updComps = function(req, next) {
    try {
        loadLib.updComps(function(err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }
};

/**
 * [updDevs description]
 *
 * @method updDevs
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.updDevs = function(req, next) {
    try {
        loadLib.updDevs(function(err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }
};