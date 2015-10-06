var mongoose = require('mongoose');

/**
 * [stepSchema description]
 *
 * @type {[type]}
 */
var stepSchema = mongoose.Schema({
    _comp_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Layer'
    },
    type: {
        lowercase: true,
        type: String,
        trim: true
    },
    title: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    next: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompDev'
    }],
    upd_at: {
        type: mongoose.Schema.Types.ObjectId,
        'default': new mongoose.Types.ObjectId()
    }
}, {
    collection: 'steps'
});

/**
 * [code description]
 *
 * @type {number}
 */
stepSchema.index({
    _comp_id: 1
}, {
    name: "steps_indx"
}); // schema level

module.exports = stepSchema;