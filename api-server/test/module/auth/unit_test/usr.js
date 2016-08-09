var usrMod = require('../../../../modules/auth/user');
var mongoose = require('mongoose');
var assert = require('assert');
var usrNm = null;
var email = null;
var permUsr = 77000;
var _INTERVAL = 2000;
var loop = 0;
describe('User', function() {
	before(function() {
		console.log('info', 'Starting database connexion');
		var db = require('../../../../db');
	});

	/*describe('#delAllUsrs()', function() {
		it('should remove all users', function(done) {
			usrMod.delAllUsrs(done);
		});
	});*/
	var usrs = [
		'darkespriest',
		'Rart3001',
		'lnacosta',
		'furszy',
		'acostarodrigo',
		'Luis-Fernando-Molina',
		'Miguelcldn',
		'emmanuelcolina',
		'IsaTab',
		'ricardo460',
		'simonorono',
		'kyxer',
		'fuelusumar',
		'nelsonalfo'
	];
	/*describe('#insOrUpdUsr()', function() {
		it('should save a user without error', function() {
				console.log("Usr", loop);
					usrMod.insOrUpdUsr('carlucho', 'carlucho' + '@gmail.com','carlucho', new Date(), 'maracaibo', 'avatar', new mongoose.Types.ObjectId(), 'url', 'bio', permUsr, function(err, resp) {
						usrNm = resp.usrnm;
						email = resp.email;
						console.log("Response ", resp);
					});
		});
	});*/

	describe('#getUsrs()', function() {
		it('should get a list of users', function() {
			usrMod.getUsrs(function(err, resp) {
				assert(resp.length > 0);
				console.log("resp.length", resp.length);
			});
		});
	});

	/*describe('#getUsrsByEmail()', function() {
		it('should obtain a given user email', function() {
			usrMod.getUsrsByEmail(email, function(err, resp) {
				console.log("User by email "+email, resp);
			});
		});
	});

	describe('#getUsrsByUsrnm()', function() {
		it('should obtain a given user name', function() {
			usrMod.getUsrsByUsrnm('campol', function(err, resp) {
				console.log("User by user name "+usrNm, resp);
			});
		});
	});*/
});