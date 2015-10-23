var fs = require('fs');
var path = require('path');
var winston = require('winston');


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
        var book = path.join(process.cwd(), 'fermat', 'fermat-documentation', 'documentation.html');
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
        var readme = path.join(process.cwd(), 'fermat', 'README.md');
        winston.log('info', 'reading file ', readme);
        var readmeStr = fs.readFileSync(readme);
        return callback(null, readmeStr);
    } catch (err) {
        return callback(err, null);
    }
};