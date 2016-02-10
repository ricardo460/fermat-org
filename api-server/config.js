var config = {};

config.env = process.env.NODE_ENV || 'development';

if (config.env == 'development') {
    config.database = {};
    config.database.server = '127.0.0.1';
    config.database.port = '27017';
    config.database.name = 'fermat-org-dev';
    config.client_id =  '6cac9cc2c2cb584c5bf4';
	config.client_secret = '4887bbc58790c7a242a8dafcb035c0a01dc2a199';
} else {
    config.database = {};
    config.database.server = '127.0.0.1';
    config.database.port = '27017';
    config.database.name = 'fermat-org';
    config.client_id =  '6cac9cc2c2cb584c5bf4';
	config.client_secret = '4887bbc58790c7a242a8dafcb035c0a01dc2a199';
}

//ssh -i FermatBitcoin.pem ubuntu@52.11.156.16

module.exports = config;