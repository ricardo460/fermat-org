var config = {};

config.env = process.env.NODE_ENV || 'development';

if (config.env == 'development') {
    config.database = {};
    config.database.server = '127.0.0.1';
    config.database.port = '27017';
    config.database.name = 'fermat-org-dev';
    config.client_id =  'c25e3b3b1eb9aa35c773';
	config.client_secret = '9a89a6b7ff1f43141a8f748ba27446fbe6430e45';
} else {
    config.database = {};
    config.database.server = '127.0.0.1';
    config.database.port = '27017';
    config.database.name = 'fermat-org';
    config.client_id =  'c25e3b3b1eb9aa35c773';
	config.client_secret = '9a89a6b7ff1f43141a8f748ba27446fbe6430e45';
}

//ssh -i FermatBitcoin.pem ubuntu@52.11.156.16

module.exports = config;