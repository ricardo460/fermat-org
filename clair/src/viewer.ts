let globals = new Globals();
globals.init();
globals.currentRender = createScene(this.currentRender, this.currentRender);
globals.session = new Session();
globals.session.init();
globals.guide = new Guide();

$('#login').click(function () {
        globals.session.getAuthCode();
});

$('#logout').click(function() {
        globals.session.logout();
        document.getElementById("containerLogin").style.display = "none";
});

/**
 * Creates the rendering environment
 */
function createScene(current, option){

    let change = false;
    if(option !== "canvas" && webglAvailable() && globals.currentRender !== "webgl") {
        globals.renderer = new THREE.WebGLRenderer({antialias : true, alpha : true, logarithmicDepthBuffer : true});
        current = "webgl";
        change = true;
    }
    else {
        if((option === "start" || option === "canvas") && globals.currentRender !== "canvas") {
            globals.renderer = new THREE.CanvasRenderer({alpha : true});
            current = "canvas";
            change = true;
        }
    }

    if(change) {

        let light = new THREE.AmbientLight(0xFFFFFF);
        globals.scene.add(light);

        globals.renderer.setSize(window.innerWidth, window.innerHeight);
        globals.renderer.domElement.style.position = 'absolute';
        globals.renderer.domElement.id = "canvas";
        globals.renderer.setClearColor(0xFFFFFF);
        //globals.renderer.setClearColor(0x313131);//Mode Test.
        document.getElementById('container').appendChild(globals.renderer.domElement);

        globals.camera = new Camera(new THREE.Vector3(0, 0, 90000),
            globals.renderer,
            render);
    }

    if(globals.currentRender === "start")
        globals.logo.startFade();
    if(globals.currentRender !== "start") {
        if(change)
            console.log("Switching rendering to",current);
        else if(globals.currentRender !== option)
            console.log("Rendering switch failed");
        else
            console.log("Already rendering with", globals.currentRender);
    }

    return current;
}


