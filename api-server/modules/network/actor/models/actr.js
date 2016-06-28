var mongoose = require('mongoose');

/**
 * Actor Model, filled with database's data
 * @author Miguelcldn
 * 
 */
function ActrMdl(_wave_id, _serv_id, hash, actorType, links, location, profile) {
	'use strict';
	// always initialize all instance properties
	this._wave_id = _wave_id;
	this._serv_id = _serv_id;
	this.hash = hash;
	this.type = 'actor';
	this.actorType = actorType;
    this.links = links;
    this.location = location;
    this.profile = profile;
	this.upd_at = new mongoose.Types.ObjectId();
}
/**
 * [init description]
 *
 * @method init
 *
 * @param  {[type]} actrSchema [description]
 *
 * @return {[type]} [description]
 */
ActrMdl.prototype.init = function (actrSchema) {
	'use strict';
	this._id = actrSchema._id;
	this._wave_id = actrSchema._wave_id;
	this._serv_id = actrSchema._serv_id;
	this.hash = actrSchema.hash;
	this.type = actrSchema.type;
	this.actorType = actrSchema.actorType;
    this.links = actrSchema.links;
    this.location = actrSchema.location;
    this.profile = actrSchema.profile;
	this.upd_at = actrSchema.upd_at;
};
/**
 * [setUpdate description]
 *
 * @method setUpdate
 */
ActrMdl.prototype.setUpdate = function () {
	'use strict';
	this.upd_at = new mongoose.Types.ObjectId();
};
// export the class
module.exports = ActrMdl;