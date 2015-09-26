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

var processCompList = function(compList, type) {
    //try {
    var comps = [];
    for (var i = 0; i < compList.length; i++) {
        var comp = {};
        comp = processComp(compList[i], type);
        comps.push(comp);
        //console.log(JSON.stringify(compList[i], null, 4));
    }
    //console.log(JSON.stringify(comps, null, 4));
    return comps;
    //} catch (err) {
    //}
};

var processComp = function(comp, type) {
    //try {
    var component = comp['$'];
    return component;
    //} catch (err) {
    //console.log(JSON.stringify(err, null, 4));
    //}
};

exports.loadComps = function(callback) {
    try {
        getManifest(function(err_man, res_man) {
            if (err_man) console.dir(err_man);
            else {
                var fermat = {};
                var platfrms = [];
                var _platfrms = res_man.fermat.platforms[0].platform;
                for (var i = 0; i < _platfrms.length; i++) {
                    var platfrm = {};
                    platfrm = _platfrms[i]['$'];
                    var layers = [];
                    var _layers = _platfrms[i].layer;
                    for (var j = 0; j < _layers.length; j++) {
                        var layer = {};
                        layer = _layers[j]['$'];
                        var comps = [];
                        if (_layers[j].plugins) {
                            comps = comps.concat(processCompList(_layers[j].plugins[0].plugin, 'plugin'));
                        }
                        if (_layers[j].androids) {
                            comps = comps.concat(processCompList(_layers[j].androids[0].android, 'android'));
                        }
                        if (_layers[j].addons) {
                            comps = comps.concat(processCompList(_layers[j].addons[0].addon, 'addon'));
                        }
                        if (_layers[j].libraries) {
                            comps = comps.concat(processCompList(_layers[j].libraries[0].library, 'library'));
                        }
                        layer.comps = comps;
                        layers.push(layer);
                    }
                    platfrm.layers = layers;
                    var depends = [];
                    if (_platfrms[i].dependencies) {
                        var _depends = _platfrms[i].dependencies[0].dependency;
                        for (var j = 0; j < _depends.length; j++) {
                            var depend = {};
                            depend = _depends[j]['$'];
                            depends.push(depend);
                        }
                    }
                    platfrm.depends = depends;
                    platfrms.push(platfrm);
                }
                fermat.platfrms = platfrms;
                var suprlays = [];
                var _suprlays = res_man.fermat.platforms[0].platform;
                for (var i = 0; i < _suprlays.length; i++) {
                    var suprlay = {};
                    suprlay = _suprlays[i]['$'];
                    var layers = [];
                    var _layers = _suprlays[i].layer;
                    for (var j = 0; j < _layers.length; j++) {
                        var layer = {};
                        layer = _layers[j]['$'];
                        var comps = [];
                        if (_layers[j].plugins) {
                            comps = comps.concat(processCompList(_layers[j].plugins[0].plugin, 'plugin'));
                        }
                        if (_layers[j].androids) {
                            comps = comps.concat(processCompList(_layers[j].androids[0].android, 'android'));
                        }
                        if (_layers[j].addons) {
                            comps = comps.concat(processCompList(_layers[j].addons[0].addon, 'addon'));
                        }
                        if (_layers[j].libraries) {
                            comps = comps.concat(processCompList(_layers[j].libraries[0].library, 'library'));
                        }
                        layer.comps = comps;
                        layers.push(layer);
                    }
                    suprlay.layers = layers;
                    suprlays.push(suprlay);
                }
                fermat.suprlays = suprlays;
                callback(null, fermat);
            }
        });
    } catch (err) {
        callback(err, null);
    }
};

var getRepoDir = function(item) {
    var _root = "fermat",
        _group = item.group ? item.group.toUpperCase().split(' ').join('_') : null,
        _type = item.type ? item.type.toLowerCase().split(' ').join('_') : null,
        _layer = item.layer ? item.layer.toLowerCase().split(' ').join('_') : null,
        _name = item.name ? item.name.toLowerCase().split(' ').join('-') : null;
    if (_group && _type && _layer && _name) {
        return _group + "/" + _type + "/" + _layer + "/" +
            _root + "-" + _group.split('_').join('-').toLowerCase() + "-" + _type.split('_').join('-') + "-" + _layer.split('_').join('-') + "-" + _name + "-bitdubai";
    } else {
        return null;
    }
};

var getManifest = function(callback) {
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