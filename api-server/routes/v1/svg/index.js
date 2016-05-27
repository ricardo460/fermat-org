var svg2png = require("../../../modules/repository/lib/svg2png");
var express = require('express');
var router = express.Router();
var security = require('../../../lib/utils/security');
router.post('/convert', function(req, resp, next) {
    try {
        if (!security.isValidPerm(req.body.perm)) {
            resp.status(412).send({
                "message": "missing or invalid data"
            });
        } else {
            
        }
    } catch (err) {
        console.error("Error", err);
    }
});
/**