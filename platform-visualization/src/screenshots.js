/**
 * @author Ricardo Delgado
 * Create screenshots of android with your images and functions
 */
function ScreenshotsAndroid() {

   var action = { state : false, mesh : null };

   this.objects = {
            mesh : [],
            target : [],
            textura : []
        };

   var self = this;


   this.init = function () {

     addWallet("teens");
     addWallet("publisher");
     addWallet("kids");
     addWallet("store");

     addMesh (-22638,"teens"); 
     addMesh (-22407,"publisher"); 
     addMesh (-22176,"kids"); 
     addMesh (-26103,"store");
   
   };
  
   function addWallet( wallet ) {

     for (i = 1; i <= 4; i++) {

          addTextura ( wallet, i );

     }

   }

   function searchWallet ( wallet, id){
   
     var i = 0;

     while(self.objects.textura[i].wallet != wallet || self.objects.textura[i].id != id){
             i = i + 1 ;
         }  

     return self.objects.textura[i].image;

   }

   function addMesh ( Position, wallet) {

      var id = self.objects.mesh.length;
          px = Math.random() * 80000 - 40000,
          py = Math.random() * 80000 - 40000,
          pz = 80000 * 2,
          rx = Math.random() * 180,
          ry = Math.random() * 180,
          rz = Math.random() * 180,
          textura = searchWallet ( wallet, 1);

      mesh = new THREE.Mesh(
                 new THREE.PlaneGeometry( 50, 80 ),
                 new THREE.MeshBasicMaterial({map:textura, side: THREE.FrontSide, transparent: true})
                 );

      mesh.material.needsUpdate = true;

      mesh.userData = { id : id, wallet : wallet };

      mesh.material.opacity = 1;

      mesh.scale.set(4,4,4);

      var target = { x : Position, y : 2760, z : 0,
                     px : px, py : py, pz : pz,
                     rx : rx, ry : ry, rz : rz };

      mesh.position.set( px, py, pz );
      mesh.rotation.set( rx, ry, rz );

      window.scene.add(mesh);

      self.objects.target.push(target);

      self.objects.mesh.push(mesh);

   }

   function addTextura ( wallet, i ) {

      var texture,
          image,
          id;
  
      image = new THREE.ImageUtils.loadTexture("images/screenshots android/wallet_"+wallet+"_"+i+".png");
      image.needsUpdate = true;  
      image.minFilter = THREE.NearestFilter;
      
      texture = { wallet : wallet, image : image, id : i }

      self.objects.textura.push(texture);

   }

   this.hide_Screenshots = function (){

      var ignore;

      if (action.state) ignore = action.mesh;

      for(i = 0; i < self.objects.mesh.length; i++){ 

          if (i != ignore)  

          animate_Screenshots ( self.objects.mesh[i], self.objects.target[i], false, 1500 );

     }

   }; 

   this.show_Screenshots = function (){


     if (action.state) reset_texture (action.mesh);

     else 
 
     for(i = 0; i < self.objects.mesh.length; i++) { 

       animate_Screenshots ( self.objects.mesh[i], self.objects.target[i], true, 2000 );

     };

   };

   this.change_Screenshots = function ( id ) {

     if (camera.getFocus() == null) {

     action.state = true; action.mesh = id;

     camera.setFocus_Screenshots( id, 2000);

     browserManager.modifyButtonBack(1,'block');

     position_focus( id );

     camera.disable();

     }

   };

   function position_focus( id ) {
   
     var ignore = id,
         contante = 231,
         mesh = self.objects.mesh[id],
         wallet = mesh.userData.wallet,
         target,
         x = contante;

     target = {x: mesh.position.x - ( x / 2), y : mesh.position.y, z : mesh.position.z};

     animate_Screenshots ( mesh, target, true, 1000 );

     setTimeout(function() { load_texture ( wallet, ignore ); add_title(wallet); }, 500);

     setTimeout(function() { 

         for(i = 0; i < self.objects.mesh.length; i++) { 

             if ( i != ignore ){ 
             	 
                 var _mesh = self.objects.mesh[i];

                 if (x === contante ) x = x * 2;

                 else if ( x > contante ) x = (x / 2) * -1;

                 else x = contante;

                 target = { x: mesh.position.x + x, y : mesh.position.y, z : mesh.position.z };

                 animate_Screenshots ( _mesh, target, true, 2000 );

                 }             

            }

       }, 1500);

   }

   function add_title(text){
  
     var title = document.createElement('h5');
         title.id = 'title_Screenshots';
         title.style.position = 'absolute';
         title.innerHTML = "Wallet " + text;
         title.style.top = '70px';
         title.style.left = '46%';
         title.style.fontSize = "28px"
         title.style.zIndex = 10;
         title.style.opacity = 0;

        document.body.appendChild(title);

        helper.show(title, 1000);

   }

   function load_texture ( wallet, ignore ) {

     var id = 1;

     for(i = 0; i < self.objects.mesh.length; i++) { 

         if (i != ignore ) { id = id + 1 ;

               var _mesh = self.objects.mesh[i];
                   _mesh.material.map = searchWallet ( wallet, id ); 
                   _mesh.material.needsUpdate = true;

             }

          } 

   }
  
   function reset_texture ( ignore ) {

     var title = document.getElementById('title_Screenshots'); 

     self.hide_Screenshots(); helper.hide(title, 1000);

     setTimeout(function() {    

       for(i = 0; i < self.objects.mesh.length; i++) { 

          if ( i != ignore ) { 

                 var _mesh = self.objects.mesh[i];
                     _mesh.material.map = searchWallet ( _mesh.userData.wallet, 1 ); 
                     _mesh.material.needsUpdate = true;

            }

         } 

       action.state = false;

       self.show_Screenshots();  

     }, 1000);

   }

   function animate_Screenshots ( mesh, target, state, duration ){

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

        } else {

           x = target.px;
           y = target.py;
           z = target.pz;
           
           rx = target.rx;
           ry = target.ry;
           rz = target.rz; 
        }   

        var tween = new TWEEN.Tween(mesh.position);
        tween.to({x : x, y : y, z : z}, Math.random() * _duration + _duration);
        tween.easing(TWEEN.Easing.Exponential.InOut);
        tween.onUpdate(render);
        
        tween.start();

        tween = new TWEEN.Tween(mesh.rotation);
        tween.to({x: rx, y: ry, z: rz}, Math.random() * duration + duration);
        tween.easing(TWEEN.Easing.Exponential.InOut);
        tween.onUpdate(render); 
        tween.start();

   }

}
