/**
 * @author Ricardo Delgado
 * Create screenshots of android with your images and functions.
 */
class ScreenshotsAndroid {

	// Public Variables
    objects : any = {
		mesh : [],
		target : [],
		texture : [],
		title : { 
			mesh : {},
			texture : {}
		}
	};
		
    // Private Variables
	POSITION_X = 231;
	CONTROL = {};
	SCREENSHOTS = {};
	GROUP = {};

    action = { state : false, mesh : null };

	onClick(target) {
		if(globals.actualView === "table"){ 
			this.change(target.userData.id);
			globals.buttonsManager.removeAllButtons();
		}
	};

	getScreenshots(){
		return this.SCREENSHOTS;
	};

	changePositionScreenshots(id, x, y){

		for(let t in this.SCREENSHOTS){

			if(this.SCREENSHOTS[t].id === id && this.SCREENSHOTS[t].show === true){

				this.SCREENSHOTS[t].position = new THREE.Vector3(x, y, 0);

				for(let i = 0; i < this.objects.mesh.length; i++){

					if(this.objects.mesh[i].userData.wallet === this.SCREENSHOTS[t].name){

						let mesh = this.objects.mesh[i];

						let target = {x : x, y : y + 240, z : 0};

						this.objects.target[i].show.x = target.x;
						this.objects.target[i].show.y = target.y;
						this.objects.target[i].show.z = target.z;

						this.animate(mesh, this.objects.target[i].show);
					}
				}
			}
		}
	};

	deleteScreenshots(id){

		let newObjects = {};

		for(let t in this.SCREENSHOTS){

			if (this.SCREENSHOTS[t].id === id){

				for(let i = 0; i < this.objects.mesh.length; i++){

					if(this.SCREENSHOTS[t].name === this.objects.mesh[i].userData.wallet){

						let mesh = this.objects.mesh[i];

						let target = this.objects.target[i];

						this.objects.mesh.splice(i,1);
						this.objects.target.splice(i,1);

						this.animate(mesh, target.hide, 1000, () =>{

							globals.scene.remove(mesh);
						 }); 
					}
				}
			}
			else
				newObjects[t] =this.SCREENSHOTS[t];
		}

		this.SCREENSHOTS = newObjects;

	};

	hidePositionScreenshots(newGroup, newLayer){

		let layer = CLI.query(globals.layers,(el) => {return (el.super_layer === false);});

		if(typeof globals.platforms[newGroup] !== 'undefined'){

			if(newLayer === layer[0] || newLayer === layer[1] || newLayer === layer[2]){

				for(let t in this.SCREENSHOTS){

					let id =this.SCREENSHOTS[t].id;
					let data = id.split("_");

					if(data[0] === newGroup && data[1] === 'Sub App'){

						for(let i = 0; i < this.objects.mesh.length; i++){

							if(this.objects.mesh[i].userData.wallet === this.SCREENSHOTS[t].name){

								let mesh = this.objects.mesh[i];

								this.objects.target[i].show.z = 160000;

								this.animate(mesh, this.objects.target[i].hide);
							}
						}
					}
				}
			}
		}
	};

    // Public method
    setGroup(_group, _layer) {

    	if(typeof this.GROUP[_group] === 'undefined')
        	this.GROUP[_group] = [];
            
        this.GROUP[_group].push(_layer);
    };

    showButtonScreenshot(id){

    	if(typeof this.SCREENSHOTS[id] !== 'undefined'){

    		globals.buttonsManager.createButtons('showScreenshots', 'View Screenshots', () =>{
    			
    			globals.buttonsManager.removeAllButtons();
    			this.showScreenshotsButton(id);
    		});
    	}	
    };

	/**
	* @author Ricardo Delgado
	* Initialization screenshots.
	*/
	init() {

        $.get("json/screenshots.json", {}, (json) => {

	        for(let _group in json){

	        	for(let _layer in json[_group]){

	        		for(let _wallet in json[_group][_layer]){

	        			if(globals.TABLE[_group]){

	        				if(globals.TABLE[_group].layers[_layer]){

		        				for(let i = 0; i < globals.TABLE[_group].layers[_layer].objects.length; i++){

		        					let id = _group + "_" + _layer + "_" + i;
		                            
		                            let tile = Helper.getSpecificTile(id).data;        

			        				if(tile.type === "Plugin" || tile.type === "Android"){ 

				        				if(tile.name === _wallet){
				        					
				        					let name = json[_group][_layer][_wallet].name,
				        						position = Helper.getSpecificTile(id).target.show.position,
				        						_id = _group + "_" + _layer + "_" + name,
				        						show = false,
				        						screenshots = {};

				        					if(_layer === "Sub App" && this.GROUP[_group][0] === "Sub App")
				        						show = true;

			        						for(let _screen in json[_group][_layer][_wallet].screenshots){
												screenshots[_screen] = json[_group][_layer][_wallet].screenshots[_screen];
											}

											this.fillScreenshots(id, _id, position, name, show, screenshots);
				        				}
				        			}
			        			}
			        		}
		        		}
	        		}
	        	}
	        }
	        this.setScreenshot();
    	});
	};
    
