/*jshint -W069 */
var winston = require('winston');
var request = require('request');
var parseString = require('xml2js').parseString;
var platfrmMod = require('../platform');
var suprlayMod = require('../superlayer');
var layerMod = require('../layer');
var compMod = require('../component');
var procMod = require('../process');
var devMod = require('../developer');

//var db = require('../../../db');

//var USER_AGENT = 'Miguelcldn';
//var USER_AGENT = 'MALOTeam'
var USER_AGENT = 'fuelusumar';
//var TOKEN = '3c12e4c95821c7c2602a47ae46faf8a0ddab4962'; // Miguelcldn    
//var TOKEN = 'fb6c27928d83f8ea6a9565e0f008cceffee83af1'; // MALOTeam
var TOKEN = '2086bf3c7edd8a1c9937794eeaa1144f29f82558'; // fuelusumar

/**
 * [getRepoDir description]
 *
 * @method getRepoDir
 *
 * @param  {[type]}   section [description]
 * @param  {[type]}   layer   [description]
 * @param  {[type]}   type    [description]
 * @param  {[type]}   comp    [description]
 * @param  {[type]}   team    [description]
 *
 * @return {[type]}   [description]
 */
var getRepoDir = function (section, layer, type, comp, team) {
    'use strict';
    var _root = "fermat",
        _section = section ? section.toUpperCase().split(' ').join('_') : null,
        _type = type ? type.toLowerCase().split(' ').join('_') : null,
        _layer = layer ? layer.toLowerCase().split(' ').join('_') : null,
        _comp = comp ? comp.toLowerCase().split(' ').join('-') : null,
        _team = team ? team.toLowerCase().split(' ').join('-') : null;
    if (_section && _type && _layer && _comp && _team) {
        return _section + "/" + _type + "/" + _layer + "/" +
            _root + "-" + _section.split('_').join('-').toLowerCase() + "-" + _type.split('_').join('-') + "-" + _layer.split('_').join('-') + "-" + _comp + "-" + _team;
    }
    return null;

};

/**
 * [processComp description]
 *
 * @method processComp
 *
 * @param  {[type]}    section [description]
 * @param  {[type]}    layer   [description]
 * @param  {[type]}    comp    [description]
 * @param  {[type]}    type    [description]
 *
 * @return {[type]}    [description]
 */
var processComp = function (section, layer, comp, type) {
    'use strict';
    var i, dev, status, devs, _authors, _mantainers, _life_cycle, life_cycle, proComp;
    proComp = {};
    proComp = comp['$'];
    proComp.type = type;
    proComp.repo_dir = getRepoDir(section.code, layer.name, type, proComp.name, 'bitdubai');
    devs = [];
    _authors = comp.authors && comp.authors[0] && comp.authors[0].author ? comp.authors[0].author : [];
    _mantainers = comp.mantainers && comp.mantainers[0] && comp.mantainers[0].mantainer ? comp.mantainers[0].mantainer : [];
    _life_cycle = comp.life_cycle && comp.life_cycle[0] && comp.life_cycle[0].status ? comp.life_cycle[0].status : [];
    for (i = 0; i < _authors.length; i++) {
        dev = {};
        dev = _authors[i]['$'];
        dev.role = 'author';
        devs.push(dev);
    }
    for (i = 0; i < _mantainers.length; i++) {
        dev = {};
        dev = _mantainers[i]['$'];
        dev.role = 'mantainer';
        devs.push(dev);
    }
    proComp.devs = devs;
    life_cycle = [];
    for (i = 0; i < _life_cycle.length; i++) {
        status = {};
        status = _life_cycle[i]['$'];
        life_cycle.push(status);
    }
    proComp.life_cycle = life_cycle;
    return proComp;
};

/**
 * [processCompList description]
 *
 * @method processCompList
 *
 * @param  {[type]}        section  [description]
 * @param  {[type]}        layer    [description]
 * @param  {[type]}        compList [description]
 * @param  {[type]}        type     [description]
 *
 * @return {[type]}        [description]
 */
var processCompList = function (section, layer, compList, type) {
    'use strict';
    var comps, comp, i;
    comps = [];
    for (i = 0; i < compList.length; i++) {
        comp = {};
        comp = processComp(section, layer, compList[i], type);
        comps.push(comp);
    }
    return comps;
};



