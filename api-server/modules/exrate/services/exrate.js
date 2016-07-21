var mongoose = require('mongoose');
var Dao = require('../../database/dao');
var exRateSch = require('../schemas/exrate');
var exRateMdl = require('../models/exrate');

/**
 * [exRateDao description]
 *
 * @type {Dao}
 */
var exRateDao = new Dao('ExRate', exRateSch, exRateMdl);

/**
 * [insertExRate description]
 *
 * @method insertExRate
 *
 * @param  {[type]}   exRate_mdl  [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.insertExRate = function(exRate_mdl, callback) {
    'use strict';
    exRateDao.insertSchema(exRate_mdl, function(err, exRate) {
        callback(err, exRate);
    });
};

/**
 * [findExRate description]
 *
 * @method findExRate
 *
 * @param  {[type]}   query    [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.findExRate = function(callback) {
    'use strict';
    exRateDao.Schema.findOne()
        .where({})
        .sort('-timestamp')
        .exec(function(err, doc) {
            callback(err, doc);
        });
};
