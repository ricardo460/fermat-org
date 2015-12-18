var table = [],
    helper = new Helper(),
    camera,
    scene = new THREE.Scene(),
    renderer,
    logo = new Logo(),
    browserManager,
    screenshotsAndroid,
    objects = [],
    headers = null,
    actualView,
    stats = null,
    actualFlow = null,
    viewManager = null,
    magazine = null,
    headerFlow = [],
    networkViewer = null,
    signLayer = new SignLayer(),
    developer = new Developer(),
    positionHeaderFlow = [];
//Global constants
var TILE_DIMENSION = {
    width : 231,
    height : 140
},
    TILE_SPACING = 20;

createScene();

getData();

/**
 * Creates the rendering environment
 */
function createScene(){

    var light = new THREE.AmbientLight(0xFFFFFF);
    scene.add( light );
    renderer = new THREE.WebGLRenderer({antialias : true, logarithmicDepthBuffer : true, alpha : true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.setClearColor(0xFFFFFF);
    document.getElementById('container').appendChild(renderer.domElement);

    camera = new Camera(new THREE.Vector3(0, 0, 90000),
        renderer,
        render);

    logo.startFade();
}

/**
 * Starts everything after receiving the json from the server
 */
function init() {

    browserManager = new BrowserManager();
    screenshotsAndroid = new ScreenshotsAndroid();
    magazine = new Magazine();
    
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
    camera.move(newCenter.x, newCenter.y, camera.getMaxDistance(), transition);
    camera.lockPan();
    
    if(window.map.views[targetView] != null) {
        viewManager.views[targetView].enter();
        
        if(actualView)
            viewManager.views[actualView].exit();
        
        actualView = targetView;
    }
    else {
        goToView(window.map.start);
    }
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

    			if(view !== undefined && view !== ""){

    				if(window.map.views[view].enabled !== undefined && window.map.views[view].enabled)
    					goToView(view);
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

        changeView(tileManager.targets.table);

    }, false);

    button = document.getElementById('sphere');
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

    }, false);
}

/**
 * @author Emmanuel Colina
 * @lastmodifiedBy Ricardo Delgado
 * Delete All the actual view to table
 */

function deleteAllWorkFlows() {
    var _duration = 2000;

    if(headerFlow){
        for(var i = 0; i < headerFlow.length; i++) {

            headerFlow[i].deleteAll();
            helper.hideObject(headerFlow[i].objects[0], false, _duration);
        }
    }
    
    headerFlow = [];
}

function changeView(targets) {

    camera.enable();
    camera.loseFocus();
    
    helper.show('container', 2000);
    
    if(actualFlow) {
        for(var i = 0; i < actualFlow.length; i++) {
            actualFlow[i].deleteAll();
        }
        actualFlow = null;
    }

    if (targets != null) {
        tileManager.transform(targets, 2000);
    }
}

/**
 * Triggered when the user clicks a tile
 * @param {Number} id The ID (position on table) of the element
 */
