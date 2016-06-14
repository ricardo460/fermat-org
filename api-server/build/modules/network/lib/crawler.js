var request = require('request');
var winston = require('winston');
var satelize = require('satelize');
var env = process.env.NODE_ENV || 'development';
var AES = require("crypto-js/aes");
var SHA256 = require("crypto-js/sha256");
var config = require('../../../config');
var servMod = require('../server');
var clintMod = require('../client');
/**
 * [doLogin description]
 *
 * @method doLogin
 *
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
var doLogin = function(callback) {
    var credentials = {
        user: config.username,
        password: SHA256(config.password) + ''
    };
    var options = {
        url: 'http://' + config.ip + ':9090/fermat/api/user/login',
        method: 'POST',
        body: credentials,
        json: true
    };
    request(options, function(error, response, body) {
        if (error) return callback(error, null);
        if (body && body.success && body.authToken) {
            var authRequest = request.defaults({
                headers: {
                    'Authorization': 'Bearer ' + body.authToken
                }
            });
            winston.log('info', 'AuthToken: %s', body.authToken);
            return callback(null, authRequest);
        }
    });
};
/**
 * [doRequest description]
 *
 * @method doRequest
 *
 * @param  {[type]}   auth     [description]
 * @param  {[type]}   options  [description]
 * @param  {[type]}   type     [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
var doRequest = function(auth, options, type, callback) {
    auth(options, function(err, res, bod) {
        if (err) return callback(err, null);
        if (bod) {
            var data, body;
            switch (type) {
                case 0:
                    data = JSON.parse(bod);
                    data.registeredNetworkServiceDetail = JSON.parse(data.registeredNetworkServiceDetail);
                    data.registerOtherComponentDetail = JSON.parse(data.registerOtherComponentDetail);
                    break;
                case 1:
                    body = JSON.parse(bod);
                    data = JSON.parse(body.data);
                    break;
                case 2:
                    body = JSON.parse(bod);
                    data = JSON.parse(body.rl);
                    break;
                case 3:
                    body = JSON.parse(bod);
                    data = JSON.parse(body.rl);
                    break;
            }
            return callback(null, data);
        }
    });
};
/**
 * [saveNetworkStatus description]
 *
 * @method saveNetworkStatus
 *
 * @param  {Function}        callback [description]
 *
 * @return {[type]}          [description]
 */
exports.saveNetworkStatus = function(callback) {
    var hash = SHA256(config.ip) + '';
    var extra = {};
    var reportResult = function(error, client) {
        if (error) winston.log('error', 'Error on crawler', error);
        if (client) {
            winston.log('info', 'Client added!');
        }
    };
    var fillClientData = function(auth, client, server, callback) {
        doRequest(auth, {
            url: 'http://' + config.ip + ':9090/fermat/api/admin/monitoring/client/components/details',
            method: 'GET',
            qs : {
                i : client.identityPublicKey
            }
        }, 3, function(error, data) {
            
            if(error) return callback(error, null);
            
            client.comps = data;
            clintMod.insertClient(server._wave_id, server._id, client.identityPublicKey, client, callback);
        });
    };
    doLogin(function(err, auth) {
        doRequest(auth, {
            url: 'http://' + config.ip + ':9090/fermat/api/admin/monitoring/current/data',
            method: 'GET'
        }, 0, function(error, current) {
            if (error) return callback(error, null);
            if (current) {
                extra.current = current;
                doRequest(auth, {
                    url: 'http://' + config.ip + ':9090/fermat/api/admin/monitoring/system/data',
                    method: 'GET'
                }, 1, function(error, system) {
                    if (error) return callback(error, null);
                    if (system) {
                        extra.system = system;
                        satelize.satelize({
                            ip: config.ip
                        }, function(error, location) {
                            if (error) return callback(error, null);
                            if (location) {
                                extra.location = location;
                                servMod.insertServer(hash, extra, function(error, server) {
                                    if (error) return callback(error, null);
                                    if (server) {
                                        callback(null, server);
                                        doRequest(auth, {
                                            url: 'http://' + config.ip + ':9090/fermat/api/admin/monitoring/clients/list',
                                            method: 'GET'
                                        }, 2, function(error, clients) {
                                            if (error) winston.log('error', 'Error on crawler', error);
                                            if (clients) {
                                                for (var i = clients.length - 1; i >= 0; i--) {
                                                    fillClientData(auth, clients[i], server, reportResult);
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
};