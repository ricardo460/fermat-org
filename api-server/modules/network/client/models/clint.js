var mongoose = require('mongoose');
/**
 * [ClintMdl description]
 *
 * @method ClintMdl
 *
 * @param  {[type]} _wave_id [description]
 * @param  {[type]} _serv_id [description]
 * @param  {[type]} hash     [description]
 * @param  {[type]} extra    [description]
 */
function ClintMdl(_wave_id, _serv_id, hash, extra) {
	'use strict';
	// always initialize all instance properties
	this._wave_id = _wave_id;
	this._serv_id = _serv_id;
	this.hash = hash;
	this.type = 'client';
	this.extra = extra;
	this.upd_at = new mongoose.Types.ObjectId();
}
/**
 * [init description]
 *
 * @method init
 *
 * @param  {[type]} clintSchema [description]
 *
 * @return {[type]} [description]
 */
ClintMdl.prototype.init = function (clintSchema) {
	'use strict';
	this._id = clintSchema._id;
	this._wave_id = clintSchema._wave_id;
	this._serv_id = clintSchema._serv_id;
	this.hash = clintSchema.hash;
	this.type = clintSchema.type;
	this.extra = clintSchema.extra;
	this.upd_at = clintSchema.upd_at;
};
/**
 * [setUpdate description]
 *
 * @method setUpdate
 */
ClintMdl.prototype.setUpdate = function () {
	'use strict';
	this.upd_at = new mongoose.Types.ObjectId();
};
// export the class
module.exports = ClintMdl;