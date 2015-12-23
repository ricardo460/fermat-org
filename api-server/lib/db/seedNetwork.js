var faker = require('faker');
var mongoose = require('mongoose');
var crypto = require('crypto');
var db = require('../../db');
var modWav = require('../../modules/network/wave')
var servWave = require('../../modules/network/wave/services/wave')
var modLink = require('../../modules/network/link')
var servLink = require('../../modules/network/link/services/link')
var modNode = require('../../modules/network/node')
var servNode = require('../../modules/network/node/services/nod')
var waves = [];
var linuxTypeServer = "linux";
var nodeTypeServer = "server"; 

/* Clear db */
servWave.delAllWaves(function(){
	console.log(arguments)
	console.log("Delete all waves");
	servLink.delAllLinks(function(){
		console.log("Delete all links");
		servNode.delAllNods(function(){
			console.log("Delete all nodes");
			loadWaves();
		});
	});
});

var loadWaves = function(){
	
	
	modWav.insertWave(faker.lorem.sentence(),function(err, res){
		if(err){
			console.log("Error insert Wave");
		}
		else{
			console.log("insert waves");
			console.log(res);
			var hash = crypto.createHash('md5').update(faker.name.firstName()).digest('hex');

			modNode.insertNod(res._id, hash, "server", "linux");

		}
	});
	
}