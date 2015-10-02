var express = require('express');
var router = express.Router();
var repMod = require('../modules/repository');

/**
 * [description]
 *
 * @route
 * 
 */
router.put('/comps', function(req, res, next) {
    repMod.updComps(req, function(error, result) {
        if (error) res.status(200).send(error);
        else res.status(200).send(result);
    });
});

/**
 * [description]
 *
 * @route
 * 
 */
router.get('/comps', function(req, res, next) {
    repMod.getComps(req, function(error, result) {
        if (error) res.status(200).send(error);
        else res.status(200).send(result);
    });
});

/**
 * [description]
 *
 * @route
 * 
 */
router.post('/comps', function(req, res, next) {
    repMod.loadComps(req, function(error, result) {
        if (error) res.status(200).send(error);
        else res.status(200).send(result);
    });
});

/**
 * [description]
 *
 * @route
 * 
 */
router.post('/devs', function(req, res, next) {
    repMod.updDevs(req, function(error, result) {
        if (error) res.status(200).send(error);
        else res.status(200).send(result);
    });
});

module.exports = router;