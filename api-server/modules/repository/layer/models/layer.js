var mongoose = require('mongoose');

// Constructor
function LayerMdl(name, lang) {
	// always initialize all instance properties
	this.name = name;
	this.lang = lang;
	this.upd_at = new mongoose.Types.ObjectId();
}

// class methods
LayerMdl.prototype.init = function(layerSchema) {
	this._id = devSchema._id;
	this.name = layerSchema.name;
	this.lang = layerSchema.lang;
	this.upd_at = layerSchema.upd_at;
};

LayerMdl.prototype.setUpdate = function() {
	this.upd_at = new mongoose.Types.ObjectId();
};

// export the class
module.exports = LayerMdl;