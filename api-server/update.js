var winston = require('winston');
var loadLib = require('./modules/repository/lib/loader');
var syncLib = require('./modules/repository/lib/syncer');
var loadNet = require('./modules/network/lib/crawler');
var modDoc = require('./modules/repository/doc');
var Cache = require('./lib/route-cache');
var cache = new Cache({
    type: 'file'
});
var _INTERVAL = 300000;
var loop = 0;
var update = function() {
    'use strict';
    var mod = loop % 12; //5 minutes and 12 loops = 1 hour
    winston.log('info', 'Updating %s', mod);
    loop++;
    switch (mod) {
        case 0:
            loadNet.saveNetworkStatus(function(err, res) {
                winston.log('info', 'Updated ns');
                if (err) {
                    winston.log('error', err.message, err.stack);
                } else {
                    winston.log('debug', 'Network status updated', res);
                }
            });
            break;
        case 1:
            //verifica que cada componente esta dentro en la carpeta que le corresponde
            /*loadLib.updComps(function (err, res) {
			if (err) {
				winston.log('error', err.message, err.stack);
			} else {
				winston.log('debug', 'Components updated', res);
			}
		});*/
            break;
        case 2:
            //se descarga la informacion de los developers
            /*loadLib.updDevs(function (err, res) {
			if (err) {
				winston.log('error', err.message, err.stack);
			} else {
				winston.log('debug', 'Developers updated', res);
				cache.clear();
			}
		});*/
            break;
        default:
            //Nothing else to update
            //se descarga la informacion de los developers
            /*loadLib.loadComps(function (err, res) {
            if (err) {
                winston.log('error', err.message, err.stack);
            } else {
                winston.log('debug', 'Developers updated', res);
                cache.clear();
            }
        });*/
            winston.log('info', 'Doing nothing');
            break;
    }
};
winston.log('info', 'Update interval on every %s minutes', (_INTERVAL / 1000) / 60);
update();
setInterval(update, _INTERVAL);