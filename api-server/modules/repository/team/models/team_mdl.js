var mongoose = require('mongoose');

// Constructor
function TeamMdl(name, descript) {
    // always initialize all instance properties
    this.name = name;
    this.descript = descript;
    this.devs = [];
    this.upd_at = new mongoose.Types.ObjectId();
}

// class methods
TeamMdl.prototype.init = function(teamSchema) {
    this.name = teamSchema.name;
    this.descript = teamSchema.descript;
    this.devs = teamSchema.devs;
    this.upd_at = teamSchema.upd_at;
};

TeamMdl.prototype.setUpdate = function() {
    this.upd_at = new mongoose.Types.ObjectId();
};

// export the class
module.exports = TeamMdl;