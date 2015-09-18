var compSch = require('../schemas/comp');
var compMdl = require('../models/comp');
var Dao = require('../../../database/dao');

var compDao = new Dao('Comp', compSch, compMdl);

module.exports = compDao;