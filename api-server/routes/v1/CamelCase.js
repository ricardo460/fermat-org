/**
 * Functions to validate
 *
 * @author german.mendoza.187@gmail.com <German Mendoza>
 * @author fuelusumar@gmail.com <Luis Fuenmayor>
 * @version 0.1
 *
 **/
var validator = require('validator'),
    crypto = require('crypto'),
    sanitizer = require('sanitizer'),
    config = require('../config.js'),
    apikeys = require('../apikeys');

exports.isValidRanking = function (ranking) {
    var valid = false;
    if (ranking == config.ranking.wilson) valid = true;
    else if (ranking == config.ranking.hack) valid = true;
    else if (ranking == config.ranking.reddit) valid = true;
    else if (ranking == config.ranking.random) valid = true;
    else if (ranking == config.ranking.controversy) valid = true;
    else if (ranking == config.ranking.fresh) valid = true;
    else if (ranking == config.ranking.distance) valid = true;
    //else  valid = false;
    return valid;
};

exports.isValidDate = function (date) {
    return isValidDate(date);
};

// yyyy-MM-dd'T'HH:mm:ss.SSSZ
function isValidDate(date) {
    var is_valid = false,
        regex = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
    is_valid = regex.test(date) && date.length >= 20;
    return is_valid;
}


/**
 * [isValidData description]
 * @param  {[type]}  data [description]
 * @return {Boolean}      [description]
 */
function isValidData(data) {
    if (typeof data == 'undefined' || data === null || data === '' || data === "" || data.length === 0 || data === "") {
        //console.log('invalid data');
        return 0;
    } else return 1;
}

function isValidCoordinate(lt, ln) {
    return (lt && ln && (lt + '' != '0' || ln + '' != '0') && (lt + '' != '0.0' || ln + '' != '0.0'));
}

exports.isValidCoordinate = function (lt, ln) {
    return isValidCoordinate(lt, ln);
};


/**
 * [isObjectID description]
 * @param  {[type]}  str [description]
 * @return {Boolean}     [description]
 */
function isObjectID(str) {
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
            //console.log('invalid objectID');
            return 0;
        }
    } else {
        //console.log('invalid objectID');
        return 0;
    }
}

/**
 * [isEmail description]
 * @param  {[type]}  email [description]
 * @return {Boolean}       [description]
 */
function isEmail(email) {
    if (isValidData(email)) {
        if (validator.isLength(email, 8, 64)) {
            if (validator.isEmail(email)) {
                return 1;
            }
        }
    }
    //console.log('invalid email');
    return 0;
}

/**
 * [isLengthPassword description]
 * @param  {[type]}  passwd [description]
 * @return {Boolean}        [description]
 */
function isLengthPassword(passwd) {
    if (isValidData(passwd)) {
        if (validator.isLength(passwd, 8, 16)) return 1;
    }
    //console.log('invalid password');
    return 0;
}

/**
 * [isAlphanumeric description]
 * @param  {[type]}  str [description]
 * @return {Boolean}     [description]
 */
exports.isAlphanumeric = function (str) {
    if (isValidData(str)) {
        if (validator.isAlphanumeric(str)) {
            return 1;
        } else {
            //console.log('invalid alphanumeric');
            return 0;
        }
    } else {
        //console.log('invalid alphanumeric');
        return 0;
    }
};

/**
 * [sanitizeArray description]
 * @param  {[type]} array [description]
 * @return {[type]}       [description]
 */
exports.sanitizeArray = function (array) {
    for (var key in array) {
        if (key != 'token' && key != 'contacts' && key != 'answers' && key != 'questions') {
            array[key] = sanitizer.sanitize(array[key]);
            array[key] = sanitizer.escape(array[key]);
        } else {
            //TODO: tratar token de ios
            array[key] = array[key];
        }
    }
    return array;
};

/**
 * [sanitizeItem description]
 * @param  {[type]} item [description]
 * @return {[type]}      [description]
 */
exports.sanitizeItem = function (item) {

    item = sanitizer.sanitize(item);
    item = sanitizer.escape(item);

    return item;
};

/**
 * [apiVersion description]
 * @param  {[type]} api_version [description]
 * @return {[type]}             [description]
 */
exports.apiVersion = function (api_version) {
    if (isValidData(api_version)) {
        if (api_version == "v3") return 1;
    } else {
        //console.log('invalid api_version');
        return 0;
    }
};

/**
 * [user description]
 * @param  {[type]} user [description]
 * @return {[type]}      [description]
 */
exports.user = function (user) {
    if (isValidData(user)) {
        if (!isEmail(user.email)) return 0;
        if (!isLengthPassword(user.password)) return 0;
        return 1;
    }
    return 0;
};

