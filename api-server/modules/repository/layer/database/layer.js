var layerSch = require('../schemas/layer');
var layerMdl = require('../models/layer');
var Dao = require('../../../database/dao');

var layerDao = new Dao('Layer', layerSch, layerMdl);

module.exports = layerDao;