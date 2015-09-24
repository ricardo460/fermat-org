var teamSrv = require('./services/team');
var TeamMdl = require('./models/team');

var comp_0 = new CompMdl('fermat-org', 'description of fermat-org work group');
var comp_1 = new CompMdl('fermat-org', 'description of fermat-org work group');
var comp_2 = new CompMdl('fermat-org', 'description of fermat-org work group');

comp_0.getCode();
comp_1.getCode();

/*teamSrv.insertTeam(team, function(err, res) {
	console.dir(err);
	console.dir(res);
});*/

/*teamSrv.pushDevToTeamById({_id: "5601d4b0e6b05c4d347217be"}, '560169c78340957c20e55729', function(err, res) {
	console.dir(err);
	console.dir(res);
});*/


/*teamSrv.findTeamById('5601d4b0e6b05c4d347217be', function(err, res) {
	if (err) console.dir(err);
	if (res) console.dir(res);
});*/
/*teamSrv.findTeamByEmail("fuelusumar@gmail.com", function(err, res) {
	if (err) console.dir(err);
	if (res) console.dir(res);
});
teamSrv.findTeamByUsrnm("fuelusumar", function(err, res) {
	if (err) console.dir(err);
	if (res) console.dir(res);
});
teamSrv.findTeams({}, 100, {}, function(err, res) {
	if (err) console.dir(err);
	if (res) console.dir(res);
});
teamSrv.findAllTeams({}, {}, function(err, res) {
	if (err) console.dir(err);
	if (res) console.dir(res);
});*/

/*teamSrv.updateTeamById('560169c78340957c20355729', {bday: "1986/07/31"}, function(err, res) {
	if (err) console.dir(err);
	if (res) console.dir(res);
});*/