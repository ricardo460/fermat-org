var platfrmSrv = require('./services/platfrm');
var PlatfrmMdl = require('./models/platfrm');

/**
 * [getOrder description]
 *
 * @method getOrder
 *
 * @param  {[type]} code [description]
 *
 * @return {[type]} [description]
 */
function getOrder(code) {
    'use strict';
    var order = -1;
    switch (code) {
    case 'COR':
        order = 0;
        break;
    case 'PIP':
        order = 1;
        break;
    case 'WPD':
        order = 2;
        break;
    case 'CCP':
        order = 3;
        break;
    case 'CCM':
        order = 4;
        break;
    case 'BNP':
        order = 5;
        break;
    case 'SHP':
        order = 6;
        break;
    case 'DAP':
        order = 7;
        break;
    case 'MKT':
        order = 8;
        break;
    case 'CSH':
        order = 9;
        break;
    case 'BNK':
        order = 10;
        break;
    case 'CBP':
        order = 11;
        break;
    case 'CDN':
        order = 12;
        break;
    case 'DPN':
        order = 13;
        break;
    default:
        order = -1;
        break;
    }
    return order;
}


/**
 * [insOrUpdPlatfrm description]
 *
 * @method insOrUpdPlatfrm
 *
 * @param  {[type]}        code          [description]
 * @param  {[type]}        name          [description]
 * @param  {[type]}        logo          [description]
 * @param  {[type]}        deps          [description]
 * @param  {[type]}        order         [description]
 * @param  {Function}      callback      [description]
 *
 * @return {[type]}        [description]
 */
exports.insOrUpdPlatfrm = function (code, name, logo, deps, order, callback) {
    'use strict';
    try {
        order = code ? getOrder(code) : null;
        platfrmSrv.findPlatfrmByCode(code, function (err_plat, res_plat) {
            if (err_plat) {
                return callback(err_plat, null);
            }
            if (res_plat) {
                var set_obj = {};
                if (name && name !== res_plat.name) {
                    set_obj.name = name;
                    res_plat.name = name;
                }
                if (logo && logo !== res_plat.logo) {
                    set_obj.logo = logo;
                    res_plat.logo = logo;
                }
                if (deps && deps !== res_plat.deps) {
                    set_obj.deps = deps;
                    res_plat.deps = deps;
                }
                if (order && order !== res_plat.order) {
                    set_obj.order = order;
                    res_plat.order = order;
                }
                if (Object.keys(set_obj).length > 0) {
                    platfrmSrv.updatePlatfrmById(res_plat._id, set_obj, function (err_upd, res_upd) {
                        if (err_upd) {
                            return callback(err_upd, null);
                        }
                        return callback(null, res_plat);
                    });
                } else {
                    return callback(null, res_plat);
                }
            } else {
                var platfrm = new PlatfrmMdl(code, name, logo, deps, order);
                platfrmSrv.insertPlatfrm(platfrm, function (err_ins, res_ins) {
                    if (err_ins) {
                        return callback(err_ins, null);
                    }
                    return callback(null, res_ins);
                });
            }
        });
    } catch (err) {
        callback(err, null);
    }

};

/**
 * [getPlatfrms description]
 *
 * @method getPlatfrms
 *
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.getPlatfrms = function (callback) {
    'use strict';
    try {
        platfrmSrv.findAllPlatfrms({}, {
            order: 1
        }, function (err, platfrms) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, platfrms);
            }
        });
    } catch (err) {
        callback(err, null);
    }

};