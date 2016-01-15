var mongoose = require('mongoose');
var Dao = require('../../../database/dao');
var devMod = require('../../../repository/developer');
var UsrMdl = require('../models/usr');
var usrSch = require('../schemas/usr');
/**
 * [usrDao description]
 *
 * @type {Dao}
 */
var usrDao = new Dao('Usr', usrSch, UsrMdl);