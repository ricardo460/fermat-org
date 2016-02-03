/*global require*/
/*global module*/
var express = require('express');
var router = express.Router();
var netMod = require('../../../modules/network');
var Cache = require('../../../lib/route-cache');
// creation of object cache
var cache = new Cache({
    type: 'file',
    time: 36000000
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
router.get('/servrs', function (req, res, next) {
    'use strict';
    try {
        // we search for body in cache
        var body = cache.getBody(req);
        if (body) {
            // we send it
            res.status(200).send(body);
        } else {
            // we create it
            netMod.getServerNetwork(req, function (error, result) {
                if (error) {
                    res.status(200).send(error);
                } else {
                    if (result) {
                        cache.setBody(req, result);
                        res.status(200).send(result);
                    } else {
                        res.status(200).send({
                            message: "NO WAVE YET"
                        });
                    }
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
router.get('/nodes/:hash/childrn', function (req, res, next) {
    'use strict';
    try {
        // we search for body in cache
        var body = cache.getBody(req);
        if (body) {
            // we send it
            res.status(200).send(body);
        } else {
            // we create it
            netMod.getChildren(req, function (error, result) {
                if (error) {
                    res.status(200).send(error);
                } else {
                    // we save it
                    if (result) {
                        cache.setBody(req, result);
                        res.status(200).send(result);
                    } else {
                        res.status(404).send({
                            message: "NOT FOUND"
                        });
                    }
                }
            });
        }
    } catch (err) {
        next(err);
    }
});
// router export
module.exports = router;