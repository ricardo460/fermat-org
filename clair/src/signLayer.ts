class SignLayer{

	objects = [];
	positions = {
        lastTarget : [],
        target : []
    };

    /**
     * Creates a flow box and when texture is loaded, calls fillBox
     * @param   {String}     src     The texture to load
     * @param   {Function}   fillBox Function to call after load, receives context and image
     * @returns {THREE.Mesh} The created plane with the drawed texture
     * @author Emmanuel Colina
     */

    createBoxSignLayer(src, fillBox, width, height) {
        
        let canvas = document.createElement('canvas');
        canvas.height = height;
        canvas.width = width;
        let ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#000000'; 
        
        let image = document.createElement('img');
        let texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.LinearFilter;
        
        image.onload = function() {
            fillBox(ctx, image);
            texture.needsUpdate = true;
        };
        
        image.src = src;
        
        let mesh = new THREE.Mesh(
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
	createSignLayer(x, y, titleSign, _group){
		let mesh;
		let source = "images/sign/sign.png";

        globals.screenshotsAndroid.setGroup(_group, titleSign);

            if(typeof globals.TABLE[_group].x === 'undefined')
                globals.TABLE[_group].x = x;

		let fillBox = function(ctx, image) {
            
            ctx.drawImage(image, 0, 0);
            
            //sign
            let size = 40;

                ctx.font = 'bold ' + size + 'px Arial';

             Helper.drawText(titleSign, 50, 80, ctx, 700, size);
        };

        mesh = this.createBoxSignLayer(source, fillBox, 720, 140);
        mesh.name = _group.concat(titleSign);
		mesh = this.setPositionSignLayer(mesh, x , y);
		globals.scene.add(mesh);
	};

    /**
    * @author Isaias Taborda
    * @param   {_group}    [string] sign layer's group    
    * @param   {titleSign} [string] sign layer's name 
    * @returns {boolean}    
    * checks if a Sign Layer has been drawn
    */
    findSignLayer(group, titleSign){
        let objectsSize = this.objects.length;
        for(let i=0; i<objectsSize; i++) {
            if(this.objects[i].name === group.concat(titleSign))
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
    deleteSignLayer(_group, titleSign){
        let objectsSize = this.objects.length;
        let i = 0;
        let callback = function(pos) {
            globals.scene.remove(this.objects[pos]);
            this.objects.splice(pos,1);
            this.positions.target.splice(pos,1);
            this.positions.lastTarget.splice(pos,1);
        };
        for(i = 0; i < objectsSize; i++) {
            if(this.objects[i].name === _group.concat(titleSign)) {
                this.removeSignLayer(i, callback);
                break;
            }
        }
    };

    removeSignLayer(pos, callback){
        let duration = 3000;
        new TWEEN.Tween(this.objects[pos].position)
            .to({
                x : this.positions.lastTarget[pos].x,
                y : this.positions.lastTarget[pos].y,
                z : this.positions.lastTarget[pos].z
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

	setPositionSignLayer(mesh, x, y){

        let target =  Helper.fillTarget(x - 500, y, 0, 'table');

        mesh.position.copy(target.hide.position);

		this.objects.push(mesh);

		this.positions.lastTarget.push(target.hide.position);

		this.positions.target.push(target.show.position);

		return mesh;
	};

	transformSignLayer(){
		
		let duration = 3000;

		for(let i = 0, l = this.objects.length; i < l; i++) {
            new TWEEN.Tween(this.objects[i].position)
            .to({
                x : this.positions.target[i].x,
                y : this.positions.target[i].y,
                z : this.positions.target[i].z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
	};

	letAloneSignLayer(){

		let duration = 3000;
            
        for(let i = 0, l = this.objects.length; i < l; i++) {
        	new TWEEN.Tween(this.objects[i].position)
            .to({
                x : this.positions.lastTarget[i].x,
                y : this.positions.lastTarget[i].y,
                z : this.positions.lastTarget[i].z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
	};
}
