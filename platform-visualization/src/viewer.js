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

/*$.ajax({
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
);*/

var l = JSON.parse(testData);
    
    viewManager.fillTable(l);
    
    $('#splash').fadeTo(2000, 0, function() {
            $('#splash').remove();
            init();
            setTimeout( animate, 500);
        });

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
    
    if(actualView === 'table') {
    
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

function createElement(i) {
   
    var canvas,
        ctx,
        center,
        texture,
        material,
        mesh,
        font = 'Helvetica, sans-serif',
        levelColor,
        lastY;
    
    canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 160;
    center = 60;
    ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(0, 0, 120, 160);
    
    ctx.textAlign = 'center';
    
    // Layer
    ctx.font = '12px ' + font;
    ctx.fillStyle = helper.getLevelColor(table[i].code_level);
    lastY = drawText(table[i].layer, center, 150, ctx, 12, 120, 14);
    
    // Group
    var text = ((table[ i ].group !== undefined) ? table[i].group : layers[table[i].layer].super_layer);
    drawText(text, 97, 17, ctx, 116, 14);
    
    // Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px ' + font;
    drawText(table[i].name, center, lastY, ctx, 12 + 12, 120, 14);
    
    // Dificulty
    ctx.font = '14px ' + font;
    drawText(helper.printDifficulty(Math.floor( table[i].difficulty / 2)), center, 93 + 14, ctx, 116, 14);
    
    // Symbol
    ctx.font = 'bold 25px ' + font;
    drawText(table[i].code, center, 22 + 25, ctx, 25, 120, 22);
    
    
    
    // Mesh Creation
    texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.NearestFilter;
    material = new THREE.MeshBasicMaterial({
        map : texture
    });
    mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(canvas.width, canvas.height), material);
    mesh.doubleSided = true;
    
    return mesh;
    
    
/*    var element = document.createElement( 'div' );
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
    number.textContent = (table[ i ].group != undefined) ? table[i].group : layers[table[i].layer].super_layer;
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

        case "concept":
            element.style.boxShadow = '0px 0px 12px rgba(150,150,150,0.5)';
            element.style.backgroundColor = 'rgba(170,170,170,'+ ( Math.random() * 0.25 + 0.45 ) +')';

            number.style.color = 'rgba(127,127,127,1)';
            layerName.style.color = 'rgba(127,127,127,1)';

            break;
        case "development":
            element.style.boxShadow = '0px 0px 12px rgba(244,133,107,0.5)';
            element.style.backgroundColor = 'rgba(234,123,97,' + ( Math.random() * 0.25 + 0.45 ) + ')';

            number.style.color = 'rgba(234,123,97,1)';
            layerName.style.color = 'rgba(234,123,97,1)';


            break;
        case "qa":
            element.style.boxShadow = '0px 0px 12px rgba(244,244,107,0.5)';
            element.style.backgroundColor = 'rgba(194,194,57,' + ( Math.random() * 0.25 + 0.45 ) + ')';

            number.style.color = 'rgba(194,194,57,1)';
            layerName.style.color = 'rgba(194,194,57,1)';


            break;
        case "production":
            element.style.boxShadow = '0px 0px 12px rgba(80,188,107,0.5)';
            element.style.backgroundColor = 'rgba(70,178,97,'+ ( Math.random() * 0.25 + 0.45 ) +')';

            number.style.color = 'rgba(70,178,97,1)';
            layerName.style.color = 'rgba(70,178,97,1)';
            
            break;
    }
    
    return element;*/
}

function drawText(text, x, y, context, size, maxWidth, lineHeight) {
    
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
    /*if(ctx.measureText(text).width < ctx.canvas.width - 4) {
        ctx.fillText(text, x, y);
    } 
    else {
        
        var words = text.split(' ');
        var half = Math.ceil(words.length / 2);
        var half1 = words.slice(0, half);
        var half2 = words.slice(half);
        var text1 = '', text2 = '';
        
        if(words.length >= 5){
            half = half;
        }
        
        for( var i = 0; i < half1.length; i++) {
            text1 += half1[i] + ' ';
        }
        text1 = text1.trim();
        
        for( var i = 0; i < half2.length; i++) {
            text2 += half2[i] + ' ';
        }
        text2 = text2.trim();
        
        drawText(text1, x, y - size - 3, ctx, size);
        drawText(text2, x, y, ctx, size);
    }*/
}
        