//global variables
var tilesQtty = [],
    camera,
    scene = new THREE.Scene(),
    renderer,
    actualView,
    stats = null,
    headersUp = false,
//Class
    tileManager = new TileManager(),
    helper = new Helper(),
    logo = new Logo(),
    signLayer = new SignLayer(),
    developer = new Developer(),
    session = new Session(),
    fermatEdit = null,
    browserManager = null,
    screenshotsAndroid = null,
    headers = null,
    flowManager = null,
    viewManager = null,
    magazine = null,
    networkViewer = null,
    buttonsManager = null;
//Global constants
var TILE_DIMENSION = {
    width : 231,
    height : 140
},
    TILE_SPACING = 20;

    currentRender = "start";
    currentRender = createScene(currentRender, currentRender);
getData();

$('#login').click(function() {
        window.session.getAuthCode();
});

$('#logout').click(function() {
        window.session.logout();
        document.getElementById("containerLogin").style.display = "none";
});

/**
 * Creates the rendering environment
 */
function createScene(current, option){
    
    change = false; 
    if(option !== "canvas" && webglAvailable() && window.currentRender !== "webgl") {
        renderer = new THREE.WebGLRenderer({antialias : true, alpha : true}); //Logarithmic depth buffer disabled due to sprite - zbuffer issue
        current = "webgl";
        change = true;
    }
    else {
        if((option === "start" || option === "canvas") && window.currentRender !== "canvas") {
            renderer = new THREE.CanvasRenderer({antialias : true, alpha : true});
            current = "canvas";
            change = true;
        }
    }
    
    if(change) {

        var light = new THREE.AmbientLight(0xFFFFFF);
        scene.add( light );

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.position = 'absolute';
    renderer.domElement.id = "canvas";
        renderer.setClearColor(0xFFFFFF);
    //renderer.setClearColor(0x313131);//Mode Test.
        document.getElementById('container').appendChild(renderer.domElement);

        camera = new Camera(new THREE.Vector3(0, 0, 90000),
            renderer,
            render);
    }
    if(window.currentRender === "start"){
        animate();
        logo.startFade();
    }
    if(currentRender !== "start") {
        if(change)
            console.log("Switching rendering to",current);
        else if(currentRender !== option)
            console.log("Rendering switch failed");
        else
            console.log("Already rendering with",currentRender);
    }

    return current;
}


