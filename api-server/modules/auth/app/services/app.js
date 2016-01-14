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