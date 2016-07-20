var mongoose = require('mongoose');

/**
 * ExRate Model, filled with database's data
 * @author simonorono
 *
 */
function ExRateMdl(price, timestamp) {
    'use strict';
    // always initialize all instance properties
    this.price = price;
    this.timestamp = timestamp;
}

/**
 * [init description]
 *
 * @method init
 *
 * @param  {[type]} exRateSchema [description]
 *
 * @return {[type]} [description]
 */
ExRateMdl.prototype.init = function(exRateSchema) {
    'use strict';
    this._id = exRateSchema._id;
    this.price = exRateSchema.price;
    this.timestamp = exRateSchema.timestamp;
};

module.exports = ExRateMdl;
