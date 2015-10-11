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
    this.order = order;
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