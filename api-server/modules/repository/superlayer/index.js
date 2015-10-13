var suprlaySrv = require('./services/suprlay');
var SuprlayMdl = require('./models/suprlay');

function getOrder(code) {
    var order = -1;
    switch (code) {
        case 'P2P':
            order = 0;
            break;
        case 'BCH':
            order = 1;
            break;
        case 'OSA':
            order = 2;
            break;
        default:
            order = -1;
            break;
    }
    return order;
}

/**
 * [insOrUpdSuprlay description]
 *
 * @method insOrUpdSuprlay
 *
 * @param  {[type]}        code          [description]
 * @param  {[type]}        name          [description]
 * @param  {[type]}        logo          [description]
 * @param  {[type]}        deps          [description]
 * @param  {[type]}        platfrm_index [description]
 * @param  {[type]}        layer_index   [description]
 * @param  {Function}      callback      [description]
 *
 * @return {[type]}        [description]
 */
exports.insOrUpdSuprlay = function(code, name, logo, deps, order, callback) {
    order = code ? getOrder(code) : null;
    suprlaySrv.findSuprlayByCode(code, function(err_supr, res_supr) {
        if (err_supr) {
            return callback(err_supr, null);
        } else if (res_supr) {
            var set_obj = {};
            if (name && name != res_supr.name) {
                set_obj.name = name;
                res_supr.name = name;
            }
            if (logo && logo != res_supr.logo) {
                set_obj.logo = logo;
                res_supr.logo = logo;
            }
            if (deps && deps != res_supr.deps) {
                set_obj.deps = deps;
                res_supr.deps = deps;
            }
            if (order && order != res_supr.order) {
                set_obj.order = order;
                res_supr.order = order;
            }
            if (Object.keys(set_obj).length > 0) {
                suprlaySrv.updateSuprlayById(res_supr._id, set_obj, function(err_upd, res_upd) {
                    if (err_upd) return callback(err_upd, null);
                    else return callback(null, res_supr);
                });
            } else {
                return callback(null, res_supr);
            }
        } else {
            var suprlay = new SuprlayMdl(code, name, logo, deps, order);
            suprlaySrv.insertSuprlay(suprlay, function(err_ins, res_ins) {
                if (err_ins) return callback(err_ins, null);
                else return callback(null, res_ins);
            });
        }
    });
};

/**
 * [getSuprlays description]
 *
 * @method getSuprlays
 *
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.getSuprlays = function(callback) {
    suprlaySrv.findAllSuprlays({}, {
        order: 1
    }, function(err, suprlays) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, suprlays);
        }
    });
};