function onElementClick(id) {
    
    if (camera.getFocus() == null) {

        camera.setFocus(id, 2000);
        
        setTimeout(function() {
            
            camera.setFocus(id, 1000);
            browserManager.modifyButtonBack(1,'block');
            
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

                button.addEventListener('click', function() {
                    showDeveloper(id);
                    helper.hide(button, 1000, false);
                    helper.hide('showFlows', 1000, false);
                });

                document.body.appendChild(button);

                helper.show(button, 1000);
            }
            
            getAndShowFlows(id);
            
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
                if(table[relatedTasks[i]].life_cycle !== undefined && table[relatedTasks[i]].life_cycle.length > 0) {
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
    
    function getAndShowFlows(id) {
        
        var button = document.createElement('button'),
            sucesorButton = document.getElementById('developerButton') || document.getElementById('backButton'),
            element = table[id],
            flows;
        
        button.id = 'showFlows';
        button.className = 'actionButton';
        button.style.position = 'absolute';
        button.innerHTML = 'Loading flows...';
        button.style.top = '10px';
        button.style.left = (sucesorButton.offsetLeft + sucesorButton.clientWidth + 5) + 'px';
        button.style.zIndex = 10;
        button.style.opacity = 0;
        document.body.appendChild(button);
        
        helper.show(button, 1000);
        
        $.ajax({
            url: 'http://52.35.117.6:3000/repo/procs?platform=' + (element.group || element.superLayer) + '&layer=' + element.layer + '&component=' + element.name,
            method: "GET"
        }).success(
            function(processes) {
                var p = processes;
                var flows = [];
                
                for(var i = 0; i < p.length; i++) {
                    
                    flows.push(new ActionFlow(p[i]));
                }
                
                if(flows.length > 0) {
                    button.innerHTML = 'Show Workflows';
                    button.addEventListener('click', function() {
                        showFlow(flows);
                        helper.hide(button, 1000, false);
                        helper.hide('developerButton', 1000, false);
                    });
                }
                else {
                    helper.hide(button, 1000, false);
                }
            }
        );
    }
}

/**
 * @author Emmanuel Colina
 * 
 */

function onElementClickHeaderFlow(id) {

    if (camera.getFocus() == null) {

        camera.setFocusHeaderFlow(id, 1000, headerFlow);

        setTimeout(function() {
            for (var i = 0; i < headerFlow[id].flow.steps.length; i++) {
                headerFlow[id].drawTree(headerFlow[id].flow.steps[i], headerFlow[id].positions.target[0].x + 900 * i, headerFlow[id].positions.target[0].y - 211, 0);
            }
           headerFlow[id].showSteps();
        }, 1000);

        browserManager.modifyButtonBack(1,'block');
    }
}

function showWorkFlow() {

    if (camera.getFocus() !== null) {

        camera.loseFocus();

        window.headers.transformWorkFlow(2000);

        for (var i = 0; i < headerFlow.length ; i++) {

            if(headerFlow[i].action){

                headerFlow[i].deleteStep();
                headerFlow[i].action = false;
            }
            else{
                headerFlow[i].showFlow();
            }
        }
        
        browserManager.modifyButtonBack(0,'none');
    }
}

function onElementClickDeveloper(id, objectsDevelopers){

    if(camera.getFocus() == null){
        camera.setFocusDeveloper(id, 1000, objectsDevelopers);
        browserManager.modifyButtonBack(1,'block');
        developer.showDeveloperTiles(id);
    }
}

/**
 * @author Emmanuel Colina
 * Calculate the headers flows
 */

function calculatePositionHeaderFLow(headerFlow, objectHeaderInWFlowGroup) { 

    var position;
    var find = false;

    for (var i = 0; i < objectHeaderInWFlowGroup.length; i++) {

        for (var j = 0; j < headerFlow.length; j++) {

            if(objectHeaderInWFlowGroup[i].name === headerFlow[j].flow.platfrm){
                
                if(find === false){

                    position = new THREE.Vector3();

                    position.x = objectHeaderInWFlowGroup[i].position.x - 1500;

                    position.y = objectHeaderInWFlowGroup[i].position.y - 2500;

                    positionHeaderFlow.push(position);

                    find = true;
                }
                else
                {
                    position = new THREE.Vector3();

                    position.x = objectHeaderInWFlowGroup[i].position.x - 1500;
                    
                    position.y = positionHeaderFlow[positionHeaderFlow.length - 1].y - 500;

                    positionHeaderFlow.push(position);
                }    
            }
        }
        find = false;     
    }
    headerFlowDraw();
}

function headerFlowDraw(){
    var indice = 1;
    for (var k = 0; k < headerFlow.length; k++){
        headerFlow[k].draw(positionHeaderFlow[k].x, positionHeaderFlow[k].y, positionHeaderFlow[k].z, indice, k);
    }
}

/**
 * @author Emmanuel Colina
 * Get the headers flows
 */

function getHeaderFLow() {

    $.ajax({
        url: 'http://52.35.117.6:3000/v1/repo/procs/',
        method: "GET"
    }).success(
        function(processes) {
            var p = processes, objectHeaderInWFlowGroup;    
            
            for(var i = 0; i < p.length; i++){
                headerFlow.push(new ActionFlow(p[i])); 
            }
            objectHeaderInWFlowGroup = window.headers.getPositionHeaderViewInFlow();   
            calculatePositionHeaderFLow(headerFlow, objectHeaderInWFlowGroup);   
        }
    );
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

//Should draw ONLY one flow at a time
function showFlow(flows) {
    
    var position = objects[camera.getFocus()].position;
    var indice = 0;

    camera.enable();
    camera.move(position.x, position.y, position.z + window.TILE_DIMENSION.width * 5);
    
    setTimeout(function() {
        
        actualFlow = [];
        
        for(var i = 0; i < flows.length; i++) {
            actualFlow.push(flows[i]);
            flows[i].draw(position.x, position.y, 0, indice, i);
            
            //Dummy, set distance between flows
            position.x += window.TILE_DIMENSION.width * 10;
        }
        
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

/**
 * This function is meant to be used only for testing in the debug console,
 * it cleans the entire scene so the website frees some memory and so you can
 * let it in the background without using so much resources.
 * @author Miguel Celedon
 */
function shutDown() {
    
    scene = new THREE.Scene();
    
}