var appSrv = require('./services/app');
var appMdl = require('./models/app');


/**
 * [insOrUpdApp description]
 * @param  {[type]}   _owner_id [description]
 * @param  {[type]}   name      [description]
 * @param  {[type]}   desc      [description]
 * @param  {Function} callback  [description]
 * @return {[type]}             [description]
 */
exports.insOrUpdApp = function(_owner_id, name, desc, callback) {
	'use strict';
	try {
		appSrv.findAppByName(name, function(err_app, res_app) {
			if (err_app) {
				return callback(err_app, null);
			}
			if (res_app) {
				var set_obj = {};
				if (_owner_id && _owner_id !== res_app._owner_id) {
					set_obj._owner_id = _owner_id;
					res_app._owner_id = _owner_id;
				}
				if (name && name !== res_app.name) {
					set_obj.name = name;
					res_app.name = name;
				}
				if (desc && desc !== res_app.desc) {
					set_obj.desc = desc;
					res_app.desc = desc;
				}

				if (Object.keys(set_obj).length > 0) {
					appSrv.updateAppById(res_app._id, set_obj, function(err_upd, res_upd) {
						if (err_upd) {
							return callback(err_upd, null);
						}
						return callback(null, res_upd);
					});
				} else {
					return callback(null, res_app);
				}
			} else {
				var app = new appMdl(_owner_id, name, desc);
				appSrv.insertApp(app, function(err_ins, res_ins) {
					if (err_ins) {
						return callback(err_ins, null);
					}
					return callback(null, res_ins);
				});
			}
		});
	} catch (err) {
		return callback(err, null);
	}
};

/**
 * [getApps description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.getApps = function(callback) {
	'use strict';
	try {
		appSrv.findAllApps({}, {}, function(err, apps) {
			if (err) {
				return callback(err, null);
			}
			return callback(null, apps);
		});
	} catch (err) {
		return callback(err, null);
	}
};

/**
 * [delAllApps description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.delAllApps = function(callback) {
	'use strict';
	try {
		appSrv.delAllApps(function(err, apps) {
			if (err) {
				return callback(err, null);
			}
			return callback(null, true);
		});
	} catch (err) {
		return callback(err, null);
	}
};

/**
 * [findAppById description]
 * @param  {[type]}   _id      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.findAppById = function(_id, callback) {
	appSrv.findAppById(_id, function(err_app, res_app) {
		if (err_app) {
			return callback(err_app, null);
		}
		return callback(null, res_app);
	});
};

/**
 * [findAppByName description]
 * @param  {[type]}   name     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.findAppByName = function(name, callback) {
	appSrv.findAppByName(name, function(err_app, res_app) {
		if (err_app) {
			return callback(err_app, null);
		}
		return callback(null, res_app);
	});
};

/**
 * [findAppByOwnerId description]
 * @param  {[type]}   _owner_id [description]
 * @param  {Function} callback  [description]
 * @return {[type]}             [description]
 */
exports.findAppByOwnerId = function(_owner_id, callback) {
	appSrv.findAppByOwnerId(_owner_id, function(err_app, res_app) {
		if (err_app) {
			return callback(err_app, null);
		}
		return callback(null, res_app);
	});
};