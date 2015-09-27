var request = require('request');
var parseString = require('xml2js').parseString;

var USER_AGENT = 'Miguelcldn';
//var USER_AGENT = 'MALOTeam'
//var USER_AGENT = 'fuelusumar'
var TOKEN = '3c12e4c95821c7c2602a47ae46faf8a0ddab4962'; // Miguelcldn    
//var TOKEN = 'fb6c27928d83f8ea6a9565e0f008cceffee83af1'; // MALOTeam
//var TOKEN = '2086bf3c7edd8a1c9937794eeaa1144f29f82558'; // fuelusumar

var processCompList = function(section, layer, compList, type) {
    var comps = [];
    for (var i = 0; i < compList.length; i++) {
        var comp = {};
        comp = processComp(section, layer, compList[i], type);
        comps.push(comp);
    }
    return comps;
};

var processComp = function(section, layer, comp, type) {
    var proComp = {};
    proComp = comp['$'];
    proComp.type = type;
    proComp.repo_dir = getRepoDir(section.code, layer.name, type, proComp.name, 'bitdubai');
    var devs = [];
    var _authors = comp.authors[0].author ? comp.authors[0].author : [];
    var _mantainers = comp.mantainers[0].mantainer ? comp.mantainers[0].mantainer : [];
    for (var i = 0; i < _authors.length; i++) {
        var dev = {};
        dev = _authors[i]['$'];
        dev.role = 'author';
        devs.push(dev);
    }
    for (var i = 0; i < _mantainers.length; i++) {
        var dev = {};
        dev = _mantainers[i]['$'];
        dev.role = 'mantainer';
        devs.push(dev);
    }
    proComp.devs = devs;
    return proComp;
};

var getRepoDir = function(section, layer, type, comp, team) {
    var _root = "fermat",
        _section = section ? section.toUpperCase().split(' ').join('_') : null,
        _type = type ? type.toLowerCase().split(' ').join('_') : null,
        _layer = layer ? layer.toLowerCase().split(' ').join('_') : null,
        _comp = comp ? comp.toLowerCase().split(' ').join('-') : null;
    _team = team ? team.toLowerCase().split(' ').join('-') : null;
    if (_section && _type && _layer && _comp && _team) {
        return _section + "/" + _type + "/" + _layer + "/" +
            _root + "-" + _section.split('_').join('-').toLowerCase() + "-" + _type.split('_').join('-') + "-" + _layer.split('_').join('-') + "-" + _comp + "-" + _team;
    } else {
        return null;
    }
};

var doRequest = function(method, url, params, callback) {
    try {
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
    } catch (err) {
        callback(err, null);
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
};

var getManifest = function(callback) {
    try {
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
    } catch (err) {
        callback(err, null);
    }
};

var parseManifest = function(callback) {
    try {
        getManifest(function(err_man, res_man) {
            if (err_man) callback(err_man, null);
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
                            comps = comps.concat(processCompList(platfrm, layer, _layers[j].plugins[0].plugin, 'plugin'));
                        }
                        if (_layers[j].androids) {
                            comps = comps.concat(processCompList(platfrm, layer, _layers[j].androids[0].android, 'android'));
                        }
                        if (_layers[j].addons) {
                            comps = comps.concat(processCompList(platfrm, layer, _layers[j].addons[0].addon, 'addon'));
                        }
                        if (_layers[j].libraries) {
                            comps = comps.concat(processCompList(platfrm, layer, _layers[j].libraries[0].library, 'library'));
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
                var _suprlays = res_man.fermat.super_layers[0].super_layer;
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
                            comps = comps.concat(processCompList(suprlay, layer, _layers[j].plugins[0].plugin, 'plugin'));
                        }
                        if (_layers[j].androids) {
                            comps = comps.concat(processCompList(suprlay, layer, _layers[j].androids[0].android, 'android'));
                        }
                        if (_layers[j].addons) {
                            comps = comps.concat(processCompList(suprlay, layer, _layers[j].addons[0].addon, 'addon'));
                        }
                        if (_layers[j].libraries) {
                            comps = comps.concat(processCompList(suprlay, layer, _layers[j].libraries[0].library, 'library'));
                        }
                        layer.comps = comps;
                        layers.push(layer);
                    }
                    suprlay.layers = layers;
                    var depends = [];
                    if (_suprlays[i].dependencies) {
                        var _depends = _suprlays[i].dependencies[0].dependency;
                        for (var j = 0; j < _depends.length; j++) {
                            var depend = {};
                            depend = _depends[j]['$'];
                            depends.push(depend);
                        }
                    }
                    suprlay.depends = depends;
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

exports.loadComps = function(callback) {
    parseManifest(function(err_par, res_par) {
        if (err_par) callback(err_par, null);
        else {
            //if ()
            callback(null, res_par);
        }
    });
}