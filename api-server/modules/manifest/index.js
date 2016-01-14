var compMod = require('../repository/component');
var procMod = require('../repository/process');
var layMod = require('../repository/layer');
var suprlayMod = require('../repository/superlayer');
var platfrmMod = require('../repository/platform');


/**
 * @method addProc
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.addProc = function (req, next) {
	'use strict';
    try {
        procMod.insOrUpdProc(req.body.platfrm, req.body.name, req.body.desc, req.body.prev, req.body.next, function (err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }
};

/**
 * @method getProc
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.getProc = function (req, next) {
	'use strict';
    try {
        procMod.findProcById(req.params.proc_id, function (err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }
}

/**
 * @method uptProc
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.uptProc = function (req, next) {

}

/**
 * @method delProc
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.delProc = function (req, next) {
	'use strict';
    try {
        procMod.delProcById(req.params.proc_id, function (err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }

}

/**
 * @method getComp
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.getComp = function (req, next) {
	'use strict';
    try {
        compMod.findCompById(req.params.comp_id, function (err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }
}

/**
 * @method uptComp
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.uptComp = function (req, next) {

}

/**
 * @method delComp
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.delComp = function (req, next) {

}

/**
 * @method getLay
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.getLay = function (req, next) {
	'use strict';
    try {
        layMod.findLayerById(req.params.lay_id, function (err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }

}

/**
 * @method uptLay
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.uptLay = function (req, next) {

}

/**
 * @method delLay
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.delLay = function (req, next) {

}

/**
 * @method getSprlay
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.getSprlay = function (req, next) {
	'use strict';
    try {
        suprlayMod.findSuprlayById(req.params.sprly_id, function (err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }

}

/**
 * @method uptSprlay
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.uptSprlay = function (req, next) {

}

/**
 * @method delSprlay
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.delSprlay = function (req, next) {

}

/**
 * @method getPltf
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.getPltf = function (req, next) {
	'use strict';
    try {
        platfrmMod.findPlatfrmById(req.params.pltf_id, function (err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }

}

/**
 * @method uptPltf
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.uptPltf = function (req, next) {

}

/**
 * @method delPltf
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.delPltf = function (req, next) {

}

/**
 * @method listProcs
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.listProcs = function (req, next) {
	'use strict';
    try {
        procMod.getAllProces(function (err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }
};

/**
 * @method addComp
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.addComp = function (req, next) {
	'use strict';
    try {
        compMod.insOrUpdComp(req.body.platfrm_id, req.body.suprlay_id, req.body.layer_id, req.body.name, req.body.type, req.body.description, req.body.difficulty, req.body.code_level, req.body.repo_dir, req.body.scrnshts, req.body.found, function (err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }
};

/**
 * @method listComps
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.listComps = function (req, next) {
	'use strict';
    try {
        compMod.getComps(function (err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }
};

/**
 * @method addLayer
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.addLayer = function (req, next) {
	'use strict';
    try {
        layMod.insOrUpdLayer(req.body.name, req.body.lang, req.body.suprlay, req.body.order, function (err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }

};

/**
 * @method listLayers
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.listLayers = function (req, next) {
	'use strict';
    try {
        layMod.getLayers(function (err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }
};

/**
 * @method addSuprLay
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.addSuprLay = function (req, next) {
	'use strict';
    try {
        suprlayMod.insOrUpdSuprlay(req.body.code, req.body.name, req.body.logo, req.body.deps, req.body.order, function (err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }
};

/**
 * @method listSuprLays
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.listSuprLays = function (req, next) {
	'use strict';
    try {
        suprlayMod.getSuprlays(function (err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }
};

/**
 * @method addPlatform
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.addPlatform = function (req, next) {
	'use strict';
    try {
        platfrmMod.insOrUpdPlatfrm(req.body.code, req.body.name, req.body.logo, req.body.deps, req.body.order, function (err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }
};

/**
 * Add one or several life cicle to component
 * @method addLifeCiclesToComp
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.addLifeCiclesToComp = function (req, next) {


};

/**
 * @method addCompDev
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.addCompDev = function (req, next) {
	'use strict';
    try {
        compMod.insOrUpdCompDev(req.body.comp_id, req.body.dev_id, req.body.role, req.body.scope, req.body.percnt, function (err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }
};

/**
 * @method addStep
 *
 * @param  {[type]}   req  [description]
 * @param  {Function} next [description]
 *
 * @return {[type]}   [description]
 */
exports.addStep = function (req, next) {
	'use strict';
    try {
        procMod.insOrUpdStep(req.body.proc_id, req.body.platfrm_code, req.body.suprlay_code, req.body.layer_name, req.body.comp_name, req.body.type, req.body.title, req.body.desc, req.body.order, next, function (err, res) {
            if (err) {
                next(err, null);
            } else {
                next(null, res);
            }
        });
    } catch (err) {
        next(err, null);
    }
};