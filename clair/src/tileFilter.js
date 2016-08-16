function TileFilter() {

	var self = this;

	var LIST = null;

	var TABLE_R = null;

	this.properties = [];

	this.restartTable = function(){
		window.TABLE = TABLE_R;
		window.tileManager.updateElementsByGroup();
	};

	this.updateTable = function(){

		LIST = { 
			hide : []
		};

		var i, data, state, target, x, y;

		TABLE_R = window.TABLE;

		for(var group in window.TABLE){

            for(var layer in window.TABLE[group].layers){

                for(i = 0; i < window.TABLE[group].layers[layer].objects.length; i++){

                	data = window.TABLE[group].layers[layer].objects[i].data;

                	state = self.properties.find(function(x){
		                		if(data.type === x || data.code_level === x || data.difficulty === x)
		                			return x;
		            		});

                	if(state){ 

                		x = window.TABLE[group].x;
                		y = window.TABLE[group].layers[layer].y;	

	                	if(typeof LIST[group] === 'undefined'){
			                LIST[group] = {
			                	x : x,
			                    layers : {}
			                };
			            }

			            if(typeof LIST[group].layers[layer] === 'undefined'){
			                LIST[group].layers[layer] = {
			                	y : y,
			                    objects : []
			                };
			            }

			            target = newPosition(x, y, LIST[group].layers[layer].objects);

			            var id = group + '_' + layer + '_' + LIST[group].layers[layer].objects.length;

			            var mesh = window.TABLE[group].layers[layer].objects[i].mesh;

			            for(var l = 0; l < mesh.levels.length; l++)
                			mesh.levels[l].object.userData.id = id;

			            var object = {
			            		data : data,
			            		id : id,
			            		mesh : mesh,
			            		target : target
			            };

			            LIST[group].layers[layer].objects.push(object);
		            }
		            else{
		            	LIST.hide.push(window.TABLE[group].layers[layer].objects[i]);
		            }		   
                }
            }
        }

        showAllTiles();
	}

	function newPosition(xInit, yInit, array){
		
			var count = array.length;

            var lastObject = window.helper.getLastValueArray(array);

            x = 0;

            if(!lastObject)
                x = xInit;
            else
                x = lastObject.target.show.position.x + window.TILE_DIMENSION.width;

            return window.helper.fillTarget(x, yInit, 0, 'table');
	}

	function showAllTiles(){

		var i;

		window.signLayer.hideSignLayer(LIST);

		window.tilesQtty = [];

        for(var group in LIST){

        	if(group !== 'hide'){ 

	            for(var layer in LIST[group].layers){

	                for(i = 0; i < LIST[group].layers[layer].objects.length; i++){

	                	var tile = LIST[group].layers[layer].objects[i];

	            		target = tile.target.show;

	                	animate(tile.mesh, target, 500);
		            }
	            }
        	}
        	else{

        		for(i = 0; i < LIST[group].length; i++){

                	var tile = LIST[group][i];

            		target = tile.target.hide;

                	animate(tile.mesh, target, 500);
		        }

		        delete LIST[group];
        	}
        }

        window.TABLE = LIST;

        tileManager.updateElementsByGroup();
	}

	function animate(mesh, target, duration, callback){

        var _duration = duration || 2000,
            x = target.position.x,
            y = target.position.y,
            z = target.position.z,
            rx = target.rotation.x,
            ry = target.rotation.y,
            rz = target.rotation.z; 

        new TWEEN.Tween(mesh.position)
            .to({x : x, y : y, z : z}, _duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        new TWEEN.Tween(mesh.rotation)
            .to({x: rx, y: ry, z: rz}, _duration + 500)
            .easing(TWEEN.Easing.Exponential.InOut)
            .onComplete(function () {
                    if(typeof(callback) === 'function')
                        callback();   
                })
            .start();
    }
}