function webglAvailable() {
    try {
        var canvas = document.createElement('canvas');
        
        //Force boolean cast
        return !!( window.WebGLRenderingContext && 
                  (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

/**
 * Starts everything after receiving the json from the server
 */
function init() {

    browserManager = new BrowserManager();
    screenshotsAndroid = new ScreenshotsAndroid();
    magazine = new Magazine();
    flowManager = new FlowManager();
    buttonsManager = new ButtonsManager();
    fermatEdit = new FermatEdit();

    fermatEdit.init();

    //View Manager
    viewManager = new ViewManager();

    // table
    tileManager.drawTable();

    // ScreenshotsAndroid
    screenshotsAndroid.init();

    // BrowserManager
    browserManager.init();

    var dimensions = tileManager.dimensions;

    // groups icons
    headers = new Headers(dimensions.columnWidth, dimensions.superLayerMaxHeight, dimensions.groupsQtty,
                          dimensions.layersQtty, dimensions.superLayerPosition);

    // uncomment for testing
    //create_stats();

    $('#backButton').click(function() {
        
        if(viewManager.views[window.actualView])
            viewManager.views[window.actualView].backButton();
 
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
    
            
    $('#container').click(onClick);

    //Disabled Menu
    //initMenu();

    setTimeout(function() { initPage(); }, 500);
    
    /*setTimeout(function() {
        var loader = new Loader();
        loader.findThemAll();
    }, 2000);*/

    //TWEEN.removeAll();
}

/**
 * @author Miguel Celedon
 * @lastmodifiedBy Emmanuel Colina
 * @lastmodifiedBy Ricardo Delgado
 * Changes the actual state of the viewer
 * @param {String} name The name of the target state
 */
function goToView ( targetView ) {
    
    var newCenter = new THREE.Vector3(0, 0, 0);
    var transition = 5000;

    newCenter = viewManager.translateToSection(targetView, newCenter);
    camera.moving = true;
    camera.move(newCenter.x, newCenter.y, camera.getMaxDistance(), transition, true);
    camera.lockPan();
        
    setTimeout(function() { camera.moving = false; }, transition);

    if(window.map.views[targetView] != null) {
        if(actualView != targetView){
            
            if(actualView)
                viewManager.views[actualView].exit();

            viewManager.views[targetView].enter();
        }

        actualView = targetView;
    }
    else
        goToView(window.map.start);
}

/**
 * @author Ricardo Delgado
 * Load the page url.
 */
function initPage() {
    
	window.Hash.on('^[a-zA-Z]*$', {

		yep: function(path, parts) {

			var view = parts[0];

            if(window.actualView !== undefined && window.actualView !== ""){ 

    			if(view !== undefined && view !== ""  && view !== 'canvas' && view !== 'webgl'){

    				if(window.map.views[view].enabled !== undefined && window.map.views[view].enabled)
    					goToView(view);
    			}
                else if(path === 'canvas' || path === 'webgl'){
                    currentRender = createScene(currentRender,path);
                    change = false;
                }
            }
            else{
                goToView(window.location.hash.slice(1));
            }
		}
    });

}

function initMenu() {

    var button = document.getElementById('table');
    button.addEventListener('click', function(event) {

        changeView();

    }, false);

    
    /*button = document.getElementById('sphere');
    button.addEventListener('click', function(event) {

        changeView(tileManager.targets.sphere);

    }, false);

    button = document.getElementById('helix');
    button.addEventListener('click', function(event) {

        changeView(tileManager.targets.helix);

    }, false);

    button = document.getElementById('grid');
    button.addEventListener('click', function(event) {

        changeView(tileManager.targets.grid);

    }, false);*/
}


function changeView() {

    camera.enable();
    camera.loseFocus();
    
    helper.show('container', 2000);
    
    flowManager.getActualFlow();

    //if (targets != null) {
    tileManager.transform(2000);
    //}
}

/**
 * Triggered when the user clicks a tile
 * @param {Number} id The ID (position on table) of the element
 */
function onElementClick(id) {
    
    var focus = window.helper.getSpecificTile(id).mesh;

    if (window.camera.getFocus() == null) {

        window.tileManager.letAlone(id, 2000);

        focus.getObjectForDistance(0).visible = true;

        window.headers.hideHeaders(2000);

        window.camera.setFocus(focus, new THREE.Vector4(0, 0, window.TILE_DIMENSION.width - window.TILE_SPACING, 1), 2000);

        window.buttonsManager.removeAllButtons();
        
        setTimeout(function() {
            
            window.tileManager.letAlone(id, 1000);

            focus.getObjectForDistance(0).visible = true;

            window.headers.hideHeaders(1000);

            window.camera.setFocus(focus, new THREE.Vector4(0, 0, window.TILE_DIMENSION.width - window.TILE_SPACING, 1), 1000);

            window.helper.showBackButton();

            window.buttonsManager.actionButtons(id, function(){
                showDeveloper(id);
            });
            
        }, 3000);
        
        window.camera.disable();   
    }

    function showDeveloper(id) {

        var relatedTasks = [];

        var tile = window.helper.getSpecificTile(id).data;
        
        var image = window.helper.getSpecificTile(id).data.picture;

        var section = 0;
        var center = window.helper.getSpecificTile(id).mesh.position;
        
        for(var i = 0; i < window.tilesQtty.length; i++){

            var _tile = window.helper.getSpecificTile(window.tilesQtty[i]).data;

            var mesh =  window.helper.getSpecificTile(window.tilesQtty[i]).mesh;
    
            if (_tile.author == tile.author) {

                relatedTasks.push(id);
        
                new TWEEN.Tween(mesh.position)
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
        
        var tileData = window.helper.getSpecificTile(id).data;

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
        userName.textContent = tileData.author;
        sidePanel.appendChild(userName);

        var realName = document.createElement('p');
        realName.style.opacity = 0;
        realName.style.position = 'relative';
        realName.textContent = tileData.authorRealName;
        sidePanel.appendChild(realName);

        var email = document.createElement('p');
        email.style.opacity = 0;
        email.style.position = 'relative';
        email.textContent = tileData.authorEmail;
        sidePanel.appendChild(email);

        if (relatedTasks != null && relatedTasks.length > 0) {
            
            var anyTimeline = false;
            
            var i, l;
            
            for(i = 0, l = relatedTasks.length; i < l; i++) {
                
                var lifeCycle = window.helper.getSpecificTile(relatedTasks[i]).data.life_cycle;
                
                if(lifeCycle !== undefined && lifeCycle.length > 0) {
                    anyTimeline = true;
                }
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

/**
 * Generic event when user clicks in 3D space
 * @param {Object} e Event data
 */
 
function onClick(e) {
    
    var mouse = new THREE.Vector2(0, 0),
        clicked = [];
    
    if ( !camera.dragging ) {
    
        //Obtain normalized click location (-1...1)
        mouse.x = ((e.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width) * 2 - 1;
        mouse.y = - ((e.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1;
        
        //window.alert("Clicked on (" + mouse.x + ", " + mouse.y + ")");

        clicked = camera.rayCast(mouse, scene.children);

        //If at least one element got clicked, process the first which is NOT a line
        if (clicked && clicked.length > 0) {
            
            for(var i = 0; i < clicked.length; i++) {
                
                if(clicked[i].object.userData.onClick && !(clicked[i].object instanceof THREE.Line)) {
                    
                    clicked[i].object.userData.onClick(clicked[i].object);
                    break;
                }
            }
        }
    }
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


