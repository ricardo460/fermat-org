var modApp = require('./app');
var modTkn = require('./token');
var modUsr = require('./user');
var libGithb = require('./lib/github');

/**
 * Obtain authorization to use the api
 * @param  {[type]}   url      [description]
 * @param  {[type]}   api_key  [description]
 * @param  {Function} callback [description]
 * @return tkn
 */
exports.getAutorization = function(url, api_key, callback) {
	try {
		//verifies that the API key is registered
		modApp.findAppByApiKey(api_key, function(err_app, res_app) {
			if (err_app) {
				console.log('error', err_app);
				return callback(err_app, null);
			} else {
				console.log('info', 'APi Key found');
				//Get user data that did login
				libGithb.getUsrGithub(url, function(error, usr) {
					if (error) {
						console.error("Error", error);
						return callback(error, null);
					} else {
						console.log("Get user");
						//Registering the user and developer in the database
						modUsr.insOrUpdUsr(usr.usrnm, usr.email, usr.name, usr.bday, usr.location, usr.avatar_url,
							usr.github_tkn, usr.url, usr.bio,
							function(err_usr, res_usr) {
								if (err_usr) {
									console.log('error', err_usr);
									return callback(err_usr, null);
								}
								if (res_usr) {
									console.log('info', 'Usr and Dev inserted');
									//Generating the token user
									modTkn.insTkn(res_usr._id, res_app._id, function(err_tkn, res_tkn) {
										if (err_tkn) {
											console.log('error', err_tkn);
											return callback(err_tkn, null);
										} else {
											console.log('info', 'Tkn generated');
											return callback(null, res_tkn);
										}
									});
								}
							});
					}
				});
			}
		});
	} catch (err) {
		console.log("Error", err);
		return callback(err, null);
	}
};

/**
 * [existApiKeyAndAxsKey description]
 * @param  {[type]}   api_key  [description]
 * @param  {[type]}   axs_key  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.verifiAxsKeyRelApiKey = function(api_key, axs_key, callback) {
	'use strict';
	try {
		modApp.findAppByApiKey(api_key, function(err, res) {
			if (err) {
				console.log('error', err);
				return callback(err, false);
			}
			if (res) {
				console.log('info', 'APi Key found');
				modTkn.getTkn(axs_key, function(err_res, res_tkn) {
					if (err_res) {
						console.log('error', err_res);
						return callback(err_res, false);
					}
					if (res_tkn) {
						console.log('info', 'access key found');
						if (res_tkn._app_id.api_key === api_key)
							return callback(null, true);
						else return callback(null, false);
					} else return callback(null, false);
				});
			} else return callback(null, false);
		});
	} catch (err) {
		console.log("Error", error);
		return callback(err, false);
	}
};

/**
 * [verifiAxsKeyRelApiKeyAndUsrnm description]
 * @param  {[type]}   api_key  [description]
 * @param  {[type]}   axs_key  [description]
 * @param  {[type]}   usrnm    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.verifiAxsKeyRelApiKeyAndUsrnm = function(api_key, axs_key, usrnm, callback) {
	'use strict';
	try {
		modApp.findAppByApiKey(api_key, function(err, res) {
			if (err) {
				console.log('error', err);
				return callback(err, false);
			}
			if (res) {
				console.log('info', 'APi Key found');
				modTkn.getTkn(axs_key, function(err_res, res_tkn) {
					if (err_res) {
						console.log('error', err_res);
						return callback(err_res, false);
					}
					if (res_tkn) {
						console.log('info', 'access key found');
						if (res_tkn._app_id.api_key === api_key && res_tkn._usr_id.usrnm === usrnm)
							return callback(null, true);
						else return callback(null, false);
					} else return callback(null, false);
				});
			} else return callback(null, false);
		});
	} catch (err) {
		console.log("Error", error);
		return callback(err, false);
	}
};


/**
 * [logout description]
 * @param  {[type]}   api_key  [description]
 * @param  {[type]}   axs_key  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.logout = function(api_key, axs_key, callback) {
	try {
		verifiAxsKeyRelApiKey(api_key, axs_key, function(err, res_del) {
			if (err) {
				console.log('error', err);
				return callback(err, false);
			}
			if (res_del) {
				console.log("Authorization granted")
				modTkn.delTkn(axs_key, function(err_res, res_tkn) {
					if (err_res) {
						console.log('error', err_res);
						return callback(err_res, false);
					}
					if (res_tkn) {
						console.log('info', 'logout success');
						return callback(null, true);
					} else {
						console.log('info', 'no logout');
						return callback(null, false);
					}
				});
			} else {
				console.log("Unauthorized user")
				return callback(err, false);
			}
		});
	} catch (err) {
		console.log("Error", error);
		return callback(err, false);
	}
};