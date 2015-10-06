var mongoose = require('mongoose');

/**
 * [LayerMdl description]
 *
 * @method LayerMdl
 *
 * @param  {[type]} name  [description]
 * @param  {[type]} lang  [description]
 * @param  {[type]} order [description]
 */
function LayerMdl(name, lang, order) {
    // always initialize all instance properties
    this.name = name;
    this.lang = lang;
    switch (name) {
        case 'core':
            this.order = 0;
            break;
        case 'niche wallet':
            this.order = 1;
            break;
        case 'reference wallet':
            this.order = 2;
            break;
        case 'sub app':
            this.order = 3;
            break;
        case 'dektop':
            this.order = 4;
            break;
        case 'engine':
            this.order = 5;
            break;
        case 'wallet module':
            this.order = 6;
            break;
        case 'sub app module':
            this.order = 7;
            break;
        case 'desktop module':
            this.order = 8;
            break;
        case 'agent':
            this.order = 9;
            break;
        case 'actor':
            this.order = 10;
            break;
        case 'middleware':
            this.order = 11;
            break;
        case 'request':
            this.order = 12;
            break;
        case 'business transaction':
            this.order = 13;
            break;
        case 'digital asset transaction':
            this.order = 14;
            break;
        case 'crypto money transaction':
            this.order = 15;
            break;
        case 'cash money transaction':
            this.order = 16;
            break;
        case 'bank money transaction':
            this.order = 17;
            break;
        case 'contract':
            this.order = 18;
            break;
        case 'composite wallet':
            this.order = 19;
            break;
        case 'wallet':
            this.order = 20;
            break;
        case 'world':
            this.order = 21;
            break;
        case 'identity':
            this.order = 22;
            break;
        case 'actor network service':
            this.order = 23;
            break;
        case 'network service':
            this.order = 24;
            break;
        case 'communication':
            this.order = 25;
            break;
        case 'crypto router':
            this.order = 26;
            break;
        case 'crypto module':
            this.order = 27;
            break;
        case 'crypto vault':
            this.order = 28;
            break;
        case 'crypto network':
            this.order = 29;
            break;
        case 'license':
            this.order = 30;
            break;
        case 'plugin':
            this.order = 31;
            break;
        case 'user':
            this.order = 32;
            break;
        case 'Hardware':
            this.order = 33;
            break;
        case 'platform service':
            this.order = 34;
            break;
        case 'multi os':
            this.order = 35;
            break;
        case 'android':
            this.order = 36;
            break;
        case 'api':
            this.order = 37;
            break;
        default:
            this.order = -1;
            break;
    }
    this.upd_at = new mongoose.Types.ObjectId();
}

/**
 * [init description]
 *
 * @method init
 *
 * @param  {[type]} layerSchema [description]
 *
 * @return {[type]} [description]
 */
LayerMdl.prototype.init = function(layerSchema) {
    this._id = layerSchema._id;
    this.name = layerSchema.name;
    this.lang = layerSchema.lang;
    this.order = layerSchema.order;
    this.upd_at = layerSchema.upd_at;
};

/**
 * [setUpdate description]
 *
 * @method setUpdate
 */
LayerMdl.prototype.setUpdate = function() {
    this.upd_at = new mongoose.Types.ObjectId();
};

// export the class
module.exports = LayerMdl;