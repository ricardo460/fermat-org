var mongoose = require('mongoose');
var winston = require('winston');
var config = require('../../config');

var mongoose = require('mongoose');

// Constructor
function Dao(ref, schema, model, pop_ref, pop_schema, pop_model) {
    // always initialize all instance properties
    this.Schema = mongoose.model(ref, schema);
    this.Model = model;
    if (pop_ref && pop_schema && pop_model) {
        this.PopSchema = mongoose.model(pop_ref, pop_schema);
        this.PopModel = pop_model;
    }
    if (config.env == 'development') {
        this.Schema.ensureIndexes(function(err, res) {
            if (err) winston.log('info', 'Mongoose default connection error', err);
        });
    }
}

Dao.prototype.findSchemaById = function(_id, callback) {
    var that = this;
    this.Schema.findOne({
        '_id': _id
    }).exec(function(err, schema) {
        if (err && !schema) {
            return callback(err, null);
        } else {
            var model = new that.Model();
            model.init(schema);
            return callback(err, model);
        }
    });
};

Dao.prototype.findSchema = function(query, callback) {
    var that = this;
    this.Schema.findOne(query).exec(function(err, schema) {
        if (err && !schema) {
            return callback(err, null);
        } else {
            var model = new that.Model();
            model.init(schema);
            return callback(err, model);
        }
    });
};

Dao.prototype.findSchemaLst = function(query, limit, sort, callback) {
    var that = this;
    this.Schema.find(query)
        .limit(limit)
        .sort(sort)
        .exec(function(err, schemas) {
            if (err && !schemas) {
                return callback(err, null);
            } else {
                var models = [];
                for (var i = 0, l = schemas.length; i < l; i++) {
                    var model = new that.Model();
                    model.init(schemas[i]);
                    models.push(model);
                };
                return callback(err, models);;
            }
        });
};

Dao.prototype.findAllSchemaLst = function(query, sort, callback) {
    var that = this;
    this.Schema.find(query)
        .sort(sort)
        .exec(function(err, schemas) {
            if (err && !schemas) {
                return callback(err, null);
            } else {
                var models = [];
                for (var i = 0, l = schemas.length; i < l; i++) {
                    var model = new that.Model();
                    model.init(schemas[i]);
                    models.push(model);
                };
                return callback(err, models);;
            }
        });
};

Dao.prototype.updateSchema = function(condition, update, options, callback) {
    this.Schema.update(condition, update, options, function(err, res) {
        if (err && !res) {
            return callback(err, null);
        } else {
            return callback(err, res);
        }
    });
};

Dao.prototype.insertSchema = function(model, callback) {
    var schema = new this.Schema(model);
    var that = this;
    schema.save(function(err, schema) {
        if (err && !schema) {
            return callback(err, null);
        } else {
            var mdl = new that.Model();
            mdl.init(schema);
            return callback(err, mdl);
        }
    });
};

Dao.prototype.findAndPopulateSchemaById = function(_id, path, callback) {
    var that = this;
    this.Schema.findOne({
        '_id': _id
    })
        .populate(path)
        .exec(function(err, schema) {
            if (err && !schema) {
                return callback(err, null);
            } else {
                var model = new that.Model();
                model.init(schema);
                return callback(err, model);
            }
        });
};

Dao.prototype.findAndPopulateSchema = function(query, path, callback) {
    var that = this;
    this.Schema.findOne(query)
        .populate(path)
        .exec(function(err, schema) {
            if (err && !schema) {
                return callback(err, null);
            } else {
                var model = new that.Model();
                model.init(schema);
                return callback(err, model);
            }
        });
};

Dao.prototype.findAndPopulateSchemaLst = function(query, limit, sort, path, callback) {
    var that = this;
    this.Schema.find(query)
        .limit(limit)
        .sort(sort)
        .populate(path)
        .exec(function(err, schemas) {
            if (err && !schemas) {
                return callback(err, null);
            } else {
                var models = [];
                for (var i = 0, l = schemas.length; i < l; i++) {
                    var model = new that.Model();
                    model.init(schemas[i]);
                    models.push(model);
                };
                return callback(err, models);;
            }
        });
};

// export the class
module.exports = Dao;