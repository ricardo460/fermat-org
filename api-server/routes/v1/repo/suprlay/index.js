var winston = require('winston');
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
var lock = function (req, res, next) {
    try {
        if (req.params.suprlay_id) {
            req.body.item_id = req.params.suprlay_id;
            req.body.item_type = 'suprlay';
            req.body.priority = 5;
            repMod.doLock(req, function (error, result) {
                if (error) {
                    res.status(200).send(error);
                } else {
                    next();
                }
            });
        } else {
            next();
        }
    } catch (err) {
        next(err);
    }
};
/**
 * [release description]
 *
 * @method release
 *
 * @param  {[type]} req [description]
 *
 * @return {[type]} [description]
 */
var release = function (req) {
    try {
        repMod.doRelease(req, function (error, result) {
            if (error) {
                winston.log('error', 'Error releasing suprlay lock', error);
            }
        });
    } catch (err) {
        winston.log('error', 'Error releasing suprlay lock', err);
    }
};
/**
 * using lock for suprlay routes
 */
router.use(lock);
/**
 * [release description]
 *
 * @method release
 *
 * @param  {[type]} req [description]
 *
 * @return {[type]} [description]
 */
router.post('/', function (req, res, next) {
    'use strict';
    try {
        if (!security.isValidData(req.body.code) || //
            !security.isValidData(req.body.name) || //
            !security.isValidData(req.body.logo) || //
            !security.isValidData(req.body.order)) {
            res.status(412).send('missing or invalid data');
        } else {
            repMod.addSuprLay(req, function (error, result) {
                if (error) {
                    res.status(200).send(error);
                } else {
                    res.status(201).send(result);
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
router.get('/', function (req, res, next) {
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
router.get('/:suprlay_id', function (req, res, next) {
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
router.put('/:suprlay_id', function (req, res, next) {
    'use strict';
    try {
           if (!security.isValidData(req.params.suprlay_id) || //
           	   !security.isValidData(req.body.code) || //
	           !security.isValidData(req.body.name) || //
	           !security.isValidData(req.body.logo) || //
	           !security.isValidData(req.body.order)) {
	           res.status(412).send({message: 'missing or invalid data'});
	        } else {
               repMod.uptSprlay(req, function (error, result) {
               if (error) {
                  res.status(200).send(error);
               } else {
                  res.status(200).send(result);
               }
                  release(req);
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
router.delete('/:suprlay_id', function (req, res, next) {
    'use strict';
    try {
        repMod.delSprlay(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                if (result) {
                    res.status(204).send();
                } else {
                    res.status(404).send({
                        message: "NOT FOUND"
                    });
                }
            }
            release(req);
        });
    } catch (err) {
        next(err);
    }
});
// suprlay router export
module.exports = router;
