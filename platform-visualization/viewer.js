var table = [];

var camera, scene, renderer;
var controls;

var objects = [];
var targets = { table: [], sphere: [], helix: [], grid: [] };
var headers = [];

var lastTargets = null;
var focus = null;

$.ajax({
    url: "get_plugins.php",
    method: "GET"
}).success(
    function(lists) {
    
    var l = JSON.parse(lists);
    
    fillTable(l)
    
    init();
    animate();
});

/*var l = JSON.parse(testData);
    
    fillTable(l)
    
    init();
    animate();*/


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
    
    for ( var key in layers ) {
        if ( key == "size" ) continue;
        
        if ( layers[key].super_layer == true ) {
            
            section.push(0);
        }
        else {
            
            var newLayer = [];
            
            for ( var i = 0; i < groupsQtty; i++ )
                newLayer.push(0);
            
            section.push(newLayer);
        }
    }
    
    var preComputeLayout = function() {
        
        var _sections = [];
        var superLayerHeight = 0;
        var isSuperLayer = [];
        
        //Initialize
        for ( var key in layers ) {
            if ( key == "size" ) continue;
            
            if ( layers[key].super_layer == true ) {

                _sections.push(0);
                superLayerHeight++;
                
                if( superLayerMaxHeight < superLayerHeight ) superLayerMaxHeight = superLayerHeight;
            }
            else {

                var newLayer = [];
                superLayerHeight = 0;

                for ( var i = 0; i < groupsQtty; i++ )
                    newLayer.push(0);

                _sections.push(newLayer);
            }
            
            isSuperLayer.push(false);
        }
        
        for(var j = 0; j <= groupsQtty; j++) {
            
            elementsByGroup.push(0);
            //columnGroupPosition.push(0);
        }
        
        //Set sections sizes
         
        for(var i = 0; i < table.length; i++){
            
            var r = table[i].layerID;
            var c = table[i].groupID;
            
            elementsByGroup[c]++;
            
            if ( layers[table[i].layer].super_layer == true ) {
                
                _sections[r]++;
                isSuperLayer[r] = true;
            }
            else {
                
                _sections[r][c]++;
                
                if ( _sections[r][c] > columnWidth ) columnWidth = _sections[r][c];
            }
            
            //if ( c != groups.size() && elementsByGroup[c] > columnWidth ) columnWidth = elementsByGroup[c];
        }
        
        //Set row height
        
        var actualHeight = 0;
        var remainingSpace = superLayerMaxHeight;
        var inSuperLayer = false;
        var actualSuperLayer = 0;
        
        for ( var i = 0; i < layersQtty; i++ ) {
            
            if( isSuperLayer[i] ) {
                
                if(!inSuperLayer) {
                    actualHeight++;
                    
                    if ( superLayerPosition[ actualSuperLayer ] == undefined ) {
                        superLayerPosition[ actualSuperLayer ] = actualHeight;
                    }
                }
                
                inSuperLayer = true;
                actualHeight++;
                remainingSpace--;
            }
            else {
                
                if(inSuperLayer) {
                    
                    actualHeight += remainingSpace + 1;
                    remainingSpace = superLayerMaxHeight;
                    actualSuperLayer++;
                }
                
                inSuperLayer = false;
                actualHeight++;
            }
            
            layerPosition[ i ] = actualHeight;
        }
        
        /*var current = 0;
        var lastMax = 0;
        
        //Look for max
        for ( var i = 0; i < groupsQtty; i++ ) {
            
            var max = 0;
            
            for ( var j = 0; j < layersQtty; j++ ) {
                
                if ( typeof(_sections[j]) == "object" ) {
                    if(max < _sections[j][i]) max = _sections[j][i];
                }
            }
            
            current += lastMax;
            columnGroupPosition[i] = current + i;
            lastMax = max;
            
            
        }*/
    };
    preComputeLayout();
    
    for ( var i = 0; i < table.length; i++ ) {

        var element = createElement( i );

        var object = new THREE.CSS3DObject( element );
        object.position.x = Math.random() * 4000 - 2000;
        object.position.y = Math.random() * 4000 - 2000;
        object.position.z = Math.random() * 4000 - 2000;
        scene.add( object );

        objects.push( object );

        //
        
        var object = new THREE.Object3D();
        
        //Row (Y)
        var row = table[i].layerID;
        
        if ( layers[table[i].layer].super_layer == true) {
            
            object.position.x = ( (section[row]) * 140 ) - (columnWidth * groupsQtty * 140 / 2);
            
            section[row]++;
            
        }
        else {
            
            //Column (X)
            var column = table[i].groupID;
            object.position.x = ( ( (column * (columnWidth) + section[row][column]) + column ) * 140 ) - (columnWidth * groupsQtty * 140 / 2);

            section[row][column]++;
        }
        
        
        object.position.y = - ( (layerPosition[ row ] ) * 180 ) + (layersQtty * 180 / 2);

        targets.table.push( object );

    }
    
    // table groups icons
    
    for ( var group in groups ) {
        if ( group == 'size' ) continue;
        
        var column = groups[group];
        
        var image = document.createElement( 'img' );
        image.src = 'images/' + group + '_logo.png';
        image.width = columnWidth * 140;
        image.style.opacity = 0;
        headers.push( image );
        
        var object = new THREE.CSS3DObject( image );
        
        object.position.x = ( columnWidth * 140 ) * ( column - ( groupsQtty - 1 ) / 2) + (( column - 1 ) * 140);
        object.position.y = ((layersQtty + 5) * 180) / 2;
        
        scene.add( object );
    }
    
    for ( var slayer in superLayers ) {
        if ( slayer == 'size' ) continue;
        
        var row = superLayerPosition[ superLayers[ slayer ].index ];
        
        var image = document.createElement( 'img' );
        image.src = 'images/' + slayer + '_logo.png';
        image.height = superLayerMaxHeight * 180;
        image.style.opacity = 0;
        headers.push( image );
        
        var object = new THREE.CSS3DObject( image );
        
        object.position.x = - ( ( (groupsQtty + 1) * columnWidth * 140 / 2) + 140 );
        object.position.y = - ( row * 180 ) - ( superLayerMaxHeight * 180 / 2 ) + (layersQtty * 180 / 2);
        
        scene.add( object );
    }

    // sphere

    var vector = new THREE.Vector3();
    
    var indexes = [];
    
    for ( var i = 0; i <= groupsQtty; i++ ) indexes.push(0);
    
    for ( var i = 0; i < objects.length; i ++ ) {
        
        var g = (table[i].groupID != undefined) ? table[i].groupID : groupsQtty;
        
        var radious = 300 * (g + 1);
        
        var phi = Math.acos( ( 2 * indexes[g] ) / elementsByGroup[g] - 1 );
        var theta = Math.sqrt( elementsByGroup[g] * Math.PI ) * phi;

        var object = new THREE.Object3D();

        object.position.x = radious * Math.cos( theta ) * Math.sin( phi );
        object.position.y = radious * Math.sin( theta ) * Math.sin( phi );
        object.position.z = radious * Math.cos( phi );
        
        vector.copy( object.position ).multiplyScalar( 2 );

        object.lookAt( vector );
        
        //object.position.z -= 1000;

        targets.sphere.push( object );
        
        indexes[g]++;

        
    }

    // helix

    var vector = new THREE.Vector3();
    
    var helixSection = [];
    var current = [];
    var last = 0, helixPosition = 0;
    
    for ( var i = 0; i < layersQtty; i++ ) {
        
        var totalInRow = 0;
        
        for ( var j = 0; j < groupsQtty; j++ ) {
            
            if ( typeof(section[i] ) == "object" )
                totalInRow += section[i][j];
            else if (j == 0)
                totalInRow += section[i];
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

        //By layer
        object.position.x = ( ( gridLine[layer][0] % 5 ) * 200 ) - 450;
        object.position.y = ( - ( Math.floor( gridLine[layer][0] / 5) % 5 ) * 200 ) + 0;
        object.position.z = ( - gridLayers[layer] ) * 200 + (layersQtty * 50);
        gridLine[layer][0]++;
        
        targets.grid.push( object );

    }

    //
    
    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = (columnWidth * groupsQtty * 140);

    renderer = new THREE.CSS3DRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.position = 'absolute';
    document.getElementById( 'container' ).appendChild( renderer.domElement );

    //

    controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.rotateSpeed = 1.3;
    controls.minDistance = 500;
    controls.maxDistance = 80000;
    controls.addEventListener( 'change', render );

    var button = document.getElementById( 'table' );
    button.addEventListener( 'click', function ( event ) {

        changeView( targets.table );

    }, false );

    var button = document.getElementById( 'sphere' );
    button.addEventListener( 'click', function ( event ) {

        changeView( targets.sphere );

    }, false );

    var button = document.getElementById( 'helix' );
    button.addEventListener( 'click', function ( event ) {

        changeView( targets.helix );

    }, false );

    var button = document.getElementById( 'grid' );
    button.addEventListener( 'click', function ( event ) {

        changeView( targets.grid );

    }, false );

    transform( targets.table, 2000 );

    //

    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'keydown', onKeyDown, false );

}

