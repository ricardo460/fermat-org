var mongoose = require('mongoose');
var Dao = require('../../../database/dao');
var TknMdl = require('../models/tkn');
var tknSch = require('../schemas/tkn');
var AppMdl = require('../../app/models/app');
var appSch = require('../../app/schemas/app');
var UsrMdl = require('../../user/models/usr');
var usrSch = require('../../user/schemas/usr');
/**
 * [compDao description]
 *
 * @type {Dao}
 */
var tknDao = new Dao('Tkn', tknSch, TknMdl, 'App', appSch, AppMdl, 'Usr', usrSch, UsrMdl);

/**
 * [insertToken description]
 * @param  {[type]}   TknMdl   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.insertToken = function(TknMdl, callback) {
	'use strict';
	appDao.insertSchema(TknMdl, function(err, token) {
		callback(err, token);
	});
};

exports.updateTokenByAccesToken = function (axs_key, set, callback) {
    'use strict';
    set.upd_at = new mongoose.Types.ObjectId();
    appDao.updateSchema({
        axs_key: axs_key
    }, set, {}, function (err, token) {
        callback(err, token);
    });
};
/**
 * [findTokenByAccesToken description]
 * @param  {[type]}   query    [description]
 * @param  {[type]}   path     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.findTokenByAccesToken = function(query, callback) {
	'use strict';
	appDao.findAndPopulateSchema(query, '_usr_id _app_id', function(err, token) {
		callback(err, token);
	});
};

/**
 * [findAllTokens description]
 * @param  {[type]}   query    [description]
 * @param  {[type]}   order    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.findAllTokens = function(query, order, callback) {
	'use strict';
	appDao.findAndPopulateAllSchemaLst(query, order, '_usr_id _app_id', function(err, token) {
		callback(err, token);
	});
};