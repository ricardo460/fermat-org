var suprlaySrv = require('./services/suprlay');
var SuprlayMdl = require('./models/suprlay');
var compMod = require('../component');
var orderLib = require('../../../lib/utils/order');
var MapsCodesPlatfSuprl = require("../lib/codes_platf_suprlay");
var mapsCodes = new MapsCodesPlatfSuprl();
/**
 * [sort description]
 *
 * @method sort
 *
 * @param  {[type]} point [description]
 * @param  {[type]} dir   [description]
 *
 * @return {[type]} [description]
 */
var swapOrder = function(action, oldSpot, newSpot, callback) {
	orderLib.swapOrder(action, oldSpot, newSpot, function(err, query, set) {
		if (err) {
			return callback(err, null);
		} else {
			suprlaySrv.updateSuprlays(query, set, function(err_srt, res_srt) {
				if (err_srt) {
					return callback(err_srt, null);
				} else {
					return callback(null, res_srt);
				}
			});
		}
	});
};
/**
 * [getOrdrLstSuprlays description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
var getOrdrLstSuprlays = function(callback) {
	'use strict';
	try {
		suprlaySrv.findSuprlays({}, 1, {
			order: -1
		}, function(err, suprlays) {
			if (err) {
				callback(err, null);
			} else {
				callback(null, suprlays[0].order);
			}
		});
	} catch (err) {
		callback(err, null);
	}
};
/**
 * [insOrUpdSuprlay description]
 *
 * @method insOrUpdSuprlay
 *
 * @param  {[type]}        code          [description]
 * @param  {[type]}        name          [description]
 * @param  {[type]}        logo          [description]
 * @param  {[type]}        deps          [description]
 * @param  {[type]}        platfrm_index [description]
 * @param  {[type]}        layer_index   [description]
 * @param  {Function}      callback      [description]
 *
 * @return {[type]}        [description]
 */
