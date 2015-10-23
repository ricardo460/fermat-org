var loadLib = require('./modules/repository/lib/loader');
var syncLib = require('./modules/repository/lib/syncer');
var winston = require('winston');

var _INTERVAL = 720000;

var loop = 0;


winston.log('info', 'Update interval on every %s minutes', (_INTERVAL / 1000) / 60);

setInterval(function () {
    'use strict';
    var mod = loop % 5;
    loop ++;
    switch (mod) {
    case 0:
        winston.log('info', 'Getting documentation');
        syncLib.getBook();
        winston.log('info', 'Documentation loaded');
        break;
    case 1:
        /*loadLib.loadDocs(function (err, res) {
            if (err) {
                winston.log('info', err.message, err);
            } else {
                winston.log('info', 'documentation loaded', res);
            }
        });*/
        winston.log('info', 'Doing nothing');
        break;
    case 2:
        loadLib.loadComps(function (err, res) {
            if (err) {
                winston.log('info', err.message, err);
            } else {
                winston.log('info', 'Components and developers loaded', res);
            }
        });
        break;
    case 3:
        loadLib.updComps(function (err, res) {
            if (err) {
                winston.log('info', err.message, err);
            } else {
                winston.log('info', 'Components updated', res);
            }
        });
        break;
    case 4:
        loadLib.updDevs(function (err, res) {
            if (err) {
                winston.log('info', err.message, err);
            } else {
                winston.log('info', 'Developers updated', res);
            }
        });
        break;
    }
}, _INTERVAL);