function changeView(targets) {
    
    if( targets != null )
        transform( targets, 2000 );
    
    
    controls.enabled = true;
        
    if ( focus != null )
        loseFocus();
}

function onElementClick() {
    
    var id = this.id;
    
    var image = document.getElementById('img-' + id);
    
    if ( focus == null ) {
        
        setFocus(id, 2000);
        setTimeout( function() {
            setFocus(id, 1000);
        }, 3000 );
        controls.enabled = false;

        if ( image != null ) {

            var handler = function() { onImageClick(id, image, handler); };

            image.addEventListener( 'click', handler, true );
        }
    }
    
    focus = id;
}

function onImageClick(id, image, handler) {
    
    image.removeEventListener( 'click', handler, true );

    createSidePanel( id, image );
    createElementsPanel( id );
}

function createSidePanel( id, image ) {
    
    var sidePanel = document.createElement( 'div' );
    sidePanel.id = 'sidePanel';
    sidePanel.style.position = 'absolute';
    sidePanel.style.top = '0px';
    sidePanel.style.bottom = '0px';
    sidePanel.style.left = '0px';
    sidePanel.style.marginTop = '50px';
    sidePanel.style.width = '35%';
    sidePanel.style.textAlign = 'center';
    
    var panelImage = document.createElement( 'img' );
    panelImage.id = 'focusImg';
    panelImage.src = image.src;
    panelImage.style.position = 'relative';
    panelImage.style.width = '50%';
    panelImage.style.opacity = 0;
    sidePanel.appendChild( panelImage );
    
    var userName = document.createElement( 'p' );
    userName.style.opacity = 0;
    userName.style.position = 'relative';
    userName.style.fontWeight = 'bold';
    userName.textContent = table[ id ].author;
    sidePanel.appendChild( userName );
    
    var realName = document.createElement( 'p' );
    realName.style.opacity = 0;
    realName.style.position = 'relative';
    realName.textContent = table[ id ].authorRealName;
    sidePanel.appendChild( realName );
    
    var email = document.createElement( 'p' );
    email.style.opacity = 0;
    email.style.position = 'relative';
    email.textContent = table[ id ].authorEmail;
    sidePanel.appendChild( email );
    
    $('#container').append(sidePanel);
    
    $(renderer.domElement).fadeTo(1000, 0);
    
    $(panelImage).fadeTo(1000, 1, function() {
        $(userName).fadeTo(1000, 1, function() {
            $(realName).fadeTo(1000, 1, function() {
                $(email).fadeTo(1000, 1);
            });
        });
    });
    
    
}

