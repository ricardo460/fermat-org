var testFlow = 
{
    name : 'Nombre que describe al flujo',
    description : 'Descripcion del proceso',
    steps : [
        {
            title : 'Paso uno',
            desc : 'Paso inicial del flujo',
            element : 'cor/core/fermat core',               // Grupo/Layer/Nombre
            next : [1]                                      // Una lista de indices del mismo array
        },
        {
            title : 'Paso dos',
            desc : 'Este le sigue al paso uno\ncon salto de línea',
            element : 'ccm/reference wallet/discount wallet',
            next : [2]
        },
        {
            title : 'Paso tres',
            desc : 'Este se bifurca en dos pasos',
            element : 'bnp/reference wallet/bank notes',
            next : [3, 1]
        },
        {
            title : 'Paso tres punto a',
            desc : 'Este es uno de los que sigue del 3',
            element : 'dap/actor/asset issuer',
            next : []
        }
    ]
};

var processes = [{
    name: 'Generacion Asset en Wallet Factory',
    description: '',
    steps: [{
        type: 'start',
        title: 'Bitcoin Wallet',
        desc: 'long getAvailableBalance()\nObtiene el balance actual de los bitcoins para habilitar el boton de publicar calculando el monto total de los bitcoins a necesitar para enviar los assets\nMonto Total: (Cantidad de Assets * Valor Unitario) + fee',
        suprlay: null,
        platfrm: 'DAP',
        layer: 'sub app',
        comp: 'wallet factory',
        next: [1]
    }, {
        type: 'activity',
        title: 'Asset Issuing Transaction',
        desc: 'void issueAsset(DigitalAsset, amount, blockchainNetworkType)\nInicia la transacción de IssueAsset pasando el DigitalAsset y la cantidad de assets a generar',
        suprlay: null,
        platfrm: 'DAP',
        layer: 'sub app',
        comp: 'wallet factory',
        next: [2]
    }, {
        type: 'activity',
        title: 'Bitcoin Wallet',
        desc: 'long getAvailableBalance()\nObtiene el balance actual de los bitcoins para habilitar el boton de publicar calculando el monto total de los bitcoins a necesitar para enviar los assets\nMonto Total: (Cantidad de Assets * Valor Unitario) + fee',
        suprlay: null,
        platfrm: 'DAP',
        layer:  'digital asset transaction',
        comp: 'asset issuing',
        next: [3]
    }, {
        type: 'activity',
        title: 'Asset CryptoVault',
        desc: 'CryptoAddress getNewAssetVaultCryptoAddress(BlockchainAddress)\nLa asset vault entrega una direccio bitcoin que es registrada en el Address Book. Esta direccion es la Genesis Address',
        suprlay: null,
        platfrm: 'DAP',
        layer:  'digital asset transaction',
        comp: 'asset issuing',
        next: [4, 5]
    }, {
        type: 'preparation',
        title: 'Address Book',
        desc: 'NA\nRegistra la GenesisAddress en el address book para detectar luego el ingreso del bitcoin',
        suprlay: null,
        platfrm: 'DAP',
        layer: null,
        comp: 'Asset CryptoVault',
        next: []
    }, {
        type: 'activity',
        title: 'Asset Issuing Transaction',
        desc: 'private bool isDigitalAssetComplete()\nMe aseguro que el DigitalAsset esta completo antes de generar el hash del mismo y formar el objeto DigitalAssetMetadata',
        suprlay: null,
        platfrm: 'DAP',
        layer:  'digital asset transaction',
        comp: 'asset issuing',
        next: [6]
    }, {
        type: 'activity',
        title: 'Outgoing Intra Actor',
        desc: 'public String sendCrypto(String walletPublicKey, CryptoAddress destinationAddress, String op_Return, long cryptoAmount, String description, String senderPublicKey, String receptorPublicKey, Actors senderActorType, Actors receptorActorType, ReferenceWallet referenceWallet)\nHago el envio de los bitcoins a traves del Outgoing Intra Actor Transaction. El mismo va a generar una transaccion bitcoin y me va a devolver el hash de la misma. Este hash es la genesis transaction que debo ingresar en el DigitalAssetMetadata',
        suprlay: null,
        platfrm: 'DAP',
        layer:  'digital asset transaction',
        comp: 'asset issuing',
        next: [7]
    }, {
        type: 'activity',
        title: '',
        desc: 'Genero y persisto el objeto DigitalAssetMetadata, que forma la "mitad" del asset',
        suprlay: null,
        platfrm: 'DAP',
        layer:  'digital asset transaction',
        comp: 'asset issuing',
        next: [3, 8]
    }, {
        type: 'preparation',
        title: 'cloud',
        desc: '',
        suprlay: null,
        platfrm: null,
        layer: null,
        comp: null,
        next: [9]
    }, {
        type: 'activity',
        title: 'Incoming Crypto',
        desc: 'NA\nDetecta la llegada de Bitcoins a la GenesisAddress y dispara el evento de IncomingCryptoDigitalAssetOnCryptoNetwork',
        suprlay: null,
        platfrm: 'DAP',
        layer:  'digital asset transaction',
        comp: 'asset issuing',
        next: [10]
    }, {
        type: 'activity',
        title: 'Issuer AssetWallet',
        desc: 'bookCredit(DigitalAssetMetadata)\nGenera un credito en el book balance de la Issuer Asset Wallet y persiste el DigitalAssetMetadata en la Issuer Wallet',
        suprlay: null,
        platfrm: 'DAP',
        layer:  'digital asset transaction',
        comp: 'asset issuing',
        next: [11]
    }, {
        type: 'activity',
        title: 'Incoming Crypto',
        desc: 'NA\nDetecta la llegada de Bitcoins a la GenesisAddress y dispara el evento de IncomingCryptoDigitalAssetOnBlockChain',
        suprlay: null,
        platfrm: 'DAP',
        layer:  'digital asset transaction',
        comp: 'asset issuing',
        next: [12]
    }, {
        type: 'end',
        title: 'Issuer AssetWallet',
        desc: 'availableCredit(DigitalAssetMetadata)\nGenera un credito en el available balance de la Issuer Asset Wallet',
        suprlay: null,
        platfrm: 'DAP',
        layer:  'digital asset transaction',
        comp: 'asset issuing',
        next: []
    }]
}];

/**
 * Represents a flow of actions related to some tiles
 * @param   {Object}  flow The objects that describes the flow including a set of steps
 */
function ActionFlow(flow) {
    
    this.flow = flow || processes[0] || [];
    var self = this;
    var objects = [];
    
    var i, l;
    
    for(i = 0, l = self.flow.steps.length; i < l; i++) {
        
        var element = self.flow.steps[i];
        
        self.flow.steps[i].element = helper.searchElement(
            (element.platfrm || element.suprlay) + '/' + element.layer + '/' + element.comp
        );
    }
    
    /**
     * Draws the flow
     * @param   {Number}  initialX Position where to start
     * @param   {Number}  initialY Position where to start
     */
    this.draw = function(initialX, initialY) {
        
        var title = createTextBox(self.flow.name, {
            height : window.TILE_DIMENSION.height, size : 36, textAlign : 'center', fontWeight : 'bold'
        });
        
        title.position.set(initialX, initialY + window.TILE_DIMENSION.height * 2, 0);
        objects.push(title);
        scene.add(title);
        
        var columnWidth = window.TILE_DIMENSION.width * 3,
            rowHeight = window.TILE_DIMENSION.width * 3;
        
        new TWEEN.Tween(this)
            .to({}, 4000)
            .onUpdate(window.render)
            .start();
        
        for(i = 0, l = self.flow.steps.length; i < l; i++)
            drawTree(self.flow.steps[i], initialX + columnWidth * i, initialY);
        
        for(i = 0, l = objects.length; i < l; i++) {
            helper.showMaterial(objects[i].material);
        }
        
        
        function drawTree(root, x, y) {
            
            if(typeof root.drawn === 'undefined') {
                drawStep(root, x, y);
            
                var childCount = root.next.length,
                    startX = x - 0.5 * (childCount - 1) * columnWidth;

                if(childCount !== 0) {

                    var lineGeo = new THREE.Geometry();
                    var lineMat = new THREE.LineBasicMaterial({color : 0x000000, transparent : true, opacity : 0});

                    var rootPoint = new THREE.Vector3(x, y - rowHeight / 2);

                    lineGeo.vertices.push(
                        new THREE.Vector3(x, y - rowHeight * 0.25, 0),
                        rootPoint);

                    var rootLine = new THREE.Line(lineGeo, lineMat);
                    objects.push(rootLine);
                    window.scene.add(rootLine);

                    var nextX, nextY, childLine, child, i, isLoop;

                    for(i = 0; i < childCount; i++) {

                        child = self.flow.steps[root.next[i]];
                        isLoop = (typeof child.drawn !== 'undefined');
                        
                        
                        nextX = startX + i * columnWidth;
                        
                        if(nextX !== rootPoint.x && colides(nextX, root)) {
                            nextX += childCount * columnWidth;
                        }
                        
                        if(isLoop) {
                            console.log(Math.abs(nextX));
                            lineMat = new THREE.LineBasicMaterial({color : 0x888888, transparent : true, opacity : 0});
                            nextY = child.drawn.y;
                        }
                        else {
                            lineMat = new THREE.LineBasicMaterial({color : 0x000000, transparent : true, opacity : 0});
                            nextY = y - rowHeight;
                        }

                        lineGeo = new THREE.Geometry();
                        lineGeo.vertices.push(
                            rootPoint,
                            new THREE.Vector3(nextX, rootPoint.y, 0),
                            new THREE.Vector3(nextX, nextY + rowHeight * 0.05, 0)
                        );
                        
                        if(isLoop) {
                            lineGeo.vertices[2].setY(nextY + rowHeight * 0.1);
                            
                            lineGeo.vertices.push(
                                new THREE.Vector3(child.drawn.x, child.drawn.y + rowHeight * 0.1, 0)
                            );
                        }

                        childLine = new THREE.Line(lineGeo, lineMat);
                        objects.push(childLine);
                        window.scene.add(childLine);

                        drawTree(child, nextX, nextY);
                    }
                }
            }
        }
        
        function drawStep(node, x, y) {
            
            var tile;

            var titleHeight = window.TILE_DIMENSION.height / 2,
                descWidth = window.TILE_DIMENSION.width * 2,
                descX = 0;
            
            if(node.element !== -1) {
                
                descWidth = window.TILE_DIMENSION.width;
                descX = window.TILE_DIMENSION.width / 2;
                
                tile = window.objects[node.element].clone();
                objects.push(tile);
                window.scene.add(tile);

                new TWEEN.Tween(tile.position)
                    .to({x : x - window.TILE_DIMENSION.width / 2, y : y - titleHeight * 3 / 2, z : 0}, 2000)
                    .easing(TWEEN.Easing.Exponential.Out)
                    //.onUpdate(render)
                    .start();
            }

            var title = createTextBox(node.title, {size : 24, fontWeight : 'bold', height : titleHeight, textAlign : 'center'});
            title.position.set(x, y, 0);

            var description = createTextBox(node.desc, {width : descWidth});
            description.position.set(x + descX, y - titleHeight * 3 / 2, 0);

            node.drawn = {
                x : x,
                y : y
            };

            objects.push(title);
            objects.push(description);
            window.scene.add(title);
            window.scene.add(description);
        }
        
        /**
         * Check if the line collides a block
         * @param   {Number}  x    Position to check
         * @param   {Object}  from Object where the line starts
         * @returns {Boolean} true if collision is detected
         */
        function colides(x, from) {
            
            var actual;
            
            for(var i = 0; i < self.flow.steps.length; i++) {
                actual = self.flow.steps[i];
                
                if(actual.drawn && actual.drawn.x === x && actual !== from) return true;
            }
            
            return false;
        }
    };
    
    /**
     * Deletes all objects related to the flow
     */
    this.delete = function() {
        
        for(var i = 0, l = objects.length; i < l; i++) {
            
            helper.hideObject(objects[i], false);
        }
        
        objects = [];
    };
    
    //Private methods
    
    /**
     * Creates a single text box
     * @param   {String} text        The text to draw
     * @param   {Object} [params={}] Object with the parameters of the draw
     * @returns {Object} The mesh of the textbox
     */
    function createTextBox(text, params) {
        
        if(typeof params === 'undefined') params = {};
        
        params = $.extend({
            fontWeight : 'normal',
            size : 12,
            fontFamily : 'Arial',
            width : window.TILE_DIMENSION.width * 2,
            height : window.TILE_DIMENSION.height,
            background : '#F26662',
            textColor : '#FFFFFF',
            textAlign : 'left'
        }, params);
        
        
        
        var width = params.width;
        var height = params.height;
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        var texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.NearestFilter;
        
        var ctx = canvas.getContext('2d');
        ctx.font = params.fontWeight + ' ' + params.size + 'px ' + params.fontFamily;
        ctx.textAlign = params.textAlign;
        
        
        ctx.fillStyle = params.background;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = params.textColor;
        
        var start = (params.textAlign !== 'center') ? 10 : width / 2;
        
        //var height = Math.abs(helper.drawText(text, 0, font, ctx, width, font)) * 2;
        var paragraphs = text.split('\n');
        var i, l, tempY = params.size;
        
        for(i = 0, l = paragraphs.length; i < l; i++) {
            tempY = helper.drawText(paragraphs[i], start, tempY, ctx, width - 10, params.size);
        }
        
        var mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            new THREE.MeshBasicMaterial({map : texture, vertexColors : THREE.FaceColors, side : THREE.FrontSide, color : 0xffffff, transparent : true, opacity : 0}));
        
        mesh.material.needsUpdate = true;
        texture.needsUpdate = true;
        
        return mesh;
    }
}
function BrowserManager() {

var textura = [];

var views = [];

function config_view ( _id, _left, _right, _top, _bottom ){  

// Los id solo pueden ser: home, table, stack

var view = { id : _id, right : _right, left : _left, top : _top, bottom : _bottom  };

views.push(view);

}

this.actionButton = function ( button ) {
    
var i = 0,
    view = "";

while(views[i].id != actualView){

i = i + 1 ;

} 

if ( button === "right" ) 

    view = views[i].right;

else if ( button === "left" ) 

    view = views[i].left;

else if ( button === "top" ) 

    view = views[i].top;

else 

    view = Views[i].bottom;

    goToView(view);

}

/**
 * Created by Ricardo Delgado
 */
this.modifyButtonBack = function ( valor ) {
    
var browserButton = document.getElementById('backButton');

 $(browserButton).fadeTo(1000, valor, function() {
                $(browserButton).show();
            });
}
/**
 * Created by Ricardo Delgado
 */
this.modifyButtonLegend = function ( valor ) {
    
var browserButton = document.getElementById('legendButton');

 $(browserButton).fadeTo(1000, valor, function() {
                $(browserButton).show();
            });
}


this.createButton = function () {

createTextura ( 0, "Home", "right");
createTextura ( 1, "View Table", "right");
createTextura ( 2, "View Dependencies", "right");
createTextura ( 3, "Home", "left");
createTextura ( 4, "View Table", "left");
createTextura ( 5, "View Dependencies", "left");

addButton ( "right" );
addButton ( "left" );

config_view ( "home", null, "table", null, null );
config_view ( "table", "home", "stack", null, null );
config_view ( "stack", "table", null, null, null );
}

function addButton ( button ) {

var mesh,
    posicion,
    j,
    height = window.innerHeight * 0.6;

    mesh = new THREE.Mesh(
                new THREE.PlaneGeometry( 80, 80 ),
                new THREE.MeshBasicMaterial({map:null , side: THREE.FrontSide, transparent: true})
            );
    
    if ( button === "right" ) {

    posicion = { x: 560, y: 0, z: 63800 }; j = 0;

    } else  {

    posicion = { x: -560, y: 0, z: 63800 }; j = 1;

    }

    mesh.position.set(posicion.x, posicion.y, posicion.z);

    mesh.userData = { state : true, arrow : button };

    mesh.material.opacity = 1;

    window.scene.add(mesh);
    
    browser[j] = mesh;  
}

function createTextura ( id, label, button) {

var canvas,
    ctx,
    img = new Image(),
    texture,
    fontside,
    imageside;

    if ( label === "View Table" ) fontside = { font: "20px Arial", x: 40, y: 40 };

    else if ( label === "View Dependencies" ) fontside = { font: "20px Arial", x: 60, y: 60};

    else if ( label == "Home") fontside = { font: "20px Arial", x: 40, y: 40};

    if ( button === "right" ) {

    imageside = { x: 15 };

    } else  {

    imageside = { x: 0 };

    }

    canvas = document.createElement('canvas');
    canvas.width  = 80;
    canvas.height = 80;

    ctx = canvas.getContext("2d");

    img = new Image(); 
    img.src = "images/browsers arrows/arrow-"+button+".png";

    img.onload = function () {

      ctx.font = fontside.font;
      ctx.fillText(label, 0, 65, fontside.x , fontside.y);
      ctx.drawImage(img, imageside.x, 0, 45, 45);
      
      texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;  
      texture.minFilter = THREE.NearestFilter;

      textura[id] = texture;

     }

}


 this.hide_Button = function ( ) {

var _label,
    i = 0;

while(views[i].id != actualView){

i = i + 1 ;

} 

if( views[i].right ) {
  
 _label = label("right", views[i].right);

 modifyButton (0, _label);

} else {

 modifyButton (0, null);
}

if( views[i].left ) {
  
 _label = label(1, views[i].left);

 modifyButton (1, _label);

} else {

 modifyButton (1, null);  
}


}

function label(button, view){

//Codigos de las textura Disponibles
/* 0 : home -> right, 1 : table -> right, 2 : stack -> right
   3 : home <- left, 4 : table <- left, 5 : stack <- left
*/ 

var id;

if (button === "right"){

  if ( view === "home" ) id = 0;

  else if (view === "table" ) id = 1;

  else  id = 2;

} else {
  
  if ( view === "home" ) id = 3;

  else if (view === "table" ) id = 4;

  else  id = 5;

} 

return id;}

function modifyButton (id, texture){

var visibility = -63800; 

var mesh = window.browser[ id ];

if ( texture ) {

   mesh.material.map = textura[ texture ];

   mesh.material.needsUpdate = true;

   visibility = 63800;

   mesh.material.opacity = 1; 
//alert(id);
} else { mesh.material.opacity = 0; }

/*alert( visibility + " z: " + mesh.position.z  );
if ( visibility != mesh.position.z ) animateButton(mesh);*/

}

function animateButton ( mesh, duration ){

        var _duration = duration || 2000,
            z = mesh.position.z * -1;

        var tween = new TWEEN.Tween(mesh.position)
        tween.to({z}, 2000)
        tween.delay( _duration )
        tween.easing(TWEEN.Easing.Exponential.InOut);
        tween.onUpdate(render)

        tween.start();

    }

}
/**
 *
 * @class Camera
 *
 * @param  {Position}
 * @param  {Renderer}
 * @param  {Function}
 */
