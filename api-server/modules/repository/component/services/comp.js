var async = require('async');
var mongoose = require('mongoose');
var Dao = require('../../../database/dao');
var devSrv = require('../../developer/services/dev');
var compMdl = require('../models/comp');
var compSch = require('../schemas/comp');
var statusMdl = require('../models/status');
var statusSch = require('../schemas/status');
var compDevMdl = require('../models/compDev');
var compDevSch = require('../schemas/compDev');
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

/**
 * [findCompById description]
 *
 * @method findCompById
 *
 * @param  {[type]}     _id      [description]
 * @param  {Function}   callback [description]
 *
 * @return {[type]}     [description]
 */
exports.findCompById = function(_id, callback) {
    compDao.findSchemaById(_id, function(err, comp) {
        callback(err, comp);
    });
};

/**
 * [findComp description]
 *
 * @method findComp
 *
 * @param  {[type]}   query    [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.findComp = function(query, callback) {
    compDao.findSchema(query, function(err, comp) {
        callback(err, comp);
    });
};

/**
 * [findAllComps description]
 *
 * @method findAllComps
 *
 * @param  {[type]}     query    [description]
 * @param  {[type]}     order    [description]
 * @param  {Function}   callback [description]
 *
 * @return {[type]}     [description]
 */
exports.findAllComps = function(query, order, callback) {
    compDao.findAndPopulateAllSchemaLst(query, order, '_platfrm_id _suprlay_id _layer_id life_cycle devs', function(err, comps) {
        if (err) {
            callback(err, null);
        } else {
            var _comps = [];

            function loopComps(i) {
                if (i < comps.length) {
                    var _comp = comps[i];
                    var _compDevs = _comp.devs;
                    var _lifeCycle = _comp.life_cycle;
                    var _devs = [];

                    function loopCompDevs(j) {
                        if (j < _compDevs.length) {
                            var _compDev = {};
                            devSrv.findDevById(_compDevs[j]._dev_id, function(err_dev, res_dev) {
                                if (err_dev) {
                                    console.dir(err_dev);
                                    loopCompDevs(++j);
                                } else {
                                    console.dir(res_dev);
                                    _compDev.dev = res_dev;
                                    _compDev.role = _compDevs[j].role;
                                    _compDev.scope = _compDevs[j].scope;
                                    _compDev.percnt = _compDevs[j].percnt;
                                    _devs.push(_compDev);
                                    loopCompDevs(++j);
                                }
                            });
                        } else {
                            _comp.devs = _devs;
                            _comps.push(_comp);
                            loopComps(++i);
                        }
                    };
                    loopCompDevs(0);
                } else {
                    callback(null, _comps);
                }
            };
            loopComps(0);
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