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

        /*new TWEEN.Tween( controls.target )
            .to( { x: target.position.x, y: target.position.y, z: target.position.z }, duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();*/

        new TWEEN.Tween( camera.position )
            .to( { x: vec.x, y: vec.y, z: vec.z }, Math.random() * duration + duration )
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
                .to( { x: controls.position0.x, y: controls.position0.y, z: controls.position0.z }, Math.random() * duration + duration )
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