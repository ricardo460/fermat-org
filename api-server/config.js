var winston = require('winston');
var secret = require('../secret.json');
var config = {};
//
config.env = process.env.NODE_ENV || 'development';
winston.log('info', 'Config Environment %s', config.env);
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
winston.log('info', 'Config client_id %s', config.client_id);
config.client_secret = secret[config.env].client_secret;
winston.log('info', 'Config client_secret %s', config.client_secret);
config.oauth_token = secret[config.env].oauth_token;
winston.log('info', 'Config oauth_token %s', config.oauth_token);
config.user_agent = secret[config.env].user_agent;
winston.log('info', 'Config user_agent %s', config.user_agent);
config.username = secret[config.env].username;
winston.log('info', 'Config username %s', config.username);
config.password = secret[config.env].password;
winston.log('info', 'Config password %s', config.password);
config.ip = secret[config.env].ip;
winston.log('info', 'Config ip %s', config.ip);
config.host = secret[config.env].ftp.host;
winston.log('info', 'Config ftp.host %s', config.host);
config.port = secret[config.env].ftp.port;
winston.log('info', 'Config ftp.port %s', config.port);
config.user	= secret[config.env].ftp.user;
winston.log('info', 'Config ftp.user %s', config.user);
config.pass	= secret[config.env].ftp.pass;
winston.log('info', 'Config ftp.pass %s', config.pass);
module.exports = config;