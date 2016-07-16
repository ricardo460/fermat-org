var mongoose = require('mongoose');
/**
 * this schema represents each actor in the network
 *
 * @type {[type]}
 */
var actrSchema = mongoose.Schema({
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
    actorType: {
        type: String,
        uppercase: true,
        trim: true,
        required: true
    },
    links: [String],
    location: {},
    profile: {},
	upd_at: {
		type: mongoose.Schema.Types.ObjectId,
		'default': new mongoose.Types.ObjectId()
	}
}, {
	collection: 'actrs'
});
/**
 * [hash description]
 *
 * @type {number}
 */
actrSchema.index({
	hash: 1,
	type: 1,
	_serv_id: 1,
	_wave_id: 1
}, {
	name: "actrs_cp_indx"
});
module.exports = actrSchema;