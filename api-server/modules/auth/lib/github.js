var request = require('request');
var winston = require('winston');
var USER_AGENT = "api-server";
exports.getUsrGithub = function(url) {
	try {
		console.log("url recibida: " + url);
		request.get({
			url: url,
			headers: {
				'Accept': 'application/json'
			}
		}, function(err, resp, body) {
			console.log('info', "Token github: ");
			console.log("body: ");
			console.log(body);
			body = JSON.parse(body);
			var axs_tkn = body.access_token;
			console.log('axs_tkn: '+ axs_tkn);
			var usr = getUsr(axs_tkn);
			console.log("User: ");
			console.log(usr);
			return usr;
		});
	} catch (error) {
		//return callback(error, null);
		console.log("error");
	}

};

getUsr = function(axs_tkn) {
	console.log("recibiendo axs_tkn: " + axs_tkn);
	var url = "https://api.github.com/user?access_token=" + axs_tkn;
	request.get({
		url: url,
		headers: {
			'User-Agent': USER_AGENT,
			'Accept': 'application/json'
		}
	}, function(err, resp, body) {
		console.log('info', "User github: ");
		console.log(body);
		return body;
	});
};