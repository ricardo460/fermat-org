var mongoose = require('mongoose');

// Constructor
function SuprlayMdl(code, name, logo, deps) {
	// always initialize all instance properties
	this.code = code;
	this.name = name;
	this.logo = logo;
	this.deps = [];
	this.upd_at = new mongoose.Types.ObjectId();
}

// class methods
SuprlayMdl.prototype.init = function(suprlaySchema) {
	this.code = suprlaySchema.code;
	this.name = suprlaySchema.name;
	this.logo = suprlaySchema.logo;
	this.deps = suprlaySchema.deps;
	this.upd_at = suprlaySchema.upd_at;
};

SuprlayMdl.prototype.setUpdate = function() {
	this.upd_at = new mongoose.Types.ObjectId();
};

// export the class
module.exports = SuprlayMdl;