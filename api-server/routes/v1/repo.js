/*global require*/
/*global module*/
var request = require('request');
var express = require('express');
var passport = require('passport');
var winston = require('winston');
var router = express.Router();
var repMod = require('../../modules/repository');
var Cache = require('../../lib/route-cache');
// creation of object cache
var cache = new Cache({
    type: 'file',
    time: 36000000
});


/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.post('/procs', function (req, res, next) {
    'use strict';
    try {
        repMod.addProc(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.get('/simple-procs', function (req, res, next) {
    'use strict';
    try {
        repMod.listProcs(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.post('/comps', function (req, res, next) {
    'use strict';
    try {
        repMod.addComp(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.get('/simple-comps', function (req, res, next) {
    'use strict';
    try {
        repMod.listComps(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.post('/layers', function (req, res, next) {
    'use strict';
    try {
        repMod.addLayer(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.get('/layers', function (req, res, next) {
    'use strict';
    try {
        repMod.listLayers(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.post('/suprlays', function (req, res, next) {
    'use strict';
    try {
        repMod.addSuprLay(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.get('/suprlays', function (req, res, next) {
    'use strict';
    try {
        repMod.listSuprLays(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.post('/platforms', function (req, res, next) {
    'use strict';
    try {
        repMod.addPlatform(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});


/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.post('/comps/:comp_id/life-cicles', function (req, res, next) {
    'use strict';
    try {
        repMod.addLifeCiclesToComp(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});


/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.post('/comps/:comp_id/comp-devs', function (req, res, next) {
    'use strict';
    try {
        repMod.addCompDev(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.post('/procs/:proc_id/steps', function (req, res, next) {
    'use strict';
    try {
        repMod.addStep(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.get('/procs/:proc_id', function (req, res, next) {
    'use strict';
    try {
        repMod.getProc(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                if(result) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({message:"NOT FOUND"});
                }
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.put('/procs/:proc_id', function (req, res, next) {
    'use strict';
    try {
        repMod.uptProc(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.delete('/procs/:proc_id', function (req, res, next) {
    'use strict';
    try {
        repMod.delProc(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(204)
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.get('/comps/:comp_id', function (req, res, next) {
    'use strict';
    try {
        repMod.getComp(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                if(result) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({message:"NOT FOUND"});
                }
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.put('/comps/:comp_id', function (req, res, next) {
    'use strict';
    try {
        repMod.uptComp(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.delete('/comps/:comp_id', function (req, res, next) {
    'use strict';
    try {
        repMod.delComp(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});


/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.get('/layers/:lay_id', function (req, res, next) {
    'use strict';
    try {
        repMod.getLay(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                if(result) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({message:"NOT FOUND"});
                }
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.put('/layers/:lay_id', function (req, res, next) {
    'use strict';
    try {
        repMod.uptLay(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.delete('/layers/:Lay_id', function (req, res, next) {
    'use strict';
    try {
        repMod.delLay(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.get('/suprlays/:sprly_id', function (req, res, next) {
    'use strict';
    try {
        repMod.getSprlay(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                if(result) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({message:"NOT FOUND"});
                }
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.put('/suprlays/:sprly_id', function (req, res, next) {
    'use strict';
    try {
        repMod.uptSprlay(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.delete('/suprlays/:sprly_id', function (req, res, next) {
    'use strict';
    try {
        repMod.delSprlay(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.get('/platforms/:pltf_id', function (req, res, next) {
    'use strict';
    try {
        repMod.getPltf(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                if(result) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({message:"NOT FOUND"});
                }
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.put('/platforms/:pltf_id', function (req, res, next) {
    'use strict';
    try {
        repMod.uptPltf(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.delete('/platforms/:pltf_id', function (req, res, next) {
    'use strict';
    try {
        repMod.delPltf(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @route
 *
 */
router.get('/comps/reload', function (req, res, next) {
    'use strict';
    try {
        repMod.updBook(req, function (error, result) {
            if (error) {
                //res.status(200).send(error);
                winston.log('error', 'Error: ', error);
            } else {
                repMod.loadComps(req, function (error, res) {
                    if (error) {
                        winston.log('error', 'Error: ', error);
                    } else {
                        repMod.updComps(req, function (error, result) {
                            if (error) {
                                winston.log('error', 'Error: ', error);
                                //res.status(200).send(error);
                            } else {
                                //res.status(200).send(result);
                                winston.log('info', 'Success updating');
                            }
                        });
                    }
                });
            }
        });
        res.status(200).send({
            'message': 'Updated Database'
        });
    } catch (err) {
        next(err);
    }
});
/**
 * Gets the access token and returns
 */
router.get('/accessToken', function (req, res, next) {
    'use strict';
    try {
        console.log("Get acces token");
        var code = req.query;
        var url = "https://github.com/login/oauth/access_token?client_id=6cac9cc2c2cb584c5bf4&client_secret=4887bbc58790c7a242a8dafcb035c0a01dc2a199&" +
            "code="+code['code'];
        request.get({
                url: url,
                headers: {
                    'Accept': 'application/json'
                }
            }, function (err, resp, body) {
                console.log("response: ");
                console.dir(body);
                res.status(200).send(body);
            });

    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @route
 *
 */
router.get('/comps', function (req, res, next) {
    'use strict';
    try {
        //passport.authenticate('bearer', function (err, access, scope) {
        //if (access) {
        // we search for body in cache
        var body = cache.getBody(req);
        if (body) {
            // we send it
            res.status(200).send(body);
            repMod.getComps(req, function (error, result) {
                if (error) {
                    winston.log('error', 'Error: ', error);
                } else {
                    // we save it
                    cache.setBody(req, result);
                }
            });
        } else {
            // we create it
            repMod.getComps(req, function (error, result) {
                if (error) {
                    res.status(200).send(error);
                } else {
                    // we save it
                    cache.setBody(req, result);
                    res.status(200).send(result);
                }
            });
        }
        //} else {
        //res.status(401).send(null);
        //}
        //})(req, res, next);
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @route
 *
 */
router.get('/devs', function (req, res, next) {
    'use strict';
    try {
        //passport.authenticate('bearer', function (err, access, scope) {
        //if (access) {
        // we search for body in cache
        var body = cache.getBody(req);
        if (body) {
            // we send it
            res.status(200).send(body);
            repMod.getDevs(req, function (error, result) {
                if (error) {
                    winston.log('error', 'Error: ', error);
                } else {
                    // we save it
                    cache.setBody(req, result);
                }
            });
        } else {
            // we create it
            repMod.getDevs(req, function (error, result) {
                if (error) {
                    res.status(200).send(error);
                } else {
                    // we save it
                    cache.setBody(req, result);
                    res.status(200).send(result);
                }
            });
        }
        //} else {
        //res.status(401).send(null);
        //}
        //})(req, res, next);
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.get('/procs', function (req, res, next) {
    'use strict';
    try {
        // we search for body in cache
        var body = cache.getBody(req);
        if (body) {
            // we send it
            res.status(200).send(body);
            repMod.getProcs(req, function (error, result) {
                if (error) {
                    winston.log('error', 'Error: ', error);
                } else {
                    // we save it
                    cache.setBody(req, result);
                }
            });
        } else {
            // we create it
            repMod.getProcs(req, function (error, result) {
                if (error) {
                    res.status(200).send(error);
                } else {
                    // we save it
                    cache.setBody(req, result);
                    res.status(200).send(result);
                }
            });
        }
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.get('/readme', function (req, res, next) {
    'use strict';
    try {
        repMod.getReadme(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @method
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.get('/book', function (req, res, next) {
    'use strict';
    try {
        repMod.getBook(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } catch (err) {
        next(err);
    }
});
/**
 * [description]
 *
 * @method
 *
 * @param  {:type book, readme, paper
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.get('/docs/:type', function (req, res, next) {
    'use strict';
    try {
        var type = req.param('type');
        var style = req.query.style;
        if (type !== 'book' && type !== 'readme' && type !== 'paper') {
            return res.status(422).send({
                message: 'Bad Parameters'
            });
        }
        if (typeof style != 'undefined' && style != 'big') {
            return res.status(422).send({
                message: 'Bad Parameters'
            });
        }
        repMod.getDocs(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {
                res.sendfile(result.pdfFile);
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * [description]
 *
 * @method
 *
 * @param  {:type book, readme, paper
 * @param  {[type]} res   [description]
 * @param  {[type]} next  [description]
 *
 * @return {[type]} [description]
 */
router.get('/manifest/check', function (req, res, next) {
    'use strict';
    try {

        // we create it
        repMod.checkManifest(req, function (error, result) {
            if (error) {
                res.status(200).send(error);
            } else {

                res.status(200).send(result);
            }
        });

    } catch (err) {
        next(err);
    }
});

module.exports = router;