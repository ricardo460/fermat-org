var dateLib = require('./libs/date');
var lockSrv = require('./services/lock');
var LockMdl = require('./models/lock');
var LOCK_TIME = 300000;
/**
 * [insOrUpdLock description]
 *
 * @method insOrUpdLock
 *
 * @param  {[type]}     _usr_id   [description]
 * @param  {[type]}     _item_id  [description]
 * @param  {[type]}     item_type [description]
 * @param  {[type]}     priority  [description]
 * @param  {Function}   callback  [description]
 *
 * @return {[type]}     [description]
 */
exports.insOrUpdLock = function (_usr_id, _item_id, item_type, priority, callback) {
	try {
		console.log('0');
		lockSrv.findLockByUsrIdAndItemId(_usr_id, _item_id, function (err_lock, res_lock) {
			console.log('1');
			if (err_lock) {
				console.log('2');
				return callback(err_lock, null);
			}
			if (res_lock) {
				console.log('3');
				var set_obj = {};
				if (item_type && item_type !== res_lock.item_type) {
					set_obj.item_type = item_type;
					res_lock.item_type = item_type;
				}
				if (priority > -1 && priority !== res_lock.priority) {
					set_obj.priority = priority;
					res_lock.priority = priority;
				}
				lockSrv.updateLockById(res_lock._id, set_obj, function (err_upd, res_upd) {
					console.log('4');
					if (err_upd) {
						return callback(err_upd, null);
					}
					return callback(null, res_lock);
				});
			} else {
				console.log('5');
				lockSrv.findLockByItemId(_item_id, function (err_itm, res_itm) {
					console.log('6');
					if (err_lock) {
						console.log('7');
						return callback(err_lock, null);
					}
					if (res_itm) {
						if (!dateLib.isDiffGr(res_itm.upd_at, LOCK_TIME)) {
							console.log('8');
							return callback(new Error('item is locked'), null);
						} else {
							lockSrv.delLockById(res_itm._id, function (err_del, res_del) {
								console.log('9');
								if (err_del) {
									console.log('10');
									return callback(err_del, null);
								} else if (_usr_id && _item_id && item_type) {
									console.log('11');
									var lock = new LockMdl(_usr_id, _item_id, item_type, priority || 9);
									lockSrv.insertLock(lock, function (err_ins, res_ins) {
										console.log('12');
										if (err_ins) {
											return callback(err_ins, null);
										}
										return callback(null, res_ins);
									});
								} else {
									console.log('13');
									return callback(new Error('no valid parameters'), null);
								}
							});
						}
					} else {
						var lock = new LockMdl(_usr_id, _item_id, item_type, priority || 9);
						lockSrv.insertLock(lock, function (err_ins, res_ins) {
							console.log('15');
							if (err_ins) {
								return callback(err_ins, null);
							}
							return callback(null, res_ins);
						});
					}
				});
			}
		});
	} catch (err) {
		return callback(err, null);
	}
};
/**
 * [delLock description]
 *
 * @method delLock
 *
 * @param  {[type]}   _usr_id  [description]
 * @param  {[type]}   _item_id [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}   [description]
 */
exports.delLock = function (_usr_id, _item_id, callback) {
	try {
		lockSrv.delLockByUsrIdAndItemId(_usr_id, _item_id, function (err_del, res_del) {
			if (err_del) {
				return callback(err_del, null);
			}
			return callback(null, res_del);
		});
	} catch (err) {
		return callback(err, null);
	}
};