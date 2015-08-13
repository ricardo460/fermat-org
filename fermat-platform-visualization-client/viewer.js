var table = [];

var camera, scene, renderer;
var controls;

var objects = [];
var targets = { table: [], sphere: [], helix: [], grid: [] };

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 3000;

    scene = new THREE.Scene();

    // table
    fillTable();

    var groupsQtty = 5;
    var section = [];
    
    //FIXME: When deleted TEMPORAL note below, change to j < layers.size()
    for(var i = 0; i < groupsQtty; i++){
        var row = [];
        
        for(var j = 0; j <= layers.size(); j++) row.push(0);
        
        section.push(row);
    }
    
    var columnGroupWidth = 7;
    var rowGroupHeight = 2;
    
    //As a temporal solution, precompute layout to don't have tiles far away
    var preComputeLayout = function() {
        
        var _sections = [];
        rowGroupHeight = [];
        
        for(var i = 0; i <= layers.size(); i++){
            var _row = [];

            for(var j = 0; j < groupsQtty; j++) _row.push(0);

            _sections.push(_row);
        }
        
        for(var i = 0; i < table.length; i++){
            var c = groups[table[i].group];
            var r = layers[table[i].layer];
            
            if(r == undefined) r = layers.size();
            
            _sections[r][c]++;
            
        }
        
        for(var i = 0; i < _sections.length; i++){
            
            var max = 0;
            
            for(var j = 0; j < _sections[i].length; j++){
                
                if(max < _sections[i][j]) max = _sections[i][j];
            }
            
            var last;
            
            if(rowGroupHeight.length <= 1) last = 0;
            else last = rowGroupHeight[i - 1];
                
            rowGroupHeight.push(last + Math.ceil(max / columnGroupWidth));
        }
    };
    preComputeLayout();
    
    for ( var i = 0; i < table.length; i++ ) {

        var element = document.createElement( 'div' );
        element.className = 'element';
        element.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';

        var number = document.createElement( 'div' );
        number.className = 'number';
        number.textContent = table[ i ].group;
        element.appendChild( number );

        var symbol = document.createElement( 'div' );
        symbol.className = 'symbol';
        symbol.textContent = table[ i ].code;
        element.appendChild( symbol );

        var details = document.createElement( 'div' );
        details.className = 'details';
        details.innerHTML = table[ i ].name + '<br>' + table[ i ].layer;
        element.appendChild( details );

        var object = new THREE.CSS3DObject( element );
        object.position.x = Math.random() * 4000 - 2000;
        object.position.y = Math.random() * 4000 - 2000;
        object.position.z = Math.random() * 4000 - 2000;
        scene.add( object );

        objects.push( object );

        //
        
        //Column (X)
        var column = groups[table[i].group];
        
        //Row (Y)
        var row = layers[table[i].layer];
        
        //TEMPORAL: There are plugins without specific layer, put it last for now
        if(row == undefined) {
            row = layers.size();
            
            //Marked as gray the unallocated plugins
            object.element.style.backgroundColor = 'rgba(127,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';
        }
        
        
        var object = new THREE.Object3D();
        object.position.x = ( (column * columnGroupWidth + (section[column][row] % (columnGroupWidth-1))) * 140 ) - 1330;
        object.position.y = - ( (rowGroupHeight[row] + Math.floor(section[column][row]/(columnGroupWidth-1))) * 180 ) + 990;
        
        section[column][row]++;
        //rows[row]++;

        targets.table.push( object );

    }

    // sphere

    var vector = new THREE.Vector3();

    for ( var i = 0, l = objects.length; i < l; i ++ ) {

        var phi = Math.acos( -1 + ( 2 * i ) / l );
        var theta = Math.sqrt( l * Math.PI ) * phi;

        var object = new THREE.Object3D();

        object.position.x = 800 * Math.cos( theta ) * Math.sin( phi );
        object.position.y = 800 * Math.sin( theta ) * Math.sin( phi );
        object.position.z = 800 * Math.cos( phi );

        vector.copy( object.position ).multiplyScalar( 2 );

        object.lookAt( vector );

        targets.sphere.push( object );

    }

    // helix

    var vector = new THREE.Vector3();

    for ( var i = 0, l = objects.length; i < l; i ++ ) {

        var phi = i * 0.175 + Math.PI;

        var object = new THREE.Object3D();

        object.position.x = 900 * Math.sin( phi );
        object.position.y = - ( i * 8 ) + 450;
        object.position.z = 900 * Math.cos( phi );

        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;

        object.lookAt( vector );

        targets.helix.push( object );

    }

    // grid

    for ( var i = 0; i < objects.length; i ++ ) {

        var object = new THREE.Object3D();

        object.position.x = ( ( i % 5 ) * 400 ) - 800;
        object.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * 400 ) + 800;
        object.position.z = ( Math.floor( i / 25 ) ) * 1000 - 2000;

        targets.grid.push( object );

    }

    //

    renderer = new THREE.CSS3DRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.position = 'absolute';
    document.getElementById( 'container' ).appendChild( renderer.domElement );

    //

    controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.rotateSpeed = 0.5;
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener( 'change', render );

    var button = document.getElementById( 'table' );
    button.addEventListener( 'click', function ( event ) {

        transform( targets.table, 2000 );

    }, false );

    var button = document.getElementById( 'sphere' );
    button.addEventListener( 'click', function ( event ) {

        transform( targets.sphere, 2000 );

    }, false );

    var button = document.getElementById( 'helix' );
    button.addEventListener( 'click', function ( event ) {

        transform( targets.helix, 2000 );

    }, false );

    var button = document.getElementById( 'grid' );
    button.addEventListener( 'click', function ( event ) {

        transform( targets.grid, 2000 );

    }, false );

    transform( targets.table, 2000 );

    //

    window.addEventListener( 'resize', onWindowResize, false );

}

