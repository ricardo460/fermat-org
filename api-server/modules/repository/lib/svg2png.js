var pn = require('pn/fs');
var svg2png = require('svg2png');
var fs = require('pn/fs');
/**
 * [svgToPng description]
 * @param  {[type]}   url_svg  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.svgToPng = function(path, filename, callback) {
	try {
		pn.readFile(path)
			.then(svg2png)
			.then(buffer => fs.writeFile("./uploads/"+filename+".png", buffer))
			.catch(e => console.error(e));
			return callback(null, "Conversion completed successfully");
	} catch (err) {
		console.log("Error: " + err);
		return callback(err, null);
	}
};