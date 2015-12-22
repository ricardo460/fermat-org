var faker = require('faker');
var mongoose = require('mongoose');
var db = require('../../db');
var modWav = require('../../modules/network/wave')
var servWave = require('../../modules/network/wave/services/wave')
var modLink = require('../../modules/network/link')
var servLink = require('../../modules/network/link/services/link')
var modNode = require('../../modules/network/node')
var servNode = require('../../modules/network/node/services/nod')


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
	var waves = [];
	for(var i= 0; i<10; i++){
		modWav.insertWave(faker.lorem.sentence(),function(err, result){
			if(err){
				console.log("Error insert Wave");
			}
			else{
				waves.push(result);
			}
		});
	}
}