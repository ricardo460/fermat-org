var mongoose = require('mongoose');

/**
 * [ProcMdl description]
 *
 * @method ProcMdl
 *
 * @param  {[type]} name  [description]
 * @param  {[type]} desc  [description]
 * @param  {[type]} steps [description]
 */
function ProcMdl(name, desc, steps) {
    // always initialize all instance properties
    this.name = name;
    this.desc = desc;
    this.steps = steps;
    this.upd_at = new mongoose.Types.ObjectId();
}

/**
 * [init description]
 *
 * @method init
 *
 * @param  {[type]} procSchema [description]
 *
 * @return {[type]} [description]
 */
ProcMdl.prototype.init = function(procSchema) {
    this._id = procSchema._id;
    this.name = procSchema.name;
    this.desc = procSchema.desc;
    this.steps = procSchema.steps;
    this.upd_at = procSchema.upd_at;
};

/**
 * [setUpdate description]
 *
 * @method setUpdate
 */
ProcMdl.prototype.setUpdate = function() {
    this.upd_at = new mongoose.Types.ObjectId();
};

// export the class
module.exports = ProcMdl;