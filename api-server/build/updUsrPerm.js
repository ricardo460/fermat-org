var modUsr = require('./modules/auth/user');
var mongoose = require('mongoose');
var authMod = require('./modules/auth');
var _INTERVAL = 2000;
var loop = 0;

console.log('info', 'Update interval on every %s minutes', (_INTERVAL / 1000) / 60);
setInterval(function() {
	var mod = loop % 3;
	loop++;
	switch (mod) {
		case 0:
			console.log('info', 'Starting database connexion');
			var db = require('./db');
			break;
		case 1:
			console.log('info', 'Obtaining user list');
			modUsr.getUsrs(function(err_res, res_usrs) {
				if (err_res) {
					console.log('error', err_res);
				} else {
					console.log("List users: ");
					for (var i = 0; i < res_usrs.length; i++) {
						var usrnm = res_usrs[i].usrnm;
						console.log("Usr " + i, " " + res_usrs[i].usrnm);
						if (usrnm.match("luis-fernando-molina") || usrnm.match("darkespriest") ||
							usrnm.match("rart3001") || usrnm.match("lnacosta") || usrnm.match("furszy") ||
							usrnm.match("acostarodrigo") || usrnm.match("nelsonalfo")) {
							console.log(res_usrs[i].usrnm, " 77766");
							authMod.changePermission(res_usrs[i].usrnm, 77766, function(err, res) {
								if (err) {
									console.log("Error change permission", err);
								} else {
									console.log("Info", "Permission successfully changed");
								}
							});
						} else
						if (usrnm.match("miguelcldn") || usrnm.match("emmanuelcolina") ||
							usrnm.match("isatab") || usrnm.match("ricardo460") || usrnm.match("simonorono") ||
							usrnm.match("fuelusumar") || usrnm.match("campol") || usrnm.match("kyxer")) {
							console.log(res_usrs[i].usrnm, " 77777");
							authMod.changePermission(res_usrs[i].usrnm, 77777, function(err, res) {
								if (err) {
									console.log("Error change permission", err);
								} else {
									console.log("Info", "Permission successfully changed");
								}
							});
						} else {
							console.log(res_usrs[i].usrnm, " 77000");
							authMod.changePermission(res_usrs[i].usrnm, 77000, function(err, res) {
								if (err) {
									console.log("Error change permission", err);
								} else {
									console.log("Info", "Permission successfully changed");
								}
							});
						}
					}
				}
			});
			break;
		case 2:
			console.log('info', 'Killing process');
			process.exit(1);
			break;
	}
}, _INTERVAL);