function Camera(position, renderer, renderFunc) {
    /**
     * private constans
     */
    var ROTATE_SPEED = 1.3,
        MIN_DISTANCE = 50,
        MAX_DISTANCE = 80000;

    /**
     * private properties
     */    
    var camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, MAX_DISTANCE );
    var controls = new THREE.TrackballControls( camera, renderer.domElement );
    var focus = null;
    var self = this;
    
    var fake = new THREE.Object3D();
    fake.position.set(MAX_DISTANCE, MAX_DISTANCE, -MAX_DISTANCE);
    
    camera.position.copy( position );

    controls.rotateSpeed = ROTATE_SPEED;
    controls.noRotate = true;
    controls.minDistance = MIN_DISTANCE;
    controls.maxDistance = MAX_DISTANCE;
    controls.addEventListener( 'change', renderFunc );
    controls.position0.copy( position );
    
    // Public properties
    this.moving = false;
    
    // Public Methods
    
    /**
     * Returns the max distance set
     * @returns {Number} Max distance constant
     */
    this.getMaxDistance = function() { return MAX_DISTANCE; };

    /**
     * @method disable disables camera controls
     */
    this.disable = function() {
        controls.enabled = false;
    };
    
    /**
     *
     * @method enable enables camera controls
     */
    this.enable = function() {
        controls.enabled = true;
    };
    
    /**
     * Returns a copy of the actual position
     * @returns {THREE.Vector3} Actual position of the camera
     */
    this.getPosition = function() {
        return camera.position.clone();
    };
    
    /**
     * 
     * @method setFocus sets focus to a target given its id
     *
     * @param {Number} id       target id
     * @param {Number} duration animation duration time
     */
    this.setFocus = function( id, duration ) {
        
        TWEEN.removeAll();
        focus = parseInt(id);

        viewManager.letAlone(focus, duration);
        
        objects[focus].getObjectForDistance(0).visible = true;
        self.render(renderer, scene);
        
        headers.hide(duration);
    
        var vec = new THREE.Vector4(0, 0, window.TILE_DIMENSION.width - window.TILE_SPACING, 1);
        var target = window.objects[ focus ];

        vec.applyMatrix4( target.matrix );

        /*new TWEEN.Tween( controls.target )
            .to( { x: target.position.x, y: target.position.y, z: target.position.z }, duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();*/

        new TWEEN.Tween( camera.position )
            .to( { x: vec.x, y: vec.y, z: vec.z }, Math.random() * duration + duration * 2 )
            //.easing( TWEEN.Easing.Exponential.InOut )
            .onUpdate(function(){controls.target.set(camera.position.x, camera.position.y,0); })
            .start();

        new TWEEN.Tween( camera.up )
            .to( { x: target.up.x, y: target.up.y, z: target.up.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();
    };
    
    /**
     *
     * @method loseFocus    loses focus from target
     *
     */
    this.loseFocus = function() {
        
        if ( focus != null ) {
            var backButton = document.getElementById('backButton');
            $(backButton).fadeTo(1000, 0, function() { backButton.style.display = 'none'; } );
            $('#sidePanel').fadeTo(1000, 0, function() { $('#sidePanel').remove(); });
            $('#elementPanel').fadeTo(1000, 0, function() { $('#elementPanel').remove(); });
            $('#timelineButton').fadeTo(1000, 0, function() { $('#timelineButton').remove(); });
            if( $('#developerButton') != null ) helper.hide($('#developerButton'), 1000);
            if( $('#tlContainer') != null ) helper.hide($('#tlContainer'), 1000);
            $(renderer.domElement).fadeTo(1000, 1);

            focus = null;
        }
    };
    
    /**
     *
     * @method onWindowResize   execute in case of window resizing
     * 
     */
    this.onWindowResize = function() {
        var innerWidth = window.innerWidth,
            innerHeight = window.innerHeight;
        
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( innerWidth, innerHeight );

        render();
    };
    
    /**
     *
     * @method onKeyDown    execute in case of key down pressed
     *
     * @param {Event} event event to listen to
     * 
     */
    this.onKeyDown = function( event ) {
    
        if ( event.keyCode === 27 /* ESC */ ) {

            //TWEEN.removeAll();
            var duration = 2000;

            viewManager.rollBack();

            self.resetPosition(duration);
        }
    };
    
    /**
     * Resets the camera position
     * @param {Number} [duration=2000] Duration of the animation
     */
    this.resetPosition = function(duration) {
        
        duration = duration || 2000;
        
        /*new TWEEN.Tween( controls.target )
                .to( { x: controls.target0.x, y: controls.target0.y, z: controls.target0.z }, Math.random() * duration + duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();*/

            new TWEEN.Tween( camera.position )
                .to( { x: controls.position0.x, y: controls.position0.y, z: controls.position0.z }, duration )
                //.easing( TWEEN.Easing.Exponential.InOut )
                .onUpdate(function(){controls.target.set(camera.position.x, camera.position.y,0); })
                .start();

            new TWEEN.Tween( camera.up )
                .to( { x: 0, y: 1, z: 0 }, Math.random() * duration + duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();
    };
    
    /**
     *
     * @method update    updates camera controls  
     *
     */
    this.update = function() {        
        controls.update();
        self.moving = controls.moving;
    };
    
    /**
     *
     * @method render    renders an scene
     *
     * @param {Renderer} renderer renderer for camera
     * @param {Scene}    scene    scene to render
     *
     */
    this.render = function ( renderer, scene ) {
        
        var cam;
        
        scene.traverse( function ( object ) {

            if ( object instanceof THREE.LOD ) {
                
                if(object.userData.flying === true) cam = fake;
                else cam = camera;
                
                object.update( cam );
            }
        });
        
        renderer.render ( scene, camera );
    };
    
    /**
     *
     * @method getFocus gets focused target
     *
     * @return {Number} focused target
     */
    this.getFocus = function () { 
        return focus;
    };
    
    /**
     * Casts a ray between the camera to the target
     * @param   {Object} target   Vector2D target
     * @param   {Array}  elements Array of elements expected to collide
     * @returns {Array}  All intercepted members of elements
     */
    this.rayCast = function(target, elements) {
        
        var raycaster = new THREE.Raycaster();
        
        raycaster.setFromCamera(target, camera);
        
        return raycaster.intersectObjects(elements);
    };
    
    /**
     * Moves the camera to a position
     * @param {Number} x               X coordinate
     * @param {Number} y               Y coordinate
     * @param {Number} z               Z coordinate
     * @param {Number} [duration=2000] Milliseconds of the animation
     */
    this.move = function(x, y, z, duration) {
        
        var _duration = duration || 2000;
        
        new TWEEN.Tween(camera.position)
        .to({x : x, y : y, z : z}, _duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate(function(){controls.target.set(camera.position.x, camera.position.y,0); })
        .start();
        
    };
    
    // Events
    window.addEventListener( 'resize', this.onWindowResize, false );
    window.addEventListener( 'keydown', this.onKeyDown, false );
}
var testData = '{"platfrms":[{"code":"COR","name":"core and api","logo":"COR_logo.png","deps":["OSA"],"order":0,"upd_at":"561710ef1f1c2be0054fd5e3","_id":"561463f536058c8c64ac2061"},{"code":"PIP","name":"plug-ins platform","logo":"PIP_logo.png","deps":["P2P","COR"],"order":1,"upd_at":"561710f31f1c2be0054fd6e2","_id":"561463fc36058c8c64ac225b"},{"code":"WPD","name":"wallet production and distribution","logo":"WPD_logo.png","deps":["PIP"],"order":2,"upd_at":"561710fb1f1c2be0054fd872","_id":"5614640936058c8c64ac2542"},{"code":"CCP","name":"crypto currency platform","logo":"CCP_logo.png","deps":["WPD","P2P"],"order":3,"upd_at":"561711001f1c2be0054fd952","_id":"5614641036058c8c64ac26ef"},{"code":"CCM","name":"crypto commodity money","logo":"CCM_logo.png","deps":["CCP"],"order":4,"upd_at":"561711071f1c2be0054fdaa2","_id":"5614641836058c8c64ac2966"},{"code":"BNP","name":"bank notes platform","logo":"BNP_logo.png","deps":["CCM"],"order":5,"upd_at":"5617110a1f1c2be0054fdb46","_id":"5614641c36058c8c64ac2a97"},{"code":"SHP","name":"shopping platform","logo":"SHP_logo.png","deps":["WPD"],"order":6,"upd_at":"5617110b1f1c2be0054fdb70","_id":"5614641d36058c8c64ac2ae0"},{"code":"DAP","name":"digital asset platform","logo":"DAP_logo.png","deps":["WPD"],"order":7,"upd_at":"5617110e1f1c2be0054fdc39","_id":"5614642236058c8c64ac2c4c"},{"code":"MKT","name":"marketing platform","logo":"MKT_logo.png","deps":["DAP"],"order":8,"upd_at":"561711171f1c2be0054fddc8","_id":"5614642c36058c8c64ac2f30"},{"code":"CSH","name":"cash handling platform","logo":"CSH_logo.png","deps":["WPD"],"order":9,"upd_at":"5617111a1f1c2be0054fde65","_id":"5614642e36058c8c64ac304c"},{"code":"BNK","name":"banking platform","logo":"BNK_logo.png","deps":["WPD"],"order":10,"upd_at":"5617111c1f1c2be0054fde96","_id":"5614642f36058c8c64ac30a8"},{"code":"CBP","name":"crypto broker platform","logo":"CBP_logo.png","deps":["CCP","CSH","BNK"],"order":11,"upd_at":"5617111c1f1c2be0054fdeb5","_id":"5614642f36058c8c64ac30e0"},{"code":"CDN","name":"crypto distribution netword","logo":"CDN_logo.png","deps":["CBP"],"order":12,"upd_at":"561711251f1c2be0054fe0aa","_id":"5614643d36058c8c64ac3484"},{"code":"DPN","name":"device private network","logo":"DPN_logo.png","deps":["PIP"],"order":13,"upd_at":"5617112d1f1c2be0054fe253","_id":"5614644d36058c8c64ac3790"}],"suprlays":[{"code":"P2P","name":"peer to peer network","deps":["OSA"],"order":0,"upd_at":"5617112e1f1c2be0054fe275","_id":"5614644e36058c8c64ac37cb"},{"code":"BCH","name":"crypto","deps":["OSA"],"order":1,"upd_at":"5617112f1f1c2be0054fe2a8","_id":"5614645136058c8c64ac3839"},{"code":"OSA","name":"operating system api","deps":[],"order":2,"upd_at":"561711331f1c2be0054fe327","_id":"5614645536058c8c64ac392b"}],"layers":[{"name":"core","lang":"java","order":0,"upd_at":"561463f536058c8c64ac2063","_id":"561463f536058c8c64ac2064"},{"name":"niche wallet","lang":"java-android","order":1,"upd_at":"561463f836058c8c64ac2138","_id":"561463f836058c8c64ac2139"},{"name":"reference wallet","lang":"java-android","order":2,"upd_at":"561463f836058c8c64ac213b","_id":"561463f836058c8c64ac213c"},{"name":"sub app","lang":"java-android","order":3,"upd_at":"561463f936058c8c64ac213e","_id":"561463f936058c8c64ac213f"},{"name":"desktop","lang":"java-android","order":4,"upd_at":"56146e85f47b82b16565da0b","_id":"561463f936058c8c64ac2142"},{"name":"engine","lang":"java","order":6,"upd_at":"5614c457bb35d6a86933e58f","_id":"561463f936058c8c64ac2145"},{"name":"wallet module","lang":"java","order":7,"upd_at":"5614c457bb35d6a86933e591","_id":"561463f936058c8c64ac2148"},{"name":"sub app module","lang":"java","order":8,"upd_at":"5614c457bb35d6a86933e593","_id":"561463f936058c8c64ac214b"},{"name":"desktop module","lang":"java","order":9,"upd_at":"5614c457bb35d6a86933e595","_id":"561463f936058c8c64ac214e"},{"name":"agent","lang":"java","order":10,"upd_at":"5614c457bb35d6a86933e597","_id":"561463f936058c8c64ac2151"},{"name":"actor","lang":"java","order":11,"upd_at":"5614c457bb35d6a86933e599","_id":"561463f936058c8c64ac2154"},{"name":"middleware","lang":"java","order":12,"upd_at":"5614c457bb35d6a86933e59b","_id":"561463f936058c8c64ac2157"},{"name":"request","lang":"java","order":13,"upd_at":"5614c457bb35d6a86933e59d","_id":"561463f936058c8c64ac215a"},{"name":"business transaction","lang":"java","order":14,"upd_at":"5614c457bb35d6a86933e59f","_id":"561463f936058c8c64ac215d"},{"name":"digital asset transaction","lang":"java","order":15,"upd_at":"5614c457bb35d6a86933e5a1","_id":"561463f936058c8c64ac2160"},{"name":"crypto money transaction","lang":"java","order":16,"upd_at":"5614c457bb35d6a86933e5a3","_id":"561463f936058c8c64ac2163"},{"name":"cash money transaction","lang":"java","order":17,"upd_at":"5614c457bb35d6a86933e5a5","_id":"561463f936058c8c64ac2166"},{"name":"bank money transaction","lang":"java","order":18,"upd_at":"5614c457bb35d6a86933e5a7","_id":"561463f936058c8c64ac2169"},{"name":"contract","lang":"java","order":19,"upd_at":"5614c458bb35d6a86933e5a9","_id":"561463f936058c8c64ac216c"},{"name":"composite wallet","lang":"java","order":20,"upd_at":"5614c458bb35d6a86933e5ab","_id":"561463f936058c8c64ac216f"},{"name":"wallet","lang":"java","order":21,"upd_at":"5614c458bb35d6a86933e5ad","_id":"561463f936058c8c64ac2172"},{"name":"world","lang":"java","order":22,"upd_at":"5614c458bb35d6a86933e5af","_id":"561463f936058c8c64ac2175"},{"name":"identity","lang":"java","order":23,"upd_at":"5614c458bb35d6a86933e5b1","_id":"561463f936058c8c64ac2178"},{"name":"actor network service","lang":"java","order":24,"upd_at":"5614c458bb35d6a86933e5b3","_id":"561463f936058c8c64ac217b"},{"name":"network service","lang":"java","order":25,"upd_at":"5614c458bb35d6a86933e5b5","_id":"561463f936058c8c64ac217e"},{"name":"communication","lang":"java","order":28,"upd_at":"5614c4a5bb35d6a86933f1c6","_id":"5614644e36058c8c64ac37ce"},{"name":"crypto router","lang":"java","order":30,"upd_at":"5614c4a6bb35d6a86933f1fa","_id":"5614645136058c8c64ac383c"},{"name":"crypto module","lang":"java","order":31,"upd_at":"5614c4a7bb35d6a86933f20a","_id":"5614645136058c8c64ac385d"},{"name":"crypto vault","lang":"java","order":32,"upd_at":"5614c4a7bb35d6a86933f215","_id":"5614645236058c8c64ac3873"},{"name":"crypto network","lang":"java","order":33,"upd_at":"5614c4a8bb35d6a86933f241","_id":"5614645336058c8c64ac38d0"},{"name":"license","lang":"java","order":35,"upd_at":"5614c458bb35d6a86933e5b7","_id":"561463f936058c8c64ac2181"},{"name":"plugin","lang":"java","order":36,"upd_at":"5614c458bb35d6a86933e5b9","_id":"561463f936058c8c64ac2184"},{"name":"user","lang":"java","order":37,"upd_at":"5614c458bb35d6a86933e5bb","_id":"561463f936058c8c64ac2187"},{"name":"hardware","lang":"java","order":38,"upd_at":"5614c458bb35d6a86933e5bd","_id":"561463f936058c8c64ac218a"},{"name":"platform service","lang":"java","order":39,"upd_at":"5614c458bb35d6a86933e5bf","_id":"561463f936058c8c64ac218d"},{"name":"multi os","lang":"java","order":41,"upd_at":"5614c4a9bb35d6a86933f27d","_id":"5614645536058c8c64ac392e"},{"name":"android","lang":"java","order":42,"upd_at":"5614c4aabb35d6a86933f291","_id":"5614645636058c8c64ac3957"},{"name":"api","lang":"java","order":43,"upd_at":"5614c458bb35d6a86933e5c1","_id":"561463f936058c8c64ac2190"}],"comps":[{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f536058c8c64ac2064","name":"fermat core","type":"library","description":"","difficulty":10,"code_level":"development","repo_dir":"COR/library/core/fermat-cor-library-core-fermat-core-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"implementation","percnt":70},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"author","scope":"implementation","percnt":30},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[{"_comp_id":"561463f536058c8c64ac2067","name":"Concept","target":null,"reached":"2015-06-01T00:00:00.000Z","_id":"561463f636058c8c64ac2082","__v":0,"upd_at":"561710ef1f1c2be0054fd5f1"},{"_comp_id":"561463f536058c8c64ac2067","name":"Development","target":"2015-09-01T00:00:00.000Z","reached":"2015-08-20T00:00:00.000Z","_id":"561463f636058c8c64ac2085","__v":0,"upd_at":"561710ef1f1c2be0054fd5f3"},{"_comp_id":"561463f536058c8c64ac2067","name":"QA","target":"2015-09-20T00:00:00.000Z","reached":"2015-09-15T00:00:00.000Z","_id":"561463f636058c8c64ac2088","__v":0,"upd_at":"561710ef1f1c2be0054fd5f5"},{"_comp_id":"561463f536058c8c64ac2067","name":"Production","target":"2015-10-01T00:00:00.000Z","reached":"2015-09-25T00:00:00.000Z","_id":"561463f636058c8c64ac208b","__v":0,"upd_at":"561710ef1f1c2be0054fd5f7"}],"upd_at":"561710ef1f1c2be0054fd5f9","_id":"561463f536058c8c64ac2067"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f536058c8c64ac2064","name":"android core","type":"library","description":"","difficulty":10,"code_level":"development","repo_dir":"COR/library/core/fermat-cor-library-core-android-core-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"implementation","percnt":70},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":30},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[{"_comp_id":"561463f636058c8c64ac2090","name":"Concept","target":null,"reached":"2015-06-01T00:00:00.000Z","_id":"561463f636058c8c64ac20a9","__v":0,"upd_at":"561710f01f1c2be0054fd606"},{"_comp_id":"561463f636058c8c64ac2090","name":"Development","target":"2015-10-01T00:00:00.000Z","reached":"2015-09-20T00:00:00.000Z","_id":"561463f636058c8c64ac20ac","__v":0,"upd_at":"561710f01f1c2be0054fd608"},{"_comp_id":"561463f636058c8c64ac2090","name":"QA","target":"2015-10-20T00:00:00.000Z","reached":"2015-09-15T00:00:00.000Z","_id":"561463f636058c8c64ac20af","__v":0,"upd_at":"561710f01f1c2be0054fd60a"},{"_comp_id":"561463f636058c8c64ac2090","name":"Production","target":"2015-10-01T00:00:00.000Z","reached":"2015-09-25T00:00:00.000Z","_id":"561463f636058c8c64ac20b2","__v":0,"upd_at":"561710f01f1c2be0054fd60c"}],"upd_at":"561710f01f1c2be0054fd60e","_id":"561463f636058c8c64ac2090"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f536058c8c64ac2064","name":"osa core","type":"library","description":"","difficulty":0,"code_level":"concept","repo_dir":"COR/library/core/fermat-cor-library-core-osa-core-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f01f1c2be0054fd615","_id":"561463f636058c8c64ac20b7"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f536058c8c64ac2064","name":"bch core","type":"library","description":"","difficulty":0,"code_level":"concept","repo_dir":"COR/library/core/fermat-cor-library-core-bch-core-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f01f1c2be0054fd61c","_id":"561463f736058c8c64ac20c4"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f536058c8c64ac2064","name":"p2p core","type":"library","description":"","difficulty":0,"code_level":"concept","repo_dir":"COR/library/core/fermat-cor-library-core-p2p-core-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f01f1c2be0054fd623","_id":"561463f736058c8c64ac20d1"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f536058c8c64ac2064","name":"dpn core","type":"library","description":"","difficulty":0,"code_level":"concept","repo_dir":"COR/library/core/fermat-cor-library-core-dpn-core-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f01f1c2be0054fd62a","_id":"561463f736058c8c64ac20de"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f536058c8c64ac2064","name":"pip core","type":"library","description":"","difficulty":0,"code_level":"concept","repo_dir":"COR/library/core/fermat-cor-library-core-pip-core-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f01f1c2be0054fd631","_id":"561463f736058c8c64ac20eb"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f536058c8c64ac2064","name":"dmp core","type":"library","description":"","difficulty":0,"code_level":"concept","repo_dir":"COR/library/core/fermat-cor-library-core-dmp-core-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f11f1c2be0054fd638","_id":"561463f836058c8c64ac20f8"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f536058c8c64ac2064","name":"wpd core","type":"library","description":"","difficulty":0,"code_level":"concept","repo_dir":"COR/library/core/fermat-cor-library-core-wpd-core-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f11f1c2be0054fd63f","_id":"561463f836058c8c64ac2105"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f536058c8c64ac2064","name":"dap core","type":"library","description":"","difficulty":0,"code_level":"concept","repo_dir":"COR/library/core/fermat-cor-library-core-dap-core-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f11f1c2be0054fd646","_id":"561463f836058c8c64ac2112"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f536058c8c64ac2064","name":"mkt core","type":"library","description":"","difficulty":0,"code_level":"concept","repo_dir":"COR/library/core/fermat-cor-library-core-mkt-core-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f11f1c2be0054fd64d","_id":"561463f836058c8c64ac211f"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f536058c8c64ac2064","name":"cdn core","type":"library","description":"","difficulty":0,"code_level":"concept","repo_dir":"COR/library/core/fermat-cor-library-core-cdn-core-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f11f1c2be0054fd654","_id":"561463f836058c8c64ac212c"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2190","name":"fermat api","type":"library","description":"","difficulty":10,"code_level":"development","repo_dir":"COR/library/api/fermat-cor-library-api-fermat-api-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[{"_comp_id":"561463fa36058c8c64ac2193","name":"Concept","target":null,"reached":"2015-05-01T00:00:00.000Z","_id":"561463fa36058c8c64ac21a2","__v":0,"upd_at":"561710f21f1c2be0054fd67b"},{"_comp_id":"561463fa36058c8c64ac2193","name":"Development","target":"2015-06-01T00:00:00.000Z","reached":"2015-05-20T00:00:00.000Z","_id":"561463fa36058c8c64ac21a5","__v":0,"upd_at":"561710f21f1c2be0054fd67d"},{"_comp_id":"561463fa36058c8c64ac2193","name":"QA","target":"2015-07-20T00:00:00.000Z","reached":"2015-08-15T00:00:00.000Z","_id":"561463fa36058c8c64ac21a8","__v":0,"upd_at":"561710f21f1c2be0054fd67f"},{"_comp_id":"561463fa36058c8c64ac2193","name":"Production","target":"2015-10-01T00:00:00.000Z","reached":"2015-09-25T00:00:00.000Z","_id":"561463fa36058c8c64ac21ab","__v":0,"upd_at":"561710f21f1c2be0054fd681"}],"upd_at":"561710f21f1c2be0054fd683","_id":"561463fa36058c8c64ac2193"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2190","name":"android api","type":"library","description":"","difficulty":10,"code_level":"development","repo_dir":"COR/library/api/fermat-cor-library-api-android-api-bitdubai","found":false,"devs":[{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f21f1c2be0054fd68c","_id":"561463fa36058c8c64ac21b0"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2190","name":"osa api","type":"library","description":"","difficulty":0,"code_level":"concept","repo_dir":"COR/library/api/fermat-cor-library-api-osa-api-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f21f1c2be0054fd693","_id":"561463fa36058c8c64ac21c1"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2190","name":"bch api","type":"library","description":"","difficulty":10,"code_level":"development","repo_dir":"COR/library/api/fermat-cor-library-api-bch-api-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[{"_comp_id":"561463fa36058c8c64ac21ce","name":"Concept","target":null,"reached":"2015-04-01T00:00:00.000Z","_id":"561463fb36058c8c64ac21dd","__v":0,"upd_at":"561710f21f1c2be0054fd69c"},{"_comp_id":"561463fa36058c8c64ac21ce","name":"Development","target":"2015-05-01T00:00:00.000Z","reached":"2015-05-20T00:00:00.000Z","_id":"561463fb36058c8c64ac21e0","__v":0,"upd_at":"561710f21f1c2be0054fd69e"},{"_comp_id":"561463fa36058c8c64ac21ce","name":"QA","target":"2015-06-20T00:00:00.000Z","reached":"2015-05-15T00:00:00.000Z","_id":"561463fb36058c8c64ac21e3","__v":0,"upd_at":"561710f21f1c2be0054fd6a0"},{"_comp_id":"561463fa36058c8c64ac21ce","name":"Production","target":"2015-10-01T00:00:00.000Z","reached":"2015-09-25T00:00:00.000Z","_id":"561463fb36058c8c64ac21e6","__v":0,"upd_at":"561710f21f1c2be0054fd6a2"}],"upd_at":"561710f21f1c2be0054fd6a4","_id":"561463fa36058c8c64ac21ce"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2190","name":"p2p api","type":"library","description":"","difficulty":10,"code_level":"development","repo_dir":"COR/library/api/fermat-cor-library-api-p2p-api-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f21f1c2be0054fd6ad","_id":"561463fb36058c8c64ac21eb"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2190","name":"dpn api","type":"library","description":"","difficulty":0,"code_level":"concept","repo_dir":"COR/library/api/fermat-cor-library-api-dpn-api-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f21f1c2be0054fd6b4","_id":"561463fb36058c8c64ac21fc"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2190","name":"pip api","type":"library","description":"","difficulty":10,"code_level":"development","repo_dir":"COR/library/api/fermat-cor-library-api-pip-api-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f31f1c2be0054fd6bd","_id":"561463fb36058c8c64ac2209"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2190","name":"dmp api","type":"library","description":"","difficulty":0,"code_level":"concept","repo_dir":"COR/library/api/fermat-cor-library-api-dmp-api-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f31f1c2be0054fd6c4","_id":"561463fb36058c8c64ac221a"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2190","name":"wpd api","type":"library","description":"","difficulty":0,"code_level":"concept","repo_dir":"COR/library/api/fermat-cor-library-api-wpd-api-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f31f1c2be0054fd6cb","_id":"561463fc36058c8c64ac2227"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2190","name":"dap api","type":"library","description":"","difficulty":0,"code_level":"concept","repo_dir":"COR/library/api/fermat-cor-library-api-dap-api-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f31f1c2be0054fd6d2","_id":"561463fc36058c8c64ac2234"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2190","name":"mkt api","type":"library","description":"","difficulty":0,"code_level":"concept","repo_dir":"COR/library/api/fermat-cor-library-api-mkt-api-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f31f1c2be0054fd6d9","_id":"561463fc36058c8c64ac2241"},{"_platfrm_id":"561463f536058c8c64ac2061","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2190","name":"cdn api","type":"library","description":"","difficulty":0,"code_level":"concept","repo_dir":"COR/library/api/fermat-cor-library-api-cdn-api-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f31f1c2be0054fd6e0","_id":"561463fc36058c8c64ac224e"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"shell","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/android/sub_app/fermat-pip-android-sub-app-shell-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f31f1c2be0054fd6ea","_id":"561463fd36058c8c64ac225f"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"designer","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/android/sub_app/fermat-pip-android-sub-app-designer-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f41f1c2be0054fd6f1","_id":"561463fd36058c8c64ac226c"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"developer","type":"android","description":"","difficulty":5,"code_level":"production","repo_dir":"PIP/android/sub_app/fermat-pip-android-sub-app-developer-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710f41f1c2be0054fd6fc","_id":"561463fd36058c8c64ac2279"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"technical support","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/android/sub_app/fermat-pip-android-sub-app-technical-support-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f41f1c2be0054fd703","_id":"561463fd36058c8c64ac228e"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"system monitor","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/android/sub_app/fermat-pip-android-sub-app-system-monitor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f41f1c2be0054fd70a","_id":"561463fe36058c8c64ac229b"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"feedback","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/android/sub_app/fermat-pip-android-sub-app-feedback-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f41f1c2be0054fd711","_id":"561463fe36058c8c64ac22a8"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"reviews","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/android/sub_app/fermat-pip-android-sub-app-reviews-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f41f1c2be0054fd718","_id":"561463fe36058c8c64ac22b5"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2142","name":"sub app manager","type":"android","description":"","difficulty":3,"code_level":"production","repo_dir":"PIP/android/desktop/fermat-pip-android-desktop-sub-app-manager-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710f41f1c2be0054fd724","_id":"561463fe36058c8c64ac22c3"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2145","name":"sub app runtime","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"PIP/plugin/engine/fermat-pip-plugin-engine-sub-app-runtime-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710f51f1c2be0054fd730","_id":"561463fe36058c8c64ac22d9"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2145","name":"desktop runtime","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"PIP/plugin/engine/fermat-pip-plugin-engine-desktop-runtime-bitdubai","found":true,"devs":[{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710f51f1c2be0054fd73b","_id":"561463ff36058c8c64ac22ee"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"shell","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/plugin/sub_app_module/fermat-pip-plugin-sub-app-module-shell-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f51f1c2be0054fd743","_id":"561463ff36058c8c64ac2304"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"designer","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/plugin/sub_app_module/fermat-pip-plugin-sub-app-module-designer-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f51f1c2be0054fd74a","_id":"561463ff36058c8c64ac2311"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"developer","type":"plugin","description":"","difficulty":4,"code_level":"production","repo_dir":"PIP/plugin/sub_app_module/fermat-pip-plugin-sub-app-module-developer-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"acostarodrigo","email":null,"name":"Rodrigo","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9518556?v=3","url":"https://github.com/acostarodrigo","bio":null,"upd_at":"56147cf0c9e113c46518db1d","_id":"5614640036058c8c64ac2329"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"nattyco","email":"natalia_veronica_c@hotmail.com","name":"Natalia Cortez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10051490?v=3","url":"https://github.com/nattyco","bio":null,"upd_at":"56171a4d1f1c2be0054feb4e","_id":"5614640036058c8c64ac232f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710f51f1c2be0054fd755","_id":"561463ff36058c8c64ac231e"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"technical support","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/plugin/sub_app_module/fermat-pip-plugin-sub-app-module-technical-support-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f51f1c2be0054fd75c","_id":"5614640036058c8c64ac2337"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"system monitor","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/plugin/sub_app_module/fermat-pip-plugin-sub-app-module-system-monitor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f61f1c2be0054fd763","_id":"5614640036058c8c64ac2344"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"feedback","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/plugin/sub_app_module/fermat-pip-plugin-sub-app-module-feedback-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f61f1c2be0054fd76a","_id":"5614640036058c8c64ac2351"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"reviews","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/plugin/sub_app_module/fermat-pip-plugin-sub-app-module-reviews-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f61f1c2be0054fd771","_id":"5614640036058c8c64ac235e"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214e","name":"sub app manager","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"PIP/plugin/desktop_module/fermat-pip-plugin-desktop-module-sub-app-manager-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710f61f1c2be0054fd77d","_id":"5614640136058c8c64ac236c"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2154","name":"developer","type":"plugin","description":"","difficulty":6,"code_level":"production","repo_dir":"PIP/plugin/actor/fermat-pip-plugin-actor-developer-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"acostarodrigo","email":null,"name":"Rodrigo","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9518556?v=3","url":"https://github.com/acostarodrigo","bio":null,"upd_at":"56147cf0c9e113c46518db1d","_id":"5614640036058c8c64ac2329"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"acostarodrigo","email":null,"name":"Rodrigo","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9518556?v=3","url":"https://github.com/acostarodrigo","bio":null,"upd_at":"56147cf0c9e113c46518db1d","_id":"5614640036058c8c64ac2329"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710f61f1c2be0054fd789","_id":"5614640136058c8c64ac2382"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2154","name":"designer","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/plugin/actor/fermat-pip-plugin-actor-designer-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f61f1c2be0054fd790","_id":"5614640136058c8c64ac2397"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2157","name":"intra user technical support","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/plugin/middleware/fermat-pip-plugin-middleware-intra-user-technical-support-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f61f1c2be0054fd798","_id":"5614640136058c8c64ac23a5"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2157","name":"developer technical support","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/plugin/middleware/fermat-pip-plugin-middleware-developer-technical-support-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f71f1c2be0054fd79f","_id":"5614640236058c8c64ac23b2"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2157","name":"developer error manager","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/plugin/middleware/fermat-pip-plugin-middleware-developer-error-manager-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f71f1c2be0054fd7a6","_id":"5614640236058c8c64ac23bf"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2157","name":"sub app settings","type":"plugin","description":"","difficulty":2,"code_level":"development","repo_dir":"PIP/plugin/middleware/fermat-pip-plugin-middleware-sub-app-settings-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710f71f1c2be0054fd7b1","_id":"5614640236058c8c64ac23cc"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2157","name":"notification","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"PIP/plugin/middleware/fermat-pip-plugin-middleware-notification-bitdubai","found":false,"devs":[{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":60},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710f71f1c2be0054fd7bc","_id":"5614640336058c8c64ac23e1"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2175","name":"location","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/plugin/world/fermat-pip-plugin-world-location-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f71f1c2be0054fd7c4","_id":"5614640336058c8c64ac23f7"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2178","name":"developer","type":"plugin","description":"","difficulty":1,"code_level":"production","repo_dir":"PIP/plugin/identity/fermat-pip-plugin-identity-developer-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nattyco","email":"natalia_veronica_c@hotmail.com","name":"Natalia Cortez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10051490?v=3","url":"https://github.com/nattyco","bio":null,"upd_at":"56171a4d1f1c2be0054feb4e","_id":"5614640036058c8c64ac232f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"nattyco","email":"natalia_veronica_c@hotmail.com","name":"Natalia Cortez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10051490?v=3","url":"https://github.com/nattyco","bio":null,"upd_at":"56171a4d1f1c2be0054feb4e","_id":"5614640036058c8c64ac232f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710f81f1c2be0054fd7d0","_id":"5614640336058c8c64ac2405"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2178","name":"designer","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/plugin/identity/fermat-pip-plugin-identity-designer-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f81f1c2be0054fd7d7","_id":"5614640436058c8c64ac241a"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217b","name":"developer","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/plugin/actor_network_service/fermat-pip-plugin-actor-network-service-developer-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f81f1c2be0054fd7df","_id":"5614640436058c8c64ac2428"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217e","name":"sub app resources","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"PIP/plugin/network_service/fermat-pip-plugin-network-service-sub-app-resources-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710f81f1c2be0054fd7eb","_id":"5614640436058c8c64ac2436"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217e","name":"system monitor","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/plugin/network_service/fermat-pip-plugin-network-service-system-monitor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f91f1c2be0054fd7f2","_id":"5614640536058c8c64ac244b"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217e","name":"error manager","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/plugin/network_service/fermat-pip-plugin-network-service-error-manager-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f91f1c2be0054fd7f9","_id":"5614640536058c8c64ac2458"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217e","name":"messanger","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/plugin/network_service/fermat-pip-plugin-network-service-messanger-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f91f1c2be0054fd800","_id":"5614640536058c8c64ac2465"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217e","name":"technical support","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/plugin/network_service/fermat-pip-plugin-network-service-technical-support-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f91f1c2be0054fd807","_id":"5614640536058c8c64ac2472"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2181","name":"plugin","type":"addon","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/addon/license/fermat-pip-addon-license-plugin-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f91f1c2be0054fd80f","_id":"5614640636058c8c64ac2480"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2184","name":"identity","type":"addon","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/addon/plugin/fermat-pip-addon-plugin-identity-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f91f1c2be0054fd817","_id":"5614640636058c8c64ac248e"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2184","name":"dependency","type":"addon","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/addon/plugin/fermat-pip-addon-plugin-dependency-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710f91f1c2be0054fd81e","_id":"5614640636058c8c64ac249b"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2187","name":"device user","type":"addon","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/addon/user/fermat-pip-addon-user-device-user-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710fa1f1c2be0054fd82a","_id":"5614640636058c8c64ac24a9"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac218a","name":"local device","type":"addon","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/addon/hardware/fermat-pip-addon-hardware-local-device-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710fa1f1c2be0054fd832","_id":"5614640736058c8c64ac24bf"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac218a","name":"device network","type":"addon","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/addon/hardware/fermat-pip-addon-hardware-device-network-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710fa1f1c2be0054fd839","_id":"5614640736058c8c64ac24cc"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac218d","name":"error manager","type":"addon","description":"","difficulty":4,"code_level":"production","repo_dir":"PIP/addon/platform_service/fermat-pip-addon-platform-service-error-manager-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710fa1f1c2be0054fd845","_id":"5614640736058c8c64ac24da"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac218d","name":"event manager","type":"addon","description":"","difficulty":8,"code_level":"production","repo_dir":"PIP/addon/platform_service/fermat-pip-addon-platform-service-event-manager-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710fa1f1c2be0054fd850","_id":"5614640736058c8c64ac24f1"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac218d","name":"connectivity subsystem","type":"addon","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/addon/platform_service/fermat-pip-addon-platform-service-connectivity-subsystem-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710fb1f1c2be0054fd857","_id":"5614640836058c8c64ac2506"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac218d","name":"location subsystem","type":"addon","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/addon/platform_service/fermat-pip-addon-platform-service-location-subsystem-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710fb1f1c2be0054fd85e","_id":"5614640836058c8c64ac2513"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac218d","name":"power subsystem","type":"addon","description":"","difficulty":0,"code_level":"concept","repo_dir":"PIP/addon/platform_service/fermat-pip-addon-platform-service-power-subsystem-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561710fb1f1c2be0054fd865","_id":"5614640836058c8c64ac2520"},{"_platfrm_id":"561463fc36058c8c64ac225b","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac218d","name":"platform info","type":"addon","description":"","difficulty":2,"code_level":"production","repo_dir":"PIP/addon/platform_service/fermat-pip-addon-platform-service-platform-info-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"acostarodrigo","email":null,"name":"Rodrigo","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9518556?v=3","url":"https://github.com/acostarodrigo","bio":null,"upd_at":"56147cf0c9e113c46518db1d","_id":"5614640036058c8c64ac2329"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"acostarodrigo","email":null,"name":"Rodrigo","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9518556?v=3","url":"https://github.com/acostarodrigo","bio":null,"upd_at":"56147cf0c9e113c46518db1d","_id":"5614640036058c8c64ac2329"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710fb1f1c2be0054fd870","_id":"5614640836058c8c64ac252d"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"wallet factory","type":"android","description":"","difficulty":10,"code_level":"development","repo_dir":"WPD/android/sub_app/fermat-wpd-android-sub-app-wallet-factory-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710fb1f1c2be0054fd87e","_id":"5614640936058c8c64ac2546"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"wallet publisher","type":"android","description":"","difficulty":6,"code_level":"development","repo_dir":"WPD/android/sub_app/fermat-wpd-android-sub-app-wallet-publisher-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710fb1f1c2be0054fd889","_id":"5614640936058c8c64ac255d"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"wallet store","type":"android","description":"","difficulty":8,"code_level":"development","repo_dir":"WPD/android/sub_app/fermat-wpd-android-sub-app-wallet-store-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nelsonalfo","email":"nelsonalfo@gmail.com","name":"Nelson Ramirez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/1823627?v=3","url":"https://github.com/nelsonalfo","bio":null,"upd_at":"56171a4d1f1c2be0054feb59","_id":"5614640a36058c8c64ac257d"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710fc1f1c2be0054fd894","_id":"5614640a36058c8c64ac2572"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2142","name":"wallet manager","type":"android","description":"","difficulty":4,"code_level":"development","repo_dir":"WPD/android/desktop/fermat-wpd-android-desktop-wallet-manager-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nattyco","email":"natalia_veronica_c@hotmail.com","name":"Natalia Cortez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10051490?v=3","url":"https://github.com/nattyco","bio":null,"upd_at":"56171a4d1f1c2be0054feb4e","_id":"5614640036058c8c64ac232f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710fc1f1c2be0054fd8a0","_id":"5614640a36058c8c64ac258a"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2145","name":"wallet runtime","type":"plugin","description":"","difficulty":8,"code_level":"production","repo_dir":"WPD/plugin/engine/fermat-wpd-plugin-engine-wallet-runtime-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710fc1f1c2be0054fd8ac","_id":"5614640a36058c8c64ac25a0"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"wallet factory","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"WPD/plugin/sub_app_module/fermat-wpd-plugin-sub-app-module-wallet-factory-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"acostarodrigo","email":null,"name":"Rodrigo","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9518556?v=3","url":"https://github.com/acostarodrigo","bio":null,"upd_at":"56147cf0c9e113c46518db1d","_id":"5614640036058c8c64ac2329"},"role":"author","scope":"implementation","percnt":80},{"dev":{"usrnm":"acostarodrigo","email":null,"name":"Rodrigo","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9518556?v=3","url":"https://github.com/acostarodrigo","bio":null,"upd_at":"56147cf0c9e113c46518db1d","_id":"5614640036058c8c64ac2329"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710fc1f1c2be0054fd8b8","_id":"5614640b36058c8c64ac25b6"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"wallet publisher","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"WPD/plugin/sub_app_module/fermat-wpd-plugin-sub-app-module-wallet-publisher-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"rart3001","email":null,"name":"Roberto Requena","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/12099493?v=3","url":"https://github.com/Rart3001","bio":null,"upd_at":"56171a4d1f1c2be0054feb62","_id":"5614640b36058c8c64ac25d6"},"role":"author","scope":"implementation","percnt":80},{"dev":{"usrnm":"rart3001","email":null,"name":"Roberto Requena","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/12099493?v=3","url":"https://github.com/Rart3001","bio":null,"upd_at":"56171a4d1f1c2be0054feb62","_id":"5614640b36058c8c64ac25d6"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710fd1f1c2be0054fd8c3","_id":"5614640b36058c8c64ac25cb"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"wallet store","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"WPD/plugin/sub_app_module/fermat-wpd-plugin-sub-app-module-wallet-store-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"acostarodrigo","email":null,"name":"Rodrigo","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9518556?v=3","url":"https://github.com/acostarodrigo","bio":null,"upd_at":"56147cf0c9e113c46518db1d","_id":"5614640036058c8c64ac2329"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"acostarodrigo","email":null,"name":"Rodrigo","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9518556?v=3","url":"https://github.com/acostarodrigo","bio":null,"upd_at":"56147cf0c9e113c46518db1d","_id":"5614640036058c8c64ac2329"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710fd1f1c2be0054fd8ce","_id":"5614640c36058c8c64ac25e2"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214e","name":"wallet manager","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"WPD/plugin/desktop_module/fermat-wpd-plugin-desktop-module-wallet-manager-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"darkestpriest","email":"darkpriestrelative@gmail.com","name":"Manuel Pérez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10060413?v=3","url":"https://github.com/darkestpriest","bio":null,"upd_at":"56171a4d1f1c2be0054feb57","_id":"5614640c36058c8c64ac2603"},"role":"author","scope":"implementation","percnt":80},{"dev":{"usrnm":"darkestpriest","email":"darkpriestrelative@gmail.com","name":"Manuel Pérez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10060413?v=3","url":"https://github.com/darkestpriest","bio":null,"upd_at":"56171a4d1f1c2be0054feb57","_id":"5614640c36058c8c64ac2603"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710fd1f1c2be0054fd8da","_id":"5614640c36058c8c64ac25f8"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2154","name":"publisher","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"WPD/plugin/actor/fermat-wpd-plugin-actor-publisher-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"rart3001","email":null,"name":"Roberto Requena","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/12099493?v=3","url":"https://github.com/Rart3001","bio":null,"upd_at":"56171a4d1f1c2be0054feb62","_id":"5614640b36058c8c64ac25d6"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"rart3001","email":null,"name":"Roberto Requena","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/12099493?v=3","url":"https://github.com/Rart3001","bio":null,"upd_at":"56171a4d1f1c2be0054feb62","_id":"5614640b36058c8c64ac25d6"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710fe1f1c2be0054fd8e6","_id":"5614640d36058c8c64ac2610"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2157","name":"wallet manager","type":"plugin","description":"","difficulty":8,"code_level":"production","repo_dir":"WPD/plugin/middleware/fermat-wpd-plugin-middleware-wallet-manager-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"darkestpriest","email":"darkpriestrelative@gmail.com","name":"Manuel Pérez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10060413?v=3","url":"https://github.com/darkestpriest","bio":null,"upd_at":"56171a4d1f1c2be0054feb57","_id":"5614640c36058c8c64ac2603"},"role":"author","scope":"implementation","percnt":60},{"dev":{"usrnm":"nattyco","email":"natalia_veronica_c@hotmail.com","name":"Natalia Cortez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10051490?v=3","url":"https://github.com/nattyco","bio":null,"upd_at":"56171a4d1f1c2be0054feb4e","_id":"5614640036058c8c64ac232f"},"role":"author","scope":"implementation","percnt":40},{"dev":{"usrnm":"franklinmarcano1970","email":"franklinmarcano1970@gmail.com","name":"Franklin Marcano","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8689068?v=3","url":"https://github.com/franklinmarcano1970","bio":null,"upd_at":"56171a4d1f1c2be0054feb5e","_id":"5614640d36058c8c64ac2639"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710fe1f1c2be0054fd8f4","_id":"5614640d36058c8c64ac2626"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2157","name":"wallet factory","type":"plugin","description":"","difficulty":10,"code_level":"development","repo_dir":"WPD/plugin/middleware/fermat-wpd-plugin-middleware-wallet-factory-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"acostarodrigo","email":null,"name":"Rodrigo","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9518556?v=3","url":"https://github.com/acostarodrigo","bio":null,"upd_at":"56147cf0c9e113c46518db1d","_id":"5614640036058c8c64ac2329"},"role":"author","scope":"implementation","percnt":85},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"author","scope":"implementation","percnt":15},{"dev":{"usrnm":"acostarodrigo","email":null,"name":"Rodrigo","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9518556?v=3","url":"https://github.com/acostarodrigo","bio":null,"upd_at":"56147cf0c9e113c46518db1d","_id":"5614640036058c8c64ac2329"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710fe1f1c2be0054fd901","_id":"5614640d36058c8c64ac2641"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2157","name":"wallet store","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"WPD/plugin/middleware/fermat-wpd-plugin-middleware-wallet-store-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"acostarodrigo","email":null,"name":"Rodrigo","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9518556?v=3","url":"https://github.com/acostarodrigo","bio":null,"upd_at":"56147cf0c9e113c46518db1d","_id":"5614640036058c8c64ac2329"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"acostarodrigo","email":null,"name":"Rodrigo","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9518556?v=3","url":"https://github.com/acostarodrigo","bio":null,"upd_at":"56147cf0c9e113c46518db1d","_id":"5614640036058c8c64ac2329"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710ff1f1c2be0054fd90c","_id":"5614640e36058c8c64ac265a"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2157","name":"wallet settings","type":"plugin","description":"","difficulty":3,"code_level":"development","repo_dir":"WPD/plugin/middleware/fermat-wpd-plugin-middleware-wallet-settings-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710ff1f1c2be0054fd917","_id":"5614640e36058c8c64ac266f"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2178","name":"publisher","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"WPD/plugin/identity/fermat-wpd-plugin-identity-publisher-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nindriago","email":null,"name":"Nerio Indriago","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13187461?v=3","url":"https://github.com/nindriago","bio":null,"upd_at":"56171a4d1f1c2be0054feb55","_id":"5614640e36058c8c64ac2690"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"nattyco","email":"natalia_veronica_c@hotmail.com","name":"Natalia Cortez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10051490?v=3","url":"https://github.com/nattyco","bio":null,"upd_at":"56171a4d1f1c2be0054feb4e","_id":"5614640036058c8c64ac232f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710ff1f1c2be0054fd923","_id":"5614640e36058c8c64ac2685"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217e","name":"wallet resources","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"WPD/plugin/network_service/fermat-wpd-plugin-network-service-wallet-resources-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561710ff1f1c2be0054fd92f","_id":"5614640f36058c8c64ac269d"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217e","name":"wallet store","type":"plugin","description":"enables searching for intra users and conecting one to the other","difficulty":8,"code_level":"development","repo_dir":"WPD/plugin/network_service/fermat-wpd-plugin-network-service-wallet-store-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"acostarodrigo","email":null,"name":"Rodrigo","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9518556?v=3","url":"https://github.com/acostarodrigo","bio":null,"upd_at":"56147cf0c9e113c46518db1d","_id":"5614640036058c8c64ac2329"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"acostarodrigo","email":null,"name":"Rodrigo","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9518556?v=3","url":"https://github.com/acostarodrigo","bio":null,"upd_at":"56147cf0c9e113c46518db1d","_id":"5614640036058c8c64ac2329"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711001f1c2be0054fd93a","_id":"5614640f36058c8c64ac26b2"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217e","name":"wallet statistics","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"WPD/plugin/network_service/fermat-wpd-plugin-network-service-wallet-statistics-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711001f1c2be0054fd941","_id":"5614640f36058c8c64ac26c7"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217e","name":"wallet community","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"WPD/plugin/network_service/fermat-wpd-plugin-network-service-wallet-community-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711001f1c2be0054fd948","_id":"5614640f36058c8c64ac26d4"},{"_platfrm_id":"5614640936058c8c64ac2542","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2181","name":"wallet","type":"addon","description":"","difficulty":0,"code_level":"concept","repo_dir":"WPD/addon/license/fermat-wpd-addon-license-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711001f1c2be0054fd950","_id":"5614640f36058c8c64ac26e2"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"bitcoin wallet","type":"android","description":"","difficulty":8,"code_level":"development","repo_dir":"CCP/android/reference_wallet/fermat-ccp-android-reference-wallet-bitcoin-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711001f1c2be0054fd95e","_id":"5614641036058c8c64ac26f3"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"extra user","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CCP/plugin/sub_app_module/fermat-ccp-plugin-sub-app-module-extra-user-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711021f1c2be0054fd99f","_id":"5614641136058c8c64ac2774"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2154","name":"intra user","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CCP/plugin/actor/fermat-ccp-plugin-actor-intra-user-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nattyco","email":"natalia_veronica_c@hotmail.com","name":"Natalia Cortez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10051490?v=3","url":"https://github.com/nattyco","bio":null,"upd_at":"56171a4d1f1c2be0054feb4e","_id":"5614640036058c8c64ac232f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"nattyco","email":"natalia_veronica_c@hotmail.com","name":"Natalia Cortez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10051490?v=3","url":"https://github.com/nattyco","bio":null,"upd_at":"56171a4d1f1c2be0054feb4e","_id":"5614640036058c8c64ac232f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711021f1c2be0054fd9ab","_id":"5614641136058c8c64ac2782"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"bitcoin loss protected","type":"android","description":"","difficulty":8,"code_level":"development","repo_dir":"CCP/android/reference_wallet/fermat-ccp-android-reference-wallet-bitcoin-loss-protected-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711011f1c2be0054fd969","_id":"5614641036058c8c64ac2708"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"intra user identity","type":"android","description":"","difficulty":4,"code_level":"development","repo_dir":"CCP/android/sub_app/fermat-ccp-android-sub-app-intra-user-identity-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711011f1c2be0054fd975","_id":"5614641036058c8c64ac271e"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"intra user community","type":"android","description":"","difficulty":4,"code_level":"development","repo_dir":"CCP/android/sub_app/fermat-ccp-android-sub-app-intra-user-community-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711011f1c2be0054fd980","_id":"5614641036058c8c64ac2733"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2148","name":"crypto wallet","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"CCP/plugin/wallet_module/fermat-ccp-plugin-wallet-module-crypto-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711011f1c2be0054fd98c","_id":"5614641136058c8c64ac2749"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"intra user","type":"plugin","description":"","difficulty":2,"code_level":"development","repo_dir":"CCP/plugin/sub_app_module/fermat-ccp-plugin-sub-app-module-intra-user-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nattyco","email":"natalia_veronica_c@hotmail.com","name":"Natalia Cortez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10051490?v=3","url":"https://github.com/nattyco","bio":null,"upd_at":"56171a4d1f1c2be0054feb4e","_id":"5614640036058c8c64ac232f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"nattyco","email":"natalia_veronica_c@hotmail.com","name":"Natalia Cortez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10051490?v=3","url":"https://github.com/nattyco","bio":null,"upd_at":"56171a4d1f1c2be0054feb4e","_id":"5614640036058c8c64ac232f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711021f1c2be0054fd998","_id":"5614641136058c8c64ac275f"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2154","name":"extra user","type":"plugin","description":"","difficulty":4,"code_level":"production","repo_dir":"CCP/plugin/actor/fermat-ccp-plugin-actor-extra-user-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nattyco","email":"natalia_veronica_c@hotmail.com","name":"Natalia Cortez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10051490?v=3","url":"https://github.com/nattyco","bio":null,"upd_at":"56171a4d1f1c2be0054feb4e","_id":"5614640036058c8c64ac232f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"nattyco","email":"natalia_veronica_c@hotmail.com","name":"Natalia Cortez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10051490?v=3","url":"https://github.com/nattyco","bio":null,"upd_at":"56171a4d1f1c2be0054feb4e","_id":"5614640036058c8c64ac232f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711031f1c2be0054fd9b6","_id":"5614641236058c8c64ac2797"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2157","name":"wallet contacts","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"CCP/plugin/middleware/fermat-ccp-plugin-middleware-wallet-contacts-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711031f1c2be0054fd9c2","_id":"5614641236058c8c64ac27ad"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215a","name":"crypto request","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"CCP/plugin/request/fermat-ccp-plugin-request-crypto-request-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711031f1c2be0054fd9ce","_id":"5614641236058c8c64ac27c3"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2163","name":"incoming device user","type":"plugin","description":"","difficulty":1,"code_level":"concept","repo_dir":"CCP/plugin/crypto_money_transaction/fermat-ccp-plugin-crypto-money-transaction-incoming-device-user-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711031f1c2be0054fd9d6","_id":"5614641336058c8c64ac27d9"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2163","name":"incoming extra actor","type":"plugin","description":"","difficulty":10,"code_level":"production","repo_dir":"CCP/plugin/crypto_money_transaction/fermat-ccp-plugin-crypto-money-transaction-incoming-extra-actor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"ezequielpostan","email":null,"name":"Ezequiel Postan","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/6744814?v=3","url":"https://github.com/EzequielPostan","bio":null,"upd_at":"56147cf0c9e113c46518db33","_id":"5614641336058c8c64ac27f1"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711041f1c2be0054fd9e1","_id":"5614641336058c8c64ac27e6"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2163","name":"incoming intra actor","type":"plugin","description":"","difficulty":10,"code_level":"development","repo_dir":"CCP/plugin/crypto_money_transaction/fermat-ccp-plugin-crypto-money-transaction-incoming-intra-actor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"ezequielpostan","email":null,"name":"Ezequiel Postan","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/6744814?v=3","url":"https://github.com/EzequielPostan","bio":null,"upd_at":"56147cf0c9e113c46518db33","_id":"5614641336058c8c64ac27f1"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711041f1c2be0054fd9ec","_id":"5614641336058c8c64ac27fd"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2163","name":"intra wallet","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CCP/plugin/crypto_money_transaction/fermat-ccp-plugin-crypto-money-transaction-intra-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711041f1c2be0054fd9f3","_id":"5614641336058c8c64ac2812"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2163","name":"outgoing device user","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CCP/plugin/crypto_money_transaction/fermat-ccp-plugin-crypto-money-transaction-outgoing-device-user-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711041f1c2be0054fd9fa","_id":"5614641436058c8c64ac281f"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2163","name":"outgoing extra actor","type":"plugin","description":"","difficulty":10,"code_level":"production","repo_dir":"CCP/plugin/crypto_money_transaction/fermat-ccp-plugin-crypto-money-transaction-outgoing-extra-actor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"ezequielpostan","email":null,"name":"Ezequiel Postan","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/6744814?v=3","url":"https://github.com/EzequielPostan","bio":null,"upd_at":"56147cf0c9e113c46518db33","_id":"5614641336058c8c64ac27f1"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711041f1c2be0054fda05","_id":"5614641436058c8c64ac282c"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2163","name":"outgoin intra actor","type":"plugin","description":"","difficulty":10,"code_level":"development","repo_dir":"CCP/plugin/crypto_money_transaction/fermat-ccp-plugin-crypto-money-transaction-outgoin-intra-actor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"ezequielpostan","email":null,"name":"Ezequiel Postan","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/6744814?v=3","url":"https://github.com/EzequielPostan","bio":null,"upd_at":"56147cf0c9e113c46518db33","_id":"5614641336058c8c64ac27f1"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711041f1c2be0054fda10","_id":"5614641436058c8c64ac2841"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2163","name":"inter account","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CCP/plugin/crypto_money_transaction/fermat-ccp-plugin-crypto-money-transaction-inter-account-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711041f1c2be0054fda17","_id":"5614641436058c8c64ac2856"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac216f","name":"multi account","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CCP/plugin/composite_wallet/fermat-ccp-plugin-composite-wallet-multi-account-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711051f1c2be0054fda1f","_id":"5614641536058c8c64ac2864"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"bitcoin wallet","type":"plugin","description":"","difficulty":4,"code_level":"production","repo_dir":"CCP/plugin/wallet/fermat-ccp-plugin-wallet-bitcoin-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nattyco","email":"natalia_veronica_c@hotmail.com","name":"Natalia Cortez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10051490?v=3","url":"https://github.com/nattyco","bio":null,"upd_at":"56171a4d1f1c2be0054feb4e","_id":"5614640036058c8c64ac232f"},"role":"author","scope":"implementation","percnt":60},{"dev":{"usrnm":"jorgegonzalez","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/586130?v=3","url":"https://github.com/JorgeGonzalez","bio":null,"upd_at":"56147cf0c9e113c46518db35","_id":"5614641536058c8c64ac2881"},"role":"author","scope":"implementation","percnt":10},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"author","scope":"implementation","percnt":30},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711051f1c2be0054fda2f","_id":"5614641536058c8c64ac2872"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"bitcoin loss protected","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"CCP/plugin/wallet/fermat-ccp-plugin-wallet-bitcoin-loss-protected-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"ezequielpostan","email":null,"name":"Ezequiel Postan","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/6744814?v=3","url":"https://github.com/EzequielPostan","bio":null,"upd_at":"56147cf0c9e113c46518db33","_id":"5614641336058c8c64ac27f1"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"ezequielpostan","email":null,"name":"Ezequiel Postan","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/6744814?v=3","url":"https://github.com/EzequielPostan","bio":null,"upd_at":"56147cf0c9e113c46518db33","_id":"5614641336058c8c64ac27f1"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711051f1c2be0054fda3a","_id":"5614641536058c8c64ac2891"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2175","name":"crypto index","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"CCP/plugin/world/fermat-ccp-plugin-world-crypto-index-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"laderuner","email":"sonnik42@hotmail.com","name":"Francisco Javier Arce","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/3421830?v=3","url":"https://github.com/laderuner","bio":null,"upd_at":"56147cf0c9e113c46518db37","_id":"5614641636058c8c64ac28b2"},"role":"author","scope":"implementation","percnt":60},{"dev":{"usrnm":"laderuner","email":"sonnik42@hotmail.com","name":"Francisco Javier Arce","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/3421830?v=3","url":"https://github.com/laderuner","bio":null,"upd_at":"56147cf0c9e113c46518db37","_id":"5614641636058c8c64ac28b2"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711051f1c2be0054fda46","_id":"5614641536058c8c64ac28a7"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2175","name":"blockchain info","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CCP/plugin/world/fermat-ccp-plugin-world-blockchain-info-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711051f1c2be0054fda4d","_id":"5614641636058c8c64ac28be"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2175","name":"coinapult","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CCP/plugin/world/fermat-ccp-plugin-world-coinapult-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711051f1c2be0054fda54","_id":"5614641636058c8c64ac28cb"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2175","name":"shape shift","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CCP/plugin/world/fermat-ccp-plugin-world-shape-shift-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711051f1c2be0054fda5b","_id":"5614641636058c8c64ac28d8"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2175","name":"coinbase","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CCP/plugin/world/fermat-ccp-plugin-world-coinbase-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711061f1c2be0054fda62","_id":"5614641636058c8c64ac28e5"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2178","name":"intra user","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CCP/plugin/identity/fermat-ccp-plugin-identity-intra-user-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nattyco","email":"natalia_veronica_c@hotmail.com","name":"Natalia Cortez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10051490?v=3","url":"https://github.com/nattyco","bio":null,"upd_at":"56171a4d1f1c2be0054feb4e","_id":"5614640036058c8c64ac232f"},"role":"author","scope":"implementation","percnt":70},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"author","scope":"implementation","percnt":30},{"dev":{"usrnm":"nattyco","email":"natalia_veronica_c@hotmail.com","name":"Natalia Cortez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10051490?v=3","url":"https://github.com/nattyco","bio":null,"upd_at":"56171a4d1f1c2be0054feb4e","_id":"5614640036058c8c64ac232f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711061f1c2be0054fda70","_id":"5614641636058c8c64ac28f3"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217b","name":"intra user","type":"plugin","description":"enables searching for intra users and conecting one to the other","difficulty":6,"code_level":"development","repo_dir":"CCP/plugin/actor_network_service/fermat-ccp-plugin-actor-network-service-intra-user-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nattyco","email":"natalia_veronica_c@hotmail.com","name":"Natalia Cortez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10051490?v=3","url":"https://github.com/nattyco","bio":null,"upd_at":"56171a4d1f1c2be0054feb4e","_id":"5614640036058c8c64ac232f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"nattyco","email":"natalia_veronica_c@hotmail.com","name":"Natalia Cortez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10051490?v=3","url":"https://github.com/nattyco","bio":null,"upd_at":"56171a4d1f1c2be0054feb4e","_id":"5614640036058c8c64ac232f"},"role":"author","scope":"unit-tests","percnt":100},{"dev":{"usrnm":"nattyco","email":"natalia_veronica_c@hotmail.com","name":"Natalia Cortez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10051490?v=3","url":"https://github.com/nattyco","bio":null,"upd_at":"56171a4d1f1c2be0054feb4e","_id":"5614640036058c8c64ac232f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711061f1c2be0054fda7e","_id":"5614641736058c8c64ac290d"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217e","name":"crypto address","type":"plugin","description":"enables the underground exchange of crypto addresses","difficulty":5,"code_level":"development","repo_dir":"CCP/plugin/network_service/fermat-ccp-plugin-network-service-crypto-address-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711061f1c2be0054fda8a","_id":"5614641736058c8c64ac2927"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217e","name":"crypto request","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"CCP/plugin/network_service/fermat-ccp-plugin-network-service-crypto-request-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711071f1c2be0054fda95","_id":"5614641736058c8c64ac293c"},{"_platfrm_id":"5614641036058c8c64ac26ef","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217e","name":"crypto transmission","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"CCP/plugin/network_service/fermat-ccp-plugin-network-service-crypto-transmission-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711071f1c2be0054fdaa0","_id":"5614641836058c8c64ac2951"},{"_platfrm_id":"5614641836058c8c64ac2966","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"crypto commodity money","type":"android","description":"","difficulty":8,"code_level":"development","repo_dir":"CCM/android/reference_wallet/fermat-ccm-android-reference-wallet-crypto-commodity-money-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711071f1c2be0054fdaae","_id":"5614641836058c8c64ac296a"},{"_platfrm_id":"5614641836058c8c64ac2966","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"discount wallet","type":"android","description":"","difficulty":8,"code_level":"development","repo_dir":"CCM/android/reference_wallet/fermat-ccm-android-reference-wallet-discount-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711071f1c2be0054fdab9","_id":"5614641836058c8c64ac297f"},{"_platfrm_id":"5614641836058c8c64ac2966","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215a","name":"money request","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"CCM/plugin/request/fermat-ccm-plugin-request-money-request-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711071f1c2be0054fdac5","_id":"5614641936058c8c64ac2995"},{"_platfrm_id":"5614641836058c8c64ac2966","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2163","name":"incoming device user","type":"plugin","description":"","difficulty":1,"code_level":"concept","repo_dir":"CCM/plugin/crypto_money_transaction/fermat-ccm-plugin-crypto-money-transaction-incoming-device-user-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711081f1c2be0054fdacd","_id":"5614641936058c8c64ac29ab"},{"_platfrm_id":"5614641836058c8c64ac2966","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2163","name":"incoming extra actor","type":"plugin","description":"","difficulty":10,"code_level":"production","repo_dir":"CCM/plugin/crypto_money_transaction/fermat-ccm-plugin-crypto-money-transaction-incoming-extra-actor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"ezequielpostan","email":null,"name":"Ezequiel Postan","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/6744814?v=3","url":"https://github.com/EzequielPostan","bio":null,"upd_at":"56147cf0c9e113c46518db33","_id":"5614641336058c8c64ac27f1"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"ezequielpostan","email":null,"name":"Ezequiel Postan","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/6744814?v=3","url":"https://github.com/EzequielPostan","bio":null,"upd_at":"56147cf0c9e113c46518db33","_id":"5614641336058c8c64ac27f1"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711081f1c2be0054fdad8","_id":"5614641936058c8c64ac29b8"},{"_platfrm_id":"5614641836058c8c64ac2966","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2163","name":"incoming intra actor","type":"plugin","description":"","difficulty":10,"code_level":"development","repo_dir":"CCM/plugin/crypto_money_transaction/fermat-ccm-plugin-crypto-money-transaction-incoming-intra-actor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"ezequielpostan","email":null,"name":"Ezequiel Postan","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/6744814?v=3","url":"https://github.com/EzequielPostan","bio":null,"upd_at":"56147cf0c9e113c46518db33","_id":"5614641336058c8c64ac27f1"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"ezequielpostan","email":null,"name":"Ezequiel Postan","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/6744814?v=3","url":"https://github.com/EzequielPostan","bio":null,"upd_at":"56147cf0c9e113c46518db33","_id":"5614641336058c8c64ac27f1"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711081f1c2be0054fdae3","_id":"5614641936058c8c64ac29cd"},{"_platfrm_id":"5614641836058c8c64ac2966","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2163","name":"intra wallet","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CCM/plugin/crypto_money_transaction/fermat-ccm-plugin-crypto-money-transaction-intra-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711081f1c2be0054fdaea","_id":"5614641a36058c8c64ac29e2"},{"_platfrm_id":"5614641836058c8c64ac2966","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2163","name":"outgoing device user","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CCM/plugin/crypto_money_transaction/fermat-ccm-plugin-crypto-money-transaction-outgoing-device-user-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711081f1c2be0054fdaf1","_id":"5614641a36058c8c64ac29ef"},{"_platfrm_id":"5614641836058c8c64ac2966","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2163","name":"outgoing extra actor","type":"plugin","description":"","difficulty":10,"code_level":"production","repo_dir":"CCM/plugin/crypto_money_transaction/fermat-ccm-plugin-crypto-money-transaction-outgoing-extra-actor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"ezequielpostan","email":null,"name":"Ezequiel Postan","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/6744814?v=3","url":"https://github.com/EzequielPostan","bio":null,"upd_at":"56147cf0c9e113c46518db33","_id":"5614641336058c8c64ac27f1"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"ezequielpostan","email":null,"name":"Ezequiel Postan","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/6744814?v=3","url":"https://github.com/EzequielPostan","bio":null,"upd_at":"56147cf0c9e113c46518db33","_id":"5614641336058c8c64ac27f1"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711081f1c2be0054fdafc","_id":"5614641a36058c8c64ac29fc"},{"_platfrm_id":"5614641836058c8c64ac2966","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2163","name":"outgoin intra actor","type":"plugin","description":"","difficulty":10,"code_level":"development","repo_dir":"CCM/plugin/crypto_money_transaction/fermat-ccm-plugin-crypto-money-transaction-outgoin-intra-actor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"ezequielpostan","email":null,"name":"Ezequiel Postan","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/6744814?v=3","url":"https://github.com/EzequielPostan","bio":null,"upd_at":"56147cf0c9e113c46518db33","_id":"5614641336058c8c64ac27f1"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"ezequielpostan","email":null,"name":"Ezequiel Postan","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/6744814?v=3","url":"https://github.com/EzequielPostan","bio":null,"upd_at":"56147cf0c9e113c46518db33","_id":"5614641336058c8c64ac27f1"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711091f1c2be0054fdb07","_id":"5614641a36058c8c64ac2a11"},{"_platfrm_id":"5614641836058c8c64ac2966","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2163","name":"inter account","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CCM/plugin/crypto_money_transaction/fermat-ccm-plugin-crypto-money-transaction-inter-account-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711091f1c2be0054fdb0e","_id":"5614641b36058c8c64ac2a26"},{"_platfrm_id":"5614641836058c8c64ac2966","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac216f","name":"multi account","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CCM/plugin/composite_wallet/fermat-ccm-plugin-composite-wallet-multi-account-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711091f1c2be0054fdb16","_id":"5614641b36058c8c64ac2a34"},{"_platfrm_id":"5614641836058c8c64ac2966","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"crypto commodity money","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CCM/plugin/wallet/fermat-ccm-plugin-wallet-crypto-commodity-money-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nattyco","email":"natalia_veronica_c@hotmail.com","name":"Natalia Cortez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10051490?v=3","url":"https://github.com/nattyco","bio":null,"upd_at":"56171a4d1f1c2be0054feb4e","_id":"5614640036058c8c64ac232f"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"ezequielpostan","email":null,"name":"Ezequiel Postan","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/6744814?v=3","url":"https://github.com/EzequielPostan","bio":null,"upd_at":"56147cf0c9e113c46518db33","_id":"5614641336058c8c64ac27f1"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711091f1c2be0054fdb22","_id":"5614641b36058c8c64ac2a42"},{"_platfrm_id":"5614641836058c8c64ac2966","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"discount wallet","type":"plugin","description":"","difficulty":10,"code_level":"development","repo_dir":"CCM/plugin/wallet/fermat-ccm-plugin-wallet-discount-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"ezequielpostan","email":null,"name":"Ezequiel Postan","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/6744814?v=3","url":"https://github.com/EzequielPostan","bio":null,"upd_at":"56147cf0c9e113c46518db33","_id":"5614641336058c8c64ac27f1"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"ezequielpostan","email":null,"name":"Ezequiel Postan","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/6744814?v=3","url":"https://github.com/EzequielPostan","bio":null,"upd_at":"56147cf0c9e113c46518db33","_id":"5614641336058c8c64ac27f1"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711091f1c2be0054fdb2d","_id":"5614641b36058c8c64ac2a57"},{"_platfrm_id":"5614641836058c8c64ac2966","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217e","name":"money request","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"CCM/plugin/network_service/fermat-ccm-plugin-network-service-money-request-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"lnacosta","email":null,"name":"León","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/7293791?v=3","url":"https://github.com/lnacosta","bio":null,"upd_at":"56171a4d1f1c2be0054feb53","_id":"561463f536058c8c64ac2078"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"5617110a1f1c2be0054fdb39","_id":"5614641b36058c8c64ac2a6d"},{"_platfrm_id":"5614641836058c8c64ac2966","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217e","name":"money transmission","type":"plugin","description":"","difficulty":5,"code_level":"development","repo_dir":"CCM/plugin/network_service/fermat-ccm-plugin-network-service-money-transmission-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"ezequielpostan","email":null,"name":"Ezequiel Postan","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/6744814?v=3","url":"https://github.com/EzequielPostan","bio":null,"upd_at":"56147cf0c9e113c46518db33","_id":"5614641336058c8c64ac27f1"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"ezequielpostan","email":null,"name":"Ezequiel Postan","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/6744814?v=3","url":"https://github.com/EzequielPostan","bio":null,"upd_at":"56147cf0c9e113c46518db33","_id":"5614641336058c8c64ac27f1"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"5617110a1f1c2be0054fdb44","_id":"5614641c36058c8c64ac2a82"},{"_platfrm_id":"5614641c36058c8c64ac2a97","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"bank notes","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"BNP/android/reference_wallet/fermat-bnp-android-reference-wallet-bank-notes-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110a1f1c2be0054fdb4e","_id":"5614641c36058c8c64ac2a9b"},{"_platfrm_id":"5614641c36058c8c64ac2a97","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2148","name":"bank notes wallet","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"BNP/plugin/wallet_module/fermat-bnp-plugin-wallet-module-bank-notes-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110a1f1c2be0054fdb56","_id":"5614641c36058c8c64ac2aa9"},{"_platfrm_id":"5614641c36058c8c64ac2a97","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2157","name":"bank notes","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"BNP/plugin/middleware/fermat-bnp-plugin-middleware-bank-notes-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110a1f1c2be0054fdb5e","_id":"5614641c36058c8c64ac2ab7"},{"_platfrm_id":"5614641c36058c8c64ac2a97","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"bank notes","type":"plugin","description":"","difficulty":4,"code_level":"concept","repo_dir":"BNP/plugin/wallet/fermat-bnp-plugin-wallet-bank-notes-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110a1f1c2be0054fdb66","_id":"5614641c36058c8c64ac2ac5"},{"_platfrm_id":"5614641c36058c8c64ac2a97","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217e","name":"bank notes","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"BNP/plugin/network_service/fermat-bnp-plugin-network-service-bank-notes-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110b1f1c2be0054fdb6e","_id":"5614641d36058c8c64ac2ad3"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"shop wallet","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/android/reference_wallet/fermat-shp-android-reference-wallet-shop-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110b1f1c2be0054fdb78","_id":"5614641d36058c8c64ac2ae4"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"brand wallet","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/android/reference_wallet/fermat-shp-android-reference-wallet-brand-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110b1f1c2be0054fdb7f","_id":"5614641d36058c8c64ac2af1"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"retailer wallet","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/android/reference_wallet/fermat-shp-android-reference-wallet-retailer-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110b1f1c2be0054fdb86","_id":"5614641d36058c8c64ac2afe"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"shop","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/android/sub_app/fermat-shp-android-sub-app-shop-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110b1f1c2be0054fdb8e","_id":"5614641d36058c8c64ac2b0c"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"brand","type":"android","description":"","difficulty":6,"code_level":"concept","repo_dir":"SHP/android/sub_app/fermat-shp-android-sub-app-brand-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110b1f1c2be0054fdb95","_id":"5614641e36058c8c64ac2b19"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"retailer","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/android/sub_app/fermat-shp-android-sub-app-retailer-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110b1f1c2be0054fdb9c","_id":"5614641e36058c8c64ac2b26"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2148","name":"shop wallet","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/plugin/wallet_module/fermat-shp-plugin-wallet-module-shop-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110b1f1c2be0054fdba4","_id":"5614641e36058c8c64ac2b34"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2148","name":"brand wallet","type":"plugin","description":"","difficulty":3,"code_level":"concept","repo_dir":"SHP/plugin/wallet_module/fermat-shp-plugin-wallet-module-brand-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110c1f1c2be0054fdbab","_id":"5614641e36058c8c64ac2b41"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2148","name":"retailer wallet","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/plugin/wallet_module/fermat-shp-plugin-wallet-module-retailer-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110c1f1c2be0054fdbb2","_id":"5614641e36058c8c64ac2b4e"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"shop","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/plugin/sub_app_module/fermat-shp-plugin-sub-app-module-shop-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110c1f1c2be0054fdbba","_id":"5614641f36058c8c64ac2b5c"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"brand","type":"plugin","description":"","difficulty":4,"code_level":"concept","repo_dir":"SHP/plugin/sub_app_module/fermat-shp-plugin-sub-app-module-brand-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110c1f1c2be0054fdbc1","_id":"5614641f36058c8c64ac2b69"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"retailer","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/plugin/sub_app_module/fermat-shp-plugin-sub-app-module-retailer-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110c1f1c2be0054fdbc8","_id":"5614641f36058c8c64ac2b76"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2154","name":"shop","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/plugin/actor/fermat-shp-plugin-actor-shop-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110c1f1c2be0054fdbd0","_id":"5614641f36058c8c64ac2b84"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2154","name":"brand","type":"plugin","description":"","difficulty":4,"code_level":"concept","repo_dir":"SHP/plugin/actor/fermat-shp-plugin-actor-brand-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110c1f1c2be0054fdbd7","_id":"5614641f36058c8c64ac2b91"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2154","name":"retailer","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/plugin/actor/fermat-shp-plugin-actor-retailer-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110c1f1c2be0054fdbde","_id":"5614642036058c8c64ac2b9e"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2163","name":"purchase","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/plugin/crypto_money_transaction/fermat-shp-plugin-crypto-money-transaction-purchase-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110d1f1c2be0054fdbe6","_id":"5614642036058c8c64ac2bac"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2163","name":"sale","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/plugin/crypto_money_transaction/fermat-shp-plugin-crypto-money-transaction-sale-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110d1f1c2be0054fdbed","_id":"5614642036058c8c64ac2bb9"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"shop wallet","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/plugin/wallet/fermat-shp-plugin-wallet-shop-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110d1f1c2be0054fdbf5","_id":"5614642036058c8c64ac2bc7"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"brand wallet","type":"plugin","description":"","difficulty":4,"code_level":"concept","repo_dir":"SHP/plugin/wallet/fermat-shp-plugin-wallet-brand-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110d1f1c2be0054fdbfc","_id":"5614642036058c8c64ac2bd4"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"retailer wallet","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/plugin/wallet/fermat-shp-plugin-wallet-retailer-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110d1f1c2be0054fdc03","_id":"5614642136058c8c64ac2be1"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2178","name":"shop","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/plugin/identity/fermat-shp-plugin-identity-shop-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110d1f1c2be0054fdc0b","_id":"5614642136058c8c64ac2bef"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2178","name":"brand","type":"plugin","description":"","difficulty":4,"code_level":"concept","repo_dir":"SHP/plugin/identity/fermat-shp-plugin-identity-brand-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110d1f1c2be0054fdc12","_id":"5614642136058c8c64ac2bfc"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2178","name":"retailer","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/plugin/identity/fermat-shp-plugin-identity-retailer-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110d1f1c2be0054fdc19","_id":"5614642136058c8c64ac2c09"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217b","name":"shop","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/plugin/actor_network_service/fermat-shp-plugin-actor-network-service-shop-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110d1f1c2be0054fdc21","_id":"5614642136058c8c64ac2c17"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217b","name":"brand","type":"plugin","description":"","difficulty":4,"code_level":"concept","repo_dir":"SHP/plugin/actor_network_service/fermat-shp-plugin-actor-network-service-brand-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110e1f1c2be0054fdc28","_id":"5614642236058c8c64ac2c24"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217b","name":"retailer","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/plugin/actor_network_service/fermat-shp-plugin-actor-network-service-retailer-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110e1f1c2be0054fdc2f","_id":"5614642236058c8c64ac2c31"},{"_platfrm_id":"5614641d36058c8c64ac2ae0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217e","name":"purchase transmission","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"SHP/plugin/network_service/fermat-shp-plugin-network-service-purchase-transmission-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617110e1f1c2be0054fdc37","_id":"5614642236058c8c64ac2c3f"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"asset issuer","type":"android","description":"","difficulty":8,"code_level":"development","repo_dir":"DAP/android/reference_wallet/fermat-dap-android-reference-wallet-asset-issuer-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"5617110e1f1c2be0054fdc45","_id":"5614642236058c8c64ac2c50"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"asset user","type":"android","description":"","difficulty":8,"code_level":"development","repo_dir":"DAP/android/reference_wallet/fermat-dap-android-reference-wallet-asset-user-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"5617110e1f1c2be0054fdc50","_id":"5614642336058c8c64ac2c65"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"redeem point","type":"android","description":"","difficulty":8,"code_level":"development","repo_dir":"DAP/android/reference_wallet/fermat-dap-android-reference-wallet-redeem-point-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"5617110f1f1c2be0054fdc5b","_id":"5614642336058c8c64ac2c7a"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"asset factory","type":"android","description":"","difficulty":4,"code_level":"development","repo_dir":"DAP/android/sub_app/fermat-dap-android-sub-app-asset-factory-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"5617110f1f1c2be0054fdc67","_id":"5614642336058c8c64ac2c90"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"asset issuer community","type":"android","description":"","difficulty":4,"code_level":"development","repo_dir":"DAP/android/sub_app/fermat-dap-android-sub-app-asset-issuer-community-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"5617110f1f1c2be0054fdc72","_id":"5614642436058c8c64ac2ca5"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"asset user community","type":"android","description":"","difficulty":4,"code_level":"development","repo_dir":"DAP/android/sub_app/fermat-dap-android-sub-app-asset-user-community-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"5617110f1f1c2be0054fdc7d","_id":"5614642436058c8c64ac2cba"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"redeem point community","type":"android","description":"","difficulty":4,"code_level":"development","repo_dir":"DAP/android/sub_app/fermat-dap-android-sub-app-redeem-point-community-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"fvasquezjatar","email":"fvasquezjatar@gmail.com","name":"Francisco Vasquez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8290154?v=3","url":"https://github.com/fvasquezjatar","bio":null,"upd_at":"56171a4d1f1c2be0054feb51","_id":"5614640936058c8c64ac2551"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711101f1c2be0054fdc88","_id":"5614642436058c8c64ac2ccf"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2142","name":"sub app manager","type":"android","description":"","difficulty":4,"code_level":"development","repo_dir":"DAP/android/desktop/fermat-dap-android-desktop-sub-app-manager-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711101f1c2be0054fdc92","_id":"5614642536058c8c64ac2ce5"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2142","name":"wallet manager","type":"android","description":"","difficulty":4,"code_level":"development","repo_dir":"DAP/android/desktop/fermat-dap-android-desktop-wallet-manager-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"furszy","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/5377650?v=3","url":"https://github.com/furszy","bio":null,"upd_at":"56147cf0c9e113c46518db21","_id":"561463f636058c8c64ac209f"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711101f1c2be0054fdc9b","_id":"5614642536058c8c64ac2cf6"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2148","name":"asset issuer","type":"plugin","description":"","difficulty":3,"code_level":"development","repo_dir":"DAP/plugin/wallet_module/fermat-dap-plugin-wallet-module-asset-issuer-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"franklinmarcano1970","email":"franklinmarcano1970@gmail.com","name":"Franklin Marcano","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8689068?v=3","url":"https://github.com/franklinmarcano1970","bio":null,"upd_at":"56171a4d1f1c2be0054feb5e","_id":"5614640d36058c8c64ac2639"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711101f1c2be0054fdca5","_id":"5614642536058c8c64ac2d08"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2148","name":"asset user","type":"plugin","description":"","difficulty":3,"code_level":"development","repo_dir":"DAP/plugin/wallet_module/fermat-dap-plugin-wallet-module-asset-user-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"franklinmarcano1970","email":"franklinmarcano1970@gmail.com","name":"Franklin Marcano","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8689068?v=3","url":"https://github.com/franklinmarcano1970","bio":null,"upd_at":"56171a4d1f1c2be0054feb5e","_id":"5614640d36058c8c64ac2639"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711101f1c2be0054fdcae","_id":"5614642636058c8c64ac2d19"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2148","name":"redeem point","type":"plugin","description":"","difficulty":3,"code_level":"development","repo_dir":"DAP/plugin/wallet_module/fermat-dap-plugin-wallet-module-redeem-point-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"franklinmarcano1970","email":"franklinmarcano1970@gmail.com","name":"Franklin Marcano","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8689068?v=3","url":"https://github.com/franklinmarcano1970","bio":null,"upd_at":"56171a4d1f1c2be0054feb5e","_id":"5614640d36058c8c64ac2639"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711111f1c2be0054fdcb7","_id":"5614642636058c8c64ac2d2a"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"asset factory","type":"plugin","description":"","difficulty":2,"code_level":"development","repo_dir":"DAP/plugin/sub_app_module/fermat-dap-plugin-sub-app-module-asset-factory-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"franklinmarcano1970","email":"franklinmarcano1970@gmail.com","name":"Franklin Marcano","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8689068?v=3","url":"https://github.com/franklinmarcano1970","bio":null,"upd_at":"56171a4d1f1c2be0054feb5e","_id":"5614640d36058c8c64ac2639"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"franklinmarcano1970","email":"franklinmarcano1970@gmail.com","name":"Franklin Marcano","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8689068?v=3","url":"https://github.com/franklinmarcano1970","bio":null,"upd_at":"56171a4d1f1c2be0054feb5e","_id":"5614640d36058c8c64ac2639"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711111f1c2be0054fdcc3","_id":"5614642636058c8c64ac2d3c"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"asset issuer community","type":"plugin","description":"","difficulty":2,"code_level":"development","repo_dir":"DAP/plugin/sub_app_module/fermat-dap-plugin-sub-app-module-asset-issuer-community-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nindriago","email":null,"name":"Nerio Indriago","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13187461?v=3","url":"https://github.com/nindriago","bio":null,"upd_at":"56171a4d1f1c2be0054feb55","_id":"5614640e36058c8c64ac2690"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"franklinmarcano1970","email":"franklinmarcano1970@gmail.com","name":"Franklin Marcano","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8689068?v=3","url":"https://github.com/franklinmarcano1970","bio":null,"upd_at":"56171a4d1f1c2be0054feb5e","_id":"5614640d36058c8c64ac2639"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711111f1c2be0054fdcce","_id":"5614642736058c8c64ac2d51"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"asset user community","type":"plugin","description":"","difficulty":2,"code_level":"development","repo_dir":"DAP/plugin/sub_app_module/fermat-dap-plugin-sub-app-module-asset-user-community-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nindriago","email":null,"name":"Nerio Indriago","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13187461?v=3","url":"https://github.com/nindriago","bio":null,"upd_at":"56171a4d1f1c2be0054feb55","_id":"5614640e36058c8c64ac2690"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"franklinmarcano1970","email":"franklinmarcano1970@gmail.com","name":"Franklin Marcano","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8689068?v=3","url":"https://github.com/franklinmarcano1970","bio":null,"upd_at":"56171a4d1f1c2be0054feb5e","_id":"5614640d36058c8c64ac2639"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711111f1c2be0054fdcd9","_id":"5614642736058c8c64ac2d66"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"redeem point community","type":"plugin","description":"","difficulty":2,"code_level":"development","repo_dir":"DAP/plugin/sub_app_module/fermat-dap-plugin-sub-app-module-redeem-point-community-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nindriago","email":null,"name":"Nerio Indriago","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13187461?v=3","url":"https://github.com/nindriago","bio":null,"upd_at":"56171a4d1f1c2be0054feb55","_id":"5614640e36058c8c64ac2690"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"franklinmarcano1970","email":"franklinmarcano1970@gmail.com","name":"Franklin Marcano","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8689068?v=3","url":"https://github.com/franklinmarcano1970","bio":null,"upd_at":"56171a4d1f1c2be0054feb5e","_id":"5614640d36058c8c64ac2639"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711121f1c2be0054fdce4","_id":"5614642736058c8c64ac2d7b"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214e","name":"sub app manager","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"DAP/plugin/desktop_module/fermat-dap-plugin-desktop-module-sub-app-manager-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711121f1c2be0054fdcee","_id":"5614642836058c8c64ac2d91"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214e","name":"wallet manager","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"DAP/plugin/desktop_module/fermat-dap-plugin-desktop-module-wallet-manager-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711121f1c2be0054fdcf7","_id":"5614642836058c8c64ac2da0"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2154","name":"asset issuer","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"DAP/plugin/actor/fermat-dap-plugin-actor-asset-issuer-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nindriago","email":null,"name":"Nerio Indriago","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13187461?v=3","url":"https://github.com/nindriago","bio":null,"upd_at":"56171a4d1f1c2be0054feb55","_id":"5614640e36058c8c64ac2690"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711121f1c2be0054fdd01","_id":"5614642836058c8c64ac2db0"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2154","name":"asset user","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"DAP/plugin/actor/fermat-dap-plugin-actor-asset-user-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nindriago","email":null,"name":"Nerio Indriago","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13187461?v=3","url":"https://github.com/nindriago","bio":null,"upd_at":"56171a4d1f1c2be0054feb55","_id":"5614640e36058c8c64ac2690"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711121f1c2be0054fdd0a","_id":"5614642936058c8c64ac2dc1"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2154","name":"redeem point","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"DAP/plugin/actor/fermat-dap-plugin-actor-redeem-point-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nindriago","email":null,"name":"Nerio Indriago","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13187461?v=3","url":"https://github.com/nindriago","bio":null,"upd_at":"56171a4d1f1c2be0054feb55","_id":"5614640e36058c8c64ac2690"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711131f1c2be0054fdd13","_id":"5614642936058c8c64ac2dd2"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2157","name":"asset factory","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"DAP/plugin/middleware/fermat-dap-plugin-middleware-asset-factory-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"franklinmarcano1970","email":"franklinmarcano1970@gmail.com","name":"Franklin Marcano","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8689068?v=3","url":"https://github.com/franklinmarcano1970","bio":null,"upd_at":"56171a4d1f1c2be0054feb5e","_id":"5614640d36058c8c64ac2639"},"role":"author","scope":"implementation","percnt":100},{"dev":{"usrnm":"acostarodrigo","email":null,"name":"Rodrigo","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9518556?v=3","url":"https://github.com/acostarodrigo","bio":null,"upd_at":"56147cf0c9e113c46518db1d","_id":"5614640036058c8c64ac2329"},"role":"mantainer","percnt":0}],"certs":[],"life_cycle":[],"upd_at":"561711131f1c2be0054fdd1f","_id":"5614642936058c8c64ac2de4"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2160","name":"asset distribution","type":"plugin","description":"","difficulty":10,"code_level":"development","repo_dir":"DAP/plugin/digital_asset_transaction/fermat-dap-plugin-digital-asset-transaction-asset-distribution-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"darkestpriest","email":"darkpriestrelative@gmail.com","name":"Manuel Pérez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10060413?v=3","url":"https://github.com/darkestpriest","bio":null,"upd_at":"56171a4d1f1c2be0054feb57","_id":"5614640c36058c8c64ac2603"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711131f1c2be0054fdd29","_id":"5614642936058c8c64ac2dfa"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2160","name":"asset reception","type":"plugin","description":"","difficulty":10,"code_level":"development","repo_dir":"DAP/plugin/digital_asset_transaction/fermat-dap-plugin-digital-asset-transaction-asset-reception-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"darkestpriest","email":"darkpriestrelative@gmail.com","name":"Manuel Pérez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10060413?v=3","url":"https://github.com/darkestpriest","bio":null,"upd_at":"56171a4d1f1c2be0054feb57","_id":"5614640c36058c8c64ac2603"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711131f1c2be0054fdd32","_id":"5614642a36058c8c64ac2e0b"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2160","name":"asset issuing","type":"plugin","description":"","difficulty":10,"code_level":"development","repo_dir":"DAP/plugin/digital_asset_transaction/fermat-dap-plugin-digital-asset-transaction-asset-issuing-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"darkestpriest","email":"darkpriestrelative@gmail.com","name":"Manuel Pérez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10060413?v=3","url":"https://github.com/darkestpriest","bio":null,"upd_at":"56171a4d1f1c2be0054feb57","_id":"5614640c36058c8c64ac2603"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711131f1c2be0054fdd3b","_id":"5614642a36058c8c64ac2e1c"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2160","name":"issuer redemption","type":"plugin","description":"","difficulty":10,"code_level":"development","repo_dir":"DAP/plugin/digital_asset_transaction/fermat-dap-plugin-digital-asset-transaction-issuer-redemption-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"darkestpriest","email":"darkpriestrelative@gmail.com","name":"Manuel Pérez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10060413?v=3","url":"https://github.com/darkestpriest","bio":null,"upd_at":"56171a4d1f1c2be0054feb57","_id":"5614640c36058c8c64ac2603"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711141f1c2be0054fdd44","_id":"5614642a36058c8c64ac2e2d"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2160","name":"user redemption","type":"plugin","description":"","difficulty":10,"code_level":"development","repo_dir":"DAP/plugin/digital_asset_transaction/fermat-dap-plugin-digital-asset-transaction-user-redemption-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"darkestpriest","email":"darkpriestrelative@gmail.com","name":"Manuel Pérez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10060413?v=3","url":"https://github.com/darkestpriest","bio":null,"upd_at":"56171a4d1f1c2be0054feb57","_id":"5614640c36058c8c64ac2603"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711141f1c2be0054fdd4d","_id":"5614642a36058c8c64ac2e3e"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2160","name":"redeem point redemption","type":"plugin","description":"","difficulty":10,"code_level":"development","repo_dir":"DAP/plugin/digital_asset_transaction/fermat-dap-plugin-digital-asset-transaction-redeem-point-redemption-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"darkestpriest","email":"darkpriestrelative@gmail.com","name":"Manuel Pérez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10060413?v=3","url":"https://github.com/darkestpriest","bio":null,"upd_at":"56171a4d1f1c2be0054feb57","_id":"5614640c36058c8c64ac2603"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711141f1c2be0054fdd56","_id":"5614642a36058c8c64ac2e4f"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2160","name":"asset appropriation","type":"plugin","description":"","difficulty":10,"code_level":"development","repo_dir":"DAP/plugin/digital_asset_transaction/fermat-dap-plugin-digital-asset-transaction-asset-appropriation-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"darkestpriest","email":"darkpriestrelative@gmail.com","name":"Manuel Pérez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10060413?v=3","url":"https://github.com/darkestpriest","bio":null,"upd_at":"56171a4d1f1c2be0054feb57","_id":"5614640c36058c8c64ac2603"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711141f1c2be0054fdd5f","_id":"5614642a36058c8c64ac2e60"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2160","name":"appropriation stats","type":"plugin","description":"","difficulty":10,"code_level":"development","repo_dir":"DAP/plugin/digital_asset_transaction/fermat-dap-plugin-digital-asset-transaction-appropriation-stats-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"darkestpriest","email":"darkpriestrelative@gmail.com","name":"Manuel Pérez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/10060413?v=3","url":"https://github.com/darkestpriest","bio":null,"upd_at":"56171a4d1f1c2be0054feb57","_id":"5614640c36058c8c64ac2603"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711141f1c2be0054fdd68","_id":"5614642a36058c8c64ac2e71"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"assets issuer wallet","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"DAP/plugin/wallet/fermat-dap-plugin-wallet-assets-issuer-wallet-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"franklinmarcano1970","email":"franklinmarcano1970@gmail.com","name":"Franklin Marcano","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8689068?v=3","url":"https://github.com/franklinmarcano1970","bio":null,"upd_at":"56171a4d1f1c2be0054feb5e","_id":"5614640d36058c8c64ac2639"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711151f1c2be0054fdd72","_id":"5614642b36058c8c64ac2e83"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"assets user wallet","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"DAP/plugin/wallet/fermat-dap-plugin-wallet-assets-user-wallet-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"franklinmarcano1970","email":"franklinmarcano1970@gmail.com","name":"Franklin Marcano","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8689068?v=3","url":"https://github.com/franklinmarcano1970","bio":null,"upd_at":"56171a4d1f1c2be0054feb5e","_id":"5614640d36058c8c64ac2639"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711151f1c2be0054fdd7b","_id":"5614642b36058c8c64ac2e94"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"redeem point wallet","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"DAP/plugin/wallet/fermat-dap-plugin-wallet-redeem-point-wallet-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"franklinmarcano1970","email":"franklinmarcano1970@gmail.com","name":"Franklin Marcano","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/8689068?v=3","url":"https://github.com/franklinmarcano1970","bio":null,"upd_at":"56171a4d1f1c2be0054feb5e","_id":"5614640d36058c8c64ac2639"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711151f1c2be0054fdd84","_id":"5614642b36058c8c64ac2ea5"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2178","name":"asset issuer","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"DAP/plugin/identity/fermat-dap-plugin-identity-asset-issuer-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nindriago","email":null,"name":"Nerio Indriago","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13187461?v=3","url":"https://github.com/nindriago","bio":null,"upd_at":"56171a4d1f1c2be0054feb55","_id":"5614640e36058c8c64ac2690"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711151f1c2be0054fdd8e","_id":"5614642b36058c8c64ac2eb7"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2178","name":"asset user","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"DAP/plugin/identity/fermat-dap-plugin-identity-asset-user-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nindriago","email":null,"name":"Nerio Indriago","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13187461?v=3","url":"https://github.com/nindriago","bio":null,"upd_at":"56171a4d1f1c2be0054feb55","_id":"5614640e36058c8c64ac2690"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711161f1c2be0054fdd97","_id":"5614642b36058c8c64ac2ec8"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2178","name":"redeem point","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"DAP/plugin/identity/fermat-dap-plugin-identity-redeem-point-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nindriago","email":null,"name":"Nerio Indriago","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13187461?v=3","url":"https://github.com/nindriago","bio":null,"upd_at":"56171a4d1f1c2be0054feb55","_id":"5614640e36058c8c64ac2690"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711161f1c2be0054fdda0","_id":"5614642b36058c8c64ac2ed9"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217b","name":"asset issuer","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"DAP/plugin/actor_network_service/fermat-dap-plugin-actor-network-service-asset-issuer-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"rart3001","email":null,"name":"Roberto Requena","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/12099493?v=3","url":"https://github.com/Rart3001","bio":null,"upd_at":"56171a4d1f1c2be0054feb62","_id":"5614640b36058c8c64ac25d6"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711161f1c2be0054fddaa","_id":"5614642c36058c8c64ac2eeb"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217b","name":"asset user","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"DAP/plugin/actor_network_service/fermat-dap-plugin-actor-network-service-asset-user-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"acostarodrigo","email":null,"name":"Rodrigo","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9518556?v=3","url":"https://github.com/acostarodrigo","bio":null,"upd_at":"56147cf0c9e113c46518db1d","_id":"5614640036058c8c64ac2329"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711161f1c2be0054fddb3","_id":"5614642c36058c8c64ac2efc"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217b","name":"redeem point","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"DAP/plugin/actor_network_service/fermat-dap-plugin-actor-network-service-redeem-point-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"acostarodrigo","email":null,"name":"Rodrigo","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9518556?v=3","url":"https://github.com/acostarodrigo","bio":null,"upd_at":"56147cf0c9e113c46518db1d","_id":"5614640036058c8c64ac2329"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711161f1c2be0054fddbc","_id":"5614642c36058c8c64ac2f0d"},{"_platfrm_id":"5614642236058c8c64ac2c4c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217e","name":"asset transmission","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"DAP/plugin/network_service/fermat-dap-plugin-network-service-asset-transmission-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"rart3001","email":null,"name":"Roberto Requena","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/12099493?v=3","url":"https://github.com/Rart3001","bio":null,"upd_at":"56171a4d1f1c2be0054feb62","_id":"5614640b36058c8c64ac25d6"},"role":"author","scope":"implementation","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711171f1c2be0054fddc6","_id":"5614642c36058c8c64ac2f1f"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"wallet branding","type":"android","description":"","difficulty":10,"code_level":"concept","repo_dir":"MKT/android/sub_app/fermat-mkt-android-sub-app-wallet-branding-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711171f1c2be0054fddd0","_id":"5614642c36058c8c64ac2f34"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"marketer","type":"android","description":"","difficulty":6,"code_level":"concept","repo_dir":"MKT/android/sub_app/fermat-mkt-android-sub-app-marketer-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711171f1c2be0054fddd7","_id":"5614642c36058c8c64ac2f41"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"voucher wallet","type":"android","description":"","difficulty":8,"code_level":"concept","repo_dir":"MKT/android/reference_wallet/fermat-mkt-android-reference-wallet-voucher-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711171f1c2be0054fdddf","_id":"5614642c36058c8c64ac2f4f"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"coupon wallet","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"MKT/android/reference_wallet/fermat-mkt-android-reference-wallet-coupon-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711171f1c2be0054fdde6","_id":"5614642c36058c8c64ac2f5c"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"discount wallet","type":"android","description":"","difficulty":8,"code_level":"concept","repo_dir":"MKT/android/reference_wallet/fermat-mkt-android-reference-wallet-discount-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711181f1c2be0054fdded","_id":"5614642c36058c8c64ac2f69"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"wallet branding","type":"plugin","description":"","difficulty":4,"code_level":"concept","repo_dir":"MKT/plugin/sub_app_module/fermat-mkt-plugin-sub-app-module-wallet-branding-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711181f1c2be0054fddf5","_id":"5614642d36058c8c64ac2f77"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"marketer","type":"plugin","description":"","difficulty":4,"code_level":"concept","repo_dir":"MKT/plugin/sub_app_module/fermat-mkt-plugin-sub-app-module-marketer-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711181f1c2be0054fddfc","_id":"5614642d36058c8c64ac2f84"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2154","name":"marketer","type":"plugin","description":"","difficulty":4,"code_level":"concept","repo_dir":"MKT/plugin/actor/fermat-mkt-plugin-actor-marketer-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711181f1c2be0054fde04","_id":"5614642d36058c8c64ac2f92"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2148","name":"voucher wallet","type":"plugin","description":"","difficulty":3,"code_level":"concept","repo_dir":"MKT/plugin/wallet_module/fermat-mkt-plugin-wallet-module-voucher-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711181f1c2be0054fde0c","_id":"5614642d36058c8c64ac2fa0"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2148","name":"coupon wallet","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"MKT/plugin/wallet_module/fermat-mkt-plugin-wallet-module-coupon-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711181f1c2be0054fde13","_id":"5614642d36058c8c64ac2fad"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2148","name":"discount wallet","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"MKT/plugin/wallet_module/fermat-mkt-plugin-wallet-module-discount-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711191f1c2be0054fde1a","_id":"5614642d36058c8c64ac2fba"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2160","name":"incoming voucher","type":"plugin","description":"","difficulty":6,"code_level":"concept","repo_dir":"MKT/plugin/digital_asset_transaction/fermat-mkt-plugin-digital-asset-transaction-incoming-voucher-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711191f1c2be0054fde22","_id":"5614642d36058c8c64ac2fc8"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2160","name":"outgoing voucher","type":"plugin","description":"","difficulty":6,"code_level":"concept","repo_dir":"MKT/plugin/digital_asset_transaction/fermat-mkt-plugin-digital-asset-transaction-outgoing-voucher-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711191f1c2be0054fde29","_id":"5614642d36058c8c64ac2fd5"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2160","name":"incoming coupon","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"MKT/plugin/digital_asset_transaction/fermat-mkt-plugin-digital-asset-transaction-incoming-coupon-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711191f1c2be0054fde30","_id":"5614642d36058c8c64ac2fe2"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2160","name":"outgoing coupon","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"MKT/plugin/digital_asset_transaction/fermat-mkt-plugin-digital-asset-transaction-outgoing-coupon-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711191f1c2be0054fde37","_id":"5614642d36058c8c64ac2fef"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2160","name":"incoming discount","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"MKT/plugin/digital_asset_transaction/fermat-mkt-plugin-digital-asset-transaction-incoming-discount-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711191f1c2be0054fde3e","_id":"5614642d36058c8c64ac2ffc"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2160","name":"outgoing discount","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"MKT/plugin/digital_asset_transaction/fermat-mkt-plugin-digital-asset-transaction-outgoing-discount-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711191f1c2be0054fde45","_id":"5614642e36058c8c64ac3009"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"voucher","type":"plugin","description":"","difficulty":4,"code_level":"concept","repo_dir":"MKT/plugin/wallet/fermat-mkt-plugin-wallet-voucher-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617111a1f1c2be0054fde4d","_id":"5614642e36058c8c64ac3017"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"coupon","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"MKT/plugin/wallet/fermat-mkt-plugin-wallet-coupon-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617111a1f1c2be0054fde54","_id":"5614642e36058c8c64ac3024"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"discount","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"MKT/plugin/wallet/fermat-mkt-plugin-wallet-discount-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617111a1f1c2be0054fde5b","_id":"5614642e36058c8c64ac3031"},{"_platfrm_id":"5614642c36058c8c64ac2f30","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2178","name":"marketer","type":"plugin","description":"","difficulty":4,"code_level":"concept","repo_dir":"MKT/plugin/identity/fermat-mkt-plugin-identity-marketer-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617111a1f1c2be0054fde63","_id":"5614642e36058c8c64ac303f"},{"_platfrm_id":"5614642e36058c8c64ac304c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2166","name":"give cash on hand","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"CSH/plugin/cash_money_transaction/fermat-csh-plugin-cash-money-transaction-give-cash-on-hand-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111b1f1c2be0054fde6f","_id":"5614642e36058c8c64ac3050"},{"_platfrm_id":"5614642e36058c8c64ac304c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2166","name":"receive cash on hand","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"CSH/plugin/cash_money_transaction/fermat-csh-plugin-cash-money-transaction-receive-cash-on-hand-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111b1f1c2be0054fde78","_id":"5614642e36058c8c64ac3063"},{"_platfrm_id":"5614642e36058c8c64ac304c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2166","name":"send cash delivery","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"CSH/plugin/cash_money_transaction/fermat-csh-plugin-cash-money-transaction-send-cash-delivery-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111b1f1c2be0054fde81","_id":"5614642e36058c8c64ac3074"},{"_platfrm_id":"5614642e36058c8c64ac304c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2166","name":"receive cash delivery","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"CSH/plugin/cash_money_transaction/fermat-csh-plugin-cash-money-transaction-receive-cash-delivery-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111b1f1c2be0054fde8a","_id":"5614642e36058c8c64ac3085"},{"_platfrm_id":"5614642e36058c8c64ac304c","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"cash money","type":"plugin","description":"","difficulty":2,"code_level":"development","repo_dir":"CSH/plugin/wallet/fermat-csh-plugin-wallet-cash-money-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111c1f1c2be0054fde94","_id":"5614642e36058c8c64ac3097"},{"_platfrm_id":"5614642f36058c8c64ac30a8","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2169","name":"make offline bank transfer","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"BNK/plugin/bank_money_transaction/fermat-bnk-plugin-bank-money-transaction-make-offline-bank-transfer-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111c1f1c2be0054fdea0","_id":"5614642f36058c8c64ac30ac"},{"_platfrm_id":"5614642f36058c8c64ac30a8","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2169","name":"receive offline bank transfer","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"BNK/plugin/bank_money_transaction/fermat-bnk-plugin-bank-money-transaction-receive-offline-bank-transfer-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111c1f1c2be0054fdea9","_id":"5614642f36058c8c64ac30bd"},{"_platfrm_id":"5614642f36058c8c64ac30a8","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"bank money","type":"plugin","description":"","difficulty":2,"code_level":"development","repo_dir":"BNK/plugin/wallet/fermat-bnk-plugin-wallet-bank-money-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111c1f1c2be0054fdeb3","_id":"5614642f36058c8c64ac30cf"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"crypto broker","type":"android","description":"","difficulty":8,"code_level":"development","repo_dir":"CBP/android/reference_wallet/fermat-cbp-android-reference-wallet-crypto-broker-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nelsonalfo","email":"nelsonalfo@gmail.com","name":"Nelson Ramirez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/1823627?v=3","url":"https://github.com/nelsonalfo","bio":null,"upd_at":"56171a4d1f1c2be0054feb59","_id":"5614640a36058c8c64ac257d"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111c1f1c2be0054fdebf","_id":"5614642f36058c8c64ac30e4"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"crypto customer","type":"android","description":"","difficulty":8,"code_level":"development","repo_dir":"CBP/android/reference_wallet/fermat-cbp-android-reference-wallet-crypto-customer-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nelsonalfo","email":"nelsonalfo@gmail.com","name":"Nelson Ramirez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/1823627?v=3","url":"https://github.com/nelsonalfo","bio":null,"upd_at":"56171a4d1f1c2be0054feb59","_id":"5614640a36058c8c64ac257d"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111d1f1c2be0054fdec8","_id":"5614642f36058c8c64ac30f5"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"crypto broker identity","type":"android","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/android/sub_app/fermat-cbp-android-sub-app-crypto-broker-identity-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nelsonalfo","email":"nelsonalfo@gmail.com","name":"Nelson Ramirez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/1823627?v=3","url":"https://github.com/nelsonalfo","bio":null,"upd_at":"56171a4d1f1c2be0054feb59","_id":"5614640a36058c8c64ac257d"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111d1f1c2be0054fded2","_id":"5614642f36058c8c64ac3107"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"crypto broker community","type":"android","description":"","difficulty":6,"code_level":"development","repo_dir":"CBP/android/sub_app/fermat-cbp-android-sub-app-crypto-broker-community-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nelsonalfo","email":"nelsonalfo@gmail.com","name":"Nelson Ramirez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/1823627?v=3","url":"https://github.com/nelsonalfo","bio":null,"upd_at":"56171a4d1f1c2be0054feb59","_id":"5614640a36058c8c64ac257d"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111d1f1c2be0054fdedb","_id":"5614643036058c8c64ac3118"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"crypto customer identity","type":"android","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/android/sub_app/fermat-cbp-android-sub-app-crypto-customer-identity-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nelsonalfo","email":"nelsonalfo@gmail.com","name":"Nelson Ramirez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/1823627?v=3","url":"https://github.com/nelsonalfo","bio":null,"upd_at":"56171a4d1f1c2be0054feb59","_id":"5614640a36058c8c64ac257d"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111d1f1c2be0054fdee4","_id":"5614643036058c8c64ac3129"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"crypto customer community","type":"android","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/android/sub_app/fermat-cbp-android-sub-app-crypto-customer-community-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nelsonalfo","email":"nelsonalfo@gmail.com","name":"Nelson Ramirez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/1823627?v=3","url":"https://github.com/nelsonalfo","bio":null,"upd_at":"56171a4d1f1c2be0054feb59","_id":"5614640a36058c8c64ac257d"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111d1f1c2be0054fdeed","_id":"5614643036058c8c64ac313a"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"customers","type":"android","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/android/sub_app/fermat-cbp-android-sub-app-customers-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nelsonalfo","email":"nelsonalfo@gmail.com","name":"Nelson Ramirez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/1823627?v=3","url":"https://github.com/nelsonalfo","bio":null,"upd_at":"56171a4d1f1c2be0054feb59","_id":"5614640a36058c8c64ac257d"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111d1f1c2be0054fdef6","_id":"5614643036058c8c64ac314b"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"suppliers","type":"android","description":"","difficulty":6,"code_level":"concept","repo_dir":"CBP/android/sub_app/fermat-cbp-android-sub-app-suppliers-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617111d1f1c2be0054fdefd","_id":"5614643136058c8c64ac315c"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2142","name":"sub app manager","type":"android","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/android/desktop/fermat-cbp-android-desktop-sub-app-manager-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nelsonalfo","email":"nelsonalfo@gmail.com","name":"Nelson Ramirez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/1823627?v=3","url":"https://github.com/nelsonalfo","bio":null,"upd_at":"56171a4d1f1c2be0054feb59","_id":"5614640a36058c8c64ac257d"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111e1f1c2be0054fdf07","_id":"5614643136058c8c64ac316a"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2142","name":"wallet manager","type":"android","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/android/desktop/fermat-cbp-android-desktop-wallet-manager-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"nelsonalfo","email":"nelsonalfo@gmail.com","name":"Nelson Ramirez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/1823627?v=3","url":"https://github.com/nelsonalfo","bio":null,"upd_at":"56171a4d1f1c2be0054feb59","_id":"5614640a36058c8c64ac257d"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111e1f1c2be0054fdf10","_id":"5614643136058c8c64ac317b"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2148","name":"crypto broker","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/plugin/wallet_module/fermat-cbp-plugin-wallet-module-crypto-broker-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111e1f1c2be0054fdf1a","_id":"5614643136058c8c64ac318d"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2148","name":"crypto customer","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/plugin/wallet_module/fermat-cbp-plugin-wallet-module-crypto-customer-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111e1f1c2be0054fdf23","_id":"5614643136058c8c64ac31a0"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"crypto broker identity","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/plugin/sub_app_module/fermat-cbp-plugin-sub-app-module-crypto-broker-identity-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111e1f1c2be0054fdf2d","_id":"5614643236058c8c64ac31b2"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"crypto broker community","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/plugin/sub_app_module/fermat-cbp-plugin-sub-app-module-crypto-broker-community-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111e1f1c2be0054fdf36","_id":"5614643236058c8c64ac31c3"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"crypto customer identity","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/plugin/sub_app_module/fermat-cbp-plugin-sub-app-module-crypto-customer-identity-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111f1f1c2be0054fdf3f","_id":"5614643236058c8c64ac31d4"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"crypto customer community","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/plugin/sub_app_module/fermat-cbp-plugin-sub-app-module-crypto-customer-community-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111f1f1c2be0054fdf48","_id":"5614643236058c8c64ac31e5"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"customers","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/plugin/sub_app_module/fermat-cbp-plugin-sub-app-module-customers-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111f1f1c2be0054fdf51","_id":"5614643336058c8c64ac31f6"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"suppliers","type":"plugin","description":"","difficulty":4,"code_level":"concept","repo_dir":"CBP/plugin/sub_app_module/fermat-cbp-plugin-sub-app-module-suppliers-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617111f1f1c2be0054fdf58","_id":"5614643336058c8c64ac3207"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214e","name":"sub app manager","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/plugin/desktop_module/fermat-cbp-plugin-desktop-module-sub-app-manager-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111f1f1c2be0054fdf62","_id":"5614643336058c8c64ac3215"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214e","name":"wallet manager","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/plugin/desktop_module/fermat-cbp-plugin-desktop-module-wallet-manager-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"5617111f1f1c2be0054fdf6b","_id":"5614643336058c8c64ac3226"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2154","name":"crypto broker","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"CBP/plugin/actor/fermat-cbp-plugin-actor-crypto-broker-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711201f1c2be0054fdf75","_id":"5614643336058c8c64ac3238"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2154","name":"crypto customer","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"CBP/plugin/actor/fermat-cbp-plugin-actor-crypto-customer-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711201f1c2be0054fdf7e","_id":"5614643436058c8c64ac3249"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac216c","name":"customer broker crypto money purchase","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"CBP/plugin/contract/fermat-cbp-plugin-contract-customer-broker-crypto-money-purchase-bitdubai","found":true,"devs":[{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711201f1c2be0054fdf88","_id":"5614643436058c8c64ac325b"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac216c","name":"customer broker cash money purchase","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"CBP/plugin/contract/fermat-cbp-plugin-contract-customer-broker-cash-money-purchase-bitdubai","found":true,"devs":[{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711201f1c2be0054fdf91","_id":"5614643436058c8c64ac326c"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac216c","name":"customer broker bank money purchase","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"CBP/plugin/contract/fermat-cbp-plugin-contract-customer-broker-bank-money-purchase-bitdubai","found":true,"devs":[{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711201f1c2be0054fdf9a","_id":"5614643436058c8c64ac327d"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac216c","name":"customer broker crypto money sale","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"CBP/plugin/contract/fermat-cbp-plugin-contract-customer-broker-crypto-money-sale-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711201f1c2be0054fdfa3","_id":"5614643536058c8c64ac328e"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac216c","name":"customer broker cash money sale","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"CBP/plugin/contract/fermat-cbp-plugin-contract-customer-broker-cash-money-sale-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711211f1c2be0054fdfac","_id":"5614643536058c8c64ac329f"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac216c","name":"customer broker bank money sale","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"CBP/plugin/contract/fermat-cbp-plugin-contract-customer-broker-bank-money-sale-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711211f1c2be0054fdfb5","_id":"5614643536058c8c64ac32b0"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac216c","name":"broker to broker","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CBP/plugin/contract/fermat-cbp-plugin-contract-broker-to-broker-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711211f1c2be0054fdfbc","_id":"5614643536058c8c64ac32c1"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac216c","name":"broker to wholesaler","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CBP/plugin/contract/fermat-cbp-plugin-contract-broker-to-wholesaler-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711211f1c2be0054fdfc3","_id":"5614643636058c8c64ac32ce"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215a","name":"customer broker purchase","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/plugin/request/fermat-cbp-plugin-request-customer-broker-purchase-bitdubai","found":true,"devs":[{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711211f1c2be0054fdfcd","_id":"5614643636058c8c64ac32dc"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215a","name":"customer broker sale","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/plugin/request/fermat-cbp-plugin-request-customer-broker-sale-bitdubai","found":true,"devs":[{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711211f1c2be0054fdfd6","_id":"5614643636058c8c64ac32ed"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2157","name":"customers","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/plugin/middleware/fermat-cbp-plugin-middleware-customers-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711221f1c2be0054fdfe0","_id":"5614643636058c8c64ac32ff"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2157","name":"wholesalers","type":"plugin","description":"","difficulty":4,"code_level":"concept","repo_dir":"CBP/plugin/middleware/fermat-cbp-plugin-middleware-wholesalers-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711221f1c2be0054fdfe9","_id":"5614643736058c8c64ac3310"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2157","name":"crypto broker wallet identity","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/plugin/middleware/fermat-cbp-plugin-middleware-crypto-broker-wallet-identity-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711221f1c2be0054fdff2","_id":"5614643736058c8c64ac3321"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2157","name":"wallet manager","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"CBP/plugin/middleware/fermat-cbp-plugin-middleware-wallet-manager-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711221f1c2be0054fdffb","_id":"5614643736058c8c64ac3332"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2157","name":"sub app manager","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"CBP/plugin/middleware/fermat-cbp-plugin-middleware-sub-app-manager-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"vlzangel","email":null,"name":null,"bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/13138418?v=3","url":"https://github.com/vlzangel","bio":null,"upd_at":"56147cf0c9e113c46518db3b","_id":"5614643136058c8c64ac3198"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711221f1c2be0054fe004","_id":"5614643836058c8c64ac3343"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2151","name":"crypto broker","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"CBP/plugin/agent/fermat-cbp-plugin-agent-crypto-broker-bitdubai","found":true,"devs":[{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711221f1c2be0054fe00e","_id":"5614643836058c8c64ac3355"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"crypto money stock replenishment","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/plugin/business_transaction/fermat-cbp-plugin-business-transaction-crypto-money-stock-replenishment-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711221f1c2be0054fe018","_id":"5614643836058c8c64ac3367"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"cash money stock replenishment","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/plugin/business_transaction/fermat-cbp-plugin-business-transaction-cash-money-stock-replenishment-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711231f1c2be0054fe021","_id":"5614643836058c8c64ac3378"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"bank money stock replenishment","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/plugin/business_transaction/fermat-cbp-plugin-business-transaction-bank-money-stock-replenishment-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711231f1c2be0054fe02a","_id":"5614643936058c8c64ac3389"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"customer broker crypto sale","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"CBP/plugin/business_transaction/fermat-cbp-plugin-business-transaction-customer-broker-crypto-sale-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711231f1c2be0054fe033","_id":"5614643936058c8c64ac339a"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"customer broker cash sale","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"CBP/plugin/business_transaction/fermat-cbp-plugin-business-transaction-customer-broker-cash-sale-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711231f1c2be0054fe03c","_id":"5614643936058c8c64ac33ab"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"customer broker bank sale","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"CBP/plugin/business_transaction/fermat-cbp-plugin-business-transaction-customer-broker-bank-sale-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711231f1c2be0054fe045","_id":"5614643a36058c8c64ac33bc"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"customer broker crypto purchase","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"CBP/plugin/business_transaction/fermat-cbp-plugin-business-transaction-customer-broker-crypto-purchase-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711231f1c2be0054fe04e","_id":"5614643a36058c8c64ac33cd"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"customer broker cash purchase","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"CBP/plugin/business_transaction/fermat-cbp-plugin-business-transaction-customer-broker-cash-purchase-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711241f1c2be0054fe057","_id":"5614643a36058c8c64ac33de"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"customer broker bank purchase","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"CBP/plugin/business_transaction/fermat-cbp-plugin-business-transaction-customer-broker-bank-purchase-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711241f1c2be0054fe060","_id":"5614643b36058c8c64ac33ef"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"whosale crypto sale","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CBP/plugin/business_transaction/fermat-cbp-plugin-business-transaction-whosale-crypto-sale-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711241f1c2be0054fe067","_id":"5614643b36058c8c64ac3400"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"whosale fiat sale","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CBP/plugin/business_transaction/fermat-cbp-plugin-business-transaction-whosale-fiat-sale-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711241f1c2be0054fe06e","_id":"5614643b36058c8c64ac340d"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"crypto broker","type":"plugin","description":"","difficulty":2,"code_level":"development","repo_dir":"CBP/plugin/wallet/fermat-cbp-plugin-wallet-crypto-broker-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711241f1c2be0054fe078","_id":"5614643b36058c8c64ac341b"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2178","name":"crypto broker","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/plugin/identity/fermat-cbp-plugin-identity-crypto-broker-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711241f1c2be0054fe082","_id":"5614643c36058c8c64ac342d"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2178","name":"crypto customer","type":"plugin","description":"","difficulty":4,"code_level":"development","repo_dir":"CBP/plugin/identity/fermat-cbp-plugin-identity-crypto-customer-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711241f1c2be0054fe08b","_id":"5614643c36058c8c64ac343e"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2175","name":"fiat index","type":"plugin","description":"","difficulty":6,"code_level":"development","repo_dir":"CBP/plugin/world/fermat-cbp-plugin-world-fiat-index-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"yalayn","email":"y.alayn@gmail.com","name":"Yordin Alayn","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/4664287?v=3","url":"https://github.com/yalayn","bio":null,"upd_at":"56171a4d1f1c2be0054feb65","_id":"5614642e36058c8c64ac305b"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711251f1c2be0054fe095","_id":"5614643c36058c8c64ac3450"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217b","name":"crypto broker","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"CBP/plugin/actor_network_service/fermat-cbp-plugin-actor-network-service-crypto-broker-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711251f1c2be0054fe09f","_id":"5614643d36058c8c64ac3462"},{"_platfrm_id":"5614642f36058c8c64ac30e0","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217b","name":"crypto customer","type":"plugin","description":"","difficulty":8,"code_level":"development","repo_dir":"CBP/plugin/actor_network_service/fermat-cbp-plugin-actor-network-service-crypto-customer-bitdubai","found":true,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100},{"dev":{"usrnm":"jorgeejgonzalez","email":"jorgeejgonzalez@gmail.com","name":"Jorge Gonzalez","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/2023125?v=3","url":"https://github.com/jorgeejgonzalez","bio":null,"upd_at":"56171a4d1f1c2be0054feb5c","_id":"5614640736058c8c64ac24e5"},"role":"author","scope":"implementation","percnt":10}],"certs":[],"life_cycle":[],"upd_at":"561711251f1c2be0054fe0a8","_id":"5614643d36058c8c64ac3473"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"crypto wholesaler","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/android/reference_wallet/fermat-cdn-android-reference-wallet-crypto-wholesaler-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711251f1c2be0054fe0b2","_id":"5614643d36058c8c64ac3488"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"crypto distributor","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/android/reference_wallet/fermat-cdn-android-reference-wallet-crypto-distributor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711251f1c2be0054fe0b9","_id":"5614643e36058c8c64ac3495"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"top up point","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/android/reference_wallet/fermat-cdn-android-reference-wallet-top-up-point-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711251f1c2be0054fe0c0","_id":"5614643e36058c8c64ac34a2"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f836058c8c64ac213c","name":"cash out point","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/android/reference_wallet/fermat-cdn-android-reference-wallet-cash-out-point-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711251f1c2be0054fe0c7","_id":"5614643e36058c8c64ac34af"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"crypto wholesaler","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/android/sub_app/fermat-cdn-android-sub-app-crypto-wholesaler-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711251f1c2be0054fe0cf","_id":"5614643e36058c8c64ac34bd"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"crypto distributor","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/android/sub_app/fermat-cdn-android-sub-app-crypto-distributor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711261f1c2be0054fe0d6","_id":"5614643f36058c8c64ac34ca"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"top up point","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/android/sub_app/fermat-cdn-android-sub-app-top-up-point-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711261f1c2be0054fe0dd","_id":"5614643f36058c8c64ac34d7"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"cash out point","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/android/sub_app/fermat-cdn-android-sub-app-cash-out-point-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711261f1c2be0054fe0e4","_id":"5614643f36058c8c64ac34e4"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2148","name":"crypto wholesaler","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/wallet_module/fermat-cdn-plugin-wallet-module-crypto-wholesaler-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711261f1c2be0054fe0ec","_id":"5614643f36058c8c64ac34f2"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2148","name":"crypto distributor","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/wallet_module/fermat-cdn-plugin-wallet-module-crypto-distributor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711261f1c2be0054fe0f3","_id":"5614644036058c8c64ac34ff"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2148","name":"top up point","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/wallet_module/fermat-cdn-plugin-wallet-module-top-up-point-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711261f1c2be0054fe0fa","_id":"5614644036058c8c64ac350c"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2148","name":"cash out point","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/wallet_module/fermat-cdn-plugin-wallet-module-cash-out-point-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711261f1c2be0054fe101","_id":"5614644036058c8c64ac3519"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"crypto wholesaler","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/sub_app_module/fermat-cdn-plugin-sub-app-module-crypto-wholesaler-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711261f1c2be0054fe109","_id":"5614644136058c8c64ac3527"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"crypto distributor","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/sub_app_module/fermat-cdn-plugin-sub-app-module-crypto-distributor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711261f1c2be0054fe110","_id":"5614644136058c8c64ac3534"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"top up point","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/sub_app_module/fermat-cdn-plugin-sub-app-module-top-up-point-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711271f1c2be0054fe117","_id":"5614644136058c8c64ac3541"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"cash out point","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/sub_app_module/fermat-cdn-plugin-sub-app-module-cash-out-point-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711271f1c2be0054fe11e","_id":"5614644136058c8c64ac354e"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2154","name":"crypto wholesaler","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/actor/fermat-cdn-plugin-actor-crypto-wholesaler-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711271f1c2be0054fe126","_id":"5614644236058c8c64ac355c"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2154","name":"crypto distributor","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/actor/fermat-cdn-plugin-actor-crypto-distributor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711271f1c2be0054fe12d","_id":"5614644236058c8c64ac3569"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2154","name":"top up point","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/actor/fermat-cdn-plugin-actor-top-up-point-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711271f1c2be0054fe134","_id":"5614644236058c8c64ac3576"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2154","name":"cash out point","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/actor/fermat-cdn-plugin-actor-cash-out-point-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711271f1c2be0054fe13b","_id":"5614644236058c8c64ac3583"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"wholesaler broker crypto purchase","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-wholesaler-broker-crypto-purchase-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711271f1c2be0054fe143","_id":"5614644336058c8c64ac3591"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"wholesaler broker fiat purchase","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-wholesaler-broker-fiat-purchase-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711281f1c2be0054fe14a","_id":"5614644336058c8c64ac359e"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"wholesaler distributor crypto sale","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-wholesaler-distributor-crypto-sale-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711281f1c2be0054fe151","_id":"5614644336058c8c64ac35ab"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"wholesaler distributor fiat sale","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-wholesaler-distributor-fiat-sale-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711281f1c2be0054fe158","_id":"5614644336058c8c64ac35b8"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"distributor wholesaler crypto purchare","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-distributor-wholesaler-crypto-purchare-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711281f1c2be0054fe15f","_id":"5614644436058c8c64ac35c5"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"distributor wholesaler fiat purchase","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-distributor-wholesaler-fiat-purchase-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711281f1c2be0054fe166","_id":"5614644436058c8c64ac35d2"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"distributor distributor crypto sale","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-distributor-distributor-crypto-sale-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711281f1c2be0054fe16d","_id":"5614644436058c8c64ac35df"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"distributor distributor fiat sale","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-distributor-distributor-fiat-sale-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711281f1c2be0054fe174","_id":"5614644536058c8c64ac35ec"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"distributor distributor crypto purchase","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-distributor-distributor-crypto-purchase-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711291f1c2be0054fe17b","_id":"5614644536058c8c64ac35f9"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"distributor distributor fiat purchase","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-distributor-distributor-fiat-purchase-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711291f1c2be0054fe182","_id":"5614644536058c8c64ac3606"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"distributor top up point crypto sale","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-distributor-top-up-point-crypto-sale-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711291f1c2be0054fe189","_id":"5614644536058c8c64ac3613"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"distributor top up point fiat sale","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-distributor-top-up-point-fiat-sale-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711291f1c2be0054fe190","_id":"5614644636058c8c64ac3620"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"top up point distributor crypto purchase","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-top-up-point-distributor-crypto-purchase-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711291f1c2be0054fe197","_id":"5614644636058c8c64ac362d"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"top up point distributor fiat purchase","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-top-up-point-distributor-fiat-purchase-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711291f1c2be0054fe19e","_id":"5614644636058c8c64ac363a"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"top up point intra user crypto sale","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-top-up-point-intra-user-crypto-sale-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"561711291f1c2be0054fe1a5","_id":"5614644636058c8c64ac3647"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"cash out point intra user fiat sale","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-cash-out-point-intra-user-fiat-sale-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112a1f1c2be0054fe1ac","_id":"5614644736058c8c64ac3654"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"top up point cash out point crypto purchase","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-top-up-point-cash-out-point-crypto-purchase-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112a1f1c2be0054fe1b3","_id":"5614644736058c8c64ac3661"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"cash out point top up point crypto sell","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-cash-out-point-top-up-point-crypto-sell-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112a1f1c2be0054fe1ba","_id":"5614644736058c8c64ac366e"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"shop top up point crypto sale","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-shop-top-up-point-crypto-sale-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112a1f1c2be0054fe1c1","_id":"5614644736058c8c64ac367b"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac215d","name":"top up point shop crypto purchase","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/business_transaction/fermat-cdn-plugin-business-transaction-top-up-point-shop-crypto-purchase-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112a1f1c2be0054fe1c8","_id":"5614644836058c8c64ac3688"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac216c","name":"wholesaler broker","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/contract/fermat-cdn-plugin-contract-wholesaler-broker-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112a1f1c2be0054fe1d0","_id":"5614644836058c8c64ac3696"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac216c","name":"wholesaler distributor","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/contract/fermat-cdn-plugin-contract-wholesaler-distributor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112a1f1c2be0054fe1d7","_id":"5614644836058c8c64ac36a3"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac216c","name":"distributor distributor","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/contract/fermat-cdn-plugin-contract-distributor-distributor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112b1f1c2be0054fe1de","_id":"5614644936058c8c64ac36b0"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac216c","name":"distributor top up point","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/contract/fermat-cdn-plugin-contract-distributor-top-up-point-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112b1f1c2be0054fe1e5","_id":"5614644936058c8c64ac36bd"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac216c","name":"top up point cash out point","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/contract/fermat-cdn-plugin-contract-top-up-point-cash-out-point-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112b1f1c2be0054fe1ec","_id":"5614644936058c8c64ac36ca"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac216c","name":"top up point shop","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/contract/fermat-cdn-plugin-contract-top-up-point-shop-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112b1f1c2be0054fe1f3","_id":"5614644936058c8c64ac36d7"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"crypto wholesaler","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/wallet/fermat-cdn-plugin-wallet-crypto-wholesaler-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112b1f1c2be0054fe1fb","_id":"5614644a36058c8c64ac36e5"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"crypto distributor","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/wallet/fermat-cdn-plugin-wallet-crypto-distributor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112b1f1c2be0054fe202","_id":"5614644a36058c8c64ac36f2"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"crypto top up","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/wallet/fermat-cdn-plugin-wallet-crypto-top-up-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112b1f1c2be0054fe209","_id":"5614644a36058c8c64ac36ff"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"crypto cash out","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/wallet/fermat-cdn-plugin-wallet-crypto-cash-out-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112b1f1c2be0054fe210","_id":"5614644a36058c8c64ac370c"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2172","name":"crypto pos wallet","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/wallet/fermat-cdn-plugin-wallet-crypto-pos-wallet-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112c1f1c2be0054fe217","_id":"5614644b36058c8c64ac3719"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2178","name":"crypto wholesaler","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/identity/fermat-cdn-plugin-identity-crypto-wholesaler-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112c1f1c2be0054fe21f","_id":"5614644b36058c8c64ac3727"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2178","name":"crypto distributor","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/identity/fermat-cdn-plugin-identity-crypto-distributor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112c1f1c2be0054fe226","_id":"5614644b36058c8c64ac3734"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2178","name":"top up point","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/identity/fermat-cdn-plugin-identity-top-up-point-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112c1f1c2be0054fe22d","_id":"5614644b36058c8c64ac3741"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2178","name":"cash out point","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/identity/fermat-cdn-plugin-identity-cash-out-point-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112c1f1c2be0054fe234","_id":"5614644c36058c8c64ac374e"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217b","name":"crypto wholesaler","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/actor_network_service/fermat-cdn-plugin-actor-network-service-crypto-wholesaler-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112c1f1c2be0054fe23c","_id":"5614644c36058c8c64ac375c"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217b","name":"crypto distributor","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/actor_network_service/fermat-cdn-plugin-actor-network-service-crypto-distributor-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112d1f1c2be0054fe243","_id":"5614644c36058c8c64ac3769"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217b","name":"top up point","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/actor_network_service/fermat-cdn-plugin-actor-network-service-top-up-point-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112d1f1c2be0054fe24a","_id":"5614644d36058c8c64ac3776"},{"_platfrm_id":"5614643d36058c8c64ac3484","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217b","name":"cash out point","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"CDN/plugin/actor_network_service/fermat-cdn-plugin-actor-network-service-cash-out-point-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112d1f1c2be0054fe251","_id":"5614644d36058c8c64ac3783"},{"_platfrm_id":"5614644d36058c8c64ac3790","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac213f","name":"device private network","type":"android","description":"","difficulty":0,"code_level":"concept","repo_dir":"DPN/android/sub_app/fermat-dpn-android-sub-app-device-private-network-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112d1f1c2be0054fe25b","_id":"5614644d36058c8c64ac3794"},{"_platfrm_id":"5614644d36058c8c64ac3790","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac214b","name":"device private network","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"DPN/plugin/sub_app_module/fermat-dpn-plugin-sub-app-module-device-private-network-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112d1f1c2be0054fe263","_id":"5614644e36058c8c64ac37a2"},{"_platfrm_id":"5614644d36058c8c64ac3790","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac2157","name":"device private network","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"DPN/plugin/middleware/fermat-dpn-plugin-middleware-device-private-network-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112e1f1c2be0054fe26b","_id":"5614644e36058c8c64ac37b0"},{"_platfrm_id":"5614644d36058c8c64ac3790","_suprlay_id":null,"_layer_id":"561463f936058c8c64ac217e","name":"device private network","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"DPN/plugin/network_service/fermat-dpn-plugin-network-service-device-private-network-bitdubai","found":false,"devs":[{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"architecture","percnt":100},{"dev":{"usrnm":"luis-fernando-molina","email":null,"name":"Luis Fernando Molina","bday":null,"location":null,"avatar_url":"https://avatars.githubusercontent.com/u/9479367?v=3","url":"https://github.com/Luis-Fernando-Molina","bio":null,"upd_at":"56147cf0c9e113c46518db1f","_id":"561463f536058c8c64ac206a"},"role":"author","scope":"design","percnt":100}],"certs":[],"life_cycle":[],"upd_at":"5617112e1f1c2be0054fe273","_id":"5614644e36058c8c64ac37be"},{"_platfrm_id":null,"_suprlay_id":"5614644e36058c8c64ac37cb","_layer_id":"5614644e36058c8c64ac37ce","name":"cloud client","type":"plugin","description":"","difficulty":10,"code_level":"production","repo_dir":"P2P/plugin/communication/fermat-p2p-plugin-communication-cloud-client-bitdubai","found":true,"devs":[],"certs":[],"life_cycle":[],"upd_at":"561468ac36058c8c64ac3c62","_id":"5614644e36058c8c64ac37d1"},{"_platfrm_id":null,"_suprlay_id":"5614644e36058c8c64ac37cb","_layer_id":"5614644e36058c8c64ac37ce","name":"cloud server","type":"plugin","description":"","difficulty":10,"code_level":"production","repo_dir":"P2P/plugin/communication/fermat-p2p-plugin-communication-cloud-server-bitdubai","found":true,"devs":[],"certs":[],"life_cycle":[],"upd_at":"561468ac36058c8c64ac3c64","_id":"5614644f36058c8c64ac37e4"},{"_platfrm_id":null,"_suprlay_id":"5614644e36058c8c64ac37cb","_layer_id":"5614644e36058c8c64ac37ce","name":"p2p","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"P2P/plugin/communication/fermat-p2p-plugin-communication-p2p-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614644f36058c8c64ac37f6","_id":"5614644f36058c8c64ac37f7"},{"_platfrm_id":null,"_suprlay_id":"5614644e36058c8c64ac37cb","_layer_id":"5614644e36058c8c64ac37ce","name":"geo fenced p2p","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"P2P/plugin/communication/fermat-p2p-plugin-communication-geo-fenced-p2p-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614645036058c8c64ac3801","_id":"5614645036058c8c64ac3802"},{"_platfrm_id":null,"_suprlay_id":"5614644e36058c8c64ac37cb","_layer_id":"5614644e36058c8c64ac37ce","name":"wifi","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"P2P/plugin/communication/fermat-p2p-plugin-communication-wifi-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614645036058c8c64ac380c","_id":"5614645036058c8c64ac380d"},{"_platfrm_id":null,"_suprlay_id":"5614644e36058c8c64ac37cb","_layer_id":"5614644e36058c8c64ac37ce","name":"bluetooth","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"P2P/plugin/communication/fermat-p2p-plugin-communication-bluetooth-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614645036058c8c64ac3817","_id":"5614645036058c8c64ac3818"},{"_platfrm_id":null,"_suprlay_id":"5614644e36058c8c64ac37cb","_layer_id":"5614644e36058c8c64ac37ce","name":"nfc","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"P2P/plugin/communication/fermat-p2p-plugin-communication-nfc-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614645036058c8c64ac3822","_id":"5614645036058c8c64ac3823"},{"_platfrm_id":null,"_suprlay_id":"5614644e36058c8c64ac37cb","_layer_id":"5614644e36058c8c64ac37ce","name":"mesh","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"P2P/plugin/communication/fermat-p2p-plugin-communication-mesh-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614645036058c8c64ac382d","_id":"5614645036058c8c64ac382e"},{"_platfrm_id":null,"_suprlay_id":"5614645136058c8c64ac3839","_layer_id":"5614645136058c8c64ac383c","name":"incomming crypto","type":"plugin","description":"","difficulty":10,"code_level":"production","repo_dir":"BCH/plugin/crypto_router/fermat-bch-plugin-crypto-router-incomming-crypto-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614645136058c8c64ac383e","_id":"5614645136058c8c64ac383f"},{"_platfrm_id":null,"_suprlay_id":"5614645136058c8c64ac3839","_layer_id":"5614645136058c8c64ac383c","name":"outgoing crypto","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"BCH/plugin/crypto_router/fermat-bch-plugin-crypto-router-outgoing-crypto-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614645136058c8c64ac3851","_id":"5614645136058c8c64ac3852"},{"_platfrm_id":null,"_suprlay_id":"5614645136058c8c64ac3839","_layer_id":"5614645136058c8c64ac385d","name":"crypto address book","type":"plugin","description":"","difficulty":5,"code_level":"production","repo_dir":"BCH/plugin/crypto_module/fermat-bch-plugin-crypto-module-crypto-address-book-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614645136058c8c64ac385f","_id":"5614645136058c8c64ac3860"},{"_platfrm_id":null,"_suprlay_id":"5614645136058c8c64ac3839","_layer_id":"5614645236058c8c64ac3873","name":"bitcoin currency","type":"plugin","description":"","difficulty":10,"code_level":"development","repo_dir":"BCH/plugin/crypto_vault/fermat-bch-plugin-crypto-vault-bitcoin-currency-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614645236058c8c64ac3875","_id":"5614645236058c8c64ac3876"},{"_platfrm_id":null,"_suprlay_id":"5614645136058c8c64ac3839","_layer_id":"5614645236058c8c64ac3873","name":"assets over bitcoin","type":"plugin","description":"","difficulty":10,"code_level":"development","repo_dir":"BCH/plugin/crypto_vault/fermat-bch-plugin-crypto-vault-assets-over-bitcoin-bitdubai","found":true,"devs":[],"certs":[],"life_cycle":[],"upd_at":"561468ac36058c8c64ac3c68","_id":"5614645236058c8c64ac3889"},{"_platfrm_id":null,"_suprlay_id":"5614645136058c8c64ac3839","_layer_id":"5614645236058c8c64ac3873","name":"bitcoin watch only","type":"plugin","description":"","difficulty":10,"code_level":"development","repo_dir":"BCH/plugin/crypto_vault/fermat-bch-plugin-crypto-vault-bitcoin-watch-only-bitdubai","found":true,"devs":[],"certs":[],"life_cycle":[],"upd_at":"561468ac36058c8c64ac3c66","_id":"5614645236058c8c64ac389c"},{"_platfrm_id":null,"_suprlay_id":"5614645136058c8c64ac3839","_layer_id":"5614645236058c8c64ac3873","name":"litecoin","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"BCH/plugin/crypto_vault/fermat-bch-plugin-crypto-vault-litecoin-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614645236058c8c64ac38ae","_id":"5614645236058c8c64ac38af"},{"_platfrm_id":null,"_suprlay_id":"5614645136058c8c64ac3839","_layer_id":"5614645236058c8c64ac3873","name":"ripple","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"BCH/plugin/crypto_vault/fermat-bch-plugin-crypto-vault-ripple-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614645336058c8c64ac38b9","_id":"5614645336058c8c64ac38ba"},{"_platfrm_id":null,"_suprlay_id":"5614645136058c8c64ac3839","_layer_id":"5614645236058c8c64ac3873","name":"ethereum","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"BCH/plugin/crypto_vault/fermat-bch-plugin-crypto-vault-ethereum-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614645336058c8c64ac38c4","_id":"5614645336058c8c64ac38c5"},{"_platfrm_id":null,"_suprlay_id":"5614645136058c8c64ac3839","_layer_id":"5614645336058c8c64ac38d0","name":"bitcoin","type":"plugin","description":"","difficulty":10,"code_level":"development","repo_dir":"BCH/plugin/crypto_network/fermat-bch-plugin-crypto-network-bitcoin-bitdubai","found":true,"devs":[],"certs":[],"life_cycle":[],"upd_at":"561468ac36058c8c64ac3c6a","_id":"5614645336058c8c64ac38d3"},{"_platfrm_id":null,"_suprlay_id":"5614645136058c8c64ac3839","_layer_id":"5614645336058c8c64ac38d0","name":"litecoin","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"BCH/plugin/crypto_network/fermat-bch-plugin-crypto-network-litecoin-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614645436058c8c64ac3909","_id":"5614645436058c8c64ac390a"},{"_platfrm_id":null,"_suprlay_id":"5614645136058c8c64ac3839","_layer_id":"5614645336058c8c64ac38d0","name":"ripple","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"BCH/plugin/crypto_network/fermat-bch-plugin-crypto-network-ripple-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614645536058c8c64ac3914","_id":"5614645536058c8c64ac3915"},{"_platfrm_id":null,"_suprlay_id":"5614645136058c8c64ac3839","_layer_id":"5614645336058c8c64ac38d0","name":"ethereum","type":"plugin","description":"","difficulty":0,"code_level":"concept","repo_dir":"BCH/plugin/crypto_network/fermat-bch-plugin-crypto-network-ethereum-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614645536058c8c64ac391f","_id":"5614645536058c8c64ac3920"},{"_platfrm_id":null,"_suprlay_id":"5614645536058c8c64ac392b","_layer_id":"5614645536058c8c64ac392e","name":"file system","type":"addon","description":"is the interface between the os specific file system and the platform components that need to consume file system services","difficulty":3,"code_level":"production","repo_dir":"OSA/addon/multi_os/fermat-osa-addon-multi-os-file-system-bitdubai","found":true,"devs":[],"certs":[],"life_cycle":[],"upd_at":"561468ac36058c8c64ac3c6c","_id":"5614645536058c8c64ac3931"},{"_platfrm_id":null,"_suprlay_id":"5614645536058c8c64ac392b","_layer_id":"5614645536058c8c64ac392e","name":"database system","type":"addon","description":"is a wrapper designed to isolate the rest of the components from the os dependent database system","difficulty":5,"code_level":"production","repo_dir":"OSA/addon/multi_os/fermat-osa-addon-multi-os-database-system-bitdubai","found":true,"devs":[],"certs":[],"life_cycle":[],"upd_at":"561468ac36058c8c64ac3c6e","_id":"5614645536058c8c64ac3944"},{"_platfrm_id":null,"_suprlay_id":"5614645536058c8c64ac392b","_layer_id":"5614645636058c8c64ac3957","name":"file system","type":"addon","description":"is the interface between the os specific file system and the platform components that need to consume file system services","difficulty":3,"code_level":"production","repo_dir":"OSA/addon/android/fermat-osa-addon-android-file-system-bitdubai","found":true,"devs":[],"certs":[],"life_cycle":[],"upd_at":"561468ac36058c8c64ac3c72","_id":"5614645636058c8c64ac395a"},{"_platfrm_id":null,"_suprlay_id":"5614645536058c8c64ac392b","_layer_id":"5614645636058c8c64ac3957","name":"database system","type":"addon","description":"is a wrapper designed to isolate the rest of the components from the os dependent database system","difficulty":5,"code_level":"production","repo_dir":"OSA/addon/android/fermat-osa-addon-android-database-system-bitdubai","found":true,"devs":[],"certs":[],"life_cycle":[],"upd_at":"561468ac36058c8c64ac3c74","_id":"5614645636058c8c64ac3975"},{"_platfrm_id":null,"_suprlay_id":"5614645536058c8c64ac392b","_layer_id":"5614645636058c8c64ac3957","name":"logger","type":"addon","description":"","difficulty":4,"code_level":"production","repo_dir":"OSA/addon/android/fermat-osa-addon-android-logger-bitdubai","found":true,"devs":[],"certs":[],"life_cycle":[],"upd_at":"561468ac36058c8c64ac3c70","_id":"5614645736058c8c64ac3990"},{"_platfrm_id":null,"_suprlay_id":"5614645536058c8c64ac392b","_layer_id":"5614645636058c8c64ac3957","name":"device location","type":"addon","description":"","difficulty":4,"code_level":"development","repo_dir":"OSA/addon/android/fermat-osa-addon-android-device-location-bitdubai","found":true,"devs":[],"certs":[],"life_cycle":[],"upd_at":"561468ac36058c8c64ac3c76","_id":"5614645736058c8c64ac39a3"},{"_platfrm_id":null,"_suprlay_id":"5614645536058c8c64ac392b","_layer_id":"5614645636058c8c64ac3957","name":"device connectivity","type":"addon","description":"","difficulty":0,"code_level":"concept","repo_dir":"OSA/addon/android/fermat-osa-addon-android-device-connectivity-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614645736058c8c64ac39b5","_id":"5614645736058c8c64ac39b6"},{"_platfrm_id":null,"_suprlay_id":"5614645536058c8c64ac392b","_layer_id":"5614645636058c8c64ac3957","name":"device power","type":"addon","description":"","difficulty":0,"code_level":"concept","repo_dir":"OSA/addon/android/fermat-osa-addon-android-device-power-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614645736058c8c64ac39c0","_id":"5614645736058c8c64ac39c1"},{"_platfrm_id":null,"_suprlay_id":"5614645536058c8c64ac392b","_layer_id":"5614645636058c8c64ac3957","name":"device contacts","type":"addon","description":"","difficulty":0,"code_level":"concept","repo_dir":"OSA/addon/android/fermat-osa-addon-android-device-contacts-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614645836058c8c64ac39cb","_id":"5614645836058c8c64ac39cc"},{"_platfrm_id":null,"_suprlay_id":"5614645536058c8c64ac392b","_layer_id":"5614645636058c8c64ac3957","name":"device hardware","type":"addon","description":"","difficulty":0,"code_level":"concept","repo_dir":"OSA/addon/android/fermat-osa-addon-android-device-hardware-bitdubai","found":false,"devs":[],"certs":[],"life_cycle":[],"upd_at":"5614645836058c8c64ac39d6","_id":"5614645836058c8c64ac39d7"}]}';
//33 layers
var layers = {
    
    size : function(){
        var size = 0;
        
        for(var key in this){
            //if(this.hasOwnProperty(key))
                size++;
        }
        
        return size - 1;
    }
};

var groups = {
    
    size : function(){
        var size = 0;
        
        for(var key in this){
            //if(this.hasOwnProperty(key))
                size++;
        }
        
        return size - 1;
    }
};

var superLayers = {
    
    size : function(){
        var size = 0;
        
        for(var key in this){
            //if(this.hasOwnProperty(key))
                size++;
        }
        
        return size - 1;
    }
};
var viewManager = new ViewManager();
//var URL = "get_plugins.php";
var URL = "http://52.11.156.16:3000/repo/comps";

/*function getData() {
    $.ajax({
        url: URL,
        method: "GET"
    }).success(
        function(lists) {
            var l = JSON.parse(lists);
            viewManager.fillTable(l);
            $('#splash').fadeTo(2000, 0, function() {
                $('#splash').remove();
                init();
                //setTimeout(animate, 500);
                animate();
            });
        }
    );
}*/
/*
function getData() {
    $.ajax({
        url: URL,
        method: "GET"
    }).success(
        function(lists) {
            viewManager.fillTable(lists);
            $('#splash').fadeTo(2000, 0, function() {
                $('#splash').remove();
                init();
                //setTimeout(animate, 500);
                animate();
            });
        }
    );
}

*/
function getData() {
    var l = JSON.parse(testData);

    viewManager.fillTable(l);

    $('#splash').fadeTo(2000, 0, function() {
        $('#splash').remove();
        init();
        //setTimeout( animate, 500);
        animate();
    });
}

/**
 * @class Represents the group of all header icons
 * @param {Number} columnWidth         The number of elements that contains a column
 * @param {Number} superLayerMaxHeight Max rows a superLayer can hold
 * @param {Number} groupsQtty          Number of groups (column headers)
 * @param {Number} layersQtty          Number of layers (rows)
 * @param {Array}  superLayerPosition  Array of the position of every superlayer
 */
function Headers(columnWidth, superLayerMaxHeight, groupsQtty, layersQtty, superLayerPosition) {
        
    // Private members
    var objects = [],
        dependencies = {
            root : []
        },
        positions = {
            table : [],
            stack : []
        },
        self = this,
        graph = {};
    
    this.dep = dependencies;
    
    // Public methods
    /**
     * Arranges the headers by dependency
     * @param {Number} [duration=2000] Duration in milliseconds for the animation
     */
    this.transformStack = function(duration) {
        var _duration = duration || 2000,
            i, l, container, network;
            

        container = document.createElement('div');
        container.id = 'stackContainer';
        container.style.position = 'absolute';
        container.style.opacity = 0;
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.zIndex = 5;
        document.getElementById('container').appendChild(container);
        
        
        network = new vis.Network(container, graph.data, graph.options);
        
        viewManager.letAlone();
        camera.resetPosition();
        
        setTimeout(function() {
            for(i = 0, l = objects.length; i < l; i++) {

                new TWEEN.Tween(objects[i].position)
                .to({
                    x : positions.stack[i].position.x,
                    y : positions.stack[i].position.y,
                    z : positions.stack[i].position.z
                }, _duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
            }

           new TWEEN.Tween(this)
                .to({}, _duration * 2)
                .onUpdate(render)
                .start();

            self.hide(_duration);
            $(container).fadeTo(_duration, 1);
            
        }, _duration);
    };
    
    /**
     * @author Miguel Celedon
     *             
     * Arranges the headers in the table
     * @param {Number} [duration=2000] Duration of the animation
     */
    this.transformTable = function(duration) {
        var _duration = duration || 4000,
            i, l;
        
        helper.hide('stackContainer', _duration / 2);
        helper.hide('headContainer', _duration / 2);
        //This should be moved to be called by viewer.js when we no longer use vis for this
        /*setTimeout(function() {    
            viewManager.transform(viewManager.targets.table); 
        }, _duration);*/
        
        for(i = 0, l = objects.length; i < l; i++) {
            
            new TWEEN.Tween(objects[i].position)
            .to({
                x : positions.table[i].position.x,
                y : positions.table[i].position.y,
                z : positions.table[i].position.z
            }, Math.random() * _duration + _duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
        
        new TWEEN.Tween(this)
            .to({}, duration * 2)
            .onUpdate(render)
            .start();
        
        self.show(_duration);
    };
    
    /**
     * @author Ricardo Delgado
     * @lastmodifiedBy Miguel Celedon
     *                     
     * Screen shows the head
     * @param {Number} duration Milliseconds of fading
     */
    this.transformHead = function( duration ) {
        var _duration = duration || 1000;
        var i, l;

        viewManager.letAlone();
        camera.resetPosition();
        setTimeout(function() {
            for(i = 0, l = objects.length; i < l; i++) {

                new TWEEN.Tween(objects[i].position)
                .to({
                    z : window.camera.getMaxDistance()
                }, Math.random() * _duration + _duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
            }

           new TWEEN.Tween(this)
                .to({}, _duration * 2)
                .onUpdate(render)
                .start();

            self.hide(_duration);
            
        }, _duration);
    };
    
    /**
     * Shows the headers as a fade
     * @param {Number} duration Milliseconds of fading
     */
    this.show = function (duration) {
        var i, j;
        
        for (i = 0; i < objects.length; i++ ) {
            for(j = 0; j < objects[i].levels.length; j++) {
                new TWEEN.Tween(objects[i].levels[j].object.material)
                .to({opacity : 1, needsUpdate : true}, duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
            }
        }
    };
    
    /**
     * Hides the headers (but donesn't delete them)
     * @param {Number} duration Milliseconds to fade
     */
    this.hide = function (duration) {
        var i, j;
        
        for (i = 0; i < objects.length; i++ ) {
            for(j = 0; j < objects[i].levels.length; j++) {
                new TWEEN.Tween(objects[i].levels[j].object.material)
                .to({opacity : 0, needsUpdate : true}, duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
            }
        }
    };
    
    // Initialization code
    //=========================================================
    
    /**
     * Creates the dependency graph used in vis.js
     * @returns {Object} Object containing the data and options used in vis.js
     */
    var buildGraph = function() {
        
        var i, l, data, edges = [], nodes = [], options,
            level = 0;
            
        var trace = function(root, parent, _level, _nodes, _edges) {
                
                var i, l, child,
                    lookup = function(x) { return x.id == child; };
                
                for(i = 0, l = root.length; i < l; i++) {
                    
                    child = root[i];
                    
                    if(_level !== 0) _edges.push({from : parent, to : child});
                    
                    if($.grep(_nodes, lookup).length === 0)
                    {
                        _nodes.push({
                            id : child,
                            shape : 'image',
                            image : 'images/headers/svg/' + child + '_logo.svg',
                            level : _level
                        });
                    }
                    
                    trace(dependencies[child], child, _level + 1, _nodes, _edges);
                }
            };
        
        trace(dependencies.root, null, level, nodes, edges);
        
        data = {
            edges : edges,
            nodes : nodes
        };
        options = {
            physics:{
                hierarchicalRepulsion: {
                  nodeDistance: 150
                }
              },
            edges:{
                color:{
                    color : '#F26662',
                    highlight : '#E05952',
                    hover: '#E05952'
                }
            },
            layout: {
                hierarchical:{
                    enabled : true,
                    direction: 'DU',
                    levelSeparation: 150,
                    sortMethod : 'directed'
                }
            }
        };
        
        graph = {
            data : data,
            options : options
        };
    };
    
    /**
     * Calculates the stack target position
     */
    var calculateStackPositions = function() {
        
        var i, obj;
        
        // Dummy, send all to center
        for(i = 0; i < objects.length; i++) {
            obj = new THREE.Object3D();
            obj.position.set(0, 0, 8000);
            positions.stack.push(obj);
        }
        
        
    };
    
    var initialize = function() {
        
        var headerData,
            group,
            column,
            image,
            object,
            slayer,
            row;
            
        function createChildren(child, parents) {
                
                var i, l, actual;
                
                if(parents != null && parents.length !== 0) {

                    for(i = 0, l = parents.length; i < l; i++) {

                        dependencies[parents[i]] = dependencies[parents[i]] || [];
                        
                        actual = dependencies[parents[i]];

                        actual.push(child);
                    }
                }
                else {
                    dependencies.root.push(child);
                }
                
                dependencies[child] = dependencies[child] || [];
            }
        
        function createHeader(group, width, height) {
            
            var source,
                levels = [
                    ['high', 0],
                    ['medium', 8000],
                    ['small', 16000]],
                i, l,
                header = new THREE.LOD();
            
            for(i = 0, l = levels.length; i < l; i++) {
            
                source = 'images/headers/' + levels[i][0] + '/' + group + '_logo.png';
                
                var object = new THREE.Mesh(
                    new THREE.PlaneGeometry(width, height),
                    new THREE.MeshBasicMaterial({transparent : true, opacity : 0})
                    );
                
                helper.applyTexture(source, object);
                
                header.addLevel(object, levels[i][1]);
            }
            
            return header;
        }
        
        var src, width, height;
            
        for (group in groups) {
            if (window.groups.hasOwnProperty(group) && group !== 'size') {

                headerData = window.groups[group];
                column = headerData.index;

                width = columnWidth * window.TILE_DIMENSION.width;
                height = width * 443 / 1379;

                object = createHeader(group, width, height);
                
                object.position.set(-160000,
                                    Math.random() * 320000 - 160000,
                                    0);

                scene.add(object);
                objects.push(object);

                object = new THREE.Object3D();
                
                object.position.x = (columnWidth * window.TILE_DIMENSION.width) * (column - (groupsQtty - 1) / 2) + ((column - 1) * window.TILE_DIMENSION.width);
                object.position.y = ((layersQtty + 10) * window.TILE_DIMENSION.height) / 2;
                
                positions.table.push(object);

                createChildren(group, headerData.dependsOn);
            }
        }

        for (slayer in superLayers) {
            if (window.superLayers.hasOwnProperty(slayer) && slayer !== 'size') {

                headerData = window.superLayers[slayer];
                row = superLayerPosition[headerData.index];

                width = columnWidth * window.TILE_DIMENSION.width;
                height = width * 443 / 1379;

                object = createHeader(slayer, width, height);
                
                object.position.set(160000,
                                    Math.random() * 320000 - 160000,
                                    0);

                scene.add(object);
                objects.push(object);
                
                object = new THREE.Object3D();

                object.position.x = -(((groupsQtty + 1) * columnWidth * window.TILE_DIMENSION.width / 2) + window.TILE_DIMENSION.width);
                object.position.y = -(row * window.TILE_DIMENSION.height) - (superLayerMaxHeight * window.TILE_DIMENSION.height / 2) + (layersQtty * window.TILE_DIMENSION.height / 2);
                
                positions.table.push(object);

                createChildren(slayer, headerData.dependsOn);
            }
        }
        
        calculateStackPositions();
        buildGraph();
    };
    
    initialize();
    //=========================================================
}

/**
 * Static object with help functions commonly used
 */
function Helper() {

    /**
     * Hides an element vanishing it and then eliminating it from the DOM
     * @param {DOMElement} element         The element to eliminate
     * @param {Number}     [duration=1000] Duration of the fade animation
     * @param {Boolean}    [keep=false]     If set true, don't remove the element, just dissapear
     */
    this.hide = function(element, duration, keep) {

        var dur = duration || 1000,
            el = element;

        if (typeof(el) === "string") {
            el = document.getElementById(element);
        }

        $(el).fadeTo(duration, 0, function() {
            if(keep)
                el.style.display = 'none';
            else
                $(el).remove();
        });
    };
    
    /**
     * @author Miguel Celedon
     *
     * Shows an HTML element as a fade in
     * @param {Object} element         DOMElement to show
     * @param {Number} [duration=1000] Duration of animation
     */
    this.show = function(element, duration) {
        
        duration = duration || 1000;

        if (typeof(element) === "string") {
            element = document.getElementById(element);
        }

        $(element).fadeTo(duration, 1, function() {
                $(element).show();
            });
    };
    
    /**
     * Shows a material with transparency on
     * @param {Object} material                                Material to change its opacity
     * @param {Number} [duration=2000]                         Duration of animation
     * @param {Object} [easing=TWEEN.Easing.Exponential.InOut] Easing of the animation
     */
    this.showMaterial = function(material, duration, easing) {
        
        if(material && typeof material.opacity !== 'undefined') {
            
            duration = duration || 2000;
            easing = (typeof easing !== 'undefined') ? easing : TWEEN.Easing.Exponential.InOut;

            new TWEEN.Tween(material)
                .to({opacity : 1}, duration)
                .easing(easing)
                .onUpdate(function() { this.needsUpdate = true; })
                .start();
        }
    };
    
    /**
     * Deletes or hides the object
     * @param {Object}  object          The mesh to hide
     * @param {Boolean} [keep=true]     If false, delete the object from scene
     * @param {Number}  [duration=2000] Duration of animation
     */
    this.hideObject = function(object, keep, duration) {
        
        duration = duration || 2000;
        keep = (typeof keep === 'boolean') ? keep : true;
        
        new TWEEN.Tween(object.material)
            .to({opacity : 0}, duration)
            .onUpdate(function() { this.needsUpdate = true; })
            .onComplete(function() { if(!keep) window.scene.remove(object); })
            .start();
    };

    /**
     * Clones a tile and *without* it's developer picture
     * @param   {String} id    The id of the source
     * @param   {String} newID The id of the created clone
     * @returns {DOMElement} The cloned tile without it's picture
     */
    this.cloneTile = function(id, newID) {

        var clone = document.getElementById(id).cloneNode(true);

        clone.id = newID;
        clone.style.transform = '';
        $(clone).find('.picture').remove();

        return clone;
    };

    /**
     * Parses ISODate to a javascript Date
     * @param   {String} date Input
     * @returns {Date}   js Date object (yyyy-mm-dd)
     */
    this.parseDate = function(date) {

        if (date == null) return null;

        var parts = date.split('-');

        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    };

    /**
     * Capitalizes the first letter of a word
     * @param   {String} string Input
     * @returns {String} input capitalized
     */
    this.capFirstLetter = function(string) {

        var words = string.split(" ");
        var result = "";

        for (var i = 0; i < words.length; i++)
            result += words[i].charAt(0).toUpperCase() + words[i].slice(1) + " ";

        return result.trim();
    };

    /**
     * Extract the code of a plugin
     * @param   {String} pluginName The name of the plugin
     * @returns {String} Code of the plugin
     */
    this.getCode = function(pluginName) {

        var words = pluginName.split(" ");
        var code = "";

        if (words.length == 1) { //if N = 1, use whole word or 3 first letters

            if (words[0].length <= 4)
                code = this.capFirstLetter(words[0]);
            else
                code = this.capFirstLetter(words[0].slice(0, 3));
        } else if (words.length == 2) { //if N = 2 use first cap letter, and second letter

            code += words[0].charAt(0).toUpperCase() + words[0].charAt(1);
            code += words[1].charAt(0).toUpperCase() + words[1].charAt(1);
        } else { //if N => 3 use the N (up to 4) letters caps

            var max = (words.length < 4) ? words.length : 4;

            for (var i = 0; i < max; i++)
                code += words[i].charAt(0);
        }

        return code;
    };

    /**
     * parse dir route from an element data
     * @method getRepoDir
     * @param  {Element}   item table element
     * @return {String}   directory route
     */
    this.getRepoDir = function(item) {
        //console.dir(item);
        var _root = "fermat",
            _group = item.group ? item.group.toUpperCase().split(' ').join('_') : null,
            _type = item.type ? item.type.toLowerCase().split(' ').join('_') : null,
            _layer = item.layer ? item.layer.toLowerCase().split(' ').join('_') : null,
            _name = item.name ? item.name.toLowerCase().split(' ').join('-') : null;

        if (_group && _type && _layer && _name) {
            return _group + "/" + _type + "/" + _layer + "/" +
                _root + "-" + _group.split('_').join('-').toLowerCase() + "-" + _type.split('_').join('-') + "-" + _layer.split('_').join('-') + "-" + _name + "-bitdubai";
        } else {
            return null;
        }
    };
    
    /**
     * Prints difficulty as stars
     * @param   {Number} value Difficulty to represent (max 5)
     * @returns {String} A maximun of 5 stars
     */
    this.printDifficulty = function(value) {
        var max = 5;
        var result = "";

        while (value > 0) {
            result += '★';
            max--;
            value--;
        }

        while (max > 0) {
            result += '☆';
            max--;
        }

        return result;
    };
    
    /**
     * Loads a texture and applies it to the given mesh
     * @param {String}   source     Address of the image to load
     * @param {Mesh}     object     Mesh to apply the texture
     * @param {Function} [callback] Function to call when texture gets loaded, with mesh as parameter
     */
    this.applyTexture = function(source, object, callback) {
        
        var loader = new THREE.TextureLoader();
        
        loader.load(
            source,
            function(tex) {
                tex.minFilter = THREE.NearestFilter;
                tex.needsUpdate = true;
                object.material.map = tex;
                object.needsUpdate = true;
                
                //console.log(tex.image.currentSrc);
                
                if(callback != null && typeof(callback) === 'function')
                    callback(object);
            });
    };
    
    /**
     * Draws a text supporting word wrap
     * @param   {String} text       Text to draw
     * @param   {Number} x          X position
     * @param   {Number} y          Y position
     * @param   {Object} context    Canvas context
     * @param   {Number} maxWidth   Max width of text
     * @param   {Number} lineHeight Actual line height
     * @returns {Number} The Y coordinate of the next line
     */
    this.drawText = function(text, x, y, context, maxWidth, lineHeight) {
    
        var words = text.split(' ');
        var line = '';

        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
          }
          else {
            line = testLine;
          }
        }
        context.fillText(line, x, y);

        return y + lineHeight;
    };
    
    /**
     * Searchs an element given its full name
     * @param   {String} elementFullName Name of element in format [group]/[layer]/[name]
     * @returns {Number} The ID of the element in the table
     */
    this.searchElement = function(elementFullName) {
        
        if(typeof elementFullName !== 'string') return -1;
        
        var group,
            components = elementFullName.split('/');
        
        if(components.length === 3) {
        
            for(var i = 0, l = table.length; i < l; i++) {

                group = table[i].group || window.layers[table[i].layer].super_layer;

                if(group.toLowerCase() === components[0].toLowerCase() &&
                   table[i].layer.toLowerCase() === components[1].toLowerCase() &&
                   table[i].name.toLowerCase() === components[2].toLowerCase())
                    return i;
            }
        }
        
        return -1;
    };
}

function Loader() {

    /**
     * [getStamp description]
     * @method getStamp
     * @return {[type]} [description]
     */
    function getStamp() {
        var img = document.createElement("img");
        img.className = 'stamp';
        img.src = 'images/alt_not_found.png';
        img.alt = 'Not Found';
        img.style.width = '90%';
        //img.style.margin = '35% 0 0 0';
        //img.style["margin-right"] = '80%';
        img.style.left = '5%';
        img.style.top = '40%';
        img.style.position = 'absolute';
        return img;
    }

    /**
     * check all elements in table
     * @method findThemAll
     */
    this.findThemAll = function() {
        for (var i = 0, l = table.length; i < l; i++) {
            if (!table[i].found && table[i].code_level == "concept") {
                var strIndex = "#" + i;
                $(strIndex).append(getStamp());
            }
        }
    };
}

/**
 * @class Timeline
 *
 * @param {Array}  tasks     An array of numbers containing all task ids
 * @param {Object} [container] Container of the created timeline
 */
function Timeline ( tasks, container ) {
    
    // Constants
    var CONCEPT_COLOR = 'rgba(170,170,170,1)',
        DEVEL_COLOR = 'rgba(234,123,97,1)',
        QA_COLOR = 'rgba(194,194,57,1)';
    
    // Public properties
    this.groups = [];
    this.items = [];
    this.container = container;
    
    var id = 0;
    
    for( var i = 0, tl = tasks.length; i < tl; i++ ) {
        
        var task = table[ tasks[i] ];
        
        if ( task != null && task.life_cycle != null ) {
            
            var schedule = task.life_cycle,
                tile, wrap,
                lastTarget = helper.parseDate( schedule[0].reached ),
                lastReached = lastTarget;
            
            var canvas = document.createElement('canvas');
            var oldCanvas = objects[tasks[i]].children[0].material.map.image;
            canvas.width = oldCanvas.width;
            canvas.height = oldCanvas.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(oldCanvas, 0, 0);
            
            tile = canvas;
            tile.style.position = 'relative';
            tile.style.display = 'inline-block';
            
            this.groups.push ( {
                id : i,
                content : tile
            });
            
            // First status marks the start point, not needed here
            for( var j = 1, sl = schedule.length; j < sl; j++ ) {
                
                var itemColor,
                    end,
                    item;
                    
                switch(schedule[j-1].name) {
                    case "Concept":
                        itemColor = CONCEPT_COLOR; break;
                    case "Development":
                        itemColor = DEVEL_COLOR; break;
                    case "QA":
                        itemColor = QA_COLOR; break;
                }
                
                
                // Planned
                if(schedule[j].target !== '') {
                    
                    end = helper.parseDate( schedule[j].target );
                    
                    item = {
                        id : id++,
                        content : schedule[j-1].name + ' (plan)',
                        start : lastTarget,
                        end : end,
                        group: i,
                        subgroup: 'plan',
                        style: 'background-color:' + itemColor
                    };
                    
                    this.items.push( item );
                    
                    lastTarget = end;
                }
                
                // Real
                if(schedule[j].reached !== '') {
                    
                    end = helper.parseDate( schedule[j].reached );
                    
                    item = {
                        id : id++,
                        content : schedule[j-1].name + ' (real)',
                        start : lastReached,
                        end : end,
                        group: i,
                        subgroup: 'real',
                        style: 'background-color:' + itemColor
                    };
                    
                    this.items.push( item );
                    
                    lastReached = end;
                }
            }
        }
    }
}


/**
 * Hides and destroys the timeline
 * @param {Number} [duration=1000] Duration of fading in milliseconds
 */
Timeline.prototype.hide = function ( duration ) {
    
    var _duration = duration || 1000;
    
    $('#timelineContainer').fadeTo(_duration, 0, function() { $('#timelineContainer').remove(); });
};


/**
 * Shows the timeline in it's given container, if it was null, creates one at the bottom
 * @param {Number} [duration=2000] Duration of fading in milliseconds
 */
Timeline.prototype.show = function ( duration ) {
    
    var _duration = duration || 2000;
    
    if ( this.groups.length !== 0 ) {
        
        if ( this.container == null ) {
            this.container = document.createElement( 'div' );
            this.container.id = 'timelineContainer';
            this.container.style.position = 'absolute';
            this.container.style.left = '0px';
            this.container.style.right = '0px';
            this.container.style.bottom = '0px';
            this.container.style.height = '25%';
            this.container.style.overflowY = 'auto';
            this.container.style.borderStyle = 'ridge';
            this.container.style.opacity = 0;
            $('#container').append(this.container);
        }
        
        var timeline = new vis.Timeline( this.container );
        timeline.setOptions( { 
            editable : false,
            minHeight : '100%',
            stack : false,
            align : 'center'
        } );
        timeline.setGroups( this.groups );
        timeline.setItems( this.items );
        
        $(this.container).fadeTo( _duration, 1 );
    }
};
var table = [],
    helper = new Helper(),
    camera,
    scene = new THREE.Scene(),
    renderer,
    browserManager = new BrowserManager(),
    objects = [],
    browser = [],
    headers = null,
    actualView = 'home',
    stats = null,
    actualFlow = null;

//Global constants
var TILE_DIMENSION = {
    width : 231,
    height : 140
},
    TILE_SPACING = 20;

getData();

function init() {

    // table
    viewManager.drawTable();
    
    var dimensions = viewManager.dimensions;

    // groups icons
    headers = new Headers(dimensions.columnWidth, dimensions.superLayerMaxHeight, dimensions.groupsQtty,
                          dimensions.layersQtty, dimensions.superLayerPosition);
    
    var light = new THREE.AmbientLight(0xFFFFFF);
    scene.add( light );
    renderer = new THREE.WebGLRenderer({antialias : true, logarithmicDepthBuffer : true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.setClearColor(0xffffff);
    document.getElementById('container').appendChild(renderer.domElement);

    camera = new Camera(new THREE.Vector3(0, 0, dimensions.columnWidth * dimensions.groupsQtty * TILE_DIMENSION.width),
        renderer,
        render);

    browserManager.createButton();
    // uncomment for testing
    //create_stats();

    $('#backButton').click(function() {
        changeView(viewManager.targets.table);
    });

    $('#legendButton').click(function() {

        var legend = document.getElementById('legend');

        if (legend.style.opacity == 1) $('#legend').fadeTo(1000, 0, function() {
            legend.style.display = 'none';
        });
        else {
            legend.style.display = 'block';
            $(legend).fadeTo(1000, 1);
        }
    });


    $('#container').click(onClick);

    //Disabled Menu
    //initMenu();

    setTimeout(function() {goToView('home'); }, 500);
    
    /*setTimeout(function() {
        var loader = new Loader();
        loader.findThemAll();
    }, 2000);*/
}

/**
 * @author Miguel Celedon
 * @lastmodifiedBy Ricardo Delgado
 * Changes the actual state of the viewer
 * @param {String} name The name of the target state
 */
function goToView ( current ) {
    
    actualView = current;

    switch(current) {
        case 'table':

            browserManager.modifyButtonLegend(1);

            headers.transformTable();
            setTimeout(function() {
                viewManager.transform(viewManager.targets.table, 4000);
            }, 4000);
            
            browserManager.hide_Button();

            
            break;
        case 'home':

           headers.transformHead();  

           browserManager.hide_Button();

           browserManager.modifyButtonBack(0);
            
           browserManager.modifyButtonLegend(0);

            break;
        case 'stack':
            
            headers.transformStack();

            browserManager.hide_Button();

            browserManager.modifyButtonBack(0);
            
            browserManager.modifyButtonLegend(0);
            
            break;

        default:
            actualView = 'home';
            break;
    }
}

function initMenu() {

    var button = document.getElementById('table');
    button.addEventListener('click', function(event) {

        changeView(viewManager.targets.table);

    }, false);

    button = document.getElementById('sphere');
    button.addEventListener('click', function(event) {

        changeView(viewManager.targets.sphere);

    }, false);

    button = document.getElementById('helix');
    button.addEventListener('click', function(event) {

        changeView(viewManager.targets.helix);

    }, false);

    button = document.getElementById('grid');
    button.addEventListener('click', function(event) {

        changeView(viewManager.targets.grid);

    }, false);

}
 
function changeView(targets) {

    camera.enable();
    camera.loseFocus();
    
    helper.show('container', 2000);
    
    if(actualFlow) {
        actualFlow.delete();
        actualFlow = null;
    }

    if (targets != null)
        viewManager.transform(targets, 2000);
}

function onElementClick(id) {
    
    if (camera.getFocus() == null) {

        camera.setFocus(id, 2000);
        
        setTimeout(function() {
            
            camera.setFocus(id, 1000);
            browserManager.modifyButtonBack(1);
            
            if(table[id].author) {
                var button = document.createElement('button');
                button.id = 'developerButton';
                button.className = 'actionButton';
                button.style.position = 'absolute';
                button.innerHTML = 'View developer';
                button.style.top = '10px';
                button.style.left = (10 + document.getElementById('backButton').clientWidth + 5) + 'px';
                button.style.zIndex = 10;
                button.style.opacity = 0;

                button.addEventListener('click', function() { showDeveloper(id); helper.hide(button, 1000, false); });

                document.body.appendChild(button);

                helper.show(button, 1000);
            }
            
        }, 3000);
        camera.disable();
        
    }

    function showDeveloper(id) {

        var relatedTasks = [];
        
        var image = table[id].picture;

        var section = 0;
        var center = objects[id].position;
        
        for (var i = 0; i < table.length; i++) {
            
            if (table[i].author == table[id].author) {
                relatedTasks.push(i);
                
                new TWEEN.Tween(objects[i].position)
                .to({x : center.x + (section % 5) * window.TILE_DIMENSION.width, y : center.y - Math.floor(section / 5) * window.TILE_DIMENSION.height, z : 0}, 2000)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
                
                section += 1;
            }
        }
        
        createSidePanel(id, image, relatedTasks);
        camera.enable();
        camera.move(center.x, center.y, center.z + window.TILE_DIMENSION.width * 5);
    }

    function createSidePanel(id, image, relatedTasks) {

        var sidePanel = document.createElement('div');
        sidePanel.id = 'sidePanel';
        sidePanel.style.position = 'absolute';
        sidePanel.style.top = '0px';
        sidePanel.style.bottom = '25%';
        sidePanel.style.left = '0px';
        sidePanel.style.marginTop = '50px';
        sidePanel.style.width = '35%';
        sidePanel.style.textAlign = 'center';

        var panelImage = document.createElement('img');
        panelImage.id = 'focusImg';
        panelImage.src = image;
        panelImage.style.position = 'relative';
        panelImage.style.width = '50%';
        panelImage.style.opacity = 0;
        sidePanel.appendChild(panelImage);

        var userName = document.createElement('p');
        userName.style.opacity = 0;
        userName.style.position = 'relative';
        userName.style.fontWeight = 'bold';
        userName.textContent = table[id].author;
        sidePanel.appendChild(userName);

        var realName = document.createElement('p');
        realName.style.opacity = 0;
        realName.style.position = 'relative';
        realName.textContent = table[id].authorRealName;
        sidePanel.appendChild(realName);

        var email = document.createElement('p');
        email.style.opacity = 0;
        email.style.position = 'relative';
        email.textContent = table[id].authorEmail;
        sidePanel.appendChild(email);

        if (relatedTasks != null && relatedTasks.length > 0) {
            
            var anyTimeline = false;
            
            var i, l;
            
            for(i = 0, l = relatedTasks.length; i < l; i++) {
                if(table[relatedTasks[i]].life_cycle !== undefined) anyTimeline = true;
            }
            
            if(anyTimeline) {

                var tlButton = document.createElement('button');
                tlButton.className = 'actionButton';
                tlButton.id = 'timelineButton';
                tlButton.style.opacity = 0;
                tlButton.style.position = 'relative';
                tlButton.textContent = 'See Timeline';

                $(tlButton).click(function() {
                    showTimeline(relatedTasks);
                });

                sidePanel.appendChild(tlButton);
            }
        }

        $('#container').append(sidePanel);

        //$(renderer.domElement).fadeTo(1000, 0);

        $(panelImage).fadeTo(1000, 1, function() {
            $(userName).fadeTo(1000, 1, function() {
                $(realName).fadeTo(1000, 1, function() {
                    $(email).fadeTo(1000, 1, function() {

                        if (tlButton != null) $(tlButton).fadeTo(1000, 1);

                    });
                });
            });
        });
    }

    function showTimeline(tasks) {

        helper.hide('sidePanel');
        helper.hide('elementPanel');

        var tlContainer = document.createElement('div');
        tlContainer.id = 'tlContainer';
        tlContainer.style.position = 'absolute';
        tlContainer.style.top = '50px';
        tlContainer.style.bottom = '50px';
        tlContainer.style.left = '50px';
        tlContainer.style.right = '50px';
        tlContainer.style.overflowY = 'auto';
        tlContainer.style.opacity = 0;
        document.body.appendChild(tlContainer);
        
        helper.hide('container', 1000, true);

        $(tlContainer).fadeTo(1000, 1);

        new Timeline(tasks, tlContainer).show();
    }
}

function onClick(e) {
    
    var mouse = new THREE.Vector2(0, 0),
        clicked = [];
    
    if ( !camera.moving ) {
    
        //Obtain normalized click location (-1...1)
        mouse.x = ((e.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width) * 2 - 1;
        mouse.y = - ((e.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1;

    if ( actualView === 'table' ) {

        clicked = camera.rayCast(mouse, objects);
        
        if (clicked && clicked.length > 0) {

            onElementClick(clicked[0].object.userData.id);
        }
    }
      
      clicked = camera.rayCast(mouse, browser);
        
      if (clicked && clicked.length > 0) {


       if ( clicked[0].object.userData.state ) {

      browserManager.actionButton(clicked[0].object.userData.arrow); 

             }
        }
  }
}

function showFlow(id) {
    
    //Should receive the id and the flow's name
    
    var tile = objects[id];
    
    camera.enable();
    camera.move(tile.position.x, tile.position.y, tile.position.z + window.TILE_DIMENSION.width * 5);
    
    setTimeout(function() {
        actualFlow = new ActionFlow();
        actualFlow.draw(tile.position.x, tile.position.y);
    }, 1500);
}

function animate() {

    requestAnimationFrame(animate);

    TWEEN.update();

    camera.update();

    if ( stats ) stats.update();
}

function create_stats(){ 

    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left    = '0px';
    stats.domElement.style.top   = '0px';
    stats.domElement.style.display  = 'block';
    var contai = document.getElementById("container");
    contai.appendChild(stats.domElement);

    }

function render() {

    //renderer.render( scene, camera );
    camera.render(renderer, scene);
}
function ViewManager() {

    this.lastTargets = null;
    this.targets = {
        table: [],
        sphere: [],
        helix: [],
        grid: []
    };
    this.dimensions = {};

    var self = this;
    var groupsQtty;
    var layersQtty;
    var section = [];
    var columnWidth = 0;
    var layerPosition = [];

    var elementsByGroup = [];
    var superLayerMaxHeight = 0;
    var superLayerPosition = [];


    /**
     * Pre-computes the space layout for next draw
     */
    this.preComputeLayout = function() {

        var section_size = [],
            superLayerHeight = 0,
            isSuperLayer = [],
            i;

        //Initialize
        for (var key in layers) {
            if (key == "size") continue;

            if (layers[key].super_layer) {

                section.push(0);
                section_size.push(0);
                superLayerHeight++;

                if (superLayerMaxHeight < superLayerHeight) superLayerMaxHeight = superLayerHeight;
            } else {

                var newLayer = [];
                superLayerHeight = 0;

                for (i = 0; i < groupsQtty; i++)
                    newLayer.push(0);

                section_size.push(newLayer);
                section.push(newLayer.slice(0)); //Use a copy
            }

            isSuperLayer.push(false);
        }

        for (var j = 0; j <= groupsQtty; j++) {

            elementsByGroup.push(0);
        }

        //Set sections sizes

        for (i = 0; i < table.length; i++) {

            var r = table[i].layerID;
            var c = table[i].groupID;

            elementsByGroup[c]++;

            if (layers[table[i].layer].super_layer) {

                section_size[r]++;
                isSuperLayer[r] = true;
            } else {

                section_size[r][c]++;

                if (section_size[r][c] > columnWidth) columnWidth = section_size[r][c];
            }
        }

        //Set row height

        var actualHeight = 0;
        var remainingSpace = superLayerMaxHeight;
        var inSuperLayer = false;
        var actualSuperLayer = 0;

        for (i = 0; i < layersQtty; i++) {

            if (isSuperLayer[i]) {

                if (!inSuperLayer) {
                    actualHeight += 3;

                    if (superLayerPosition[actualSuperLayer] === undefined) {
                        superLayerPosition[actualSuperLayer] = actualHeight;
                    }
                }

                inSuperLayer = true;
                actualHeight++;
                remainingSpace--;
            } else {

                if (inSuperLayer) {

                    actualHeight += remainingSpace + 1;
                    remainingSpace = superLayerMaxHeight;
                    actualSuperLayer++;
                }

                inSuperLayer = false;
                actualHeight++;
            }

            layerPosition[i] = actualHeight;
        }
    };

    // Disabled
    this.otherViews = function() {

        var i, j, l, vector, phi, object;

        // sphere

        vector = new THREE.Vector3();

        var indexes = [];

        for (i = 0; i <= groupsQtty; i++) indexes.push(0);

        for (i = 0; i < objects.length; i++) {

            var g = (table[i].groupID !== undefined) ? table[i].groupID : groupsQtty;

            var radious = 300 * (g + 1);

            phi = Math.acos((2 * indexes[g]) / elementsByGroup[g] - 1);
            var theta = Math.sqrt(elementsByGroup[g] * Math.PI) * phi;

            object = new THREE.Object3D();

            object.position.x = radious * Math.cos(theta) * Math.sin(phi);
            object.position.y = radious * Math.sin(theta) * Math.sin(phi);
            object.position.z = radious * Math.cos(phi);

            vector.copy(object.position).multiplyScalar(2);

            object.lookAt(vector);

            this.targets.sphere.push(object);

            indexes[g]++;


        }

        // helix

        vector = new THREE.Vector3();

        var helixSection = [];
        var current = [];
        var last = 0,
            helixPosition = 0;

        for (i = 0; i < layersQtty; i++) {

            var totalInRow = 0;

            for (j = 0; j < groupsQtty; j++) {

                if (typeof(section[i]) == "object")
                    totalInRow += section[i][j];
                else if (j === 0)
                    totalInRow += section[i];
            }

            helixPosition += last;
            helixSection.push(helixPosition);
            last = totalInRow;

            current.push(0);
        }

        for (i = 0, l = objects.length; i < l; i++) {

            var row = table[i].layerID;

            var x = helixSection[row] + current[row];
            current[row]++;


            phi = x * 0.175 + Math.PI;

            object = new THREE.Object3D();

            object.position.x = 900 * Math.sin(phi);
            object.position.y = -(x * 8) + 450;
            object.position.z = 900 * Math.cos(phi);

            vector.x = object.position.x * 2;
            vector.y = object.position.y;
            vector.z = object.position.z * 2;

            object.lookAt(vector);

            this.targets.helix.push(object);

        }

        // grid

        var gridLine = [];
        var gridLayers = [];
        var lastLayer = 0;


        for (i = 0; i < layersQtty + 1; i++) {

            //gridLine.push(0);
            var gridLineSub = [];
            var empty = true;

            for (j = 0; j < section.length; j++) {

                if (section[j][i] !== 0) empty = false;

                gridLineSub.push(0);
            }

            if (!empty) lastLayer++;

            gridLayers.push(lastLayer);
            gridLine.push(gridLineSub);
        }

        for (i = 0; i < objects.length; i++) {

            var group = table[i].groupID;
            var layer = table[i].layerID;

            object = new THREE.Object3D();

            //By layer
            object.position.x = ((gridLine[layer][0] % 5) * 200) - 450;
            object.position.y = (-(Math.floor(gridLine[layer][0] / 5) % 5) * 200) + 0;
            object.position.z = (-gridLayers[layer]) * 200 + (layersQtty * 50);
            gridLine[layer][0]++;

            this.targets.grid.push(object);

        }

        //
    };

    /**
     * Uses the list to fill all global data
     * @param {Object} list List returned by the server
     */
    /*this.fillTable = function(list) {
        var pluginList = list.plugins,
            i, l, dependency;

        for (i = 0, l = list.superLayers.length; i < l; i++) {
            superLayers[list.superLayers[i].code] = {};
            superLayers[list.superLayers[i].code].name = list.superLayers[i].name;
            superLayers[list.superLayers[i].code].index = list.superLayers[i].index;

            if (list.superLayers[i].dependsOn && list.superLayers[i].dependsOn.length !== 0) {
                dependency = list.superLayers[i].dependsOn.split(' ').join('').split(',');
                superLayers[list.superLayers[i].code].dependsOn = dependency;
            }
        }
        console.dir(superLayers);

        for (i = 0, l = list.layers.length; i < l; i++) {
            layers[list.layers[i].name] = {};
            layers[list.layers[i].name].index = list.layers[i].index;
            layers[list.layers[i].name].super_layer = list.layers[i].super_layer;
        }
        console.dir(layers);


        for (i = 0, l = list.groups.length; i < l; i++) {
            groups[list.groups[i].code] = {};
            groups[list.groups[i].code].index = list.groups[i].index;

            if (list.groups[i].dependsOn && list.groups[i].dependsOn.length !== 0) {
                dependency = list.groups[i].dependsOn.split(' ').join('').split(',');
                groups[list.groups[i].code].dependsOn = dependency;
            }
        }
        console.dir(groups);

        for (i = 0, l = pluginList.length; i < l; i++) {

            var data = pluginList[i];

            var _group = data.group;
            var _layer = data.layer;
            var _name = data.name;

            var layerID = layers[_layer].index;
            layerID = (layerID === undefined) ? layers.size() : layerID;

            var groupID = (_group !== undefined) ? groups[_group].index : undefined;
            groupID = (groupID === undefined) ? groups.size() : groupID;

            var element = {
                group: _group,
                groupID: groupID,
                code: helper.getCode(_name),
                name: _name,
                layer: _layer,
                layerID: layerID,
                type: data.type,
                picture: data.authorPicture,
                author: data.authorName ? data.authorName.trim().toLowerCase() : undefined,
                authorRealName: data.authorRealName ? data.authorRealName.trim() : undefined,
                authorEmail: data.authorEmail ? data.authorEmail.trim() : undefined,
                difficulty: data.difficulty,
                code_level: data.code_level ? data.code_level.trim().toLowerCase() : undefined,
                life_cycle: data.life_cycle
            };
            table.push(element);
        }
        console.dir(table);

        groupsQtty = groups.size();
        layersQtty = layers.size();
    };*/

    var getSPL = function(_id, _SPLArray) {
        if (_id) {
            for (var i = 0, l = _SPLArray.length; i < l; i++) {
                if (_SPLArray[i]._id + '' == _id + '') {
                    return _SPLArray[i];
                }
            }
        } else {
            return null;
        }
    };

    var getBestDev = function(_devs) {
        var dev = {};
        if (_devs) {
            var _dev = {};
            dev.percnt = 0;
            for (var i = 0, l = _devs.length; i < l; i++) {
                _dev = _devs[i];
                if (_dev.scope == 'implementation' && _dev.percnt >= dev.percnt) {
                    dev.percnt = _dev.percnt;
                    dev.usrnm = _dev.dev.usrnm;
                    dev.name = _dev.dev.name;
                    dev.email = _dev.dev.email;
                    dev.avatar_url = _dev.dev.avatar_url;
                }
            }
        }
        return dev;
    };

    this.fillTable = function(list) {
        var _suprlays = list.suprlays,
            _platfrms = list.platfrms,
            _layers = list.layers,
            _comps = list.comps,
            i, l, code, name;

        for (i = 0, l = _suprlays.length; i < l; i++) {
            code = _suprlays[i].code;
            superLayers[code] = {};
            superLayers[code].name = _suprlays[i].name;
            superLayers[code].index = _suprlays[i].order;
            //superLayers[code]._id = _suprlays[i]._id;
            superLayers[code].dependsOn = _suprlays[i].deps;
        }
        console.dir(superLayers);

        for (i = 0, l = _platfrms.length; i < l; i++) {
            code = _platfrms[i].code;
            groups[code] = {};
            groups[code].index = _platfrms[i].order;
            groups[code].dependsOn = _platfrms[i].deps;
            //groups[code]._id = _platfrms[i]._id;
        }
        console.dir(groups);

        layers['empty layer 0'] = {
            index: 27,
            super_layer: false
        };
        layers['empty layer 1'] = {
            index: 5,
            super_layer: false
        };
        layers['empty layer 2'] = {
            index: 26,
            super_layer: false
        };
        layers['empty layer 3'] = {
            index: 29,
            super_layer: false
        };
        layers['empty layer 4'] = {
            index: 34,
            super_layer: false
        };
        layers['empty layer 5'] = {
            index: 40,
            super_layer: false
        };
        for (i = 0, l = _layers.length; i < l; i++) {
            name = helper.capFirstLetter(_layers[i].name);
            layers[name] = {};
            switch (_layers[i].name) {
                case 'communication':
                    layers[name].super_layer = 'P2P';
                    break;
                case 'multi os':
                    layers[name].super_layer = 'OSA';
                    break;
                case 'android':
                    layers[name].super_layer = 'OSA';
                    break;
                case 'crypto router':
                    layers[name].super_layer = 'BCH';
                    break;
                case 'crypto module':
                    layers[name].super_layer = 'BCH';
                    break;
                case 'crypto vault':
                    layers[name].super_layer = 'BCH';
                    break;
                case 'crypto network':
                    layers[name].super_layer = 'BCH';
                    break;
                default:
                    layers[name].super_layer = false;
                    break;
            }
            layers[name].index = _layers[i].order;
            //layers[name]._id = _layers[i]._id;
        }
        console.dir(layers);

        for (i = 0, l = _comps.length; i < l; i++) {

            var _comp = _comps[i];

            var _platfrm = getSPL(_comp._platfrm_id, _platfrms);
            var _layer = getSPL(_comp._layer_id, _layers);

            var layerID = _layer.order;
            layerID = (layerID === undefined || layerID == -1) ? layers.size() : layerID;

            var groupID = (_platfrm !== undefined && _platfrm !== null) ? _platfrm.order : undefined;
            groupID = (groupID === undefined || groupID == -1) ? groups.size() : groupID;

            var _author = getBestDev(_comp.devs);

            var element = {
                group: _platfrm ? _platfrm.code : undefined,
                groupID: groupID,
                code: helper.getCode(_comp.name),
                name: helper.capFirstLetter(_comp.name),
                layer: helper.capFirstLetter(_layer.name),
                layerID: layerID,
                type: helper.capFirstLetter(_comp.type),
                picture: _author.avatar_url ? _author.avatar_url : undefined,
                author: _author.usrnm ? _author.usrnm : undefined,
                authorRealName: _author.name ? _author.name : undefined,
                authorEmail: _author.email ? _author.email : undefined,
                difficulty: _comp.difficulty,
                code_level: _comp.code_level ? _comp.code_level : undefined,
                life_cycle: _comp.life_cycle,
                found: _comp.found
            };
            table.push(element);
        }
        console.dir(table);
        groupsQtty = groups.size();
        layersQtty = layers.size();
    };

    /**
     * Creates the tile texture
     * @param   {Number} id         ID in the table
     * @param   {String} quality    The quality of the picture as folder in the images dir
     * @param   {Number} tileWidth  Width of the tile
     * @param   {Number} tileHeight Height of the tile
     * @param   {Number} scale      Scale of the pictures, the bigger, the better but heavier
     * @returns {Object} The drawn texture
     */
    this.createTexture = function(id, quality, tileWidth, tileHeight, scale) {
        
        var state = table[id].code_level,
            difficulty = Math.ceil(table[id].difficulty / 2),
            group = table[id].group || window.layers[table[id].layer].super_layer,
            type = table[id].type,
            picture = table[id].picture,
            base = 'images/tiles/';

        var canvas = document.createElement('canvas');
        canvas.width = tileWidth * scale;
        canvas.height = tileHeight * scale;

        var middle = canvas.width / 2;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, tileWidth * scale, tileHeight * scale);
        ctx.textAlign = 'center';

        var texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.LinearFilter;

        var pic = {
                src : picture || base + 'buster.png',
                alpha : 0.8
            },
            portrait = {
                    src: base + 'portrait/' + quality + '/' + state + '.png',
                    x: 0,
                    y: 0,
                    w: tileWidth * scale,
                    h: tileHeight * scale
            },
            groupIcon = {
                src : base + 'icons/group/' + quality + '/icon_' + group + '.png',
                    w: 28 * scale,
                    h: 28 * scale
            },
            typeIcon = {
                src : base + 'icons/type/' + quality + '/' + type.toLowerCase() + '_logo.png',
                    w: 28 * scale,
                    h: 28 * scale
            },
            ring = {
                src : base + 'rings/' + quality + '/' + state + '_diff_' + difficulty + '.png'
            },
            codeText = {
                text : table[id].code,
                font : (18 * scale) + "px Arial"
            },
            nameText = {
                text : table[id].name,
                font : (10 * scale) + 'px Arial'
            },
            layerText = {
                text : table[id].layer,
                font : (6 * scale) + 'px Arial'
            },
            authorText = {
                text : table[id].authorRealName || table[id].author || '',
                font : (3.5 * scale) + 'px Arial'
            };

        switch(state) {
            case "concept":
                pic.x = 79 * scale;
                pic.y = 36 * scale;
                pic.w = 53 * scale;
                pic.h = 53 * scale;

                groupIcon.x = 25 * scale;
                groupIcon.y = 49 * scale;

                typeIcon.x = 160 * scale;
                typeIcon.y = 49 * scale;

                ring.x = 72 * scale;
                ring.y = 93 * scale;
                ring.w = 68 * scale;
                ring.h = 9 * scale;

                codeText.x = middle;
                codeText.y = 21 * scale;

                nameText.x = middle;
                nameText.y = 33 * scale;
                nameText.font = (9 * scale) + 'px Arial';
                nameText.color = "#000000";

                layerText.x = middle;
                layerText.y = 114 * scale;

                authorText.x = middle;
                authorText.y = 80 * scale;

                break;
            case "development":
                pic.x = 79 * scale;
                pic.y = 47 * scale;
                pic.w = 53 * scale;
                pic.h = 53 * scale;

                groupIcon.x = 25 * scale;
                groupIcon.y = 76 * scale;

                typeIcon.x = 154 * scale;
                typeIcon.y = 76 * scale;

                ring.x = 64.5 * scale;
                ring.y = 30.8 * scale;
                ring.w = 82 * scale;
                ring.h = 81.5 * scale;

                codeText.x = middle;
                codeText.y = 20 * scale;

                nameText.x = middle;
                nameText.y = 28 * scale;
                nameText.font = (6 * scale) + 'px Arial';

                layerText.x = middle;
                layerText.y = 113 * scale;
                layerText.color = "#F26662";

                authorText.x = middle;
                authorText.y = 88 * scale;

                break;
            case "qa":
                pic.x = 80 * scale;
                pic.y = 35 * scale;
                pic.w = 53 * scale;
                pic.h = 53 * scale;

                groupIcon.x = 35 * scale;
                groupIcon.y = 76 * scale;

                typeIcon.x = 154 * scale;
                typeIcon.y = 76 * scale;

                ring.x = 68 * scale;
                ring.y = 34.7 * scale;
                ring.w = 79 * scale;
                ring.h = 68.5 * scale;

                codeText.x = middle;
                codeText.y = 20 * scale;

                nameText.x = middle;
                nameText.y = 28 * scale;
                nameText.font = (6 * scale) + 'px Arial';

                layerText.x = middle;
                layerText.y = 112 * scale;
                layerText.color = "#FCC083";

                authorText.x = middle;
                authorText.y = 78 * scale;

                break;
            case "production":
                pic.x = 56 * scale;
                pic.y = 33 * scale;
                pic.w = 53 * scale;
                pic.h = 53 * scale;

                groupIcon.x = 17 * scale;
                groupIcon.y = 30 * scale;

                typeIcon.x = 17 * scale;
                typeIcon.y = 62 * scale;

                ring.x = 25 * scale;
                ring.y = 99 * scale;
                ring.w = 68 * scale;
                ring.h = 9 * scale;

                codeText.x = 170 * scale;
                codeText.y = 26 * scale;

                nameText.x = 170 * scale;
                nameText.y = 71 * scale;
                nameText.font = (7 * scale) + 'px Arial';
                nameText.constraint = 60 * scale;
                nameText.lineHeight = 9 * scale;
                nameText.wrap = true;

                layerText.x = 170 * scale;
                layerText.y = 107 * scale;

                authorText.x = 82 * scale;
                authorText.y = 77 * scale;

                break;
        }

        if(state == "concept" || state == "production")
            ring.src = base + 'rings/' + quality + '/linear_diff_' + difficulty + '.png';

        if(difficulty === 0)
            ring = {};

        var data = [
                pic,
                portrait,
                groupIcon,
                typeIcon,
                ring,
                codeText,
                nameText,
                layerText,
                authorText
            ];

        drawPicture(data, ctx, texture);

        return texture;
    };
    
    /**
     * Creates a Tile
     * @param   {Number}     i ID of the tile (index in table)
     * @returns {DOMElement} The drawable element that represents the tile
     */
    this.createElement = function(id) {

        var mesh,
            element = new THREE.LOD(),
            levels = [
            ['high', 0],
            ['medium', 1000],
            ['small', 1800],
            ['mini', 2300]],
            texture,
            tileWidth = window.TILE_DIMENSION.width - window.TILE_SPACING,
            tileHeight = window.TILE_DIMENSION.height - window.TILE_SPACING,
            scale = 2;
        
        for(var j = 0, l = levels.length; j < l; j++) {

            if(levels[j][0] === 'high') scale = 2;
            else scale = 1;

            texture = self.createTexture(id, levels[j][0], tileWidth, tileHeight, scale);

            mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(tileWidth, tileHeight),
                new THREE.MeshBasicMaterial({vertexColors : THREE.FaceColors, side : THREE.FrontSide, color : 0xffffff})
            );
            mesh.userData = {id : id};
            mesh.material.map = texture;
            mesh.material.needsUpdate = true;
            element.addLevel(mesh, levels[j][1]);
            element.userData = {flying : false};
        }

        return element;
    };

    /**
     * Converts the table in another form
     * @param {Array}  goal     Member of ViewManager.targets
     * @param {Number} duration Milliseconds of animation
     */
    this.transform = function(goal, duration) {

        var i, l;

        duration = duration || 2000;

        //TWEEN.removeAll();

        if (goal) {
            
            this.lastTargets = goal;
            
            var animate = function(object, target) { 
                
                 new TWEEN.Tween(object.position)
                    .to({
                        x: target.position.x,
                        y: target.position.y,
                        z: target.position.z
                    }, Math.random() * duration + duration)
                    .easing(TWEEN.Easing.Exponential.InOut)
                    .onComplete(function() { object.userData.flying = false; })
                    .start();

                new TWEEN.Tween(object.rotation)
                    .to({
                        x: target.rotation.x,
                        y: target.rotation.y,
                        z: target.rotation.z
                    }, Math.random() * duration + duration)
                    .easing(TWEEN.Easing.Exponential.InOut)
                    .start();
                
            };

            
            for (i = 0; i < objects.length; i++) {

                var object = objects[i];
                var target = goal[i];
                
                animate(object, target);

            }

            if (goal == this.targets.table) {
                headers.show(duration);
            } else {
                headers.hide(duration);
            }
        }

        new TWEEN.Tween(this)
            .to({}, duration * 2)
            .onUpdate(render)
            .start();
    };

    /**
     * Goes back to last target set in last transform
     */
    this.rollBack = function() {
        changeView(this.lastTargets);
    };

    /**
     * Inits and draws the table, also creates the Dimensions object
     */
    this.drawTable = function() {

        this.preComputeLayout();

        for (var i = 0; i < table.length; i++) {

            var object = this.createElement(i);

            object.position.x = Math.random() * 80000 - 40000;
            object.position.y = Math.random() * 80000 - 40000;
            object.position.z = 80000;
            object.rotation.x = Math.random() * 180;
            object.rotation.y = Math.random() * 180;
            object.rotation.z = Math.random() * 180;
            scene.add(object);

            objects.push(object);

            //

            object = new THREE.Object3D();

            //Row (Y)
            var row = table[i].layerID;

            if (layers[table[i].layer].super_layer) {

                object.position.x = ((section[row]) * window.TILE_DIMENSION.width) - (columnWidth * groupsQtty * window.TILE_DIMENSION.width / 2);

                section[row]++;

            } else {

                //Column (X)
                var column = table[i].groupID;
                object.position.x = (((column * (columnWidth) + section[row][column]) + column) * window.TILE_DIMENSION.width) - (columnWidth * groupsQtty * window.TILE_DIMENSION.width / 2);

                section[row][column]++;
            }


            object.position.y = -((layerPosition[row]) * window.TILE_DIMENSION.height) + (layersQtty * window.TILE_DIMENSION.height / 2);

            this.targets.table.push(object);

        }

        this.dimensions = {
            columnWidth: columnWidth,
            superLayerMaxHeight: superLayerMaxHeight,
            groupsQtty: groupsQtty,
            layersQtty: layersQtty,
            superLayerPosition: superLayerPosition
        };
    };

    /**
     * Takes away all the tiles except the one with the id
     * @param {Array}  [ids]           The IDs to let alone
     * @param {Number} [duration=2000] Duration of the animation
     */
    this.letAlone = function(ids, duration) {
        
        if(typeof ids === 'undefined') ids = [];
        if(typeof ids === 'number') ids = [ids];

        var i, _duration = duration || 2000,
            distance = camera.getMaxDistance(),
            out = new THREE.Vector3(0, 0, distance);

        TWEEN.removeAll();

        var target;
        
        var animate = function(object, target, dur) {

            new TWEEN.Tween(object.position)
                .to({
                x: target.x,
                y: target.y,
                z: target.z
            }, dur)
                .easing(TWEEN.Easing.Exponential.InOut)
            .onComplete(function() { object.userData.flying = false; })
                .start();
            
        };
        
        for(i = 0; i < objects.length; i++) {
            
            if(ids.indexOf(i) !== -1) {
                target = this.lastTargets[i].position;
            }
            else {
                target = out;
                objects[i].userData.flying = true;
            }
            
            animate(objects[i], target, Math.random() * _duration + _duration);
        }

        new TWEEN.Tween(this)
            .to({}, _duration * 2)
            .onUpdate(render)
            .start();
    };
    
    //Private methods
    /**
     * Draws a picture in canvas
     * @param {Array}  data    The options of the picture
     * @param {Object} ctx     Canvas context
     * @param {Object} texture The texture object to update
     */
    function drawPicture(data, ctx, texture) {

        var image = new Image();
        var actual = data.shift();

        if(actual.src && actual.src != 'undefined') {

            image.onload = function() {


                if(actual.alpha)
                    ctx.globalAlpha = actual.alpha;

                ctx.drawImage(image, actual.x, actual.y, actual.w, actual.h);
                if(texture)
                    texture.needsUpdate = true;

                ctx.globalAlpha = 1;

                if(data.length !== 0) {

                    if(data[0].text)
                        drawText(data, ctx, texture);
                    else
                        drawPicture(data, ctx, texture);
                }
            };

            image.onerror = function() {
                if(data.length !== 0) {
                    if(data[0].text)
                        drawText(data, ctx, texture);
                    else
                        drawPicture(data, ctx, texture);
                }
            };

            image.crossOrigin="anonymous";
            image.src = actual.src;
        }
        else {
            if(data.length !== 0) {
                if(data[0].text)
                    drawText(data, ctx, texture);
                else
                    drawPicture(data, ctx, texture);
            }
        }
    }

    /**
     * Draws a texture in canvas
     * @param {Array}  data    Options of the texture
     * @param {Object} ctx     Canvas Context
     * @param {Object} texture Texture to update
     */
    function drawText(data, ctx, texture) {

        var actual = data.shift();

        //TODO: Set Roboto typo

        if(actual.color)
            ctx.fillStyle = actual.color;

        ctx.font = actual.font;

        if(actual.constraint)
            if(actual.wrap)
                helper.drawText(actual.text, actual.x, actual.y, ctx, actual.constraint, actual.lineHeight);
            else
                ctx.fillText(actual.text, actual.x, actual.y, actual.constraint);
        else
            ctx.fillText(actual.text, actual.x, actual.y);

        if(texture)
            texture.needsUpdate = true;

        ctx.fillStyle = "#FFFFFF";

        if(data.length !== 0)
            drawText(data, ctx);
    }
}