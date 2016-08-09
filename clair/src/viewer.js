//global variables
var tilesQtty = [],
    TABLE = {},
    camera,
    scene = new THREE.Scene(),
    renderer,
    actualView,
    stats = null,
    headersUp = false,
    currentRender = "start",
    disconnected = false,
//Class
    tileManager = new TileManager(),
    logo = new Logo(),
    signLayer = new SignLayer(),
    developer = new Developer(),
    API = new API(),
    workFlowEdit = null,
    session = null,
    tableEdit = null,
    fieldsEdit = null,
    browserManager = null,
    screenshotsAndroid = null,
    headers = null,
    workFlowManager = null,
    viewManager = null,
    networkViewer = null,
    buttonsManager = null,
    guide = null,
    dragManager = null;
//Global constants
var TILE_DIMENSION = {
    width : 231,
    height : 140
},
    TILE_SPACING = 20;

currentRender = createScene(currentRender, currentRender);
session = new Session();
session.init();
guide = new Guide();

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

    var change = false;
    if(option !== "canvas" && webglAvailable() && window.currentRender !== "webgl") {
        renderer = new THREE.WebGLRenderer({antialias : true, alpha : true, logarithmicDepthBuffer : true});
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
        scene.add(light);

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

    if(window.currentRender === "start")
        logo.startFade();
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
        return !!(window.WebGLRenderingContext &&
                  (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    }
    catch(e) {
        return false;
    }
}

/**
 * Starts everything after receiving the json from the server
 */
function init() {

    browserManager = new BrowserManager();
    screenshotsAndroid = new ScreenshotsAndroid();
    workFlowManager = new WorkFlowManager();
    buttonsManager = new ButtonsManager();
    fieldsEdit = new FieldsEdit();
    tableEdit = new TableEdit();
    workFlowEdit = new WorkFlowEdit();
    dragManager = new DragManager();

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
function goToView(targetView) {

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
                }
            }
            else
                goToView(window.location.hash.slice(1));
        }
    });

}

function initMenu() {

    var button = document.getElementById('table');
    button.addEventListener('click', function(event) {

        changeView();

    }, false);
}


function changeView() {

    window.camera.enable();
    window.camera.loseFocus();

    window.helper.show('container', 2000);

    window.workFlowManager.getActualFlow();

    window.headers.transformTable(1500);

    window.tileManager.transform(1500);

}

/**
 * Triggered when the user clicks a tile
 * @param {Number} id The ID (position on table) of the element
 */
function onElementClick(id) {

    var focus = window.helper.getSpecificTile(id).mesh;

    if(window.camera.getFocus() == null) {

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

            window.buttonsManager.actionButtons(id, function(){});

        }, 3000);

        window.camera.disable();
    }
}

/**
 * Generic event when user clicks in 3D space
 * @param {Object} e Event data
 */

function onClick(e) {

    var mouse = new THREE.Vector2(0, 0),
        clicked = [];

    if(!camera.dragging) {

        //Obtain normalized click location (-1...1)
        mouse.x = ((e.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width) * 2 - 1;
        mouse.y = - ((e.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1;

        //window.alert("Clicked on (" + mouse.x + ", " + mouse.y + ")");

        clicked = camera.rayCast(mouse, scene.children);

        //If at least one element got clicked, process the first which is NOT a line
        if(clicked && clicked.length > 0) {

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
    TWEEN.update();
    camera.update();
    if(stats)
        stats.update();
    
    render();
    requestAnimationFrame(animate);
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
