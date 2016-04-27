var mongoose = require('mongoose');
var Dao = require('../../../database/dao');
var clintSch = require('../schemas/clint');
var clintMdl = require('../models/clint');
/**
 * [clintDao description]
 *
 * @type {Dao}
 */
var clintDao = new Dao('Clint', clintSch, clintMdl);
/**
 * [insertClint description]
 *
 * @method insertClint
 *
 * @param  {[type]}   clint_mdl  [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.insertClint = function (clint_mdl, callback) {
	'use strict';
	clintDao.insertSchema(clint_mdl, function (err, clint) {
		callback(err, clint);
	});
};
/**
 * [findClintById description]
 *
 * @method findClintById
 *
 * @param  {[type]}     _id      [description]
 * @param  {Function}   callback [description]
 *
 * @return {[type]}     [description]
 */
exports.findClintById = function (_id, callback) {
	'use strict';
	clintDao.findSchemaById(_id, function (err, clint) {
		callback(err, clint);
	});
};
/**
 * [findClint description]
 *
 * @method findClint
 *
 * @param  {[type]}   query    [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.findClint = function (query, callback) {
	'use strict';
	clintDao.findSchema(query, function (err, clint) {
		callback(err, clint);
	});
};
/**
 * [findClints description]
 *
 * @method findClints
 *
 * @param  {[type]}   query    [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.findClints = function (query, sort, callback) {
	'use strict';
	clintDao.findAllSchemaLst(query, sort, function (err, clints) {
		callback(err, clints);
	});
};
/**
 * [findAllClints description]
 *
 * @method findAllClints
 *
 * @param  {[type]}    sort     [description]
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.findAllClints = function (sort, callback) {
	'use strict';
	clintDao.findAllSchemaLst({}, sort, function (err, clint) {
		callback(err, clint);
	});
};
/**
 * [updateClintById description]
 *
 * @method updateClintById
 *
 * @param  {[type]}      _id      [description]
 * @param  {[type]}      set      [description]
 * @param  {Function}    callback [description]
 *
 * @return {[type]}      [description]
 */
exports.updateClintById = function (_id, set, callback) {
	'use strict';
	set.upd_at = new mongoose.Types.ObjectId();
	clintDao.updateSchema({
		_id: _id
	}, set, {}, function (err, clint) {
		callback(err, clint);
	});
};
/**
 * [delAllClints description]
 *
 * @method delAllClints
 *
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.delAllClints = function (callback) {
	'use strict';
	clintDao.delAllSchemas(function (err, clint) {
		callback(err, clint);
	});
};
/**
 * [delClintById description]
 *
 * @method delClintById
 *
 * @param  {[type]}   _id      [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.delClintById = function (_id, callback) {
	'use strict';
	clintDao.delSchemaById(_id, function (err, clint) {
		callback(err, clint);
	});
};