var mongoose = require('mongoose');
var Dao = require('../../../database/dao');
var platfrmMdl = require('../models/platfrm');
var platfrmSch = require('../schemas/platfrm');

/**
 * [platfrmDao description]
 *
 * @type {Dao}
 */
var platfrmDao = new Dao('Platfrm', platfrmSch, platfrmMdl);

/**
 * [insertPlatfrm description]
 *
 * @method insertPlatfrm
 *
 * @param  {[type]}   platfrm_mdl  [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.insertPlatfrm = function (platfrm_mdl, callback) {
	platfrmDao.insertSchema(platfrm_mdl, function (err, platfrm) {
		callback(err, platfrm);
	});
};

/**
 * [findPlatfrmById description]
 *
 * @method findPlatfrmById
 *
 * @param  {[type]}    _id      [description]
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.findPlatfrmById = function (_id, callback) {
	platfrmDao.findSchemaById(_id, function (err, platfrm) {
		callback(err, platfrm);
	});
};

/**
 * [findPlatfrmByEmail description]
 *
 * @method findPlatfrmByEmail
 *
 * @param  {[type]}       email    [description]
 * @param  {Function}     callback [description]
 *
 * @return {[type]}       [description]
 */
exports.findPlatfrmByEmail = function (email, callback) {
	platfrmDao.findSchema({
		email: email
	}, function (err, platfrm) {
		callback(err, platfrm);
	});
};

/**
 * [findPlatfrmByUsrnm description]
 *
 * @method findPlatfrmByUsrnm
 *
 * @param  {[type]}       usrnm    [description]
 * @param  {Function}     callback [description]
 *
 * @return {[type]}       [description]
 */
exports.findPlatfrmByUsrnm = function (usrnm, callback) {
	platfrmDao.findSchema({
		usrnm: usrnm
	}, function (err, platfrm) {
		callback(err, platfrm);
	});
};

/**
 * [findPlatfrms description]
 *
 * @method findPlatfrms
 *
 * @param  {[type]}   query    [description]
 * @param  {[type]}   limit    [description]
 * @param  {[type]}   order    [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.findPlatfrms = function (query, limit, order, callback) {
	platfrmDao.findSchemaLst(query, limit, order, function (err, platfrm) {
		callback(err, platfrm);
	});
};

/**
 * [findAllPlatfrms description]
 *
 * @method findAllPlatfrms
 *
 * @param  {[type]}    query    [description]
 * @param  {[type]}    order    [description]
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.findAllPlatfrms = function (query, order, callback) {
	platfrmDao.findAllSchemaLst(query, order, function (err, platfrm) {
		callback(err, platfrm);
	});
};

/**
 * [updatePlatfrmById description]
 *
 * @method updatePlatfrmById
 *
 * @param  {[type]}      _id      [description]
 * @param  {[type]}      set      [description]
 * @param  {Function}    callback [description]
 *
 * @return {[type]}      [description]
 */
exports.updatePlatfrmById = function (_id, set, callback) {
	set.upd_at = new mongoose.Types.ObjectId();
	platfrmDao.updateSchema({
		_id: _id
	}, set, {}, function (err, platfrm) {
		callback(err, platfrm);
	});
};