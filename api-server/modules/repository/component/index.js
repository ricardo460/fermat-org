var compSrv = require('./services/comp');
var loadLib = require('../libs/loader');
var platfrmMod = require('../platform');
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
    loadLib.loadComps(function(err_load, res_load) {
        if (err_load) console.dir(err_load);
        else {
            if (res_load.platfrms && Array.isArray(res_load.platfrms)) {
                for (var i = 0; i < res_load.platfrms.length; i++) {
                    //console.dir(res_load.platfrms[i]);
                    platfrmMod.insOrUpdPlatfrm(res_load.platfrms[i].code, 
                        res_load.platfrms[i].name, 
                        res_load.platfrms[i].logo, 
                        res_load.platfrms[i].dependsOn.split(' ').join('').split(','), 
                        0, 
                        0, 
                        function(err_plat, res_plat) {
                        if (err_plat) console.dir(err_plat);
                        else console.dir(res_plat);
                    });
                }
            }
        }
    });
};

loadComps();