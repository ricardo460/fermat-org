var request = require('request');
var winston = require('winston');
var USER_AGENT = "api-server";
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
			getUsr(axs_tkn, function(error, res) {
				if (error) {
					console.log("error", error);
					return callback(error, null);
				}
				console.log("return data user");
				return callback(null, res);
			});
		});
	} catch (error) {
		console.log("error", error);
		return callback(error, null);
	}

};

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