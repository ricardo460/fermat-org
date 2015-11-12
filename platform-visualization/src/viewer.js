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
    viewManager = new ViewManager(),
    bookManager,
    headerFlow = [],
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
    renderer.setClearColor(0xffffff);
    document.getElementById('container').appendChild(renderer.domElement);

    camera = new Camera(new THREE.Vector3(0, 0, 90000),
        renderer,
        render);

    browserManager = new BrowserManager();
    screenshotsAndroid = new ScreenshotsAndroid();
    bookManager = new BookManager();

    logo.startFade();
}

/**
 * Starts everything after receiving the json from the server
 */
function init() {

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
        if (window.actualView === "table") {
            changeView(tileManager.targets.table);
        }
        if (window.actualView === "workflows") {

            var duration = 6000;

            camera.resetPosition(duration);

            setTimeout(function() {

                changeViewWorkFlows();

                getHeaderFLowAndPosition();

            }, 4000);
            
            changeView(tileManager.targets.table);
        }    
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
    
    setTimeout(function() { goToView(window.location.hash.slice(1)); }, 500);
    
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

    if(actualView === "book" || actualView === "readme" || actualView === "whitepaper") 
        bookManager.hide();
    
    newCenter = viewManager.translateToSection(targetView, newCenter);
    camera.move(newCenter.x, newCenter.y, camera.getMaxDistance(), transition);
    camera.lockPan();

    switch(targetView) {
        case 'table':
            
            browserManager.modifyButtonLegend(1,'block');

            tileManager.transform(tileManager.targets.table, 3000 + transition);
            
            //Special: If coming from home, delay the animation
            if(actualView === 'home')
                transition = transition + 3000;
            
            headers.transformTable(transition);

            changeViewWorkFlows();
            
            break;
        case 'stack':
                     
            headers.transformStack(transition);

            browserManager.modifyButtonBack(0,'none');
            
            browserManager.modifyButtonLegend(0,'none');
            
            break;
            
        case 'home':
            
            logo.stopFade(2000);
            
            break;
        case 'book':
                       
        case 'readme':
                       
        case 'whitepaper':
        case 'workflows':

            getHeaderFLowAndPosition();

            break;
            
            bookManager.createBook(targetView); 
            
            break;
        default:
            
            if(window.map.views[targetView] == null)
                goToView(window.map.start);
            
            break;
    }
    
    actualView = targetView;
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
 * Changes the actual view to table
 */

function changeViewWorkFlows() {
    var _duration = 2000;
    if(headerFlow){
        for(var i = 0; i < headerFlow.length; i++) {
            headerFlow[i].delete();
            helper.hideObject(headerFlow[i].objects[0], false, _duration);
        }
    }
    for(var j = 0; j < testFlow.length; j++) {
        for (var k = 0; k < testFlow[j].steps.length; k++) {
            testFlow[j].steps[k].drawn = undefined;
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
            actualFlow[i].delete();
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
            url: 'http://52.11.156.16:3000/repo/procs?platform=' + (element.group || element.superLayer) + '&layer=' + element.layer + '&component=' + element.name,
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
                headerFlow[id].drawTree(headerFlow[id].flow.steps[i], headerFlow[id].positions.target[0].x + 900 * i, headerFlow[id].positions.target[0].y - 211, 80000);
            }
            headerFlow[id].showStepsFlow();
        }, 3000);

        browserManager.modifyButtonBack(1,'block');
    }
}

/**
 * @author Emmanuel Colina
 * Get the headers flows
 */

function getHeaderFLowAndPosition() {
    
    var POSITION_X = -673500;
    var POSITION_Y = -136500;
    var position;
    var indice = 1;

    /*$.ajax({
        url: 'http://52.11.156.16:3000/v1/repo/procs/',
        method: "GET"
    }).success(
        function(processes) {
            //var p = processes;
            var p = testFlow;
            
            for(var i = 0; i < p.length; i++){
                headerFlow.push(new ActionFlow(p[i])); 
            }
        }
    );*/
    
    var p = testFlow;
            
    for(var i = 0; i < p.length; i++){
        headerFlow.push(new ActionFlow(p[i])); 
    }

    if (headerFlow.length === 1) {

        position = new THREE.Vector3();

        position.x = -675000;
        position.y = -135000;
        position.z = 0;

        positionHeaderFlow.push(position);
    }
    else if (headerFlow.length === 2) {
        var positionx = -675000;

        positionx = positionx - 500;

        for (var k = 0; k < headerFlow.length; k++) {

            position = new THREE.Vector3();

            position.x = positionx;
            position.y = -135000;
            position.z = 0;
            positionHeaderFlow.push(position);

            positionx = positionx + 1000;
        }

    }
    else if (headerFlow.length > 2) {

        var sqrt, round, column, row, initialY, count, raizC, raizC2;
        count = 0;
        round = 0;
        column = 0;

        //calculamos columnas y filas


        if((Math.sqrt(headerFlow.length) % 1) !== 0) {

            for(var r = headerFlow.length; r < headerFlow.length * 2; r++){

                if((Math.sqrt(r) % 1) === 0){

                    raizC = r;
                    sqrt = Math.sqrt(raizC);

                    for(var l = raizC - 1; l > 0; l--){ 

                        if((Math.sqrt(l) % 1) === 0){

                            raizC2 = l;
                            break;
                        }
                        count = count + 1;
                    }
                    count = count / 2;

                    for(var f = raizC2 + 1; f <= raizC2 + count; f++){
                        if(headerFlow.length === f) {
                            row = sqrt - 1;
                            column = sqrt;
                        }
                    }
                    for(var t = raizC - 1; t >= raizC - count; t--){
                        if(headerFlow.length === t) {
                            row = column = sqrt ;
                        }
                    }
                }
                if(row !== 0  && column !== 0){
                    break;
                }
            }
        }
        else{
            row = column = Math.sqrt(headerFlow.length);
        }

        count = 0;
        var positionY = POSITION_Y;  

        //calculando Y
        for(var p = 0; p < row; p++) { 

            if(p === 0)
                positionY = positionY + 250;
            else
                positionY = positionY + 500;
        }
        
        for(y = 0; y < row; y++){ //filas

            var positionX = POSITION_X;

            for(m = 0; m < column; m++) { 

                if(m===0)
                    positionX = positionX - 500;
                else
                    positionX = positionX - 1000;
            }
            //calculando X
            for(x = 0; x < column; x++){  //columnas              

                position = new THREE.Vector3();

                position.y = positionY;

                position.x = positionX;

                if(count < headerFlow.length){

                    positionHeaderFlow.push(position);
                    count = count + 1;
                }

                if((positionX + 500) === POSITION_X) {
                    positionX = positionX + 1000;
                }
                else
                    positionX = positionX + 1000;
            }

            if((positionY - 250) === POSITION_Y) {
                positionY = positionY - 500;
            }
            else
                positionY = positionY - 500;     
        }      
    }

    for (var j = 0; j < headerFlow.length; j++){

        headerFlow[j].draw(positionHeaderFlow[j].x, positionHeaderFlow[j].y, positionHeaderFlow[j].z, indice, j);
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

        clicked = camera.rayCast(mouse, scene.children);

        if (clicked && clicked.length > 0) {

            clicked[0].object.userData.onClick(clicked[0].object);

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