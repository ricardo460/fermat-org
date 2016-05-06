var mongoose = require('mongoose');
/**
 * [UsrPermMdl description]
 * @param {[type]} _master_id  [description]
 * @param {[type]} _granted_id [description]
 */
function UsrPermMdl(_mastr_id, _grantd_id) {
	this._mastr_id = _mastr_id;
	this._grantd_id = _grantd_id;
	this.upd_at = new mongoose.Types.ObjectId();
}
/**
 * [init description]
 * @param  {[type]} usrPermSchema [description]
 * @return {[type]}               [description]
 */
UsrPermMdl.prototype.init = function (usrPermSchema) {
	this._id = usrPermSchema._id;
	this._mastr_id = usrPermSchema._mastr_id;
	this._grantd_id = usrPermSchema._grantd_id;
	this.upd_at = usrPermSchema.upd_at;
};
/**
 * [setUpdate description]
 */
UsrPermMdl.prototype.setUpdate = function () {
	this.upd_at = new mongoose.Types.ObjectId();
};
// export the class
module.exports = UsrPermMdl;