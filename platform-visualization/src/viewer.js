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

function animate() {

    requestAnimationFrame(animate);

    TWEEN.update();

    camera.update();
}

function render() {

    //renderer.render( scene, camera );
    camera.render(renderer, scene);
}