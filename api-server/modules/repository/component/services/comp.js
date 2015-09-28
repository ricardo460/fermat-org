var async = require('async');
var mongoose = require('mongoose');
var Dao = require('../../../database/dao');
var compMdl = require('../models/comp');
var compSch = require('../schemas/comp');
var statusMdl = require('../models/status');
var statusSch = require('../schemas/status');
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
    'Layer', layerSch, layerMdl,
    'Status', statusSch, statusMdl);

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

//TODO: need testing
exports.findCompById = function(_id, callback) {
    compDao.findAndPopulateSchemaById(_id, '_platfrm_id _suprlay_id _layer_id life_cycle', function(err, comp) {
        //TODO: fill devs
        if (comp && comp.devs && Array.isArray(comp.devs) && comp.devs.length > 0) {
            async.forEach(comp.devs, function(compDev, callbackForEach) {
                compDevSrv.findCompDevById(compDev, function(err, res) {
                    compDev = res; // asign res to compDev
                    callbackForEach(); // tell async that the iterator has completed
                });
            }, function(err) {
                callback(err, comp); // iterating done
            });
        } else {
            callback(err, comp);
        }
    });
};

//TODO: need testing
exports.findComp = function(query, callback) {
    compDao.findAndPopulateSchema(query, '_platfrm_id _suprlay_id _layer_id life_cycle', function(err, comp) {
        if (comp && comp.devs && Array.isArray(comp.devs) && comp.devs.length > 0) {
            async.forEach(comp.devs, function(compDev, callbackForEach) {
                compDevSrv.findCompDevById(compDev, function(err, res) {
                    compDev = res; // asign res to compDev
                    callbackForEach(); // tell async that the iterator has completed
                });
            }, function(err) {
                callback(err, comp); // iterating done
            });
        } else {
            callback(err, comp);
        }
    });
};

//TODO: need testing
exports.findComps = function(query, limit, order, callback) {
    compDao.findAndPopulateSchemaLst(query, limit, order, '_platfrm_id _suprlay_id _layer_id life_cycle', function(err, comps) {
        if (comps && Array.isArray(comps) && comps.length > 0) {
            async.forEach(comps, function(comp, callbackForEachComps) {
                /********************************************************/
                if (comp && comp.devs && Array.isArray(comp.devs) && comp.devs.length > 0) {
                    async.forEach(comp.devs, function(compDev, callbackForEach) {
                        compDevSrv.findCompDevById(compDev, function(err, res) {
                            compDev = res; // asign res to compDev
                            callbackForEach(); // tell async that the iterator has completed
                        });
                    }, function(err) {
                        callbackForEachComps(); // iterating done
                    });
                } else {
                    callbackForEachComps();
                }
                /********************************************************/
            }, function(err) {
                callback(err, comps); // iterating done
            });
        } else {
            callback(err, comps);
        }
    });
};

//TODO: need testing
exports.findAllComps = function(query, order, callback) {
    compDao.findAndPopulateAllSchemaLst(query, order, '_platfrm_id _suprlay_id _layer_id life_cycle', function(err, comps) {
        if (comps && Array.isArray(comps) && comps.length > 0) {
            async.forEach(comps, function(comp, callbackForEachComps) {
                /********************************************************/
                if (comp && comp.devs && Array.isArray(comp.devs) && comp.devs.length > 0) {
                    async.forEach(comp.devs, function(compDev, callbackForEach) {
                        compDevSrv.findCompDevById(compDev, function(err, res) {
                            compDev = res; // asign res to compDev
                            callbackForEach(); // tell async that the iterator has completed
                        });
                    }, function(err) {
                        callbackForEachComps(); // iterating done
                    });
                } else {
                    callbackForEachComps();
                }
                /********************************************************/
            }, function(err) {
                callback(err, comps); // iterating done
            });
        } else {
            callback(err, comps);
        }
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

/**
 * [pushDevToCompById description]
 *
 * @method pushDevToCompById
 *
 * @param  {[type]}          _id         [description]
 * @param  {[type]}          _compDev_id [description]
 * @param  {Function}        callback    [description]
 *
 * @return {[type]}          [description]
 */
exports.pushDevToCompById = function(_id, _compDev_id, callback) {
    var compDev_mdl = new compDevMdl();
    compDao.pushToArray({
        _id: _id
    }, 'devs', _compDev_id, {
        multi: false
    }, function(err, comp) {
        callback(err, comp);
    });
};

/**
 * [pushDevToCompById description]
 *
 * @method pushDevToCompById
 *
 * @param  {[type]}          _id         [description]
 * @param  {[type]}          _compDev_id [description]
 * @param  {Function}        callback    [description]
 *
 * @return {[type]}          [description]
 */
exports.pullDevFromCompById = function(_id, _compDev_id, callback) {
    compDao.pullFromArray({
        _id: _id
    }, 'devs', _compDev_id, {
        multi: false
    }, function(err, comp) {
        callback(err, comp);
    });
};

/**
 * [pushLifeCycleToCompById description]
 *
 * @method pushLifeCycleToCompById
 *
 * @param  {[type]}                _id        [description]
 * @param  {[type]}                _status_id [description]
 * @param  {Function}              callback   [description]
 *
 * @return {[type]}                [description]
 */
exports.pushStatusToCompLifeCycleById = function(_id, _status_id, callback) {
    var compDev_mdl = new compDevMdl();
    compDao.pushToArray({
        _id: _id
    }, 'life_cycle', _status_id, {
        multi: false
    }, function(err, comp) {
        callback(err, comp);
    });
};

/**
 * [pullLifeCycleFromCompById description]
 *
 * @method pullLifeCycleFromCompById
 *
 * @param  {[type]}                  _id        [description]
 * @param  {[type]}                  _status_id [description]
 * @param  {Function}                callback   [description]
 *
 * @return {[type]}                  [description]
 */
exports.pullStatusFromCompLifeCycleById = function(_id, _status_id, callback) {
    compDao.pullFromArray({
        _id: _id
    }, 'life_cycle', _status_id, {
        multi: false
    }, function(err, comp) {
        callback(err, comp);
    });
};