function fillTable() {
    
    for(var i = 0; i < testContent.length; i++) {
        
        var data = testContent[i].split('-');
        
        var _group = data[0].toUpperCase();
        var _type = capFirstLetter(data[1]);
        var _layer = capFirstLetter(data[2]);
        var _name = capFirstLetter(data[3]);
        var _code = getCode(_name);
        
        var element = {
            group : _group,
            code : _code,
            name : _name,
            layer : _layer,
            type : _type
        };
        
        table.push(element);
    }
}

function capFirstLetter(string) {
    var words = string.split(" ");
    var result = "";
    
    for(var i = 0; i < words.length; i++)
        result += words[i].charAt(0).toUpperCase() + words[i].slice(1) + " ";
    
    return result.trim();
}

function getCode(pluginName) {
    var words = pluginName.split(" ");
    var code = "";
    
    if(words.length <= 2) { //if N < 2 use first cap letter, and last letter
        code += words[0].charAt(0).toUpperCase() + words[0].charAt(words[0].length - 1);
    
        if(words.length == 2) //if N = 2 use both words, with first letter cap and last letter
            code += words[1].charAt(0).toUpperCase() + words[1].charAt(words[1].length - 1);
    }
    else { //if N => 3 use the N (up to 4) letters caps
        var max = (words.length < 4) ? words.length : 4;

        for(var i = 0; i < max; i++)
            code += words[i].charAt(0);
    }
    
    return code;
}

function transform( targets, duration ) {

    TWEEN.removeAll();

    for ( var i = 0; i < objects.length; i ++ ) {

        var object = objects[ i ];
        var target = targets[ i ];

        new TWEEN.Tween( object.position )
            .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

        new TWEEN.Tween( object.rotation )
            .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

    }

    new TWEEN.Tween( this )
        .to( {}, duration * 2 )
        .onUpdate( render )
        .start();

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}

function animate() {

    requestAnimationFrame( animate );

    TWEEN.update();

    controls.update();

}

function render() {

    renderer.render( scene, camera );

}