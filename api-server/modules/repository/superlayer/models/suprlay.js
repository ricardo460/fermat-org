var mongoose = require('mongoose');

// Constructor
/**
 * [SuprlayMdl description]
 *
 * @method SuprlayMdl
 *
 * @param  {[type]}   code  [description]
 * @param  {[type]}   name  [description]
 * @param  {[type]}   logo  [description]
 * @param  {[type]}   deps  [description]
 * @param  {[type]}   order [description]
 */
function SuprlayMdl(code, name, logo, deps, order) {
    // always initialize all instance properties
    this.code = code;
    this.name = name;
    this.logo = logo;
    this.deps = [];
    switch (code) {
        case 'P2P':
            this.order = 0;
            break;
        case 'BCH':
            this.order = 1;
            break;
        case 'OSA':
            this.order = 2;
            break;
        default:
            this.order = -1;
            break;
    }
    this.upd_at = new mongoose.Types.ObjectId();
}

// class methods
/**
 * [init description]
 *
 * @method init
 *
 * @param  {[type]} suprlaySchema [description]
 *
 * @return {[type]} [description]
 */
SuprlayMdl.prototype.init = function(suprlaySchema) {
    this._id = suprlaySchema._id;
    this.code = suprlaySchema.code;
    this.name = suprlaySchema.name;
    this.logo = suprlaySchema.logo;
    this.deps = suprlaySchema.deps;
    this.order = suprlaySchema.order;
    this.upd_at = suprlaySchema.upd_at;
};

/**
 * [setUpdate description]
 *
 * @method setUpdate
 */
SuprlayMdl.prototype.setUpdate = function() {
    this.upd_at = new mongoose.Types.ObjectId();
};

// export the class
module.exports = SuprlayMdl;