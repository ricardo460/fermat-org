/*global require*/
var express = require('express');
var router = express.Router();

// split up route handling
var repo = require('./repo');
var users = require('./users');
// etc.

// list route namespaces
router.use('/repo', repo);
router.use('/users', users);
// etc.

module.exports = router;