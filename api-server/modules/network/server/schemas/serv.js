var mongoose = require('mongoose');
/**
 * this schema represents each serve in the network
 *
 * @type {[type]}
 */
var servSchema = mongoose.Schema({
	_wave_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Wave'
	},
	hash: {
		type: String,
		lowercase: true,
		trim: true,
		required: true
	},
	//("server" | "client")
	type: {
		type: String,
		lowercase: true,
		trim: true,
		required: true
	},
	extra: {},
	upd_at: {
		type: mongoose.Schema.Types.ObjectId,
		'default': new mongoose.Types.ObjectId()
	}
}, {
	collection: 'servs'
});
/**
 * [hash description]
 *
 * @type {number}
 */
servSchema.index({
	hash: 1,
	type: 1,
	_wave_id: 1
}, {
	name: "servs_cp_indx"
});
module.exports = servSchema;