function webglAvailable() {
    try {
        let canvas = document.createElement('canvas');

        //Force boolean cast
        return !!(window['WebGLRenderingContext'] &&
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

    globals.browserManager = new BrowserManager();
    globals.screenshotsAndroid = new ScreenshotsAndroid();
    globals.workFlowManager = new WorkFlowManager();
    globals.buttonsManager = new ButtonsManager();
    globals.fieldsEdit = new FieldsEdit();
    globals.tableEdit = new TableEdit();
    globals.workFlowEdit = new WorkFlowEdit();
    globals.dragManager = new DragManager();

    //View Manager
    globals.viewManager = new ViewManager();

    // table
    globals.tileManager.drawTable();

    // ScreenshotsAndroid
    globals.screenshotsAndroid.init();

    // BrowserManager
    globals.browserManager.init();

    let dimensions = globals.tileManager.dimensions;

    // groups icons
    globals.headers = new Headers(dimensions.columnWidth, dimensions.superLayerMaxHeight, dimensions.groupsQtty,
        dimensions.layersQtty, dimensions.superLayerPosition);
    globals.headers.initialize();

    // uncomment for testing
    //create_stats();

    $('#backButton').click(function() {

        if(globals.viewManager.views[globals.actualView])
            globals.viewManager.views[globals.actualView].backButton();

    });

    $('#container').click(onClick);

    //Disabled Menu
    //initMenu();

    setTimeout(function() { initPage(); }, 500);


    /*setTimeout(function() {
        let loader = new Loader();
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

    let newCenter = new THREE.Vector3(0, 0, 0);
    let transition = 5000;

    newCenter = globals.viewManager.translateToSection(targetView, newCenter);
    globals.camera.moving = true;
    globals.camera.move(newCenter.x, newCenter.y, globals.camera.getMaxDistance(), transition, true);
    globals.camera.lockPan();

    setTimeout(function() { globals.camera.moving = false; }, transition);

    if(globals.map.views[targetView] != null) {
        if(globals.actualView != targetView){

            if(globals.actualView)
                globals.viewManager.views[globals.actualView].exit();

            globals.viewManager.views[targetView].enter();
        }

        globals.actualView = targetView;
    }
    else
        goToView(globals.map.start);
}

/**
 * @author Ricardo Delgado
 * Load the page url.
 */
function initPage() {

    Hash.on('^[a-zA-Z]*$', {
        yep: function(path, parts) {

            let view = parts[0];

            if(globals.actualView !== undefined && globals.actualView !== ""){

                if(view !== undefined && view !== ""  && view !== 'canvas' && view !== 'webgl'){

                    if(globals.map.views[view].enabled !== undefined && globals.map.views[view].enabled)
                        goToView(view);
                }
                else if(path === 'canvas' || path === 'webgl'){
                    globals.currentRender = createScene(globals.currentRender,path);
                }
            }
            else
                goToView(window.location.hash.slice(1));
        }
    });

}

function initMenu() {

    let button = document.getElementById('table');
    button.addEventListener('click', function(event) {

        changeView();

    }, false);
}


function changeView() {

    globals.camera.enable();
    globals.camera.loseFocus();

    Helper.show('container', 2000);

    globals.workFlowManager.getActualFlow();

    globals.headers.transformTable(1500);

    globals.tileManager.transform(true, 1500);

}

/**
 * Triggered when the user clicks a tile
 * @param {Number} id The ID (position on table) of the element
 */
function onElementClick(id) {

    let focus = Helper.getSpecificTile(id).mesh;

    if(globals.camera.getFocus() == null) {

        globals.tileManager.letAlone(id, 2000);

        focus.getObjectForDistance(0).visible = true;

        globals.headers.hideHeaders(2000);

        globals.camera.setFocus(focus, new THREE.Vector4(0, 0, globals.TILE_DIMENSION.width - globals.TILE_SPACING, 1), 2000);

        globals.buttonsManager.removeAllButtons();

        setTimeout(function() {

            globals.tileManager.letAlone(id, 1000);

            focus.getObjectForDistance(0).visible = true;

            globals.headers.hideHeaders(1000);

            globals.camera.setFocus(focus, new THREE.Vector4(0, 0, globals.TILE_DIMENSION.width - globals.TILE_SPACING, 1), 1000);

            Helper.showBackButton();

            globals.buttonsManager.actionButtons(id, function(){});

        }, 3000);

        globals.camera.disable();
    }
}

/**
 * Generic event when user clicks in 3D space
 * @param {Object} e Event data
 */

function onClick(e) {

    let mouse = new THREE.Vector2(0, 0),
        clicked = [];

    if(!globals.camera.dragging) {

        //Obtain normalized click location (-1...1)
        mouse.x = ((e.clientX - globals.renderer.domElement.offsetLeft) / globals.renderer.domElement.width) * 2 - 1;
        mouse.y = - ((e.clientY - globals.renderer.domElement.offsetTop) / globals.renderer.domElement.height) * 2 + 1;

        //window.alert("Clicked on (" + mouse.x + ", " + mouse.y + ")");

        clicked = globals.camera.rayCast(mouse, globals.scene.children);

        //If at least one element got clicked, process the first which is NOT a line
        if(clicked && clicked.length > 0) {

            for(let i = 0; i < clicked.length; i++) {

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
    globals.camera.update();
    if(globals.stats)
        globals.stats.update();
    
    render();
    requestAnimationFrame(animate);
}

function create_stats(){

    globals.stats = new Stats();
    globals.stats.setMode(0);
    globals.stats.domElement.style.position = 'absolute';
    globals.stats.domElement.style.left    = '0px';
    globals.stats.domElement.style.top   = '0px';
    globals.stats.domElement.style.display  = 'block';
    let contai = document.getElementById("container");
    contai.appendChild(globals.stats.domElement);

    }

function render() {

    //globals.renderer.render( scene, camera );
    globals.camera.render(globals.renderer, globals.scene);
}
