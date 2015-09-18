var mongoose = require('mongoose');

// Constructor
function CompMdl(_platfrm_id, _suprlay_id, _layer_id, name, type, description, difficulty, code_level) {
    // always initialize all instance properties
    this._platfrm_id = null;
    this._suprlay_id = null;
    this._layer_id = null;
    this.name = name;
    this.type = type;
    this.description = description;
    this.difficulty = difficulty;
    this.code_level = code_level;
    this.devs = [];
    this.certs = [];
    this.upd_at = new mongoose.Types.ObjectId();
}

// class methods
CompMdl.prototype.init = function(compSchema) {
    this._platfrm_id = compSchema._platfrm_id;
    this._suprlay_id = compSchema._suprlay_id;
    this._layer_id = compSchema._layer_id;
    this.name = compSchema.name;
    this.type = compSchema.type;
    this.description = compSchema.description;
    this.difficulty = compSchema.difficulty;
    this.code_level = compSchema.code_level;
    this.devs = compSchema.devs;
    this.certs = compSchema.certs;
    this.upd_at = compSchema.upd_at;
};

CompMdl.prototype.setUpdate = function() {
    this.upd_at = new mongoose.Types.ObjectId();
};

// export the class
module.exports = CompMdl;