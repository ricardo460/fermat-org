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
    viewManager = new ViewManager();

//Global constants
var TILE_DIMENSION = {
    width : 231,
    height : 140
},
    TILE_SPACING = 20;

createScene();

getData();

function createScene(){

    var light = new THREE.AmbientLight(0xFFFFFF);
    scene.add( light );
    renderer = new THREE.WebGLRenderer({antialias : true, logarithmicDepthBuffer : true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.setClearColor(0xffffff);
    document.getElementById('container').appendChild(renderer.domElement);

    camera = new Camera(new THREE.Vector3(0, 0, 90000),
        renderer,
        render);

    browserManager = new BrowserManager();
    screenshotsAndroid = new ScreenshotsAndroid();

    logo.startFade();
}

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
        changeView(tileManager.targets.table);
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

    setTimeout(function() { goToView(window.map.load.view); }, 500);
    
    /*setTimeout(function() {
        var loader = new Loader();
        loader.findThemAll();
    }, 2000);*/

    //TWEEN.removeAll();
}

/**
 * @author Miguel Celedon
 * @lastmodifiedBy Ricardo Delgado
 * Changes the actual state of the viewer
 * @param {String} name The name of the target state
 */
function goToView ( current ) {
    
    actualView = current;
    var newCenter = new THREE.Vector3(0, 0, 0);
    var transition = 5000;

    switch(current) {
        case 'table':

            newCenter = viewManager.translateToSection('table', newCenter);
            
            camera.move(newCenter.x, newCenter.y, camera.getPosition().z, transition);

            browserManager.modifyButtonLegend(1,'block');

            logo.openLogo();

            //setTimeout(function() {
                headers.transformTable();
            //}, 4000);

            setTimeout(function() {
                tileManager.transform(tileManager.targets.table, 4000);
            }, 2000);
            
            
            break;

        case 'stack':
                     
            headers.transformStack(transition);
            
            newCenter = viewManager.translateToSection('stack', newCenter);

            camera.move(newCenter.x, newCenter.y, camera.getPosition().z, transition);

            browserManager.modifyButtonBack(0,'none');
            
            browserManager.modifyButtonLegend(0,'none');
            
            break;

        default:
            goToView('table');
            break;
    }
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

    if (targets != null)
        tileManager.transform(targets, 2000);
}

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
            url: 'http://52.11.156.16:3000/repo/procs?platform=' + (element.group || layers[element.layer].super_layer) + '&layer=' + element.layer + '&component=' + element.name,
            method: "GET"
        }).success(
            function(processes) {
                var p = processes;
                var flows = [];
                
                for(var i = 0; i < p.length; i++) {
                    
                    flows.push(new ActionFlow(p[i]));
                }
                
                if(flows.length > 0) {
                    button.innerHTML = 'Show Flows';
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

function onClick(e) {
    
    var mouse = new THREE.Vector2(0, 0),
        clicked = [];
    
    if ( !camera.dragging ) {
    
        //Obtain normalized click location (-1...1)
        mouse.x = ((e.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width) * 2 - 1;
        mouse.y = - ((e.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1;

        if ( actualView === 'table' ) {

            clicked = camera.rayCast(mouse, objects);
        
            if (clicked && clicked.length > 0) {

             onElementClick(clicked[0].object.userData.id);
            
            } 

            else { 
            
             clicked = camera.rayCast(mouse, screenshotsAndroid.objects.mesh);

                if ( clicked && clicked.length > 0 ) {

                    screenshotsAndroid.change_Screenshots(clicked[0].object.userData.id)

               }

            }
        
        }
      
        clicked = camera.rayCast(mouse, browserManager.objects.mesh);
        
        if (clicked && clicked.length > 0) {

         browserManager.actionButton(clicked[0].object.userData.view); 

        }
  }

}

//Should draw ONLY one flow at a time
function showFlow(flows) {
    
    var position = objects[camera.getFocus()].position;
    
    camera.enable();
    camera.move(position.x, position.y, position.z + window.TILE_DIMENSION.width * 5);
    
    setTimeout(function() {
        
        actualFlow = [];
        
        for(var i = 0; i < flows.length; i++) {
            actualFlow.push(flows[i]);
            flows[i].draw(position.x, position.y);
            
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