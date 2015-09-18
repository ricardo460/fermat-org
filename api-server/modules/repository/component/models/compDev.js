var mongoose = require('mongoose');

// Constructor
function CompDevMdl(_dev_id, _comp_id, role, scope, percnt) {
    // always initialize all instance properties
    this._dev_id = null;
    this._comp_id = null;
    this.role = role;
    this.scope = scope;
    this.percnt = percnt;
    this.upd_at = new mongoose.Types.ObjectId();
}

// class methods
CompDevMdl.prototype.init = function(compDevSchema) {
    this._dev_id = compDevSchema._dev_id;
    this._comp_id = compDevSchema._comp_id;
    this.role = compDevSchema.role;
    this.scope = compDevSchema.scope;
    this.percnt = compDevSchema.percnt;
    this.upd_at = compDevSchema.upd_at;
};

CompDevMdl.prototype.setUpdate = function() {
    this.upd_at = new mongoose.Types.ObjectId();
};

// export the class
module.exports = CompDevMdl;