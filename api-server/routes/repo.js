var express = require('express');
var router = express.Router();
var repMod = require('../modules/repository');

/* GET comps listing. */
router.get('/comps', function(req, res, next) {
    repMod.getComps(req, function(error, result) {
        if (error) res.send(200, error);
        else res.send(200, result);
    });
});

module.exports = router;