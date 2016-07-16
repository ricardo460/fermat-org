var mongoose = require('mongoose');
var Dao = require('../../../database/dao');
var actrSch = require('../schemas/actr');
var actrMdl = require('../models/actr');
/**
 * [actrDao description]
 *
 * @type {Dao}
 */
var actrDao = new Dao('Actr', actrSch, actrMdl);
/**
 * [insertActr description]
 *
 * @method insertActr
 *
 * @param  {[type]}   actr_mdl  [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.insertActr = function (actr_mdl, callback) {
	'use strict';
	actrDao.insertSchema(actr_mdl, function (err, actr) {
		callback(err, actr);
	});
};
/**
 * [findActrById description]
 *
 * @method findActrById
 *
 * @param  {[type]}     _id      [description]
 * @param  {Function}   callback [description]
 *
 * @return {[type]}     [description]
 */
exports.findActrById = function (_id, callback) {
	'use strict';
	actrDao.findSchemaById(_id, function (err, actr) {
		callback(err, actr);
	});
};
/**
 * [findActr description]
 *
 * @method findActr
 *
 * @param  {[type]}   query    [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.findActr = function (query, callback) {
	'use strict';
	actrDao.findSchema(query, function (err, actr) {
		callback(err, actr);
	});
};
/**
 * [findActrs description]
 *
 * @method findActrs
 *
 * @param  {[type]}   query    [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.findActrs = function (query, sort, callback) {
	'use strict';
	actrDao.findAllSchemaLst(query, sort, function (err, actrs) {
		callback(err, actrs);
	});
};
/**
 * [findAllActrs description]
 *
 * @method findAllActrs
 *
 * @param  {[type]}    sort     [description]
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.findAllActrs = function (sort, callback) {
	'use strict';
	actrDao.findAllSchemaLst({}, sort, function (err, actr) {
		callback(err, actr);
	});
};
/**
 * [updateActrById description]
 *
 * @method updateActrById
 *
 * @param  {[type]}      _id      [description]
 * @param  {[type]}      set      [description]
 * @param  {Function}    callback [description]
 *
 * @return {[type]}      [description]
 */
exports.updateActrById = function (_id, set, callback) {
	'use strict';
	set.upd_at = new mongoose.Types.ObjectId();
	actrDao.updateSchema({
		_id: _id
	}, set, {}, function (err, actr) {
		callback(err, actr);
	});
};
/**
 * [delAllActrs description]
 *
 * @method delAllActrs
 *
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.delAllActrs = function (callback) {
	'use strict';
	actrDao.delAllSchemas(function (err, actr) {
		callback(err, actr);
	});
};
/**
 * [delActrById description]
 *
 * @method delActrById
 *
 * @param  {[type]}   _id      [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.delActrById = function (_id, callback) {
	'use strict';
	actrDao.delSchemaById(_id, function (err, actr) {
		callback(err, actr);
	});
};