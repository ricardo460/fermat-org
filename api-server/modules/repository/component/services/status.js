var mongoose = require('mongoose');
var Dao = require('../../../database/dao');
var statusMdl = require('../models/status');
var statusSch = require('../schemas/status');
var compMdl = require('../models/comp');
var compSch = require('../schemas/comp');

/**
 * [statusDao description]
 *
 * @type {Dao}
 */
var statusDao = new Dao('Status', statusSch, statusMdl, 'Comp', compSch, compMdl);

/**
 * [insertStatus description]
 *
 * @method insertStatus
 *
 * @param  {[type]}   status_mdl  [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.insertStatus = function(status_mdl, callback) {
    statusDao.insertSchema(status_mdl, function(err, status) {
        callback(err, status);
    });
};

/**
 * [findStatusById description]
 *
 * @method findStatusById
 *
 * @param  {[type]}    _id      [description]
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.findStatusById = function(_id, callback) {
    statusDao.findAndPopulateSchemaById(_id, '_comp_id', function(err, status) {
        callback(err, status);
    });
};

exports.findStatus = function(query, callback) {
    statusDao.findAndPopulateSchema(query, '_comp_id', function(err, compDev) {
        callback(err, compDev);
    });
};

/**
 * [findStatuss description]
 *
 * @method findStatuss
 *
 * @param  {[type]}   query    [description]
 * @param  {[type]}   limit    [description]
 * @param  {[type]}   order    [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.findStatuses = function(query, limit, order, callback) {
    statusDao.findAndPopulateSchemaLst(query, limit, order, '_comp_id', function(err, status) {
        callback(err, status);
    });
};

/**
 * [findAllStatuss description]
 *
 * @method findAllStatuss
 *
 * @param  {[type]}    query    [description]
 * @param  {[type]}    order    [description]
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.findAllStatuses = function(query, order, callback) {
    statusDao.findAndPopulateAllSchemaLst(query, order, '_comp_id', function(err, status) {
        callback(err, status);
    });
};

/**
 * [updateStatusById description]
 *
 * @method updateStatusById
 *
 * @param  {[type]}      _id      [description]
 * @param  {[type]}      set      [description]
 * @param  {Function}    callback [description]
 *
 * @return {[type]}      [description]
 */
exports.updateStatusById = function(_id, set, callback) {
    set.upd_at = new mongoose.Types.ObjectId();
    statusDao.updateSchema({
        _id: _id
    }, set, {}, function(err, status) {
        callback(err, status);
    });
};