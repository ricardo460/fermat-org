var fs = require('fs');
var request = require('request');
var js2xmlparser = require("js2xmlparser");
var _HOST = "http://api.fermat.org/v1/";
var token = "";
var usr_id = "";
var env = "";

//get superlayers
var genereting = function(env, usr_id, token, callback) {
	request(_HOST + "repo/usrs/" + usr_id + "/suprlays?axs_key=" + token + "&env=" + env, function (error, response, body) {
		if (error) {
			return callback(error, null);
		} else {
			var json = {};
			json.suprlay = JSON.parse(body);
			fs.writeFile("./xmls/"+ env +"/suprlays.xml", js2xmlparser("suprlays", json), function (err) {
				if (err) {
					return console.log(err);
				}
				//get layers
				request(_HOST + "repo/usrs/" + usr_id + "/layers?axs_key=" + token + "&env=" + env, function (error, response, body) {
					if (error) {
						return callback(error, null);
					} else {
						var json = {};
						json.layer = JSON.parse(body);
						fs.writeFile("./xmls/"+ env +"/layers.xml", js2xmlparser("layers", json), function (err) {
							if (err) {
								return console.log(err);
							}
							//get platforms
							request(_HOST + "repo/usrs/" + usr_id + "/platfrms?axs_key=" + token + "&env=" + env, function (error, response, body) {
								if (error) {
									return callback(error, null);
								} else {
									var json = {};
									json.platform = JSON.parse(body);
									fs.writeFile("./xmls/"+ env +"/platforms.xml", js2xmlparser("platforms", json), function (err) {
										if (err) {
											return console.log(err);
										}
										//get componentes
										request(_HOST + "repo/usrs/" + usr_id + "/comps?axs_key=" + token + "&env=" + env, function (error, response, body) {
											if (error) {
												return callback(error, null);
											} else {
												var json = {};
												json.comp = JSON.parse(body);
												var options = {
													"arrayMap": {
														"devs": "comp_dev",
														"life_cycle": "stage"
													}
												};
												fs.writeFile("./xmls/"+ env +"/comps.xml", js2xmlparser("comps", json, options), function (err) {
													if (err) {
														return console.log(err);
													}
													//procs
													request(_HOST + "repo/usrs/" + usr_id + "/procs?axs_key=" + token + "&env=" + env, function (error, response, body) {
														if (error) {
															return callback(error, null);
														} else {
															var json = {};
															json.proc = JSON.parse(body);
															var options = {
																"arrayMap": {
																	"steps": "step"
																}
															};
															fs.writeFile("./xmls/"+ env +"/procs.xml", js2xmlparser("procs", json, options), function (err) {
																if (err) {
																	return console.log(err);
																}
																return callback(null, true);
															});
														}
													});
												});
											}
										});
									});
								}
							});
						});
					}
				});
			});
		}
	});
}

var selection = function(env){
	switch(env){
		case "development":
			token = "56c7895cc01a204369238c4b";
			usr_id = "56c7895cc01a204369238c43";
			genereting(env, usr_id, token, function(error, result){
				if (error) {
					console.log(error)
				} else {
					selection("production");
				}
			});
		break;
		case "production":
			token = "56c621557d20701f4148eaad";
			usr_id = "56c621557d20701f4148eaaa";
			genereting(env, usr_id, token, function(error, result){
				if (error) {
					console.log(error)
				} else {
					selection("testing");
				}
			});
		break;
		case "testing":
			token = "56d9946df87ede9a50462120";
			usr_id = "56d9946df87ede9a50462119";
			genereting(env, usr_id, token, function(error, result){
				if (error) {
					console.log(error)
				}
			});
		break;
	}
}
selection("development")