var config = require('../../../config');
var express = require('express');
var router = express.Router();
var security = require('../../../lib/utils/security');
var request = require('request');

var githubAPI = "https://api.github.com/repos/" + config.issues.repo + "/issues";

function getBody(obj) {
    var result = "## Stack trace:\n";
    result += "~~~\n" + obj.stack + "\n~~~\n";
    result += '\n\n';

    result += "## Environment: " + obj.env + "\n\n";
    result += "## Variables:\n";

    result += "~~~\n" + JSON.stringify(obj.variables, null, 2) + '\n~~~\n\n';

    return result;
}

function createIfDontExists(obj, res, callback) {
    request.get(githubAPI, {
        headers: {
            'User-Agent': 'request'
        }
    }, function(err, rep, body) {
        if (err) {
            callback(true);
        } else {
            var found = false,
                issues = JSON.parse(body),
                title = obj.message;

            for (issue of issues) {
                found = found || (issue.title === title);
            }

            if (!found) {
                callback(false);
                return;
            } else {
                res.status(200).send();
            }
        }
    });
}

/**
 * @api {post} /v1/issues/report create new issue
 * @apiVersion 0.0.1
 * @apiName CreateIssue
 * @apiGroup Issues
 * @apiParam {String} stack The stack trace
 * @apiParam {String} env The environment
 * @apiParam {Object} variables The object variables
 * @apiDescription Creates a new issue. All the parameters must be enclosed in a json string.
 */
router.post('/report', function(req, res, next) {
    try {
        if (!security.isValidData(req.body.json)) {
            res.status(412).send({
                "message": "missing or invalid data"
            });
        } else {
            var obj = JSON.parse(req.body.json);
            if (!security.isValidData(obj.stack) ||
                !security.isValidData(obj.env) ||
                !security.isValidData(obj.variables) ||
                !security.isValidData(obj.message)) {
                res.status(412).send({
                    "message": "missing or invalid data"
                });
                return;
            }

            var authTok = 'Basic ' + new Buffer(config.issues.username + ":" +
                config.issues.password).toString("base64");

            createIfDontExists(obj, res, function(err) {
                if (!err) {
                    request.post(githubAPI, {
                        headers: {
                            'Authorization': authTok,
                            'User-Agent': 'request',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            title: obj.message,
                            body: getBody(obj)
                        })
                    }, function(err, resp, body) {
                        if (!err) {
                            res.status(200).send();
                        } else {
                            res.status(500).send();
                        }
                    });
                } else {
                    res.status(500).send();
                }
            })
        }
    } catch (err) {
        next(err);
    }
});

module.exports = router;
