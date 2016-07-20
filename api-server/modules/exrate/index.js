var exRateSrv = require('./services/exrate');
var ExRateMdl = require('./models/exrate');

/**
 * [insertExRate description]
 *
 * @method insertExRate
 *
 * @param {[type]}   price
 * @param [Function] callback
 */
exports.insertExRate = function(price, callback) {
    var exRate_mdl = new ExRateMdl(price, Date.now());
    exRateSrv.insertExRate(exRate_mdl, function(err, exRate) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, exRate);
    });
}

exports.findExRate = function(callback) {
    exRateSrv.findExRate(callback);
}
