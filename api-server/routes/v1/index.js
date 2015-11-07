/*global require*/
var express = require('express');
var router = express.Router();

// split up route handling
var repo = require('./repo');
// etc.

// list route namespaces
router.use('/repo', repo);
// etc.

module.exports = router;