var mongoose = require('mongoose');
/**
 * [usrPermSchema description]
 * @type {[type]}
 */
var usrPermSchema = mongoose.Schema({
    master_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    granted_id: {
        type: String/*mongoose.Schema.Types.ObjectId/*,
        ref: 'Usr'*/
    },
    upd_at: {
        type: mongoose.Schema.Types.ObjectId,
        'default': new mongoose.Types.ObjectId()
    }
}, {
    collection: 'usrs_perm'
});

usrPermSchema.index({
    granted_id: 1
}, {
    name: "granted_indx"
}); 
module.exports = usrPermSchema;