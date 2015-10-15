'use strict';
var procMod = require('./process');
var compMod = require('./component');
var layerMod = require('./layer');
var suprlayMod = require('./superlayer');
var platfrmMod = require('./platform');
var loadLib = require('./lib/loader');

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
exports.getComps = function (req, next) {
    try {
        var res = {};
        platfrmMod.getPlatfrms(function (err, platfrms) {
            if (err) {
                next(err, null);
            } else {
                res.platfrms = platfrms;
                suprlayMod.getSuprlays(function (err, suprlays) {
                    if (err) {
                        next(err, null);
                    } else {
                        res.suprlays = suprlays;
                        layerMod.getLayers(function (err, layers) {
                            if (err) {
                                next(err, null);
                            } else {
                                res.layers = layers;
                                compMod.getComps(function (err, comps) {
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
exports.loadComps = function (req, next) {
    try {
        loadLib.loadComps(function (err, res) {
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
exports.updComps = function (req, next) {
    try {
        loadLib.updComps(function (err, res) {
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
exports.updDevs = function (req, next) {
    try {
        loadLib.updDevs(function (err, res) {
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

exports.getProcs = function (req, next) {
    try {
        var platfrm_code;
        if ((req.query.platform || req.query.superlayer) &&
            req.query.layer &&
            req.query.component) {
            platfrm_code = req.query.platform ? req.query.platform.toUpperCase() : null;
            var suprlay_code = req.query.superlayer ? req.query.superlayer.toUpperCase() : null,
                layer_name = req.query.layer ? req.query.layer.toLowerCase() : null,
                comp_name = req.query.component ? req.query.component.toLowerCase() : null;
            procMod.findProcsByComp(platfrm_code,
                suprlay_code,
                layer_name,
                comp_name, function (err, res) {
                    if (err) {
                        next(err, null);
                    } else {
                        next(null, res);
                    }
                });
        } else if (req.query.platform && req.query.name) {
            platfrm_code = req.query.platform ? req.query.platform.toUpperCase() : null;
            var name = req.query.name ? req.query.name.toLowerCase() : null;
            procMod.findStepsByProc(platfrm_code, name, function (err, res) {
                if (err) {
                    next(err, null);
                } else {
                    next(null, res);
                }
            });
        } else {
            next(new Error('incomplete data'), null);
        }
    } catch (err) {
        next(err, null);
    }
};