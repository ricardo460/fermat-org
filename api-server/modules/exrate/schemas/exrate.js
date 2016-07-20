var mongoose = require('mongoose');
/**
 * this schema represents an exchange rate
 *
 * @type {[type]}
 */
var exRateSchema = mongoose.Schema({
    price: {
        type: Number
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'exrates'
});

/**
 * [hash description]
 *
 * @type {number}
 */
exRateSchema.index({
    timestamp: 1
}, {
    name: "actrs_cp_indx"
});
module.exports = exRateSchema;
