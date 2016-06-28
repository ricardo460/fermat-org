var request = require('request');
var winston = require('winston');
var satelize = require('satelize');
var env = process.env.NODE_ENV || 'development';
var AES = require("crypto-js/aes");
var SHA256 = require("crypto-js/sha256");
var config = require('../../../config');
var servMod = require('../server');
var clintMod = require('../client');
var actrMod = require('../actor');
var urls = {
    catalog : '/fermat/rest/api/v1/network/catalog',
    data : '/fermat/rest/api/v1/network/data',
    clients : '/fermat/rest/api/v1/network/clients',
    actors : '/fermat/rest/api/v1/network/actors'
};
var port = '8080';

var doRequest = function(ip, route, callback) {
    var url = buildURL(ip, route);
    var data = {};
    
    request({
        url : url,
        json : true,
        method: 'GET'
    }, function(error, response, body) {
        if(error) {
            return callback(error, null);
        }
        
        if(body && response.statusCode === 200) {
            
            data = parseRecursively(body);
            
            if(data.error) {
                winston.log('error', 'Fermat Node request failed with code %s: %s', data.error.code, data.error.message);
                return callback(data.error, null);
            }
        }
        return callback(null, data);
    });
};

/**
 * Parses a json object recursively
 * @author Miguelcldn
 * @param   {st}     input The input string
 * @returns {object} A recursively-parsed object from the JSON
 */
var parseRecursively = function(input) {
    var output = {};
    try {
        //Sanitize strings
        // did't work output = input.split('\"').join('\\"');
        //output = JSON.parse(input);
        if(typeof input === 'string') output = JSON.parse(input);
        else output = input;
        
        if(typeof output === 'object') {
            for(var prop in output) {
                var elm = output[prop];
                if(typeof elm === 'string' && (elm[0] === '{' || elm[0] === '[')) {
                    output[prop] = parseRecursively(elm);
                }
            }
        }
    } catch(e) {
        output = {};
        winston.log('error', 'Could not parse the input %s', input);
        //winston.log('error', '%j', e);
    }
    return output;
};

/**
 * Builds the URL to interact with the Fermat Node's API
 * @author Miguelcldn
 * @param   {string} ip    The ip con use as root
 * @param   {string} route The type of route to obtain
 * @returns {string} A full URL for the request
 */
var buildURL = function(ip, route) {
    return 'http://' + ip + ':' + port + urls[route];
};

/**
 * Extract the service data from a server
 * @author Miguelcldn
 * @param   {string} ip     Ip of the server
 */
var extractServerData = function(ip, callback) {
    doRequest(ip, 'data', function(err, data) {
        if(err) return callback(err, null);
        servMod.insertServer(data.hash, data.location, ip, data.networkServices, callback);
    });
};

/**
 * Extract the clients from a server
 * @author Miguelcldn
 * @param   {object}   serverModel Server object
 * @param   {string}   ip          IP of the server
 */
var extractServerClients = function(serverModel, ip, callback) {
    var printResult = function(err, data) {
        if(err) {
            winston.log('error', 'Could not save clients model. %j', err, {});
        }
    };
    
    doRequest(ip, 'clients', function(err, data) {
        if(err) return callback(err, null);
        
        servMod.updateServer(serverModel._id, serverModel._wave_id, {conectedClients : data.length}, function(err, data) {
            if(err) winston.log('error', 'Could not update server clients, ip: %s', ip, {});
        });
        
        for(var i = 0; i < data.length; i++) {
            
            var client = data[i];
        
            clintMod.insertClient(serverModel._wave_id, serverModel._id, client.hash, client.location, client.networkServices, printResult);
        }
        
        return callback(null, data);
    });
};

/**
 * Extract the actors from a server
 * @author Miguelcldn
 * @param   {object}   serverModel Server object
 * @param   {string}   ip          IP of the server
 */
var extractServerActors = function(serverModel, ip, callback) {
    var printResult = function(err, data) {
        if(err) {
            winston.log('error', 'Could not save actors model. %j', err, {});
        }
    };
    
    doRequest(ip, 'actors', function(err, data) {
        if(err) return callback(err, null);
        
        for(var i = 0; i < data.length; i++) {
            
            var actor = data[i];
            
            actrMod.insertActor(serverModel._wave_id, serverModel._id, actor.hash, actor.type, actor.links, actor.location, actor.profile, printResult);
        }
        
        return callback(null, data);
    });
};

/**
 * Extracts data, clients and actors from a server
 * @author Miguelcldn
 * @param {string}   nodeIP   IP of the server
 */
var extractAllData = function(nodeIP, callback) {
    //Extract server data
    extractServerData(nodeIP, function(err, server) {
        if(err) {
            winston.log('error', 'Could not get the server data from %s', nodeIP);
            callback(err, null);
            return;
        }
        //Extract clients from server
        extractServerClients(server, nodeIP, function(err, client) {
            if(err) {
                winston.log('error', 'Could not get the server clients from %s', nodeIP);
            }
            //Extract actors from server
            extractServerActors(server, nodeIP, function(err, actor) {
                if(err) {
                    winston.log('error', 'Could not get the server actors from %s', nodeIP);
                }
                
                callback(null, server);
            });
        });
    });
};

/**
 * Saves a new wave of data
 * @author Miguelcldn
 */
exports.saveNetworkStatus = function(callback) {
    var seed = config.network.ip;
    var nodeList = [seed];
    var listLength = 1;
    
    var reportEnd = function(err, server) {
        listLength--;
        winston.log('info', 'Visited server %s with IP: %s', server.hash, server.lastIP);
        if(listLength === 0) return callback(null, seed);
    };
    
    doRequest(seed, 'catalog', function(err, resp) {
        if(err) return callback(err, null);
        
        var list = resp.nodes;
        
        for(var i in list) {
            var ip = list[i];
            nodeList.push(ip);
            listLength++;
        }
        
        for(i = 0; i < list.length; i++) {
            var nodeIP = list.shift();
            
            extractAllData(nodeIP, reportEnd);
        }
    });
};