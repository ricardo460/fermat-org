function SignLayer(){

	var objects = [],
		positions = {
            lastTarget : [],
            target : []
        },
        self = this;

    this.getSignLayer = function(){
        return objects;
    };

    /**
     * Creates a flow box and when texture is loaded, calls fillBox
     * @param   {String}     src     The texture to load
     * @param   {Function}   fillBox Function to call after load, receives context and image
     * @returns {THREE.Mesh} The created plane with the drawed texture
     * @author Emmanuel Colina
     */

    function createBoxSignLayer(src, fillBox, width, height) {
        
        var canvas = document.createElement('canvas');
        canvas.height = height;
        canvas.width = width;
        var ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#000000'; 
        
        var image = document.createElement('img');
        var texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.LinearFilter;
        
        image.onload = function() {
            fillBox(ctx, image);
            texture.needsUpdate = true;
        };
        
        image.src = src;
        
        var mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(width, height),
            new THREE.MeshBasicMaterial({color : 0xFFFFFF, map : texture, transparent : true})
        );
        
        return mesh;
    }

    /**
 	* @author Emmanuel Colina
 	* @param   {x}                  position X    
    * @param   {y}                  position Y
    * @param   {titleSign} [string] sign layer     
 	* function create a Sign Layer
 	*/
	this.createSignLayer = function(x, y, titleSign, _group){
		var mesh;
		var source = "images/sign/sign.png";

        window.screenshotsAndroid.setGroup(_group, titleSign);

            if(typeof window.TABLE[_group].x === 'undefined')
                window.TABLE[_group].x = x;

		var fillBox = function(ctx, image) {
            
            ctx.drawImage(image, 0, 0);
            
            //sign
            var size = 40;

                ctx.font = 'bold ' + size + 'px Arial';

            window.helper.drawText(titleSign, 50, 80, ctx, 700, size);
        };

        mesh = createBoxSignLayer(source, fillBox, 720, 140);
        mesh.name = _group.concat(titleSign);
		mesh = self.setPositionSignLayer(mesh, x , y);
		window.scene.add(mesh);
	};

    /**
    * @author Isaias Taborda
    * @param   {_group}    [string] sign layer's group    
    * @param   {titleSign} [string] sign layer's name 
    * @returns {boolean}    
    * checks if a Sign Layer has been drawn
    */
    this.findSignLayer = function(group, titleSign){
        var objectsSize = objects.length;
        for(var i=0; i<objectsSize; i++) {
            if(objects[i].name === group.concat(titleSign))
                return true;
        }

        return false;
    };

    /**
    * @author Isaias Taborda
    * @param   {_group}    [string] sign layer's group    
    * @param   {titleSign} [string] sign layer's name     
    * function delete a Sign Layer
    */
    this.deleteSignLayer = function(_group, titleSign){
        var objectsSize = objects.length;
        var i = 0;
        var callback = function(pos) {
            window.scene.remove(objects[pos]);
            objects.splice(pos,1);
            positions.target.splice(pos,1);
            positions.lastTarget.splice(pos,1);
        };
        for(i = 0; i < objectsSize; i++) {
            if(objects[i].name === _group.concat(titleSign)) {
                self.removeSignLayer(i, callback);
                break;
            }
        }
    };

    this.hideSignLayer = function(list){

        var objectsSize = objects.length;

        var i = 0;

        for(i = 0; i < objectsSize; i++) {

            var group = objects[i].name.substr(0,3);
            var titleSign = objects[i].name.substr(3);
            
            if(typeof list[group] === 'undefined')
                self.removeSignLayer(i);
            else if(typeof list[group].layers[titleSign] === 'undefined')
                self.removeSignLayer(i);
        }
    };

    this.removeSignLayer = function(pos, callback){
        var duration = 3000;
        new TWEEN.Tween(objects[pos].position)
            .to({
                x : positions.lastTarget[pos].x,
                y : positions.lastTarget[pos].y,
                z : positions.lastTarget[pos].z
            },duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .onComplete(function () {
                    if(typeof(callback) === 'function')
                        callback(pos);   
                })
            .start();
    };

	/**
 	* @author Emmanuel Colina
 	* @param   {mesh} Mesh object
 	* @param   {x}   position X    
    * @param   {y}   position Y
 	* function set position Layer
 	*/

	this.setPositionSignLayer = function(mesh, x, y){

        var target = window.helper.fillTarget(x - 500, y, 0, 'table');

        mesh.position.copy(target.hide.position);

		objects.push(mesh);

		positions.lastTarget.push(target.hide.position);

		positions.target.push(target.show.position);

		return mesh;
	};

	this.transformSignLayer = function(){
		
		var duration = 3000;

		for(var i = 0, l = objects.length; i < l; i++) {

            var group = objects[i].name.substr(0,3);
            var titleSign = objects[i].name.substr(3);
            
            if(typeof window.TABLE[group] !== 'undefined'){
                if(typeof window.TABLE[group].layers[titleSign] !== 'undefined'){

                    new TWEEN.Tween(objects[i].position)
                    .to({
                        x : positions.target[i].x,
                        y : positions.target[i].y,
                        z : positions.target[i].z
                    }, Math.random() * duration + duration)
                    .easing(TWEEN.Easing.Exponential.InOut)
                    .start();
                }
            }
        }
	};

	this.letAloneSignLayer = function(){

		var duration = 3000;
            
        for(var i = 0, l = objects.length; i < l; i++) {
        	new TWEEN.Tween(objects[i].position)
            .to({
                x : positions.lastTarget[i].x,
                y : positions.lastTarget[i].y,
                z : positions.lastTarget[i].z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
	};
}
