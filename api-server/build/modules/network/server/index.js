var servSrv = require('./services/serv');
var ServMdl = require('./models/serv');
var wavMod = require('../wave');
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
	var desc = "wave " + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
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
exports.getLastServerStatus = function (hash, callback) {
	wavMod.findLastWave(function (err, wav) {
		if (err) return callback(err, null);
		else {
			servSrv.findServ({
				hash: hash,
				_wave_id: wav._id
			}, function (err, serv) {
				if (err) return callback(err, null);
				serv._wav = wav;
				return callback(null, serv);
			});
		}
	});
};