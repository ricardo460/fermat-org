var mongoose = require('mongoose');

/**
 * [TeamMdl description]
 *
 * @method TeamMdl
 *
 * @param  {[type]} name     [description]
 * @param  {[type]} descript [description]
 */
function TeamMdl(name, descript) {
    // always initialize all instance properties
    this.name = name;
    this.descript = descript;
    this.devs = [];
    this.upd_at = new mongoose.Types.ObjectId();
}

/**
 * [init description]
 *
 * @method init
 *
 * @param  {[type]} teamSchema [description]
 *
 * @return {[type]} [description]
 */
TeamMdl.prototype.init = function(teamSchema) {
    this._id = teamSchema._id;
    this.name = teamSchema.name;
    this.descript = teamSchema.descript;
    this.devs = teamSchema.devs;
    this.upd_at = teamSchema.upd_at;
};

/**
 * [setUpdate description]
 *
 * @method setUpdate
 */
TeamMdl.prototype.setUpdate = function() {
    this.upd_at = new mongoose.Types.ObjectId();
};

// export the class
module.exports = TeamMdl;