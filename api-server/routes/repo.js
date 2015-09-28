var express = require('express');
var router = express.Router();
var repMod = require('../modules/repository');

/* GET comps listing. */
router.get('/comps', function(req, res, next) {
    repMod.getComps(req, function(error, result) {
        if (error) res.status(200).send(error);
        else res.status(200).send(result);
    });
});

router.post('/comps', function(req, res, next) {
    repMod.loadComps(req, function(error, result) {
        if (error) res.status(200).send(error);
        else res.status(200).send(result);
    });
});

module.exports = router;