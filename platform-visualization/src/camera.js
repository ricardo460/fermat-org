function Camera(position, renderer, renderFunc) {
    
    //Private Properties
    var camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
    var controls = new THREE.TrackballControls( camera, renderer.domElement );
    var focus = null;
    
    camera.position.copy( position );

    controls.rotateSpeed = 1.3;
    controls.minDistance = 500;
    controls.maxDistance = 80000;
    controls.addEventListener( 'change', renderFunc );
    controls.position0.copy( position );
    
    // Public Methods
    this.disable = function() {
        controls.enabled = false;
    };
    
    this.enable = function() {
        controls.enabled = true;
    };
    
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

        for ( var i = 0; i < headers.length; i++ ) {
            /*new TWEEN.Tween( headers[ i ].style )
                .to( { opacity : 0 }, Math.random() * duration + duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();*/
            $(headers[i]).fadeTo( Math.random() * duration + duration, 0);
        }

        for( var i = 0; i < objects.length; i++ ) {

            if ( i == id ) continue;

            new TWEEN.Tween( objects[ i ].position )
                .to( { x: 0, y: 0, z: controls.maxDistance }, Math.random() * duration + duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();
        }
    };
    
    this.loseFocus = function() {
        
        if ( focus != null ) {
            var backButton = document.getElementById('backButton');
            $(backButton).fadeTo(1000, 0, function() { backButton.style.display = 'none'; } );
            $('#sidePanel').fadeTo(1000, 0, function() { $('#sidePanel').remove(); });
            $('#elementPanel').fadeTo(1000, 0, function() { $('#elementPanel').remove(); });
            $('#timelineContainer').fadeTo(1000, 0, function() { $('#timelineContainer').remove(); });
            $(renderer.domElement).fadeTo(1000, 1);

            focus = null;
        }
    };
    
    this.onWindowResize = function() {
        
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

        render();
    };
    
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
    
    this.update = function() {
        
        controls.update();
    };
    
    this.render = function ( renderer, scene ) {
        
        renderer.render ( scene, camera );
    };
    
    this.getFocus = function () { return focus; };
    
    // Events
    window.addEventListener( 'resize', this.onWindowResize, false );
    window.addEventListener( 'keydown', this.onKeyDown, false );
}