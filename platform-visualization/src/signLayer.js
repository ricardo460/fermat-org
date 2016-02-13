function SignLayer(){

	var objects = [],
		positions = {
            lastTarget : [],
            target : []
        },
        self = this;

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

        if(typeof TABLE[_group].x === 'undefined')
            TABLE[_group].x = x;

		var fillBox = function(ctx, image) {
            
            ctx.drawImage(image, 0, 0);
            
            //sign
            var size = 40;

                ctx.font = 'bold ' + size + 'px Arial';

            window.helper.drawText(titleSign, 50, 80, ctx, 700, size);
        };

        mesh = createBoxSignLayer(source, fillBox, 720, 140);
		mesh = self.setPositionSignLayer(mesh, x , y);
		window.scene.add(mesh);
	};

	/**
 	* @author Emmanuel Colina
 	* @param   {mesh} Mesh object
 	* @param   {x}   position X    
    * @param   {y}   position Y
 	* function set position Layer
 	*/

	this.setPositionSignLayer = function(mesh, x, y){

		var object, object2;

		mesh.position.x = Math.random() * 990000;
        mesh.position.y = Math.random() * 990000;
        mesh.position.z = 80000 * 2;
            
        mesh.position.copy(window.viewManager.translateToSection('table', mesh.position));
		objects.push(mesh);

		object2 = new THREE.Vector3();
		object2.x = mesh.position.x ;
		object2.y = mesh.position.y ;

		positions.lastTarget.push(object2);

		object = new THREE.Vector3();
		object.x = x - 500;
		object.y = y;

		positions.target.push(object);

		return mesh;
	};

	this.transformSignLayer = function(){
		
		var duration = 3000;

		for (var i = 0, l = objects.length; i < l; i++) {
            new TWEEN.Tween(objects[i].position)
            .to({
                x : positions.target[i].x,
                y : positions.target[i].y,
                z : positions.target[i].z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
	};

	this.letAloneSignLayer = function(){

		var duration = 3000;
            
        for (var i = 0, l = objects.length; i < l; i++) {
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
