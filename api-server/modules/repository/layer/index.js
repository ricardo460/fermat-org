var layerSrv = require('./services/layer');
var LayerMdl = require('./models/layer');

/**
 * [getOrder description]
 *
 * @method getOrder
 *
 * @param  {[type]} name [description]
 *
 * @return {[type]} [description]
 */
function getOrder(name) {
    var order = -1;
    switch (name) {
        case 'core':
            order = 0;
            break;
        case 'niche wallet':
            order = 1;
            break;
        case 'reference wallet':
            order = 2;
            break;
        case 'sub app':
            order = 3;
            break;
        case 'dektop':
            order = 4;
            break;
        case 'engine':
            order = 5;
            break;
        case 'wallet module':
            order = 6;
            break;
        case 'sub app module':
            order = 7;
            break;
        case 'desktop module':
            order = 8;
            break;
        case 'agent':
            order = 9;
            break;
        case 'actor':
            order = 10;
            break;
        case 'middleware':
            order = 11;
            break;
        case 'request':
            order = 12;
            break;
        case 'business transaction':
            order = 13;
            break;
        case 'digital asset transaction':
            order = 14;
            break;
        case 'crypto money transaction':
            order = 15;
            break;
        case 'cash money transaction':
            order = 16;
            break;
        case 'bank money transaction':
            order = 17;
            break;
        case 'contract':
            order = 18;
            break;
        case 'composite wallet':
            order = 19;
            break;
        case 'wallet':
            order = 20;
            break;
        case 'world':
            order = 21;
            break;
        case 'identity':
            order = 22;
            break;
        case 'actor network service':
            order = 23;
            break;
        case 'network service':
            order = 24;
            break;
        case 'communication':
            order = 25;
            break;
        case 'crypto router':
            order = 26;
            break;
        case 'crypto module':
            order = 27;
            break;
        case 'crypto vault':
            order = 28;
            break;
        case 'crypto network':
            order = 29;
            break;
        case 'license':
            order = 30;
            break;
        case 'plugin':
            order = 31;
            break;
        case 'user':
            order = 32;
            break;
        case 'Hardware':
            order = 33;
            break;
        case 'platform service':
            order = 34;
            break;
        case 'multi os':
            order = 35;
            break;
        case 'android':
            order = 36;
            break;
        case 'api':
            order = 37;
            break;
        default:
            order = -1;
            break;
    }
    return order;
}


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
    order = name ? getOrder(name) : null;
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
            if (name && lang) {
                var layer = new LayerMdl(name, lang, order);
                layerSrv.insertLayer(layer, function(err_ins, res_ins) {
                    if (err_ins) return callback(err_ins, null);
                    else return callback(null, res_ins);
                });
            } else {
                return callback(null, null);
            }
        }
    });
};