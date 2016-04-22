var servSrv = require('./services/serv');
var ServMdl = require('./models/serv');
var wavMod = require('../wave');
/**
 * [dateFromObjectId description]
 *
 * @method dateFromObjectId
 *
 * @param  {[type]}         objectId [description]
 *
 * @return {[type]}         [description]
 */
var dateFromObjectId = function (objectId) {
	objectId = objectId + '';
	return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
};
/**
 * [insertServer description]
 *
 * @method insertServer
 *
 * @param  {[type]}     hash     [description]
 * @param  {[type]}     extra    [description]
 * @param  {Function}   callback [description]
 *
 * @return {[type]}     [description]
 */
exports.insertServer = function (hash, extra, callback) {
	var date = new Date();
	var desc = "wave " + date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
	wavMod.insertWave(desc, function (err, wave) {
		if (err) {
			return callback(err, null);
		}
		var serv_mdl = new ServMdl(wave._id, hash, extra);
		servSrv.insertServ(serv_mdl, function (err, serv) {
			if (err) {
				return callback(err, null);
			}
			return callback(null, serv);
		});
	});
};
/**
 * [getLastServerStatus description]
 *
 * @method getLastServerStatus
 *
 * @param  {[type]}            hash     [description]
 * @param  {Function}          callback [description]
 *
 * @return {[type]}            [description]
 */
exports.getLastNetworkStatus = function (callback) {
	wavMod.findLastWave(function (err, wav) {
		if (err) return callback(err, null);
		else {
			servSrv.findServs({
				_wave_id: wav._id,
				type: 'server'
			}, {
				_id: -1
			}, function (err, servs) {
				if (err) return callback(err, null);
				for (var i = servs.length - 1; i >= 0; i--) {
					servs[i]._wave = wav;
				}
				return callback(null, servs);
			});
		}
	});
};
/**
 * [getLastNetworkStatus description]
 *
 * @method getLastNetworkStatus
 *
 * @param  {Function}           callback [description]
 *
 * @return {[type]}             [description]
 */
exports.getNetworkHistory = function (callback) {
	servSrv.findServs({
		type: 'server'
	}, {
		_wave_id: 1
	}, function (err, servs) {
		if (err) return callback(err, null);
		for (var i = servs.length - 1; i >= 0; i--) {
			var _wave = {
				"time": dateFromObjectId(servs[i]._wave_id),
				"_id": servs[i]._wave_id
			};
			servs[i]._wave = {};
		}
		return callback(null, servs);
	});
};