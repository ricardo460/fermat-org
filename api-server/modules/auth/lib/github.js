var request = require('request');
var winston = require('winston');
var USER_AGENT = "api-server";

/**
 * [getUsrGithub description]
 * @param  {[type]}   url      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.getUsrGithub = function(url, callback) {
	try {
		request.get({
			url: url,
			headers: {
				'Accept': 'application/json'
			}
		}, function(err, resp, body) {
			body = JSON.parse(body);
			var axs_tkn = body.access_token;
			getUsr(axs_tkn, function(error, res_usr) {
				if (error) {
					console.log("error", error);
					return callback(error, null);
				}
				console.log("return data user");
				res_usr = JSON.parse(res_usr);
				res_usr.set('github_tkn', axs_tkn);
				return callback(null, res_usr);
			});
		});
	} catch (error) {
		console.log("error", error);
		return callback(error, null);
	}

};

/**
 * [getUsr description]
 * @param  {[type]}   axs_tkn  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
getUsr = function(axs_tkn, callback) {
	var url = "https://api.github.com/user?access_token=" + axs_tkn;
	try {
		request.get({
			url: url,
			headers: {
				'User-Agent': USER_AGENT,
				'Accept': 'application/json'
			}
		}, function(err, resp, body) {
			return callback(null, body);
		});
	} catch (error) {
		return callback(error, null);
	}

};