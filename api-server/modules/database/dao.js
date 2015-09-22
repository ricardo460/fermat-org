var mongoose = require('mongoose');
var winston = require('winston');
var config = require('../../config');

/**
 * [Dao Constructor]
 *
 * @method Dao
 *
 * @param  {[type]} ref        [description]
 * @param  {[type]} schema     [description]
 * @param  {[type]} model      [description]
 * @param  {[type]} *path_ref    [description]
 * @param  {[type]} *path_schema [description]
 * @param  {[type]} *path_model  [description]
 */
function Dao(ref, schema, model, path_ref, path_schema, path_model,
    sec_path_ref, sec_path_schema, sec_path_model,
    thr_path_ref, thr_path_schema, thr_path_model,
    frt_path_ref, frt_path_schema, frt_path_model,
    fit_path_ref, fit_path_schema, fit_path_model) {
    // always initialize all instance properties
    this.Schema = mongoose.model(ref, schema);
    this.Model = model;
    if (path_ref && path_schema && path_model) {
        this.PathSchema = mongoose.model(path_ref, path_schema);
        this.PathModel = path_model;
    }
    if (sec_path_ref && sec_path_schema && sec_path_model) {
        this.SecPathSchema = mongoose.model(sec_path_ref, sec_path_schema);
        this.SecPathModel = sec_path_model;
    }
    if (thr_path_ref && thr_path_schema && thr_path_model) {
        this.ThrPathSchema = mongoose.model(thr_path_ref, thr_path_schema);
        this.ThrPathModel = thr_path_model;
    }
    if (frt_path_ref && frt_path_schema && frt_path_model) {
        this.FrtPathSchema = mongoose.model(frt_path_ref, frt_path_schema);
        this.FrtPathModel = frt_path_model;
    }
    if (fit_path_ref && fit_path_schema && fit_path_model) {
        this.FitPathSchema = mongoose.model(fit_path_ref, fit_path_schema);
        this.FitPathModel = fit_path_model;
    }
    if (config.env == 'development') {
        this.Schema.ensureIndexes(function(err, res) {
            if (err) winston.log('info', 'Mongoose default connection error', err);
        });
    }
}

/**
 * [findSchemaById description]
 *
 * @method findSchemaById
 *
 * @param  {[type]}       _id      [description]
 * @param  {Function}     callback [description]
 *
 * @return {[type]}       [description]
 */
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

/**
 * [findSchema description]
 *
 * @method findSchema
 *
 * @param  {[type]}   query    [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
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

/**
 * [findSchemaLst description]
 *
 * @method findSchemaLst
 *
 * @param  {[type]}      query    [description]
 * @param  {[type]}      limit    [description]
 * @param  {[type]}      sort     [description]
 * @param  {Function}    callback [description]
 *
 * @return {[type]}      [description]
 */
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

/**
 * [findAllSchemaLst description]
 *
 * @method findAllSchemaLst
 *
 * @param  {[type]}         query    [description]
 * @param  {[type]}         sort     [description]
 * @param  {Function}       callback [description]
 *
 * @return {[type]}         [description]
 */
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

/**
 * [updateSchema description]
 *
 * @method updateSchema
 *
 * @param  {[type]}     condition [description]
 * @param  {[type]}     update    [description]
 * @param  {[type]}     options   [description]
 * @param  {Function}   callback  [description]
 *
 * @return {[type]}     [description]
 */
Dao.prototype.updateSchema = function(condition, update, options, callback) {
    this.Schema.update(condition, update, options, function(err, res) {
        if (err && !res) {
            return callback(err, null);
        } else {
            return callback(err, res);
        }
    });
};

/**
 * [insertSchema description]
 *
 * @method insertSchema
 *
 * @param  {[type]}     model    [description]
 * @param  {Function}   callback [description]
 *
 * @return {[type]}     [description]
 */
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

//pull
//push

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

Dao.prototype.findAndPopulateAllSchemaLst = function(query, sort, path, callback) {
    var that = this;
    this.Schema.find(query)
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