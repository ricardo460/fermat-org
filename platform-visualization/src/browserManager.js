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
    
    var wide = (Math.floor(window.camera.aspectRatio * 10) !== Math.floor(40/3));
    
    var LOWER_LAYER = 63000,
        POSITION_X = (wide) ? 13500 : 12000,
        POSITION_Y = (wide) ? 6900 : 6100,
        SCALE = (wide) ? 70 : 40;

    var onClick = function (target) {

       actionButton(target.userData.view);

    };

     /**
     * @author Ricardo Delgado
     * Pressed button function.
     * @param {String} view  vista a cargar
     */
    function actionButton (view) {

       window.goToView(view);

    }

   /**
    * @author Ricardo Delgado
    * Button changes the value back.
    * @param {Number} valor    value of opacity
    * @param {String} display  button status
    */
   this.modifyButtonBack = function (valor, display) {
    
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
   this.modifyButtonLegend = function (valor, display) {
    
      var browserButton = document.getElementById('legendButton');
      
      $(browserButton).fadeTo(1000, valor, function() {

            $(browserButton).show();

            browserButton.style.display = display;

      });
  
   };

   /**
    * @author Ricardo Delgado
    * Initialization of the arrows
    */
   this.init = function () {
          
      setTimeout(function() {

        loadView('table');

        loadView('stack');

      }, 5000);

   };
   /**
    * @author Ricardo Delgado
    * Loading the necessary views and arrows according to varible map. 
    * @param {String} view  view to load
    */
   function loadView (view) {

      var up,
          down,
          right,
          left;

      var newCenter = new THREE.Vector3(0, 0, 0);

          newCenter = window.viewManager.translateToSection(view, newCenter);

      switch(view) {

        case 'table':

          up    = window.map.table.up;
          down = window.map.table.down;
          right  = window.map.table.right;
          left   = window.map.table.left;
          
          if (up !== "") addArrow(up, newCenter.x, newCenter.y, "up");  

          if (down !== "") addArrow(down, newCenter.x, newCenter.y, "down");

          if (right !== "") addArrow(right, newCenter.x, newCenter.y, "right"); 

          if (left !== "") addArrow(left, newCenter.x, newCenter.y, "left"); 
           
        break;

        case 'stack':

          up    = window.map.stack.up;
          down = window.map.stack.down;
          right  = window.map.stack.right;
          left   = window.map.stack.left;
          
          if (up !== "") addArrow(up, newCenter.x, newCenter.y, "up");  

          if (down !== "") addArrow(down, newCenter.x, newCenter.y, "down"); 

          if (right !== "") addArrow(right, newCenter.x, newCenter.y, "right"); 

          if (left !== "") addArrow(left, newCenter.x, newCenter.y, "left");                     
            
        break;

      }

   }

   /**
     * @author Ricardo Delgado
     * creating arrows.
     * @param {String}   view    view load.
     * @param {Number}  center   camera Center.
     * @param {String}  button   position arrow.
     */
   function addArrow (view, centerX, centerY, button) {

        var mesh,
            _position,
            id = self.objects.mesh.length;

        mesh = new THREE.Mesh(
               new THREE.PlaneGeometry( 80, 80 ),
               new THREE.MeshBasicMaterial( { map:null , side: THREE.FrontSide, transparent: true } ));
    
       _position = calculatePositionArrow (centerX, centerY, button);

       mesh.position.set( _position.x, 
                          _position.y, 
                          _position.z );

       mesh.scale.set(SCALE, SCALE, SCALE);

       mesh.userData = { 
        id : id ,
        arrow : button, 
        view : view,
        onClick : onClick };

       mesh.material.opacity = 1;
    
       window.scene.add(mesh);
    
       self.objects.mesh.push(mesh);

       addTextura (view, button, mesh);

   }

   /**
     * @author Ricardo Delgado
     * Calculate Position Arrow .
     * @param {Number}  center   camera Center.
     * @param {String}  button   position arrow.
     */
   function calculatePositionArrow (centerX, centerY, button) {

      var position = {},
          x = centerX,
          y = centerY,
          z = 80000 * -2; 

      if ( button === "right" ) { 

          x = centerX + POSITION_X; 
      }
      else if ( button === "left" ) { 

        x = centerX + ( POSITION_X * -1 );
      }
      else if ( button === "up" ) { 

         y = centerY + POSITION_Y;
      }
      else { 

         y = centerY + ( POSITION_Y * -1 );
      }

     position = { x: x, y: y, z: z };

     return position;

   }

   /**
     * @author Ricardo Delgado
     * Creates textures arrows and stored in the variable texture.
     * @param {String}   view    view.
     * @param {String}  button   image to use.
     * @param {object}   mesh    button to load texture.
     */
   function addTextura (view, button, mesh) {

      var canvas,
          ctx,
          img = new Image(),
          texture,
          config = configTexture(view, button);

        canvas = document.createElement('canvas');
        canvas.width  = 90;
        canvas.height = 90;

        ctx = canvas.getContext("2d");

        img = new Image(); 
        img.src = "images/browsers_arrows/arrow-"+button+".png";

        img.onload = function () {

          ctx.font = config.text.font;
          window.helper.drawText(config.text.label, 0, config.image.text, ctx, canvas.width, config.text.size);
          ctx.drawImage(img, config.image.x, config.image.y, 40, 40);

          texture = new THREE.Texture(canvas);
          texture.needsUpdate = true;  
          texture.minFilter = THREE.NearestFilter;

          mesh.material.map = texture;
          mesh.material.needsUpdate = true;

          animate(mesh, LOWER_LAYER, 3000);

        };

   }

   /**
     * @author Ricardo Delgado
     * Configures all texture options.
     * @param {String}   view    view.
     * @param {String}  button   image to use.
     */
   function configTexture (view, button) {
     
    var config = {},
        text = {},
        image = {},
        label;

    if (button === "right") {  

        image = { x: 15, y : 0, text : 65 };
    }
    else if (button === "left") { 

        image = { x: 0, y : 0, text : 65 };
    }
    else if (button === "up") { 

        image = { x: 18, y : 0, text : 65 };
    }
    else { 

        image = { x: 18, y : 25, text : 12 };
    }



    if ( view === "table") { 

      label = window.map.table.title;
    }
    else if (view === "stack") { 

      label = window.map.stack.title;
    }

    text = { label : label, font: "13px Arial", size : 12 };

    config = { image, text };

    return config;

   }

   /**
     * @author Ricardo Delgado.
     * Animate Button.
     * @param {Object}     mesh        Button.
     * @param {Number}     target      The objetive Z position.
     * @param {Number} [duration=2000] Duration of the animation.
     */
   function animate (mesh, target, duration) {

        var _duration = duration || 2000,
            z = target;

        new TWEEN.Tween(mesh.position)
            .to({z : z}, 2000)
            .delay( _duration )
            .easing(TWEEN.Easing.Exponential.InOut)
            .onUpdate(window.render)
            .start();

   }

}