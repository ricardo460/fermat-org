var config = {};

config.env = process.env.NODE_ENV || 'development';

if (config.env == 'development') {
    config.database = {};
    config.database.server = '127.0.0.1';
    config.database.port = '27017';
    config.database.name = 'fermat-org-dev';
    config.client_id =  'f079f2a8fa65313179d5';
	config.client_secret = '15fb8131f6bf71cf39f16dcfea52c28c0d413b69';
} else {
    config.database = {};
    config.database.server = '127.0.0.1';
    config.database.port = '27017';
    config.database.name = 'fermat-org';
    config.client_id =  'f079f2a8fa65313179d5';
	config.client_secret = '15fb8131f6bf71cf39f16dcfea52c28c0d413b69';
}

//ssh -i FermatBitcoin.pem ubuntu@52.11.156.16

module.exports = config;