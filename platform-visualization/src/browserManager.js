/**
 * @author Ricardo Delgado
 * @last modified By Miguel Celedon
 * function create a Buttons Browser and charge your textures
 */
function BrowserManager() {

       this.objects = {
            mesh : []
        };

    var self = this;
    
    var wide = (Math.floor(camera.aspectRatio * 10) !== Math.floor(40/3));
    
    var LOWER_LAYER = 63000,
        POSITION_X = (wide) ? 13500 : 12000,
        SCALE = (wide) ? 70 : 40;

     /**
     * @author Ricardo Delgado
     * Pressed button function.
     * @param {String} view  vista a cargar
     */
    this.actionButton = function ( view ) {

        window.goToView(view);

    };

    this.drawMap = function ( _map ) {

        window.map = _map;
    }

   /**
    * @author Ricardo Delgado
    * Button changes the value back.
    * @param {Number} valor    value of opacity
    * @param {String} display  button status
    */
   this.modifyButtonBack = function ( valor, display ) {
    
       var browserButton = document.getElementById('backButton');

       $(browserButton).fadeTo(1000, valor, function() {

           $(browserButton).show();

           browserButton.style.display = display;

       });

   };

   /**
     * @author Ricardo Delgado
     * Button changes the value legend.
     * @param {Number}  valor    value of opacity.
     * @param {String} display   button status.
     */
   this.modifyButtonLegend = function ( valor, display ) {
    
      var browserButton = document.getElementById('legendButton');
      
      $(browserButton).fadeTo(1000, valor, function() {

            $(browserButton).show();

            browserButton.style.display = display;

      });
  
   };

   /**
    * @author Ricardo Delgado
    * inicializacion de las arrow 
    */
   this.init = function () {
      
      
      setTimeout(function() {

        loadview('table');

        loadview("stack");

      }, 5000);


   };
   /**
    * @author Ricardo Delgado
    * Loading the necessary views and arrows according to varible map. 
    * @param {String} view  vista a cargar
    */
   function loadview(view){

      var top,
          bottom,
          right,
          left;

      var newCenter = new THREE.Vector3(0, 0, 0);

          newCenter = viewManager.translateToSection(view, newCenter);

      switch(view) {

        case 'table':

          /*top  = window.map.table.top;
          bottom = window.map.table.bottom;*/
          right  = window.map.table.right;
          left   = window.map.table.left;
          
         /* if ( top != "" ) addArrow( top, center,"top");  

          if ( bottom != "" ) addArrow( bottom, center, "top");*/ 

          if ( right !== "" ) addArrow( right, newCenter.x, "right"); 

          if ( left !== "" ) addArrow( left, newCenter.x, "left"); 
           
        break;

        case 'stack':

         /* top  = window.map.stack.top;
          bottom = window.map.stack.bottom;*/
          right  = window.map.stack.right;
          left   = window.map.stack.left;
          
         /* if ( top != "" ) addArrow( top, center,"top");  

          if ( bottom != "" ) addArrow( bottom, center, "top"); */

          if ( right !== "" ) addArrow( right, newCenter.x, "right"); 

          if ( left !== "" ) addArrow( left, newCenter.x, "left");                     
            
        break;
      }

   }

   /**
     * @author Ricardo Delgado
     * creacion de las flechas.
     * @param {String}   view    view load.
     * @param {Number}  center   camera Center.
     * @param {String}  button   position arrow.
     */
   function addArrow ( view, center, button ) {

        var mesh,
            posicion,
            z = 80000 * -2,
            id = self.objects.mesh.length;

        mesh = new THREE.Mesh(
                new THREE.PlaneGeometry( 80, 80 ),
                new THREE.MeshBasicMaterial( { map:null , side: THREE.FrontSide, transparent: true } ));
    
        if ( button === "right" ) {

            POSITION_X = center + POSITION_X; 

            posicion = { x: POSITION_X, y: 0, z: z };

        } else {

           POSITION_X = center + ( POSITION_X * -1 );

           posicion = { x: POSITION_X, y: 0, z: z };

       }

       mesh.position.set( posicion.x, 
                          posicion.y, 
                          posicion.z );

       mesh.scale.set( SCALE, SCALE, SCALE );
       mesh.userData = { id : id ,arrow : button, view : view };
       mesh.material.opacity = 1;
    
       window.scene.add(mesh);
    
       self.objects.mesh.push(mesh);

       addTextura ( view, button, mesh );

   }

   /**
     * @author Ricardo Delgado
     * Creates textures arrows and stored in the variable texture.
     * @param {String}   view    view.
     * @param {String}  button   image to use.
     * @param {object}   mesh    button to load texture.
     */
   function addTextura ( view, button, mesh) {

      var canvas,
          ctx,
          img = new Image(),
          texture,
          fontside,
          imageside,
          label;

      if ( view === "table" ) {

        fontside = { font: "20px Arial", size : 20 };

        label = "View Table";

      }

      else if ( view === "stack" ) { 

        fontside = { font: "14px Arial", size : 14, x: 70, y: 70 };

        label = "View Dependencies";

      }

      if ( button === "right" ) {

        imageside = { x: 15 };

      } else  {

        imageside = { x: 0 };

      }

        canvas = document.createElement('canvas');
        canvas.width  = 90;
        canvas.height = 90;

        ctx = canvas.getContext("2d");

        img = new Image(); 
        img.src = "images/browsers_arrows/arrow-"+button+".png";

        img.onload = function () {

          ctx.font = fontside.font;
          helper.drawText( label, 0, 65, ctx, canvas.width, fontside.size );
          ctx.drawImage(img, imageside.x, 0, 40, 40);

          texture = new THREE.Texture(canvas);
          texture.needsUpdate = true;  
          texture.minFilter = THREE.NearestFilter;

          mesh.material.map = texture;
          mesh.material.needsUpdate = true;

          animate( mesh, 2500, LOWER_LAYER );
      };

   }

   /**
     * @author Ricardo Delgado.
     * Animate Button.
     * @param {Object}     mesh        Button.
     * @param {Number} [duration=2000] Duration of the animation.
     * @param {Number}     target      The objetive Z position.
     */
   function animate ( mesh, duration, target ){

        var _duration = duration || 2000,
            z = target;

        var tween = new TWEEN.Tween(mesh.position);
        tween.to({z : z}, 2000);
        tween.delay( _duration );
        tween.easing(TWEEN.Easing.Exponential.InOut);
        tween.onUpdate(render);
        
        tween.start();

   }

}