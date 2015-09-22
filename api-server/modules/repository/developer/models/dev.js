var mongoose = require('mongoose');

// Constructor
function DevMdl(usrnm, email, name, bday, country, avatar_url, url, bio) {
	// always initialize all instance properties
	this.usrnm = usrnm;
	this.email = email;
	this.name = name;
	this.bday = bday;
	this.country = country;
	this.avatar_url = avatar_url;
	this.url = url;
	this.bio = bio;
	this.upd_at = new mongoose.Types.ObjectId();
}

// class methods
DevMdl.prototype.init = function(devSchema) {
	this.usrnm = devSchema.usrnm;
	this.email = devSchema.email;
	this.name = devSchema.name;
	this.bday = devSchema.bday;
	this.country = devSchema.country;
	this.avatar_url = devSchema.avatar_url;
	this.url = devSchema.url;
	this.bio = devSchema.bio;
	this.upd_at = devSchema.upd_at;
};

DevMdl.prototype.setUpdate = function() {
	this.upd_at = new mongoose.Types.ObjectId();
};

DevMdl.prototype.getAge = function () {
	var diff = new Date() - this.bday;
	var diffdays = diff / 1000 / (60 * 60 * 24);
	var age = Math.floor(diffdays / 365.25);
	return age;
};

// export the class
module.exports = DevMdl;