function createElementsPanel( id ) {
    
    var elementPanel = document.createElement( 'div' );
    elementPanel.id = 'elementPanel';
    elementPanel.style.position = 'absolute';
    elementPanel.style.top = '0px';
    elementPanel.style.bottom = '0px';
    elementPanel.style.right = '0px';
    elementPanel.style.marginTop = '50px';
    elementPanel.style.marginRight = '5%';
    elementPanel.style.width = '60%';
    elementPanel.style.overflowY = 'auto';
    
    $('#container').append(elementPanel);
    
    for ( i = 0; i < table.length; i++ ) {
        
        if ( table[ id ].author == table[ i ].author ) {
            
            var clone = document.getElementById( i ).cloneNode(true);

            clone.id = 'task-' + i;
            clone.style.transform = '';
            $(clone).find('img').remove();
            clone.style.position = 'relative';
            clone.style.display = 'inline-block';
            clone.style.marginLeft = '5px';
            clone.style.opacity = 0;
            elementPanel.appendChild(clone);
            
            $(clone).fadeTo(2000, 1);
        }
    }
    
}

function createElement( i ) {
    
    var element = document.createElement( 'div' );
    element.className = 'element';
    element.id = i;

    element.addEventListener( 'click', onElementClick, false);

    if ( table[i].picture != undefined) {
        var picture = document.createElement( 'img' );
        picture.id = 'img-' + i;
        picture.className = 'picture';
        picture.src = table[i].picture;
        element.appendChild( picture );
    }

    var difficulty = document.createElement( 'div' );
    difficulty.className = 'difficulty';
    difficulty.textContent = printDifficulty( Math.floor( table[i].difficulty / 2 ) );
    element.appendChild( difficulty );

    var number = document.createElement( 'div' );
    number.className = 'number';
    number.textContent = (table[ i ].group != undefined) ? table[i].group : "";
    element.appendChild( number );

    var symbol = document.createElement( 'div' );
    symbol.className = 'symbol';
    symbol.textContent = table[ i ].code;
    element.appendChild( symbol );

    var details = document.createElement( 'div' );
    details.className = 'details';

    var pluginName = document.createElement( 'p' );
    pluginName.innerHTML = table[ i ].name;
    pluginName.className = 'name';

    var layerName = document.createElement( 'p' );
    layerName.innerHTML = table[ i ].layer;

    details.appendChild( pluginName );
    details.appendChild( layerName );
    element.appendChild( details );

    switch ( table[i].code_level ) {

        case "production":
            element.style.boxShadow = '0px 0px 12px rgba(244,133,107,0.5)';
            element.style.backgroundColor = 'rgba(234,123,97,' + ( Math.random() * 0.25 + 0.45 ) + ')';

            number.style.color = 'rgba(234,123,97,1)';
            layerName.style.color = 'rgba(234,123,97,1)';

            break;
        case "development":
            element.style.boxShadow = '0px 0px 12px rgba(80,188,107,0.5)';
            element.style.backgroundColor = 'rgba(70,178,97,'+ ( Math.random() * 0.25 + 0.45 ) +')';

            number.style.color = 'rgba(70,178,97,1)';
            layerName.style.color = 'rgba(70,178,97,1)';

            break;
        case "concept":
            element.style.boxShadow = '0px 0px 12px rgba(150,150,150,0.5)';
            element.style.backgroundColor = 'rgba(170,170,170,'+ ( Math.random() * 0.25 + 0.45 ) +')';

            number.style.color = 'rgba(127,127,127,1)';
            layerName.style.color = 'rgba(127,127,127,1)';

            break;
    }
    
    return element;
}

