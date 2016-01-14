var mongoose = require('mongoose');
var Dao = require('../../../database/dao');
var devSrv = require('../../../repository/developer/services/dev');
var UsrMdl = require('../models/usr');
var usrSch = require('../schemas/usr');
/**
 * [compDao description]
 *
 * @type {Dao}
 */
var compDao = new Dao('Usr', usrSch, UsrMdl);