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

    var groupsQtty = groups.size();
    var layersQtty = layers.size();
    var section = [];
    var elementsByGroup = [];   //Elements contained by groups
    var columnGroupPosition = [];
    //var columnGroupWidth = [];
    //var rowGroupHeight = [];
    
    //FIXME: When deleted TEMPORAL note below, change to j < layersQtty
    for(var i = 0; i < groupsQtty; i++){
        var column = [];
        
        for(var j = 0; j <= layersQtty; j++) column.push(0);
        
        section.push(column);
        elementsByGroup.push(0);
        //columnGroupWidth.push(0);
        columnGroupPosition.push(0);
    }
    
    //As a temporal solution, precompute layout to don't have tiles far away
    var preComputeLayout = function() {
        
        var _sections = [];
        
        //Initialize
        for(var i = 0; i <= layersQtty; i++){
            var _row = [];

            for(var j = 0; j < groupsQtty; j++) _row.push(0);

            _sections.push(_row);
        }
        
        //Set sections sizes
        for(var i = 0; i < table.length; i++){
            var c = table[i].groupID;
            var r = table[i].layerID;
            
            _sections[r][c]++;
            elementsByGroup[c]++;
            
        }
        
        var current = 0;
        var lastMax = 0;
        
        //Look for max
        for ( var i = 0; i < _sections[0].length; i++ ) {
            
            var max = 0;
            
            for ( var j = 0; j < _sections.length; j++ ) {
                
                if(max < _sections[j][i]) max = _sections[j][i];
                
            }
            
            current += lastMax;
            columnGroupPosition[i] = current;
            lastMax = max;
            
            
        }
        
//        //Set max for every column and column position
//        var position = 0;
//        var lastMax = 0;
//        
//        for(var i = 0; i < _sections.length; i++){
//            
//            var max = 0;
//            var maxColumn = 0;
//            
//            for(var j = 0; j < _sections[i].length; j++){
//                
//                if(max < _sections[i][j]) {
//                    max = _sections[i][j];
//                    maxColumn = j;
//                }
//            }
//            
//            if(max != 0) {
//                columnGroupPosition[maxColumn] = max;
//                lastMax = max;
//            }
//            
//            
//            /*if(max != 0) {
//                position += lastMax;
//                rowGroupHeight.push(position);
//                lastMax = max; //if columnWidth were fixed (Math.ceil(max / columnGroupWidth));
//            } else
//                rowGroupHeight.push(0);*/
//        }
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
        var column = table[i].groupID;
        
        //Row (Y)
        var row = table[i].layerID;
        
        //TEMPORAL: There are plugins without specific layer, put it last for now
        if(row == layersQtty) {            
            //Marked as gray the unallocated plugins
            object.element.style.backgroundColor = 'rgba(127,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';
        }
        
        
        var object = new THREE.Object3D();
        object.position.x = ( (columnGroupPosition[column] + section[column][row]) * 140 ) - 1330;
        object.position.y = - ( (row) * 180 ) + 990;
        
        //object.position.x = ( (column * columnGroupWidth + (section[column][row] % (columnGroupWidth-1))) * 140 ) - 1330;
        //object.position.y = - ( (rowGroupHeight[row]  + Math.floor(section[column][row]/(columnGroupWidth-1))) * 180 ) + 990;
        
        section[column][row]++;

        targets.table.push( object );

    }

    // sphere

    var vector = new THREE.Vector3();
    
    var indexes = [];
    
    for ( var i = 0; i < groupsQtty; i++ ) indexes.push(0);
    
    for ( var i = 0; i < objects.length; i ++ ) {
        
        var g = table[i].groupID;
        
        var radious = g * 1500 + 600;
        
        var phi = Math.acos( ( 2 * indexes[g] ) / elementsByGroup[g] - 1 );
        var theta = Math.sqrt( elementsByGroup[g] * Math.PI ) * phi;

        var object = new THREE.Object3D();

        object.position.x = radious * Math.cos( theta ) * Math.sin( phi );
        object.position.y = radious * Math.sin( theta ) * Math.sin( phi );
        object.position.z = radious * Math.cos( phi );
        
        vector.copy( object.position ).multiplyScalar( 2 );

        object.lookAt( vector );

        targets.sphere.push( object );
        
        indexes[g]++;

        
    }

    // helix

    var vector = new THREE.Vector3();
    
    var helixSection = [];
    var current = [];
    var last = 0, helixPosition = 0;
    
    for ( var i = 0; i < section[0].length; i++ ) {
        
        var totalInRow = 0;
        
        for ( var j = 0; j < section.length; j++ ) {
            
            totalInRow += section[j][i];
            
        }
        
        helixPosition += last;
        helixSection.push(helixPosition);
        last = totalInRow;
        
        current.push(0);
    }

    for ( var i = 0, l = objects.length; i < l; i ++ ) {

        var row = table[i].layerID;
        
        var x = helixSection[row] + current[row];
        current[row]++;
        
        
        var phi = x * 0.175 + Math.PI;

        var object = new THREE.Object3D();

        object.position.x = 900 * Math.sin( phi );
        object.position.y = - ( x * 8 ) + 450;
        object.position.z = 900 * Math.cos( phi );

        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;

        object.lookAt( vector );

        targets.helix.push( object );

    }

    // grid
    
    var gridLine = [];
    var gridLayers = [];
    var lastLayer = 0;
    
    
    for ( var i = 0; i < layersQtty + 1; i++ ) {
        
        //gridLine.push(0);
        var gridLineSub = [];
        var empty = true;
        
        for ( var j = 0; j < section.length; j++ ) {
            
            if(section[j][i] != 0) empty = false;
            
            gridLineSub.push(0);
        }
        
        if(!empty) lastLayer++;
        
        gridLayers.push(lastLayer);
        gridLine.push(gridLineSub);
    }

    for ( var i = 0; i < objects.length; i ++ ) {

        var group = table[i].groupID;
        var layer = table[i].layerID;
        
        var object = new THREE.Object3D();

        //By group
        object.position.x = ( ( gridLine[layer][group] ) * 200 ) - 800;
        object.position.y = ( - ( gridLayers[layer] ) * 200 ) + 800;
        object.position.z = ( group ) * 200 ;
        gridLine[layer][group]++;

        //By layer
        /*object.position.x = ( ( gridLine[layer][0] % 5 ) * 200 ) - 800;
        object.position.y = ( - ( Math.floor( gridLine[layer][0] / 5) % 5 ) * 200 ) + 800;
        object.position.z = ( - gridLayers[layer] ) * 200 + (layersQtty * 100);
        gridLine[layer][0]++;*/
        
        targets.grid.push( object );

    }

    //

    renderer = new THREE.CSS3DRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.position = 'absolute';
    document.getElementById( 'container' ).appendChild( renderer.domElement );

    //

    controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.rotateSpeed = 1.3;
    controls.minDistance = 500;
    controls.maxDistance = 20000;
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
        
        var layerID = layers[_layer];
        layerID = (layerID == undefined) ? layers.size() : layerID;
        
        var groupID = groups[_group];
        groupID = (groupID == undefined) ? groups.size() : groupID;
        
        var element = {
            group : _group,
            groupID : groupID,
            code : _code,
            name : _name,
            layer : _layer,
            layerID : layerID,
            type : _type
        };
        
        table.push(element);
    }
    
    table.sort(function(a, b) {
        if(a.code > b.code) return 1;
        if(a.code < b.code) return -1;
        return 0;
    });
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