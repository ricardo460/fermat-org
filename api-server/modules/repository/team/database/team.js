var teamSch = require('../schemas/team');
var teamMdl = require('../models/team');
var Dao = require('../../../database/dao');

var teamDao = new Dao('Team', teamSch, teamMdl);

module.exports = teamDao;