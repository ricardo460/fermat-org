/*global require*/
/*global module*/
var express = require('express');
var router = express.Router();
var netMod = require('../../../modules/network');
var Cache = require('../../../lib/route-cache');
var security = require('../../../lib/utils/security');
// creation of object cache
var cache = new Cache({
	type: 'file',
	time: 36000000
});
/**
 * @api {get} /v1/net/servrs get server network
 * @apiName getServer
 * @apiVersion 0.0.1
 * @apiGroup Net
 * @apiDescription List servers connected to the P2P network fermat.
 */
router.get('/servrs', function (req, res, next) {
	'use strict';
	try {
		// we search for body in cache
		/*var body = cache.getBody(req);
		if (body) {
			// we send it
			res.status(200).send(body);
		} else {
			// we create it
			netMod.getServerNetwork(req, function (error, result) {
				if (error) {
					res.status(200).send(error);
				} else {
					if (result) {
						cache.setBody(req, result);
						res.status(200).send(result);
					} else {
						res.status(200).send({
							message: "NO WAVE YET"
						});
					}
				}
			});
		}*/
		netMod.getServer(req, function (error, result) {
			if (error) {
				res.status(200).send(error);
			} else {
				if (result) {
					res.status(200).send(result);
				} else {
					res.status(200).send(new Error('Invalid network data'));
				}
			}
		});
	} catch (err) {
		next(err);
	}
});
/**
 * @api {get} /v1/net/servrs/:serv_id/clients get server clients
 * @apiName getClients
 * @apiVersion 0.0.1
 * @apiGroup Net
 * @apiDescription List clients connected to a server.
 */
router.get('/servrs/:serv_id/clients', function (req, res, next) {
	'use strict';
	try {
		netMod.getClients(req, function (error, result) {
			if (error) {
				res.status(200).send(error);
			} else {
				if (result) {
					res.status(200).send(result);
				} else {
					res.status(200).send(new Error('Invalid server data'));
				}
			}
		});
	} catch (err) {
		next(err);
	}
});
/**
 * @api {get} /v1/net/servrs/:serv_id/actors get server actors
 * @apiName getActors
 * @apiVersion 0.0.1
 * @apiGroup Net
 * @apiDescription List actors connected to a server.
 */
router.get('/servrs/:serv_id/actors', function (req, res, next) {
	'use strict';
	try {
		netMod.getActors(req, function (error, result) {
			if (error) {
				res.status(200).send(error);
			} else {
				if (result) {
					res.status(200).send(result);
				} else {
					res.status(200).send(new Error('Invalid server data'));
				}
			}
		});
	} catch (err) {
		next(err);
	}
});
/**
 * @api {get} /v1/net/history get server network
 * @apiName getHistory
 * @apiVersion 0.0.1
 * @apiGroup Net
 * @apiDescription List servers connected to the P2P network fermat.
 */
router.get('/history', function (req, res, next) {
	'use strict';
	try {
		netMod.getHistory(req, function (error, result) {
			if (error) {
				res.status(200).send(error);
			} else {
				if (result) {
					res.status(200).send(result);
				} else {
					res.status(200).send(new Error('Invalid network data'));
				}
			}
		});
	} catch (err) {
		next(err);
	}
});
/**
 * @api {get} /v1/net/nodes/:hash/childrn get children
 * @apiName getChildren
 * @apiVersion 0.0.1
 * @apiGroup Net
 * @apiDescription Lists all devices connected to a P2P network node given its hash.
 * @apiParam {Hash} hash It represents the hash node.
 */
router.get('/nodes/:hash/childrn', function (req, res, next) {
	'use strict';
	try {
		// we search for body in cache
		var body = cache.getBody(req);
		if (body) {
			// we send it
			res.status(200).send(body);
		} else {
			// we create it
			netMod.getChildren(req, function (error, result) {
				if (error) {
					res.status(200).send(error);
				} else {
					// we save it
					if (result) {
						cache.setBody(req, result);
						res.status(200).send(result);
					} else {
						res.status(404).send({
							message: "NOT FOUND"
						});
					}
				}
			});
		}
	} catch (err) {
		next(err);
	}
});
/**
 * @api {post} /v1/net/waves create a wave
 * @apiName CreateWave
 * @apiVersion 0.0.1
 * @apiGroup Net
 * @apiDescription Inserts a wave (state of the network) into the database.
 * @apiParam {Object[]} body An array of javascript objects that represents the state of the network at the moment of the arrays creation
 * @apiParam {Object} object It represents a node or body[{Number} index].
 * @apiParam {String} object.hash It represents the id or hash of the node.
 * @apiParam {String} object.type It represents the node type (server, client, service, etc)
 * @apiParam {Object} object.extra Has any extra information that wants to be showed
 * @apiParam {ISODate} object.upd_at Last update
 * @apiParam {String[]} object.chldrn An array of the nodes hashes that are connected to this node
 */
router.post('/waves', function (req, res, next) {
	if (!security.isValidData(req.body.wave)) {
		res.status(412).send({
			"message": "missing or invalid data"
		});
	} else {
		netMod.addWave(req, function (error, result) {
			if (error) {
				res.status(200).send(error);
			} else {
				res.status(201).send(result);
			}
		});
	}
});
//
module.exports = router;