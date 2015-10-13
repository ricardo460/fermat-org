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
        case 'desktop':
            order = 4;
            break;
        case 'engine':
            order = 6;
            break;
        case 'wallet module':
            order = 7;
            break;
        case 'sub app module':
            order = 8;
            break;
        case 'desktop module':
            order = 9;
            break;
        case 'agent':
            order = 10;
            break;
        case 'actor':
            order = 11;
            break;
        case 'middleware':
            order = 12;
            break;
        case 'request':
            order = 13;
            break;
        case 'business transaction':
            order = 14;
            break;
        case 'digital asset transaction':
            order = 15;
            break;
        case 'crypto money transaction':
            order = 16;
            break;
        case 'cash money transaction':
            order = 17;
            break;
        case 'bank money transaction':
            order = 18;
            break;
        case 'contract':
            order = 19;
            break;
        case 'composite wallet':
            order = 20;
            break;
        case 'wallet':
            order = 21;
            break;
        case 'world':
            order = 22;
            break;
        case 'identity':
            order = 23;
            break;
        case 'actor network service':
            order = 24;
            break;
        case 'network service':
            order = 25;
            break;
        case 'communication':
            order = 28;
            break;
        case 'crypto router':
            order = 30;
            break;
        case 'crypto module':
            order = 31;
            break;
        case 'crypto vault':
            order = 32;
            break;
        case 'crypto network':
            order = 33;
            break;
        case 'license':
            order = 35;
            break;
        case 'plugin':
            order = 36;
            break;
        case 'user':
            order = 37;
            break;
        case 'hardware':
            order = 38;
            break;
        case 'platform service':
            order = 39;
            break;
        case 'multi os':
            order = 41;
            break;
        case 'android':
            order = 42;
            break;
        case 'api':
            order = 43;
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
exports.insOrUpdLayer = function(name, lang, suprlay, order, callback) {
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
            if (suprlay && suprlay != res_lay.suprlay) {
                set_obj.suprlay = suprlay;
                res_lay.suprlay = suprlay;
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
                var layer = new LayerMdl(name, lang, suprlay ? suprlay : null, order);
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

/**
 * [getLayers description]
 *
 * @method getLayers
 *
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.getLayers = function(callback) {
    layerSrv.findAllLayers({}, {
        order: 1
    }, function(err, layers) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, layers);
        }
    });
};