exports.insOrUpdSuprlay = function(code, name, logo, deps, order, callback) {
	'use strict';
	var existDepd = null;
	try {
		//order = code ? getOrder(code) : null;
		suprlaySrv.findSuprlayByCode(code, function(err_supr, res_supr) {
			if (err_supr) {
				return callback(err_supr, null);
			}
			if (res_supr) {
				var set_obj = {};
				if (name && name !== res_supr.name) {
					set_obj.name = name;
					res_supr.name = name;
				}
				if (logo && logo !== res_supr.logo) {
					set_obj.logo = logo;
					res_supr.logo = logo;
				}
				if (deps && deps !== res_supr.deps) {
					if (deps !== undefined || deps !== null || deps.length !== 0)
						deps = deps.replace(" ", "").split(',');
					else
						deps = [];
					existDepd = mapsCodes.existDeps(deps);
					if (!existDepd.valid) return callback('Dependencies id ' + existDepd._id + ' not found', null);
					set_obj.deps = deps;
					res_supr.deps = deps;
				}
				if (order && order !== '' && order + '' != '-1' && order + '' != res_supr.order + '') {
					set_obj.order = parseInt(order);
					res_supr.order = parseInt(order);
				}
				if (Object.keys(set_obj).length > 0) {
					if (typeof set_obj.order != 'undefined' && set_obj.order > '-1') {
						swapOrder('update', res_supr.order, set_obj.order, function(err_sld, res_sld) {
							if (err_sld) {
								return callback(err_sld, null);
							} else {
								suprlaySrv.updateSuprlayById(res_supr._id, set_obj, function(err_upd, res_upd) {
									if (err_upd) {
										return callback(err_upd, null);
									}
									return callback(null, set_obj);
								});
							}
						});
					} else {
						suprlaySrv.updateSuprlayById(res_supr._id, set_obj, function(err_upd, res_upd) {
							if (err_upd) {
								return callback(err_upd, null);
							}
							return callback(null, set_obj);
						});
					}
				} else {
					return callback(null, res_supr);
				}
			} else {
				if (deps === undefined || deps === null || deps.length === 0)
					deps = [];
				else
					deps = deps.split(',');
				existDepd = mapsCodes.existDeps(deps);
				if (!existDepd.valid) return callback('Dependencies id ' + existDepd._id + ' not found', null);
				if (order === undefined || order === null) getOrdrLstSuprlays(function(err, nu_order) {
					if (err) return callback(err, null);
					if (nu_order) {
						//Putting super layer at the end since not provide an order
						order = parseInt(nu_order) + 1;
						var suprlay = new SuprlayMdl(code, name, logo, deps, order);
						swapOrder('insert', null, suprlay.order, function(err_sld, res_sld) {
							if (err_sld) {
								return callback(err_sld, null);
							} else {
								suprlaySrv.insertSuprlay(suprlay, function(err_ins, res_ins) {
									if (err_ins) {
										return callback(err_ins, null);
									}
									return callback(null, res_ins);
								});
							}
						});
					}
				});
				else {
					var suprlay = new SuprlayMdl(code, name, logo, deps, order);
					swapOrder('insert', null, suprlay.order, function(err_sld, res_sld) {
						if (err_sld) {
							return callback(err_sld, null);
						} else {
							suprlaySrv.insertSuprlay(suprlay, function(err_ins, res_ins) {
								if (err_ins) {
									return callback(err_ins, null);
								}
								return callback(null, res_ins);
							});
						}
					});
				}
			}
		});
	} catch (err) {
		callback(err, null);
	}
};
/**
 * [getSuprlays description]
 *
 * @method getSuprlays
 *
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.getSuprlays = function(callback) {
	'use strict';
	try {
		suprlaySrv.findAllSuprlays({}, {
			order: 1
		}, function(err, suprlays) {
			if (err) {
				callback(err, null);
			} else {
				var mapPlatfrms = mapsCodes.mapsCodePlatfrm();
				var mapSuprlays = mapsCodes.mapsCodeSuprlay();
				for (var i = 0; i < suprlays.length; i++) {
					for (var j = 0; j < suprlays[i].deps.length; j++) {
						var platfrmCode = mapPlatfrms[suprlays[i].deps[j]];
						var suprlayCode = mapSuprlays[suprlays[i].deps[j]];
						if (platfrmCode)
							suprlays[i].deps[j] = platfrmCode;
						else if (suprlayCode)
							suprlays[i].deps[j] = suprlayCode;
					}
				}
				callback(null, suprlays);
			}
		});
	} catch (err) {
		callback(err, null);
	}
};
/**
 * [delAllSuprlays description]
 *
 * @method delAllSuprlays
 *
 * @param  {Function}     callback [description]
 *
 * @return {[type]}       [description]
 */
