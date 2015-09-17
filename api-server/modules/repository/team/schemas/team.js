var mongoose = require('mongoose');

var teamSchema = mongoose.Schema({
	name: {
		type: String,
		trim: true
	},
	descript: {
		type: String,
		trim: true
	},
	devs: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Dev' } ],
	upd_at: { type: mongoose.Schema.Types.ObjectId, 'default': new mongoose.Types.ObjectId() }
}, { collection: 'teams', autoIndex: false });

teamSchema.index({ name: 1, descript: 1, devs: 1 }, { name: "teams_cp_indx" }); // schema level


module.exports = teamSchema;