/**
 * @author Ricardo Delgado
 * Create screenshots of android with your images and functions.
 */
function ScreenshotsAndroid() {

	var action = { state : false, mesh : null };

	this.objects = {
			mesh : [],
			target : [],
			texture : [],
			title : { mesh : {},
					  texture : {}
					}
	};

	var self = this,
		POSITION_X = 231,
		CONTROL = {},
		SCREENSHOTS = {

			publisher: {
				name:"publisher",

				screenshots:{ 
					Screenshots_1: "https://raw.githubusercontent.com/bitDubai/fermat/master/_others/proto/publisher_1.png",
					Screenshots_2: "https://raw.githubusercontent.com/bitDubai/fermat/master/_others/proto/publisher_2.png",
					Screenshots_3: "https://raw.githubusercontent.com/bitDubai/fermat/master/_others/proto/publisher_3.png",
					Screenshots_4: "https://raw.githubusercontent.com/bitDubai/fermat/master/_others/proto/publisher_4.png",
					Screenshots_5: "https://raw.githubusercontent.com/bitDubai/fermat/master/_others/proto/publisher_5.png",
					Screenshots_6: "https://raw.githubusercontent.com/bitDubai/fermat/master/_others/proto/publisher_6.png"
				},

				direction: {
					platform: 2,
					position:1
				}
			},

			factory: {
				name:"factory",

				screenshots:{ 
					Screenshots_1: "https://raw.githubusercontent.com/bitDubai/fermat/master/_others/proto/wallet_factory_1.png",
					Screenshots_2: "https://raw.githubusercontent.com/bitDubai/fermat/master/_others/proto/wallet_factory_2.png",
					Screenshots_3: "https://raw.githubusercontent.com/bitDubai/fermat/master/_others/proto/wallet_factory_3.png",
					Screenshots_4: "https://raw.githubusercontent.com/bitDubai/fermat/master/_others/proto/wallet_factory_4.png",
					Screenshots_5: "https://raw.githubusercontent.com/bitDubai/fermat/master/_others/proto/wallet_factory_5.png"
				},

				direction: {
					platform: 2,
					position:0
				}			
			},

			store: {
				name:"store",

				screenshots:{
					Screenshots_1: "https://raw.githubusercontent.com/bitDubai/fermat/master/_others/proto/wallet_store_1.png",
					Screenshots_2: "https://raw.githubusercontent.com/bitDubai/fermat/master/_others/proto/wallet_store_2.png",
					Screenshots_3: "https://raw.githubusercontent.com/bitDubai/fermat/master/_others/proto/wallet_store_3.png",
					Screenshots_4: "https://raw.githubusercontent.com/bitDubai/fermat/master/_others/proto/wallet_store_4.png"
				},

				direction: {
					platform: 2,
					position:2
				}			
			}

		};

	var onClick = function (target) {
		change(target.userData.id);
	};

	/**
	* @author Ricardo Delgado
	* Initialization screenshots.
	*/
	this.init = function () {

		var cant = 0,
			lost = "";

		for (var i in SCREENSHOTS){

			var name = SCREENSHOTS[i].name,
				platform = SCREENSHOTS[i].direction.platform,
				position = SCREENSHOTS[i].direction.position;

			CONTROL[name] = {};

			addWallet(name);

			addMesh(calculatePositionScreenshot(platform, position), name, true);
            
            addTextureTitle(name);

			lost = name;

			cant++;	
		}

		if (cant < 4){

			for (cant; cant <= 4; cant++)
				addMesh(Math.random() * 80000 , lost, false);
		}

		addTitle();
	};

	/**
	* @author Ricardo Delgado
	* Calculates the position x to take screenshots.
	* @param {String}  wallet   Wallet draw. 
	*/	
	function calculatePositionScreenshot(platform, position){

		var _position = window.tileManager.targets.table[tileManager.elementsByGroup[platform][position]].position.x;
		
		return _position;
	}

	/**
	* @author Ricardo Delgado
	* Each drawing screenshots of wallet.
	* @param {String}  wallet   Wallet draw. 
	*/
	function addWallet(wallet) {

		var cant = 0,
			total = 4;

		for (var c in SCREENSHOTS[wallet].screenshots)
			cant++;

		if (cant <= 4)
			total = cant;

		for (var i = 1; i <= total; i++) {

			addTextureWallet(wallet, i);
		}
	}

	/**
	* @author Ricardo Delgado
	* Search for a wallet in specific in the variable self.objects.texture.
	* @param {String}  wallet   Group wallet to find.
	* @param {Number}    id     Wallet identifier. 
	*/
	function searchWallet(wallet, id) {

		var i = 0;

		while(self.objects.texture[i].wallet != wallet || self.objects.texture[i].id != id) {

			i = i + 1 ;
		}  

		return self.objects.texture[i].image;
	}

	/**
	* @author Ricardo Delgado
	* The plans necessary for the wallet are added, each level is for a group of wallet.
	* @param {String}  _position    End position of the plane in the x axis.
	* @param {String}    wallet     Wallet group to which it belongs.
	*/   
	function addMesh(_position, wallet, state) {

		var id = self.objects.mesh.length,
			px = Math.random() * 80000 - 40000,
			py = Math.random() * 80000 - 40000,
			pz = 80000 * 2,
			rx = Math.random() * 180,
			ry = Math.random() * 180,
			rz = Math.random() * 180,
			z = 0,
			_texture = null;

        if (state){ 
            _texture = searchWallet (wallet, 1);
        }
        else{ 
            z = pz;
        }
			
		var mesh = new THREE.Mesh(
					new THREE.PlaneGeometry(50, 80),
					new THREE.MeshBasicMaterial( { map:_texture, side: THREE.FrontSide, transparent: true } )
					);

		mesh.material.needsUpdate = true;

		mesh.userData = {
			id : id,
			wallet : wallet,
			onClick : onClick
		};

		mesh.material.opacity = 1;

		mesh.scale.set(4, 4, 4);

		var target = { x : _position, y : window.tileManager.dimensions.layerPositions[3] + 240, z : z,
					   px : px, py : py, pz : pz,
					   rx : rx, ry : ry, rz : rz };

		mesh.position.set(px, py, pz);
		mesh.rotation.set(rx, ry, rz);

		window.scene.add(mesh);

		self.objects.target.push(target);

		self.objects.mesh.push(mesh);
	}

	/**
	* @author Ricardo Delgado
	* Add the title of the group focused wallet.
	* @param {String}    text    Behalf of the wallet.
	*/ 
	function addTitle() {

		var px = Math.random() * 80000 - 40000,
			py = Math.random() * 80000 - 40000,
			pz = 80000 * 2,
			rx = Math.random() * 180,
			ry = Math.random() * 180,
			rz = Math.random() * 180,
			texture = null;
			
		var mesh = new THREE.Mesh(
					new THREE.PlaneGeometry(50, 15),
					new THREE.MeshBasicMaterial( { map: texture, side: THREE.FrontSide, transparent: true } )
					);

		mesh.material.needsUpdate = true;

		mesh.material.opacity = 1;

		mesh.scale.set(4, 4, 4);

		var target = { px : px, py : py, pz : pz,
					   rx : rx, ry : ry, rz : rz };

		mesh.position.set(px, py, pz);
		mesh.rotation.set(rx, ry, rz);

		window.scene.add(mesh);

		self.objects.title.mesh = {
						mesh : mesh,
						target : target
						};
	}

	/**
	* @author Ricardo Delgado
	* Add the title of the group focused wallet.
	* @param {String}    Wallet    Behalf of the wallet.
	*/ 
	function addTextureTitle(wallet){

		var canvas,
			ctx,
			texture,
			text = "Wallet "+wallet;

		canvas = document.createElement('canvas');
		canvas.width  = 450;
		canvas.height = 200;

		ctx = canvas.getContext("2d");
		ctx.textAlign = 'center';
		ctx.font="bold 50px Arial";
		ctx.fillText(text, 200, 100);

		texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;  
		texture.minFilter = THREE.NearestFilter;

		self.objects.title.texture[wallet] = texture;
	}

	/**
	* @author Ricardo Delgado
	* Wallet drawn and added required.
	* @param {String}    wallet    Wallet draw.
	* @param {String}      i       Group identifier wallet.
	*/ 
	function addTextureWallet(wallet, i) {

		var _texture,
			canvas,
			ctx,
			image;

		canvas = document.createElement('canvas');
		canvas.width  = 260;
		canvas.height = 480;

		ctx = canvas.getContext("2d");

		drawPicture(wallet, ctx);

		image = new THREE.Texture(canvas);
		image.needsUpdate = true;  
		image.minFilter = THREE.NearestFilter;

		_texture = { id : i, wallet : wallet, image : image };

		self.objects.texture.push(_texture);
	}

	/**
	* @author Ricardo Delgado
	* Wallet drawn and added required.
	* @param {String}    wallet    Wallet draw.
    * @param {Object} 	  ctx      Canvas context
	*/ 
	function drawPicture(wallet, ctx){

		var img = new Image(),
			cant = 0,
			place;

		for (var i in SCREENSHOTS[wallet].screenshots)
			cant++;

		place = Math.floor(Math.random()* cant + 1);

		if (CONTROL[wallet]["picture"+place] === undefined){

			CONTROL[wallet]["picture"+place] = place;

			img.crossOrigin = "anonymous";

			img.src = SCREENSHOTS[wallet].screenshots['Screenshots_'+place];

			img.onload = function () {

				ctx.drawImage(img, 0, 0);

			};
		}
		else{
			
			drawPicture(wallet, ctx);
		}
	}

	/**
	* @author Ricardo Delgado
	* Wallet hidden from view.
	*/ 
	this.hide = function () {

		var ignore;

		if (action.state) ignore = action.mesh;

		for(var i = 0; i < self.objects.mesh.length; i++) { 

			if (i != ignore)  
				animate(self.objects.mesh[i], self.objects.target[i], false, 1500);
		}
	}; 

	/**
	* @author Ricardo Delgado
	* Show wallet sight.
	*/ 
	this.show = function () {

        if (action.state) {

			resetTexture(action.mesh);
		}
		else {
			
			for (var i = 0; i < self.objects.mesh.length; i++) {

				animate(self.objects.mesh[i], self.objects.target[i], true, 2000);
			}
		}
	};

	/**
	* @author Ricardo Delgado
	* Load the title of the selected wallet.
	* @param {String}    Wallet    Behalf of the wallet.
	* @param {object}     mesh     Wallet.	
	*/ 
	function showTitle(wallet, mesh) {

		var _mesh = self.objects.title.mesh.mesh,
			target = {};

		target = { x: mesh.position.x, y : mesh.position.y + 240, z : mesh.position.z };

		_mesh.material.map = self.objects.title.texture[wallet]; 
		_mesh.material.needsUpdate = true;

		animate(_mesh, target, true, 2000);
	}

	/**
	* @author Ricardo Delgado
	* Wallet focus and draw the other planes in the same group wallet.
	* @param {Number}    id    Wallet identifier focus.
	*/ 
	function change(id) {

		var duration = 2000;
		var focus = parseInt(id);

		if (window.camera.getFocus() === null) {

			action.state = true; action.mesh = id;

			tileManager.letAlone();

			window.camera.setFocus(self.objects.mesh[focus], new THREE.Vector4(0, 0, window.TILE_DIMENSION.width - window.TILE_SPACING, 1), duration);
			
			headers.hideHeaders(duration);
			
			window.helper.showBackButton();

			positionFocus(id);
		}
	}

	/**
	* @author Ricardo Delgado
	* Screenshots account total has a wallet.
	* @param {String}    Wallet    Wallet counting.
	*/ 
	function countControl(wallet){

		var sum = 0;
		
		for (var i in CONTROL[wallet])
			sum++;

		return sum;
	}

	/**
	* @author Ricardo Delgado
	* Accommodate the wallet.
	* @param {Number}    id    Identifier reference wallet.
	*/ 
	function positionFocus(id) {

		var ignore = id,
			mesh = self.objects.mesh[id],
			wallet = mesh.userData.wallet,
			target = {},
			count = 1,
			_countControl = countControl(wallet),
			x = POSITION_X;

		showTitle(wallet, mesh);
			
		target = { x: mesh.position.x - (x / 2), y : mesh.position.y, z : mesh.position.z };
        
		if (_countControl > 3)
			animate(mesh, target, true, 1000);

		setTimeout( function() { loadTexture(wallet, ignore); }, 500 );

		setTimeout( function() { 

			for(var i = 0; i < 4; i++) { 

				if (count < 4){ 

					if (count < _countControl){

						if ( i != ignore ) { 

							var _mesh = self.objects.mesh[i];

							if(_countControl > 3){ 

								if (x === POSITION_X) {

									x = x * 2;
								}
								else if (x > POSITION_X) { 

									x = (x / 2) * -1;
								}
								else { 

									x = POSITION_X;
								}

							}
							else{

								if (count === 1) {

									x = x;
								}
								else{ 

									x = x * -1;
								}
							}

							count++;

							target = { x: mesh.position.x + x, y : mesh.position.y, z : mesh.position.z };

							animate(_mesh, target, true, 2000);

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
	function loadTexture(wallet, ignore) {

		var id = 1,
			_mesh,
			count = 1,
			_countControl = countControl(wallet);

		for(var i = 0; i < 4; i++) { 

			if (count < 4){ 

				if (count < _countControl){

					if (i != ignore) { 

						id = id + 1 ;

						_mesh = self.objects.mesh[i];
						_mesh.material.map = searchWallet ( wallet, id ); 
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
	function resetTexture(ignore) {

		var title = self.objects.title.mesh.mesh, 
			_mesh;

		self.hide(); 

		animate(title, self.objects.title.mesh.target, false, 1000); 

		setTimeout(function() {   

			for(var i = 0; i < self.objects.mesh.length; i++) { 

				if (i != ignore) { 

					_mesh = self.objects.mesh[i];
					_mesh.material.map = searchWallet ( _mesh.userData.wallet, 1 ); 
					_mesh.material.needsUpdate = true;
				}
			} 

			action.state = false;

			self.show();  

		}, 1000);
	}

	/**
	* @author Ricardo Delgado
	* Animation and out of the wallet.
	* @param {object}     mesh     Wallet.
	* @param {Number}    target    Coordinates wallet.
	* @param {Boolean}   state     Status wallet.
	* @param {Number}   duration   Animation length.
	*/ 
	function animate(mesh, target, state, duration){

		var _duration = duration || 2000,
			x,
			y,
			z,
			rx,
			ry,
			rz;

		if (state) {

		   x = target.x;
		   y = target.y;
		   z = target.z;
		   
		   rx = 0;
		   ry = 0;
		   rz = 0;
		} 
		else {

		   x = target.px;
		   y = target.py;
		   z = target.pz;
		   
		   rx = target.rx;
		   ry = target.ry;
		   rz = target.rz; 
		}   

		new TWEEN.Tween(mesh.position)
			.to({x : x, y : y, z : z}, Math.random() * _duration + _duration)
			.easing(TWEEN.Easing.Exponential.InOut)
			.start();

		new TWEEN.Tween(mesh.rotation)
			.to({x: rx, y: ry, z: rz}, Math.random() * duration + duration)
			.easing(TWEEN.Easing.Exponential.InOut)
			.start();
   }

}
