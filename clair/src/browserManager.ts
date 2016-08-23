/**
 * @author Ricardo Delgado
 * @last modified By Miguel Celedon
 * function create a Buttons Browser and charge your textures
 */
class BrowserManager {

       objects = {
            mesh : []
    };

    wide = (Math.floor(globals.camera.aspectRatio * 10) !== Math.floor(40 / 3));
    
    LOWER_LAYER = 63000
    POSITION_X = (this.wide) ? 15000 : 12000
    POSITION_Y = (this.wide) ? 7500 : 8000
    SCALE = (this.wide) ? 70 : 40;

    onClick = (target : THREE.Mesh) => {
       this.actionButton(target.userData.view);
    };

     /**
     * @author Ricardo Delgado
     * Pressed button function.
     * @param {String} view  vista a cargar
     */
    actionButton(view : string) : void {
       goToView(view);
    }

   /**
     * @author Ricardo Delgado
     * Button changes the value legend.
     * @param {Number}  valor    value of opacity.
     * @param {String} display   button status.
     */
   modifyButtonLegend(valor : number, display : string) : void{
    
      let browserButton = document.getElementById('legendButton');
      
      $(browserButton).fadeTo(1000, valor, () => {
            $(browserButton).show();
            browserButton.style.display = display;
      });
   };

   /**
    * @author Ricardo Delgado
    * Initialization of the arrows
    */
   init(): void {
       for (let view in globals.map.views) {
           this.loadView(view);
       }
   };
    
   /**
    * @author Ricardo Delgado
    * Loading the necessary views and arrows according to letible map. 
    * @param {String} view  view to load
    */
    loadView(view : string) : void {
        
        let directions = ['up', 'down', 'right', 'left'];
        let newCenter = new THREE.Vector3(0, 0, 0);
        newCenter = globals.viewManager.translateToSection(view, newCenter);
        
        if(globals.map.views[view].enabled !== true)
            this.showSign(newCenter);
        
        let dir = '';

        for(let i = 0; i < directions.length; i++) {
            //Get up, down, left and right views
            dir = globals.map.views[view][directions[i]];
            if(dir !== '')
                this.addArrow(dir, newCenter.x, newCenter.y, directions[i]);
        }
    }
    
    /**
     * Shows a sign in the given position
     * @author Miguel Celedon
     * @param {THREE.Vector3} center Center of the sign
     */
    showSign(center : THREE.Vector3) : void{
        
        let newCenter = center.clone();
        newCenter.z = this.LOWER_LAYER;
        
        let texture = THREE.ImageUtils.loadTexture('images/sign.png');
        texture.minFilter = THREE.NearestFilter;
        
        //Create placeholder for now
        let sign = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(8000, 6000),
            new THREE.MeshBasicMaterial({color : 0xFFFFFF, map : texture})
        );
        
        sign.position.copy(newCenter);
        globals.scene.add(sign);
    }

   /**
     * @author Ricardo Delgado
     * creating arrows.
     * @param {String}   view    view load.
     * @param {Number}  center   camera Center.
     * @param {String}  button   position arrow.
     */
   addArrow(view : string, centerX : number, centerY : number, button : string) : void {

        let mesh,
            _position,
            id = this.objects.mesh.length;

        mesh = new THREE.Mesh(
               new THREE.PlaneBufferGeometry(60, 60),
               new THREE.MeshBasicMaterial({ map: null, side: THREE.FrontSide, transparent: true })
        );
    
       _position = this.calculatePositionArrow(centerX, centerY, button);

       mesh.position.set(_position.x, _position.y, _position.z);

       mesh.scale.set(this.SCALE, this.SCALE, this.SCALE);

       mesh.userData = { 
        id : id ,
        arrow : button, 
        view : view,
        onClick: this.onClick
       };

       mesh.material.opacity = 1;
    
       globals.scene.add(mesh);
    
       this.objects.mesh.push(mesh);

       this.addTexture(view, button, mesh);

   }

   /**
     * @author Ricardo Delgado
     * Calculate Position Arrow .
     * @param {Number}  center   camera Center.
     * @param {String}  button   position arrow.
     */
   calculatePositionArrow(centerX : number, centerY : number, button : string) : Object {

      let position = {},
          x = centerX,
          y = centerY,
          z = 80000 * -2; 

     if(button === "right")
         x = centerX + this.POSITION_X; 
     else if(button === "left")
         x = centerX + (this.POSITION_X * -1);
     else if(button === "up")
         y = centerY + this.POSITION_Y;
     else 
         y = centerY + (this.POSITION_Y * -1);

     position = { x: x, y: y, z: z };

     return position;

   }

   /**
     * @author Ricardo Delgado
     * Creates textures arrows and stored in the letiable texture.
     * @param {String}   view    view.
     * @param {String}  button   image to use.
     * @param {object}   mesh    button to load texture.
     */
   addTexture(view : string, button : string, mesh : THREE.Mesh) : void {
       
        let canvas,
            ctx,
            img = new Image(),
            texture,
            config = this.configTexture(view, button);

        canvas = document.createElement('canvas');
        canvas.width  = 400;
        canvas.height = 370;

        ctx = canvas.getContext("2d");
        ctx.globalAlpha = 0.90;

        img.src = "images/browsers_arrows/arrow-"+button+".png";

        img.onload = () => {

            ctx.textAlign = 'center';

            ctx.font = config.text.font;
            Helper.drawText(config.text.label, 200, config.image.text, ctx, canvas.width, config.text.size);
            ctx.drawImage(img, config.image.x, config.image.y, 200, 200);

            texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;  
            texture.minFilter = THREE.NearestFilter;

            (mesh.material as any).map = texture;
            mesh.material.needsUpdate = true;

            this.animate(mesh, this.LOWER_LAYER, 3000);

        };

   }

   /**
     * @author Ricardo Delgado
     * Configures all texture options.
     * @param {String}   view    view.
     * @param {String}  button   image to use.
     */
   configTexture(view : string, button : string) : any {
                
       let config : any,
           text = {},
           image = {},
           label;

       if (button !== "down")
           image = { x: 100, y: 0, text: 238 };
       else
           image = { x: 100, y: 120, text: 108 };

       label = globals.map.views[view].title;
       text = { label: label, font: "48px Canaro, Sans-serif", size: 48 };
       config = { image: image, text: text };
       return config;

   }

   /**
     * @author Ricardo Delgado.
     * Animate Button.
     * @param {Object}     mesh        Button.
     * @param {Number}     target      The objetive Z position.
     * @param {Number} [duration=2000] Duration of the animation.
     */
   animate(mesh : THREE.Mesh, target : number, duration = 2000) {

        let z = target;

        new TWEEN.Tween(mesh.position)
            .to({z : z}, duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .onUpdate(render)
            .start();

   }

}