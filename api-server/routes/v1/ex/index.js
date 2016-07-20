/*global require*/
/*global module*/
var config = require('../../../config');
var express = require('express');
var exRateMod = require('../../../modules/exrate')
var router = express.Router();
var security = require('../../../lib/utils/security');
var sha256 = require('../../../modules/auth/lib/sha256');

/**
 * @api {post} /v1/ex/ticker add process
 * @apiVersion 0.0.1
 * @apiName AddExRate
 * @apiGroup Ex
 * @apiParam {String} price The price in USD
 * @apiDescription Adds a new ex rate
 */
router.post('/ticker', function(req, res, next) {
    'use strict';
    try {
        // Check that all required data is present
        if (!security.isValidData(req.body.price) ||
            !security.isNumber(req.body.price) ||
            !security.isValidData(req.body.pass)) {

            res.status(412).send({
                "message": "missing or invalid data"
            });
        } else {
            // Check that the password match
            if (sha256.calc(req.body.pass) !== config.exrate.pass) {
                res.status(403).send({
                    "message": "invalid password"
                });
            } else {
                // Tries to create the ex rate
                exRateMod.insertExRate(req.body.price, function(err, exrate) {
                    if (err) {
                        res.status(500).send({
                            "message": err
                        });
                    }
                    res.status(200).send({
                        "message": "ex rate created succesfully"
                    })
                });
            }
        }
    } catch (err) {
        next(err);
    }
});

router.get('/ticker', function(req, res, next) {
    'use strict';
    try {
        exRateMod.findExRate(function(err, exrate) {
            if (err) {
                res.status(500).send({
                    "message": err
                });
            } else {
                res.status(200).send({
                    "FER_USD": {
                        "purchase": exrate.price,
                        "sale": 1 / (exrate.price),
                        "timestamp": Date.parse(exrate.timestamp)
                    }
                });
            }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
