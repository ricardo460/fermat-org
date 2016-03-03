var config = {};
var secret = require('../secret.json');
//
config.env = process.env.NODE_ENV || 'development';
//
config.database = {};
config.database.server = '127.0.0.1';
config.database.port = '27017';
if (config.env == 'production') {
	config.database.name = 'fermat-org';
} else if (config.env == 'testing') {
	config.database.name = 'fermat-org-test';
} else {
	config.database.name = 'fermat-org-dev';
}
config.client_id = secret[config.env].client_id;
config.client_secret = secret[config.env].client_secret;
config.oauth_token = secret[config.env].oauth_token;
config.user_agent = secret[config.env].user_agent;
module.exports = config;