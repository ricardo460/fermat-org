var mongoose = require('mongoose');
var Dao = require('../../../database/dao');
var layerMdl = require('../models/layer');
var layerSch = require('../schemas/layer');

/**
 * [layerDao description]
 *
 * @type {Dao}
 */
var layerDao = new Dao('Layer', layerSch, layerMdl);

/**
 * [insertLayer description]
 *
 * @method insertLayer
 *
 * @param  {[type]}   layer_mdl  [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.insertLayer = function (layer_mdl, callback) {
	layerDao.insertSchema(layer_mdl, function (err, layer) {
		callback(err, layer);
	});
};

/**
 * [findLayerById description]
 *
 * @method findLayerById
 *
 * @param  {[type]}    _id      [description]
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.findLayerById = function (_id, callback) {
	layerDao.findSchemaById(_id, function (err, layer) {
		callback(err, layer);
	});
};

/**
 * [findLayerByCode description]
 *
 * @method findLayerByLang
 *
 * @param  {[type]}       lang    [description]
 * @param  {Function}     callback [description]
 *
 * @return {[type]}       [description]
 */
exports.findLayerByLang = function (lang, callback) {
	layerDao.findSchema({
		lang: lang
	}, function (err, layer) {
		callback(err, layer);
	});
};

/**
 * [findLayerByName description]
 *
 * @method findLayerByName
 *
 * @param  {[type]}       name    [description]
 * @param  {Function}     callback [description]
 *
 * @return {[type]}       [description]
 */
exports.findLayerByName = function (name, callback) {
	layerDao.findSchema({
		name: name
	}, function (err, layer) {
		callback(err, layer);
	});
};

/**
 * [findLayers description]
 *
 * @method findLayers
 *
 * @param  {[type]}   query    [description]
 * @param  {[type]}   limit    [description]
 * @param  {[type]}   order    [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.findLayers = function (query, limit, order, callback) {
	layerDao.findSchemaLst(query, limit, order, function (err, layer) {
		callback(err, layer);
	});
};

/**
 * [findAllLayers description]
 *
 * @method findAllLayers
 *
 * @param  {[type]}    query    [description]
 * @param  {[type]}    order    [description]
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.findAllLayers = function (query, order, callback) {
	layerDao.findAllSchemaLst(query, order, function (err, layer) {
		callback(err, layer);
	});
};

/**
 * [updateLayerById description]
 *
 * @method updateLayerById
 *
 * @param  {[type]}      _id      [description]
 * @param  {[type]}      set      [description]
 * @param  {Function}    callback [description]
 *
 * @return {[type]}      [description]
 */
exports.updateLayerById = function (_id, set, callback) {
	set.upd_at = new mongoose.Types.ObjectId();
	layerDao.updateSchema({
		_id: _id
	}, set, {}, function (err, layer) {
		callback(err, layer);
	});
};