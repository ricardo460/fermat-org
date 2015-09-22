var mongoose = require('mongoose');

// Constructor
function PlatfrmMdl(code, name, logo, deps) {
	// always initialize all instance properties
	this.code = code;
	this.name = name;
	this.logo = logo;
	this.deps = [];
	this.upd_at = new mongoose.Types.ObjectId();
}

// class methods
PlatfrmMdl.prototype.init = function(platfrmSchema) {
	this._id = devSchema._id;
	this.code = platfrmSchema.code;
	this.name = platfrmSchema.name;
	this.logo = platfrmSchema.logo;
	this.deps = platfrmSchema.deps;
	this.upd_at = platfrmSchema.upd_at;
};

PlatfrmMdl.prototype.setUpdate = function() {
	this.upd_at = new mongoose.Types.ObjectId();
};

// export the class
module.exports = PlatfrmMdl;