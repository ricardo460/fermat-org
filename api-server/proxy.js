'use strict';
var winston = require('winston'),
    events = require('events'),
    eventEmitter = new events.EventEmitter(),
    http = require('http'),
    httpProxy = require('http-proxy');

var proxy_api = {
    host: '127.0.0.1',
    port: 3000
};

var prod_api = {
    host: '127.0.0.1',
    port: 3001
};

var dev_api = {
    host: '127.0.0.1',
    port: 3002
};

/**
 * creates proxy servers and starts http server to redirect requests according to version
 */
var starProxyServer = function () {
    winston.log('info', 'Starting proxy server...');
    winston.log('info', 'Creating proxy server to %s:%s...', prod_api.host, prod_api.port);
    var prod_proxy = new httpProxy.createProxyServer({
        target: prod_api
    });
    winston.log('info', 'Creating proxy server to %s:%s...', dev_api.host, dev_api.port);
    var dev_proxy = new httpProxy.createProxyServer({
        target: dev_api
    });

    winston.log('info', 'Starting http server on port %s...', proxy_api.port);
    http.createServer(function (req, res) {
        var env = req.query.env || 'production';
        if (env === 'development') {
            // redirect to dev api
            dev_proxy.proxyRequest(req, res);
        } else {
            // redirect to prod api
            prod_proxy.proxyRequest(req, res);
        }
    }).listen(proxy_api.port);
};

// action to take when events are emitted
eventEmitter.on('starProxyServer', starProxyServer);

// events emision
eventEmitter.emit('starProxyServer');

process.on('uncaughtException', function (err) {
    winston.log('info', 'Error starting the proxy', err);
});