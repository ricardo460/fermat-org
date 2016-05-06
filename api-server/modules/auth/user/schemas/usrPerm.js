var mongoose = require('mongoose');
/**
 * [usrPermSchema description]
 * @type {[type]}
 */
var usrPermSchema = mongoose.Schema({
    _mastr_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usr'
    },
    _grantd_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usr'
    },
    upd_at: {
        type: mongoose.Schema.Types.ObjectId,
        'default': new mongoose.Types.ObjectId()
    }
}, {
    collection: 'usr_perms'
});
usrPermSchema.index({
    _mastr_id: 1,
    _grantd_id: 1
}, {
    name: "usr_perms_cp_indx"
});
module.exports = usrPermSchema;