exports.delAllSuprlays = function(callback) {
	'use strict';
	try {
		suprlaySrv.delAllSuprlays(function(err, platfrms) {
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
 * [findSuprlayById description]
 *
 * @method findSuprlayById
 *
 * @param  {[type]}     _id       [description]
 * @param  {[type]}     callback  [description]
 *
 * @return {[type]}     [description]
 */
exports.findSuprlayById = function(_id, callback) {
	suprlaySrv.findSuprlayById(_id, function(err_suprlay, res_suprlay) {
		if (err_suprlay) {
			return callback(err_suprlay, null);
		} else if (res_suprlay) {
			var mapPlatfrms = mapsCodes.mapsCodePlatfrm();
			var mapSuprlays = mapsCodes.mapsCodeSuprlay();
			for (var j = 0; j < res_suprlay.deps.length; j++) {
				var platfrmCode = mapPlatfrms[res_suprlay.deps[j]];
				var suprlayCode = mapSuprlays[res_suprlay.deps[j]];
				if (platfrmCode)
					res_suprlay.deps[j] = platfrmCode;
				else if (suprlayCode)
					res_suprlay.deps[j] = suprlayCode;
			}
			return callback(null, res_suprlay);
		} else {
			return callback(null, null);
		}
	});
};
/**
 * [updateSuprlayById description]
 *
 * @method updateSuprlayById
 *
 *
 * @param  {[type]}     _sprly_id       [description]
 * @param  {[type]}     code            [description]
 * @param  {[type]}     name            [description]
 * @param  {[type]}     logo            [description]
 * @param  {[type]}     deps            [description]
 * @param  {[type]}     order           [description]
 * @param  {Function}   callback        [description]
 *
 * @return {[type]}    [description]
 */
exports.updateSuprlayById = function(_sprly_id, code, name, logo, deps, order, callback) {
	'use strict';
	try {
		var set_obj = {};
		var existDepd = null;
		if (code) {
			set_obj.code = code;
		}
		if (name) {
			set_obj.name = name;
		}
		if (logo) {
			set_obj.logo = logo;
		}
		if (deps) {
			deps = deps.split(',');
			existDepd = mapsCodes.existDeps(deps);
			if (!existDepd.valid) return callback('Dependencies id ' + existDepd._id + ' not found', null);
			set_obj.deps = deps;
		}
		if (typeof order != "undefined") {
			set_obj.order = order;
		}
		suprlaySrv.findSuprlayById(_sprly_id, function(err_supr, res_supr) {
			if (err_supr) {
				return callback(err_supr, null);
			} else if (res_supr) {
				if (typeof set_obj.order != 'undefined' && set_obj.order > -1) {
					swapOrder('update', res_supr.order, set_obj.order, function(err_sld, res_sld) {
						if (err_sld) {
							return callback(err_sld, null);
						} else {
							suprlaySrv.updateSuprlayById(res_supr._id, set_obj, function(err_upd, res_upd) {
								if (err_upd) {
									return callback(err_upd, null);
								}
								return callback(null, set_obj);
							});
						}
					});
				} else {
					suprlaySrv.updateSuprlayById(res_supr._id, set_obj, function(err_upd, res_upd) {
						if (err_upd) {
							return callback(err_upd, null);
						}
						return callback(null, set_obj);
					});
				}
			} else {
				return callback('The super layer does not exist', null);
			}
		});
	} catch (err) {
		return callback(err, null);
	}
};
/**
 * [updateDepsSuperlayById description]
 * @param  {[type]}   _suprlay_id [description]
 * @param  {[type]}   deps        [description]
 * @param  {Function} callback    [description]
 * @return {[type]}               [description]
 */
exports.updateDepsSuperlayById = function(_suprlay_id, deps, callback) {
	'use strict';
	try {
		var set_obj = {};
		if (deps)
			set_obj.deps = deps;
		suprlaySrv.updateSuprlayById(_suprlay_id, set_obj, function(err, res_upd) {
			if (err) {
				return callback(err, null);
			}
			return callback(null, set_obj);
		});
	} catch (err) {
		return callback(err, null);
	}
};
/**
 * [delSuprlayById description]
 *
 * @method delSuprlayById
 *
 * @param  {[type]}        _id      [description]
 * @param  {Function}      callback [description]
 *
 * @return {[type]}        [description]
 */
exports.delSuprlayById = function(_id, callback) {
	'use strict';
	try {
		var delSuprlay = function() {
			suprlaySrv.findSuprlayById(_id, function(err_suprlay, res_suprlay) {
				if (err_suprlay) {
					return callback(err_suprlay, null);
				} else if (res_suprlay) {
					swapOrder('delete', res_suprlay.order, null, function(err_sld, res_sld) {
						if (err_sld) {
							return callback(err_sld, null);
						} else {
							suprlaySrv.delSuprlayById(res_suprlay._id, function(err_del, res_del) {
								if (err_del) {
									return callback(err_del, null);
								}
								return callback(null, res_suprlay);
							});
						}
					});
				} else {
					return callback(null, null);
				}
				// ordering function
			});
		};
		compMod.findCompsBySuprlayId(_id, function(err_comp, res_comps) {
			if (err_comp) {
				return callback(err_comp, null);
			}
			if (res_comps) {
				var _comps = res_comps;
				var loopDelComps = function() {
					if (_comps.length <= 0) {
						delSuprlay();
					} else {
						var comp = _comps.pop();
						compMod.delCompById(comp._id, function(err_del_comp, res_del_comp) {
							if (err_del_comp) {
								return callback(err_del_comp, null);
							} else {
								loopDelComps();
							}
						});
					}
				};
				loopDelComps();
			} else {
				delSuprlay();
			}
		});
	} catch (err) {
		return callback(err, null);
	}
};