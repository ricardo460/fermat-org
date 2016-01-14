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