/*jshint -W069 */
var waveSrv = require('./services/wave');
var WaveMdl = require('./models/wave');

/**
 * [insertWave description]
 *
 * @method insertWave
 *
 * @param  {[type]}   desc     [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.insertWave = function (desc, callback) {
    'use strict';
    try {
        
        var wave = new WaveMdl(desc);
        waveSrv.insertWave(wave, function (err_ins, res_ins) {
            if (err_ins) {
                return callback(err_ins, null);
            }
            return callback(null, res_ins);
        });
    } catch (err) {
        return callback(err, null);
    }
};

/**
 * [findWaveByDate description]
 *
 * @method findWaveByDate
 *
 * @param  {[type]}         date     [description]
 * @param  {Function}       callback [description]
 *
 * @return {[type]}         [description]
 */
exports.findWaveByDate = function (date, callback) {
    'use strict';
    try {
        var start = new Date(date).setHours(00);
        var end = new Date(date).setHours(24);
        var find_obj = {
            '$and': []
        };
        find_obj['$and'].push({
            'date': {
                '$gte': start
            }
        });
        find_obj['$and'].push({
            'date': {
                '$lt': end
            }
        });
        waveSrv.findWaves(find_obj, function (err, wave) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, wave);
        });
    } catch (err) {
        return callback(err, null);
    }
};

/*jshint +W069 */