    	/**
	* @author Ricardo Delgado
	* Wallet hidden from view.
	*/ 
	hide() {

		let ignore;

		if(this.action.state)
			ignore = this.action.mesh;

		for(let i = 0; i < this.objects.mesh.length; i++) { 

			if(i != ignore)  
				this.animate(this.objects.mesh[i], this.objects.target[i].hide, 800);
		}
	}; 

	/**
	* @author Ricardo Delgado
	* Show wallet sight.
	*/ 
	show = () => {

        if(this.action.state)
			this.resetTexture(this.action.mesh);
		else {
			
			for(let i = 0; i < this.objects.mesh.length; i++) {

				this.animate(this.objects.mesh[i], this.objects.target[i].show, 1500);
			}
		}
	};
    
    // Private method
    /**
	* @author Ricardo Delgado
	* Screenshots settings show.
	*/ 
    setScreenshot(){
        
        let cant = 0,
			lost = "";

		for(let id in this.SCREENSHOTS){

			let name =this.SCREENSHOTS[id].name,
				position = this.SCREENSHOTS[id].position,
				show = this.SCREENSHOTS[id].show;

			this.CONTROL[name] = {};

			this.addWallet(id, name);

			this.addMesh(position, name, show);
            
            this.addTextureTitle(name);

			lost = name;

			cant++;	
		}

		if(cant < 4){

			let _position = {x : Math.random() * 80000};

			for(cant; cant <= 4; cant++)
				this.addMesh(_position , lost, false);
		}

		this.addTitle();

	}

    /**
	* @author Ricardo Delgado
	* Variable filled SCREENSHOTS.
    * @param {String}  id   Wallet id
    * @param {number}  position   End position of the plane in the x axis.
    * @param {String}   wallet     Wallet group to which it belongs.
    * @param {Array}  screenshots  All routes screenshot.
	*/ 
	fillScreenshots(id, _id, position, name, show, screenshots){

		this.SCREENSHOTS[id] = {};
		this.SCREENSHOTS[id].name = name;
		this.SCREENSHOTS[id].position = position;
		this.SCREENSHOTS[id].show = show;		
		this.SCREENSHOTS[id].screenshots = screenshots;
		this.SCREENSHOTS[id].id = _id;
	}

	/**
	* @author Ricardo Delgado
	* Each drawing screenshots of wallet.
	* @param {String}  wallet   Wallet draw. 
	*/
	addWallet(id, wallet) {

		let cant = 0,
			total = 4;

		for(let c in this.SCREENSHOTS[id].screenshots){
			cant++;
		}

		if(cant <= 4)
			total = cant;

		for(let i = 1; i <= total; i++) {
			this.addTextureWallet(id, wallet, i);
		}
	}

	/**
	* @author Ricardo Delgado
	* Search for a wallet in specific in the letiable this.objects.texture.
	* @param {String}  wallet   Group wallet to find.
	* @param {Number}    id     Wallet identifier. 
	*/
	searchWallet(wallet, id) {

		let i = 0;

		while(this.objects.texture[i].wallet != wallet || this.objects.texture[i].id != id) {
			i++ ;
		}  

		return this.objects.texture[i].image;
	}

	/**
	* @author Ricardo Delgado
	* The plans necessary for the wallet are added, each level is for a group of wallet.
	* @param {number}  root    End position of the plane in the x axis.
	* @param {String}  wallet     Wallet group to which it belongs.
	*/   
	addMesh(root, wallet, state) {

		let id = this.objects.mesh.length,
			x = root.x,
			y = 0,
			z = 0,
			_texture = null,
			position = new THREE.Vector3(0, 0, 0); 


        _texture = this.searchWallet(wallet, 1);
        y = globals.tileManager.dimensions.layerPositions[3] + globals.TILE_DIMENSION.height + 240;

			
		let mesh = new THREE.Mesh(
					new THREE.PlaneBufferGeometry(50, 80),
					new THREE.MeshBasicMaterial({ map:_texture, side: THREE.FrontSide, transparent: true })
					);

		mesh.material.needsUpdate = true;

		mesh.userData = {
			id : id,
			wallet : wallet,
			onClick : onClick
		};

		position.y = y;

		position = globals.viewManager.translateToSection('table', position);

		let target = Helper.fillTarget(x, position.y, z, 'table');

		mesh.material.opacity = 1;

		mesh.scale.set(4, 4, 4);

		mesh.position.copy(target.hide.position);
		mesh.rotation.set(target.hide.rotation.x, target.hide.rotation.y, target.hide.rotation.z);

		globals.scene.add(mesh);

		if(!state){
			target.show = target.hide;
		}

		this.objects.target.push(target);

		this.objects.mesh.push(mesh);
	}

