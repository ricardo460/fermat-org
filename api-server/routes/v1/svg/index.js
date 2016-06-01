var svg2png = require("../../../modules/repository/lib/svg2png");
var express = require('express');
var router = express.Router();
var multer = require('multer');
var security = require('../../../lib/utils/security');
var path = require('path');
var fileSystem = require('pn/fs');
var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './uploads');
	},
	filename: function(req, file, callback) {
		callback(null, file.fieldname + '-' + Date.now());
	}
});
var upload = multer({
	storage: storage
}).single('svg');
/**
 * [description]
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @return {[type]}     [description]
 */
router.post('/convert', function(req, res, next) {
	try {
		console.log("execute route /convert");
		upload(req, res, function(err) {
			if (err) {
				return res.end(err + ": Error uploading file.");
			}
			//res.end("File is uploaded");
			//console.log("File");
			//console.log(req.file);
			var fileName = req.file.filename;
			svg2png.svgToPng(req.file.path, fileName, function(err, resp) {
				if (err) {
					console.log(err + ": You can not perform the conversion");
					res.status(402).send("You can not perform the conversion");
				}
				if (resp) {
					console.log(resp);
					var filePath = path.join(__dirname, fileName + ".png");
					console.log('filePath', filePath);
					var stat = fileSystem.statSync(filePath);

					res.writeHead(200, {
						'Content-Type': 'image/png',
						'Content-Length': stat.size
					});

					var readStream = fileSystem.createReadStream(filePath);
					// We replaced all the event handlers with a simple call to readStream.pipe()
					readStream.pipe(res);
					//res.sendFile('uploads/' + fileName + ".png");
					//res.status(200).send("ok");
				}
			});
		});
	} catch (err) {
		console.error("Error", err);
		res.status(402).send("You can not perform the conversion");
	}
});
// router export
module.exports = router;