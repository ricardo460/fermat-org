var platfrmSch = require('../schemas/platfrm');
var platfrmMdl = require('../models/platfrm');
var Dao = require('../../../database/dao');

var platfrmDao = new Dao('Platfrm', platfrmSch, platfrmMdl);

module.exports = platformDao;