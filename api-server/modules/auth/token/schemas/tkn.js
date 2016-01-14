var mongoose = require('mongoose');
/**
 * [tknSchema description]
 *
 * @type {[type]}
 */
var tknSchema = mongoose.Schema({
	_usr_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Usr'
	},
	_app_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'App'
	},
	axs_key: {
		type: mongoose.Schema.Types.ObjectId,
		'default': new mongoose.Types.ObjectId()
	},
	upd_at: {
		type: mongoose.Schema.Types.ObjectId,
		'default': new mongoose.Types.ObjectId()
	}
}, {
	collection: 'tkns'
});
/**
 * [_usr_id description]
 *
 * @type {number}
 */
tknSchema.index({
	_usr_id: 1,
	_app_id: 1,
	tkn: 1
}, {
	name: "tkns_cp_indx"
});
module.exports = tknSchema;