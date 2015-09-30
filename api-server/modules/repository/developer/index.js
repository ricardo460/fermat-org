var devSrv = require('./services/dev');
var DevMdl = require('./models/dev');

exports.insOrUpdDev = function(usrnm, email, name, bday, country, avatar_url, url, bio, callback) {
    //console.dir(arguments);
    devSrv.findDevByUsrnm(usrnm, function(err_dev, res_dev) {
        //console.dir(err_dev);
        //console.dir(res_dev);
        if (err_dev) {
            //console.log('step 1')
            return callback(err_dev, null);
        } else if (res_dev) {
            //console.log('step 2')
            //TODO: update
            var set_obj = {};
            if (email && email != res_dev.email) {
                set_obj.email = email;
                res_dev.email = email;
            }
            if (name && name != res_dev.name) {
                set_obj.name = name;
                res_dev.name = name;
            }
            if (bday && bday != res_dev.bday) {
                set_obj.bday = bday;
                res_dev.bday = bday;
            }
            if (country && country != res_dev.country) {
                set_obj.country = country;
                res_dev.country = country;
            }
            if (avatar_url && avatar_url != res_dev.avatar_url) {
                set_obj.avatar_url = avatar_url;
                res_dev.avatar_url = avatar_url;
            }
            if (url && url != res_dev.url) {
                set_obj.url = url;
                res_dev.url = url;
            }
            if (bio && bio != res_dev.bio) {
                set_obj.bio = bio;
                res_dev.bio = bio;
            }
            if (Object.keys(set_obj).length > 0) {
                devSrv.updateDevById(res_dev._id, set_obj, function(err_upd, res_upd) {
                    if (err_upd) return callback(err_upd, null);
                    else return callback(null, res_dev);
                });
            } else {
                return callback(null, res_dev);
            }
        } else {
            //console.log('step 3')
            //TODO: insert
            var dev = new DevMdl(usrnm, email, name, bday, country, avatar_url, url, bio);
            devSrv.insertDev(dev, function(err_ins, res_ins) {
                if (err_ins) return callback(err_ins, null);
                else return callback(null, res_ins);
            });
        }
    })
};

exports.getDevs = function(callback) {
    devSrv.findAllDevs({}, {}, function(err, devs) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, devs);
        }
    });
};