var mongoose = require('mongoose');
/**
 * [ServMdl description]
 *
 * @method ServMdl
 *
 * @param  {[type]} _wave_id [description]
 * @param  {[type]} hash     [description]
 * @param  {[type]} type     [description]
 * @param  {[type]} extra    [description]
 */
function ServMdl(_wave_id, hash, extra) {
	'use strict';
	// always initialize all instance properties
	this._wave_id = _wave_id;
	this.hash = hash;
	this.type = 'server';
	this.extra = extra;
	this.upd_at = new mongoose.Types.ObjectId();
}
/**
 * [init description]
 *
 * @method init
 *
 * @param  {[type]} servSchema [description]
 *
 * @return {[type]} [description]
 */
ServMdl.prototype.init = function (servSchema) {
	'use strict';
	this._id = servSchema._id;
	this._wave_id = servSchema._wave_id;
	this.hash = servSchema.hash;
	this.type = servSchema.type;
	this.extra = servSchema.extra;
	this.upd_at = servSchema.upd_at;
};
/**
 * [setUpdate description]
 *
 * @method setUpdate
 */
ServMdl.prototype.setUpdate = function () {
	'use strict';
	this.upd_at = new mongoose.Types.ObjectId();
};
// export the class
module.exports = ServMdl;