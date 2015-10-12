/**
 * @author Emmanuel Colina
 * function create a logo (wallet) and charge your textures
 */

function Logo(){
    
    var self = this;

    //inicilizacion del logo wallet
    var geometryPlanoWallet = new THREE.PlaneGeometry(995, 700);

    //var textureWallet = new THREE.ImageUtils.loadTexture("images/walletlogo.png");
    //textureWallet.minFilter = THREE.NearestFilter;

    var materialPlanoWallet = new THREE.MeshBasicMaterial({ side: THREE.FrontSide, transparent: true, opacity: 1 , color:0xffffff});

    
    var walletLogo = new THREE.Mesh(geometryPlanoWallet, materialPlanoWallet);
    helper.applyTexture("images/walletlogo.png", walletLogo);

    walletLogo.position.x = 0;
    walletLogo.position.y = 230;
    walletLogo.position.z = 63800;
    scene.add(walletLogo);

    //inicilizacion del logo fermat
    var geometryPlanoFermat = new THREE.PlaneGeometry(950, 300);

    //var textureFermat = new THREE.ImageUtils.loadTexture("images/fermatlogo.png");
    //textureFermat.minFilter = THREE.NearestFilter;

    var materialPlanoFermat = new THREE.MeshBasicMaterial({ side: THREE.FrontSide, transparent: true, opacity: 1, color: 0xffffff});
    
    var fermatLogo = new THREE.Mesh(geometryPlanoFermat, materialPlanoFermat);
    helper.applyTexture("images/fermatlogo.png", fermatLogo);

    fermatLogo.position.x = 0;
    fermatLogo.position.y = -310;
    fermatLogo.position.z = 63800;
    scene.add(fermatLogo);
    
    this.startFade = function(duration) {
        self.fadeFermatLogo(duration);
        self.fadeWalletLogo(duration);
    };
    
    this.stopFade = function(duration) {
        self.stopFermatLogo(duration);
        self.stopWalletLogo(duration);
    };
    
    this.openLogo = function(duration) {
        self.openFermatLogo(duration);
        self.openWalletLogo(duration);
    };
    
    this.closeLogo = function(duration) {
        self.closeFermatLogo(duration);
        self.tecloseWalletLogo(duration);
    };
    
    /**
     * @author Emmanuel Colina
     * It provides a fade to logo(wallet)
     * @param {Number} [duration=2000] Duration of the animation
     */
    this.fadeWalletLogo = function (duration){
        var _duration = duration || 2000;

        var tween1 = new TWEEN.Tween(walletLogo.material)
        .to({ opacity : 1, needsUpdate : true}, _duration)
        .onUpdate(render);
        
        var tween2 = new TWEEN.Tween(walletLogo.material)
        .to({ opacity : 0, needsUpdate : true}, _duration)
        .onUpdate(render);

        tween1.chain(tween2);
        tween2.chain(tween1);

        tween1.start();
    };

    /**
     * @author Emmanuel Colina
     * repaint with opacity : 1, after of THREE.removeAll();
     * @param {Number} [duration=2000] Duration of the animation
     */
    this.stopWalletLogo = function (duration){
        var _duration = duration || 1000;

        var tweenstop = new TWEEN.Tween(walletLogo.material)
        .to({ opacity : 1, needsUpdate : true}, _duration)
        .onUpdate(render);

        tweenstop.start();
    };

    /**
     * @author Emmanuel Colina
     *  the logo(wallet)
     * @param {Number} [duration=2000] Duration of the delay
     */
    this.openWalletLogo = function (duration){

        var _duration = duration || 2000;

        var tween = new TWEEN.Tween(walletLogo.position);
        tween.to({ y: 1640, z: 60000}, 2000);
        tween.delay( _duration );
        tween.easing(TWEEN.Easing.Exponential.InOut);
        tween.onUpdate(render);

        tween.start();
    };

    /**
     * @author Emmanuel Colina
     * logo(wallet) returns to the original z
     * @param {Number} [duration=2000] Duration of the delay
     */
    this.closeWalletLogo = function (duration){

        var _duration = duration || 2000;

        var tween = new TWEEN.Tween(walletLogo.position);
        tween.to({ y: 230, z: 63800}, 2500);
        tween.delay( _duration );
        tween.easing(TWEEN.Easing.Exponential.InOut);
        tween.onUpdate(render);

        tween.start();
    };
  
     /**
     * @author Emmanuel Colina
     * It provides a fade to logo(Fermat)
     * @param {Number} [duration=2000] Duration of the animation
     */
    this.fadeFermatLogo = function (duration){

        var _duration = duration || 2000;

        var tween1 = new TWEEN.Tween(fermatLogo.material)
        .to({ opacity : 1, needsUpdate : true}, _duration)
        .onUpdate(render);
        
        var tween2 = new TWEEN.Tween(fermatLogo.material)
        .to({ opacity : 0, needsUpdate : true}, _duration)
        .onUpdate(render);

        tween1.chain(tween2);
        tween2.chain(tween1);

        tween1.start();
    };

    /**
     * @author Emmanuel Colina
     * repaint with opacity : 1, after of THREE.removeAll();
     * @param {Number} [duration=2000] Duration of the duration
     */
    this.stopFermatLogo = function (duration){

        var _duration = duration || 1000;

        var tweenstop = new TWEEN.Tween(fermatLogo.material)
        .to({ opacity : 1, needsUpdate : true}, _duration)
        .onUpdate(render);

        tweenstop.start();
    };

    /**
     * @author Emmanuel Colina
     *  the logo(Fermat)
     * @param {Number} [duration=2000] Duration of the delay
     */
    this.openFermatLogo = function (duration){

        var _duration = duration || 2000;

        var tween = new TWEEN.Tween(fermatLogo.position);
        tween.to({ y: -1800, z: 60000}, 2000);
        tween.delay( _duration );
        tween.easing(TWEEN.Easing.Exponential.InOut);
        tween.onUpdate(render);

        tween.start();
    };

    /**
     * @author Emmanuel Colina
     * logo(wallet) returns to the original z
     * @param {Number} [duration=2000] Duration of the delay
     */
    this.closeFermatLogo = function (duration){

        var _duration = duration || 2000;

        var tween = new TWEEN.Tween(fermatLogo.position);
        tween.to({ y: -310, z: 63800}, 2500);
        tween.delay( _duration );
        tween.easing(TWEEN.Easing.Exponential.InOut);
        tween.onUpdate(render);

        tween.start();
    };
}
