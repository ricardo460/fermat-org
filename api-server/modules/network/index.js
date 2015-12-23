var linkMod = require('./link');
var nodeMod = require('./node');
var waveMod = require('./wave');

exports.getServerNetwork = function (req, next) {
	'use strict';
	try {
		waveMod.findLastWave(function (err_wav, res_wav) {
			if (err_wav) {
				next(err_wav, null);
			} else {
				//TODO: get hashes
				nodeMod.findNodsByWaveIdAndType(res_wav._id, 'server', function (err_nods, res_nods) {
					if (err_nods) {
						next(err_nods, null);
					} else {
						var res_obj = [];
						var loopNods = function (i) {
							if (i < res_nods.length) {
								//TODO: search links
								var parent = res_nods[i];
								linkMod.findChildren(res_wav._id, parent._id, function (err_chldrn, res_chldrn) {
									if (err_chldrn) {
										res_obj.push(parent);
										loopNods(++i);
									} else {
										var children = [];
										var loopChldrn = function (j) {
											var link = res_chldrn[j];
											if (j < res_chldrn.length) {
												//TODO: finde node
												nodeMod.findNodById(link._chld_nod_id, function (err_chld, res_chld) {
													if (err_chld) {
														loopChldrn(++j);
													} else {
														children.push(res_chld);
														loopChldrn(++j);
													}
												});
											} else {
												parent.children = children;
												res_obj.push(parent);
												loopNods(++i);
											}
										};
										if (res_chldrn && Array.isArray(res_chldrn)) {
											loopChldrn(0);
										} else {
											parent.children = children;
											res_obj.push(parent);
											loopNods(++i);
										}
									}
								});
							} else {
								next(null, res_obj);
							}
						};
						if (res_nods && Array.isArray(res_nods)) {
							loopNods(0);
						} else {
							next(null, res_obj);
						}
					}
				});
			}
		});
	} catch (err) {
		next(err, null);
	}
};

exports.getChildren = function (req, next) {
	'use strict';
	try {
		waveMod.findLastWave(function (err_wav, res_wav) {
			console.log(res_wav);
			if (err_wav) {
				next(err_wav, null);
			} else if(res_wav.length > 0) {

				nodeMod.findNodsByWaveIdAndHash(res_wav._id, req.query.hash, function (err_nods, res_nods) {
					if (err_nods) {
						next(err_nods, null);
					} else {
						if (res_nods && Array.isArray(res_nods)) {
							var parent = res_nods[0];
							linkMod.findChildren(res_wav._id, parent._id, function (err_chldrn, res_chldrn) {
								if (err_chldrn) {
									parent.children = [];
									next(null, parent);
								} else {
									var children = [];
									var loopChldrn = function (j) {
										var link = res_chldrn[j];
										if (j < res_chldrn.length) {
											nodeMod.findNodById(link._chld_nod_id, function (err_chld, res_chld) {
												if (err_chld) {
													loopChldrn(++j);
												} else {
													children.push(res_chld);
													loopChldrn(++j);
												}
											});
										} else {
											parent.children = children;
											next(null, parent);
										}
									};
									if (res_chldrn && Array.isArray(res_chldrn)) {
										loopChldrn(0);
									} else {
										parent.children = children;
										next(null, parent);
									}
								}
							});
						} else {
							next(null, {});
						}
					}
				});
			} else {
				next(null, {});
			}
		});
	} catch (err) {
		next(err, null);
	}
};

/*jshint +W069 */