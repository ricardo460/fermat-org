var fs = require('fs');
var path = require('path');
var winston = require('winston');
var cvToPdf = require('cv2pdf');
var pdf = require('html-pdf');
var env = process.env.NODE_ENV || 'development';

/**
 * [getBook description]
 *
 * @method getBook
 *
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.getBook = function (callback) {
    'use strict';
    try {
        var book = path.join(process.cwd(), 'cache', env, 'fermat', 'fermat-documentation', 'documentation.html');
        winston.log('info', 'reading file ', book);
        var bookStr = fs.readFileSync(book);
        return callback(null, bookStr);
    } catch (err) {
        return callback(err, null);
    }
};

/**
 * [getReadme description]
 *
 * @method getReadme
 *
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.getReadme = function (callback) {
    'use strict';
    try {
        var readme = path.join(process.cwd(), 'cache', env, 'fermat', 'README.md');
        winston.log('info', 'reading file ', readme); 
        var readmeStr = fs.readFileSync(readme);     
    } catch (err) {
        return callback(err, null);
    }
};

/**
 * [getBookPdf description]
 *
 * @method getBookPdf
 *
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.getBookPdf = function (callback) {
    'use strict';
    try {
        var book = path.join(process.cwd(), 'cache', env, 'fermat', 'fermat-documentation', 'documentation.html');
        winston.log('info', 'reading file ', book);
        var html = fs.readFileSync(book, 'utf8');        
        pdf.create(html,{ timeout: 90000} ).toFile('./cache/'+env+'/files/book.pdf', function(err, res) {
          if (err) return callback(err, null);
          console.log('en el success');
          var resp = { pdfFile:res.filename  };
          return callback(null, resp);
          
        });
    } catch (err) {
        return callback(err, null);
    }
};

/**
 * [getReadmePdf description]
 *
 * @method getReadmePdf
 *
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.getReadmePdf = function (callback) {
    'use strict';
    try {
        var readme = path.join(process.cwd(), 'cache', env, 'fermat', 'README.md');
        winston.log('info', 'reading file ', readme);
        var cv2pdf = new cvToPdf(readme, {out: './cache/'+env+'/files/readme.pdf'});
        cv2pdf.convert(function () {
          return callback(null, cv2pdf);
        });
    } catch (err) {
        return callback(err, null);
    }
};

/**
 * [getPaperPdf description]
 *
 * @method getPaperPdf
 *
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.getPaperPdf = function (callback) {
    'use strict';
    try {
        var paper = path.join(process.cwd(), 'cache', env, 'fermat', 'FERMAT-WHITE-PAPER.md');
        winston.log('info', 'reading file ', paper);
        var cv2pdf = new cvToPdf(paper, {out: './cache/'+env+'/files/fermat-white-paper.pdf'});
        cv2pdf.convert(function () {
          return callback(null, cv2pdf);
        });
    } catch (err) {
        return callback(err, null);
    }
};