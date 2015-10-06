var mongoose = require('mongoose');

/**
 * [layerSchema description]
 *
 * @type {[type]}
 */
var layerSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    lang: {
        type: String,
        trim: true
    },
    order: {
        type: Number,
        'default': 0
    },
    upd_at: {
        type: mongoose.Schema.Types.ObjectId,
        'default': new mongoose.Types.ObjectId()
    }
}, {
    collection: 'layers'
});

/**
 * [name description]
 *
 * @type {number}
 */
layerSchema.index({
    name: 1,
    lang: 1
}, {
    name: "layers_cp_indx"
});

module.exports = layerSchema;