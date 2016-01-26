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
router.post('/usrs/:usr_id/suprlays', function (req, res, next) {
    'use strict';
    try {
        if (!security.isValidData(req.body.code) || !security.isValidData(req.body.name) || !security.isValidData(req.body.logo) || !security.isValidData(req.body.deps) || !security.isValidData(req.body.order)) {
            res.status(412).send('missing or invalid data');
        } else {
            repMod.addSuprLay(req, function (error, result) {
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
router.get('/usrs/:usr_id/suprlays', function (req, res, next) {
    'use strict';
    try {
        repMod.listSuprLays(req, function (error, result) {
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
router.get('/usrs/:usr_id/suprlays/:sprly_id', function (req, res, next) {
    'use strict';
    try {
        repMod.getSprlay(req, function (error, result) {
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
router.put('/usrs/:usr_id/suprlays/:sprly_id', function (req, res, next) {
    'use strict';
    try {
        repMod.uptSprlay(req, function (error, result) {
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
router.delete('/usrs/:usr_id/suprlays/:sprly_id', function (req, res, next) {
    'use strict';
    try {
        repMod.delSprlay(req, function (error, result) {
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
// suprlay router export
module.exports = router;