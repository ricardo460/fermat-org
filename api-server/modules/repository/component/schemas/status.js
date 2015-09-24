var mongoose = require('mongoose');

/**
 * [statusSchema description]
 *
 * @type {mongoose}
 */
var statusSchema = mongoose.Schema({
    _comp_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comp'
    },
    name: {
        type: String,
        trim: true
    },
    target: {
        type: String,
        trim: true
    },
    reached: {
        type: String,
        trim: true
    },
    upd_at: {
        type: mongoose.Schema.Types.ObjectId,
        'default': new mongoose.Types.ObjectId()
    }
}, {
    collection: 'statuses'
});

statusSchema.index({
    _comp_id: 1,
    name: 1,
    _layer_id: 1,
    code: 1,
    name: 1,
    logo: 1
}, {
    name: "statuses_cp_indx"
}); // schema level

module.exports = compSchema;