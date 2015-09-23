var mongoose = require('mongoose');
var Dao = require('../../../database/dao');
var compMdl = require('../models/comp');
var compSch = require('../schemas/comp');
var compDevMdl = require('../models/compDev');
var compDevSch = require('../schemas/compDev');
var compDevSrv = require('./compDev');
var platfrmMdl = require('../../platform/models/platfrm');
var platfrmSch = require('../../platform/schemas/platfrm');
var suprlayMdl = require('../../superlayer/models/suprlay');
var suprlaySch = require('../../superlayer/schemas/suprlay');
var layerMdl = require('../../layer/models/layer');
var layerSch = require('../../layer/schemas/layer');


/**
 * [compDao description]
 *
 * @type {Dao}
 */
var compDao = new Dao('Comp', compSch, compMdl, 'CompDev', compDevSch, compDevMdl,
    'Platfrm', platfrmSch, platfrmMdl,
    'Suprlay', suprlaySch, suprlayMdl,
    'Layer', layerSch, layerMdl);

/**
 * [insertComp description]
 *
 * @method insertComp
 *
 * @param  {[type]}   comp_mdl  [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.insertComp = function(comp_mdl, callback) {
    compDao.insertSchema(comp_mdl, function(err, comp) {
        callback(err, comp);
    });
};


exports.findCompById = function(_id, callback) {
    compDao.findAndPopulateSchemaById(_id, '_platfrm_id _suprlay_id _layer_id', function(err, comp) {
        //TODO: fill devs
        callback(err, comp);
    });
};


exports.findComps = function(query, limit, order, callback) {
    compDao.findAndPopulateSchemaLst(query, limit, order, '_platfrm_id _suprlay_id _layer_id', function(err, comp) {
        //TODO: fill devs
        callback(err, comp);
    });
};


exports.findAllComps = function(query, order, callback) {
    compDao.findAndPopulateAllSchemaLst(query, order, '_platfrm_id _suprlay_id _layer_id', function(err, comp) {
        //TODO: fill devs
        callback(err, comp);
    });
};

/**
 * [updateCompById description]
 *
 * @method updateCompById
 *
 * @param  {[type]}      _id      [description]
 * @param  {[type]}      set      [description]
 * @param  {Function}    callback [description]
 *
 * @return {[type]}      [description]
 */
exports.updateCompById = function(_id, set, callback) {
    set.upd_at = new mongoose.Types.ObjectId();
    compDao.updateSchema({
        _id: _id
    }, set, {}, function(err, comp) {
        callback(err, comp);
    });
};


exports.pushDevToCompById = function(_id, _dev_id, callback) {
    //TODO: insert compDev
    compDao.pushToArray({
        _id: _id
    }, 'devs', _dev_id, {
        multi: false
    }, function(err, comp) {
        callback(err, comp);
    });
};


exports.pullDevFromCompById = function(_id, _dev_id, callback) {
    //TODO: find compDev
    compDao.pullFromArray({
        _id: _id
    }, 'devs', _dev_id, {
        multi: false
    }, function(err, comp) {
        callback(err, comp);
    });
};