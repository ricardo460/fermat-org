function Developer (){

	var objectsDeveloper = [];
	var developerLink = [];
	var developerAuthor = [];
	var developerAuthorRealName = [];
	var developerAuthorEmail = [];
	var self = this;
	var position = {
		target : [],
		lastTarget : []
	};

	var onClick = function(target) {
        if(window.actualView === 'developers')
            onElementClickDeveloper(target.userData.id, objectsDeveloper);
    };

    function onElementClickDeveloper(id, objectsDevelopers){

        var duration = 1000;

        if(camera.getFocus() == null){
            var camTarget = objectsDevelopers[id].clone();

            window.camera.setFocus(camTarget, new THREE.Vector4(0, 0, 1000, 1), duration);

            for (var i = 0; i < objectsDevelopers.length ; i++) {
                if(id !== i)
                    letAloneDeveloper(objectsDevelopers[i]);
            }

            helper.showBackButton();
            self.showDeveloperTiles(id);
        }
    }

    /**
     * Let Alone Developer 
     * @param   {object}     objectsDevelopers all the developers
     * @author Emmanuel Colina
     */
     
    function letAloneDeveloper(objectsDevelopers){

        var i, _duration = 2000,
            distance = camera.getMaxDistance() * 2,
            out = window.viewManager.translateToSection('developers', new THREE.Vector3(0, 0, distance));

        var target;

        var animate = function (object, target, dur) {

            new TWEEN.Tween(object.position)
                .to({
                    x: target.x,
                    y: target.y,
                    z: target.z
                }, dur)
                .easing(TWEEN.Easing.Exponential.InOut)
                .onComplete(function () {
                    object.userData.flying = false;
                })
                .start();
        };

        target = out;
        objectsDevelopers.userData.flying = true;
        animate(objectsDevelopers, target, Math.random() * _duration + _duration);
    }

    function drawPictureDeveloper(data, ctx, texture) {

        var image = new Image();
        var actual = data.shift();

        if (actual.src && actual.src != 'undefined') {

            image.onload = function () {


                if (actual.alpha)
                    ctx.globalAlpha = actual.alpha;

                ctx.drawImage(image, actual.x, actual.y, actual.w, actual.h);
                if (texture)
                    texture.needsUpdate = true;

                ctx.globalAlpha = 1;

                if (data.length !== 0) {

                    if (data[0].text)
                        drawTextDeveloper(data, ctx, texture);
                    else
                        drawPictureDeveloper(data, ctx, texture);
                }
            };

            image.onerror = function () {
                if (data.length !== 0) {
                    if (data[0].text)
                        drawTextDeveloper(data, ctx, texture);
                    else
                        drawPictureDeveloper(data, ctx, texture);
                }
            };

            image.crossOrigin = "anonymous";
            image.src = actual.src;
        } else {
            if (data.length !== 0) {
                if (data[0].text)
                    drawTextDeveloper(data, ctx, texture);
                else
                    drawPictureDeveloper(data, ctx, texture);
            }
        }
    }

    /**
     * Draws a texture in canvas
     * @param {Array}  data    Options of the texture
     * @param {Object} ctx     Canvas Context
     * @param {Object} texture Texture to update
     */
    function drawTextDeveloper(data, ctx, texture) {

        var actual = data.shift();

        if (actual.color)
            ctx.fillStyle = actual.color;

        ctx.font = actual.font;

        if (actual.constraint)
            if (actual.wrap)
                helper.drawText(actual.text, actual.x, actual.y, ctx, actual.constraint, actual.lineHeight);
            else
                ctx.fillText(actual.text, actual.x, actual.y, actual.constraint);
        else
            ctx.fillText(actual.text, actual.x, actual.y);

        if (texture)
            texture.needsUpdate = true;

        ctx.fillStyle = "#FFFFFF";

        if (data.length !== 0){ 

          if(data[0].text)
            drawTextDeveloper(data, ctx, texture); 
          else 
            drawPictureDeveloper(data, ctx, texture);
        }
    }

	this.getDeveloper = function(){
        
        var find = false, count = 0; 

                
        for(var x = 0; x < window.TABLE.platafrms.length; x++){
            for(var y = 0; y < window.TABLE.platafrms[x].layers.length; y++){
                if(window.TABLE.platafrms[x].layers[y].visible){
                    for(var z = 0; z < window.TABLE.platafrms[x].layers[y].tile.length; z++){
                        pushDeveloper(window.TABLE.platafrms[x].layers[y].tile[z].picture,
                                      window.TABLE.platafrms[x].layers[y].tile[z].author,
                                      window.TABLE.platafrms[x].layers[y].tile[z].authorRealName,
                                      window.TABLE.platafrms[x].layers[y].tile[z].authorEmail);
                    }
                }
            }
        }
        for(var v = 0; v < window.TABLE.superPlatafrms.length; v++){
            for(var t = 0; t < window.TABLE.superPlatafrms[v].layers.length; t++){
               for(var q = 0; q < window.TABLE.superPlatafrms[v].layers[t].tile.length; q++){
                    pushDeveloper(window.TABLE.superPlatafrms[v].layers[t].tile[q].picture,
                                  window.TABLE.superPlatafrms[v].layers[t].tile[q].author,
                                  window.TABLE.superPlatafrms[v].layers[t].tile[q].authorRealName,
                                  window.TABLE.superPlatafrms[v].layers[t].tile[q].authorEmail);
               }   
            }
        }

        function pushDeveloper(_picture, _author, _authorRealName, _authorEmail){
        
            if(count === 0){
                developerLink.push(_picture);
                developerAuthor.push(_author);
                developerAuthorRealName.push(_authorRealName);
                developerAuthorEmail.push(_authorEmail);
            }
            else{

                for(var j = 0; j < developerLink.length; j++)
                    if(developerLink[j] === _picture && find === false){
                        find = true;
                    }
            }
            if(find === false && count !== 0){
                if(_picture !== undefined){
                    developerLink.push(_picture);
                    developerAuthor.push(_author);
                    developerAuthorRealName.push(_authorRealName);
                    developerAuthorEmail.push(_authorEmail);
                }
                find = false;
            }
            else
                find = false;

            count = 1;
        }

        self.createDeveloper(developerLink, developerAuthor, developerAuthorRealName, developerAuthorEmail);
    };

	/**
     * Creates a Texture
     * @param   {Number}     id ID of the developer
     * @param   {object}     developerLink link of the picture developer
     * @param   {object}     developerAuthor nick of the developer
     * @param   {object}     developerAuthorRealName name of the developer
     * @param   {object}     developerAuthorEmail email of the developer
     * @returns {texture} 	 Texture of the developer
     * @author Emmanuel Colina
     */
	this.createTextureDeveloper = function(id, developerLink, developerAuthor, developerAuthorRealName, developerAuthorEmail){
		
		var canvas = document.createElement('canvas');
        canvas.width = 183 * 5 ;
        canvas.height = 92 * 5;
        var ctx = canvas.getContext('2d');
        ctx.globalAlpha = 0;
        ctx.fillStyle = "#FFFFFF";
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';

        var texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.LinearFilter;

		var pic = {
            src: developerLink[id],
            alpha: 0.8
        };
        pic.x = 26.5;
        pic.y = 40;
        pic.w = 84 * 1.9;
        pic.h = 84 * 1.9;

		var background = {
		    src: 'images/developer/background_300.png',
		    x: 0,
		    y: 0,
		    w: 230 * 2,
		    h: 120 * 2
		};

		var ringDeveloper = {
			
			src: 'images/developer/icon_developer_300.png'
		};
		ringDeveloper.x = 25.5;
        ringDeveloper.y = 33.5;
        ringDeveloper.w = 82.7 * 2.0;
        ringDeveloper.h = 82.7 * 2.0;

        var nameDeveloper = {
            text: developerAuthorRealName[id],
            font: (9 * 2.2) + 'px Roboto Bold'
        };
        nameDeveloper.x = 250;
        nameDeveloper.y = 90;
        nameDeveloper.color = "#FFFFFF";
        
        var nickDeveloper = {
            text: developerAuthor[id],
            font: (5 * 2.2) + 'px Canaro'
        };
        nickDeveloper.x = 250;
        nickDeveloper.y = 176;
        nickDeveloper.color = "#00B498";

        var emailDeveloper = {
            text: developerAuthorEmail[id],
            font: (5 * 2.2) + 'px Roboto Medium'
        };
        emailDeveloper.x = 250;
        emailDeveloper.y = 202;
        emailDeveloper.color = "#E05A52";

		var data = [
		pic,
		background,
		ringDeveloper,
		nameDeveloper,
        nickDeveloper,
		emailDeveloper
		];

        drawPictureDeveloper(data, ctx, texture);

        return texture;
	};

	/**
     * Creates a Developer 
     * @param   {object}     developerLink link of the picture developer
     * @param   {object}     developerAuthor nick of the developer
     * @param   {object}     developerAuthorRealName name of the developer
     * @param   {object}     developerAuthorEmail email of the developer
     * @author Emmanuel Colina
     */
	this.createDeveloper = function (developerLink, developerAuthor, developerAuthorRealName, developerAuthorEmail){

		var mesh, texture, lastTarget;

		position.target = self.setPositionDeveloper(developerLink);

		for(var i = 0; i < developerLink.length; i++){

			lastTarget = window.helper.getOutOfScreenPoint(0);
			position.lastTarget.push(lastTarget);

			texture = self.createTextureDeveloper(i, developerLink, developerAuthor, developerAuthorRealName, developerAuthorEmail);

			mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(230, 120),
            new THREE.MeshBasicMaterial({ transparent : true, color : 0xFFFFFF}));
            mesh.userData = {
                id: i,
                onClick : onClick
            };
            mesh.material.map = texture;
            mesh.material.needsUpdate = true;
        	mesh.position.x = position.lastTarget[i].x;
        	mesh.position.y = position.lastTarget[i].y;
        	mesh.position.z = position.lastTarget[i].z;

        	mesh.name = developerAuthor[i];
        	mesh.scale.set(5, 5, 5);
        	scene.add(mesh);
        	objectsDeveloper.push(mesh);
		}
	};

	/**
     * Creates a Position 
     * @param   {object}     mesh of the picture developer
     * @author Emmanuel Colina
     */
	this.setPositionDeveloper = function(mesh){
		
		var positionDeveloper = [];
		var position;
	    var indice = 1;
	    
	    var center = new THREE.Vector3(0, 0, 0);
	    center = viewManager.translateToSection('developers', center);

	    if (mesh.length === 1) {

	        positionDeveloper.push(center);
	    }

	    else if (mesh.length === 2) {

	        center.x = center.x - 500;

	        for (var k = 0; k < mesh.length; k++) {

	            position = new THREE.Vector3();

	            position.x = center.x;
	            position.y = center.y;
	        
	            positionDeveloper.push(position);

	            center.x = center.x + 1000;
	        }

	    }
	    else if (mesh.length > 2) {

	        var sqrt, round, column, row, initialY, count, raizC, raizC2;
	        count = 0;
	        round = 0;
	        column = 0;

	        //calculamos columnas y filas

	        if((Math.sqrt(mesh.length) % 1) !== 0) {

	            for(var r = mesh.length; r < mesh.length * 2; r++){

	                if((Math.sqrt(r) % 1) === 0){

	                    raizC = r;
	                    sqrt = Math.sqrt(raizC);

	                    for(var l = raizC - 1; l > 0; l--){ 

	                        if((Math.sqrt(l) % 1) === 0){

	                            raizC2 = l;
	                            break;
	                        }
	                        count = count + 1;
	                    }
	                    count = count / 2;

	                    for(var f = raizC2 + 1; f <= raizC2 + count; f++){
	                        if(mesh.length === f) {
	                            row = sqrt - 1;
	                            column = sqrt;
	                        }
	                    }
	                    for(var t = raizC - 1; t >= raizC - count; t--){
	                        if(mesh.length === t) {
	                            row = column = sqrt ;
	                        }
	                    }
	                }
	                if(row !== 0  && column !== 0){
	                    break;
	                }
	            }
	        }
	        else{
	            row = column = Math.sqrt(mesh.length);
	        }

	        count = 0;
	        var positionY = center.y - 1500;  

	        //calculando Y
	        for(var p = 0; p < row; p++) { 

	            if(p === 0)
	                positionY = positionY + 250;
	            else
	                positionY = positionY + 500;
	        }
	        
	        for(var y = 0; y < row; y++){ //filas

	            var positionX = center.x + 1500;

	            for(var m = 0; m < column; m++) { 

	                if(m===0)
	                    positionX = positionX - 500;
	                else
	                    positionX = positionX - 1000;
	            }
	            //calculando X
	            for(var x = 0; x < column; x++){  //columnas              

	                position = new THREE.Vector3();

	                position.y = positionY;

	                position.x = positionX;

	                if(count < mesh.length){

	                    positionDeveloper.push(position);
	                    count = count + 1;
	                }

	                if((positionX + 500) === center.x + 1500) {
	                    positionX = positionX + 1000;
	                }
	                else
	                    positionX = positionX + 1000;
	            }

	            if((positionY - 250) === center.y - 1500) {
	                positionY = positionY - 500;
	            }
	            else
	                positionY = positionY - 500;     
	        }      
	    }

	    return positionDeveloper;
	};

	/**
     * Animate Developer 
     * @author Emmanuel Colina
     */
	this.animateDeveloper = function(){
		
		var duration = 3000;

		for (var i = 0, l = objectsDeveloper.length; i < l; i++) {
            new TWEEN.Tween(objectsDeveloper[i].position)
            .to({
                x : position.target[i].x,
                y : position.target[i].y,
                z : position.target[i].z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
	};

	/**
     * Delete Developer 
     * @author Emmanuel Colina
     */
	this.delete = function() {
        var _duration = 2000;
        var moveAndDelete = function(id) {
            
            var target = position.lastTarget[id];
            
            new TWEEN.Tween(objectsDeveloper[id].position)
                .to({x : target.x, y : target.y, z : target.z}, 6000)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onComplete(function() { window.scene.remove(objectsDeveloper[id]); })
                .start();
        };
        
        for(var i = 0, l = objectsDeveloper.length; i < l; i++) {
            moveAndDelete(i);
            helper.hideObject(objectsDeveloper[i], false, _duration);
        }
        objectsDeveloper = [];
        developerLink = [];
		developerAuthor = [];
		developerAuthorRealName = [];
		developerAuthorEmail = [];
		position = {
			target : [],
			lastTarget : []
		};
    };

    this.showDeveloperTiles = function(id){

        var section = 0, count = 0;
        var center = objectsDeveloper[id].position;
        
        for(var x = 0; x < window.TABLE.platafrms.length; x++){
            for(var y = 0; y < window.TABLE.platafrms[x].layers.length; y++){
                if(window.TABLE.platafrms[x].layers[y].visible){
                    for(var z = 0; z < window.TABLE.platafrms[x].layers[y].tile.length; z++){
                        animateDeveloperTiles(window.TABLE.platafrms[x].layers[y].tile[z].author);
                    }
                }
            }
        }
        for(var v = 0; v < window.TABLE.superPlatafrms.length; v++){
            for(var t = 0; t < window.TABLE.superPlatafrms[v].layers.length; t++){
               for(var q = 0; q < window.TABLE.superPlatafrms[v].layers[t].tile.length; q++){
                    animateDeveloperTiles(window.TABLE.superPlatafrms[v].layers[t].tile[q].author);
               }   
            }
        }

        function animateDeveloperTiles(_author){
            
             if (_author === objectsDeveloper[id].name && !isNaN(objects[count].position.y)){

                new TWEEN.Tween(objects[count].position)
                .to({x : (center.x + (section % 5) * window.TILE_DIMENSION.width) - 750, y : (center.y - Math.floor(section / 5) * window.TILE_DIMENSION.height) - 250, z : 0}, 2000)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
                
                section += 1;
            }
            count = count + 1;
        }
    };
}