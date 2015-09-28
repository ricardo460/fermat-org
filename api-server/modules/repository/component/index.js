var async = require('async');
var compSrv = require('./services/comp');
var loadLib = require('../libs/loader');
var platfrmMod = require('../platform');
var layerMod = require('../layer');
var db = require('../../../db');

exports.getComps = function(callback) {
    compSrv.findAllComps({}, {}, function(err, comps) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, comps);
        }
    });
};

var loadComps = function() {
    try {
        loadLib.loadComps(function(err_load, res_load) {
            if (err_load) console.dir(err_load);
            else {
                if (res_load.platfrms && Array.isArray(res_load.platfrms)) {
                    var _platfrms = res_load.platfrms;

                    function loopPlatfrms(i) {
                        if (i < _platfrms.length) {
                            var _platfrm = _platfrms[i];
                            platfrmMod.insOrUpdPlatfrm(_platfrm.code.trim().toUpperCase(),
                                _platfrm.name.trim().toLowerCase(),
                                _platfrm.logo,
                                _platfrm.dependsOn.split(' ').join('').split(','),
                                0,
                                0,
                                function(err_plat, res_plat) {
                                    if (err_plat) {
                                        loopPlatfrms(++i);
                                    } else {
                                        var _layers = _platfrm.layers;

                                        function loopLayers(j) {
                                            if (j < _layers.length) {
                                                var _layer = _layers[j];
                                                layerMod.insOrUpdLayer(_layer.name ? _layer.name.trim().toLowerCase() : null,
                                                    _layer.language ? _layer.language.toLowerCase() : null,
                                                    0,
                                                    0,
                                                    function(err_lay, res_lay) {
                                                        if (err_lay) {
                                                            loopLayers(++j);
                                                        } else {
                                                            //console.dir(_layer);
                                                            var _comps = _layer.comps;

                                                            function loopComps(k) {
                                                                if (k < _comps.length) {
                                                                    console.dir(_comps[k]);
                                                                    loopComps(++k);
                                                                } else {
                                                                    loopLayers(++j);
                                                                }
                                                            }
                                                            loopComps(0);
                                                        }
                                                    });
                                            } else {
                                                loopPlatfrms(++i);
                                            }
                                        };
                                        loopLayers(0);
                                    }
                                });
                        } else {
                            //callback
                        }
                    };
                    loopPlatfrms(0);
                }
            }
        });
    } catch (err) {
        console.dir(err);
    }
};

loadComps();