/**
 * [doRequest description]
 *
 * @method doRequest
 *
 * @param  {[type]}   method   [description]
 * @param  {[type]}   url      [description]
 * @param  {[type]}   params   [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
var doRequest = function (method, url, params, callback) {
    'use strict';
    try {
        var form, i;
        url += '?access_token=' + TOKEN;
        switch (method) {
        case 'POST':
            form = {};
            if (params && Array.isArray(params) && params.length > 0) {
                for (i = params.length - 1; i >= 0; i--) {
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
            }, function (err, res, body) {
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
            }, function (err, res, body) {
                callback(err, body);
            });
            break;
        }
    } catch (err) {
        callback(err, null);
    }
};

/**
 * [processRequestBody description]
 *
 * @method processRequestBody
 *
 * @param  {[type]}           body     [description]
 * @param  {Function}         callback [description]
 *
 * @return {[type]}           [description]
 */
var processRequestBody = function (body, callback) {
    'use strict';
    try {
        var reqBody = JSON.parse(body);
        if (reqBody.content && reqBody.encoding) {
            var content = new Buffer(reqBody.content, reqBody.encoding);
            var strCont = content.toString().split('\n').join(' ').split('\t').join(' ');
            callback(null, strCont);
        } else if (reqBody.login || reqBody.message || Array.isArray(reqBody)) {
            callback(null, reqBody);
        } else {
            callback(new Error('body without any content'), null);
        }
    } catch (err) {
        callback(err, null);
    }
};

/**
 * [getManifest description]
 *
 * @method getManifest
 *
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
var getManifest = function (callback) {
    'use strict';
    try {
        doRequest('GET', 'https://api.github.com/repos/bitDubai/fermat/contents/FermatManifest.xml', null, function (err_req, res_req) {
            if (err_req) {
                callback(err_req, null);
            } else {
                processRequestBody(res_req, function (err_pro, res_pro) {
                    if (err_pro) {
                        callback(err_pro, null);
                    } else {
                        parseString(res_pro, function (err_par, res_par) {
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

/**
 * [parseManifest description]
 *
 * @method parseManifest
 *
 * @param  {Function}    callback [description]
 *
 * @return {[type]}      [description]
 */
