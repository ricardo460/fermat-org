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
    this.Schema.findOne({
        '_id': _id
    }).exec(function(err, schema) {
        var model = new this.Model();
        model.init(schema);
        callback(err, model);
    });
};

Dao.prototype.findSchema = function(query, callback) {
    this.Schema.findOne(query).exec(function(err, schema) {
        var model = new this.Model();
        model.init(schema);
        callback(err, model);
    });
};

Dao.prototype.findSchemaLst = function(query, limit, sort, callback) {
    this.Schema.find(query)
        .limit(limit)
        .sort(sort)
        .exec(function(err, schemas) {
            var models = [];
            for (var i = 0, l = schemas.length; i < l; i++) {
                var model = new this.Model();
                model.init(schemas[i]);
                models.push(model);
            };
            callback(err, models);;
        });
};

Dao.prototype.findAllSchemaLst = function(query, sort, callback) {
    this.Schema.find(query)
        .sort(sort)
        .exec(function(err, schemas) {
            var models = [];
            for (var i = 0, l = schemas.length; i < l; i++) {
                var model = new this.Model();
                model.init(schemas[i]);
                models.push(model);
            };
            callback(err, models);;
        });
};

Dao.prototype.updateSchema = function(condition, update, options, callback) {
    this.Schema.update(condition, update, options, function(err, res) {
        callback(err, res);
    });
};

Dao.prototype.insertSchema = function(model, callback) {
    var schema = new this.Schema(model);
    schema.save(function(err, res) {
        callback(err, res);
    });
};

Dao.prototype.findAndPopulateSchemaById = function(_id, path, callback) {
    this.Schema.findOne({
        '_id': _id
    })
        .populate(path)
        .exec(function(err, schema) {
            var model = new this.Model();
            model.init(schema);
            callback(err, model);
        });
};

Dao.prototype.findAndPopulateSchema = function(query, path, callback) {
    this.Schema.findOne(query)
        .populate(path)
        .exec(function(err, schema) {
            var model = new this.Model();
            model.init(schema);
            callback(err, model);
        });
};

Dao.prototype.findAndPopulateSchemaLst = function(query, limit, sort, path, callback) {
    this.Schema.find(query)
        .limit(limit)
        .sort(sort)
        .populate(path)
        .exec(function(err, schemas) {
            var models = [];
            for (var i = 0, l = schemas.length; i < l; i++) {
                var model = new this.Model();
                model.init(schemas[i]);
                models.push(model);
            };
            callback(err, models);;
        });
};

// export the class
module.exports = Dao;