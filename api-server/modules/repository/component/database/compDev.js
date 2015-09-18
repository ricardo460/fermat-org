var compDevSch = require('../schemas/compDev');
var compDevMdl = require('../models/compDev');
var Dao = require('../../../database/dao');

var compDevDao = new Dao('CompDev', compDevSch, compDevMdl);

module.exports = compDevDao;