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
router.post('/usr/:usr_id/procs', function (req, res, next) {
    'use strict';
    try {
        if (!security.isValidData(req.body.platfrm) || !security.isValidData(req.body.name) || !security.isValidData(req.body.desc) || !security.isValidData(req.body.prev) || !security.isValidData(req.body.next)) {
            res.status(412).send('missing or invalid data');
        } else {
            repMod.addProc(req, function (error, result) {
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
router.get('/usr/:usr_id/simple-procs', function (req, res, next) {
    'use strict';
    try {
        repMod.listProcs(req, function (error, result) {
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
router.post('/usrs/:usr_id/procs/:proc_id/steps', function (req, res, next) {
    'use strict';
    try {
        if (!security.isValidData(req.body.proc_id) || !security.isValidData(req.body.platfrm_code) || !security.isValidData(req.body.suprlay_code) || !security.isValidData(req.body.layer_name) || !security.isValidData(req.body.comp_name) || !security.isValidData(req.body.type) || !security.isValidData(req.body.title) || !security.isValidData(req.body.desc) || !security.isValidData(req.body.order)) {
            res.status(412).send('missing or invalid data');
        } else {
            repMod.addStep(req, function (error, result) {
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
router.get('/usrs/:usr_id/procs/:proc_id', function (req, res, next) {
    'use strict';
    try {
        repMod.getProc(req, function (error, result) {
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
router.put('/usrs/:usr_id/procs/:proc_id', function (req, res, next) {
    'use strict';
    try {
        repMod.uptProc(req, function (error, result) {
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
router.delete('/usrs/:usr_id/procs/:proc_id', function (req, res, next) {
    'use strict';
    try {
        repMod.delProc(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(204)
            }
        });
    } catch (err) {
        next(err);
    }
});
// proc router export
module.exports = router;