/* global echo */
/* global exec */
/* global echo */
/* global cd */
/* global test */
/* global which */
require('shelljs/global');
var winston = require('winston');
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
	if (test('-d', dir)) {
		cd(dir);
		if (exec('inkscape -e ' + path_png + ' -d ' + dpi + ' ' + name_svg + '.svg').code !== 0) {
			echo('Error: You can not perform the conversion');
			throw new Error('You can not perform the conversion');
		} else return "Conversion completed successfully";
	}
};
/**
 * [createDir description]
 * @param  {[type]} path [description]
 * @return {[type]}      [description]
 */
var createDir = function(path_, qt_img) {
	try {
		fs.accessSync(path_, fs.F_OK);
		return '/' + qt_img;
	} catch (e) {
		try {
			fs.mkdirSync(path_);
			return '/' + qt_img;
		} catch (e) {
			console.error('Error', e);
			winston.log('error', e.message, e);
			if (e.code !== 'EEXIST') throw e;
		}
	}
};
var converSvg = function(filePng, filename, descImg) {
	var pathF = "",
		pathV = "";
	pathF = path.join(dir, descImg.quality);
	pathV = createDir(pathF, descImg.quality);
	descImg.from = pathF + '/' + filePng;
	filesToSend.push(descImg);
	convert('.' + pathV + '/' + filePng, filename, descImg.dpi, dir);
};
/**
 * [svgToPng description]
 * @param  {[type]}   url_svg  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
var svgToPng = function(type, filename, callback) {
	var descImgGroup = [{
		from: '',
		to: '/navi/clair/images/tiles/icons/group/high/',
		quality: 'high',
		dpi: 720
	}, {
		from: '',
		to: '/navi/clair/images/tiles/icons/group/medium/',
		quality: 'medium',
		dpi: 90
	}, {
		from: '',
		to: '/navi/clair/images/tiles/icons/group/small/',
		quality: 'small',
		dpi: 45
	}, {
		from: '',
		to: '/navi/clair/images/tiles/icons/group/mini/',
		quality: 'mini',
		dpi: 22
	}];
	var descImgType = [{
		from: '',
		to: '/navi/clair/images/tiles/icons/type/high/',
		quality: 'high',
		dpi: 720
	}, {
		from: '',
		to: '/navi/clair/images/tiles/icons/type/medium/',
		quality: 'medium',
		dpi: 90
	}, {
		from: '',
		to: '/navi/clair/images/tiles/icons/type/small/',
		quality: 'small',
		dpi: 45
	}, {
		from: '',
		to: '/navi/clair/images/tiles/icons/type/mini/',
		quality: 'mini',
		dpi: 22
	}];
	var descImgHeader = [{
		from: '',
		to: '/navi/clair/images/headers/high/',
		quality: 'high',
		dpi: 360
	}, {
		from: '',
		to: '/navi/clair/images/headers/medium/',
		quality: 'medium',
		dpi: 90
	}, {
		from: '',
		to: '/navi/clair/images/headers/small/',
		quality: 'small',
		dpi: 45
	}];
	var filePng = "";
	var i = 0;
	var descSvgOri = {};
	try {
		filename = filename.split('.')[0];
		var fromSvg = dir + '/' + filename + '.svg';
		if (type === 'group') {
			descSvgOri.from = fromSvg;
			descSvgOri.to = '/navi/clair/images/tiles/icons/group/svg/' + filename + '.svg';
			filesToSend.push(descSvgOri);
			for (i = 0; i < descImgGroup.length; i++) {
				filePng = filename + ".png";
				descImgGroup[i].to = descImgGroup[i].to + filePng;
				converSvg(filePng, filename, descImgGroup[i]);
			}
		} else if (type === 'type') {
			descSvgOri.from = fromSvg;
			descSvgOri.to = '/navi/clair/images/tiles/icons/type/svg/' + filename + '.svg';
			filesToSend.push(descSvgOri);
			for (i = 0; i < descImgType.length; i++) {
				filePng = filename + ".png";
				descImgType[i].to = descImgType[i].to + filePng;
				converSvg(filePng, filename, descImgType[i]);
			}
		} else if (type === 'header') {
			descSvgOri.from = fromSvg;
			descSvgOri.to = '/navi/clair/images/headers/svg/' + filename + '.svg';
			filesToSend.push(descSvgOri);
			for (i = 0; i < descImgHeader.length; i++) {
				filePng = filename + ".png";
				descImgHeader[i].to = descImgHeader[i].to + filePng;
				converSvg(filePng, filename, descImgHeader[i]);
			}
		}
		return callback(null, 'Conversion completed successfully');
	} catch (err) {
		console.log("Error: " + err);
		winston.log('error', err.message, err);
		return callback(err, null);
	}
};
var dleteDir = function(paths) {
	try {
		for (var i = 0; i < paths.length; i++) 
			fs.unlinkSync(paths[i].from);
	} catch (e) {
		console.error('Error could not delete the file', e);
		winston.log('Error could not delete the file', e.message, e);
		throw e;
	}
};
exports.pushFtp = function(type, filename, callback) {
	try {
		filesToSend = [];
		svgToPng(type, filename, function(err, res) {
			if (err) return callback(err, null);
			if (res) {
				var loopSendFiles = function(i) {
					if (i < filesToSend.length) {
						ftpBitdubai.put(filesToSend[i].from, filesToSend[i].to,
							function(hadError) {
								if (!hadError) {
									console.log("File transferred successfully!");
									console.log(filesToSend[i].from);
									loopSendFiles(++i);
								} else {
									console.log(hadError + ": Error transferring file");
									winston.log('error', hadError.message, hadError);
									dleteDir(filesToSend);
									console.log(filesToSend[i].from);
									return callback(hadError, null);
								}
							});
					} else {
						console.log("Files transferred successfully!");
						dleteDir(filesToSend);
						return callback(null, 'Files transferred successfully!');
					}
				};
				return loopSendFiles(0);
			}
		});
	} catch (err) {
		dleteDir(filesToSend);
		console.log("Error: " + err);
		winston.log('error', err.message, err);
		return callback(err, null);
	}
};