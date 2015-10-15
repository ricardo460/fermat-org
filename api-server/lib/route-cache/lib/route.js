'use strict';
/**
 * [Route description]
 *
 * @method Route
 *
 * @param  {[type]} body   [description]
 * @param  {[type]} date   [description]
 * @param  {[type]} time   [description]
 */
function Route(body, date, time) {
    this.body = body || {};
    this.date = date || new Date();
    this.time = time || 3600000;
}

/**
 * [isValid description]
 *
 * @method isValid
 *
 * @return {Boolean} [description]
 */
Route.prototype.isValid = function () {
    var then = new Date(this.date);
    var now = new Date();
    var valid = now.getTime() - then.getTime() < this.time;
    return valid;
};

module.exports = Route;