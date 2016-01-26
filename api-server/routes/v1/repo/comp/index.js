var express = require('express');
var router = express.Router();
var repMod = require('../../../../modules/repository');
var security = require('../../../../lib/utils/security');
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.post('/usrs/:usr_id/comps', function (req, res, next) {
    'use strict';
    try {
        if (!security.isValidData(req.body.platfrm_id) || !security.isValidData(req.body.suprlay_id) || !security.isValidData(req.body.layer_id) || !security.isValidData(req.body.name) || !security.isValidData(req.body.type) || !security.isValidData(req.body.description) || !security.isValidData(req.body.difficulty) || !security.isValidData(req.body.code_level) || !security.isValidData(req.body.repo_dir) || !security.isValidData(req.body.scrnshts) || !security.isValidData(req.body.found)) {
            res.status(412).send('missing or invalid data');
        } else {
            repMod.addComp(req, function (error, result) {
                if (error) {
                    res.status(200).send(error);
                } else {
                    res.status(200).send(result);
                }
            });
        }
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.get('/usrs/:usr_id/simple-comps', function (req, res, next) {
    'use strict';
    try {
        repMod.listComps(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.post('/usrs/:usr_id/comps/:comp_id/life-cicles', function (req, res, next) {
    'use strict';
    try {
        repMod.addLifeCiclesToComp(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.post('/usrs/:usr_id/comps/:comp_id/comp-devs', function (req, res, next) {
    'use strict';
    try {
        if (!security.isValidData(req.body.comp_id) || !security.isValidData(req.body.dev_id) || !security.isValidData(req.body.role) || !security.isValidData(req.body.scope) || !security.isValidData(req.body.percnt)) {
            res.status(412).send('missing or invalid data');
        } else {
            repMod.addCompDev(req, function (error, result) {
                if (error) {
                    res.status(200).send(error);
                } else {
                    res.status(200).send(result);
                }
            });
        }
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.get('/usrs/:usr_id/comps/:comp_id', function (req, res, next) {
    'use strict';
    try {
        repMod.getComp(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                if (result) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({
                        message: "NOT FOUND"
                    });
                }
            }
        });
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.put('/usrs/:usr_id/comps/:comp_id', function (req, res, next) {
    'use strict';
    try {
        repMod.uptComp(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.delete('/usrs/:usr_id/comps/:comp_id', function (req, res, next) {
    'use strict';
    try {
        repMod.delComp(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});
// comp router export
module.exports = router;