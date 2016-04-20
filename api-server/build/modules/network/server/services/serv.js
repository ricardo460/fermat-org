var mongoose = require('mongoose');
var Dao = require('../../../database/dao');
var servSch = require('../schemas/serv');
var servMdl = require('../models/serv');
/**
 * [servDao description]
 *
 * @type {Dao}
 */
var servDao = new Dao('Serv', servSch, servMdl);
/**
 * [insertServ description]
 *
 * @method insertServ
 *
 * @param  {[type]}   serv_mdl  [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.insertServ = function (serv_mdl, callback) {
	'use strict';
	servDao.insertSchema(serv_mdl, function (err, serv) {
		callback(err, serv);
	});
};
/**
 * [findServById description]
 *
 * @method findServById
 *
 * @param  {[type]}     _id      [description]
 * @param  {Function}   callback [description]
 *
 * @return {[type]}     [description]
 */
exports.findServById = function (_id, callback) {
	'use strict';
	servDao.findSchemaById(_id, function (err, serv) {
		callback(err, serv);
	});
};
/**
 * [findServ description]
 *
 * @method findServ
 *
 * @param  {[type]}   query    [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.findServ = function (query, callback) {
	'use strict';
	servDao.findSchema(query, function (err, serv) {
		callback(err, serv);
	});
};
/**
 * [findServs description]
 *
 * @method findServs
 *
 * @param  {[type]}   query    [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.findServs = function (query, sort, callback) {
	'use strict';
	servDao.findAllSchemaLst(query, sort, function (err, serv) {
		callback(err, serv);
	});
};
/**
 * [findAllServs description]
 *
 * @method findAllServs
 *
 * @param  {[type]}    sort     [description]
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.findAllServs = function (sort, callback) {
	'use strict';
	servDao.findAllSchemaLst({}, sort, function (err, serv) {
		callback(err, serv);
	});
};
/**
 * [updateServById description]
 *
 * @method updateServById
 *
 * @param  {[type]}      _id      [description]
 * @param  {[type]}      set      [description]
 * @param  {Function}    callback [description]
 *
 * @return {[type]}      [description]
 */
exports.updateServById = function (_id, set, callback) {
	'use strict';
	set.upd_at = new mongoose.Types.ObjectId();
	servDao.updateSchema({
		_id: _id
	}, set, {}, function (err, serv) {
		callback(err, serv);
	});
};
/**
 * [delAllServs description]
 *
 * @method delAllServs
 *
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.delAllServs = function (callback) {
	'use strict';
	servDao.delAllSchemas(function (err, serv) {
		callback(err, serv);
	});
};
/**
 * [delServById description]
 *
 * @method delServById
 *
 * @param  {[type]}   _id      [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.delServById = function (_id, callback) {
	'use strict';
	servDao.delSchemaById(_id, function (err, serv) {
		callback(err, serv);
	});
};