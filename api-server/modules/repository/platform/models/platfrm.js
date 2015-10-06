var mongoose = require('mongoose');

/**
 * [PlatfrmMdl description]
 *
 * @method PlatfrmMdl
 *
 * @param  {[type]}   code          [description]
 * @param  {[type]}   name          [description]
 * @param  {[type]}   logo          [description]
 * @param  {[type]}   deps          [description]
 * @param  {[type]}   order         [description]
 */
function PlatfrmMdl(code, name, logo, deps, order) {
	// always initialize all instance properties
	this.code = code;
	this.name = name;
	this.logo = logo;
	this.deps = deps;
	switch (code) {
        case 'COR':
            this.order = 0;
            break;
        case 'PIP':
            this.order = 1;
            break;
        case 'WPD':
            this.order = 2;
            break;
        case 'CCP':
            this.order = 3;
            break;
        case 'CCM':
            this.order = 4;
            break;
        case 'BNP':
            this.order = 5;
            break;
        case 'SHP':
            this.order = 6;
            break;
        case 'DAP':
            this.order = 7;
            break;
        case 'MKT':
            this.order = 8;
            break;
        case 'CSH':
            this.order = 9;
            break;
        case 'BNK':
            this.order = 10;
            break;
        case 'CBP':
            this.order = 11;
            break;
        case 'CDN':
            this.order = 12;
            break;
        case 'DPN':
            this.order = 13;
            break;
        default:
            this.order = -1;
            break;
    }
	this.upd_at = new mongoose.Types.ObjectId();
}

/**
 * [init description]
 *
 * @method init
 *
 * @param  {[type]} platfrmSchema [description]
 *
 * @return {[type]} [description]
 */
PlatfrmMdl.prototype.init = function(platfrmSchema) {
	this._id = platfrmSchema._id;
	this.code = platfrmSchema.code;
	this.name = platfrmSchema.name;
	this.logo = platfrmSchema.logo;
	this.deps = platfrmSchema.deps;
	this.order = platfrmSchema.order;
	this.upd_at = platfrmSchema.upd_at;
};

/**
 * [setUpdate description]
 *
 * @method setUpdate
 */
PlatfrmMdl.prototype.setUpdate = function() {
	this.upd_at = new mongoose.Types.ObjectId();
};

// export the class
module.exports = PlatfrmMdl;