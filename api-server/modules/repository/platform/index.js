var suprlayMod = require('../superlayer');
var suprlaySrv = require('../superlayer/services/suprlay');
var platfrmSrv = require('./services/platfrm');
var PlatfrmMdl = require('./models/platfrm');
var compMod = require('../component');
var orderLib = require('../../../lib/utils/order');
var mapsCodes = require("../lib/codes_platf_suprlay");
var mapPlatfrms = null;
var mapSuprlays = null;
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
			platfrmSrv.updatePlatfrms(query, set, function(err_srt, res_srt) {
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
 * [getOrdrLstPltfrm description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
var getOrdrLstPltfrm = function(callback) {
	'use strict';
	try {
		platfrmSrv.findPlatfrms({}, 1, {
			order: -1
		}, function(err, platfrms) {
			if (err) {
				callback(err, null);
			} else {
				callback(null, platfrms[0].order);
			}
		});
	} catch (err) {
		callback(err, null);
	}
};
/**
 * [insOrUpdPlatfrm description]
 *
 * @method insOrUpdPlatfrm
 *
 * @param  {[type]}        code          [description]
 * @param  {[type]}        name          [description]
 * @param  {[type]}        logo          [description]
 * @param  {[type]}        deps          [description]
 * @param  {[type]}        order         [description]
 * @param  {Function}      callback      [description]
 *
 * @return {[type]}        [description]
 */
exports.insOrUpdPlatfrm = function(code, name, logo, deps, order, callback) {
	'use strict';
	try {
		if (deps === undefined || deps === null) {
			deps = [];
		} else {
			deps = deps.split(',');
		}
		mapsCodes.existDeps(deps, function(err, exist) {
			if (err) return callback(err, null);
			if (!exist.valid)
				return callback('Dependencies id ' + exist._id + ' not found', null);
			else {
				platfrmSrv.findPlatfrmByCode(code, function(err_plat, res_plat) {
					if (err_plat) {
						return callback(err_plat, null);
					}
					if (res_plat) {
						var set_obj = {};
						if (name && name !== res_plat.name) {
							set_obj.name = name;
							res_plat.name = name;
						}
						if (logo && logo !== res_plat.logo) {
							set_obj.logo = logo;
							res_plat.logo = logo;
						}
						if (deps && deps !== res_plat.deps) {
							set_obj.deps = deps;
							res_plat.deps = deps;
						}
						if (order && order !== '' && order + '' != '-1' && order + '' != res_plat.order + '') {
							set_obj.order = parseInt(order);
							res_plat.order = parseInt(order);
						}
						if (Object.keys(set_obj).length > 0) {
							if (typeof set_obj.order != 'undefined' && set_obj.order > -1) {
								swapOrder('update', res_plat.order, set_obj.order, function(err_sld, res_sld) {
									if (err_sld) {
										return callback(err_sld, null);
									} else {
										platfrmSrv.updatePlatfrmById(res_plat._id, set_obj, function(err, plat) {
											if (err) {
												return callback(err, null);
											}
											return callback(null, set_obj);
										});
									}
								});
							} else {
								platfrmSrv.updatePlatfrmById(res_plat._id, set_obj, function(err_upd, res_upd) {
									if (err_upd) {
										return callback(err_upd, null);
									}
									return callback(null, set_obj);
								});
							}
						} else {
							return callback(null, res_plat);
						}
					} else {
						if (order === undefined || order === null) getOrdrLstPltfrm(function(err, nu_order) {
							if (err) return callback(err, null);
							if (nu_order) {
								//Putting platform at the end since not provide an order
								order = parseInt(nu_order) + 1;
								var platfrm = new PlatfrmMdl(code, name, logo, deps, order);
								swapOrder('insert', null, platfrm.order, function(err_sld, res_sld) {
									if (err_sld) {
										return callback(err_sld, null);
									} else {
										platfrmSrv.insertPlatfrm(platfrm, function(err_ins, res_ins) {
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
							var platfrm = new PlatfrmMdl(code, name, logo, deps, order);
							swapOrder('insert', null, platfrm.order, function(err_sld, res_sld) {
								if (err_sld) {
									return callback(err_sld, null);
								} else {
									platfrmSrv.insertPlatfrm(platfrm, function(err_ins, res_ins) {
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
			}
		});
	} catch (err) {
		return callback(err, null);
	}
};
var loadCodes = function(callback) {
	try {
		mapsCodes.loadCodesPlatform(function(err, mapsCodPlatfrm) {
			if (err) return callback(err, null);
			if (mapsCodPlatfrm) {
				mapPlatfrms = mapsCodPlatfrm;
				mapsCodes.loadCodesSuprlays(function(err, mapsCodSuprlay) {
					if (err) return callback(err, null);
					if (mapsCodSuprlay) {
						mapSuprlays = mapsCodSuprlay;
						return callback(null, true);
					}
				});
			}
		});
	} catch (err) {
		return callback(err, null);
	}
};

/**
 * [getPlatfrms description]
 *
 * @method getPlatfrms
 *
 * @param  {Function}  callback [description]
 *
 * @return {[type]}    [description]
 */
exports.getPlatfrms = function(callback) {
	'use strict';

	try {
		platfrmSrv.findAllPlatfrms({}, {
			order: 1
		}, function(err, platfrms) {
			if (err) {
				return callback(err, null);
			} else {
				loadCodes(function(err, res) {
					if (err) return callback(err, null);
					if (res) {
						for (var i = 0; i < platfrms.length; i++) {
							for (var j = 0; j < platfrms[i].deps.length; j++) {
								var platfrmCode = mapPlatfrms[platfrms[i].deps[j]];
								var suprlayCode = mapSuprlays[platfrms[i].deps[j]];
								if (platfrmCode)
									platfrms[i].deps[j] = platfrmCode;
								else if (suprlayCode)
									platfrms[i].deps[j] = suprlayCode;
							}
						}
						return callback(null, platfrms);
					} else return callback('Error getting codes', null);
				});
			}
		});
	} catch (err) {
		return callback(err, null);
	}
};
/**
 * [delAllPlatfrms description]
 *
 * @method delAllPlatfrms
 *
 * @param  {Function}     callback [description]
 *
 * @return {[type]}       [description]
 */
exports.delAllPlatfrms = function(callback) {
	'use strict';
	try {
		platfrmSrv.delAllPlatfrms(function(err, platfrms) {
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
 * [findPlatfrmById description]
 *
 * @method findPlatfrmById
 *
 * @param  {[type]}     _id       [description]
 * @param  {[type]}     callback  [description]
 *
 * @return {[type]}     [description]
 */
exports.findPlatfrmById = function(_id, callback) {
	'use strict';
	try {
		platfrmSrv.findPlatfrmById(_id, function(err_plat, res_plat) {
			if (err_plat) {
				return callback(err_plat, null);
			} else {
				loadCodes(function(err, res) {
					if (err) return callback(err, null);
					if (res) {
						for (var j = 0; j < res_plat.deps.length; j++) {
							var platfrmCode = mapPlatfrms[res_plat.deps[j]];
							var suprlayCode = mapSuprlays[res_plat.deps[j]];
							if (platfrmCode)
								res_plat.deps[j] = platfrmCode;
							else if (suprlayCode)
								res_plat.deps[j] = suprlayCode;
						}
						return callback(null, res_plat);
					} else return callback('Error getting codes', null);
				});
			}
		});
	} catch (err) {
		return callback(err, null);
	}
};
/**
 * [updatePlatfrmById description]
 *
 * @method updatePlatfrmById
 *
 *
 * @param  {[type]}     _platfrm_id         [description]
 * @param  {[type]}     code            [description]
 * @param  {[type]}     name            [description]
 * @param  {[type]}     logo            [description]
 * @param  {[type]}     deps            [description]
 * @param  {[type]}     order           [description]
 * @param  {Function}   callback        [description]
 *
 * @return {[type]}    [description]
 */
exports.updatePlatfrmById = function(_platfrm_id, code, name, logo, deps, order, callback) {
	'use strict';
	try {
		if (deps === undefined || deps === null) {
			deps = [];
		} else {
			deps = deps.split(',');
		}
		mapsCodes.existDeps(deps, function(err, exist) {
			if (err) return callback(err, null);
			if (!exist.valid)
				return callback('Dependencies id ' + exist._id + ' not found', null);
			else {
				var set_obj = {};
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
					set_obj.deps = deps;
				}
				if (typeof order != "undefined") {
					set_obj.order = order;
				}
				platfrmSrv.findPlatfrmById(_platfrm_id, function(err_platfrm, res_platfrm) {
					if (err_platfrm) {
						return callback(err_platfrm, null);
					}
					if (res_platfrm) {
						if (typeof set_obj.order != 'undefined' && set_obj.order > -1) {
							swapOrder('update', res_platfrm.order, set_obj.order, function(err_sld, res_sld) {
								if (err_sld) {
									return callback(err_sld, null);
								} else {
									platfrmSrv.updatePlatfrmById(_platfrm_id, set_obj, function(err, plat) {
										if (err) {
											return callback(err, null);
										}
										return callback(null, set_obj);
									});
								}
							});
						} else {
							platfrmSrv.updatePlatfrmById(_platfrm_id, set_obj, function(err_upd, res_upd) {
								if (err_upd) {
									return callback(err_upd, null);
								}
								return callback(null, set_obj);
							});
						}
					} else
						return callback('The platform does not exist', null);
				});
			}
		});

	} catch (err) {
		return callback(err, null);
	}
};
var updateDepsPlatfrmById = function(_platfrm_id, deps, callback) {
	'use strict';
	try {
		var set_obj = {};
		if (deps.length > 0) {
			set_obj.deps = deps;
		} else set_obj.deps = [];
		platfrmSrv.updatePlatfrmById(_platfrm_id, set_obj, function(err, plat) {
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
 * [updateDepsPlatfrmById description]
 * @param  {[type]}   _platfrm_id [description]
 * @param  {[type]}   deps        [description]
 * @param  {Function} callback    [description]
 * @return {[type]}               [description]
 */
exports.updateDepsPlatfrmById = function(_platfrm_id, deps, callback) {
	'use strict';
	try {
		updateDepsPlatfrmById(_platfrm_id, deps, function(err, plat) {
			if (err) {
				return callback(err, null);
			}
			return callback(null, plat);
		});
	} catch (err) {
		return callback(err, null);
	}
};
var updDeps = function(_id, callback) {
	try {
		platfrmSrv.findAllPlatfrms({}, {
			order: 1
		}, function(err, platfrms) {
			if (err) {
				return callback(err, null);
			} else {
				var foundDep = null;
				var loopSuprlay = function(i, suprlays) {
					if (i < suprlays.length) {
						foundDep = false;
						for (var j = 0; j < suprlays[i].deps.length; j++) {
							if (_id + '' === suprlays[i].deps[j] + '') {
								suprlays[i].deps.splice(j, 1);
								foundDep = true;
							}
						}
						if (foundDep)
							suprlayMod.updateDepsSuperlayById(suprlays[i]._id, suprlays[i].deps,
								function(err, res) {
									if (err) return callback(err, null);
									else {
										loopSuprlay(++i, suprlays);
									}
								});
						else loopSuprlay(++i, suprlays);
					} else return callback(null, true);
				};
				var loopPlatfrm = function(i) {
					if (i < platfrms.length) {
						foundDep = false;
						for (var j = 0; j < platfrms[i].deps.length; j++) {
							if (_id + '' === platfrms[i].deps[j] + '') {
								platfrms[i].deps.splice(j, 1);
								foundDep = true;
							}
						}
						if (foundDep)
							updateDepsPlatfrmById(platfrms[i]._id, platfrms[i].deps,
								function(err, res) {
									if (err) return callback(err, null);
									if (res) loopPlatfrm(++i);
								});
						else loopPlatfrm(++i);
					} else {
						suprlaySrv.findAllSuprlays(function(err, suprlays) {
							if (err) return callback(err, null);
							else {
								loopSuprlay(0, suprlays);
							}
						});

					}
				};
				loopPlatfrm(0);
			}
		});
	} catch (err) {
		return callback(err, null);
	}
};
/**
 * [updDeps description]
 * @param  {[type]}   _id      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.updDeps = function(_id, callback) {
	try {
		updDeps(_id, function(err, res_upd) {
			if (err) return callback(err, null);
			if (res_upd) return callback(null, res_upd);
		});
	} catch (err) {
		return callback(err, null);
	}
};
/**
 * [delPlatfrmById description]
 *
 * @method delPlatfrmById
 *
 * @param  {[type]}        _id      [description]
 * @param  {Function}      callback [description]
 *
 * @return {[type]}        [description]
 */
exports.delPlatfrmById = function(_id, callback) {
	'use strict';
	try {
		var delPlatfrm = function() {
			platfrmSrv.findPlatfrmById(_id, function(err_platfrm, res_platfrm) {
				if (err_platfrm) {
					return callback(err_platfrm, null);
				} else if (res_platfrm) {
					swapOrder('delete', res_platfrm.order, null, function(err_sld, res_sld) {
						if (err_sld) {
							return callback(err_sld, null);
						} else {
							platfrmSrv.delPlatfrmById(res_platfrm._id, function(err_del, res_del) {
								if (err_del) {
									return callback(err_del, null);
								}
								updDeps(res_platfrm._id, function(err, res_upd) {
									if (err) return callback(err, null);
									if (res_upd) {
										return callback(null, res_platfrm);
									}
								});

							});
						}
					});
				} else {
					return callback(null, null);
				}
				// ordering function
			});
		};
		compMod.findCompsByPlatfrmId(_id, function(err_comp, res_comps) {
			if (err_comp) {
				return callback(err_comp, null);
			}
			if (res_comps.length > 0) {
				var _comps = res_comps;
				var loopDelComps = function() {
					if (_comps.length <= 0) {
						delPlatfrm();
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
				delPlatfrm();
			}
		});
	} catch (err) {
		return callback(err, null);
	}
};