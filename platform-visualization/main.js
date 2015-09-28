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
        
        headers.hide(duration);
    
        var vec = new THREE.Vector4(0, 0, window.TILE_DIMENSION.width - window.TILE_SPACING, 1);
        var target = window.objects[ focus ];

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
        
        scene.traverse( function ( object ) {

            if ( object instanceof THREE.LOD ) {
                object.update( camera );
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
    
    this.rayCast = function(target, elements) {
        
        var raycaster = new THREE.Raycaster();
        
        raycaster.setFromCamera(target, camera);
        
        return raycaster.intersectObjects(elements);
    };
    
    // Events
    window.addEventListener( 'resize', this.onWindowResize, false );
    window.addEventListener( 'keydown', this.onKeyDown, false );
}
var testData = '{"groups":[{"code":"COR","name":"Core And Api","logo":"COR_logo.png","index":0,"dependsOn":"OSA"},{"code":"PIP","name":"Plug-ins Platform","logo":"PIP_logo.png","index":1,"dependsOn":"P2P, COR"},{"code":"WPD","name":"Wallet Production and Distribution","logo":"WPD_logo.png","index":2,"dependsOn":"PIP"},{"code":"CCP","name":"Crypto Currency Platform","logo":"CCP_logo.png","index":3,"dependsOn":"WPD, P2P"},{"code":"CCM","name":"Crypto Commodity Money","logo":"CCM_logo.png","index":4,"dependsOn":"CCP"},{"code":"BNP","name":"Bank Notes Platform","logo":"BNP_logo.png","index":5,"dependsOn":"CCM"},{"code":"SHP","name":"Shopping Platform","logo":"SHP_logo.png","index":6,"dependsOn":"WPD"},{"code":"DAP","name":"Digital Asset Platform","logo":"DAP_logo.png","index":7,"dependsOn":"WPD"},{"code":"MKT","name":"Marketing Platform","logo":"MKT_logo.png","index":8,"dependsOn":"DAP"},{"code":"CSH","name":"Cash Handling Platform","logo":"CSH_logo.png","index":9,"dependsOn":"WPD"},{"code":"BNK","name":"Banking Platform","logo":"BNK_logo.png","index":10,"dependsOn":"WPD"},{"code":"CBP","name":"Crypto Broker Platform","logo":"CBP_logo.png","index":11,"dependsOn":"CCP, CSH, BNK"},{"code":"CDN","name":"Crypto Distribution Netword","logo":"CDN_logo.png","index":12,"dependsOn":"CBP"},{"code":"DPN","name":"Device Private Network","logo":"DPN_logo.png","index":13,"dependsOn":"PIP"}],"layers":[{"name":"Core","index":0,"super_layer":false},{"name":"Niche Wallet","index":1,"super_layer":false},{"name":"Reference Wallet","index":2,"super_layer":false},{"name":"Sub App","index":3,"super_layer":false},{"name":"Desktop","index":4,"super_layer":false},{"name":"empty layer 1","index":5,"super_layer":false},{"name":"Engine","index":6,"super_layer":false},{"name":"Wallet Module","index":7,"super_layer":false},{"name":"Sub App Module","index":8,"super_layer":false},{"name":"Desktop Module","index":9,"super_layer":false},{"name":"Agent","index":10,"super_layer":false},{"name":"Actor","index":11,"super_layer":false},{"name":"Middleware","index":12,"super_layer":false},{"name":"Request","index":13,"super_layer":false},{"name":"Business Transaction","index":14,"super_layer":false},{"name":"Digital Asset Transaction","index":15,"super_layer":false},{"name":"Crypto Money Transaction","index":16,"super_layer":false},{"name":"Cash Money Transaction","index":17,"super_layer":false},{"name":"Bank Money Transaction","index":18,"super_layer":false},{"name":"Contract","index":19,"super_layer":false},{"name":"Composite Wallet","index":20,"super_layer":false},{"name":"Wallet","index":21,"super_layer":false},{"name":"World","index":22,"super_layer":false},{"name":"Identity","index":23,"super_layer":false},{"name":"Actor Network Service","index":24,"super_layer":false},{"name":"Network Service","index":25,"super_layer":false},{"name":"empty layer 2","index":26,"super_layer":false},{"name":"","index":27,"super_layer":false},{"name":"Communication","index":28,"super_layer":"P2P"},{"name":"empty layer 3","index":29,"super_layer":false},{"name":"Crypto Router","index":30,"super_layer":"BCH"},{"name":"Crypto Module","index":31,"super_layer":"BCH"},{"name":"Crypto Vault","index":32,"super_layer":"BCH"},{"name":"Crypto Network","index":33,"super_layer":"BCH"},{"name":"empty layer 4","index":34,"super_layer":false},{"name":"License","index":35,"super_layer":false},{"name":"Plugin","index":36,"super_layer":false},{"name":"User","index":37,"super_layer":false},{"name":"Hardware","index":38,"super_layer":false},{"name":"Platform Service","index":39,"super_layer":false},{"name":"empty layer 5","index":40,"super_layer":false},{"name":"Multi OS","index":41,"super_layer":"OSA"},{"name":"Android","index":42,"super_layer":"OSA"},{"name":"Api","index":43,"super_layer":false}],"plugins":[{"name":"Fermat Core","description":"","code_level":"development","layer":"Core","difficulty":10,"type":"Library","group":"COR","authorName":"Luis-Fernando-Molina","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9479367?v=3","authorRealName":"Luis Fernando Molina","authorEmail":"","life_cycle":[{"name":"Concept","reached":"2015-06-01","target":""},{"name":"Development","reached":"2015-08-20","target":"2015-09-01"},{"name":"QA","reached":"2015-09-15","target":"2015-09-20"},{"name":"Production","reached":"2015-09-25","target":"2015-10-01"}]},{"name":"Android Core","description":"","code_level":"development","layer":"Core","difficulty":10,"type":"Library","group":"COR","authorName":"Luis-Fernando-Molina","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9479367?v=3","authorRealName":"Luis Fernando Molina","authorEmail":"","life_cycle":[{"name":"Concept","reached":"2015-06-01","target":""},{"name":"Development","reached":"2015-09-20","target":"2015-10-01"},{"name":"QA","reached":"2015-09-15","target":"2015-10-20"},{"name":"Production","reached":"2015-09-25","target":"2015-10-01"}]},{"name":"OSA Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"BCH Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"P2P Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"DPN Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"PIP Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"DMP Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"WPD Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"DAP Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"MKT Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"CDN Core","description":"","code_level":"concept","layer":"Core","difficulty":0,"type":"Library","group":"COR"},{"name":"Cloud Client","description":"","code_level":"production","layer":"Communication","difficulty":10,"type":"Plugin","authorName":"jorgeejgonzalez","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/2023125?v=3","authorRealName":"Jorge Gonzalez","authorEmail":"jorgeejgonzalez@gmail.com"},{"name":"Cloud Server","description":"","code_level":"production","layer":"Communication","difficulty":10,"type":"Plugin","authorName":"jorgeejgonzalez","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/2023125?v=3","authorRealName":"Jorge Gonzalez","authorEmail":"jorgeejgonzalez@gmail.com"},{"name":"P2P","description":"","code_level":"concept","layer":"Communication","difficulty":0,"type":"Plugin"},{"name":"Geo Fenced P2P","description":"","code_level":"concept","layer":"Communication","difficulty":0,"type":"Plugin"},{"name":"Wifi","description":"","code_level":"concept","layer":"Communication","difficulty":0,"type":"Plugin"},{"name":"Bluetooth","description":"","code_level":"concept","layer":"Communication","difficulty":0,"type":"Plugin"},{"name":"NFC","description":"","code_level":"concept","layer":"Communication","difficulty":0,"type":"Plugin"},{"name":"Mesh","description":"","code_level":"concept","layer":"Communication","difficulty":0,"type":"Plugin"},{"name":"Incomming Crypto","description":"","code_level":"production","layer":"Crypto Router","difficulty":10,"type":"Plugin","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Outgoing Crypto","description":"","code_level":"concept","layer":"Crypto Router","difficulty":0,"type":"Plugin"},{"name":"Crypto Address Book","description":"","code_level":"production","layer":"Crypto Module","difficulty":5,"type":"Plugin","authorName":"lnacosta","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/7293791?v=3","authorRealName":"Le\u00f3n","authorEmail":""},{"name":"Redeem Point Address Book","description":"","code_level":"development","layer":"Crypto Module","difficulty":5,"type":"Plugin","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Bitcoin Currency","description":"","code_level":"development","layer":"Crypto Vault","difficulty":10,"type":"Plugin","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Assets Over Bitcoin","description":"","code_level":"development","layer":"Crypto Vault","difficulty":10,"type":"Plugin","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Litecoin","description":"","code_level":"concept","layer":"Crypto Vault","difficulty":0,"type":"Plugin"},{"name":"Ripple","description":"","code_level":"concept","layer":"Crypto Vault","difficulty":0,"type":"Plugin"},{"name":"Ethereum","description":"","code_level":"concept","layer":"Crypto Vault","difficulty":0,"type":"Plugin"},{"name":"Bitcoin","description":"","code_level":"development","layer":"Crypto Network","difficulty":10,"type":"Plugin","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":"","life_cycle":[{"name":"Concept","reached":"2015-06-01","target":""},{"name":"Development","reached":"2015-07-01","target":"2015-09-01"},{"name":"QA","reached":"2015-07-01","target":"2015-09-01"},{"name":"Production","reached":"2015-07-01","target":"2015-09-01"}]},{"name":"Litecoin","description":"","code_level":"concept","layer":"Crypto Network","difficulty":0,"type":"Plugin"},{"name":"Ripple","description":"","code_level":"concept","layer":"Crypto Network","difficulty":0,"type":"Plugin"},{"name":"Ethereum","description":"","code_level":"concept","layer":"Crypto Network","difficulty":0,"type":"Plugin"},{"name":"File System","description":"Is the interface between the OS specific File System and the platform components that need to consume file system services","code_level":"production","layer":"Multi OS","difficulty":3,"type":"Addon","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Database System","description":"Is a wrapper designed to isolate the rest of the components from the OS dependent Database System","code_level":"production","layer":"Multi OS","difficulty":5,"type":"Addon","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"File System","description":"Is the interface between the OS specific File System and the platform components that need to consume file system services","code_level":"production","layer":"Android","difficulty":3,"type":"Addon","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Database System","description":"Is a wrapper designed to isolate the rest of the components from the OS dependent Database System","code_level":"production","layer":"Android","difficulty":5,"type":"Addon","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Logger","description":"","code_level":"production","layer":"Android","difficulty":4,"type":"Addon","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Device Location","description":"","code_level":"development","layer":"Android","difficulty":4,"type":"Addon","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Device Connectivity","description":"","code_level":"concept","layer":"Android","difficulty":0,"type":"Addon"},{"name":"Device Power","description":"","code_level":"concept","layer":"Android","difficulty":0,"type":"Addon"},{"name":"Device Contacts","description":"","code_level":"concept","layer":"Android","difficulty":0,"type":"Addon"},{"name":"Device Hardware","description":"","code_level":"concept","layer":"Android","difficulty":0,"type":"Addon","life_cycle":[{"name":"Concept","reached":"2015-06-01","target":""},{"name":"Development","reached":"2015-07-01","target":"2015-09-01"},{"name":"QA","reached":"2015-07-01","target":"2015-09-01"},{"name":"Production","reached":"2015-07-01","target":"2015-09-01"}]},{"name":"Fermat Api","description":"","code_level":"development","layer":"Api","difficulty":10,"type":"Library","group":"COR","authorName":"Luis-Fernando-Molina","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9479367?v=3","authorRealName":"Luis Fernando Molina","authorEmail":"","life_cycle":[{"name":"Concept","reached":"2015-05-01","target":""},{"name":"Development","reached":"2015-05-20","target":"2015-06-01"},{"name":"QA","reached":"2015-08-15","target":"2015-07-20"},{"name":"Production","reached":"2015-09-25","target":"2015-10-01"}]},{"name":"Android Api","description":"","code_level":"development","layer":"Api","difficulty":10,"type":"Library","group":"COR"},{"name":"OSA Api","description":"","code_level":"concept","layer":"Api","difficulty":0,"type":"Library","group":"COR"},{"name":"BCH Api","description":"","code_level":"development","layer":"Api","difficulty":10,"type":"Library","group":"COR","authorName":"Luis-Fernando-Molina","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9479367?v=3","authorRealName":"Luis Fernando Molina","authorEmail":"","life_cycle":[{"name":"Concept","reached":"2015-04-01","target":""},{"name":"Development","reached":"2015-05-20","target":"2015-05-01"},{"name":"QA","reached":"2015-05-15","target":"2015-06-20"},{"name":"Production","reached":"2015-09-25","target":"2015-10-01"}]},{"name":"P2P Api","description":"","code_level":"development","layer":"Api","difficulty":10,"type":"Library","group":"COR","authorName":"Luis-Fernando-Molina","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9479367?v=3","authorRealName":"Luis Fernando Molina","authorEmail":""},{"name":"DPN Api","description":"","code_level":"concept","layer":"Api","difficulty":0,"type":"Library","group":"COR"},{"name":"PIP Api","description":"","code_level":"development","layer":"Api","difficulty":10,"type":"Library","group":"COR","authorName":"Luis-Fernando-Molina","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9479367?v=3","authorRealName":"Luis Fernando Molina","authorEmail":""},{"name":"DMP Api","description":"","code_level":"concept","layer":"Api","difficulty":0,"type":"Library","group":"COR"},{"name":"WPD Api","description":"","code_level":"concept","layer":"Api","difficulty":0,"type":"Library","group":"COR"},{"name":"DAP Api","description":"","code_level":"concept","layer":"Api","difficulty":0,"type":"Library","group":"COR"},{"name":"MKT Api","description":"","code_level":"concept","layer":"Api","difficulty":0,"type":"Library","group":"COR"},{"name":"CDN Api","description":"","code_level":"concept","layer":"Api","difficulty":0,"type":"Library","group":"COR"},{"name":"Shell","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"PIP"},{"name":"Designer","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"PIP"},{"name":"Developer","description":"","code_level":"production","layer":"Sub App","difficulty":5,"type":"Android","group":"PIP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Technical Support","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"PIP"},{"name":"System Monitor","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"PIP"},{"name":"Feedback","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"PIP"},{"name":"Reviews","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"PIP"},{"name":"Sub App Manager","description":"","code_level":"production","layer":"Desktop","difficulty":3,"type":"Android","group":"PIP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Sub App Runtime","description":"","code_level":"development","layer":"Engine","difficulty":8,"type":"Plugin","group":"PIP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Shell","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Designer","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Developer","description":"","code_level":"production","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"PIP","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Technical Support","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"System Monitor","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Feedback","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Reviews","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Sub App Manager","description":"","code_level":"development","layer":"Desktop Module","difficulty":4,"type":"Plugin","group":"PIP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Developer","description":"","code_level":"production","layer":"Actor","difficulty":6,"type":"Plugin","group":"PIP","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Designer","description":"","code_level":"concept","layer":"Actor","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Intra User Technical Support","description":"","code_level":"concept","layer":"Middleware","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Developer Technical Support","description":"","code_level":"concept","layer":"Middleware","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Developer Error Manager","description":"","code_level":"concept","layer":"Middleware","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Sub App Settings","description":"","code_level":"development","layer":"Middleware","difficulty":2,"type":"Plugin","group":"PIP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Notification","description":"","code_level":"development","layer":"Middleware","difficulty":6,"type":"Plugin","group":"PIP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Location","description":"","code_level":"concept","layer":"World","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Developer","description":"","code_level":"production","layer":"Identity","difficulty":1,"type":"Plugin","group":"PIP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Designer","description":"","code_level":"concept","layer":"Identity","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Developer","description":"","code_level":"concept","layer":"Actor Network Service","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Sub App Resources","description":"","code_level":"development","layer":"Network Service","difficulty":8,"type":"Plugin","group":"PIP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"System Monitor","description":"","code_level":"concept","layer":"Network Service","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Error Manager","description":"","code_level":"concept","layer":"Network Service","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Messanger","description":"","code_level":"concept","layer":"Network Service","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Technical Support","description":"","code_level":"concept","layer":"Network Service","difficulty":0,"type":"Plugin","group":"PIP"},{"name":"Plugin","description":"","code_level":"concept","layer":"License","difficulty":0,"type":"Addon","group":"PIP"},{"name":"Identity","description":"","code_level":"concept","layer":"Plugin","difficulty":0,"type":"Addon","group":"PIP"},{"name":"Dependency","description":"","code_level":"concept","layer":"Plugin","difficulty":0,"type":"Addon","group":"PIP"},{"name":"Device User","description":"","code_level":"concept","layer":"User","difficulty":0,"type":"Addon","group":"PIP"},{"name":"Local Device","description":"","code_level":"concept","layer":"Hardware","difficulty":0,"type":"Addon","group":"PIP"},{"name":"Device Network","description":"","code_level":"concept","layer":"Hardware","difficulty":0,"type":"Addon","group":"PIP"},{"name":"Error Manager","description":"","code_level":"production","layer":"Platform Service","difficulty":4,"type":"Addon","group":"PIP","authorName":"jorgeejgonzalez","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/2023125?v=3","authorRealName":"Jorge Gonzalez","authorEmail":"jorgeejgonzalez@gmail.com"},{"name":"Event Manager","description":"","code_level":"production","layer":"Platform Service","difficulty":8,"type":"Addon","group":"PIP","authorName":"Luis-Fernando-Molina","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9479367?v=3","authorRealName":"Luis Fernando Molina","authorEmail":""},{"name":"Connectivity Subsystem","description":"","code_level":"concept","layer":"Platform Service","difficulty":0,"type":"Addon","group":"PIP"},{"name":"Location Subsystem","description":"","code_level":"concept","layer":"Platform Service","difficulty":0,"type":"Addon","group":"PIP"},{"name":"Power Subsystem","description":"","code_level":"concept","layer":"Platform Service","difficulty":0,"type":"Addon","group":"PIP"},{"name":"Platform Info","description":"","code_level":"production","layer":"Platform Service","difficulty":2,"type":"Addon","group":"PIP","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Wallet Factory","description":"","code_level":"development","layer":"Sub App","difficulty":10,"type":"Android","group":"WPD","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Wallet Publisher","description":"","code_level":"development","layer":"Sub App","difficulty":6,"type":"Android","group":"WPD","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Wallet Store","description":"","code_level":"development","layer":"Sub App","difficulty":8,"type":"Android","group":"WPD","authorName":"nelsonalfo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/1823627?v=3","authorRealName":"Nelson Ramirez","authorEmail":"nelsonalfo@gmail.com"},{"name":"Wallet Manager","description":"","code_level":"development","layer":"Desktop","difficulty":4,"type":"Android","group":"WPD","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Wallet Runtime","description":"","code_level":"production","layer":"Engine","difficulty":8,"type":"Plugin","group":"WPD","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Wallet Factory","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"WPD","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Wallet Publisher","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"WPD","authorName":"Rart3001","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/12099493?v=3","authorRealName":"Roberto Requena","authorEmail":""},{"name":"Wallet Store","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"WPD","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Wallet Manager","description":"","code_level":"development","layer":"Desktop Module","difficulty":4,"type":"Plugin","group":"WPD","authorName":"darkestpriest","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10060413?v=3","authorRealName":"Manuel P\u00e9rez","authorEmail":"darkpriestrelative@gmail.com"},{"name":"Publisher","description":"","code_level":"development","layer":"Actor","difficulty":6,"type":"Plugin","group":"WPD","authorName":"Rart3001","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/12099493?v=3","authorRealName":"Roberto Requena","authorEmail":""},{"name":"Wallet Manager","description":"","code_level":"production","layer":"Middleware","difficulty":8,"type":"Plugin","group":"WPD","authorName":"darkestpriest","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10060413?v=3","authorRealName":"Manuel P\u00e9rez","authorEmail":"darkpriestrelative@gmail.com"},{"name":"Wallet Factory","description":"","code_level":"development","layer":"Middleware","difficulty":10,"type":"Plugin","group":"WPD","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Wallet Store","description":"","code_level":"development","layer":"Middleware","difficulty":6,"type":"Plugin","group":"WPD","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Wallet Settings","description":"","code_level":"development","layer":"Middleware","difficulty":3,"type":"Plugin","group":"WPD","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Publisher","description":"","code_level":"development","layer":"Identity","difficulty":4,"type":"Plugin","group":"WPD","authorName":"nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Wallet Resources","description":"","code_level":"development","layer":"Network Service","difficulty":8,"type":"Plugin","group":"WPD","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Wallet Store","description":"Enables searching for Intra Users and conecting one to the other","code_level":"development","layer":"Network Service","difficulty":8,"type":"Plugin","group":"WPD","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Wallet Statistics","description":"","code_level":"concept","layer":"Network Service","difficulty":0,"type":"Plugin","group":"WPD"},{"name":"Wallet Community","description":"","code_level":"concept","layer":"Network Service","difficulty":0,"type":"Plugin","group":"WPD"},{"name":"Wallet","description":"","code_level":"concept","layer":"License","difficulty":0,"type":"Addon","group":"WPD"},{"name":"Bitcoin Wallet","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"CCP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Bitcoin Loss Protected","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"CCP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Intra User identity","description":"","code_level":"development","layer":"Sub App","difficulty":4,"type":"Android","group":"CCP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Intra User Community","description":"","code_level":"development","layer":"Sub App","difficulty":4,"type":"Android","group":"CCP","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Crypto Wallet","description":"","code_level":"development","layer":"Wallet Module","difficulty":3,"type":"Plugin","group":"CCP","authorName":"lnacosta","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/7293791?v=3","authorRealName":"Le\u00f3n","authorEmail":""},{"name":"Intra User","description":"","code_level":"development","layer":"Sub App Module","difficulty":2,"type":"Plugin","group":"CCP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Extra User","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"CCP"},{"name":"Intra User","description":"","code_level":"development","layer":"Actor","difficulty":4,"type":"Plugin","group":"CCP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Extra User","description":"","code_level":"production","layer":"Actor","difficulty":4,"type":"Plugin","group":"CCP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Wallet Contacts","description":"","code_level":"development","layer":"Middleware","difficulty":6,"type":"Plugin","group":"CCP","authorName":"lnacosta","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/7293791?v=3","authorRealName":"Le\u00f3n","authorEmail":""},{"name":"Crypto Request","description":"","code_level":"development","layer":"Request","difficulty":8,"type":"Plugin","group":"CCP","authorName":"lnacosta","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/7293791?v=3","authorRealName":"Le\u00f3n","authorEmail":""},{"name":"Incoming Device User","description":"","code_level":"concept","layer":"Crypto Money Transaction","difficulty":1,"type":"Plugin","group":"CCP"},{"name":"Incoming Extra Actor","description":"","code_level":"production","layer":"Crypto Money Transaction","difficulty":10,"type":"Plugin","group":"CCP","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Incoming Intra Actor","description":"","code_level":"development","layer":"Crypto Money Transaction","difficulty":10,"type":"Plugin","group":"CCP","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Intra Wallet","description":"","code_level":"concept","layer":"Crypto Money Transaction","difficulty":0,"type":"Plugin","group":"CCP"},{"name":"Outgoing Device User","description":"","code_level":"concept","layer":"Crypto Money Transaction","difficulty":0,"type":"Plugin","group":"CCP"},{"name":"Outgoing Extra Actor","description":"","code_level":"production","layer":"Crypto Money Transaction","difficulty":10,"type":"Plugin","group":"CCP","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Outgoin Intra Actor","description":"","code_level":"development","layer":"Crypto Money Transaction","difficulty":10,"type":"Plugin","group":"CCP","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Inter Account","description":"","code_level":"concept","layer":"Crypto Money Transaction","difficulty":0,"type":"Plugin","group":"CCP"},{"name":"Multi Account","description":"","code_level":"concept","layer":"Composite Wallet","difficulty":0,"type":"Plugin","group":"CCP"},{"name":"Bitcoin Wallet","description":"","code_level":"production","layer":"Wallet","difficulty":4,"type":"Plugin","group":"CCP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Bitcoin Loss Protected","description":"","code_level":"development","layer":"Wallet","difficulty":8,"type":"Plugin","group":"CCP","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Crypto Index","description":"","code_level":"development","layer":"World","difficulty":8,"type":"Plugin","group":"CCP","authorName":"laderuner","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/3421830?v=3","authorRealName":"Francisco Javier Arce","authorEmail":"sonnik42@hotmail.com"},{"name":"Blockchain Info","description":"","code_level":"concept","layer":"World","difficulty":0,"type":"Plugin","group":"CCP"},{"name":"Coinapult","description":"","code_level":"concept","layer":"World","difficulty":0,"type":"Plugin","group":"CCP"},{"name":"Shape Shift","description":"","code_level":"concept","layer":"World","difficulty":0,"type":"Plugin","group":"CCP"},{"name":"Coinbase","description":"","code_level":"concept","layer":"World","difficulty":0,"type":"Plugin","group":"CCP"},{"name":"Intra User","description":"","code_level":"development","layer":"Identity","difficulty":4,"type":"Plugin","group":"CCP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Intra User","description":"Enables searching for Intra Users and conecting one to the other","code_level":"development","layer":"Actor Network Service","difficulty":6,"type":"Plugin","group":"CCP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Crypto Address","description":"Enables the underground exchange of crypto addresses","code_level":"development","layer":"Network Service","difficulty":5,"type":"Plugin","group":"CCP","authorName":"lnacosta","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/7293791?v=3","authorRealName":"Le\u00f3n","authorEmail":""},{"name":"Crypto Request","description":"","code_level":"development","layer":"Network Service","difficulty":8,"type":"Plugin","group":"CCP","authorName":"lnacosta","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/7293791?v=3","authorRealName":"Le\u00f3n","authorEmail":""},{"name":"Crypto Transmission","description":"","code_level":"development","layer":"Network Service","difficulty":8,"type":"Plugin","group":"CCP","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Crypto Commodity Money","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"CCM","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Discount Wallet","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"CCM","authorName":"furszy","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/5377650?v=3","authorRealName":"","authorEmail":""},{"name":"Money Request","description":"","code_level":"development","layer":"Request","difficulty":8,"type":"Plugin","group":"CCM","authorName":"lnacosta","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/7293791?v=3","authorRealName":"Le\u00f3n","authorEmail":""},{"name":"Incoming Device User","description":"","code_level":"concept","layer":"Crypto Money Transaction","difficulty":1,"type":"Plugin","group":"CCM"},{"name":"Incoming Extra Actor","description":"","code_level":"production","layer":"Crypto Money Transaction","difficulty":10,"type":"Plugin","group":"CCM","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Incoming Intra Actor","description":"","code_level":"development","layer":"Crypto Money Transaction","difficulty":10,"type":"Plugin","group":"CCM","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Intra Wallet","description":"","code_level":"concept","layer":"Crypto Money Transaction","difficulty":0,"type":"Plugin","group":"CCM"},{"name":"Outgoing Device User","description":"","code_level":"concept","layer":"Crypto Money Transaction","difficulty":0,"type":"Plugin","group":"CCM"},{"name":"Outgoing Extra Actor","description":"","code_level":"production","layer":"Crypto Money Transaction","difficulty":10,"type":"Plugin","group":"CCM","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Outgoin Intra Actor","description":"","code_level":"development","layer":"Crypto Money Transaction","difficulty":10,"type":"Plugin","group":"CCM","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Inter Account","description":"","code_level":"concept","layer":"Crypto Money Transaction","difficulty":0,"type":"Plugin","group":"CCM"},{"name":"Multi Account","description":"","code_level":"concept","layer":"Composite Wallet","difficulty":0,"type":"Plugin","group":"CCM"},{"name":"Crypto Commodity Money","description":"","code_level":"development","layer":"Wallet","difficulty":4,"type":"Plugin","group":"CCM","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Discount Wallet","description":"","code_level":"development","layer":"Wallet","difficulty":10,"type":"Plugin","group":"CCM","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Money Request","description":"","code_level":"development","layer":"Network Service","difficulty":8,"type":"Plugin","group":"CCM","authorName":"lnacosta","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/7293791?v=3","authorRealName":"Le\u00f3n","authorEmail":""},{"name":"Money Transmission","description":"","code_level":"development","layer":"Network Service","difficulty":5,"type":"Plugin","group":"CCM","authorName":"EzequielPostan","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/6744814?v=3","authorRealName":"Ezequiel Postan","authorEmail":""},{"name":"Bank Notes","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":0,"type":"Android","group":"BNP"},{"name":"Bank Notes Wallet","description":"","code_level":"concept","layer":"Wallet Module","difficulty":0,"type":"Plugin","group":"BNP"},{"name":"Bank Notes","description":"","code_level":"concept","layer":"Middleware","difficulty":0,"type":"Plugin","group":"BNP"},{"name":"Bank Notes","description":"","code_level":"concept","layer":"Wallet","difficulty":4,"type":"Plugin","group":"BNP"},{"name":"Bank Notes","description":"","code_level":"concept","layer":"Network Service","difficulty":0,"type":"Plugin","group":"BNP"},{"name":"Shop Wallet","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":0,"type":"Android","group":"SHP"},{"name":"Brand Wallet","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":0,"type":"Android","group":"SHP"},{"name":"Retailer Wallet","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":0,"type":"Android","group":"SHP"},{"name":"Shop","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"SHP"},{"name":"Brand","description":"","code_level":"development","layer":"Sub App","difficulty":6,"type":"Android","group":"SHP","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Retailer","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"SHP"},{"name":"Shop Wallet","description":"","code_level":"concept","layer":"Wallet Module","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Brand Wallet","description":"","code_level":"concept","layer":"Wallet Module","difficulty":3,"type":"Plugin","group":"SHP"},{"name":"Retailer Wallet","description":"","code_level":"concept","layer":"Wallet Module","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Shop","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Brand","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"SHP","authorName":"nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Retailer","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Shop","description":"","code_level":"concept","layer":"Actor","difficulty":0,"type":"Plugin","group":"SHP","authorName":"Rart3001","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/12099493?v=3","authorRealName":"Roberto Requena","authorEmail":""},{"name":"Brand","description":"","code_level":"development","layer":"Actor","difficulty":4,"type":"Plugin","group":"SHP"},{"name":"Retailer","description":"","code_level":"concept","layer":"Actor","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Purchase","description":"","code_level":"concept","layer":"Crypto Money Transaction","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Sale","description":"","code_level":"concept","layer":"Crypto Money Transaction","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Shop Wallet","description":"","code_level":"concept","layer":"Wallet","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Brand Wallet","description":"","code_level":"concept","layer":"Wallet","difficulty":4,"type":"Plugin","group":"SHP"},{"name":"Retailer Wallet","description":"","code_level":"concept","layer":"Wallet","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Shop","description":"","code_level":"concept","layer":"Identity","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Brand","description":"","code_level":"development","layer":"Identity","difficulty":4,"type":"Plugin","group":"SHP","authorName":"Nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Retailer","description":"","code_level":"concept","layer":"Identity","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Shop","description":"","code_level":"concept","layer":"Actor Network Service","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Brand","description":"","code_level":"concept","layer":"Actor Network Service","difficulty":4,"type":"Plugin","group":"SHP"},{"name":"Retailer","description":"","code_level":"concept","layer":"Actor Network Service","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Purchase Transmission","description":"","code_level":"concept","layer":"Network Service","difficulty":0,"type":"Plugin","group":"SHP"},{"name":"Asset Issuer","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"DAP","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Asset User","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"DAP","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Redeem Point","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"DAP","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Asset Factory","description":"","code_level":"development","layer":"Sub App","difficulty":4,"type":"Android","group":"DAP","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Asset Issuer Community","description":"","code_level":"development","layer":"Sub App","difficulty":4,"type":"Android","group":"DAP","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Asset User Community","description":"","code_level":"development","layer":"Sub App","difficulty":4,"type":"Android","group":"DAP","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Redeem Point Community","description":"","code_level":"development","layer":"Sub App","difficulty":4,"type":"Android","group":"DAP","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Asset Issuer","description":"","code_level":"development","layer":"Wallet Module","difficulty":3,"type":"Plugin","group":"DAP","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Asset User","description":"","code_level":"development","layer":"Wallet Module","difficulty":3,"type":"Plugin","group":"DAP","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Redeem Point","description":"","code_level":"development","layer":"Wallet Module","difficulty":3,"type":"Plugin","group":"DAP","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Asset Factory","description":"","code_level":"development","layer":"Sub App Module","difficulty":2,"type":"Plugin","group":"DAP","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Asset Issuer Community","description":"","code_level":"development","layer":"Sub App Module","difficulty":2,"type":"Plugin","group":"DAP","authorName":"Nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Asset User Community","description":"","code_level":"development","layer":"Sub App Module","difficulty":2,"type":"Plugin","group":"DAP","authorName":"Nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Redeem Point Community","description":"","code_level":"development","layer":"Sub App Module","difficulty":2,"type":"Plugin","group":"DAP","authorName":"Nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Asset Issuer","description":"","code_level":"development","layer":"Actor","difficulty":4,"type":"Plugin","group":"DAP","authorName":"Nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Asset User","description":"","code_level":"development","layer":"Actor","difficulty":4,"type":"Plugin","group":"DAP","authorName":"Nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Redeem Point","description":"","code_level":"development","layer":"Actor","difficulty":4,"type":"Plugin","group":"DAP","authorName":"Nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Asset Factory","description":"","code_level":"development","layer":"Middleware","difficulty":8,"type":"Plugin","group":"DAP","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Asset Distribution","description":"","code_level":"development","layer":"Digital Asset Transaction","difficulty":10,"type":"Plugin","group":"DAP","authorName":"darkestpriest","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10060413?v=3","authorRealName":"Manuel P\u00e9rez","authorEmail":"darkpriestrelative@gmail.com"},{"name":"Asset Issuing","description":"","code_level":"development","layer":"Digital Asset Transaction","difficulty":10,"type":"Plugin","group":"DAP","authorName":"darkestpriest","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10060413?v=3","authorRealName":"Manuel P\u00e9rez","authorEmail":"darkpriestrelative@gmail.com"},{"name":"Asset Redemption","description":"","code_level":"development","layer":"Digital Asset Transaction","difficulty":10,"type":"Plugin","group":"DAP","authorName":"darkestpriest","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10060413?v=3","authorRealName":"Manuel P\u00e9rez","authorEmail":"darkpriestrelative@gmail.com"},{"name":"Assets Issuer Wallet","description":"","code_level":"development","layer":"Wallet","difficulty":4,"type":"Plugin","group":"DAP","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Assets User Wallet","description":"","code_level":"development","layer":"Wallet","difficulty":4,"type":"Plugin","group":"DAP","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Redeem Point Wallet","description":"","code_level":"development","layer":"Wallet","difficulty":4,"type":"Plugin","group":"DAP","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Asset Issuer","description":"","code_level":"development","layer":"Identity","difficulty":4,"type":"Plugin","group":"DAP","authorName":"Nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Asset User","description":"","code_level":"development","layer":"Identity","difficulty":4,"type":"Plugin","group":"DAP","authorName":"Nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Redeem Point","description":"","code_level":"development","layer":"Identity","difficulty":4,"type":"Plugin","group":"DAP","authorName":"Nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Asset Issuer","description":"","code_level":"development","layer":"Actor Network Service","difficulty":8,"type":"Plugin","group":"DAP","authorName":"Rart3001","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/12099493?v=3","authorRealName":"Roberto Requena","authorEmail":""},{"name":"Asset User","description":"","code_level":"development","layer":"Actor Network Service","difficulty":8,"type":"Plugin","group":"DAP","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Redeem Point","description":"","code_level":"development","layer":"Actor Network Service","difficulty":8,"type":"Plugin","group":"DAP","authorName":"acostarodrigo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/9518556?v=3","authorRealName":"Rodrigo","authorEmail":""},{"name":"Asset Transmission","description":"","code_level":"development","layer":"Network Service","difficulty":8,"type":"Plugin","group":"DAP","authorName":"Rart3001","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/12099493?v=3","authorRealName":"Roberto Requena","authorEmail":""},{"name":"Wallet Branding","description":"","code_level":"development","layer":"Sub App","difficulty":10,"type":"Android","group":"MKT","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Marketer","description":"","code_level":"development","layer":"Sub App","difficulty":6,"type":"Android","group":"MKT","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Voucher Wallet","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"MKT","authorName":"fvasquezjatar","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8290154?v=3","authorRealName":"Francisco Vasquez","authorEmail":"fvasquezjatar@gmail.com"},{"name":"Coupon Wallet","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":0,"type":"Android","group":"MKT"},{"name":"Discount Wallet","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"MKT"},{"name":"Wallet Branding","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"MKT"},{"name":"Marketer","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"MKT"},{"name":"Marketer","description":"","code_level":"development","layer":"Actor","difficulty":4,"type":"Plugin","group":"MKT"},{"name":"Voucher Wallet","description":"","code_level":"development","layer":"Wallet Module","difficulty":3,"type":"Plugin","group":"MKT","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Coupon Wallet","description":"","code_level":"concept","layer":"Wallet Module","difficulty":0,"type":"Plugin","group":"MKT"},{"name":"Discount Wallet","description":"","code_level":"concept","layer":"Wallet Module","difficulty":0,"type":"Plugin","group":"MKT"},{"name":"Incoming Voucher","description":"","code_level":"development","layer":"Digital Asset Transaction","difficulty":6,"type":"Plugin","group":"MKT","authorName":"darkestpriest","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10060413?v=3","authorRealName":"Manuel P\u00e9rez","authorEmail":"darkpriestrelative@gmail.com"},{"name":"Outgoing Voucher","description":"","code_level":"development","layer":"Digital Asset Transaction","difficulty":6,"type":"Plugin","group":"MKT","authorName":"darkestpriest","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10060413?v=3","authorRealName":"Manuel P\u00e9rez","authorEmail":"darkpriestrelative@gmail.com"},{"name":"Incoming Coupon","description":"","code_level":"concept","layer":"Digital Asset Transaction","difficulty":0,"type":"Plugin","group":"MKT"},{"name":"Outgoing Coupon","description":"","code_level":"concept","layer":"Digital Asset Transaction","difficulty":0,"type":"Plugin","group":"MKT"},{"name":"Incoming Discount","description":"","code_level":"concept","layer":"Digital Asset Transaction","difficulty":0,"type":"Plugin","group":"MKT"},{"name":"Outgoing Discount","description":"","code_level":"concept","layer":"Digital Asset Transaction","difficulty":0,"type":"Plugin","group":"MKT"},{"name":"Voucher","description":"","code_level":"development","layer":"Wallet","difficulty":4,"type":"Plugin","group":"MKT","authorName":"Franklinmarcano1970","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/8689068?v=3","authorRealName":"Franklin Marcano","authorEmail":"franklinmarcano1970@gmail.com"},{"name":"Coupon","description":"","code_level":"concept","layer":"Wallet","difficulty":0,"type":"Plugin","group":"MKT"},{"name":"Discount","description":"","code_level":"concept","layer":"Wallet","difficulty":0,"type":"Plugin","group":"MKT"},{"name":"Marketer","description":"","code_level":"development","layer":"Identity","difficulty":4,"type":"Plugin","group":"MKT","authorName":"Nindriago","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13187461?v=3","authorRealName":"Nerio Indriago","authorEmail":""},{"name":"Give Cash On Hand","description":"","code_level":"development","layer":"Cash Money Transaction","difficulty":6,"type":"Plugin","group":"CSH","authorName":"yalayn","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/4664287?v=3","authorRealName":"yalayn","authorEmail":""},{"name":"Receive Cash On Hand","description":"","code_level":"development","layer":"Cash Money Transaction","difficulty":6,"type":"Plugin","group":"CSH","authorName":"yalayn","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/4664287?v=3","authorRealName":"yalayn","authorEmail":""},{"name":"Send Cash Delivery","description":"","code_level":"development","layer":"Cash Money Transaction","difficulty":6,"type":"Plugin","group":"CSH","authorName":"yalayn","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/4664287?v=3","authorRealName":"yalayn","authorEmail":""},{"name":"Receive Cash Delivery","description":"","code_level":"development","layer":"Cash Money Transaction","difficulty":6,"type":"Plugin","group":"CSH","authorName":"yalayn","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/4664287?v=3","authorRealName":"yalayn","authorEmail":""},{"name":"Cash Money","description":"","code_level":"development","layer":"Wallet","difficulty":2,"type":"Plugin","group":"CSH","authorName":"yalayn","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/4664287?v=3","authorRealName":"yalayn","authorEmail":""},{"name":"Make Offline Bank Transfer","description":"","code_level":"development","layer":"Bank Money Transaction","difficulty":6,"type":"Plugin","group":"BNK","authorName":"yalayn","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/4664287?v=3","authorRealName":"yalayn","authorEmail":""},{"name":"Receive Offline Bank Transfer","description":"","code_level":"development","layer":"Bank Money Transaction","difficulty":6,"type":"Plugin","group":"BNK","authorName":"yalayn","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/4664287?v=3","authorRealName":"yalayn","authorEmail":""},{"name":"Bank Money","description":"","code_level":"development","layer":"Wallet","difficulty":2,"type":"Plugin","group":"BNK","authorName":"yalayn","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/4664287?v=3","authorRealName":"yalayn","authorEmail":""},{"name":"Crypto Broker","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"CBP","authorName":"nelsonalfo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/1823627?v=3","authorRealName":"Nelson Ramirez","authorEmail":"nelsonalfo@gmail.com"},{"name":"Crypto Customer","description":"","code_level":"development","layer":"Reference Wallet","difficulty":8,"type":"Android","group":"CBP","authorName":"nelsonalfo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/1823627?v=3","authorRealName":"Nelson Ramirez","authorEmail":"nelsonalfo@gmail.com"},{"name":"Crypto Broker Identity","description":"","code_level":"development","layer":"Sub App","difficulty":4,"type":"Android","group":"CBP","authorName":"nelsonalfo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/1823627?v=3","authorRealName":"Nelson Ramirez","authorEmail":"nelsonalfo@gmail.com"},{"name":"Crypto Broker Community","description":"","code_level":"development","layer":"Sub App","difficulty":6,"type":"Android","group":"CBP","authorName":"nelsonalfo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/1823627?v=3","authorRealName":"Nelson Ramirez","authorEmail":"nelsonalfo@gmail.com"},{"name":"Crypto Customer Identity","description":"","code_level":"development","layer":"Sub App","difficulty":4,"type":"Android","group":"CBP","authorName":"nelsonalfo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/1823627?v=3","authorRealName":"Nelson Ramirez","authorEmail":"nelsonalfo@gmail.com"},{"name":"Crypto Customer Community","description":"","code_level":"development","layer":"Sub App","difficulty":4,"type":"Android","group":"CBP","authorName":"nelsonalfo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/1823627?v=3","authorRealName":"Nelson Ramirez","authorEmail":"nelsonalfo@gmail.com"},{"name":"Customers","description":"","code_level":"development","layer":"Sub App","difficulty":4,"type":"Android","group":"CBP","authorName":"nelsonalfo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/1823627?v=3","authorRealName":"Nelson Ramirez","authorEmail":"nelsonalfo@gmail.com"},{"name":"Suppliers","description":"","code_level":"concept","layer":"Sub App","difficulty":6,"type":"Android","group":"CBP"},{"name":"Sub App Manager","description":"","code_level":"development","layer":"Desktop","difficulty":4,"type":"Android","group":"CBP","authorName":"nelsonalfo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/1823627?v=3","authorRealName":"Nelson Ramirez","authorEmail":"nelsonalfo@gmail.com"},{"name":"Wallet Manager","description":"","code_level":"development","layer":"Desktop","difficulty":4,"type":"Android","group":"CBP","authorName":"nelsonalfo","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/1823627?v=3","authorRealName":"Nelson Ramirez","authorEmail":"nelsonalfo@gmail.com"},{"name":"Crypto Broker","description":"","code_level":"development","layer":"Wallet Module","difficulty":4,"type":"Plugin","group":"CBP","authorName":"vlzangel","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13138418?v=3","authorRealName":"","authorEmail":""},{"name":"Crypto Customer","description":"","code_level":"development","layer":"Wallet Module","difficulty":4,"type":"Plugin","group":"CBP","authorName":"vlzangel","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13138418?v=3","authorRealName":"","authorEmail":""},{"name":"Crypto Broker Identity","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"CBP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Crypto Broker Community","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"CBP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Crypto Customer Identity","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"CBP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Crypto Customer Community","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"CBP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Customers","description":"","code_level":"development","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"CBP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Suppliers","description":"","code_level":"concept","layer":"Sub App Module","difficulty":4,"type":"Plugin","group":"CBP"},{"name":"Sub App Manager","description":"","code_level":"development","layer":"Desktop Module","difficulty":4,"type":"Plugin","group":"CBP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Wallet Manager","description":"","code_level":"development","layer":"Desktop Module","difficulty":4,"type":"Plugin","group":"CBP","authorName":"nattyco","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/10051490?v=3","authorRealName":"Natalia Cortez","authorEmail":"natalia_veronica_c@hotmail.com"},{"name":"Crypto Broker","description":"","code_level":"development","layer":"Actor","difficulty":6,"type":"Plugin","group":"CBP","authorName":"jorgeejgonzalez","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/2023125?v=3","authorRealName":"Jorge Gonzalez","authorEmail":"jorgeejgonzalez@gmail.com"},{"name":"Crypto Customer","description":"","code_level":"development","layer":"Actor","difficulty":6,"type":"Plugin","group":"CBP","authorName":"jorgeejgonzalez","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/2023125?v=3","authorRealName":"Jorge Gonzalez","authorEmail":"jorgeejgonzalez@gmail.com"},{"name":"Customer Broker Crypto Money Purchase","description":"","code_level":"development","layer":"Contract","difficulty":6,"type":"Plugin","group":"CBP","authorName":"vlzangel","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13138418?v=3","authorRealName":"","authorEmail":""},{"name":"Customer Broker Cash Money Purchase","description":"","code_level":"development","layer":"Contract","difficulty":6,"type":"Plugin","group":"CBP","authorName":"vlzangel","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13138418?v=3","authorRealName":"","authorEmail":""},{"name":"Customer Broker Bank Money Purchase","description":"","code_level":"development","layer":"Contract","difficulty":6,"type":"Plugin","group":"CBP","authorName":"vlzangel","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13138418?v=3","authorRealName":"","authorEmail":""},{"name":"Customer Broker Crypto Money Sale","description":"","code_level":"development","layer":"Contract","difficulty":6,"type":"Plugin","group":"CBP","authorName":"vlzangel","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13138418?v=3","authorRealName":"","authorEmail":""},{"name":"Customer Broker Cash Money Sale","description":"","code_level":"development","layer":"Contract","difficulty":6,"type":"Plugin","group":"CBP","authorName":"vlzangel","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13138418?v=3","authorRealName":"","authorEmail":""},{"name":"Customer Broker Bank Money Sale","description":"","code_level":"development","layer":"Contract","difficulty":6,"type":"Plugin","group":"CBP","authorName":"vlzangel","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13138418?v=3","authorRealName":"","authorEmail":""},{"name":"Broker To Broker","description":"","code_level":"concept","layer":"Contract","difficulty":0,"type":"Plugin","group":"CBP"},{"name":"Broker To Wholesaler","description":"","code_level":"concept","layer":"Contract","difficulty":0,"type":"Plugin","group":"CBP"},{"name":"Customer Broker Purchase","description":"","code_level":"development","layer":"Request","difficulty":4,"type":"Plugin","group":"CBP","authorName":"vlzangel","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13138418?v=3","authorRealName":"","authorEmail":""},{"name":"Customer Broker Sale","description":"","code_level":"development","layer":"Request","difficulty":4,"type":"Plugin","group":"CBP","authorName":"vlzangel","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13138418?v=3","authorRealName":"","authorEmail":""},{"name":"Customers","description":"","code_level":"development","layer":"Middleware","difficulty":4,"type":"Plugin","group":"CBP","authorName":"vlzangel","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13138418?v=3","authorRealName":"","authorEmail":""},{"name":"Wholesalers","description":"","code_level":"concept","layer":"Middleware","difficulty":4,"type":"Plugin","group":"CBP"},{"name":"Crypto Broker Wallet Identity","description":"","code_level":"development","layer":"Middleware","difficulty":4,"type":"Plugin","group":"CBP","authorName":"vlzangel","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13138418?v=3","authorRealName":"","authorEmail":""},{"name":"Wallet Manager","description":"","code_level":"development","layer":"Middleware","difficulty":6,"type":"Plugin","group":"CBP","authorName":"vlzangel","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13138418?v=3","authorRealName":"","authorEmail":""},{"name":"Sub App Manager","description":"","code_level":"development","layer":"Middleware","difficulty":6,"type":"Plugin","group":"CBP","authorName":"vlzangel","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/13138418?v=3","authorRealName":"","authorEmail":""},{"name":"Crypto Broker","description":"","code_level":"development","layer":"Agent","difficulty":6,"type":"Plugin","group":"CBP","authorName":"yalayn","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/4664287?v=3","authorRealName":"yalayn","authorEmail":""},{"name":"Crypto Money Stock Replenishment","description":"","code_level":"development","layer":"Business Transaction","difficulty":4,"type":"Plugin","group":"CBP","authorName":"yalayn","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/4664287?v=3","authorRealName":"yalayn","authorEmail":""},{"name":"Cash Money Stock Replenishment","description":"","code_level":"development","layer":"Business Transaction","difficulty":4,"type":"Plugin","group":"CBP","authorName":"yalayn","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/4664287?v=3","authorRealName":"yalayn","authorEmail":""},{"name":"Bank Money Stock Replenishment","description":"","code_level":"development","layer":"Business Transaction","difficulty":4,"type":"Plugin","group":"CBP","authorName":"yalayn","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/4664287?v=3","authorRealName":"yalayn","authorEmail":""},{"name":"Customer Broker Crypto Sale","description":"","code_level":"development","layer":"Business Transaction","difficulty":8,"type":"Plugin","group":"CBP","authorName":"yalayn","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/4664287?v=3","authorRealName":"yalayn","authorEmail":""},{"name":"Customer Broker Cash Sale","description":"","code_level":"development","layer":"Business Transaction","difficulty":8,"type":"Plugin","group":"CBP","authorName":"yalayn","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/4664287?v=3","authorRealName":"yalayn","authorEmail":""},{"name":"Customer Broker Bank Sale","description":"","code_level":"development","layer":"Business Transaction","difficulty":8,"type":"Plugin","group":"CBP","authorName":"yalayn","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/4664287?v=3","authorRealName":"yalayn","authorEmail":""},{"name":"Customer Broker Crypto Purchase","description":"","code_level":"development","layer":"Business Transaction","difficulty":8,"type":"Plugin","group":"CBP","authorName":"yalayn","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/4664287?v=3","authorRealName":"yalayn","authorEmail":""},{"name":"Customer Broker Cash Purchase","description":"","code_level":"development","layer":"Business Transaction","difficulty":8,"type":"Plugin","group":"CBP","authorName":"yalayn","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/4664287?v=3","authorRealName":"yalayn","authorEmail":""},{"name":"Customer Broker Bank Purchase","description":"","code_level":"development","layer":"Business Transaction","difficulty":8,"type":"Plugin","group":"CBP","authorName":"yalayn","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/4664287?v=3","authorRealName":"yalayn","authorEmail":""},{"name":"Whosale Crypto Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CBP"},{"name":"Whosale Fiat Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CBP"},{"name":"Crypto Broker","description":"","code_level":"development","layer":"Identity","difficulty":4,"type":"Plugin","group":"CBP","authorName":"jorgeejgonzalez","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/2023125?v=3","authorRealName":"Jorge Gonzalez","authorEmail":"jorgeejgonzalez@gmail.com"},{"name":"Crypto Customer","description":"","code_level":"development","layer":"Identity","difficulty":4,"type":"Plugin","group":"CBP","authorName":"jorgeejgonzalez","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/2023125?v=3","authorRealName":"Jorge Gonzalez","authorEmail":"jorgeejgonzalez@gmail.com"},{"name":"Fiat Index","description":"","code_level":"development","layer":"World","difficulty":6,"type":"Plugin","group":"CBP","authorName":"yalayn","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/4664287?v=3","authorRealName":"yalayn","authorEmail":""},{"name":"Crypto Broker","description":"","code_level":"development","layer":"Actor Network Service","difficulty":8,"type":"Plugin","group":"CBP","authorName":"jorgeejgonzalez","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/2023125?v=3","authorRealName":"Jorge Gonzalez","authorEmail":"jorgeejgonzalez@gmail.com"},{"name":"Crypto Customer","description":"","code_level":"development","layer":"Actor Network Service","difficulty":8,"type":"Plugin","group":"CBP","authorName":"jorgeejgonzalez","authorPicture":"https:\/\/avatars.githubusercontent.com\/u\/2023125?v=3","authorRealName":"Jorge Gonzalez","authorEmail":"jorgeejgonzalez@gmail.com"},{"name":"Crypto Wholesaler","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":0,"type":"Android","group":"CDN"},{"name":"Crypto Distributor","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":0,"type":"Android","group":"CDN"},{"name":"Top Up Point","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":0,"type":"Android","group":"CDN"},{"name":"Cash Out Point","description":"","code_level":"concept","layer":"Reference Wallet","difficulty":0,"type":"Android","group":"CDN"},{"name":"Crypto Wholesaler","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"CDN"},{"name":"Crypto Distributor","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"CDN"},{"name":"Top Up Point","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"CDN"},{"name":"Cash Out Point","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"CDN"},{"name":"Crypto Wholesaler","description":"","code_level":"concept","layer":"Wallet Module","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Distributor","description":"","code_level":"concept","layer":"Wallet Module","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point","description":"","code_level":"concept","layer":"Wallet Module","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Cash Out Point","description":"","code_level":"concept","layer":"Wallet Module","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Wholesaler","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Distributor","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Cash Out Point","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Wholesaler","description":"","code_level":"concept","layer":"Actor","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Distributor","description":"","code_level":"concept","layer":"Actor","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point","description":"","code_level":"concept","layer":"Actor","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Cash Out Point","description":"","code_level":"concept","layer":"Actor","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Wholesaler Broker Crypto Purchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Wholesaler Broker Fiat Purchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Wholesaler Distributor Crypto Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Wholesaler Distributor Fiat Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Wholesaler Crypto Purchare","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Wholesaler Fiat Purchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Distributor Crypto Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Distributor Fiat Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Distributor Crypto Purchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Distributor Fiat Purchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Top Up Point Crypto Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Top Up Point Fiat Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point Distributor Crypto Purchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point Distributor Fiat Purchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point Intra User Crypto Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Cash Out Point Intra User Fiat Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point Cash Out Point Crypto Purchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Cash Out Point Top Up Point Crypto Sell","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Shop Top Up Point Crypto Sale","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point Shop Crypto Purchase","description":"","code_level":"concept","layer":"Business Transaction","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Wholesaler Broker","description":"","code_level":"concept","layer":"Contract","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Wholesaler Distributor","description":"","code_level":"concept","layer":"Contract","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Distributor","description":"","code_level":"concept","layer":"Contract","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Distributor Top Up Point","description":"","code_level":"concept","layer":"Contract","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point Cash Out Point","description":"","code_level":"concept","layer":"Contract","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point Shop","description":"","code_level":"concept","layer":"Contract","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Wholesaler","description":"","code_level":"concept","layer":"Wallet","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Distributor","description":"","code_level":"concept","layer":"Wallet","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Top Up","description":"","code_level":"concept","layer":"Wallet","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Cash Out","description":"","code_level":"concept","layer":"Wallet","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto POS Wallet","description":"","code_level":"concept","layer":"Wallet","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Wholesaler","description":"","code_level":"concept","layer":"Identity","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Distributor","description":"","code_level":"concept","layer":"Identity","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point","description":"","code_level":"concept","layer":"Identity","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Cash Out Point","description":"","code_level":"concept","layer":"Identity","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Wholesaler","description":"","code_level":"concept","layer":"Actor Network Service","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Crypto Distributor","description":"","code_level":"concept","layer":"Actor Network Service","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Top Up Point","description":"","code_level":"concept","layer":"Actor Network Service","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Cash Out Point","description":"","code_level":"concept","layer":"Actor Network Service","difficulty":0,"type":"Plugin","group":"CDN"},{"name":"Device Private Network","description":"","code_level":"concept","layer":"Sub App","difficulty":0,"type":"Android","group":"DPN"},{"name":"Device Private Network","description":"","code_level":"concept","layer":"Sub App Module","difficulty":0,"type":"Plugin","group":"DPN"},{"name":"Device Private Network","description":"","code_level":"concept","layer":"Middleware","difficulty":0,"type":"Plugin","group":"DPN"},{"name":"Device Private Network","description":"","code_level":"concept","layer":"Network Service","difficulty":0,"type":"Plugin","group":"DPN"}],"superLayers":[{"name":"Peer to Peer Network","code":"P2P","index":0,"dependsOn":"OSA"},{"name":"Crypto","code":"BCH","index":1,"dependsOn":"OSA"},{"name":"Operating System API","code":"OSA","index":2}]}';

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
/**
 * @class Represents the group of all header icons
 * @param {Number} columnWidth         The number of elements that contains a column
 * @param {Number} superLayerMaxHeight Max rows a superLayer can hold
 * @param {Number} groupsQtty          Number of groups (column headers)
 * @param {Number} layersQtty          Number of layers (rows)
 * @param {Array}  superLayerPosition  Array of the position of every superlayer
 */
function Headers(columnWidth, superLayerMaxHeight, groupsQtty, layersQtty, superLayerPosition) {
    
    // Private constants
    var INITIAL_POS = new THREE.Vector3(0, 0, 8000);
    
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
     * Arranges the headers in the table
     * @param {Number} [duration=2000] Duration of the animation
     */
    this.transformTable = function(duration) {
        var _duration = duration || 2000,
            i, l;
        
        helper.hide('stackContainer', _duration / 2);
        
        viewManager.transform(viewManager.targets.table);
        
        for(i = 0, l = objects.length; i < l; i++) {
            
            new TWEEN.Tween(objects[i].position)
            .to({
                x : positions.table[i].position.x,
                y : positions.table[i].position.y,
                z : positions.table[i].position.z
            }, _duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
        
        self.show(_duration);
    };
    
    /**
     * Shows the headers as a fade
     * @param {Number} duration Milliseconds of fading
     */
    this.show = function (duration) {
        var i;
        
        for (i = 0; i < objects.length; i++ ) {
            new TWEEN.Tween(objects[i].material)
            .to({opacity : 1, needsUpdate : true}, duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
    };
    
    /**
     * Hides the headers (but donesn't delete them)
     * @param {Number} duration Milliseconds to fade
     */
    this.hide = function (duration) {
        var i;
        
        for (i = 0; i < objects.length; i++) {
            new TWEEN.Tween(objects[i].material)
            .to({opacity : 0, needsUpdate : true}, duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
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
        
        /*var z = window.camera.getPosition().z - 3500,
            dimensions = {
                width : (objects[0]) ? objects[0].clientWidth : columnWidth * window.TILE_DIMENSION.width,
                height : (objects[0]) ? objects[0].clientHeight : columnWidth * window.TILE_DIMENSION.width,
            },
            i, level = 0;*/
        var i, obj;
        
        // Dummy, send all to center
        for(i = 0; i < objects.length; i++) {
            obj = new THREE.Object3D();
            obj.position.copy(INITIAL_POS);
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
        
        function createHeader(src, width, height) {
            
            var geometry = new THREE.PlaneGeometry(width, height),
                material = new THREE.MeshBasicMaterial({transparent : true, opacity : 0}),
                object = new THREE.Mesh(geometry, material);
            
            helper.applyTexture(src, object);
            
            return object;
        }
        
        var src, width, height;
            
        for (group in groups) {
            if (window.groups.hasOwnProperty(group) && group !== 'size') {

                headerData = window.groups[group];
                column = headerData.index;

                
                src = 'images/headers/' + group + '_logo.png';
                width = columnWidth * window.TILE_DIMENSION.width;
                height = width * 443 / 1379;

                object = createHeader(src, width, height);
                
                object.position.copy(INITIAL_POS);

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

                src = 'images/headers/' + slayer + '_logo.png';
                width = columnWidth * window.TILE_DIMENSION.width;
                height = width * 443 / 1379;

                object = createHeader(src, width, height);
                
                object.position.copy(INITIAL_POS);

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
            y -= lineHeight;
          }
          else {
            line = testLine;
          }
        }
        context.fillText(line, x, y);

        return y - lineHeight;
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
        img.style.left = '5%';
        img.style.top = '40%';
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
var table = [],
    viewManager = new ViewManager(),
    camera,
    scene = new THREE.Scene(),
    renderer,
    objects = [],
    headers = null,
    actualView = 'stack';

//Global constants
var TILE_DIMENSION = {
    width : 234,
    height : 140
},
    TILE_SPACING = 20;

$.ajax({
    url: "get_plugins.php",
    method: "GET"
}).success(
    function(lists) {
        var l = JSON.parse(lists);
        viewManager.fillTable(l);
        $('#splash').fadeTo(2000, 0, function() {
            $('#splash').remove();
            init();
            setTimeout(animate, 500);
        });
    }
);

/*var l = JSON.parse(testData);
    
    viewManager.fillTable(l);
    
    $('#splash').fadeTo(2000, 0, function() {
            $('#splash').remove();
            init();
            setTimeout( animate, 500);
        });*/

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


    //

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
    $('#tableViewButton').click(function() {
        if(actualView === 'stack')
            goToView('table');
        else
            goToView('stack');
    });
    $('#container').click(onClick);

    //Disabled Menu
    //initMenu();

    goToView('stack');
    
    /*setTimeout(function() {
        var loader = new Loader();
        loader.findThemAll();
    }, 2000);*/
}

/**
 * Changes the actual state of the viewer
 * @param {String} name The name of the target state
 */
function goToView(name) {
    
    var tableButton;
    
    actualView = name;
    
    switch(name) {
        case 'table':
            
            tableButton = document.getElementById('tableViewButton');
            var legendBtn = document.getElementById('legendButton');
            
            headers.transformTable();
            legendBtn.style.display = 'block';
            $(legendBtn).fadeTo(1000, 1);
            
            $(tableButton).fadeTo(1000, 0, function(){ 
                tableButton.style.display = 'block';
                tableButton.innerHTML = 'View Dependencies';
            });
            $(tableButton).fadeTo(1000, 1);
            
            break;
        case 'stack':
            
            tableButton = document.getElementById('tableViewButton');
            
            headers.transformStack();
            
            $(tableButton).fadeTo(1000, 0, function(){ 
                tableButton.style.display = 'block';
                tableButton.innerHTML = 'View Table';
            });
            $(tableButton).fadeTo(1000, 1);
            
            break;
        default:
            actualView = 'stack';
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

    if (targets != null)
        viewManager.transform(targets, 2000);
}

function onElementClick(id) {

    //var id = this.id;

    //var image = document.getElementById('img-' + id);
    

    if (camera.getFocus() == null) {

        camera.setFocus(id, 2000);
        setTimeout(function() {
            camera.setFocus(id, 1000);
            $('#backButton').fadeTo(1000, 1, function() {
                $('#backButton').show();
            });
        }, 3000);
        camera.disable();

        /*if (image != null) {

            var handler = function() {
                onImageClick(id, image, handler);
            };

            image.addEventListener('click', handler, true);
        } else {}*/
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
        
        var i, l;

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

function onClick(e) {
    
    var mouse = new THREE.Vector2(0, 0),
        clicked = [];
    
    if(actualView === 'table' && !camera.moving) {
    
        //Obtain normalized click location (-1...1)
        mouse.x = ((e.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width) * 2 - 1;
        mouse.y = - ((e.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1;
        
        clicked = camera.rayCast(mouse, objects);
        
        if(clicked && clicked.length > 0) {
            onElementClick(clicked[0].object.userData.id);
        }
    }
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
function ViewManager() {
    
    this.lastTargets = null;
    this.targets = {
        table: [],
        sphere: [],
        helix: [],
        grid: []
    };
    this.dimensions = {};
    
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
                    actualHeight+= 3;

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
    this.fillTable = function(list) {

        var pluginList = list.plugins,
            i, l, dependency;

        for (i = 0, l = list.superLayers.length; i < l; i++) {
            superLayers[list.superLayers[i].code] = {};
            superLayers[list.superLayers[i].code].name = list.superLayers[i].name;
            superLayers[list.superLayers[i].code].index = list.superLayers[i].index;

            if(list.superLayers[i].dependsOn && list.superLayers[i].dependsOn.length !== 0) {
                dependency = list.superLayers[i].dependsOn.split(' ').join('').split(',');
                superLayers[list.superLayers[i].code].dependsOn = dependency;
            }
        }

        for (i = 0, l = list.layers.length; i < l; i++) {
            layers[list.layers[i].name] = {};
            layers[list.layers[i].name].index = list.layers[i].index;
            layers[list.layers[i].name].super_layer = list.layers[i].super_layer;
        }

        for (i = 0, l = list.groups.length; i < l; i++) {
            groups[list.groups[i].code] = {};
            groups[list.groups[i].code].index = list.groups[i].index;

            if(list.groups[i].dependsOn && list.groups[i].dependsOn.length !== 0) {
                dependency = list.groups[i].dependsOn.split(' ').join('').split(',');
                groups[list.groups[i].code].dependsOn = dependency;
            }
        }


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
        
        groupsQtty = groups.size();
        layersQtty = layers.size();
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
            
            texture = createTexture(id, tileWidth, tileHeight, scale);
            
            mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(tileWidth, tileHeight),
                new THREE.MeshBasicMaterial({vertexColors : THREE.FaceColors, side : THREE.FrontSide, color : 0xffffff})
            );
            mesh.userData = {id : id};
            mesh.material.map = texture;
            mesh.material.needsUpdate = true;
            element.addLevel(mesh, levels[j][1]);
        }
        
        function createTexture(id, tileWidth, tileHeight, scale) {
            
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
                    src : base + 'portrait/' + levels[j][0] + '/' + state + '.png',
                    x : 0, y : 0,
                    w : tileWidth * scale, h : tileHeight * scale
                },
                groupIcon = {
                    src : base + 'icons/group/' + levels[j][0] + '/icon_' + group + '.png',
                    w : 28 * scale, h : 28 * scale
                },
                typeIcon = {
                    src : base + 'icons/type/' + levels[j][0] + '/' + type.toLowerCase() + '_logo.png',
                    w : 28 * scale, h : 28 * scale
                },
                ring = {
                    src : base + 'rings/' + levels[j][0] + '/' + state + '_diff_' + difficulty + '.png'
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
            
            if(id === 185)
                console.log("now");
            
            switch(state) {
                case "concept":
                    pic.x = 80 * scale;
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
                    pic.x = 82 * scale;
                    pic.y = 47 * scale;
                    pic.w = 53 * scale;
                    pic.h = 53 * scale;
                    
                    groupIcon.x = 35 * scale;
                    groupIcon.y = 76 * scale;
                    
                    typeIcon.x = 154 * scale;
                    typeIcon.y = 76 * scale;
                    
                    ring.x = 66 * scale;
                    ring.y = 31 * scale;
                    ring.w = 82 * scale;
                    ring.h = 81 * scale;
                    
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
                    ring.y = 35 * scale;
                    ring.w = 79 * scale;
                    ring.h = 68 * scale;
                    
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
                ring.src = base + 'rings/' + levels[j][0] + '/linear_diff_' + difficulty + '.png';
            
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
        }
        
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
        
        TWEEN.removeAll();

        if(goal) {
            this.lastTargets = goal;

            for (i = 0; i < objects.length; i++) {

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
            
            object.position.x = 0;
            object.position.y = 0;
            object.position.z = 80000;
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
            columnWidth : columnWidth,
            superLayerMaxHeight : superLayerMaxHeight,
            groupsQtty : groupsQtty,
            layersQtty : layersQtty,
            superLayerPosition : superLayerPosition
        };
    };
    
    /**
     * Takes away all the tiles except the one with the id
     * @param {Number} [id]            The id to let alone
     * @param {Number} [duration=2000] Duration of the animation
     */
    this.letAlone = function(id, duration) {
        
        var i, _duration = duration || 2000,
            distance = camera.getMaxDistance();
        
        TWEEN.removeAll();
        
        for(i = 0; i < objects.length; i++) {
            
            if(i === id) continue;
            
            new TWEEN.Tween(objects[i].position)
            .to({
                x: 0,
                y: 0,
                z: distance
            }, Math.random() * _duration + _duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
        
        new TWEEN.Tween(this)
            .to({}, _duration * 2)
            .onUpdate(render)
            .start();
    };
}