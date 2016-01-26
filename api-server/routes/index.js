/*global require*/
var express = require('express');
var router = express.Router();
var v1 = require('./v1');
//
router.use('/v1', v1);
/* GET home page. */
router.get('/', function (req, res, next) {
	'use strict';
	res.render('index', {
		title: 'Express'
	});
});
/*global module*/
module.exports = router;