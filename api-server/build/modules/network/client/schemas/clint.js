var mongoose = require('mongoose');
/**
 * this schema represents each serve in the network
 *
 * @type {[type]}
 */
var clintSchema = mongoose.Schema({
	_wave_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Wave'
	},
	_serv_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Serv'
	},
	hash: {
		type: String,
		lowercase: true,
		trim: true,
		required: true
	},
	//("server" | "client" | "actor")
	type: {
		type: String,
		lowercase: true,
		trim: true,
		required: true
	},
	location: mongoose.Schema.Types.Mixed,
    networkServices: [String],
	upd_at: {
		type: mongoose.Schema.Types.ObjectId,
		'default': new mongoose.Types.ObjectId()
	}
}, {
	collection: 'clints'
});
/**
 * [hash description]
 *
 * @type {number}
 */
clintSchema.index({
	hash: 1,
	type: 1,
	_serv_id: 1,
	_wave_id: 1
}, {
	name: "clints_cp_indx"
});
module.exports = clintSchema;