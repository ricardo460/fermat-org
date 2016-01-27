/*global require*/
var express = require('express');
var router = express.Router();
// split up route handling
var repo = require('./repo');
var net = require('./net');
// etc.
// list route namespaces
router.use('/repo', repo);
router.use('/net', net);
// etc.
module.exports = router;