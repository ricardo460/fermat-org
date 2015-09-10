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
        MIN_DISTANCE = 500,
        MAX_DISTANCE = 80000;

    /**
     * private properties
     */    
    var camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
    var controls = new THREE.TrackballControls( camera, renderer.domElement );
    var focus = null;
    
    camera.position.copy( position );

    controls.rotateSpeed = ROTATE_SPEED;
    controls.noRotate = true;
    controls.minDistance = MIN_DISTANCE;
    controls.maxDistance = MAX_DISTANCE;
    controls.addEventListener( 'change', renderFunc );
    controls.position0.copy( position );
    
    // Public Methods

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
     * 
     * @method setFocus sets focus to a target given its id
     *
     * @param {Number} id       target id
     * @param {Number} duration animation duration time
     */
    this.setFocus = function( id, duration ) {
        
        TWEEN.removeAll();
        focus = id;
    
        var vec = new THREE.Vector4(0, 0, 180, 1);
        var target = objects[ id ];

        vec.applyMatrix4( target.matrix );

        new TWEEN.Tween( controls.target )
            .to( { x: target.position.x, y: target.position.y, z: target.position.z }, duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

        new TWEEN.Tween( camera.position )
            .to( { x: vec.x, y: vec.y, z: vec.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

        new TWEEN.Tween( camera.up )
            .to( { x: target.up.x, y: target.up.y, z: target.up.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

        headers.hide(duration);

        for( var i = 0, l = objects.length; i < l; i++ ) {

            if ( i == id ) continue;

            new TWEEN.Tween( objects[ i ].position )
                .to( { x: 0, y: 0, z: controls.maxDistance }, Math.random() * duration + duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();
        }
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

            changeView(lastTargets);

            new TWEEN.Tween( controls.target )
                .to( { x: controls.target0.x, y: controls.target0.y, z: controls.target0.z }, Math.random() * duration + duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();

            new TWEEN.Tween( camera.position )
                .to( { x: controls.position0.x, y: controls.position0.y, z: controls.position0.z }, Math.random() * duration + duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();

            new TWEEN.Tween( camera.up )
                .to( { x: 0, y: 1, z: 0 }, Math.random() * duration + duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();
        }
    };
    
    /**
     *
     * @method update    updates camera controls  
     *
     */
    this.update = function() {        
        controls.update();
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
    
    // Events
    window.addEventListener( 'resize', this.onWindowResize, false );
    window.addEventListener( 'keydown', this.onKeyDown, false );
}
/*var testContent = [
        //CRY
        "pip-plugin-crypto vault-bitcoin",
        "pip-plugin-crypto network-bitcoin",
        "pip-plugin-crypto module-actor address book",
        "pip-plugin-crypto module-wallet address book",
        "pip-plugin-crypto router-incoming crypto",

        //OSA
        "pip-addon-android-database system",
        "pip-addon-android-file system",
        "pip-addon-android-device connectivity",
        "pip-addon-android-device power",
        "pip-addon-android-logger",


        "pip-addon-platform service-event manager",
        "pip-addon-platform service-error manager",
        "pip-addon-platform service-location subsystem",
        "pip-addon-hardware-local device",
        "pip-addon-hardware-remote device",
        "pip-addon-user-device user",
        "pip-android-sub app-developer",
        "pip-android-sub app-sub app manager",
        "pip-plugin-actor-developer",
        "pip-plugin-identity-developer",
        "pip-plugin-module-developer",
        "pip-plugin-network service-subapp resources",

        //P2P
        "pip-plugin-communication-cloud client",
        "pip-plugin-communication-cloud server",


        "dmp-plugin-identity-intra user",
        "dmp-plugin-actor-extra user",
        "dmp-plugin-transaction incoming-devide user",
        "dmp-plugin-transaction incoming-extra user",
        "dmp-plugin-transaction incoming-intra user",
        "dmp-plugin-transaction inter-wallet",
        "dmp-plugin-transaction outgoing-devide user",
        "dmp-plugin-transaction outgoing-extra user",
        "dmp-plugin-transaction outgoing-intra user",
        "dmp-plugin-niche wallet type-bank notes wallet",
        "dmp-plugin-niche wallet type-crypto loss protected wallet",
        "dmp-plugin-niche wallet type-crypto wallet",
        "dmp-plugin-niche wallet type-discount wallet",
        "dmp-plugin-niche wallet type-fiat over crypto",
        "dmp-plugin-niche wallet type-fiat over crypto loss protected wallet",
        "dmp-plugin-niche wallet type-multi account wallet",
        "dmp-plugin-network service-bank notes",
        "dmp-plugin-network service-crypto addresses",
        "dmp-plugin-network service-money",
        "dmp-plugin-network service-intra user",
        "dmp-plugin-network service-money request",
        "dmp-plugin-network service-wallet community",
        "dmp-plugin-network service-wallet resources",
        "dmp-plugin-network service-wallet store",
        "dmp-plugin-network service-wallet statistics",
        "dmp-plugin-module-wallet factory",
        "dmp-plugin-module-wallet manager",
        "dmp-plugin-module-wallet publisher",
        "dmp-plugin-module-wallet store",
        "dmp-plugin-engine-sub app runtime",
        "dmp-plugin-engine-wallet runtime",
        "dmp-plugin-middleware-bank notes",
        "dmp-plugin-middleware-money request",
        "dmp-plugin-middleware-wallet contacts",
        "dmp-plugin-composite wallet-multi account wallet",
        "dmp-plugin-basic wallet-bitcoin wallet",
        "dmp-plugin-basic wallet-discount wallet",
        "dmp-plugin-middleware-wallet skin",
        "dmp-plugin-middleware-wallet language",
        "dmp-plugin-middleware-wallet factory",
        "dmp-plugin-middleware-wallet store",
        "dmp-plugin-middleware-wallet publisher",
        "dmp-plugin-middleware-wallet manager",
        "dmp-plugin-middleware-wallet settings",
        "dmp-addon-license-wallet",
        "dmp-android-reference-niche wallet-bitcoin-wallet",
        "dmp-android-sub app-wallet manager",
        "dmp-android-sub app-wallet store",
        "dmp-android-sub app-wallet factory",
        "dmp-android-sub app-wallet publisher",
        "dmp-android-sub app-shop manager"
    ];*/


var testData = '{"groups":[{"code":"COR","name":"Core And Api","logo":"COR_logo.png","index":0},{"code":"PIP","name":"Plug-ins Platform","logo":"PIP_logo.png","index":1},{"code":"WPD","name":"Wallet Production and Distribution","logo":"WPD_logo.png","index":2},{"code":"CCP","name":"Crypto Currency Platform","logo":"CCP_logo.png","index":3},{"code":"CCM","name":"Crypto Commodity Money","logo":"CCM_logo.png","index":4},{"code":"BNP","name":"Bank Notes Platform","logo":"BNP_logo.png","index":5},{"code":"SHP","name":"Shopping Platform","logo":"SHP_logo.png","index":6},{"code":"DAP","name":"Digital Asset Platform","logo":"DAP_logo.png","index":7},{"code":"MKT","name":"Marketing Platform","logo":"MKT_logo.png","index":8},{"code":"CBP","name":"Crypto Broker Platform","logo":"CBP_logo.png","index":9},{"code":"CDN","name":"Crypto Distribution Netword","logo":"CDN_logo.png","index":10},{"code":"DPN","name":"Device Private Network","logo":"DPN_logo.png","index":11}],"layers":[{"name":"Core","index":0,"super_layer":false},{"name":"Niche Wallet","index":1,"super_layer":false},{"name":"Reference Wallet","index":2,"super_layer":false},{"name":"Sub App","index":3,"super_layer":false},{"name":"Desktop","index":4,"super_layer":false},{"name":"empty layer 1","index":5,"super_layer":false},{"name":"Engine","index":6,"super_layer":false},{"name":"Wallet Module","index":7,"super_layer":false},{"name":"Sub App Module","index":8,"super_layer":false},{"name":"Desktop Module","index":9,"super_layer":false},{"name":"Agent","index":10,"super_layer":false},{"name":"Actor","index":11,"super_layer":false},{"name":"Middleware","index":12,"super_layer":false},{"name":"Request","index":13,"super_layer":false},{"name":"Business Transaction","index":14,"super_layer":false},{"name":"Digital Asset Transaction","index":15,"super_layer":false},{"name":"Digital Money Transaction","index":16,"super_layer":false},{"name":"Cash Transaction","index":17,"super_layer":false},{"name":"Contract","index":18,"super_layer":false},{"name":"Composite Wallet","index":19,"super_layer":false},{"name":"Wallet","index":20,"super_layer":false},{"name":"World","index":21,"super_layer":false},{"name":"Identity","index":22,"super_layer":false},{"name":"Actor Network Service","index":23,"super_layer":false},{"name":"Network Service","index":24,"super_layer":false},{"name":"empty layer 2","index":25,"super_layer":false},{"name":"","index":26,"super_layer":false},{"name":"Communication","index":27,"super_layer":true},{"name":"empty layer 3","index":28,"super_layer":false},{"name":"Crypto Router","index":29,"super_layer":true},{"name":"Crypto Module","index":30,"super_layer":true},{"name":"Crypto Vault","index":31,"super_layer":true},{"name":"Crypto Network","index":32,"super_layer":true},{"name":"empty layer 4","index":33,"super_layer":false},{"name":"License","index":34,"super_layer":false},{"name":"Plugin","index":35,"super_layer":false},{"name":"User","index":36,"super_layer":false},{"name":"Hardware","index":37,"super_layer":false},{"name":"Platform Service","index":38,"super_layer":false},{"name":"empty layer 5","index":39,"super_layer":false},{"name":"Multi OS","index":40,"super_layer":true},{"name":"Android","index":41,"super_layer":true},{"name":"Api","index":42,"super_layer":false}],"plugins":[{"name":"Fermat Core","description":"","code_level":"development","layer":"Core","difficulty":10,"type":"Library","group":"COR","authorName":"Luis-Fernando-Molina","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9479367?v=3","authorRealName":"Luis Fernando Molina","authorEmail":"","life_cycle":[{"name":"Concept","reached":"2015-06-01","target":""},{"name":"Development","reached":"2015-08-20","target":"2015-09-01"},{"name":"QA","reached":"2015-09-15","target":"2015-09-20"},{"name":"Production","reached":"2015-09-25","target":"2015-10-01"}]},{"name":"Android Core","description":"","code_level":"development","layer":"Core","difficulty":10,"type":"Library","group":"COR","authorName":"Luis-Fernando-Molina","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9479367?v=3","authorRealName":"Luis Fernando Molina","authorEmail":"","life_cycle":[{"name":"Concept","reached":"2015-06-01","target":""},{"name":"Development","reached":"2015-09-20","target":"2015-10-01"},{"name":"QA","reached":"2015-09-15","target":"2015-10-20"},{"name":"Production","reached":"2015-09-25","target":"2015-10-01"}]},{"name":"OSA Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"BCH Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"P2P Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"DPN Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"PIP Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"DMP Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"WPD Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"DAP Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"MKT Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"CDN Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"Cloud Client","description":"","code_level":"production","layer":"Communication","difficulty":10,"type":"Plugin","authorName":"jorgeejgonzalez","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/2023125?v=3","authorRealName":"Jorge Gonzalez","authorEmail":"jorgeejgonzalez@gmail.com"},{"name":"Cloud Server","description":"","code_level":"production","layer":"Communication","difficulty":10,"type":"Plugin","authorName":"jorgeejgonzalez","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/2023125?v=3","authorRealName":"Jorge Gonzalez","authorEmail":"jorgeejgonzalez@gmail.com"},{"name":"P2P","description":"","code_level":"concept","layer":"Communication","difficulty":0,"type":"Plugin"},{"name":"Geo Fenced P2P","description":"","code_level":"concept","layer":"Communication","difficulty":0,"type":"Plugin"},{"name":"Wifi","description":"","code_level":"concept","layer":"Communication","difficulty":0,"type":"Plugin"},{"name":"Bluetooth","description":"","code_level":"concept","layer":"Communication","difficulty":0,"type":"Plugin"},{"name":"NFC","description":"","code_level":"concept","layer":"Communication","difficulty":0,"type":"Plugin"},{"name":"Mesh","description":"","code_level":"concept","layer":"Communication","difficulty":0,"type":"Plugin"},{"name":"Incomming Crypto","description":"","code_level":"production","layer":"Crypto Router","difficulty":10,"type":"Plugin","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Outgoing Crypto","description":"","code_level":"concept","layer":"Crypto Router","difficulty":0,"type":"Plugin"},{"name":"Actor Address Book","description":"","code_level":"production","layer":"Crypto Module","difficulty":5,"type":"Plugin","authorName":"lnacosta","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/7293791?v=3","authorRealName":"Le\u00f3n","authorEmail":""},{"name":"Wallet Address Book","description":"","code_level":"production","layer":"Crypto Module","difficulty":5,"type":"Plugin","authorName":"lnacosta","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/7293791?v=3","authorRealName":"Le\u00f3n","authorEmail":""},{"name":"Bitcoin Currency","description":"","code_level":"development","layer":"Crypto Vault","difficulty":10,"type":"Plugin","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Assets Over Bitcoin","description":"","code_level":"development","layer":"Crypto Vault","difficulty":10,"type":"Plugin","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Litecoin","description":"","code_level":"concept","layer":"Crypto Vault","difficulty":0,"type":"Plugin"},{"name":"Ripple","description":"","code_level":"concept","layer":"Crypto Vault","difficulty":0,"type":"Plugin"},{"name":"Ethereum","description":"","code_level":"concept","layer":"Crypto Vault","difficulty":0,"type":"Plugin"},{"name":"Bitcoin","description":"","code_level":"development","layer":"Crypto Network","difficulty":10,"type":"Plugin","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Litecoin","description":"","code_level":"concept","layer":"Crypto Network","difficulty":0,"type":"Plugin"},{"name":"Ripple","description":"","code_level":"concept","layer":"Crypto Network","difficulty":0,"type":"Plugin"},{"name":"Ethereum","description":"","code_level":"concept","layer":"Crypto Network","difficulty":0,"type":"Plugin"},{"name":"File System","description":"Is the interface between the OS specific File System and the platform components that need to consume file system services","code_level":"production","layer":"Multi OS","difficulty":3,"type":"Addon","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Database System","description":"Is a wrapper designed to isolate the rest of the components from the OS dependent Database System","code_level":"production","layer":"Multi OS","difficulty":5,"type":"Addon","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"File System","description":"Is the interface between the OS specific File System and the platform components that need to consume file system services","code_level":"production","layer":"Android","difficulty":3,"type":"Addon","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Database System","description":"Is a wrapper designed to isolate the rest of the components from the OS dependent Database System","code_level":"production","layer":"Android","difficulty":5,"type":"Addon","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Logger","description":"","code_level":"production","layer":"Android","difficulty":4,"type":"Addon","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Device Location","description":"","code_level":"development","layer":"Android","difficulty":4,"type":"Addon","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Device Connectivity","description":"","code_level":"concept","layer":"Android","difficulty":0,"type":"Addon"},{"name":"Device Power","description":"","code_level":"concept","layer":"Android","difficulty":0,"type":"Addon"},{"name":"Device Contacts","description":"","code_level":"concept","layer":"Android","difficulty":0,"type":"Addon"},{"name":"Device Hardware","description":"","code_level":"concept","layer":"Android","difficulty":0,"type":"Addon","life_cycle":[{"name":"Concept","reached":"2015-06-01","target":""},{"name":"Development","reached":"2015-07-01","target":"2015-09-01"},{"name":"QA","reached":"2015-07-01","target":"2015-09-01"},{"name":"Production","reached":"2015-07-01","target":"2015-09-01"}]},{"name":"Fermat Api","description":"","code_level":"development","layer":"Api","difficulty":10,"type":"Library","group":"COR","authorName":"Luis-Fernando-Molina","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9479367?v=3","authorRealName":"Luis Fernando Molina","authorEmail":"","life_cycle":[{"name":"Concept","reached":"2015-05-01","target":""},{"name":"Development","reached":"2015-05-20","target":"2015-06-01"},{"name":"QA","reached":"2015-08-15","target":"2015-07-20"},{"name":"Production","reached":"2015-09-25","target":"2015-10-01"}]},{"name":"Android Api","description":"","code_level":"development","layer":"Api","difficulty":10,"type":"Library","group":"COR"},{"name":"OSA Api","description":"","code_level":"concept","layer":"Api","difficulty":0,"type":"Library","group":"COR"},{"name":"BCH Api","description":"","code_level":"development","layer":"Api","difficulty":10,"type":"Library","group":"COR","authorName":"Luis-Fernando-Molina","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9479367?v=3","authorRealName":"Luis Fernando Molina","authorEmail":"","life_cycle":[{"name":"Concept","reached":"2015-04-01","target":""},{"name":"Development","reached":"2015-05-20","target":"2015-05-01"},{"name":"QA","reached":"2015-05-15","target":"2015-06-20"},{"name":"Production","reached":"2015-09-25","target":"2015-10-01"}]},{"name":"P2P Api","description":"","code_level":"development","layer":"Api","difficulty":10,"type":"Library","group":"COR","authorName":"Luis-Fernando-Molina","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9479367?v=3","authorRealName":"Luis Fernando Molina","authorEmail":""},{"name":"DPN Api","description":"","code_level":"concept","layer":"Api","difficulty":0,"type":"Library","group":"COR"},{"name":"PIP Api","description":"","code_level":"development","layer":"Api","difficulty":10,"type":"Library","group":"COR","authorName":"Luis-Fernando-Molina","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9479367?v=3","authorRealName":"Luis Fernando Molina","authorEmail":""},{"name":"DMP Api","description":"","code_level":"concept","layer":"Api","difficulty":0,"type":"Library","group":"COR"},{"name":"WPD Api","description":"","code_level":"concept","layer":"Api","difficulty":0,"type":"Library","group":"COR"},{"name":"DAP Api","description":"","code_level":"concept","layer":"Api","difficulty":0,"type":"Library","group":"COR"},{"name":"MKT Api","description":"","code_level":"concept","layer":"Api","difficulty":0,"type":"Library","group":"COR"},{"name":"CDN Api","description":"","code_level":"concept","layer":"Api","difficulty":0,"type":"Library","group":"COR"},{"name":"Shell","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"PIP"},{"name":"Designer","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"PIP"},{"name":"Developer","description":"","code_level":"production","layer":"Sub App","difficulty":5,"type":"Android","group":"PIP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Technical Support","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"PIP"},{"name":"System Monitor","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"PIP"},{"name":"Feedback","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"PIP"},{"name":"Reviews","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"PIP"},{"name":"Sub App Manager","description":"","code_level":"production","layer":"Desktop","difficulty":3,"type":"Android","group":"PIP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Sub App Runtime","description":"","code_level":"development","layer":"Engine","difficulty":8,"type":"Plugin","group":"PIP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Shell","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Designer","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Developer","description":"","code_level":"production","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"PIP","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Technical Support","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"System Monitor","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Feedback","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Reviews","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Sub App Manager","description":"","code_level":"development","layer":"Desktop Module","difficulty":4,"type":"Plugin","group":"PIP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Developer","description":"","code_level":"production","layer":"Actor","difficulty":6,"type":"Plugin","group":"PIP","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Designer","description":"","code_level":"concept","layer":"Actor","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Intra User Technical Support","description":"","code_level":"concept","layer":"Middleware","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Developer Technical Support","description":"","code_level":"concept","layer":"Middleware","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Developer Error Manager","description":"","code_level":"concept","layer":"Middleware","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Sub App Settings","description":"","code_level":"development","layer":"Middleware","difficulty":2,"type":"Plugin","group":"PIP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Notification","description":"","code_level":"development","layer":"Middleware","difficulty":6,"type":"Plugin","group":"PIP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Location","description":"","code_level":"concept","layer":"World","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Developer","description":"","code_level":"production","layer":"Identity","difficulty":1,"type":"Plugin","group":"PIP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Designer","description":"","code_level":"concept","layer":"Identity","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Developer","description":"","code_level":"concept","layer":"Actor Network Service","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Sub App Resources","description":"","code_level":"development","layer":"Network Service","difficulty":8,"type":"Plugin","group":"PIP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"System Monitor","description":"","code_level":"concept","layer":"Network Service","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Error Manager","description":"","code_level":"concept","layer":"Network Service","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Messanger","description":"","code_level":"concept","layer":"Network Service","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Technical Support","description":"","code_level":"concept","layer":"Network Service","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Plugin","description":"","code_level":"concept","layer":"License","difficulty":0,"type":"Addon","group":"PIP"},{"name":"Identity","description":"","code_level":"concept","layer":"Plugin","difficulty":0,"type":"Addon","group":"PIP"},{"name":"Dependency","description":"","code_level":"concept","layer":"Plugin","difficulty":0,"type":"Addon","group":"PIP"},{"name":"Device User","description":"","code_level":"concept","layer":"User","difficulty":0,"type":"Addon","group":"PIP"},{"name":"Local Device","description":"","code_level":"concept","layer":"Hardware","difficulty":0,"type":"Addon","group":"PIP"},{"name":"Device Network","description":"","code_level":"concept","layer":"Hardware","difficulty":0,"type":"Addon","group":"PIP"},{"name":"Error Manager","description":"","code_level":"production","layer":"Platform Service","difficulty":4,"type":"Addon","group":"PIP","authorName":"jorgeejgonzalez","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/2023125?v=3","authorRealName":"Jorge Gonzalez","authorEmail":"jorgeejgonzalez@gmail.com"},{"name":"Event Manager","description":"","code_level":"production","layer":"Platform Service","difficulty":8,"type":"Addon","group":"PIP","authorName":"Luis-Fernando-Molina","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9479367?v=3","authorRealName":"Luis Fernando Molina","authorEmail":""},{"name":"Connectivity Subsystem","description":"","code_level":"concept","layer":"Platform Service","difficulty":0,"type":"Addon","group":"PIP"},{"name":"Location Subsystem","description":"","code_level":"concept","layer":"Platform Service","difficulty":0,"type":"Addon","group":"PIP"},{"name":"Power Subsystem","description":"","code_level":"concept","layer":"Platform Service","difficulty":0,"type":"Addon","group":"PIP"},{"name":"Platform Info","description":"","code_level":"concept","layer":"Platform Service","difficulty":0,"type":"Addon","group":"PIP","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Wallet Factory","description":"","code_level":"development","layer":"Sub App","difficulty":10,"type":"Android","group":"WPD","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Wallet Publisher","description":"","code_level":"development","layer":"Sub App","difficulty":6,"type":"Android","group":"WPD","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Wallet Store","description":"","code_level":"development","layer":"Sub App","difficulty":8,"type":"Android","group":"WPD","authorName":"nelsonalfo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/1823627?v=3","authorRealName":"Nelson Ramirez","authorEmail":"nelsonalfo@gmail.com"},{"name":"Wallet Manager","description":"","code_level":"development","layer":"Desktop","difficulty":4,"type":"Android","group":"WPD","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Wallet Runtime","description":"","code_level":"production","layer":"Engine","difficulty":8,"type":"Plugin","group":"WPD","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Wallet Factory","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"WPD","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Wallet Publisher","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"WPD","authorName":"Rart3001","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/12099493?v=3","authorRealName":"Roberto Requena","authorEmail":""},{"name":"Wallet Store","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"WPD","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Wallet Manager","description":"","code_level":"development","layer":"Desktop Module","difficulty":4,"type":"Plugin","group":"WPD","authorName":"darkestpriest","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10060413?v=3","authorRealName":"Manuel P\u00e9rez","authorEmail":"darkpriestrelative@gmail.com"},{"name":"Publisher","description":"","code_level":"development","layer":"Actor","difficulty":6,"type":"Plugin","group":"WPD","authorName":"Rart3001","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/12099493?v=3","authorRealName":"Roberto Requena","authorEmail":""},{"name":"Wallet Manager","description":"","code_level":"production","layer":"Middleware","difficulty":8,"type":"Plugin","group":"WPD","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Wallet Factory","description":"","code_level":"development","layer":"Middleware","difficulty":10,"type":"Plugin","group":"WPD","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Wallet Store","description":"","code_level":"development","layer":"Middleware","difficulty":6,"type":"Plugin","group":"WPD","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Wallet Settings","description":"","code_level":"development","layer":"Middleware","difficulty":3,"type":"Plugin","group":"WPD","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Publisher","description":"","code_level":"development","layer":"Identity","difficulty":4,"type":"Plugin","group":"WPD","authorName":"nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Wallet Resources","description":"","code_level":"development","layer":"Network Service","difficulty":8,"type":"Plugin","group":"WPD","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Wallet Store","description":"Enables searching for Intra Users and conecting one to the other","code_level":"development","layer":"Network Service","difficulty":8,"type":"Plugin","group":"WPD","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Wallet Statistics","description":"","code_level":"concept","layer":"Network Service","difficulty":0,"type":"Plugin","group":"WPD"},{"name":"Wallet Community","description":"","code_level":"concept","layer":"Network Service","difficulty":0,"type":"Plugin","group":"WPD"},{"name":"Wallet","description":"","code_level":"concept","layer":"License","difficulty":0,"type":"Addon","group":"WPD"},{"name":"Bitcoin Wallet","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"CCP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Bitcoin Loss Protected","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"CCP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Intra User","description":"","code_level":"development","layer":"Sub App","difficulty":4,"type":"Android","group":"CCP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Extra User","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"CCP"},{"name":"Crypto Wallet","description":"","code_level":"development","layer":"Wallet Module","difficulty":3,"type":"Plugin","group":"CCP","authorName":"lnacosta","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/7293791?v=3","authorRealName":"Le\u00f3n","authorEmail":""},{"name":"Intra User","description":"","code_level":"development","layer":"Sub App Module","difficulty":2,"type":"Plugin","group":"CCP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Extra User","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"CCP"},{"name":"Intra User","description":"","code_level":"development","layer":"Actor","difficulty":4,"type":"Plugin","group":"CCP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Extra User","description":"","code_level":"production","layer":"Actor","difficulty":4,"type":"Plugin","group":"CCP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Wallet Contacts","description":"","code_level":"development","layer":"Middleware","difficulty":6,"type":"Plugin","group":"CCP","authorName":"lnacosta","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/7293791?v=3","authorRealName":"Le\u00f3n","authorEmail":""},{"name":"Crypto Request","description":"","code_level":"development","layer":"Request","difficulty":8,"type":"Plugin","group":"CCP","authorName":"lnacosta","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/7293791?v=3","authorRealName":"Le\u00f3n","authorEmail":""},{"name":"Incoming Device User","description":"","code_level":"concept","layer":"Digital Money Transaction","difficulty":1,"type":"Plugin","group":"CCP"},{"name":"Incoming Extra User","description":"","code_level":"production","layer":"Digital Money Transaction","difficulty":10,"type":"Plugin","group":"CCP","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Incoming Intra User","description":"","code_level":"development","layer":"Digital Money Transaction","difficulty":10,"type":"Plugin","group":"CCP","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Intra Wallet","description":"","code_level":"concept","layer":"Digital Money Transaction","difficulty":0,"type":"Plugin","group":"CCP"},{"name":"Outgoing Device User","description":"","code_level":"concept","layer":"Digital Money Transaction","difficulty":0,"type":"Plugin","group":"CCP"},{"name":"Outgoing Extra User","description":"","code_level":"production","layer":"Digital Money Transaction","difficulty":10,"type":"Plugin","group":"CCP","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Outgoing Intra User","description":"","code_level":"development","layer":"Digital Money Transaction","difficulty":10,"type":"Plugin","group":"CCP","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Inter Account","description":"","code_level":"concept","layer":"Digital Money Transaction","difficulty":0,"type":"Plugin","group":"CCP"},{"name":"Multi Account","description":"","code_level":"concept","layer":"Composite Wallet","difficulty":0,"type":"Plugin","group":"CCP"},{"name":"Bitcoin Wallet","description":"","code_level":"production","layer":"Wallet","difficulty":4,"type":"Plugin","group":"CCP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Bitcoin Loss Protected","description":"","code_level":"development","layer":"Wallet","difficulty":8,"type":"Plugin","group":"CCP","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Crypto Index","description":"","code_level":"development","layer":"World","difficulty":8,"type":"Plugin","group":"CCP","authorName":"laderuner","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/3421830?v=3","authorRealName":"Francisco Javier Arce","authorEmail":"sonnik42@hotmail.com"},{"name":"Blockchain Info","description":"","code_level":"concept","layer":"World","difficulty":0,"type":"Plugin","group":"CCP"},{"name":"Coinapult","description":"","code_level":"concept","layer":"World","difficulty":0,"type":"Plugin","group":"CCP"},{"name":"Shape Shift","description":"","code_level":"concept","layer":"World","difficulty":0,"type":"Plugin","group":"CCP"},{"name":"Coinbase","description":"","code_level":"concept","layer":"World","difficulty":0,"type":"Plugin","group":"CCP"},{"name":"Intra User","description":"","code_level":"development","layer":"Identity","difficulty":4,"type":"Plugin","group":"CCP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Intra User","description":"Enables searching for Intra Users and conecting one to the other","code_level":"development","layer":"Actor Network Service","difficulty":6,"type":"Plugin","group":"CCP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Crypto Address","description":"Enables the underground exchange of crypto addresses","code_level":"development","layer":"Network Service","difficulty":5,"type":"Plugin","group":"CCP","authorName":"lnacosta","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/7293791?v=3","authorRealName":"Le\u00f3n","authorEmail":""},{"name":"Crypto Request","description":"","code_level":"development","layer":"Network Service","difficulty":8,"type":"Plugin","group":"CCP","authorName":"lnacosta","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/7293791?v=3","authorRealName":"Le\u00f3n","authorEmail":""},{"name":"Crypto Transmission","description":"","code_level":"development","layer":"Network Service","difficulty":8,"type":"Plugin","group":"CCP","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Crypto Commodity Money","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"CCM","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Discount Wallet","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"CCM","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Money Request","description":"","code_level":"development","layer":"Request","difficulty":8,"type":"Plugin","group":"CCM","authorName":"lnacosta","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/7293791?v=3","authorRealName":"Le\u00f3n","authorEmail":""},{"name":"Incoming Device User","description":"","code_level":"concept","layer":"Digital Money Transaction","difficulty":1,"type":"Plugin","group":"CCM"},{"name":"Incoming Extra User","description":"","code_level":"production","layer":"Digital Money Transaction","difficulty":10,"type":"Plugin","group":"CCM","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Incoming Intra User","description":"","code_level":"development","layer":"Digital Money Transaction","difficulty":10,"type":"Plugin","group":"CCM","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Intra Wallet","description":"","code_level":"concept","layer":"Digital Money Transaction","difficulty":0,"type":"Plugin","group":"CCM"},{"name":"Outgoing Device User","description":"","code_level":"concept","layer":"Digital Money Transaction","difficulty":0,"type":"Plugin","group":"CCM"},{"name":"Outgoing Extra User","description":"","code_level":"production","layer":"Digital Money Transaction","difficulty":10,"type":"Plugin","group":"CCM","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Outgoing Intra User","description":"","code_level":"development","layer":"Digital Money Transaction","difficulty":10,"type":"Plugin","group":"CCM","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Inter Account","description":"","code_level":"concept","layer":"Digital Money Transaction","difficulty":0,"type":"Plugin","group":"CCM"},{"name":"Multi Account","description":"","code_level":"concept","layer":"Composite Wallet","difficulty":0,"type":"Plugin","group":"CCM"},{"name":"Crypto Commodity Money","description":"","code_level":"development","layer":"Wallet","difficulty":4,"type":"Plugin","group":"CCM","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Discount Wallet","description":"","code_level":"development","layer":"Wallet","difficulty":10,"type":"Plugin","group":"CCM","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Money Request","description":"","code_level":"development","layer":"Network Service","difficulty":8,"type":"Plugin","group":"CCM","authorName":"lnacosta","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/7293791?v=3","authorRealName":"Le\u00f3n","authorEmail":""},{"name":"Money Transmission","description":"","code_level":"development","layer":"Network Service","difficulty":5,"type":"Plugin","group":"CCM","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Bank Notes","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":0,"type":"Android","group":"BNP"},{"name":"Bank Notes Wallet","description":"","code_level":"concept","layer":"Wallet Module","difficulty":0,"type":"Plugin","group":"BNP"},{"name":"Bank Notes","description":"","code_level":"concept","layer":"Middleware","difficulty":0,"type":"Plugin","group":"BNP"},{"name":"Bank Notes","description":"","code_level":"concept","layer":"Wallet","difficulty":4,"type":"Plugin","group":"BNP"},{"name":"Bank Notes","description":"","code_level":"concept","layer":"Network Service","difficulty":0,"type":"Plugin","group":"BNP"},{"name":"Shop Wallet","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":0,"type":"Android","group":"SHP"},{"name":"Brand Wallet","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":0,"type":"Android","group":"SHP"},{"name":"Retailer Wallet","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":0,"type":"Android","group":"SHP"},{"name":"Shop","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"SHP"},{"name":"Brand","description":"","code_level":"development","layer":"Sub App","difficulty":6,"type":"Android","group":"SHP","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Retailer","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"SHP"},{"name":"Shop Wallet","description":"","code_level":"concept","layer":"Wallet Module","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Brand Wallet","description":"","code_level":"concept","layer":"Wallet Module","difficulty":3,"type":"Plugin","group":"SHP"},{"name":"Retailer Wallet","description":"","code_level":"concept","layer":"Wallet Module","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Shop","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Brand","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"SHP","authorName":"nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Retailer","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Shop","description":"","code_level":"concept","layer":"Actor","difficulty":0,"type":"Plugin","group":"SHP","authorName":"Rart3001","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/12099493?v=3","authorRealName":"Roberto Requena","authorEmail":""},{"name":"Brand","description":"","code_level":"development","layer":"Actor","difficulty":4,"type":"Plugin","group":"SHP"},{"name":"Retailer","description":"","code_level":"concept","layer":"Actor","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Purchase","description":"","code_level":"concept","layer":"Digital Money Transaction","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Sale","description":"","code_level":"concept","layer":"Digital Money Transaction","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Shop Wallet","description":"","code_level":"concept","layer":"Wallet","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Brand Wallet","description":"","code_level":"concept","layer":"Wallet","difficulty":4,"type":"Plugin","group":"SHP"},{"name":"Retailer Wallet","description":"","code_level":"concept","layer":"Wallet","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Shop","description":"","code_level":"concept","layer":"Identity","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Brand","description":"","code_level":"development","layer":"Identity","difficulty":4,"type":"Plugin","group":"SHP","authorName":"Nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Retailer","description":"","code_level":"concept","layer":"Identity","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Shop","description":"","code_level":"concept","layer":"Actor Network Service","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Brand","description":"","code_level":"concept","layer":"Actor Network Service","difficulty":4,"type":"Plugin","group":"SHP"},{"name":"Retailer","description":"","code_level":"concept","layer":"Actor Network Service","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Purchase Transmission","description":"","code_level":"concept","layer":"Network Service","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Asset Issuer","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"DAP","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Asset User","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"DAP","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Redeem Point","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"DAP","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Asset Issuer","description":"","code_level":"development","layer":"Sub App","difficulty":4,"type":"Android","group":"DAP","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Asset User","description":"","code_level":"development","layer":"Sub App","difficulty":4,"type":"Android","group":"DAP","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Redeem Point","description":"","code_level":"development","layer":"Sub App","difficulty":4,"type":"Android","group":"DAP","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Asset Issuer","description":"","code_level":"development","layer":"Wallet Module","difficulty":3,"type":"Plugin","group":"DAP","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Asset User","description":"","code_level":"development","layer":"Wallet Module","difficulty":3,"type":"Plugin","group":"DAP","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Redeem Point","description":"","code_level":"development","layer":"Wallet Module","difficulty":3,"type":"Plugin","group":"DAP","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Asset Issuer","description":"","code_level":"development","layer":"Sub App Module","difficulty":2,"type":"Plugin","group":"DAP","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Asset User","description":"","code_level":"development","layer":"Sub App Module","difficulty":2,"type":"Plugin","group":"DAP","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Redeem Point","description":"","code_level":"development","layer":"Sub App Module","difficulty":2,"type":"Plugin","group":"DAP","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Asset Issuer","description":"","code_level":"development","layer":"Actor","difficulty":4,"type":"Plugin","group":"DAP"},{"name":"Asset User","description":"","code_level":"development","layer":"Actor","difficulty":4,"type":"Plugin","group":"DAP"},{"name":"Redeem Point","description":"","code_level":"development","layer":"Actor","difficulty":4,"type":"Plugin","group":"DAP"},{"name":"Incoming Device User","description":"","code_level":"concept","layer":"Digital Asset Transaction","difficulty":0,"type":"Plugin","group":"DAP"},{"name":"Incoming Extra User","description":"","code_level":"concept","layer":"Digital Asset Transaction","difficulty":0,"type":"Plugin","group":"DAP"},{"name":"Incoming Intra User","description":"","code_level":"concept","layer":"Digital Asset Transaction","difficulty":0,"type":"Plugin","group":"DAP"},{"name":"Incoming Issuer","description":"","code_level":"development","layer":"Digital Asset Transaction","difficulty":10,"type":"Plugin","group":"DAP","authorName":"darkestpriest","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10060413?v=3","authorRealName":"Manuel P\u00e9rez","authorEmail":"darkpriestrelative@gmail.com"},{"name":"Intra Wallet","description":"","code_level":"concept","layer":"Digital Asset Transaction","difficulty":0,"type":"Plugin","group":"DAP"},{"name":"Outgoing Device User","description":"","code_level":"concept","layer":"Digital Asset Transaction","difficulty":0,"type":"Plugin","group":"DAP"},{"name":"Outgoing Extra User","description":"","code_level":"concept","layer":"Digital Asset Transaction","difficulty":0,"type":"Plugin","group":"DAP"},{"name":"Outgoing Intra User","description":"","code_level":"development","layer":"Digital Asset Transaction","difficulty":10,"type":"Plugin","group":"DAP","authorName":"darkestpriest","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10060413?v=3","authorRealName":"Manuel P\u00e9rez","authorEmail":"darkpriestrelative@gmail.com"},{"name":"Outgoing Issuer","description":"","code_level":"development","layer":"Digital Asset Transaction","difficulty":10,"type":"Plugin","group":"DAP","authorName":"darkestpriest","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10060413?v=3","authorRealName":"Manuel P\u00e9rez","authorEmail":"darkpriestrelative@gmail.com"},{"name":"Inter Account","description":"","code_level":"concept","layer":"Digital Asset Transaction","difficulty":0,"type":"Plugin","group":"DAP"},{"name":"Asset Issuing","description":"","code_level":"development","layer":"Digital Asset Transaction","difficulty":10,"type":"Plugin","group":"DAP","authorName":"darkestpriest","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10060413?v=3","authorRealName":"Manuel P\u00e9rez","authorEmail":"darkpriestrelative@gmail.com"},{"name":"Assets Issuer Wallet","description":"","code_level":"development","layer":"Wallet","difficulty":4,"type":"Plugin","group":"DAP","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Assets User Wallet","description":"","code_level":"development","layer":"Wallet","difficulty":4,"type":"Plugin","group":"DAP","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Redeem Point Wallet","description":"","code_level":"development","layer":"Wallet","difficulty":4,"type":"Plugin","group":"DAP","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Asset Issuer","description":"","code_level":"development","layer":"Identity","difficulty":4,"type":"Plugin","group":"DAP","authorName":"Nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Asset User","description":"","code_level":"development","layer":"Identity","difficulty":4,"type":"Plugin","group":"DAP","authorName":"Nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Redeem Point","description":"","code_level":"development","layer":"Identity","difficulty":4,"type":"Plugin","group":"DAP","authorName":"Nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Asset Issuer","description":"","code_level":"development","layer":"Actor Network Service","difficulty":8,"type":"Plugin","group":"DAP","authorName":"Rart3001","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/12099493?v=3","authorRealName":"Roberto Requena","authorEmail":""},{"name":"Asset User","description":"","code_level":"development","layer":"Actor Network Service","difficulty":8,"type":"Plugin","group":"DAP","authorName":"Rart3001","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/12099493?v=3","authorRealName":"Roberto Requena","authorEmail":""},{"name":"Redeem Point","description":"","code_level":"development","layer":"Actor Network Service","difficulty":8,"type":"Plugin","group":"DAP","authorName":"Rart3001","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/12099493?v=3","authorRealName":"Roberto Requena","authorEmail":""},{"name":"Asset Transmission","description":"","code_level":"development","layer":"Network Service","difficulty":8,"type":"Plugin","group":"DAP","authorName":"Rart3001","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/12099493?v=3","authorRealName":"Roberto Requena","authorEmail":""},{"name":"Wallet Branding","description":"","code_level":"development","layer":"Sub App","difficulty":10,"type":"Android","group":"MKT","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Marketer","description":"","code_level":"development","layer":"Sub App","difficulty":6,"type":"Android","group":"MKT","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Voucher Wallet","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"MKT","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Coupon Wallet","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":0,"type":"Android","group":"MKT"},{"name":"Discount Wallet","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"MKT"},{"name":"Wallet Branding","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"MKT"},{"name":"Marketer","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"MKT"},{"name":"Marketer","description":"","code_level":"development","layer":"Actor","difficulty":4,"type":"Plugin","group":"MKT"},{"name":"Voucher Wallet","description":"","code_level":"development","layer":"Wallet Module","difficulty":3,"type":"Plugin","group":"MKT","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Coupon Wallet","description":"","code_level":"concept","layer":"Wallet Module","difficulty":0,"type":"Plugin","group":"MKT"},{"name":"Discount Wallet","description":"","code_level":"concept","layer":"Wallet Module","difficulty":0,"type":"Plugin","group":"MKT"},{"name":"Incoming Voucher","description":"","code_level":"development","layer":"Digital Asset Transaction","difficulty":6,"type":"Plugin","group":"MKT","authorName":"darkestpriest","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10060413?v=3","authorRealName":"Manuel P\u00e9rez","authorEmail":"darkpriestrelative@gmail.com"},{"name":"Outgoing Voucher","description":"","code_level":"development","layer":"Digital Asset Transaction","difficulty":6,"type":"Plugin","group":"MKT","authorName":"darkestpriest","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10060413?v=3","authorRealName":"Manuel P\u00e9rez","authorEmail":"darkpriestrelative@gmail.com"},{"name":"Incoming Coupon","description":"","code_level":"concept","layer":"Digital Asset Transaction","difficulty":0,"type":"Plugin","group":"MKT"},{"name":"Outgoing Coupon","description":"","code_level":"concept","layer":"Digital Asset Transaction","difficulty":0,"type":"Plugin","group":"MKT"},{"name":"Incoming Discount","description":"","code_level":"concept","layer":"Digital Asset Transaction","difficulty":0,"type":"Plugin","group":"MKT"},{"name":"Outgoing Discount","description":"","code_level":"concept","layer":"Digital Asset Transaction","difficulty":0,"type":"Plugin","group":"MKT"},{"name":"Voucher","description":"","code_level":"development","layer":"Wallet","difficulty":4,"type":"Plugin","group":"MKT","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Coupon","description":"","code_level":"concept","layer":"Wallet","difficulty":0,"type":"Plugin","group":"MKT"},{"name":"Discount","description":"","code_level":"concept","layer":"Wallet","difficulty":0,"type":"Plugin","group":"MKT"},{"name":"Marketer","description":"","code_level":"development","layer":"Identity","difficulty":4,"type":"Plugin","group":"MKT","authorName":"Nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Crypto Broker","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"CBP","authorName":"nelsonalfo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/1823627?v=3","authorRealName":"Nelson Ramirez","authorEmail":"nelsonalfo@gmail.com"},{"name":"Crypto Broker Customer","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"CBP","authorName":"nelsonalfo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/1823627?v=3","authorRealName":"Nelson Ramirez","authorEmail":"nelsonalfo@gmail.com"},{"name":"Crypto Broker","description":"","code_level":"development","layer":"Sub App","difficulty":8,"type":"Android","group":"CBP","authorName":"nelsonalfo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/1823627?v=3","authorRealName":"Nelson Ramirez","authorEmail":"nelsonalfo@gmail.com"},{"name":"Crypto Broker Customer","description":"","code_level":"development","layer":"Sub App","difficulty":8,"type":"Android","group":"CBP","authorName":"nelsonalfo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/1823627?v=3","authorRealName":"Nelson Ramirez","authorEmail":"nelsonalfo@gmail.com"},{"name":"Customers","description":"","code_level":"development","layer":"Sub App","difficulty":6,"type":"Android","group":"CBP","authorName":"nelsonalfo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/1823627?v=3","authorRealName":"Nelson Ramirez","authorEmail":"nelsonalfo@gmail.com"},{"name":"Suppliers","description":"","code_level":"development","layer":"Sub App","difficulty":6,"type":"Android","group":"CBP","authorName":"nelsonalfo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/1823627?v=3","authorRealName":"Nelson Ramirez","authorEmail":"nelsonalfo@gmail.com"},{"name":"Sub App Manager","description":"","code_level":"development","layer":"Sub App","difficulty":6,"type":"Android","group":"CBP","authorName":"nelsonalfo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/1823627?v=3","authorRealName":"Nelson Ramirez","authorEmail":"nelsonalfo@gmail.com"},{"name":"Wallet Manager","description":"","code_level":"development","layer":"Sub App","difficulty":6,"type":"Android","group":"CBP","authorName":"nelsonalfo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/1823627?v=3","authorRealName":"Nelson Ramirez","authorEmail":"nelsonalfo@gmail.com"},{"name":"Crypto Broker","description":"","code_level":"development","layer":"Wallet Module","difficulty":4,"type":"Plugin","group":"CBP"},{"name":"Crypto Broker Customer","description":"","code_level":"development","layer":"Wallet Module","difficulty":4,"type":"Plugin","group":"CBP"},{"name":"Crypto Broker","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"CBP"},{"name":"Crypto Broker Customer","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"CBP"},{"name":"Customer","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"CBP"},{"name":"Supplier","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"CBP"},{"name":"Sub App Manager","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"CBP"},{"name":"Wallet Manager","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"CBP"},{"name":"Crypto Broker","description":"","code_level":"development","layer":"Actor","difficulty":4,"type":"Plugin","group":"CBP"},{"name":"Crypto Broker Customer","description":"","code_level":"development","layer":"Actor","difficulty":4,"type":"Plugin","group":"CBP"},{"name":"Customers","description":"","code_level":"development","layer":"Middleware","difficulty":4,"type":"Plugin","group":"CBP"},{"name":"Wholesalers","description":"","code_level":"development","layer":"Middleware","difficulty":4,"type":"Plugin","group":"CBP"},{"name":"Quotes","description":"","code_level":"development","layer":"Middleware","difficulty":6,"type":"Plugin","group":"CBP"},{"name":"Crypto Initial Balance","description":"","code_level":"development","layer":"Business Transaction","difficulty":4,"type":"Plugin","group":"CBP"},{"name":"Cash Fiat Initial Balance","description":"","code_level":"development","layer":"Business Transaction","difficulty":4,"type":"Plugin","group":"CBP"},{"name":"Broker Crypto Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CBP"},{"name":"Broker Cash Fiat Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CBP"},{"name":"Broker Crypto Purchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CBP"},{"name":"Broker Cash Fiat Pruchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CBP"},{"name":"Retail Crypto Sale","description":"","code_level":"development","layer":"Business Transaction","difficulty":10,"type":"Plugin","group":"CBP"},{"name":"Retail Cash Fiat Sale","description":"","code_level":"development","layer":"Business Transaction","difficulty":10,"type":"Plugin","group":"CBP"},{"name":"Whosale Crypto Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CBP"},{"name":"Whosale Fiat Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CBP"},{"name":"Send Crypto","description":"","code_level":"development","layer":"Digital Money Transaction","difficulty":10,"type":"Plugin","group":"CBP"},{"name":"Receive Crypto","description":"","code_level":"development","layer":"Digital Money Transaction","difficulty":10,"type":"Plugin","group":"CBP"},{"name":"Give Cash On Hand","description":"","code_level":"development","layer":"Cash Transaction","difficulty":10,"type":"Plugin","group":"CBP"},{"name":"Receive Cash On Hand","description":"","code_level":"development","layer":"Cash Transaction","difficulty":10,"type":"Plugin","group":"CBP"},{"name":"Deliver Cash","description":"","code_level":"development","layer":"Cash Transaction","difficulty":10,"type":"Plugin","group":"CBP"},{"name":"Receive Cash Delivered","description":"","code_level":"development","layer":"Cash Transaction","difficulty":10,"type":"Plugin","group":"CBP"},{"name":"Make Bank Deposit","description":"","code_level":"development","layer":"Cash Transaction","difficulty":10,"type":"Plugin","group":"CBP"},{"name":"Receive Bank Deposit","description":"","code_level":"development","layer":"Cash Transaction","difficulty":10,"type":"Plugin","group":"CBP"},{"name":"Broker To Broker","description":"","code_level":"concept","layer":"Contract","difficulty":0,"type":"Plugin","group":"CBP"},{"name":"Broker To Wholesaler","description":"","code_level":"concept","layer":"Contract","difficulty":0,"type":"Plugin","group":"CBP"},{"name":"Crypto","description":"","code_level":"development","layer":"Wallet","difficulty":6,"type":"Plugin","group":"CBP"},{"name":"Cash","description":"","code_level":"development","layer":"Wallet","difficulty":6,"type":"Plugin","group":"CBP"},{"name":"Bank","description":"","code_level":"development","layer":"Wallet","difficulty":6,"type":"Plugin","group":"CBP"},{"name":"Crypto Broker","description":"","code_level":"development","layer":"Identity","difficulty":4,"type":"Plugin","group":"CBP"},{"name":"Crypto Broker Customer","description":"","code_level":"development","layer":"Identity","difficulty":4,"type":"Plugin","group":"CBP"},{"name":"Crypto Broker","description":"","code_level":"development","layer":"Actor Network Service","difficulty":8,"type":"Plugin","group":"CBP"},{"name":"Crypto Broker Customer","description":"","code_level":"development","layer":"Actor Network Service","difficulty":8,"type":"Plugin","group":"CBP"},{"name":"Crypto Wholesaler","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":0,"type":"Android","group":"CDN"},{"name":"Crypto Distributor","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":0,"type":"Android","group":"CDN"},{"name":"Top Up Point","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":0,"type":"Android","group":"CDN"},{"name":"Cash Out Point","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":0,"type":"Android","group":"CDN"},{"name":"Crypto Wholesaler","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"CDN"},{"name":"Crypto Distributor","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"CDN"},{"name":"Top Up Point","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"CDN"},{"name":"Cash Out Point","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"CDN"},{"name":"Crypto Wholesaler","description":"","code_level":"concept","layer":"Wallet Module","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Distributor","description":"","code_level":"concept","layer":"Wallet Module","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point","description":"","code_level":"concept","layer":"Wallet Module","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Cash Out Point","description":"","code_level":"concept","layer":"Wallet Module","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Wholesaler","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Distributor","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Cash Out Point","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Wholesaler","description":"","code_level":"concept","layer":"Actor","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Distributor","description":"","code_level":"concept","layer":"Actor","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point","description":"","code_level":"concept","layer":"Actor","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Cash Out Point","description":"","code_level":"concept","layer":"Actor","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Wholesaler Broker Crypto Purchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Wholesaler Broker Fiat Purchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Wholesaler Distributor Crypto Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Wholesaler Distributor Fiat Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Wholesaler Crypto Purchare","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Wholesaler Fiat Purchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Distributor Crypto Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Distributor Fiat Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Distributor Crypto Purchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Distributor Fiat Purchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Top Up Point Crypto Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Top Up Point Fiat Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point Distributor Crypto Purchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point Distributor Fiat Purchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point Intra User Crypto Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Cash Out Point Intra User Fiat Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point Cash Out Point Crypto Purchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Cash Out Point Top Up Point Crypto Sell","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Shop Top Up Point Crypto Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point Shop Crypto Purchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Wholesaler Broker","description":"","code_level":"concept","layer":"Contract","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Wholesaler Distributor","description":"","code_level":"concept","layer":"Contract","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Distributor","description":"","code_level":"concept","layer":"Contract","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Top Up Point","description":"","code_level":"concept","layer":"Contract","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point Cash Out Point","description":"","code_level":"concept","layer":"Contract","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point Shop","description":"","code_level":"concept","layer":"Contract","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Wholesaler","description":"","code_level":"concept","layer":"Wallet","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Distributor","description":"","code_level":"concept","layer":"Wallet","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Top Up","description":"","code_level":"concept","layer":"Wallet","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Cash Out","description":"","code_level":"concept","layer":"Wallet","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto POS Wallet","description":"","code_level":"concept","layer":"Wallet","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Wholesaler","description":"","code_level":"concept","layer":"Identity","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Distributor","description":"","code_level":"concept","layer":"Identity","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point","description":"","code_level":"concept","layer":"Identity","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Cash Out Point","description":"","code_level":"concept","layer":"Identity","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Wholesaler","description":"","code_level":"concept","layer":"Actor Network Service","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Distributor","description":"","code_level":"concept","layer":"Actor Network Service","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point","description":"","code_level":"concept","layer":"Actor Network Service","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Cash Out Point","description":"","code_level":"concept","layer":"Actor Network Service","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Device Private Network","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"DPN"},{"name":"Device Private Network","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"DPN"},{"name":"Device Private Network","description":"","code_level":"concept","layer":"Middleware","difficulty":0,"type":"Plugin","group":"DPN"},{"name":"Device Private Network","description":"","code_level":"concept","layer":"Network Service","difficulty":0,"type":"Plugin","group":"DPN"}],"superLayers":[{"name":"Peer to Peer Network","code":"P2P","index":0},{"name":"Crypto","code":"BCH","index":1},{"name":"Operating System API","code":"OSA","index":2}]}';











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
function Headers(columnWidth, superLayerMaxHeight, groupsQtty, layersQtty, superLayerPosition) {
    
    var headers = [],
        group,
        column,
        image,
        object,
        slayer,
        row;
    
    
    for (group in groups) {
        if (groups.hasOwnProperty(group) && group !== 'size') {
        
            column = groups[group];

            image = document.createElement('img');
            image.src = 'images/' + group + '_logo.svg';
            image.width = columnWidth * 140;
            image.style.opacity = 0;
            headers.push(image);

            object = new THREE.CSS3DObject(image);

            object.position.x = (columnWidth * 140) * (column - (groupsQtty - 1) / 2) + ((column - 1) * 140);
            object.position.y = ((layersQtty + 5) * 180) / 2;

            scene.add(object);
        }
    }
    
    for (slayer in superLayers) {
        if (superLayers.hasOwnProperty(slayer) && slayer !== 'size') {
        
            row = superLayerPosition[superLayers[slayer].index];

            image = document.createElement('img');
            image.src = 'images/' + slayer + '_logo.svg';
            image.width = columnWidth * 140;
            image.style.opacity = 0;
            headers.push(image);

            object = new THREE.CSS3DObject(image);

            object.position.x = -(((groupsQtty + 1) * columnWidth * 140 / 2) + 140);
            object.position.y = -(row * 180) - (superLayerMaxHeight * 180 / 2) + (layersQtty * 180 / 2);

            scene.add(object);
        }
    }
    
    
    this.show = function (duration) {
        var i;
        
        for (i = 0; i < headers.length; i++ ) {
            $(headers[i]).fadeTo(Math.random() * duration + duration, 1);
        }
    };
    
    this.hide = function (duration) {
        var i;
        
        for (i = 0; i < headers.length; i++) {
            $(headers[i]).fadeTo(Math.random() * duration + duration, 0);
        }
    };
}
/**
 * Static object with help functions commonly used
 */
function Helper() {

    /**
     * Hides an element vanishing it and then eliminating it from the DOM
     * @param {DOMElement} element  The element to eliminate
     * @param {Number} duration Duration of the fade animation
     */
    this.hide = function(element, duration) {

        var dur = duration || 1000,
            el = element;

        if (typeof(el) === "string") {
            el = document.getElementById(element);
        }

        $(el).fadeTo(duration, 0, function() {
            $(el).remove();
        });
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

}

// Make helper a static object
var helper = new Helper();
function Loader() {
    // reference to the object
    var that = this;

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
        img.style.left = '10%';
        img.style.top = '30%';
        img.style.position = 'absolute';
        return img;
    }

    /**
     * does an ajax request to check if repo folder exists
     * @method folderExists
     * @param  {Number}     index index of element
     */
    this.folderExists = function(index) {
        var strIndex = "#" + index;
        var repoDir = helper.getRepoDir(table[index]);
        if (repoDir) {
            $.ajax({
                url: "get_contents.php?url=" + repoDir,
                method: "GET"
            }).done(function(result) {
                var res = JSON.parse(result);
                var found = true;
                if (res.message && res.message == "Not Found") {
                    found = false;
                    if (table[index].code_level != "concept") $(strIndex).append(getStamp());
                } else {
                    //console.log(repoDir);
                }
                table[index].folder_found = found;
            });
        } else {
            table[index].folder_found = false;
            $(strIndex).append(getStamp());
        }
    };

    /**
     * check all elements in table
     * @method findThemAll
     */
    this.findThemAll = function() {
        for (var i = 0, l = table.length; i < l; i++) {
            that.folderExists(i);
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
            
            tile = helper.cloneTile(tasks[i], 'timeline-' + tasks[i]);
            tile.style.position = 'relative';
            tile.style.display = 'inline-block';
            
            wrap = document.createElement('div');
            wrap.appendChild( tile );
            
            this.groups.push ( {
                id : i,
                content : wrap.innerHTML
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
var table = [];

var camera, scene, renderer;

var objects = [];
var targets = {
    table: [],
    sphere: [],
    helix: [],
    grid: []
};
var headers = null;

var lastTargets = null;

$.ajax({
    url: "get_plugins.php",
    method: "GET"
}).success(
    function(lists) {
        try {
            var l = JSON.parse(lists);
            fillTable(l);
            $('#splash').fadeTo(0, 500, function() {
                $('#splash').remove();
                init();
                setTimeout(animate, 500);
            });
        } catch (err) {
            console.dir(err);
        }
    }
);

/*var l = JSON.parse(testData);
    
    fillTable(l);
    
    $('#splash').fadeTo(0, 500, function() {
            $('#splash').remove();
            init();
            setTimeout( animate, 500);
        });*/

function init() {

    scene = new THREE.Scene();


    // table

    var groupsQtty = groups.size();
    var layersQtty = layers.size();
    var section = [];
    var elementsByGroup = [];
    var columnWidth = 0;
    var superLayerMaxHeight = 0;
    var layerPosition = [];
    var superLayerPosition = [];

    for (var key in layers) {
        if (key == "size") continue;

        if (layers[key].super_layer) {

            section.push(0);
        } else {

            var newLayer = [];

            for (var i = 0; i < groupsQtty; i++)
                newLayer.push(0);

            section.push(newLayer);
        }
    }

    var preComputeLayout = function() {

        var _sections = [];
        var superLayerHeight = 0;
        var isSuperLayer = [];

        //Initialize
        for (var key in layers) {
            if (key == "size") continue;

            if (layers[key].super_layer) {

                _sections.push(0);
                superLayerHeight++;

                if (superLayerMaxHeight < superLayerHeight) superLayerMaxHeight = superLayerHeight;
            } else {

                var newLayer = [];
                superLayerHeight = 0;

                for (var i = 0; i < groupsQtty; i++)
                    newLayer.push(0);

                _sections.push(newLayer);
            }

            isSuperLayer.push(false);
        }

        for (var j = 0; j <= groupsQtty; j++) {

            elementsByGroup.push(0);
            //columnGroupPosition.push(0);
        }

        //Set sections sizes

        for (var i = 0; i < table.length; i++) {

            var r = table[i].layerID;
            var c = table[i].groupID;

            elementsByGroup[c]++;

            if (layers[table[i].layer].super_layer) {

                _sections[r]++;
                isSuperLayer[r] = true;
            } else {

                _sections[r][c]++;

                if (_sections[r][c] > columnWidth) columnWidth = _sections[r][c];
            }

            //if ( c != groups.size() && elementsByGroup[c] > columnWidth ) columnWidth = elementsByGroup[c];
        }

        //Set row height

        var actualHeight = 0;
        var remainingSpace = superLayerMaxHeight;
        var inSuperLayer = false;
        var actualSuperLayer = 0;

        for (var i = 0; i < layersQtty; i++) {

            if (isSuperLayer[i]) {

                if (!inSuperLayer) {
                    actualHeight++;

                    if (superLayerPosition[actualSuperLayer] == undefined) {
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
    preComputeLayout();

    for (var i = 0; i < table.length; i++) {

        var element = createElement(i);

        var object = new THREE.CSS3DObject(element);
        object.position.x = 0;
        object.position.y = 0;
        object.position.z = 80000;
        scene.add(object);

        objects.push(object);

        //

        var object = new THREE.Object3D();

        //Row (Y)
        var row = table[i].layerID;

        if (layers[table[i].layer].super_layer) {

            object.position.x = ((section[row]) * 140) - (columnWidth * groupsQtty * 140 / 2);

            section[row]++;

        } else {

            //Column (X)
            var column = table[i].groupID;
            object.position.x = (((column * (columnWidth) + section[row][column]) + column) * 140) - (columnWidth * groupsQtty * 140 / 2);

            section[row][column]++;
        }


        object.position.y = -((layerPosition[row]) * 180) + (layersQtty * 180 / 2);

        targets.table.push(object);

    }

    // table groups icons
    headers = new Headers(columnWidth, superLayerMaxHeight, groupsQtty, layersQtty, superLayerPosition);

    // sphere

    var vector = new THREE.Vector3();

    var indexes = [];

    for (var i = 0; i <= groupsQtty; i++) indexes.push(0);

    for (var i = 0; i < objects.length; i++) {

        var g = (table[i].groupID != undefined) ? table[i].groupID : groupsQtty;

        var radious = 300 * (g + 1);

        var phi = Math.acos((2 * indexes[g]) / elementsByGroup[g] - 1);
        var theta = Math.sqrt(elementsByGroup[g] * Math.PI) * phi;

        var object = new THREE.Object3D();

        object.position.x = radious * Math.cos(theta) * Math.sin(phi);
        object.position.y = radious * Math.sin(theta) * Math.sin(phi);
        object.position.z = radious * Math.cos(phi);

        vector.copy(object.position).multiplyScalar(2);

        object.lookAt(vector);

        targets.sphere.push(object);

        indexes[g]++;


    }

    // helix

    var vector = new THREE.Vector3();

    var helixSection = [];
    var current = [];
    var last = 0,
        helixPosition = 0;

    for (var i = 0; i < layersQtty; i++) {

        var totalInRow = 0;

        for (var j = 0; j < groupsQtty; j++) {

            if (typeof(section[i]) == "object")
                totalInRow += section[i][j];
            else if (j == 0)
                totalInRow += section[i];
        }

        helixPosition += last;
        helixSection.push(helixPosition);
        last = totalInRow;

        current.push(0);
    }

    for (var i = 0, l = objects.length; i < l; i++) {

        var row = table[i].layerID;

        var x = helixSection[row] + current[row];
        current[row]++;


        var phi = x * 0.175 + Math.PI;

        var object = new THREE.Object3D();

        object.position.x = 900 * Math.sin(phi);
        object.position.y = -(x * 8) + 450;
        object.position.z = 900 * Math.cos(phi);

        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;

        object.lookAt(vector);

        targets.helix.push(object);

    }

    // grid

    var gridLine = [];
    var gridLayers = [];
    var lastLayer = 0;


    for (var i = 0; i < layersQtty + 1; i++) {

        //gridLine.push(0);
        var gridLineSub = [];
        var empty = true;

        for (var j = 0; j < section.length; j++) {

            if (section[j][i] != 0) empty = false;

            gridLineSub.push(0);
        }

        if (!empty) lastLayer++;

        gridLayers.push(lastLayer);
        gridLine.push(gridLineSub);
    }

    for (var i = 0; i < objects.length; i++) {

        var group = table[i].groupID;
        var layer = table[i].layerID;

        var object = new THREE.Object3D();

        //By layer
        object.position.x = ((gridLine[layer][0] % 5) * 200) - 450;
        object.position.y = (-(Math.floor(gridLine[layer][0] / 5) % 5) * 200) + 0;
        object.position.z = (-gridLayers[layer]) * 200 + (layersQtty * 50);
        gridLine[layer][0]++;

        targets.grid.push(object);

    }

    //



    renderer = new THREE.CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    document.getElementById('container').appendChild(renderer.domElement);

    camera = new Camera(new THREE.Vector3(0, 0, columnWidth * groupsQtty * 140),
        renderer,
        render);


    //

    $('.backButton').click(function() {
        changeView(targets.table);
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

    //Disabled Menu
    //initMenu();

    transform(targets.table, 4000);
}

function initMenu() {

    var button = document.getElementById('table');
    button.addEventListener('click', function(event) {

        changeView(targets.table);

    }, false);

    var button = document.getElementById('sphere');
    button.addEventListener('click', function(event) {

        changeView(targets.sphere);

    }, false);

    var button = document.getElementById('helix');
    button.addEventListener('click', function(event) {

        changeView(targets.helix);

    }, false);

    var button = document.getElementById('grid');
    button.addEventListener('click', function(event) {

        changeView(targets.grid);

    }, false);

}

function createElement(i) {

    var element = document.createElement('div');
    element.className = 'element';
    element.id = i;

    element.addEventListener('click', onElementClick, false);

    if (table[i].picture != undefined) {
        var picture = document.createElement('img');
        picture.id = 'img-' + i;
        picture.className = 'picture';
        picture.src = table[i].picture;
        element.appendChild(picture);
    }

    var difficulty = document.createElement('div');
    difficulty.className = 'difficulty';
    difficulty.textContent = printDifficulty(Math.floor(table[i].difficulty / 2));
    element.appendChild(difficulty);

    var number = document.createElement('div');
    number.className = 'number';
    number.textContent = (table[i].group != undefined) ? table[i].group : layers[table[i].layer].super_layer;
    element.appendChild(number);

    var symbol = document.createElement('div');
    symbol.className = 'symbol';
    symbol.textContent = table[i].code;
    element.appendChild(symbol);

    var details = document.createElement('div');
    details.className = 'details';

    var pluginName = document.createElement('p');
    pluginName.innerHTML = table[i].name;
    pluginName.className = 'name';

    var layerName = document.createElement('p');
    layerName.innerHTML = table[i].layer;

    details.appendChild(pluginName);
    details.appendChild(layerName);
    element.appendChild(details);

    switch (table[i].code_level) {

        case "concept":
            element.style.boxShadow = '0px 0px 12px rgba(150,150,150,0.5)';
            element.style.backgroundColor = 'rgba(170,170,170,' + (Math.random() * 0.25 + 0.45) + ')';

            number.style.color = 'rgba(127,127,127,1)';
            layerName.style.color = 'rgba(127,127,127,1)';

            break;
        case "development":
            element.style.boxShadow = '0px 0px 12px rgba(244,133,107,0.5)';
            element.style.backgroundColor = 'rgba(234,123,97,' + (Math.random() * 0.25 + 0.45) + ')';

            number.style.color = 'rgba(234,123,97,1)';
            layerName.style.color = 'rgba(234,123,97,1)';


            break;
        case "qa":
            element.style.boxShadow = '0px 0px 12px rgba(244,244,107,0.5)';
            element.style.backgroundColor = 'rgba(194,194,57,' + (Math.random() * 0.25 + 0.45) + ')';

            number.style.color = 'rgba(194,194,57,1)';
            layerName.style.color = 'rgba(194,194,57,1)';


            break;
        case "production":
            element.style.boxShadow = '0px 0px 12px rgba(80,188,107,0.5)';
            element.style.backgroundColor = 'rgba(70,178,97,' + (Math.random() * 0.25 + 0.45) + ')';

            number.style.color = 'rgba(70,178,97,1)';
            layerName.style.color = 'rgba(70,178,97,1)';

            break;
    }

    return element;
}

function changeView(targets) {

    camera.enable();
    camera.loseFocus();

    if (targets != null)
        transform(targets, 2000);
}

function onElementClick() {

    var id = this.id;

    var image = document.getElementById('img-' + id);

    if (camera.getFocus() == null) {

        camera.setFocus(id, 2000);
        setTimeout(function() {
            camera.setFocus(id, 1000);
            $('#backButton').fadeTo(1000, 1, function() {
                $('#backButton').show();
            });
        }, 3000);
        camera.disable();

        if (image != null) {

            var handler = function() {
                onImageClick(id, image, handler);
            };

            image.addEventListener('click', handler, true);
        } else {}
    }

    function onImageClick(id, image, handler) {

        image.removeEventListener('click', handler, true);

        var relatedTasks = [];

        for (var i = 0; i < table.length; i++) {
            if (table[i].author == table[id].author) relatedTasks.push(i);
        }

        createSidePanel(id, image, relatedTasks);
        createElementsPanel(relatedTasks);
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
        panelImage.src = image.src;
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

            var tlButton = document.createElement('button');
            tlButton.id = 'timelineButton';
            tlButton.style.opacity = 0;
            tlButton.style.position = 'relative';
            tlButton.textContent = 'See Timeline';

            $(tlButton).click(function() {
                showTimeline(relatedTasks);
            });

            sidePanel.appendChild(tlButton);
        }

        $('#container').append(sidePanel);

        $(renderer.domElement).fadeTo(1000, 0);

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

    function createElementsPanel(tasks) {

        var elementPanel = document.createElement('div');
        elementPanel.id = 'elementPanel';
        elementPanel.style.position = 'absolute';
        elementPanel.style.top = '0px';
        elementPanel.style.bottom = '25%';
        elementPanel.style.right = '0px';
        elementPanel.style.marginTop = '50px';
        elementPanel.style.marginRight = '5%';
        elementPanel.style.width = '60%';
        elementPanel.style.overflowY = 'auto';


        for (i = 0, l = tasks.length; i < l; i++) {

            var clone = helper.cloneTile(tasks[i], 'task-' + tasks[i]);
            clone.style.position = 'relative';
            clone.style.display = 'inline-block';
            clone.style.marginLeft = '10px';
            clone.style.marginTop = '10px';
            clone.style.opacity = 0;
            elementPanel.appendChild(clone);

            $(clone).fadeTo(2000, 1);
        }

        $('#container').append(elementPanel);

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
        $('#container').append(tlContainer);

        $(tlContainer).fadeTo(1000, 1);

        new Timeline(tasks, tlContainer).show();
    }
}

function printDifficulty(value) {
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
}

function fillTable(list) {

    var pluginList = list.plugins;

    for (var i = 0, l = list.superLayers.length; i < l; i++) {
        superLayers[list.superLayers[i].code] = {};
        superLayers[list.superLayers[i].code].name = list.superLayers[i].name;
        superLayers[list.superLayers[i].code].index = list.superLayers[i].index;
    }

    for (var i = 0, l = list.layers.length; i < l; i++) {
        layers[list.layers[i].name] = {};
        layers[list.layers[i].name].index = list.layers[i].index;
        layers[list.layers[i].name].super_layer = list.layers[i].super_layer;
    }

    for (var i = 0, l = list.groups.length; i < l; i++) {
        groups[list.groups[i].code] = list.groups[i].index;
    }


    for (var i = 0, l = pluginList.length; i < l; i++) {

        var data = pluginList[i];

        var _group = data.group;
        var _layer = data.layer;
        var _name = data.name;

        var layerID = layers[_layer].index;
        layerID = (layerID == undefined) ? layers.size() : layerID;

        var groupID = groups[_group];
        groupID = (groupID == undefined) ? groups.size() : groupID;

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

    var loader = new Loader();
    loader.findThemAll();
}

function transform(goal, duration) {

    TWEEN.removeAll();

    lastTargets = goal;

    for (var i = 0; i < objects.length; i++) {

        var object = objects[i];
        var target = goal[i];

        new TWEEN.Tween(object.position)
            .to({
                x: target.position.x,
                y: target.position.y,
                z: target.position.z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        new TWEEN.Tween(object.rotation)
            .to({
                x: target.rotation.x,
                y: target.rotation.y,
                z: target.rotation.z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

    }

    if (goal == targets.table) {
        headers.show(duration);
    } else {
        headers.hide(duration);
    }

    new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate(render)
        .start();
}

function animate() {

    requestAnimationFrame(animate);

    TWEEN.update();

    camera.update();
}

function render() {

    //renderer.render( scene, camera );
    camera.render(renderer, scene);
}