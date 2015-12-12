/*jshint -W069 */
var linkSrv = require('./services/link');
var LinkMdl = require('./models/link');

/**
 * [insertLink description]
 *
 * @method insertLink
 *
 * @param  {[type]}   _wave_id          [description]
 * @param  {[type]}   _chld_nod_id      [description]
 * @param  {[type]}   _prnt_nod_id      [description]
 * @param  {[type]}   type              [description]
 * @param  {Function} callback          [description]
 *
 * @return {[type]}   [description]
 */
exports.insertLink = function (_wave_id, _chld_nod_id, _prnt_nod_id, type, callback) {
    'use strict';
    try {
        
        var link = new LinkMdl(_wave_id, _chld_nod_id, _prnt_nod_id, type);
        linkSrv.insertLink(link, function (err_ins, res_ins) {
            if (err_ins) {
                return callback(err_ins, null);
            }
            return callback(null, res_ins);
        });
    } catch (err) {
        return callback(err, null);
    }
};


/**
 * [findLinkById description]
 *
 * @method findLinkById
 *
 * @param  {[type]}         _id [description]
 * @param  {Function}       callback [description]
 *
 * @return {[type]}         [description]
 */
exports.findLinkById = function (_id, callback) {
    'use strict';
    try {
        linkSrv.findLinkById( 
            _id
        ,function (err, link) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, link);
        });
    } catch (err) {
        return callback(err, null);
    }
};

/*jshint +W069 */