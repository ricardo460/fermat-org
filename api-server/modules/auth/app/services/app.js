var mongoose = require('mongoose');
var Dao = require('../../../database/dao');
var AppMdl = require('../models/app');
var appSch = require('../schemas/app');
var UsrMdl = require('../../user/models/usr');
var usrSch = require('../../user/schemas/usr');
/**
 * [compDao description]
 *
 * @type {Dao}
 */
var appDao = new Dao('App', appSch, AppMdl, 'Usr', usrSch, UsrMdl);

/**
 * Insert app in database
 * @param  {[type]}   AppMdl   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.insertApp = function (AppMdl, callback) {
    'use strict';
    appDao.insertSchema(AppMdl, function (err, app) {
        callback(err, app);
    });
};

/**
 * Find app by id
 * @param  {[type]}   _id      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.findAppById = function (_id, callback) {
    'use strict';
    appDao.findSchemaById(_id, function (err, app) {
        callback(err, app);
    });
};

/**
 * Find app by ownerId
 * @param  {[type]}   _owner_id [description]
 * @param  {Function} callback  [description]
 * @return {[type]}             [description]
 */
exports.findAppByOwnerId = function (_owner_id, callback) {
    'use strict';
     appDao.findSchema({
        _owner_id: _owner_id
    }, function (err, app) {
        callback(err, app);
    });
};

/**
 * Find app by name
 * @param  {[type]}   name     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.findAppByName = function (name, callback) {
    'use strict';
     appDao.findSchema({
        name: name
    }, function (err, app) {
        callback(err, app);
    });
};

/**
 * Find apps applying filters
 * @param  {[type]}   query    [description]
 * @param  {[type]}   limit    [description]
 * @param  {[type]}   order    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.findApps = function (query, limit, order, callback) {
    'use strict';
    appDao.findSchemaLst(query, limit, order, function (err, app) {
        callback(err, app);
    });
};

/**
 * Find all apps
 * @param  {[type]}   query    [description]
 * @param  {[type]}   order    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.findAllApps = function (query, order, callback) {
    'use strict';
    appDao.findAllSchemaLst(query, order, function (err, app) {
        callback(err, app);
    });
};

/**
 * Update app by id
 * @param  {[type]}   _id      [description]
 * @param  {[type]}   set      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.updateAppById = function (_id, set, callback) {
    'use strict';
    set.upd_at = new mongoose.Types.ObjectId();
    appDao.updateSchema({
        _id: _id
    }, set, {}, function (err, app) {
        callback(err, app);
    });
};

/**
 * Delete all apps
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.delAllApps = function (callback) {
    'use strict';
    appDao.delAllSchemas(function (err, app) {
        callback(err, app);
    });
};
