var mongoose = require('mongoose');
var Dao = require('../../../database/dao');
var suprlayMdl = require('../models/suprlay');
var suprlaySch = require('../schemas/suprlay');

/**
 * [suprlayDao description]
 *
 * @type {Dao}
 */
var suprlayDao = new Dao('Suprlay', suprlaySch, suprlayMdl);

/**
 * [insertSuprlay description]
 *
 * @method insertSuprlay
 *
 * @param  {[type]}   suprlay_mdl  [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.insertSuprlay = function (suprlay_mdl, callback) {
	suprlayDao.insertSchema(suprlay_mdl, function (err, suprlay) {
		callback(err, suprlay);
	});
};

/**
 * [findSuprlayById description]
 *
 * @method findSuprlayById
 *
 * @param  {[type]}    _id      [description]
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.findSuprlayById = function (_id, callback) {
	suprlayDao.findSchemaById(_id, function (err, suprlay) {
		callback(err, suprlay);
	});
};

/**
 * [findSuprlayByCode description]
 *
 * @method findSuprlayByCode
 *
 * @param  {[type]}       email    [description]
 * @param  {Function}     callback [description]
 *
 * @return {[type]}       [description]
 */
exports.findSuprlayByCode = function (code, callback) {
	suprlayDao.findSchema({
		code: code
	}, function (err, suprlay) {
		callback(err, suprlay);
	});
};

/**
 * [findSuprlayByName description]
 *
 * @method findSuprlayByName
 *
 * @param  {[type]}       usrnm    [description]
 * @param  {Function}     callback [description]
 *
 * @return {[type]}       [description]
 */
exports.findSuprlayByName = function (name, callback) {
	suprlayDao.findSchema({
		name: name
	}, function (err, suprlay) {
		callback(err, suprlay);
	});
};

/**
 * [findSuprlays description]
 *
 * @method findSuprlays
 *
 * @param  {[type]}   query    [description]
 * @param  {[type]}   limit    [description]
 * @param  {[type]}   order    [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.findSuprlays = function (query, limit, order, callback) {
	suprlayDao.findSchemaLst(query, limit, order, function (err, suprlay) {
		callback(err, suprlay);
	});
};

/**
 * [findAllSuprlays description]
 *
 * @method findAllSuprlays
 *
 * @param  {[type]}    query    [description]
 * @param  {[type]}    order    [description]
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.findAllSuprlays = function (query, order, callback) {
	suprlayDao.findAllSchemaLst(query, order, function (err, suprlay) {
		callback(err, suprlay);
	});
};

/**
 * [updateSuprlayById description]
 *
 * @method updateSuprlayById
 *
 * @param  {[type]}      _id      [description]
 * @param  {[type]}      set      [description]
 * @param  {Function}    callback [description]
 *
 * @return {[type]}      [description]
 */
exports.updateSuprlayById = function (_id, set, callback) {
	set.upd_at = new mongoose.Types.ObjectId();
	suprlayDao.updateSchema({
		_id: _id
	}, set, {}, function (err, suprlay) {
		callback(err, suprlay);
	});
};