var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');
var winston = require('winston');
var markdownpdf = require("markdown-pdf");
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

exports.generateBookPdf = function(callback){

    var book = path.join(process.cwd(), 'cache', env, 'fermat', 'fermat-book', 'fermat-book.asciidoc');
    var fermatBookLarge = path.join(process.cwd(), 'cache', env, 'files', 'fermat-book-large.pdf');
    var fermatBook = path.join(process.cwd(), 'cache', env, 'files', 'fermat-book-large.pdf');


    exec('asciidoctor-pdf -a pdf-style=book -a allow-uri-read -d book -o '+fermatBookLarge+' '+book,function(error, stdout, stderr) {
        if(error)  return callback('Error proccesing book big', null);  

        exec('asciidoctor-pdf -a allow-uri-read -d book -o '+fermatBook+' '+book,function(err, std, std) {
            if(err)  return callback('Error proccesing book', null);

            return callback(null, true);

        });
        
    });
}

/**
 * [getBookPdf description]
 *
 * @method getBookPdf
 *
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.getBookPdf = function (style, callback) {
    'use strict';
    try {
        var cacheFile = path.join(process.cwd(), 'cache', env, 'files', 'fermat-book.pdf');
        if (style) {
            cacheFile = path.join(process.cwd(), 'cache', env, 'files', 'fermat-book-large.pdf');
        }
        var resp = { pdfFile: cacheFile  };
         
        return callback(null, resp);
        
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
exports.getReadmePdf = function (style, callback) {
    'use strict';
    try {
        var readme = path.join(process.cwd(), 'cache', env, 'fermat', 'README.md');
        var cacheFile = path.join(process.cwd(), 'cache', env, 'files', 'readme.pdf');
        var name = 'readme.pdf';
        var resp = { pdfFile: cacheFile };
        var css = 'style.css';
        if (style) {
            cacheFile = path.join(process.cwd(), 'cache', env, 'files', 'readme-large.pdf');
            name = 'readme-large.pdf';
            css = 'style-large.css';
        }
        winston.log('info', 'reading file ', readme);

        fs.stat(cacheFile, function(err, stats){
            var diff;
            if (stats) {
                var thisTime = new Date();
                diff = (thisTime.getTime() - stats.ctime.getTime())/(1000*60*60);
            }
            else{
                diff = 999;
            }
            
            if(diff>12){
                markdownpdf({ cssPath:'./assets/styles/'+css }).from(readme).to(cacheFile, function () {
                    console.log("Done");
                    
                    return callback(null, resp);
                });
            }
            else{
                return callback(null, resp);
            }
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
exports.getPaperPdf = function (style, callback) {
    'use strict';
    try {
        var paper = path.join(process.cwd(), 'cache', env, 'fermat', 'FERMAT-WHITE-PAPER.md');
        var cacheFile = path.join(process.cwd(), 'cache', env, 'files', 'fermat-white-paper.pdf');
        var name = 'fermat-white-paper.pdf';
        var css = 'style.css';
        if (style) {
            cacheFile = path.join(process.cwd(), 'cache', env, 'files', 'fermat-white-paper-large.pdf');
            name = 'fermat-white-paper-large.pdf';
            css = 'style-large.css';
        }
        winston.log('info', 'reading file ', paper);
        fs.stat(cacheFile, function(err, stats){
            var diff;
            if (stats) {
                var thisTime = new Date();
                diff = (thisTime.getTime() - stats.ctime.getTime())/(1000*60*60);
            }
            else{
                diff = 999;
            }
            if(diff>12){
                markdownpdf({ cssPath:'./assets/styles/'+css }).from(paper).to(cacheFile, function () {
                    console.log("Done");
                    return callback(null, resp);
                });
            }
            else{
                var resp = { pdfFile: cacheFile  };
                return callback(null, resp);
            }
        });
    } catch (err) {
        return callback(err, null);
    }
};