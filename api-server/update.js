var loadLib = require('./modules/repository/lib/loader');
var syncLib = require('./modules/repository/lib/syncer');
var winston = require('winston');

var _INTERVAL = 720000;

var loop = 0;


winston.log('info', 'Update interval on every %s minutes', (_INTERVAL / 1000) / 60);

setInterval(function () {
    'use strict';
    var mod = loop % 5;
    loop++;
    switch (mod) {
    case 0:
        loadLib.loadComps(function (err, res) {
            if (err) {
                winston.log('info', err.message, err);
            } else {
                winston.log('info', 'components and developers loaded', res);
            }
        });
        break;
    case 1:
        loadLib.updComps(function (err, res) {
            if (err) {
                winston.log('info', err.message, err);
            } else {
                winston.log('info', 'components updated', res);
            }
        });
        break;
    case 2:
        loadLib.updDevs(function (err, res) {
            if (err) {
                winston.log('info', err.message, err);
            } else {
                winston.log('info', 'developers updated', res);
            }
        });
        break;
    case 3:
        loadLib.loadDocs(function (err, res) {
            if (err) {
                winston.log('info', err.message, err);
            } else {
                winston.log('info', 'components and developers loaded', res);
            }
        });
        break;
    case 4:
        winston.log('info', 'getting documentation');
        syncLib.getBook();
        break;
    }
}, _INTERVAL);