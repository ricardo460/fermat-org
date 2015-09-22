var mongoose = require('mongoose');
var Dao = require('../../../database/dao');
var teamMdl = require('../models/team');
var teamSch = require('../schemas/team');
var devMdl = require('../../developer/models/dev');
var devSch = require('../../developer/schemas/dev');

/**
 * [teamDao description]
 *
 * @type {Dao}
 */
var teamDao = new Dao('Team', teamSch, teamMdl, 'Dev', devSch, devMdl);

/**
 * [insertTeam description]
 *
 * @method insertTeam
 *
 * @param  {[type]}   team_mdl  [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.insertTeam = function (team_mdl, callback) {
	teamDao.insertSchema(team_mdl, function (err, team) {
		callback(err, team);
	});
};

/**
 * [findTeamById description]
 *
 * @method findTeamById
 *
 * @param  {[type]}    _id      [description]
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.findTeamById = function (_id, callback) {
	teamDao.findSchemaById(_id, function (err, team) {
		callback(err, team);
	});
};

/**
 * [findTeamByName description]
 *
 * @method findTeamByName
 *
 * @param  {[type]}       name     [description]
 * @param  {Function}     callback [description]
 *
 * @return {[type]}       [description]
 */
exports.findTeamByName = function (name, callback) {
	teamDao.findSchema({
		name: name
	}, function (err, team) {
		callback(err, team);
	});
};

/**
 * [findTeams description]
 *
 * @method findTeams
 *
 * @param  {[type]}   query    [description]
 * @param  {[type]}   limit    [description]
 * @param  {[type]}   order    [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.findTeams = function (query, limit, order, callback) {
	teamDao.findSchemaLst(query, limit, order, function (err, team) {
		callback(err, team);
	});
};

/**
 * [findAllTeams description]
 *
 * @method findAllTeams
 *
 * @param  {[type]}    query    [description]
 * @param  {[type]}    order    [description]
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.findAllTeams = function (query, order, callback) {
	teamDao.findAllSchemaLst(query, order, function (err, team) {
		callback(err, team);
	});
};

/**
 * [updateTeamById description]
 *
 * @method updateTeamById
 *
 * @param  {[type]}      _id      [description]
 * @param  {[type]}      set      [description]
 * @param  {Function}    callback [description]
 *
 * @return {[type]}      [description]
 */
exports.updateTeamById = function (_id, set, callback) {
	set.upd_at = new mongoose.Types.ObjectId();
	teamDao.updateSchema({
		_id: _id
	}, set, {}, function (err, team) {
		callback(err, team);
	});
};