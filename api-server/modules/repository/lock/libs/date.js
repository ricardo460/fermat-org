var validator = require('validator');
/**
 * [isValidData description]
 *
 * @method isValidData
 *
 * @param  {[type]}    data [description]
 *
 * @return {Boolean}   [description]
 */
function isValidData(data) {
    if (typeof data == 'undefined' || data === null || data === '' || data === "" || data.length === 0) {
        return false;
    } else return true;
}
/**
 * [isObjectID description]
 *
 * @method isObjectID
 *
 * @param  {[type]}   _obj_id [description]
 *
 * @return {Boolean}  [description]
 */
function isObjectID(_obj_id) {
    var str = _obj_id + '';
    if (isValidData(str)) {
        str = str + '';
        if (validator.isAlphanumeric(str)) {
            var len = str.length;
            valid = false;
            if (len == 12 || len == 24) {
                valid = /^[0-9a-fA-F]+$/.test(str);
            }
            return valid;
        } else {
            return false;
        }
    } else {
        return false;
    }
}
/**
 * [getObjIdToMilis description]
 *
 * @method getObjIdToMilis
 *
 * @param  {[type]}        _obj_id [description]
 *
 * @return {[type]}        [description]
 */
function getObjIdToMilis(_obj_id) {};
/**
 * [isDiffGr description]
 *
 * @method isDiffGr
 *
 * @param  {[type]} _obj_id [description]
 * @param  {[type]} diff    [description]
 *
 * @return {Boolean} [description]
 */
exports.isDiffGr = function (_obj_id, diff) {};