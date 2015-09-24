var mongoose = require('mongoose');

/**
 * [LayerMdl constructor]
 *
 * @method LayerMdl
 *
 * @param  {[type]} name [description]
 * @param  {[type]} lang [description]
 */
function LayerMdl(name, lang, platfrm_index, layer_index) {
	// always initialize all instance properties
	this.name = name;
	this.lang = lang;
	this.platfrm_index = platfrm_index;
	this.layer_index = layer_index;
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
	this.platfrm_index = layerSchema.platfrm_index;
	this.layer_index = layerSchema.layer_index;
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