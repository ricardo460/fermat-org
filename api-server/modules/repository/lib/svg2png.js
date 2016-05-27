const pn = require("pn");
const svg2png = require("svg2png");
var fs = require('pn/fs');
/**
 * [svgToPng description]
 * @param  {[type]}   url_svg  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.svgToPng = function(svg_file, callback) {
	try {
		pn.readFile(svg_file)
			.then(svg2png)
			.then(buffer => fs.writeFile("dest.png", buffer))
			.catch(e => console.error(e));
	} catch (err) {
		console.log("Error: " + err);
		return callback(err, null);
	}
};