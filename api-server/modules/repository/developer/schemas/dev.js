var mongoose = require('mongoose');

var devSchema = mongoose.Schema({
	usrnm: {
		type: String,
		lowercase: true,
		trim: true,
		required: true,
		validate: /^[a-zA-Z][a-zA-Z0-9\._\-]{3,14}?[a-zA-Z0-9]{0,2}$/
	},
	email: {
		type: String,
		lowercase: true,
		trim: true,
		required: false,
		validate: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/,
		'default': null
	},
	name: {
		type: String,
		trim: true,
		'default': null
	},
	bday: {
		type: Date,
		//'default': null
		'default': new Date()
	},
	country: {
		type: String,
		uppercase: true,
		trim: true,
		'default': null
	},
	avatar_url: {
		type: String,
		trim: true,
		'default': null
	},
	url: {
		type: String,
		trim: true,
		'default': null
	},
	bio: {
		type: String,
		trim: true,
		'default': null
	},
	upd_at: {
		type: mongoose.Schema.Types.ObjectId,
		'default': new mongoose.Types.ObjectId()
	}
}, {
	collection: 'devs',
	autoIndex: false
});

devSchema.methods.getAge = function () {
	var diff = new Date() - this.bday;
	var diffdays = diff / 1000 / (60 * 60 * 24);
	var age = Math.floor(diffdays / 365.25);
	return age;
};

// schema level
devSchema.index({
	usrnm: 1
}, {
	unique: true
}, {
	name: "devs_usrnm_uq_indx"
}); 

// schema level
devSchema.index({
	email: 1
}, {
	unique: true
}, {
	name: "devs_email_uq_indx"
}); 

// schema level
devSchema.index({
	usrnm: 1,
	email: 1,
	avatar_url: 1
}, {
	name: "devs_cp_indx"
});

module.exports = devSchema;