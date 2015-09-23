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
function SuprlayMdl(code, name, logo, deps) {
	// always initialize all instance properties
	this.code = code;
	this.name = name;
	this.logo = logo;
	this.deps = [];
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
	this._id = devSchema._id;
	this.code = suprlaySchema.code;
	this.name = suprlaySchema.name;
	this.logo = suprlaySchema.logo;
	this.deps = suprlaySchema.deps;
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