var devSch = require('../schemas/dev');
var devMdl = require('../models/dev');
var Dao = require('../../../database/dao');

var devDao = new Dao('Dev', devSch, devMdl);

module.exports = devDao;