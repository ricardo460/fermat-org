var request = require('request');

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
                    'Accept': '*/*'
                }
            }, function(err, httpResponse, body) {
            	console.dir(err);
            	console.dir(httpResponse);
            	console.dir(body);
            });
            break;
        case 'GET':
            request.get({
                url: url,
                headers: {
                    'User-Agent': USER_AGENT,
                    'Accept': '*/*'
                }
            }, function(err, httpResponse, body) {
            	console.dir(err);
            	console.dir(httpResponse);
            	console.dir(body);
            });
            break;
    }
};

doRequest('GET', 'https://api.github.com/repos/bitDubai/fermat/contents/FermatManifest.xml', null, function(){});