function setFocus(id, duration) {
    
    TWEEN.removeAll();
    
    var vec = new THREE.Vector4(0, 0, 180, 1);
    var target = objects[ id ];
    
    vec.applyMatrix4( target.matrix );
    
    new TWEEN.Tween( controls.target )
        .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
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
        new TWEEN.Tween( headers[ i ].style )
            .to( { opacity : 0 }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();
    }
    
    for( var i = 0; i < objects.length; i++ ) {
        
        if ( i == id ) continue;
        
        new TWEEN.Tween( objects[ i ].position )
            .to( { x: 0, y: 0, z: controls.maxDistance }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();
    }
    
    
}

function loseFocus() {
    
    $('#sidePanel').fadeTo(1000, 0, function() { $('#sidePanel').remove(); });
    $('#elementPanel').fadeTo(1000, 0, function() { $('#elementPanel').remove(); });
    $(renderer.domElement).fadeTo(1000, 1);
    
    focus = null;
}

function printDifficulty(value) {
    var max = 5;
    var result = "";
    
    while ( value > 0 ) {
        result += '★';
        max--;
        value--;
    }
    
    while ( max > 0 ) {
        result += '☆';
        max--;
    }
    
    return result;
}

function fillTable(list) {
    
    var pluginList = list.plugins;
    
    for(var i = 0; i < list.superLayers.length; i++) {
        superLayers[list.superLayers[i].code] = {};
        superLayers[list.superLayers[i].code].name = list.superLayers[i].name;
        superLayers[list.superLayers[i].code].index = list.superLayers[i].index;
    }
    
    for(var i = 0; i < list.layers.length; i++) {
        layers[list.layers[i].name] = {};
        layers[list.layers[i].name].index = list.layers[i].index;
        layers[list.layers[i].name].super_layer = list.layers[i].super_layer;
    }
    
    for(var i = 0; i < list.groups.length; i++)
        groups[list.groups[i].code] = list.groups[i].index;
    
    
    for(var i = 0; i < pluginList.length; i++) {
        
        var data = pluginList[i];
        
        var _group = data.group;
        var _layer = data.layer;
        var _name = data.name;
        
        var layerID = layers[_layer].index;
        layerID = (layerID == undefined) ? layers.size() : layerID;
        
        var groupID = groups[_group];
        groupID = (groupID == undefined) ? groups.size() : groupID;
        
        var element = {
            group : _group,
            groupID : groupID,
            code : getCode(_name),
            name : _name,
            layer : _layer,
            layerID : layerID,
            type : data.type,
            picture : data.authorPicture,
            author : data.authorName,
            authorRealName : data.authorRealName,
            authorEmail : data.authorEmail,
            difficulty : data.difficulty,
            code_level : data.code_level,
            life_cycle : data.life_cycle
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
    
    if( words.length == 1) { //if N = 1, use whole word or 3 first letters
        
        if(words[0].length <= 4)
            code = capFirstLetter( words[0] );
        else
            code = capFirstLetter( words[0].slice( 0, 3 ) );
    }
    else if( words.length == 2 ) { //if N = 2 use first cap letter, and second letter
        
        code += words[0].charAt(0).toUpperCase() + words[0].charAt(1);
        code += words[1].charAt(0).toUpperCase() + words[1].charAt(1);
    }
    else { //if N => 3 use the N (up to 4) letters caps
        
        var max = (words.length < 4) ? words.length : 4;

        for(var i = 0; i < max; i++)
            code += words[i].charAt(0);
    }
    
    return code;
}

function transform( goal, duration ) {

    TWEEN.removeAll();
    
    lastTargets = goal;

    for ( var i = 0; i < objects.length; i ++ ) {

        var object = objects[ i ];
        var target = goal[ i ];

        new TWEEN.Tween( object.position )
            .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

        new TWEEN.Tween( object.rotation )
            .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();

    }
    
    if ( goal == targets.table ) {
        for ( var i = 0; i < headers.length; i++ ) {
            new TWEEN.Tween( headers[ i ].style )
                .to( { opacity : 1 }, Math.random() * duration + duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();
        }
    }
    else {
        for ( var i = 0; i < headers.length; i++ ) {
            new TWEEN.Tween( headers[ i ].style )
                .to( { opacity : 0 }, Math.random() * duration + duration )
                .easing( TWEEN.Easing.Exponential.InOut )
                .start();
        }
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

function onKeyDown( event ) {
    
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
}

function animate() {

    requestAnimationFrame( animate );

    TWEEN.update();
    
    controls.update();

}

function render() {

    renderer.render( scene, camera );

}