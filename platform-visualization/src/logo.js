/**
 * @author Emmanuel Colina
 * function create a logo (wallet) and charge your textures
 */

function Walletlogo() 
{

    //Geometría del plano
    var geometryPlano = new THREE.PlaneGeometry(995, 700);

    //Textura
    var textureWallet = new THREE.ImageUtils.loadTexture("images/walletlogo.png");
    textureWallet.minFilter = THREE.NearestFilter;

    // Material y agregado la textura
    var materialPlano = new THREE.MeshBasicMaterial({ map: textureWallet, side: THREE.FrontSide, transparent: true, opacity: 1 , color:0xffffff});

    // El plano (Territorio)
    var walletLogo = new THREE.Mesh(geometryPlano, materialPlano);

    walletLogo.position.x = 0;
    walletLogo.position.y = 230;
    walletLogo.position.z = 63800;
    scene.add(walletLogo);

    /**
     * @author Emmanuel Colina
     * It provides a fade to logo(wallet)
     * @param {Number} [duration=2000] Duration of the delay
     */
    this.animatefadeWalletlogo = function (duration)
    {
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

    this.animatestopWalletLogo = function (duration)
    {
        var _duration = duration || 2000;

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

    this.animateWalletLogo = function (duration){

        var _duration = duration || 2000;

        var tween = new TWEEN.Tween(walletLogo.position)
        tween.to({ y: 1700, z: 60000, opacity : 1, needsUpdate : true}, 2000)
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

    this.animatebackteWalletLogo = function (duration){

        var _duration = duration || 2000;

        var tween = new TWEEN.Tween(walletLogo.position)
        tween.to({ y: 230, z: 63800, opacity : 1, needsUpdate : true}, 2500)
        tween.delay( _duration )
        tween.easing(TWEEN.Easing.Exponential.InOut);
        tween.onUpdate(render)

        tween.start();
    };
}

/**
 * @author Emmanuel Colina
 * function create a logo (fermat) and charge your textures(mirror)
 */

function Fermatlogo() {

    var geometryPlano = new THREE.PlaneGeometry(950, 300);

    //Textura
    var textureLogo = new THREE.ImageUtils.loadTexture("images/fermatlogo.png");
    textureLogo.minFilter = THREE.NearestFilter;

    // Material y agregado la textura
    var materialPlano = new THREE.MeshBasicMaterial({ map: textureLogo, side: THREE.FrontSide, transparent: true, opacity: 1, color: 0xffffff});

    // El plano (Territorio)
    var fermatLogo = new THREE.Mesh(geometryPlano, materialPlano);

    fermatLogo.position.x = 0;
    fermatLogo.position.y = -310;
    fermatLogo.position.z = 63800;
    scene.add(fermatLogo);

     /**
     * @author Emmanuel Colina
     * It provides a fade to logo(Farmat)
     * @param {Number} [duration=2000] Duration of the delay
     */

    this.animatefadeFarmatlogo = function (duration)
    {
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

    this.animatestopFarmatlogo = function (duration)
    {
        var _duration = duration || 2000;

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

    this.animateFermatLogo = function (duration){

        var _duration = duration || 2000;

        var tween = new TWEEN.Tween(fermatLogo.position)
        tween.to({ y: -1800, z: 60000, opacity : 1, needsUpdate : true}, 2000)
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

    this.animatebackFermatLogo = function (duration){

        var _duration = duration || 2000;

        var tween = new TWEEN.Tween(fermatLogo.position)
        tween.to({ y: -310, z: 63800, opacity : 1, needsUpdate : true}, 2500)
        tween.delay( _duration )
        tween.easing(TWEEN.Easing.Exponential.InOut);
        tween.onUpdate(render)

        tween.start();
    };
}