var lockSrv = require('./services/layer');
var LockMdl = require('./models/layer');
/**
 * [insOrUpdLock description]
 *
 * @method insOrUpdLock
 *
 * @param  {[type]}     _usr_id   [description]
 * @param  {[type]}     _item_id  [description]
 * @param  {[type]}     item_type [description]
 * @param  {[type]}     priority  [description]
 * @param  {Function}   callback  [description]
 *
 * @return {[type]}     [description]
 */
exports.insOrUpdLock = function (_usr_id, _item_id, item_type, priority, callback) {};
/**
 * [delLock description]
 *
 * @method delLock
 *
 * @param  {[type]}   _usr_id  [description]
 * @param  {[type]}   _item_id [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.delLock = function (_usr_id, _item_id, callback) {};