var mongoose = require('mongoose');

/**
 * [nodSchema description]
 *
 * @type {[type]}
 */
var nodSchema = mongoose.Schema({
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
    //("server" | "client" | "service" | "actor" | "wallet")
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
    collection: 'nods'
});

/**
 * s
 *
 * @type {number}
 */
nodSchema.index({
    hash: 1,
    type: 1,
    _wave_id: 1
}, {
    name: "nods_cp_indx"
});

module.exports = nodSchema;