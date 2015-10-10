/**
 * @author Emmanuel Colina
 * function create a logo (wallet) and charge your textures
 */

function Logo(){

    //inicilizacion del logo wallet
    var geometryPlanowallet = new THREE.PlaneGeometry(995, 700);

    var textureWallet = new THREE.ImageUtils.loadTexture("images/walletlogo.png");
    textureWallet.minFilter = THREE.NearestFilter;

    var materialPlanowallet = new THREE.MeshBasicMaterial({ map: textureWallet, side: THREE.FrontSide, transparent: true, opacity: 1 , color:0xffffff});

    var walletLogo = new THREE.Mesh(geometryPlanowallet, materialPlanowallet);

    walletLogo.position.x = 0;
    walletLogo.position.y = 230;
    walletLogo.position.z = 63800;
    scene.add(walletLogo);

    //inicilizacion del logo fermat
    var geometryPlanofermat = new THREE.PlaneGeometry(950, 300);

    var textureFermat = new THREE.ImageUtils.loadTexture("images/fermatlogo.png");
    textureFermat.minFilter = THREE.NearestFilter;

    var materialPlanofermat = new THREE.MeshBasicMaterial({ map: textureFermat, side: THREE.FrontSide, transparent: true, opacity: 1, color: 0xffffff});

    var fermatLogo = new THREE.Mesh(geometryPlanofermat, materialPlanofermat);

    fermatLogo.position.x = 0;
    fermatLogo.position.y = -310;
    fermatLogo.position.z = 63800;
    scene.add(fermatLogo);
    
    /**
     * @author Emmanuel Colina
     * It provides a fade to logo(wallet)
     * @param {Number} [duration=2000] Duration of the delay
     */
    this.animatefadeWalletlogo = function (duration){
        var _duration = duration || 2000;

        tween1 = new TWEEN.Tween(walletLogo.material)
        .to({ opacity : 1, needsUpdate : true}, 1000)
        .delay( _duration )
        .onUpdate(render)
        
        tween2 = new TWEEN.Tween(walletLogo.material)
        .to({ opacity : 0, needsUpdate : true}, 1000)
        .delay( _duration )
        .onUpdate(render)

        tween1.chain(tween2);
        tween2.chain(tween1);

        tween1.start();
    };

    /**
     * @author Emmanuel Colina
     * repaint with opacity : 1, after of THREE.removeAll();
     * @param {Number} [duration=2000] Duration of the delay
     */

    this.animatestopWalletLogo = function (duration){
        var _duration = duration || 1000;

        tweenstop = new TWEEN.Tween(walletLogo.material)
        .to({ opacity : 1, needsUpdate : true}, 1000)
        .delay( _duration )
        .onUpdate(render)

        tweenstop.start();
    };

    /**
     * @author Emmanuel Colina
     * animate the logo(wallet)
     * @param {Number} [duration=2000] Duration of the delay
     */

    this.animateWalletopenLogo = function (duration){

        var _duration = duration || 2000;

        var tween = new TWEEN.Tween(walletLogo.position)
        tween.to({ y: 1640, z: 60000}, 2000)
        tween.delay( _duration )
        tween.easing(TWEEN.Easing.Exponential.InOut);
        tween.onUpdate(render)

        tween.start();
    };

    /**
     * @author Emmanuel Colina
     * logo(wallet) returns to the original z
     * @param {Number} [duration=2000] Duration of the delay
     */

    this.animateteWalletcloseLogo = function (duration){

        var _duration = duration || 2000;

        var tween = new TWEEN.Tween(walletLogo.position)
        tween.to({ y: 230, z: 63800}, 2500)
        tween.delay( _duration )
        tween.easing(TWEEN.Easing.Exponential.InOut);
        tween.onUpdate(render)

        tween.start();
    };
  
     /**
     * @author Emmanuel Colina
     * It provides a fade to logo(Farmat)
     * @param {Number} [duration=2000] Duration of the delay
     */

    this.animatefadeFarmatlogo = function (duration){

        var _duration = duration || 2000;

        tween1 = new TWEEN.Tween(fermatLogo.material)
        .to({ opacity : 1, needsUpdate : true}, 1000)
        .delay( _duration )
        .onUpdate(render)
        
        tween2 = new TWEEN.Tween(fermatLogo.material)
        .to({ opacity : 0, needsUpdate : true}, 1000)
        .delay( _duration )
        .onUpdate(render)

        tween1.chain(tween2);
        tween2.chain(tween1);

        tween1.start();
    };

    /**
     * @author Emmanuel Colina
     * repaint with opacity : 1, after of THREE.removeAll();
     * @param {Number} [duration=2000] Duration of the delay
     */

    this.animatestopFarmatlogo = function (duration){

        var _duration = duration || 1000;

        tweenstop = new TWEEN.Tween(fermatLogo.material)
        .to({ opacity : 1, needsUpdate : true}, 1000)
        .delay( _duration )
        .onUpdate(render)

        tweenstop.start();
    };

    /**
     * @author Emmanuel Colina
     * animate the logo(Fermat)
     * @param {Number} [duration=2000] Duration of the delay
     */

    this.animateFermatopenLogo = function (duration){

        var _duration = duration || 2000;

        var tween = new TWEEN.Tween(fermatLogo.position)
        tween.to({ y: -1800, z: 60000}, 2000)
        tween.delay( _duration )
        tween.easing(TWEEN.Easing.Exponential.InOut);
        tween.onUpdate(render)

        tween.start();
    };

    /**
     * @author Emmanuel Colina
     * logo(wallet) returns to the original z
     * @param {Number} [duration=2000] Duration of the delay
     */

    this.animateFermatcloseLogo = function (duration){

        var _duration = duration || 2000;

        var tween = new TWEEN.Tween(fermatLogo.position)
        tween.to({ y: -310, z: 63800}, 2500)
        tween.delay( _duration )
        tween.easing(TWEEN.Easing.Exponential.InOut);
        tween.onUpdate(render)

        tween.start();
    };
}
