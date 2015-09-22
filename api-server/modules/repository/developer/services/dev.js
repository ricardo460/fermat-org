var mongoose = require('mongoose');
var Dao = require('../../../database/dao');
var devMdl = require('../models/dev');
var devSch = require('../schemas/dev');

var devDao = new Dao('Dev', devSch, devMdl);

exports.insertDev = function (dev_mdl, callback) {
	devDao.insertSchema(dev_mdl, function (err, dev) {
		callback(err, dev);
	});
};

exports.findDevById = function (_id, callback) {
	devDao.findSchemaById(_id, function (err, dev) {
		callback(err, dev);
	});
};

exports.findDevByEmail = function (email, callback) {
	devDao.findSchema({
		email: email
	}, function (err, dev) {
		callback(err, dev);
	});
};

exports.findDevByUsrnm = function (usrnm, callback) {
	devDao.findSchema({
		usrnm: usrnm
	}, function (err, dev) {
		callback(err, dev);
	});
};

exports.findDevs = function (query, limit, order, callback) {
	devDao.findSchemaLst(query, limit, order, function (err, dev) {
		callback(err, dev);
	});
};

exports.findAllDevs = function (query, order, callback) {
	devDao.findAllSchemaLst(query, order, function (err, dev) {
		callback(err, dev);
	});
};

exports.updateDevById = function (_id, set, callback) {
	set.upd_at = new mongoose.Types.ObjectId();
	devDao.updateSchema({
		_id: _id
	}, set, {}, function (err, dev) {
		callback(err, dev);
	});
};