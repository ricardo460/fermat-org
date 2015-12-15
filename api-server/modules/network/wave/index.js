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
 * [findWaveById description]
 *
 * @method findWaveById
 *
 * @param  {[type]}         _id [description]
 * @param  {Function}       callback [description]
 *
 * @return {[type]}         [description]
 */
exports.findWaveById = function (_id, callback) {
    'use strict';
    try {
        waveSrv.findWaveById( 
            _id
        ,function (err, wave) {
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