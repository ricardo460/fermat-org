var config = {};

config.env = process.env.NODE_ENV || 'development';

if (config.env == 'development') {
	config.database = {};
	config.database.server = '127.0.0.1';
    config.database.port = '27017';
    config.database.name = 'fermat-org';
} else {
	config.database = {};
	config.database.server = '127.0.0.1';
    config.database.port = '27017';
    config.database.name = 'fermat-org';
}

//ssh -i FermatBitcoin.pem ubuntu@52.11.156.16

module.exports = config;