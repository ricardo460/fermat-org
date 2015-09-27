var mongoose = require('mongoose');

/**
 * [PlatfrmMdl description]
 *
 * @method PlatfrmMdl
 *
 * @param  {[type]}   code          [description]
 * @param  {[type]}   name          [description]
 * @param  {[type]}   logo          [description]
 * @param  {[type]}   deps          [description]
 * @param  {[type]}   platfrm_index [description]
 * @param  {[type]}   layer_index   [description]
 */
function PlatfrmMdl(code, name, logo, deps, platfrm_index, layer_index) {
	// always initialize all instance properties
	this.code = code;
	this.name = name;
	this.logo = logo;
	this.deps = deps;
	this.platfrm_index = platfrm_index;
	this.layer_index = layer_index;
	this.upd_at = new mongoose.Types.ObjectId();
}

/**
 * [init description]
 *
 * @method init
 *
 * @param  {[type]} platfrmSchema [description]
 *
 * @return {[type]} [description]
 */
PlatfrmMdl.prototype.init = function(platfrmSchema) {
	this._id = platfrmSchema._id;
	this.code = platfrmSchema.code;
	this.name = platfrmSchema.name;
	this.logo = platfrmSchema.logo;
	this.deps = platfrmSchema.deps;
	this.platfrm_index = platfrmSchema.platfrm_index;
	this.layer_index = platfrmSchema.layer_index;
	this.upd_at = platfrmSchema.upd_at;
};

/**
 * [setUpdate description]
 *
 * @method setUpdate
 */
PlatfrmMdl.prototype.setUpdate = function() {
	this.upd_at = new mongoose.Types.ObjectId();
};

// export the class
module.exports = PlatfrmMdl;