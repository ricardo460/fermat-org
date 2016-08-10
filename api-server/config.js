var winston = require('winston');
var secret = require('../secret.json');
var config = {};
//
config.env = process.env.NODE_ENV || 'development';
//winston.log('info', 'Config Environment %s', config.env);
//

function printObject(obj) {
    for(var prop in obj) {
        if(typeof(obj[prop]) === 'object') {
            winston.log('info', '***Entering %s', prop);
            printObject(obj[prop]);
            winston.log('info', '***Exiting %s', prop);
        }
        else {
            winston.log('info', 'Config %s %s', prop, obj[prop]);
        }
    }
}

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
config.ftp = secret[config.env].ftp;
config.network = secret[config.env].network;
config.exrate = secret[config.env].exrate;
config.issues = secret[config.env].issues;

printObject(config);
module.exports = config;