var parseManifest = function (callback) {
    'use strict';
    try {
        var i, j, k, layers, _layers, layer, comps, depends, _depends, depend, steps, _steps, fermat, platfrms, _platfrms, platfrm, suprlays, _suprlays, suprlay, procs, _procs, _proc, _step, _next;
        getManifest(function (err_man, res_man) {
            if (err_man) {
                return callback(err_man, null);
            }
            fermat = {};
            platfrms = [];
            _platfrms = res_man.fermat.platforms[0].platform;
            for (i = 0; i < _platfrms.length; i++) {
                platfrm = {};
                platfrm = _platfrms[i]['$'];
                layers = [];
                _layers = _platfrms[i].layer;
                for (j = 0; j < _layers.length; j++) {
                    layer = {};
                    layer = _layers[j]['$'];
                    comps = [];
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
                depends = [];
                if (_platfrms[i].dependencies) {
                    _depends = _platfrms[i].dependencies[0].dependency;
                    for (j = 0; j < _depends.length; j++) {
                        depend = {};
                        depend = _depends[j]['$'];
                        depends.push(depend);
                    }
                }
                platfrm.depends = depends;
                platfrms.push(platfrm);
            }
            fermat.platfrms = platfrms;
            suprlays = [];
            _suprlays = res_man.fermat.super_layers[0].super_layer;
            for (i = 0; i < _suprlays.length; i++) {
                suprlay = {};
                suprlay = _suprlays[i]['$'];
                layers = [];
                _layers = _suprlays[i].layer;
                for (j = 0; j < _layers.length; j++) {
                    layer = {};
                    layer = _layers[j]['$'];
                    comps = [];
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
                depends = [];
                if (_suprlays[i].dependencies) {
                    _depends = _suprlays[i].dependencies[0].dependency;
                    for (j = 0; j < _depends.length; j++) {
                        depend = {};
                        depend = _depends[j]['$'];
                        depends.push(depend);
                    }
                }
                suprlay.depends = depends;
                suprlays.push(suprlay);
            }
            fermat.suprlays = suprlays;
            procs = [];
            _procs = res_man.fermat.processes[0].process;
            for (i = 0; i < _procs.length; i++) {
                _proc = _procs[i]['$'];
                steps = [];
                _steps = _procs[i].steps[0].step;
                for (j = 0; j < _steps.length; j++) {
                    _step = _steps[j]['$'];
                    _step.next = [];
                    if (_steps[j].next) {
                        _next = _steps[j].next[0].step;
                        if (_next) {
                            for (k = 0; k < _next.length; k++) {
                                _step.next.push(_next[k]['$']);
                            }
                        }
                    }
                    steps.push(_step);
                }
                _proc.steps = steps;
                procs.push(_proc);
            }
            fermat.procs = procs;
            callback(null, fermat);

        });
    } catch (err) {
        callback(err, null);
    }
};

/**
 * [saveManifest description]
 *
 * @method saveManifest
 *
 * @param  {Function}   callback [description]
 *
 * @return {[type]}     [description]
 */
var saveManifest = function (callback) {
    'use strict';
    try {
        parseManifest(function (err_load, res_load) {
            if (err_load) {
                winston.log('info', err_load.message, err_load);
            } else {
                if (res_load.platfrms && Array.isArray(res_load.platfrms) && res_load.suprlays && Array.isArray(res_load.suprlays)) {
                    var _platfrms = res_load.platfrms;
                    var _suprlays = res_load.suprlays;
                    var _procs = res_load.procs;

                    var loopProcs = function (s) {
                        if (s < _procs.length) {
                            var _proc = _procs[s];
                            //platfrm, name, desc, prev, next, callback
                            procMod.insOrUpdProc(_proc.platform ? _proc.platform.trim().toUpperCase() : null,
                                _proc.name ? _proc.name.trim().toLowerCase() : null,
                                _proc.description ? _proc.description.trim().toLowerCase() : null,
                                _proc.previous ? _proc.previous.trim().toLowerCase() : null,
                                _proc.next ? _proc.next.trim().toLowerCase() : null,
                                function (err_proc, res_proc) {
                                    if (err_proc) {
                                        winston.log('info', err_proc.message, err_proc);
                                        loopProcs(++s);
                                    } else {
                                        var _steps = _proc.steps;
                                        var loopSteps = function (t) {
                                            if (t < _steps.length) {
                                                var _step = _steps[t];
                                                procMod.insOrUpdStep(res_proc._id, //_proc_id
                                                    _step.platform ? _step.platform.toUpperCase() : null, //platfrm_code
                                                    _step.superlayer ? _step.superlayer.toUpperCase() : null, //suprlay_code
                                                    _step.layer ? _step.layer.toLowerCase() : null, //layer_name
                                                    _step.name ? _step.name.toLowerCase() : null, //comp_name
                                                    _step.type ? _step.type.toLowerCase() : null, //type
                                                    _step.title ? _step.title.toLowerCase() : null, //title
                                                    _step.description ? _step.description.toLowerCase() : null, //description
                                                    _step.id || null, //order
                                                    _step.next || [], //next
                                                    function (err_stp, res_stp) {
                                                        if (err_stp) {
                                                            winston.log('info', err_stp.message, err_stp);
                                                            loopSteps(++t);
                                                        } else {
                                                            loopSteps(++t);
                                                        }
                                                    });
                                            } else {
                                                loopProcs(++s);
                                            }
                                        };
                                        loopSteps(0);
                                    }
                                });
                        } else {
                            winston.log('info', 'done loading components');
                            return;
                        }
                    };

                    var loopSuprlays = function (n) {
                        if (n < _suprlays.length) {
                            var _suprlay = _suprlays[n];
                            suprlayMod.insOrUpdSuprlay(_suprlay.code.trim().toUpperCase(),
                                _suprlay.name.trim().toLowerCase(),
                                _suprlay.logo,
                                _suprlay.dependsOn ? _suprlay.dependsOn.split(' ').join('').split(',') : [],
                                0,
                                function (err_supr, res_supr) {
                                    if (err_supr) {
                                        winston.log('info', err_supr.message, err_supr);
                                        loopSuprlays(++n);
                                    } else {
                                        var _layers = _suprlay.layers;

                                        var loopLayers = function (o) {
                                            if (o < _layers.length) {
                                                var _layer = _layers[o];
                                                layerMod.insOrUpdLayer(_layer.name ? _layer.name.trim().toLowerCase() : null,
                                                    _layer.language ? _layer.language.toLowerCase() : null,
                                                    res_supr.code,
                                                    0,
                                                    function (err_lay, res_lay) {
                                                        if (err_lay) {
                                                            winston.log('info', err_lay.message, err_lay);
                                                            loopLayers(++o);
                                                        } else if (res_lay) {
                                                            var _comps = _layer.comps;

                                                            var loopComps = function (p) {
                                                                if (p < _comps.length) {
                                                                    var _comp = _comps[p];
                                                                    compMod.insOrUpdComp(null,
                                                                        res_supr._id,
                                                                        res_lay._id,
                                                                        _comp.name.trim().toLowerCase(),
                                                                        _comp.type.trim().toLowerCase(),
                                                                        _comp.description.trim().toLowerCase(),
                                                                        _comp.difficulty,
                                                                        _comp['code-level'].trim().toLowerCase(),
                                                                        _comp.repo_dir,
                                                                        null,
                                                                        function (err_comp, res_comp) {
                                                                            if (err_comp) {
                                                                                winston.log('info', err_comp.message, err_comp);
                                                                                loopComps(++p);
                                                                            } else {
                                                                                var _devs = _comp.devs;

                                                                                var loopDevs = function (q) {
                                                                                    if (q < _devs.length) {
                                                                                        var _dev = _devs[q];
                                                                                        if (_dev.name) {
                                                                                            devMod.insOrUpdDev(_dev.name.trim().toLowerCase(), null, null, null, null, null, null, null, function (err_dev, res_dev) {
                                                                                                if (err_dev) {
                                                                                                    winston.log('info', err_dev.message, err_dev);
                                                                                                    winston.log('info', err_dev.message, _dev);
                                                                                                    loopDevs(++q);
                                                                                                } else {
                                                                                                    compMod.insOrUpdCompDev(res_comp._id, res_dev._id, _dev.role, _dev.scope, _dev.percentage || '0', function (err_compDev, res_compDev) {
                                                                                                        if (err_compDev) {
                                                                                                            winston.log('info', err_compDev.message, err_compDev);
                                                                                                            loopDevs(++q);
                                                                                                        } else {
                                                                                                            var _life_cycle = _comp.life_cycle;

                                                                                                            var loopLifeCycle = function (r) {
                                                                                                                if (r < _life_cycle.length) {
                                                                                                                    var _status = _life_cycle[r];
                                                                                                                    compMod.insOrUpdStatus(res_comp._id, _status.name, _status.target, _status.reached, function (err_sta, res_sta) {
                                                                                                                        if (err_sta) {
                                                                                                                            winston.log('info', err_sta.message, err_sta);
                                                                                                                            loopLifeCycle(++r);
                                                                                                                        } else {
                                                                                                                            loopLifeCycle(++r);
                                                                                                                        }
                                                                                                                    });
                                                                                                                } else {
                                                                                                                    loopDevs(++q);
                                                                                                                }
                                                                                                            };
                                                                                                            loopLifeCycle(0);
                                                                                                        }
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        } else {
                                                                                            loopDevs(++q);
                                                                                        }

                                                                                    } else {
                                                                                        loopComps(++p);
                                                                                    }
                                                                                };
                                                                                loopDevs(0);
                                                                            }
                                                                        });
                                                                } else {
                                                                    loopLayers(++o);
                                                                }
                                                            };
                                                            loopComps(0);
                                                        } else {
                                                            loopLayers(++o);
                                                        }
                                                    });
                                            } else {
                                                loopSuprlays(++n);
                                            }
                                        };
                                        loopLayers(0);
                                    }
                                });
                        } else {
                            return loopProcs(0);
                        }
                    };

                    var loopPlatfrms = function (i) {
                        if (i < _platfrms.length) {
                            var _platfrm = _platfrms[i];
                            platfrmMod.insOrUpdPlatfrm(_platfrm.code.trim().toUpperCase(),
                                _platfrm.name.trim().toLowerCase(),
                                _platfrm.logo,
                                _platfrm.dependsOn ? _platfrm.dependsOn.split(' ').join('').split(',') : [],
                                0,
                                function (err_plat, res_plat) {
                                    if (err_plat) {
                                        winston.log('info', err_plat.message, err_plat);
                                        loopPlatfrms(++i);
                                    } else {
                                        var _layers = _platfrm.layers;

                                        var loopLayers = function (j) {
                                            if (j < _layers.length) {
                                                var _layer = _layers[j];
                                                layerMod.insOrUpdLayer(_layer.name ? _layer.name.trim().toLowerCase() : null,
                                                    _layer.language ? _layer.language.toLowerCase() : null,
                                                    null,
                                                    0,
                                                    function (err_lay, res_lay) {
                                                        if (err_lay) {
                                                            winston.log('info', err_lay.message, err_lay);
                                                            loopLayers(++j);
                                                        } else if (res_lay) {
                                                            var _comps = _layer.comps;

                                                            var loopComps = function (k) {
                                                                if (k < _comps.length) {
                                                                    var _comp = _comps[k];
                                                                    compMod.insOrUpdComp(res_plat._id,
                                                                        null,
                                                                        res_lay._id,
                                                                        _comp.name.trim().toLowerCase(),
                                                                        _comp.type.trim().toLowerCase(),
                                                                        _comp.description.trim().toLowerCase(),
                                                                        _comp.difficulty,
                                                                        _comp['code-level'].trim().toLowerCase(),
                                                                        _comp.repo_dir,
                                                                        null,
                                                                        function (err_comp, res_comp) {
                                                                            if (err_comp) {
                                                                                winston.log('info', err_comp.message, err_comp);
                                                                                loopComps(++k);
                                                                            } else {
                                                                                var _devs = _comp.devs;
                                                                                var upd_devs = [];
                                                                                var upd_life_cycle = [];

                                                                                var loopDevs = function (l) {
                                                                                    if (l < _devs.length) {
                                                                                        var _dev = _devs[l];
                                                                                        if (_dev.name) {
                                                                                            devMod.insOrUpdDev(_dev.name.trim().toLowerCase(), null, null, null, null, null, null, null, function (err_dev, res_dev) {
                                                                                                if (err_dev) {
                                                                                                    winston.log('info', err_dev.message, err_dev);
                                                                                                    winston.log('info', err_dev.message, _dev);
                                                                                                    loopDevs(++l);
                                                                                                } else {
                                                                                                    compMod.insOrUpdCompDev(res_comp._id, res_dev._id, _dev.role, _dev.scope, _dev.percentage || '0', function (err_compDev, res_compDev) {
                                                                                                        if (err_compDev) {
                                                                                                            winston.log('info', err_compDev.message, err_compDev);
                                                                                                            loopDevs(++l);
                                                                                                        } else {
                                                                                                            upd_devs.push(res_compDev._id);
                                                                                                            loopDevs(++l);
                                                                                                        }
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        } else {
                                                                                            loopDevs(++l);
                                                                                        }
                                                                                    } else {
                                                                                        var _life_cycle = _comp.life_cycle;

                                                                                        var loopLifeCycle = function (m) {
                                                                                            if (m < _life_cycle.length) {
                                                                                                var _status = _life_cycle[m];
                                                                                                compMod.insOrUpdStatus(res_comp._id, _status.name, _status.target, _status.reached, function (err_sta, res_sta) {
                                                                                                    if (err_sta) {
                                                                                                        winston.log('info', err_sta.message, err_sta);
                                                                                                        loopLifeCycle(++m);
                                                                                                    } else {
                                                                                                        upd_life_cycle.push(res_sta._id);
                                                                                                        loopLifeCycle(++m);
                                                                                                    }
                                                                                                });
                                                                                            } else {
                                                                                                compMod.updCompDevAndLifCyc(res_comp._id, upd_devs, upd_life_cycle, function (err_upd, res_upd) {
                                                                                                    if (err_upd) {
                                                                                                        loopComps(++k);
                                                                                                    } else {
                                                                                                        loopComps(++k);
                                                                                                    }

                                                                                                });
                                                                                            }
                                                                                        };
                                                                                        loopLifeCycle(0);
                                                                                    }
                                                                                };
                                                                                loopDevs(0);
                                                                            }
                                                                        });
                                                                } else {
                                                                    loopLayers(++j);
                                                                }
                                                            };
                                                            loopComps(0);
                                                        } else {
                                                            loopLayers(++j);
                                                        }
                                                    });
                                            } else {
                                                loopPlatfrms(++i);
                                            }
                                        };
                                        loopLayers(0);
                                    }
                                });
                        } else {
                            return loopSuprlays(0);
                        }
                    };

                    callback(null, {
                        'save': true
                    });
                    return loopPlatfrms(0);
                }
                return callback(null, {
                    'save': false
                });
            }
        });
    } catch (err) {
        return callback(err, null);
    }
};

/**
 * [getUser description]
 *
 * @method getUser
 *
 * @param  {[type]}   usrnm    [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
var getUser = function (usrnm, callback) {
    'use strict';
    try {
        doRequest('GET', 'https://api.github.com/users/' + usrnm, null, function (err_req, res_req) {
            if (err_req) {
                return callback(err_req, null);
            }
            processRequestBody(res_req, function (err_pro, res_pro) {
                if (err_pro) {
                    return callback(err_pro, null);
                }
                return callback(null, res_pro);

            });
        });
    } catch (err) {
        return callback(err, null);
    }
};

/**
 * [updateDevs description]
 *
 * @method updateDevs
 *
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
var updateDevs = function (callback) {
    'use strict';
    devMod.getDevs(function (err_devs, res_devs) {
        if (err_devs) {
            return callback(err_devs, null);
        }
        if (res_devs && Array.isArray(res_devs)) {
            callback(null, {
                'update': true
            });

            var loopDevs = function (i) {
                if (i < res_devs.length) {
                    var _dev = res_devs[i];
                    getUser(_dev.usrnm, function (err_usr, res_usr) {
                        if (err_usr) {
                            winston.log('info', err_usr.message, err_usr);
                            loopDevs(++i);
                        } else if (res_usr) {
                            devMod.insOrUpdDev(_dev.usrnm,
                                res_usr.email || null,
                                res_usr.name || null,
                                null,
                                res_usr.location || null,
                                res_usr.avatar_url || null,
                                res_usr.html_url || null,
                                res_usr.bio || null,
                                function (err_upd, res_upd) {
                                    if (err_upd) {
                                        winston.log('info', err_upd.message, err_upd);
                                    }
                                });
                        }
                    });
                    loopDevs(++i);
                } else {
                    winston.log('info', 'done loading users');
                    return;
                }
            };
            return loopDevs(0);
        }
        return callback(new Error('no developers to iterate'), null);
    });
};

/**
 * [getContent description]
 *
 * @method getContent
 *
 * @param  {[type]}   repo_dir [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
var getContent = function (repo_dir, callback) {
    'use strict';
    try {
        doRequest('GET', 'https://api.github.com/repos/bitDubai/fermat/contents/' + repo_dir, null, function (err_req, res_req) {
            if (err_req) {
                callback(err_req, null);
            } else {
                processRequestBody(res_req, function (err_pro, res_pro) {
                    if (err_pro) {
                        callback(err_pro, null);
                    } else {
                        callback(null, res_pro);
                    }
                });
            }
        });
    } catch (err) {
        callback(err, null);
    }
};

/**
 * [updateComps description]
 *
 * @method updateComps
 *
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
var updateComps = function (callback) {
    'use strict';
    compMod.findComps(function (err_comps, res_comps) {
        if (err_comps) {
            return callback(err_comps, null);
        }
        if (res_comps && Array.isArray(res_comps)) {
            callback(null, {
                'update': true
            });

            var loopComps = function (i) {
                if (i < res_comps.length) {
                    var _comp = res_comps[i];
                    if (_comp.code_level !== 'concept') {
                        getContent(_comp.repo_dir, function (err_dir, res_dir) {
                            if (err_dir) {
                                winston.log('info', err_dir.message, err_dir);
                            } else {
                                if (res_dir && Array.isArray(res_dir)) {
                                    compMod.insOrUpdComp(_comp._platfrm_id, _comp._suprlay_id, _comp._layer_id, _comp.name, null, null, null, null, null, true,
                                        function (err_upd, res_upd) {
                                            if (err_upd) {
                                                winston.log('info', err_upd.message, err_upd);
                                            } else {
                                                winston.log('info', 'updating %s...', _comp._id + '...');
                                            }
                                        });
                                }
                            }
                        });
                    }
                    loopComps(++i);
                } else {
                    winston.log('info', 'done iterating components');
                    return;
                }
            };
            return loopComps(0);
        }
        return callback(new Error('no developers to iterate'), null);
    });
};

/**
 * [updComps description]
 *
 * @method updComps
 *
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.updComps = function (callback) {
    'use strict';
    updateComps(function (err, res) {
        if (err) {
            return callback(err, null);
        }
        if (res) {
            return callback(null, res);
        }
        return callback(null, null);
    });
};

/**
 * [updDevs description]
 *
 * @method updDevs
 *
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.updDevs = function (callback) {
    'use strict';
    updateDevs(function (err, res) {
        if (err) {
            return callback(err, null);
        }
        if (res) {
            return callback(null, res);
        }
        return callback(null, null);
    });
};

/**
 * [loadComps description]
 *
 * @method loadComps
 *
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.loadComps = function (callback) {
    'use strict';
    saveManifest(function (err, res) {
        if (err) {
            return callback(err, null);
        }
        if (res) {
            return callback(null, res);
        }
        return callback(null, null);
    });
};
/*jshint +W069 */