/**
 * @author Emmanuel Colina
 * @lastmodifiedBy Miguel Celedon
 * function create a logo (wallet) and charge your textures
 */
function Logo(){
    
    var self = this;

    var lowerLayer = 2000,
        upperLayer = 30000;
    
    var walletClosedY = 4600,
        walletOpenY = 15000,
        fermatClosedY = -walletClosedY,
        fermatOpenY = -walletOpenY;
    
    
    
    var walletLogo = createLogo(995, 700, "images/walletlogo.png", new THREE.Vector3(0, walletClosedY, upperLayer)),
        fermatLogo = createLogo(950, 300, "images/fermatlogo.png", new THREE.Vector3(0, fermatClosedY, upperLayer));
        
       /* new THREE.Mesh(
        new THREE.PlaneGeometry(995, 700),
        new THREE.MeshBasicMaterial({ side: THREE.FrontSide, transparent: true, opacity: 0 , color:0xffffff}));
    helper.applyTexture("images/walletlogo.png", walletLogo);

    walletLogo.scale.set(20, 20, 20);
    walletLogo.position.x = 0;
    walletLogo.position.y = walletClosedY;
    walletLogo.position.z = upperLayer;
    scene.add(walletLogo);
    
    
    var fermatLogo = new THREE.Mesh(
        new THREE.PlaneGeometry(950, 300),
        new THREE.MeshBasicMaterial({ side: THREE.FrontSide, transparent: true, opacity: 0, color: 0xffffff}));
    helper.applyTexture("images/fermatlogo.png", fermatLogo);

    fermatLogo.scale.set(20, 20, 20);
    fermatLogo.position.x = 0;
    fermatLogo.position.y = fermatClosedY;
    fermatLogo.position.z = upperLayer;
    scene.add(fermatLogo);*/
    
    this.walletLogo = walletLogo;
    this.fermatLogo = fermatLogo;
    
    
    function createLogo(width, height, texture, position) {
        
        var mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            new THREE.MeshBasicMaterial({ side: THREE.FrontSide, transparent : true, opacity : 0, color : 0xFFFFFF}));
        helper.applyTexture(texture, mesh);
        
        mesh.scale.set(20, 20, 20);
        mesh.position.copy(position);
        scene.add(mesh);
        
        return mesh;
    }
    
    /**
     * Starts the logo fade animation
     * @param {Number} [duration=1000] The duration of the fade
     * @author Miguel Celedon
     */
    this.startFade = function(duration) {
        
        self.fadeLogo(duration, walletLogo);
        self.fadeLogo(duration, fermatLogo);
    };
    
    /**
     * Stops the fade animation
     * @param {Number} [duration=1000] The duration of the fade
     * @author Miguel Celedon
     */
    this.stopFade = function(duration) {
        
        self.stopFadeLogo(duration, walletLogo);
        self.stopFadeLogo(duration, fermatLogo);
    };
    
    /** 
     * Opens the logo
     * @param {Number} [duration=1000] The duration of the animation
     * @author Miguel Celedon
     */
    this.openLogo = function(duration) {
        self.moveLogo(duration, walletLogo, walletOpenY, lowerLayer);
        self.moveLogo(duration, fermatLogo, fermatOpenY, lowerLayer);
    };
    
    /**
     * Closes the logo
     * @param {Number} [duration=1000] The duration of the animation
     * @author Miguel Celedon
     */
    this.closeLogo = function(duration) {
        self.moveLogo(duration, walletLogo, walletClosedY, upperLayer);
        self.moveLogo(duration, fermatLogo, fermatClosedY, upperLayer);
    };
    
    /**
     * @author Emmanuel Colina
     * @lastmodifiedBy Miguel Celedon
     *                     
     * It provides a fade to logo
     * @param {Number} [duration=2000] Duration of the animation
     * @param {Object} logo            The logo to animate
     */
    this.fadeLogo = function (duration, logo){
        var _duration = duration || 2000;

        var tween1 = new TWEEN.Tween(logo.material)
        .to({ opacity : 1, needsUpdate : true}, _duration)
        .onUpdate(render);
        
        var tween2 = new TWEEN.Tween(logo.material)
        .to({ opacity : 0, needsUpdate : true}, _duration)
        .onUpdate(render);

        tween1.chain(tween2);
        tween2.chain(tween1);

        tween1.start();
    };

    /**
     * @author Emmanuel Colina
     * @lastmodifiedBy Miguel Celedon
     *                     
     * repaint with opacity : 1, after of THREE.removeAll();
     * @param {Number} [duration=2000] Duration of the animation
     * @param {Object} logo            The Logo to stop its fade
     */
    this.stopFadeLogo = function (duration, logo){
        var _duration = duration || 1000;

        var tweenstop = new TWEEN.Tween(logo.material)
        .to({ opacity : 1, needsUpdate : true}, _duration)
        .onUpdate(render)
        .start();
    };

    /**
     * @author Emmanuel Colina
     * @lastmodifiedBy Miguel Celedon
     * Moves the logo
     * @param {Number}     [duration=2000] Duration of the delay
     * @param {THREE.Mesh} object          The object to move                            
     * @param {Number}     targetY         The objetive Y position
     * @param {Number}     targetZ         The objetive Z position
     */
    this.moveLogo = function (duration, object, targetY, targetZ){

        var _duration = duration || 2000;

        var tween = new TWEEN.Tween(object.position);
        tween.to({ y: targetY, z: targetZ}, 2000);
        tween.delay( _duration );
        tween.easing(TWEEN.Easing.Exponential.InOut);
        tween.onUpdate(render);

        tween.start();
    };
}
