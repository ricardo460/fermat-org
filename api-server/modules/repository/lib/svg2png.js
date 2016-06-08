/* global echo */
/* global exec */
/* global echo */
/* global cd */
/* global test */
/* global which */
require('shelljs/global');
var path = require('path');
var JSFtp = require("jsftp");
var fs = require("fs");
var filesToSend = [];
var cwd = process.cwd();
var dir = path.join(cwd, 'uploads');
var ftpBitdubai = new JSFtp({
	host: "bitdubai.com",
	port: 21, // defaults to 21 
	user: "navi@bitdubai.com", // defaults to "anonymous" 
	pass: "Dfg15bLP%4L4" // defaults to "@anonymous" 
});
var ftpFermat = new JSFtp({
	host: "fermat.org",
	port: 21, // defaults to 21 
	user: "navi@fermat.org", // defaults to "anonymous" 
	pass: "Dfg15bLP%4L4" // defaults to "@anonymous" 
});
/**
 * [convert description]
 * @param  {[type]} filename [description]
 * @param  {[type]} dpi      [description]
 * @param  {[type]} dir      [description]
 * @return {[type]}          [description]
 */
var convert = function(path_png, name_svg, dpi, dir) {
	console.log('test', test('-d', dir));
	if (test('-d', dir)) {
		cd(dir);
		console.log('path_png', path_png);
		console.log('name_svg', name_svg);
		if (exec('inkscape -e ' + path_png + ' -d ' + dpi + ' ' + name_svg + '.svg').code !== 0) {
			echo('Error: You can not perform the conversion');
			throw new Error('You can not perform the conversion');
			//res.status(402).send("You can not perform the conversion");
		} else return "Conversion completed successfully";
		//else res.status(200).send("ok");
	}
};
/**
 * [createDir description]
 * @param  {[type]} path [description]
 * @return {[type]}      [description]
 */
var createDir = function(path_, qt_img) {
	console.log('path ', path_);
	try {
		fs.accessSync(path_, fs.F_OK);
		console.log('return path ', '/' + qt_img);
		return '/' + qt_img;
	} catch (e) {
		try {
			console.log('creating dir ');
			fs.mkdirSync(path_);
			console.log('dir created return path ', '/' + qt_img);
			return '/' + qt_img;
		} catch (e) {
			console.error('Error', e);
			if (e.code !== 'EEXIST') throw e;
		}
	}
};
/**
 * [svgToPng description]
 * @param  {[type]}   url_svg  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
var svgToPng = function(type, filename, callback) {
	var qtGroupAndType = [{
		quality: 'high',
		dpi: 720
	}, {
		quality: 'medium',
		dpi: 90
	}, {
		quality: 'small',
		dpi: 45
	}, {
		quality: 'mini',
		dpi: 22
	}];
	var qtHeader = [{
		quality: 'high',
		dpi: 360
	}, {
		quality: 'medium',
		dpi: 90
	}, {
		quality: 'small',
		dpi: 45
	}];
	var filePng = "",
		pathF = "",
		pathV = "";
	var i = 0;
	try {
		console.log('type', type);
		filesToSend.push(dir + '/' + filename);
		filename = filename.split('.')[0];
		if (type === 'group' || type === 'type') {
			for (i = 0; i < qtGroupAndType.length; i++) {
				filePng = filename + ".png";
				console.log('dirF', dir);
				pathF = path.join(dir, qtGroupAndType[i].quality);
				console.log('pathF', pathF);
				pathV = createDir(pathF, qtGroupAndType[i].quality);
				filesToSend.push(pathF + '/' + filePng);
				convert('.' + pathV + '/' + filePng, filename, qtGroupAndType[i].dpi, dir);
			}
		} else {
			for (i = 0; i < qtHeader.length; i++) {
				filePng = filename + ".png";
				pathF = path.join(dir, qtHeader[i].quality);
				pathV = createDir(pathF, qtHeader[i].quality);
				filesToSend.push(pathF + '/' + filePng);
				convert('.' + pathV + '/' + filePng, filename, qtHeader[i].dpi, dir);
			}
		}
		return callback(null, 'Conversion completed successfully');
	} catch (err) {
		console.log("Error: " + err);
		return callback(err, null);
	}
};

exports.pushFtp = function(type, filename, callback) {
	try {
		svgToPng(type, filename, function(err, res) {
			if (err) return callback(err, null);
			if (res) {
				console.log('filesToSend', filesToSend);
				for (var i = 0; i < filesToSend.length; i++) {
					ftpBitdubai.put(filesToSend[i], 'path/to/remote/file.txt',
						function(hadError) {
							if (!hadError)
								console.log("File transferred successfully!");
							else {
								console.log("Error transferring file");
								return callback(hadError, null);
							}
						});
				}
				return callback(null, 'Files transferred successfully!');
			}

		});
	} catch (err) {
		console.log("Error: " + err);
		return callback(err, null);
	}
};