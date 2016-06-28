var actrSrv = require('./services/actr');
var ActrMdl = require('./models/actr');
var wavMod = require('../wave');
var servMod = require('../server');
/**
 * [insertActor description]
 *
 * @method insertActor
 *
 * @param  {[type]}     _wave_id [description]
 * @param  {[type]}     _serv_id [description]
 * @param  {[type]}     hash     [description]
 * @param  {[type]}     extra    [description]
 * @param  {Function}   callback [description]
 *
 * @return {[type]}     [description]
 */
exports.insertActor = function(_wave_id, _serv_id, hash, actorType, links, location, profile, callback) {
    var actr_mdl = new ActrMdl(_wave_id, _serv_id, hash, actorType, links, location, profile);
    actrSrv.insertActr(actr_mdl, function(err, serv) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, serv);
    });
};
/**
 * [getLastServerStatus description]
 *
 * @method getLastServerStatus
 *
 * @param  {[type]}            _serv_id [description]
 * @param  {Function}          callback [description]
 *
 * @return {[type]}            [description]
 */
exports.getLastServerStatus = function(_serv_id, callback) {
    wavMod.findLastWave(function(err, wav) {
        if (err) return callback(err, null);
        else {
            actrSrv.findActrs({
                _serv_id: _serv_id,
                _wave_id: wav._id,
                type: 'actor'
            }, {
                _id: -1
            }, function(err, actrs) {
                if (err) return callback(err, null);
                for (var i = actrs.length - 1; i >= 0; i--) {
                    actrs[i]._wave = wav;
                }
                return callback(null, actrs);
            });
        }
    });
};