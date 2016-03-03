/**
 * @author Isaias Taborda
 * function creates a guide to help inexperienced users navigate the site
 */
function Guide() {

	  this.objects = {
            mesh : []
    };

    var active = false;

    var self = this;
    
    var wide = (Math.floor(window.camera.aspectRatio * 10) !== Math.floor(40/3));
    
    var Z = 63000;

    /**
     * @author Isaías Taborda
     * Create help text.
     * @param {String array}  text    Information text.
     * @param {Number}        width   Text box width.
     * @param {Number}        height  Text box height.
     * @param {Number}        posX    Objetive x position.
     * @param {Number}        posY    Objetive y position.
     */
   this.createHelp = function (text, width, height, posX, posY) {

        var canvas1 = document.createElement('canvas');
        canvas1.width = width;
        canvas1.height = height;
        var context1 = canvas1.getContext('2d');
        context1.fillStyle = "#62C2A3";
        roundRectangle(context1,0,0,canvas1.width,canvas1.height);
        context1.font = "Bold 400px Arial";
        context1.fillStyle = "white";

        size = text.length+1;
        spacing = 0;
        for(var i=1; i < size; i++){
           line = text.shift();
           context1.fillText(line, 80, (375 * i) + spacing);
           spacing += 75;
        }

        var texture1 = new THREE.Texture(canvas1) 
        texture1.needsUpdate = true;
            
        var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
        material1.transparent = true;

        var mesh1 = new THREE.Mesh(
            new THREE.PlaneGeometry(canvas1.width, canvas1.height),
            material1
        );

        mesh1.position.set(0,0,-10000);
        window.scene.add(mesh1);
        self.objects.mesh.push(mesh1);
        popUp(mesh1, posX, posY, 2000);

    }

    /**
     * @author Isaías Taborda
     * Creates a round corner rectangle for the text.
     * @param {Object}  ctx    Context.
     * @param {Number}  x      X-axis position.
     * @param {Number}  y      Y-axis position.
     * @param {Number}  width  Width size.
     * @param {Number}  heigth Height size.
     */
    function roundRectangle(ctx, x, y, width, height) {
      
      radius = 100;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();       
    }

   /**
     * @author Isaías Taborda.
     * Animate Button.
     * @param {Object}     mesh         Text field.
     * @param {Number}     targetx      The objetive x position.
     * @param {Number}     targety      The objetive y position.
     * @param {Number} [duration=2000] Duration of the animation.
     */
    function popUp(mesh, targetX, targetY, duration) {

          var _duration = duration || 2000,
              x = targetX,
              y = targetY,
              z = Z;

          new TWEEN.Tween(mesh.position)
              .to({
                x : x,
                y : y,
                z : z}, 
              _duration)
              .easing(TWEEN.Easing.Exponential.InOut)
              .onUpdate(window.render)
              .start();

    }

    /**
     * @author Isaías Taborda.
     * Eliminates the help text.
     */
    this.removeHelp = function(){
      var duration = 3000;
      var i;
      var l = self.objects.mesh.length; 

        for(var i = 0; i < l; i++) {
          new TWEEN.Tween(self.objects.mesh[i].position)
            .to({
                x : 0,
                y : 0,
                z : -10000
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Bounce.In)
            .start();
        }

        for(var i = 0; i < l; i++) {
            window.scene.remove(self.objects.mesh[i]); // this was separated so the canvas text animates before being deleted
        }
        self.objects.mesh = [];
  };
}