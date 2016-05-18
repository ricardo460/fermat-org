var express = require('express');
var router = express.Router();
var usrMod = require('../../../modules/auth/user');
var security = require('../../../lib/utils/security');
/**
 * @api {post} /v1/user/:usr_id/changePerms change user permission
 * @apiName ChangePermission
 * @apiVersion 1.0.0
 * @apiGroup User
 * @apiParam {String} usrnm User name.
 * @apiParam {String} perm User permission.
 * @apiParam {ObjectId} usr_id Id of the user who granted permission.
 * @apiDescription Give permissions to another user.
 */
router.post('/:usr_id/changePerms', function(req, resp, next) {
    try {
        if (!security.isValidPerm(req.body.perm)) {
            resp.status(412).send({
                "message": "missing or invalid data"
            });
        } else {
            console.log("Updating permission to user " + req.body.usrnm);
            console.log("Assigning permission: " + req.body.perm);
            usrMod.changePermission(req.params.usr_id, req.body.usrnm, req.body.perm, function(err, res) {
                if (err) {
                    console.log("Error change permission", err);
                    resp.status(402).send(err + " :Could not change the permission");
                } else {
                    console.log("Info", "Permission successfully changed");
                    resp.status(200).send(res);
                }
            });
        }
    } catch (err) {
        console.error("Error", err);
    }
});
/**
 * @api {get} /v1/user/:usrnm get user by username
 * @apiName GetUsrsByUsrnm
 * @apiVersion 1.0.0
 * @apiGroup User
 * @apiParam {String} usrnm User name of the user who granted permission.
 * @apiDescription Get user data by usrnm.
 */
router.get('/:usrnm', function(req, resp, next) {
    try {
        if (!security.isValidData(req.params.usrnm)) {
            resp.status(412).send({
                "message": "missing or invalid data"
            });
        } else {
            usrMod.getUsrsByUsrnm(req.params.usrnm, function(err, res) {
                if (err) {
                    console.log("Error getting user", err);
                    resp.status(402).send("Could not get user");
                } else {
                    console.log("Info", "Userss successfully obtained");
                    resp.status(200).send(res);
                }
            });
        }
    } catch (err) {
        console.error("Error", err);
    }
});
/**
 * @api {get} /v1/user/list/users get user list
 * @apiName GetUsrs
 * @apiVersion 1.0.0
 * @apiGroup User
 * @apiDescription Get users list.
 */
router.get('/list/users', function(req, resp, next) {
    try {
        usrMod.getUsrs(function(err, res) {
            if (err) {
                console.log("Error getting users", err);
                resp.status(402).send("Could not get user list");
            } 
            if(res) {
                console.log("Info", "User list successfully obtained");
                resp.status(200).send(res);
            }
        });
    } catch (err) {
        console.error("Error", err);
    }
});

/**
 * @api {post} /v1/user/assignTypeUser assign user type
 * @apiName AssignTypeUser
 * @apiVersion 1.0.0
 * @apiGroup User
 * @apiParam {String} user_id User id.
 * @apiParam {String} type User type (Ex. Developer, Designer).
 * @apiDescription assign user type.
 */
router.post('/assignTypeUser', function(req, resp, next) {
    try {
        if (!security.isObjectID(req.body.user_id) ||
            !security.isValidData(req.body.type)) {
            resp.status(412).send({
                "message": "missing or invalid data"
            });
        } else {
            usrMod.assignTypeUser(req.body.user_id, req.body.type, function(err, res) {
                if (err) {
                    console.log("Error to assign user type", err);
                    resp.status(402).send("Could not assign user type");
                } else {
                    console.log("Info", "user type assigned successfully");
                    resp.status(200).send(res);
                }
            });
        }
    } catch (err) {
        console.error("Error", err);
    }
});
// router export
module.exports = router;