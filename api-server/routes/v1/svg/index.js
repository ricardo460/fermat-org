var svg2png = require("../../../modules/repository/lib/svg2png");
var express = require('express');
var router = express.Router();
var multer = require('multer');
var security = require('../../../lib/utils/security');
var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './uploads');
	},
	filename: function(req, file, callback) {
		callback(null, file.fieldname + '-' + Date.now() + '.svg');
	}
});
var upload = multer({
	storage: storage
}).single('svg');
/**
 * @api {post} /v1/svg/upload/:type upload svg file
 * @apiName Upload
 * @apiVersion 1.0.0
 * @apiGroup SVG
 * @apiParam {String} type Image type (header, group).
 * @apiDescription Converts svg to png file and uploads it to the server via ftp.
 */
router.post('/upload/:type', function(req, res, next) {
	try {
		//console.log(req);
		if (!security.isValidData(req.params.type)) {
			res.status(412).send({
				"message": "missing or invalid data"
			});
		} else {
			console.log("execute route /upload");
			upload(req, res, function(err) {
				if (err) {
					return res.end(err + ": Error uploading file.");
				}
				var fileName = req.file.filename;
				console.log("fileName", fileName);
				svg2png.svgToPng(req.body.type, fileName, function(err, resp) {
					if (err) res.status(402).send("You can not perform the conversion");
					if (resp) res.status(200).send(resp);
				});
			});
		}
	} catch (err) {
		console.error("Error", err);
		res.status(402).send("You can not perform the conversion");
	}
});
// router export
module.exports = router;