/**
 * [isValidData description]
 * @param  {[type]}  data [description]
 * @return {Boolean}      [description]
 */
exports.isValidData = function (data) {
    return isValidData(data);
};

/**
 * [isEmail description]
 * @param  {[type]}  email [description]
 * @return {Boolean}       [description]
 */
exports.isEmail = function (email) {
    return isEmail(email);
};

/**
 * [isUsername description]
 * @param  {[type]}  username [description]
 * @return {Boolean}          [description]
 */
exports.isUsername = function (username) {
    return isUsername(username);
};

function isUsername(username) {
    if (isValidData(username)) {
        if (validator.matches(username, /^[a-zA-Z][a-zA-Z0-9\._\-]{3,14}?[a-zA-Z0-9]{0,2}$/)) return 1;
        //return 1;
    }
    //console.log('invalid username');
    return 0;
}

/**
 * Check if an account is valid
 * @param  {[type]}  username [description]
 * @return {Boolean}          [description]
 */
exports.isValidAccount = function (account) {
    if (isUsername(account) || isEmail(account)) {
        return 1;
    }
    //console.log('invalid username');
    return 0;
};

/**
 * [isLengthPassword description]
 * @param  {[type]}  passwd [description]
 * @return {Boolean}        [description]
 */
exports.isLengthPassword = function (passwd) {
    return isLengthPassword(passwd);
};

/**
 * [encodingPass description]
 * @param  {[type]} pass  [description]
 * @param  {[type]} email [description]
 * @return {[type]}       [description]
 */
exports.encodingPass = function (pass) {
    var cipher = crypto.createCipher('aes-256-cbc', config.salt),
        crypted = cipher.update(pass, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
};

exports.encodePass = function (pass) {
    return crypto.createHash('sha256').update(pass).digest('hex');
};


/**
 * [decodingPass description]
 * @param  {[type]} pass [description]
 * @return {[type]}      [description]
 */
exports.decodingPass = function (pass) {
    var decipher = crypto.createDecipher('aes-256-cbc', config.salt),
        dec = decipher.update(pass, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};

exports.decodeWithApiKey = function (pass, apikey) {
    var decipher = crypto.createDecipher('aes-256-cbc', apikey),
        dec = decipher.update(pass, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};

exports.encodeWithApiKey = function (string, apikey) {
    var cipher = crypto.createCipher('aes-256-cbc', apikey),
        aux = string,
        crypted = cipher.update(aux, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
};


exports.isValidApiKeyId = function (apikey_id) {
    if (typeof apikeys[apikey_id] == "undefined") {
        //console.log('invalid apikey_id');
        return false;
    }

    return true;
};

/**
 * [isObjectID description]
 * @param  {[type]}  str [description]
 * @return {Boolean}     [description]
 */
exports.isObjectID = function (str) {
    return isObjectID(str);
};

/**
 * [isName description]
 * @param  {[type]}  name [description]
 * @return {Boolean}      [description]
 */
exports.isName = function (name) {
    if (isValidData(name)) {
        if (validator.isLength(name, 2)) return 1;
    }
    //console.log('invalid name');
    return 0;
};

/**
 * [isDescription description]
 * @param  {[type]}  description [description]
 * @return {Boolean}             [description]
 */
exports.isDescription = function (description) {
    if (isValidData(description)) {
        if (validator.isLength(description, 0, 400)) return 1;
    }
    //console.log('invalid description');
    return 0;
};

/**
 * [isLang description]
 * @param  {[type]}  lang [description]
 * @return {Boolean}      [description]
 */
exports.isLang = function (lang) {
    if (isValidData(lang)) {
        if (validator.isLength(lang, 2, 5)) return 1;
        //if (lang.length == 2) return 1;
    }
    console.log('invalid lang');
    return 0;
};

/**
 * NOT TESTED
 */
exports.isChatId = function (chat_id) {
    if (validator.isAlphanumeric(chat_id)) {
        return 1;
    }
    return 0;
};

exports.isIdArray = function (idArray) {
    if (Array.isArray(idArray)) {
        idArray.forEach(function (id) {
            if (!isObjectID(id)) return 0;
        });
        return 1;
    }
    return 0;
};

exports.isContactsList = function (contacts) {
    if (Array.isArray(contacts)) {
        contacts.forEach(function (contact) {
            if (validator.isAlphanumeric(contact)) {

            } else {
                return 0;
            }
        });
    } else {
        return 0;
    }
    return 1;
};

exports.isUUID = function (uuid) {
    if (validator.isUUID(uuid)) {
        return 1;
    }
    return 0;
};