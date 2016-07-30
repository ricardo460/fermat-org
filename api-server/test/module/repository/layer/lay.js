var repMod = require('../../../../modules/repository/layer');
var mongoose = require('mongoose');
console.log('info', 'Starting database connexion');
var db = require('../../../../db');
console.log("Get layers by super layers");
repMod.getLayersBySuprLays('ADD', function (err, res) {
	if (err) return 'error';
	if (res) console.log(res);
});
