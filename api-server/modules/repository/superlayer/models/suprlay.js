var mongoose = require('mongoose');

// Constructor
/**
 * [SuprlayMdl constructor]
 *
 * @method SuprlayMdl
 *
 * @param  {[type]}   code [description]
 * @param  {[type]}   name [description]
 * @param  {[type]}   logo [description]
 * @param  {[type]}   deps [description]
 */
function SuprlayMdl(code, name, logo, deps, platfrm_index, layer_index) {
	// always initialize all instance properties
	this.code = code;
	this.name = name;
	this.logo = logo;
	this.deps = [];
	this.platfrm_index = platfrm_index;
	this.layer_index = layer_index;
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
	this.platfrm_index = suprlaySchema.platfrm_index;
	this.layer_index = suprlaySchema.layer_index;
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