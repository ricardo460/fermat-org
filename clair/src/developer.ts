class Developer {

	objectsDeveloper = [];
	developers = {};
	position = {
		target : [],
		lastTarget : []
	};

	onClick(target : THREE.Object3D) : void {
        if(window.actualView === 'developers')
            this.onElementClickDeveloper(target.userData.id, this.objectsDeveloper);
    };

    onElementClickDeveloper(id : number, objectsDevelopers : THREE.Object3D[]) : void{

        let duration = 1000;

        if(camera.getFocus() == null){
            let camTarget = objectsDevelopers[id].clone();

            window.camera.setFocus(camTarget, new THREE.Vector4(0, 0, 1000, 1), duration);

            for(let i = 0; i < objectsDevelopers.length ; i++) {
                if(id !== i)
                    letAloneDeveloper(objectsDevelopers[i]);
            }

            Helper.showBackButton();
            setTimeout(function(){
                this.showDeveloperTiles(id);
            }, 1000);
        }
    }

    /**
     * Let Alone Developer
     * @param   {object}     objectsDevelopers all the developers
     * @author Emmanuel Colina
     */

    letAloneDeveloper(objectsDevelopers : THREE.Object3D) : void{

        let i, _duration = 2000,
            distance = camera.getMaxDistance() * 2,
            out = window.viewManager.translateToSection('developers', new THREE.Vector3(0, 0, distance));
        let target;
        let animate = (object, target, dur) => {

            new TWEEN.Tween(object.position)
                .to({
                    x: 0,
                    y: 0,
                    z: 0
                }, dur)
                .easing(TWEEN.Easing.Exponential.InOut)
                .onComplete(() => {
                    object.userData.flying = false;
                })
                .start();
        };

        target = out;
        objectsDevelopers.userData.flying = true;
        animate(objectsDevelopers, target, Math.random() * _duration + _duration);
    }

    /**
     * Draws the developer's picture taken from GitHub
     * @param {Array}  data    Options of the texture
     * @param {Object} ctx     Canvas Context
     * @param {Object} texture Texture to update
     */
    drawPictureDeveloper(data : any[], ctx : CanvasRenderingContext2D, texture : THREE.Texture) : void {

        let image = new Image();
        let actual = data.shift();

        if(actual.src && actual.src != 'undefined') {
            image.onload = () => {

                if(actual.alpha)
                    ctx.globalAlpha = actual.alpha;

                ctx.drawImage(image, actual.x, actual.y, actual.w, actual.h);
                if(texture)
                    texture.needsUpdate = true;

                ctx.globalAlpha = 1;
                if(data.length !== 0) {
                    if(data[0].text)
                        this.drawTextDeveloper(data, ctx, texture);
                    else
                        this.drawPictureDeveloper(data, ctx, texture);
                }
            };

            image.onerror = () => {
                if(data.length !== 0) {
                    if(data[0].text)
                        this.drawTextDeveloper(data, ctx, texture);
                    else
                        this.drawPictureDeveloper(data, ctx, texture);
                }
            };

            image.crossOrigin = "anonymous";
            image.src = actual.src;
        }
        else {
            if(data.length !== 0) {
                if(data[0].text)
                    this.drawTextDeveloper(data, ctx, texture);
                else
                    this.drawPictureDeveloper(data, ctx, texture);
            }
        }
    }

    /**
     * Draws a texture in canvas
     * @param {Array}  data    Options of the texture
     * @param {Object} ctx     Canvas Context
     * @param {Object} texture Texture to update
     */
    drawTextDeveloper(data : any[], ctx : CanvasRenderingContext2D, texture : THREE.Texture) : void {

        let actual = data.shift();

        if(actual.color)
            ctx.fillStyle = actual.color;

        ctx.font = actual.font;
        if(actual.constraint){
            if(actual.wrap)
                Helper.drawText(actual.text, actual.x, actual.y, ctx, actual.constraint, actual.lineHeight);
            else
                ctx.fillText(actual.text, actual.x, actual.y, actual.constraint);
        }
        else
            ctx.fillText(actual.text, actual.x, actual.y);

        if(texture)
            texture.needsUpdate = true;

        ctx.fillStyle = "#FFFFFF";

        if(data.length !== 0){
          if(data[0].text)
            this.drawTextDeveloper(data, ctx, texture);
          else
            this.drawPictureDeveloper(data, ctx, texture);
        }
    }

	getDeveloper() : void{

		let id = 0;

        for(let i = 0; i < window.tilesQtty.length; i++){

            let tile = Helper.getSpecificTile(window.tilesQtty[i]).data;

            if(tile.author && this.developers[tile.author] === undefined)
            {
                this.developers[tile.author] = {
                    id : id,
                    author : tile.author,
                    picture : tile.picture,
                    authorRealName : tile.authorRealName,
                    authorEmail : tile.authorEmail
                };
                id++;
            }
        }

		this.createDevelopers();
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
	createTextureDeveloper(developer : DeveloperData) : THREE.Texture {

		let canvas = document.createElement('canvas');
        canvas.width = 230 * 2;
        canvas.height = 120 * 2;

        let ctx = canvas.getContext('2d');

        ctx.globalAlpha = 0;
        ctx.fillStyle = "#FFFFFF";
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';

        let texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.LinearFilter;

		let pic = {
            src: developer.picture,
            alpha: 0.8,
            x : 0, y : 0, w : 0, h : 0
        };
        pic.x = 26.5;
        pic.y = 40;
        pic.w = 84 * 1.9;
        pic.h = 84 * 1.9;

		let background = {
		    src: 'images/developer/background_300.png',
		    x: 0,
		    y: 0,
		    w: 230 * 2,
		    h: 120 * 2
		};

		let ringDeveloper = {

			src: 'images/developer/icon_developer_300.png',
            x : 0, y : 0, w : 0, h : 0
		};
		ringDeveloper.x = 25.5;
        ringDeveloper.y = 33.5;
        ringDeveloper.w = 82.7 * 2.0;
        ringDeveloper.h = 82.7 * 2.0;

        let nameDeveloper = {
            text: developer.authorRealName,
            font: (9 * 2.2) + 'px Roboto Bold',
            x : 0, y : 0, color : ''
        };
        nameDeveloper.x = 250;
        nameDeveloper.y = 90;
        nameDeveloper.color = "#FFFFFF";

        let nickDeveloper = {
            text: developer.author,
            font: (5 * 2.2) + 'px Canaro',
            x : 0, y : 0, color : ''
        };
        nickDeveloper.x = 250;
        nickDeveloper.y = 176;
        nickDeveloper.color = "#00B498";

        let emailDeveloper = {
            text: developer.authorEmail,
            font: (5 * 1.2) + 'px Roboto Medium',
            x: 0, y: 0, color: ''
        };
        emailDeveloper.x = 250;
        emailDeveloper.y = 202;
        emailDeveloper.color = "#E05A52";

		let data = [
            pic,
            background,
            ringDeveloper,
            nameDeveloper,
            nickDeveloper,
            emailDeveloper
		];

        this.drawPictureDeveloper(data, ctx, texture);

        return texture;
	};

	/**
     * Creates a Developer
     * @author Emmanuel Colina
     */
	createDevelopers() : void{

		let mesh, texture, lastTarget;
        let i = 0;

        //Just need the number of developers
		this.position.target = this.setPositionDeveloper(Object.keys(this.developers));

		for(let key in this.developers){

			lastTarget = Helper.getOutOfScreenPoint(0);
			this.position.lastTarget.push(lastTarget);

			texture = this.createTextureDeveloper(this.developers[key]);

			mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(230, 120),
            new THREE.MeshBasicMaterial({ transparent : true, color : 0xFFFFFF}));

            mesh.userData = {
                id: this.developers[key].id,
                onClick : onClick
            };

            mesh.material.map = texture;
            mesh.material.needsUpdate = true;
        	mesh.position.x = this.position.lastTarget[i].x;
        	mesh.position.y = this.position.lastTarget[i].y;
        	mesh.position.z = this.position.lastTarget[i].z;

        	mesh.name = this.developers[key].author;
            mesh.scale.set(5, 5, 3);
        	scene.add(mesh);
        	this.objectsDeveloper.push(mesh);

            i++;
		}
	};

	/**
     * @author Emmanuel Colina
     * Creates a Position
     * @param   {object}        devs  array containing all developers
     */
	setPositionDeveloper(devs : string[]) : THREE.Vector3[] {

		let positionDeveloper = [];
		let position;
	    let indice = 1;

	    let center = new THREE.Vector3(0, 0, 0);
	    center = viewManager.translateToSection('developers', center);

	    if(devs.length === 1)
	        positionDeveloper.push(center);

	    else if(devs.length === 2) {

	        center.x = center.x - 500;

	        for(let k = 0; k < devs.length; k++) {

	            position = new THREE.Vector3();

	            position.x = center.x;
	            position.y = center.y;
	            positionDeveloper.push(position);
	            center.x = center.x + 1000;
	        }

	    }
	    else if(devs.length > 2) {
			let devsSpacingConst = 100;
			let xSpacingConst = devsSpacingConst; // |
			let ySpacingConst = devsSpacingConst; //  \ So far, both are equal. Can't think of a situation where they must be different.
			let scale = 5;

			let n = Math.floor(Math.sqrt(devs.length));
			let ROW_W = 230;
			let ROW_H = 120;

            let initial = center;
            initial.x -= ((n * ROW_W + (xSpacingConst * (n - 1))) / 2.0);
            initial.y -= ((n * ROW_H + (ySpacingConst * (n - 1))) / 2.0);

			for (let i = 0; i < devs.length; i += 1) {
				position = new THREE.Vector3();

				let xSpace = (xSpacingConst * (i % n));
				let ySpace = (ySpacingConst * (Math.floor(i / n)));

				position.x = initial.x + ((i % n) * ROW_W + xSpace) * scale;
				position.y = initial.y + (Math.floor(i / n) * ROW_H + ySpace) * -scale;

				positionDeveloper.push(position);
			}
	    }

	    return positionDeveloper;
	};

	/**
     * Animate Developer
     * @author Emmanuel Colina
     */
	animateDeveloper() : void{

		let duration = 750;

		for(let i = 0, l = this.objectsDeveloper.length; i < l; i++) {
            new TWEEN.Tween(this.objectsDeveloper[i].position)
            .to({
                x : this.position.target[i].x,
                y : this.position.target[i].y,
                z : this.position.target[i].z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
	};

	/**
     * Delete Developer
     * @author Emmanuel Colina
     */
	delete() : void {

        let _duration = 2000;

        let moveAndDelete = (id) => {

            let target = this.position.lastTarget[id];

            new TWEEN.Tween(this.objectsDeveloper[id].position)
                .to({x : target.x, y : target.y, z : target.z}, 6000)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onComplete(function() { window.scene.remove(this.objectsDeveloper[id]); })
                .start();
        };

        for(let i = 0, l = this.objectsDeveloper.length; i < l; i++) {
            moveAndDelete(i);
            Helper.hideObject(this.objectsDeveloper[i], false, _duration);
        }
        this.objectsDeveloper = [];
        this.developers = {};
		this.position = {
			target : [],
			lastTarget : []
		};
    };

    showDeveloperTiles (id : number) : void{

        let section = 0;
        let center = this.objectsDeveloper[id].position;

        for(let i = 0; i < window.tilesQtty.length; i++){

            let tile = Helper.getSpecificTile(window.tilesQtty[i]).data;

            let mesh = Helper.getSpecificTile(window.tilesQtty[i]).mesh;

            if(tile.author === this.objectsDeveloper[id].name && !isNaN(mesh.position.y)){

                new TWEEN.Tween(mesh.position)
                .to({
                    x : (center.x + (section % 5) * window.TILE_DIMENSION.width) - 450,
                    y : (center.y - Math.floor(section / 5) * window.TILE_DIMENSION.height) - 440,
                    z : 0
                }, 2000)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();

                section += 1;
            }
        }
    };

    /**
     * @author Isaías Taborda
     * Finds a developer's tile.
     * @param   {String}  name   Component author nickname.
     * @returns {mesh}    dev    Developer's mesh.
     */
    findDeveloper (name : string) : THREE.Mesh{
        let dev;
        for(let i = 0, l = this.objectsDeveloper.length; i < l; i++) {
            if(name === this.objectsDeveloper[i].name)
                dev = this.objectsDeveloper[i];

        }
        return dev;
    };
}
