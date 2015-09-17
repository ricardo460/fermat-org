var mongoose = require('mongoose');

var suprlaySchema = mongoose.Schema({
    code: {
        type: String,
        uppercase: true,
        trim: true,
        required: true
    },
    name: {
        type: String,
        trim: true
    },
    logo: {
        type: String,
        trim: true
    },
    deps: [{
        type: String,
        uppercase: true,
        trim: true,
        required: true
    }],
    upd_at: {
        type: mongoose.Schema.Types.ObjectId,
        'default': new mongoose.Types.ObjectId()
    }
}, {
    collection: 'suprlays',
    autoIndex: false
});

suprlaySchema.index({
    code: 1,
    name: 1,
    logo: 1
}, {
    name: "suprlays_cp_indx"
}); // schema level

module.exports = suprlaySchema;