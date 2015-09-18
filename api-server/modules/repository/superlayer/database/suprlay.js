var suprlaySch = require('../schemas/suprlay');
var suprlayMdl = require('../models/suprlay');
var Dao = require('../../../database/dao');

var suprlayDao = new Dao('Suprlay', suprlaySch, suprlayMdl);

module.exports = suprlayDao;