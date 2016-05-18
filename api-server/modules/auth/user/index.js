var mongoose = require('mongoose');
var devMod = require('../../repository/developer');
var usrSrv = require('./services/usr');
var UsrMdl = require('./models/usr');
var DevMdl = require('../../repository/developer/models/dev');
var UsrPermMdl = require('./models/usrPerm');
/**
 * [insOrUpdUsr description]
 * @param  {[type]}   usrnm      [description]
 * @param  {[type]}   email      [description]
 * @param  {[type]}   name       [description]
 * @param  {[type]}   bday       [description]
 * @param  {[type]}   location    [description]
 * @param  {[type]}   avatar_url [description]
 * @param  {[type]}   github_tkn [description]
 * @param  {[type]}   url        [description]
 * @param  {[type]}   bio        [description]
 * @param  {Function} callback   [description]
 * @return {[type]}              [description]
 */
exports.insOrUpdUsr = function(usrnm, email, name, bday, location, avatar_url, github_tkn, url, bio, perm, callback) {
	'use strict';
	try {
		usrSrv.findUsrByUsrnm(usrnm, function(err_usr, res_usr) {
			if (err_usr) {
				return callback(err_usr, null);
			}
			if (res_usr) {
				devMod.insOrUpdDev(usrnm, email, name, bday, location, avatar_url, url, bio, function(err, res) {
					if (err) {
						return callback(err, null);
					}
					console.log("Developer updated");
				});
				var set_obj = {};
				if (email && email !== res_usr.email) {
					set_obj.email = email;
					res_usr.email = email;
				}
				if (name && name !== res_usr.name) {
					set_obj.name = name;
					res_usr.name = name;
				}
				if (avatar_url && avatar_url !== res_usr.avatar_url) {
					set_obj.avatar_url = avatar_url;
					res_usr.avatar_url = avatar_url;
				}
				if (github_tkn && github_tkn !== res_usr.github_tkn) {
					set_obj.github_tkn = github_tkn;
					res_usr.github_tkn = github_tkn;
				}
				if (Object.keys(set_obj).length > 0) {
					usrSrv.updateUsrById(res_usr._id, set_obj, function(err_upd, res_upd) {
						if (err_upd) {
							return callback(err_upd, null);
						}
						return callback(null, res_usr);
					});
				} else {
					return callback(null, res_usr);
				}
			} else {
				var dev = new DevMdl(usrnm, email, name, bday, location, avatar_url, url, bio);
				var usr = new UsrMdl(usrnm, email, name, avatar_url, github_tkn, perm);
				usrSrv.insertUsrAndDev(usr, dev, function(err_ins, res_ins) {
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
 * [getUsrs description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.getUsrs = function(callback) {
	'use strict';
	try {
		usrSrv.findAllUsrs({}, {}, function(err, usrs) {
			if (err) {
				return callback(err, null);
			}
			return callback(null, usrs);
		});
	} catch (err) {
		return callback(err, null);
	}
};
/**
 * [getUsrsByEmail description]
 * @param  {[type]}   email    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.getUsrsByEmail = function(email, callback) {
	'use strict';
	try {
		usrSrv.findUsrByEmail(email, function(err, usr) {
			if (err) {
				return callback(err, null);
			}
			return callback(null, usr);
		});
	} catch (err) {
		return callback(err, null);
	}
};
/**
 * [getUsrsByUsrnm description]
 * @param  {[type]}   usrnm    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.getUsrsByUsrnm = function(usrnm, callback) {
	'use strict';
	try {
		usrSrv.findUsrByUsrnm(usrnm, function(err, usr) {
			if (err) {
				return callback(err, null);
			}
			return callback(null, usr);
		});
	} catch (err) {
		return callback(err, null);
	}
};
/**
 * [getUsrsById description]
 * @param  {[type]}   _id      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.getUsrsById = function(_id, callback) {
	'use strict';
	try {
		usrSrv.findUsrById(_id, function(err, usr) {
			if (err) {
				return callback(err, null);
			}
			return callback(null, usr);
		});
	} catch (err) {
		return callback(err, null);
	}
};
/**
 * [delAllUsrs description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.delAllUsrs = function(callback) {
	'use strict';
	try {
		usrSrv.delAllUsrs(function(err, usr) {
			if (err) {
				return callback(err, null);
			}
			return callback(null, true);
		});
	} catch (err) {
		return callback(err, null);
	}
};
var saveUsrAssingPerm = function(_mastr_id, _grantd_id, callback) {
	'use strict';
	try {
		console.log("searching granted_id: " + _grantd_id);
		usrSrv.findUsrPerm(_grantd_id, function(err, user_perm) {
			if (err) return callback(err, null);
			if (user_perm) {
				console.log("match proceded update");
				var set_obj = {};
				set_obj.upd_at = new mongoose.Types.ObjectId();
				set_obj._mastr_id = _mastr_id;
				user_perm.upd_at = set_obj.upd_at;
				usrSrv.updateUsrPerm(_grantd_id, set_obj, function(err, res_upd) {
					if (err) return callback(err, null);
					if (res_upd) return callback(null, user_perm);
				});
			} else {
				console.log("not match");
				var usrPerm = new UsrPermMdl(_mastr_id, _grantd_id);
				usrSrv.insertUsrPerm(usrPerm, function(err, res) {
					if (err) return callback(err, null);
					if (res) return callback(null, res);
				});
			}
		});
	} catch (err) {
		return callback(err, null);
	}
};
var getNewPerm = function(mast_usr_perm, old_usr_perm, new_usr_perm) {
	'use strict';
	var newPermMod = "";
	var mast_perm = 0;
	var old_perm = 0;
	var new_perm = 0;
	for (var i = 0; i < mast_usr_perm.length; i++) {
		mast_perm = parseInt(mast_usr_perm.charAt(i));
		old_perm = parseInt(old_usr_perm.charAt(i));
		new_perm = parseInt(new_usr_perm.charAt(i));
		if (mast_perm >= old_perm)
			if (mast_perm >= new_perm)
				newPermMod = newPermMod + new_usr_perm.charAt(i);
			else
				newPermMod = newPermMod + old_usr_perm.charAt(i);
		else
			newPermMod = newPermMod + old_usr_perm.charAt(i);
	}
	return newPermMod;
};
var haveGreaterPerm = function(_master_usr_id, usrnm, new_perm, callback) {
	'use strict';
	var mastUsrPer = null,
		oldUsrPerm = null,
		mastUsrType = null,
		grntdUsrType = null;
	try {
		usrSrv.findUsrById(_master_usr_id, function(err, mast_usr) {
			if (err) return callback(err, null);
			if (mast_usr) {
				mastUsrPer = mast_usr.perm;
				mastUsrType = mast_usr.type;
				usrSrv.findUsrByUsrnm(usrnm, function(err, grntd_usr) {
					if (err) return callback(err, null);
					if (grntd_usr) {
						oldUsrPerm = grntd_usr.perm;
						grntdUsrType = grntd_usr.type;
						if (mastUsrType.match(grntdUsrType)) {
							new_perm = getNewPerm(mastUsrPer, oldUsrPerm, new_perm);
							if (oldUsrPerm.match(new_perm))
								return callback(null, null);
							return callback(null, new_perm);
						} else return callback(null, null);
					}
				});
			}
		});
	} catch (err) {
		return callback(err, null);
	}
};
/**
 * [changePermission description]
 * @param  {[type]}   usrnm    [description]
 * @param  {[type]}   perm     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.changePermission = function(_master_usr_id, usrnm, perm, callback) {
	'use strict';
	try {
		if (perm !== undefined || perm !== null)
			usrSrv.findUsrByUsrnm(usrnm, function(err, usr) {
				if (err) {
					console.log(err, " :User not found");
					return callback(err, null);
				}
				if (usr) {
					var set_obj = {};
					haveGreaterPerm(_master_usr_id, usrnm, perm, function(err, nw_perm) {
						if (err) {
							console.log(err, " :Permission not granted");
							return callback(err, null);
						}
						if (nw_perm) {
							set_obj.perm = nw_perm;
							usr.perm = nw_perm;
							usrSrv.updateUsrById(usr._id, set_obj, function(err_upd, res_upd) {
								if (err_upd) {
									console.log(err_upd, " :User error not updated");
									return callback(err_upd, null);
								}
								if (res_upd) {
									console.log("Response: ", res_upd);
									saveUsrAssingPerm(_master_usr_id, usr._id, function(err, res) {
										if (err) {
											console.log(err + ": Error saving the user that assign permission");
											return callback(err, null);
										}
										if (res) {
											console.log("Saving the user that assign permission");
											return callback(null, usr);
										}
									});
								}
							});
						} else
							return callback(null, usr);
					});
				}
			});
		else return callback("Error perm undefined", null);
	} catch (err) {
		console.log(err, " :User error not updated");
		return callback(err, null);
	}
};
/**
 * [assignTypeUser description]
 * @param  {[type]}   _id      [description]
 * @param  {[type]}   type     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.assignTypeUser = function(_id, type, callback) {
	'use strict';
	try {
		var set_obj = {};
		usrSrv.findUsrById(_id, function(err, usr) {
			if (err) {
				console.log(err, " :User not found");
				return callback(err, null);
			}
			if (usr) {
				set_obj.type = type;
				usr.type = type;
				usrSrv.updateUsrById(_id, set_obj, function(err, res) {
					if (err) {
						console.log(err, " :Type user no assigned");
						return callback(err, null);
					}
					if (res) {
						return callback(null, usr);
					}
				});
			}
		});
	} catch (err) {
		console.log(err, " :User error not updated");
		return callback(err, null);
	}
};