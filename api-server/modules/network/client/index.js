var clintSrv = require('./services/clint');
var ClintMdl = require('./models/clint');
var wavMod = require('../wave');
var servMod = require('../server');
/**
 * [insertClient description]
 *
 * @method insertClient
 *
 * @param  {[type]}     _wave_id [description]
 * @param  {[type]}     _serv_id [description]
 * @param  {[type]}     hash     [description]
 * @param  {[type]}     extra    [description]
 * @param  {Function}   callback [description]
 *
 * @return {[type]}     [description]
 */
exports.insertClient = function (_wave_id, _serv_id, hash, extra, callback) {
	var serv_mdl = new ClintMdl(_wave_id, _serv_id, hash, extra);
	clintSrv.insertServ(serv_mdl, function (err, serv) {
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
exports.getLastServerStatus = function (_serv_id, callback) {
	wavMod.findLastWave(function (err, wav) {
		if (err) return callback(err, null);
		else {
			clintSrv.findClints({
				_serv_id: _serv_id,
				_wave_id: wav._id,
				type: 'client'
			}, {
				_id: -1
			}, function (err, clints) {
				if (err) return callback(err, null);
				for (var i = clints.length - 1; i >= 0; i--) {
					clints[i]._wave = wav;
				}
				return callback(null, clints);
			});
		}
	});
};