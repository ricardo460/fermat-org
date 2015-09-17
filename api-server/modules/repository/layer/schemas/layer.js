var mongoose = require('mongoose');

var layerSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    lang: {
        type: String,
        trim: true
    },
    upd_at: {
        type: mongoose.Schema.Types.ObjectId,
        'default': new mongoose.Types.ObjectId()
    }
}, {
    collection: 'layers',
    autoIndex: false
});

layerSchema.index({
    name: 1,
    lang: 1
}, {
    name: "layers_cp_indx"
}); // schema level

module.exports = layerSchema;