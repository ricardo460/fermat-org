var compSrv = require('./services/comp');
var CompMdl = require('./models/comp');
var loadLib = require('./lib/loader');

exports.getComps = function(callback) {
    compSrv.findAllComps({}, {}, function(err, comps) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, comps);
        }
    });
};

var loadComps = function() {
    loadLib.loadComps(function(err, res) {
        if (err) console.dir(err);
        else {
            //console.log(JSON.stringify(res, null, 2));
        	//console.dir(res);
        }
    });
};

loadComps();