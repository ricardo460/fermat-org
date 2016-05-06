var mongoose = require('mongoose');
/**
 * [UsrPermMdl description]
 * @param {[type]} _master_id  [description]
 * @param {[type]} _granted_id [description]
 */
function UsrPermMdl(master_id, granted_id) {
	this.master_id = master_id;
	this.granted_id = granted_id;
	this.upd_at = new mongoose.Types.ObjectId();
}
/**
 * [init description]
 * @param  {[type]} usrPermSchema [description]
 * @return {[type]}               [description]
 */
UsrPermMdl.prototype.init = function (usrPermSchema) {
	this.master_id = usrPermSchema.master_id;
	this.granted_id = usrPermSchema.granted_id;
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