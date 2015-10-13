var table = [],
    helper = new Helper(),
    camera,
    scene = new THREE.Scene(),
    renderer,
    objects = [],
    headers = null,
    actualView = 'start',
    stats = null,
    actualFlow = null;

//Global constants
var TILE_DIMENSION = {
    width : 231,
    height : 140
},
    TILE_SPACING = 20;

getData();

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

    // uncomment for testing
    //create_stats();

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

    $('#browserRightButton').click(function() {
       if ( actualView === 'start' )
            goToView('table');
       else if ( actualView === 'table' )
            goToView('stack');
    });
    
    $('#browserLeftButton').click(function() {
       if ( actualView === 'start' ) ;
       //     goToView('stack');
       else if ( actualView === 'table' )
            goToView('start');
       else if ( actualView === 'stack' )
            goToView('table');
    });

    $('#container').click(onClick);

    //Disabled Menu
    //initMenu();

    setTimeout(function() {goToView('table'); }, 500);
    
    /*setTimeout(function() {
        var loader = new Loader();
        loader.findThemAll();
    }, 2000);*/
}

/**
 * @author Miguel Celedon
 * @lastmodifiedBy Ricardo Delgado
 * Changes the actual state of the viewer
 * @param {String} name The name of the target state
 */
function goToView ( current ) {
    
    actualView = current;

    switch(current) {
        case 'table':

            modifyButtonLegend(1);

            headers.transformTable();
            setTimeout(function() {
                viewManager.transform(viewManager.targets.table, 4000);
            }, 4000);
            
            modifyButtonRight( 'View Dependencies', 'none');
           
            modifyButtonLeft( 'Start', 'block');

            
            break;
        case 'start':

           headers.transformHead();  

           modifyButtonRight( 'View Table', 'block');

           modifyButtonLeft( 'Book', 'none' );

           modifyButtonBack(0);
            
           modifyButtonLegend(0);

            break;
        case 'stack':
            
            headers.transformStack();

            modifyButtonRight( '', 'none' );
           
            modifyButtonLeft( 'View Table', 'block' );

            modifyButtonBack(0);
            
            modifyButtonLegend(0);
            
            break;

        default:
            actualView = 'start';
            break;
    }
}

/**
 * created by Ricardo Delgado
 * editing text , animation and control button state
 * @param {String} label, The button name.
 * @param {String} view, The view button.
 * @param {int} start, button to start the animation.
 * @param {int} end, button to end the animation.
 */
function modifyButtonRight ( label, view ) {
    
var browserButton = document.getElementById('browserRightButton');
    
    browserButton.style.display=view;
    browserButton.innerHTML = label;


}

/**
 * Created by Ricardo Delgado
 * Editing text , animation and control button state
 * @param {String} label, The button name.
 * @param {String} view, The view button.
 * @param {int} start, button to start the animation.
 * @param {int} end, button to end the animation.
 */
function modifyButtonLeft ( label, view ) {
    
var browserButton = document.getElementById('browserLeftButton');

    browserButton.style.display = view;
    browserButton.innerHTML = label;


}

/**
 * Created by Ricardo Delgado
 */
function modifyButtonBack ( valor ) {
    
var browserButton = document.getElementById('backButton');

 $(browserButton).fadeTo(1000, valor, function() {
                $(browserButton).show();
            });
}

/**
 * Created by Ricardo Delgado
 */
function modifyButtonLegend ( valor ) {
    
var browserButton = document.getElementById('legendButton');

 $(browserButton).fadeTo(1000, valor, function() {
                $(browserButton).show();
            });
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
    
    helper.show('container', 2000);
    
    if(actualFlow) {
        actualFlow.delete();
        actualFlow = null;
    }

    if (targets != null)
        viewManager.transform(targets, 2000);
}

function onElementClick(id) {
    
    if (camera.getFocus() == null) {

        camera.setFocus(id, 2000);
        
        setTimeout(function() {
            
            camera.setFocus(id, 1000);
            modifyButtonBack(1);
            
            if(table[id].author) {
                var button = document.createElement('button');
                button.id = 'developerButton';
                button.className = 'actionButton';
                button.style.position = 'absolute';
                button.innerHTML = 'View developer';
                button.style.top = '10px';
                button.style.left = (10 + document.getElementById('backButton').clientWidth + 5) + 'px';
                button.style.zIndex = 10;
                button.style.opacity = 0;

                button.addEventListener('click', function() { showDeveloper(id); helper.hide(button, 1000, false); });

                document.body.appendChild(button);

                helper.show(button, 1000);
            }
            
        }, 3000);
        camera.disable();
        
    }

    function showDeveloper(id) {

        var relatedTasks = [];
        
        var image = table[id].picture;

        var section = 0;
        var center = objects[id].position;
        
        for (var i = 0; i < table.length; i++) {
            
            if (table[i].author == table[id].author) {
                relatedTasks.push(i);
                
                new TWEEN.Tween(objects[i].position)
                .to({x : center.x + (section % 5) * window.TILE_DIMENSION.width, y : center.y - Math.floor(section / 5) * window.TILE_DIMENSION.height, z : 0}, 2000)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
                
                section += 1;
            }
        }
        
        createSidePanel(id, image, relatedTasks);
        camera.enable();
        camera.move(center.x, center.y, center.z + window.TILE_DIMENSION.width * 5);
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
        panelImage.src = image;
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
            
            var anyTimeline = false;
            
            var i, l;
            
            for(i = 0, l = relatedTasks.length; i < l; i++) {
                if(table[relatedTasks[i]].life_cycle !== undefined) anyTimeline = true;
            }
            
            if(anyTimeline) {

                var tlButton = document.createElement('button');
                tlButton.className = 'actionButton';
                tlButton.id = 'timelineButton';
                tlButton.style.opacity = 0;
                tlButton.style.position = 'relative';
                tlButton.textContent = 'See Timeline';

                $(tlButton).click(function() {
                    showTimeline(relatedTasks);
                });

                sidePanel.appendChild(tlButton);
            }
        }

        $('#container').append(sidePanel);

        //$(renderer.domElement).fadeTo(1000, 0);

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
        document.body.appendChild(tlContainer);
        
        helper.hide('container', 1000, true);

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

function showFlow(id) {
    
    //Should receive the id and the flow's name
    
    var tile = objects[id];
    
    camera.enable();
    camera.move(tile.position.x, tile.position.y, tile.position.z + window.TILE_DIMENSION.width * 5);
    
    setTimeout(function() {
        actualFlow = new ActionFlow();
        actualFlow.draw(tile.position.x, tile.position.y);
    }, 1500);
}

function animate() {

    requestAnimationFrame(animate);

    TWEEN.update();

    camera.update();

    if ( stats ) stats.update();
}

function create_stats(){ 

    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left    = '0px';
    stats.domElement.style.top   = '0px';
    stats.domElement.style.display  = 'block';
    var contai = document.getElementById("container");
    contai.appendChild(stats.domElement);

    }

function render() {

    //renderer.render( scene, camera );
    camera.render(renderer, scene);
}