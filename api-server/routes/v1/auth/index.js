var express = require('express');
var router = express.Router();
var authMod = require('../../../modules/auth');
/**
 * Get autorization for use the api
 * @param  {[type]} req   [description]
 * @param  {[type]} resp  [description]
 * @param  {[type]} next) [description]
 * @return {[type]}       [description]
 */
router.get('/login', function (req, resp, next) {
    'use strict';
    try {
        console.log("Login...");
        var code = req.query.code;
        var api_key = req.query.api_key;
        var url = "https://github.com/login/oauth/access_token?client_id=6cac9cc2c2cb584c5bf4&client_secret=4887bbc58790c7a242a8dafcb035c0a01dc2a199&" + "code=" + code;
        authMod.login(url, api_key, function (err_auth, res_auth) {
            if (err_auth) {
                console.log("Error", err_auth);
                resp.status(200).send(err_auth);
            } else {
                console.log("Info", "Authorization granted");
                resp.status(200).send(res_auth);
            }
        });
    } catch (err) {
        console.error("Error", err);
        next(err);
    }
});
/**
 * [description]
 * @param  {[type]} req   [description]
 * @param  {[type]} resp  [description]
 * @param  {[type]} next) [description]
 * @return {[type]}       [description]
 */
router.get('/logout', function (req, resp, next) {
    'use strict';
    try {
        console.log("Logout...");
        var axs_key = req.query.axs_key;
        var api_key = req.query.api_key;
        authMod.logout(api_key, axs_key, function (err_logout, res_logout) {
            if (err_logout) {
                console.log("Error", err_logout);
                resp.status(200).send(err_logout);
            } else {
                console.log("Info", "Authorization granted");
                resp.status(200).send(res_logout);
            }
        });
    } catch (err) {
        console.error("Error", err);
        next(err);
    }
});
// router export
module.exports = router;