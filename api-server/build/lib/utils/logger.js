var winston = require('winston');

winston.loggers.options.transports = [
    new (winston.transports.Console)({'timestamp':true})
];