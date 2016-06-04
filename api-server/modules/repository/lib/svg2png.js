/* global echo */
/* global exec */
/* global echo */
/* global cd */
/* global test */
/* global which */
require('shelljs/global');
var path = require('path');
/**
 * [svgToPng description]
 * @param  {[type]}   url_svg  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
var svgToPng = function(type, filename, dpi, callback) {
	var cwd = process.cwd();
	var dir = path.join(cwd, 'uploads');
	try {
		//console.log('dir', dir);
		//console.log('fileName', filename.split('.'));
		filename = filename.split('.')[0];
		if (test('-d', dir)) {
			cd(dir);
			if (exec('inkscape -e ' + filename + '.png -d ' + dpi + ' ' + filename + '.svg').code !== 0) {
				echo('Error: You can not perform the conversion');
				//res.status(402).send("You can not perform the conversion");
			} else return callback(null, "Conversion completed successfully");
			//else res.status(200).send("ok");
		}
	} catch (err) {
		console.log("Error: " + err);
		return callback(err, null);
	}
};

exports.pushFtp = function(type, filename, dpi, callback) {
	var dpiGroup = [720, 90, 45, 22];
	try {

	} catch (err) {
		console.log("Error: " + err);
		return callback(err, null);
	}
};