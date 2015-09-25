var request = require('request');
var parseString = require('xml2js').parseString;

var USER_AGENT = 'Miguelcldn';
//var USER_AGENT = 'MALOTeam'
//var USER_AGENT = 'fuelusumar'
var TOKEN = '3c12e4c95821c7c2602a47ae46faf8a0ddab4962'; // Miguelcldn    
//var TOKEN = 'fb6c27928d83f8ea6a9565e0f008cceffee83af1'; // MALOTeam
//var TOKEN = '2086bf3c7edd8a1c9937794eeaa1144f29f82558'; // fuelusumar

var doRequest = function(method, url, params, callback) {
    url += '?access_token=' + TOKEN;
    switch (method) {
        case 'POST':
            var form = {};
            if (params && Array.isArray(params) && params.length > 0) {
                for (var i = params.length - 1; i >= 0; i--) {
                    form[params[i].key] = params[i].value;
                }
            }
            request.post({
                url: url,
                form: form,
                headers: {
                    'User-Agent': USER_AGENT,
                    'Accept': 'application/json'
                }
            }, function(err, res, body) {
                callback(err, body);
            });
            break;
        case 'GET':
            request.get({
                url: url,
                headers: {
                    'User-Agent': USER_AGENT,
                    'Accept': 'application/json'
                }
            }, function(err, res, body) {
                callback(err, body);
            });
            break;
    }
};

var processRequestBody = function(body, callback) {
    try {
        var reqBody = JSON.parse(body);
        if (reqBody.content && reqBody.encoding) {
            var content = new Buffer(reqBody.content, reqBody.encoding);
            var strCont = content.toString().split('\n').join(' ').split('\t').join(' ');
            callback(null, strCont);
        } else if (false) {

        } else {
            callback(new Error('body without any content'), null);
        }
    } catch (err) {
        callback(err, null);
    }
}

exports.getManifest = function(callback) {
    doRequest('GET', 'https://api.github.com/repos/bitDubai/fermat/contents/FermatManifest.xml', null, function(err_req, res_req) {
        if (err_req) {
            callback(err_req, null);
        } else {
            processRequestBody(res_req, function(err_pro, res_pro) {
                if (err_pro) {
                	callback(err_pro, null);
                } else {
                    parseString(res_pro, function(err_par, res_par) {
                    	if (err_par) {
                    		callback(err_par, null);
                    	} else {
                    		callback(null, res_par);
                    	}
                    });
                }
            });
        }
    });
}