	/**
	* @author Ricardo Delgado
	* Add the title of the group focused wallet.
	* @param {String}    text    Behalf of the wallet.
	*/ 
	addTitle() {

		let texture = null;
			
		let mesh = new THREE.Mesh(
					new THREE.PlaneGeometry(70, 15),
					new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide, transparent: true })
					);

		mesh.material.needsUpdate = true;

		mesh.material.opacity = 1;

		mesh.scale.set(4, 4, 4);

		let target = Helper.fillTarget(0, 0, 0, 'table');

		mesh.position.copy(target.hide.position);
		mesh.rotation.set(target.hide.rotation.x, target.hide.rotation.y, target.hide.rotation.z);

		globals.scene.add(mesh);

		this.objects.title.mesh = {
						mesh : mesh,
						target : target
						};
	}

	/**
	* @author Ricardo Delgado
	* Add the title of the group focused wallet.
	* @param {String}    Wallet    Behalf of the wallet.
	*/ 
	addTextureTitle(wallet){

		let canvas,
			ctx,
			texture,
			text = wallet;

		canvas = document.createElement('canvas');
		canvas.width  = 600;
		canvas.height = 200;
		let middle = canvas.width / 2;
		ctx = canvas.getContext("2d");
		ctx.textAlign = 'center';
		ctx.font="bold 40px Arial";
		ctx.fillText(text, middle, 100);

		texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;  
		texture.minFilter = THREE.NearestFilter;

		this.objects.title.texture[wallet] = texture;
	}

	/**
	* @author Ricardo Delgado
	* Wallet drawn and added required.
	* @param {String}    wallet    Wallet draw.
	* @param {String}      i       Group identifier wallet.
	*/ 
	addTextureWallet(_id, wallet, i) {

		let _texture,
			image,
			cant = 0,
			place;

		for(let f in this.SCREENSHOTS[_id].screenshots){
			cant++;
		}

		place = Math.floor(Math.random()* cant + 1);

		if(this.CONTROL[wallet]["picture"+place] === undefined){

			this.CONTROL[wallet]["picture"+place] = place;

			image = THREE.ImageUtils.loadTexture(this.SCREENSHOTS[_id].screenshots['Screenshots_'+place]);
			image.needsUpdate = true;  
			image.minFilter = THREE.NearestFilter;

			_texture = { id : i, wallet : wallet, image : image };

			this.objects.texture.push(_texture);

		}
		else
			this.addTextureWallet(_id, wallet, i);
	}

	/**
	* @author Ricardo Delgado
	* Load the title of the selected wallet.
	* @param {String}    Wallet    Behalf of the wallet.
	* @param {object}     mesh     Wallet.	
	*/ 
	showTitle(wallet, mesh) {

		let _mesh = this.objects.title.mesh.mesh,
			target : any = {};

		target = Helper.fillTarget(mesh.position.x, mesh.position.y + 240, mesh.position.z, 'table');

		_mesh.material.map = this.objects.title.texture[wallet]; 
		_mesh.material.needsUpdate = true;

		this.animate(_mesh, target.show, 2000);
	}

	/**
	* @author Ricardo Delgado
	* Wallet focus and draw the other planes in the same group wallet.
	* @param {Number}    id    Wallet identifier focus.
	*/ 
	
	change(id) {

		let duration = 2000;
		let focus = parseInt(id);

		if(globals.camera.getFocus() === null) {

			this.action.state = true; this.action.mesh = id;

			globals.tileManager.letAlone();

			globals.camera.setFocus(this.objects.mesh[focus], new THREE.Vector4(0, 0, globals.TILE_DIMENSION.width - globals.TILE_SPACING, 1), duration);
			
			globals.headers.hideHeaders(duration);
			
			Helper.showBackButton();

			this.positionFocus(id);
		}
	}

	showScreenshotsButton(_id){

		let wallet = this.SCREENSHOTS[_id].name,
			position = this.SCREENSHOTS[_id].position,
			id = 0,
			mesh = null,
            target : any = {};
            

		for(let i = 0; i < this.objects.mesh.length; i++){
			if(this.objects.mesh[i].userData.wallet === wallet){
				id = i;
				mesh = this.objects.mesh[i];
			}
		}

		this.action.state = true; this.action.mesh = id;

		globals.tileManager.letAlone();

		target = Helper.fillTarget(position.x, position.y, 0, 'table');

		this.animate(mesh, target.show, 1000, () =>{
	   			globals.camera.enable();
	   			globals.camera.setFocus(mesh, new THREE.Vector4(0, 0, globals.TILE_DIMENSION.width - globals.TILE_SPACING, 1), 1000);
	   			this.positionFocus(id);
			});

	}

	/**
	* @author Ricardo Delgado
	* Screenshots account total has a wallet.
	* @param {String}    Wallet    Wallet counting.
	*/ 
	countControl(wallet){

		let sum = 0;
		
		for(let i in this.CONTROL[wallet]){
			sum++;
		}

		return sum;
	}

	/**
	* @author Ricardo Delgado
	* Accommodate the wallet.
	* @param {Number}    id    Identifier reference wallet.
	*/ 
	positionFocus(id) {

		let ignore = id,
			mesh = this.objects.mesh[id],
			wallet = mesh.userData.wallet,
			target : any = {},
			count = 1,
			_countControl = this.countControl(wallet),
			x = this.POSITION_X;

		this.showTitle(wallet, mesh);
			
		target = Helper.fillTarget(mesh.position.x - (x / 2), mesh.position.y, mesh.position.z, 'table');
        
		if(_countControl > 3)
			this.animate(mesh, target.show, 1000);

		setTimeout(() => { this.loadTexture(wallet, ignore); }, 500);

		setTimeout(() => { 

			for(let i = 0; i < 4; i++) { 

				if(count < 4){ 

					if(count < _countControl){

						if(i != ignore) { 

							let _mesh = this.objects.mesh[i];

							if(_countControl > 3){ 

								if(x === this.POSITION_X)
									x = x * 2;
								else if(x > this.POSITION_X)
									x = (x / 2) * -1;
								else
									x = this.POSITION_X;

							}
							else{

								if(count === 1)
									x = x;
								else
									x = x * -1;
							}

							count++;

							target = Helper.fillTarget(mesh.position.x + x, mesh.position.y, mesh.position.z, 'table');

							this.animate(_mesh, target.show, 2000);

						}
					} 
				}            
			}
		}, 1500);
	}

	/**
	* @author Ricardo Delgado
	* Texture change of plans regarding the group focused wallet.
	* @param {String}    wallet    Behalf of the wallet.
	* @param {Number}    ignore    Id focused wallet.
	*/ 
	loadTexture(wallet, ignore) {

		let id = 1,
			_mesh,
			count = 1,
			_countControl = this.countControl(wallet);

		for(let i = 0; i < 4; i++) { 

			if(count < 4){ 

				if(count < _countControl){

					if(i != ignore) { 

						id = id + 1 ;

						_mesh = this.objects.mesh[i];
						_mesh.material.map = this.searchWallet(wallet, id); 
						_mesh.material.needsUpdate = true;

						count++;
					}
				}
			}
		} 
	}

	/**
	* @author Ricardo Delgado
	* Change texture of the planes to the original state.
	* @param {Number}    ignore    Id focused wallet.
	*/   
	resetTexture(ignore) {

		let title = this.objects.title.mesh.mesh, 
			_mesh;

		this.hide(); 

		this.animate(title, this.objects.title.mesh.target.hide, 1000, () => {   

			for(let i = 0; i < this.objects.mesh.length; i++) { 

				if(i != ignore) { 

					_mesh = this.objects.mesh[i];
					_mesh.material.map = this.searchWallet(_mesh.userData.wallet, 1); 
					_mesh.material.needsUpdate = true;
				}
			} 

			this.action.state = false;

			this.show();  

		});
	}

	/**
	* @author Ricardo Delgado
	* Animation and out of the wallet.
	* @param {object}     mesh     Wallet.
	* @param {Number}    target    Coordinates wallet.
	* @param {Boolean}   state     Status wallet.
	* @param {Number}   duration   Animation length.
	*/ 
    animate(mesh, target, duration = 2000, callback? : () => void){

        let _duration = duration || 2000,
            x = target.position.x,
            y = target.position.y,
            z = target.position.z,
            rx = target.rotation.x,
            ry = target.rotation.y,
            rz = target.rotation.z; 

        _duration = Math.random() * _duration + _duration;

        new TWEEN.Tween(mesh.position)
            .to({x : x, y : y, z : z}, _duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        new TWEEN.Tween(mesh.rotation)
            .to({x: rx, y: ry, z: rz}, _duration + 500)
            .easing(TWEEN.Easing.Exponential.InOut)
            .onComplete(() => {
                    if(typeof(callback) === 'function')
                        callback();   
                })
            .start();
    }
}