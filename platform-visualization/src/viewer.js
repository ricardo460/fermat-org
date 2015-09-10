var table = [];

var camera, scene, renderer;

var objects = [];
var targets = {
    table: [],
    sphere: [],
    helix: [],
    grid: []
};
var headers = null;

var lastTargets = null;

$.ajax({
    url: "get_plugins.php",
    method: "GET"
}).success(
    function(lists) {
        try {
            var l = JSON.parse(lists);
            fillTable(l);
            $('#splash').fadeTo(0, 500, function() {
                $('#splash').remove();
                init();
                setTimeout(animate, 500);
            });
        } catch (err) {
            console.dir(err);
        }
    }
);

/*var l = JSON.parse(testData);
    
    fillTable(l);
    
    $('#splash').fadeTo(0, 500, function() {
            $('#splash').remove();
            init();
            setTimeout( animate, 500);
        });*/

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

    for (var key in layers) {
        if (key == "size") continue;

        if (layers[key].super_layer) {

            section.push(0);
        } else {

            var newLayer = [];

            for (var i = 0; i < groupsQtty; i++)
                newLayer.push(0);

            section.push(newLayer);
        }
    }

    var preComputeLayout = function() {

        var _sections = [];
        var superLayerHeight = 0;
        var isSuperLayer = [];

        //Initialize
        for (var key in layers) {
            if (key == "size") continue;

            if (layers[key].super_layer) {

                _sections.push(0);
                superLayerHeight++;

                if (superLayerMaxHeight < superLayerHeight) superLayerMaxHeight = superLayerHeight;
            } else {

                var newLayer = [];
                superLayerHeight = 0;

                for (var i = 0; i < groupsQtty; i++)
                    newLayer.push(0);

                _sections.push(newLayer);
            }

            isSuperLayer.push(false);
        }

        for (var j = 0; j <= groupsQtty; j++) {

            elementsByGroup.push(0);
            //columnGroupPosition.push(0);
        }

        //Set sections sizes

        for (var i = 0; i < table.length; i++) {

            var r = table[i].layerID;
            var c = table[i].groupID;

            elementsByGroup[c]++;

            if (layers[table[i].layer].super_layer) {

                _sections[r]++;
                isSuperLayer[r] = true;
            } else {

                _sections[r][c]++;

                if (_sections[r][c] > columnWidth) columnWidth = _sections[r][c];
            }

            //if ( c != groups.size() && elementsByGroup[c] > columnWidth ) columnWidth = elementsByGroup[c];
        }

        //Set row height

        var actualHeight = 0;
        var remainingSpace = superLayerMaxHeight;
        var inSuperLayer = false;
        var actualSuperLayer = 0;

        for (var i = 0; i < layersQtty; i++) {

            if (isSuperLayer[i]) {

                if (!inSuperLayer) {
                    actualHeight++;

                    if (superLayerPosition[actualSuperLayer] == undefined) {
                        superLayerPosition[actualSuperLayer] = actualHeight;
                    }
                }

                inSuperLayer = true;
                actualHeight++;
                remainingSpace--;
            } else {

                if (inSuperLayer) {

                    actualHeight += remainingSpace + 1;
                    remainingSpace = superLayerMaxHeight;
                    actualSuperLayer++;
                }

                inSuperLayer = false;
                actualHeight++;
            }

            layerPosition[i] = actualHeight;
        }
    };
    preComputeLayout();

    for (var i = 0; i < table.length; i++) {

        var element = createElement(i);

        var object = new THREE.CSS3DObject(element);
        object.position.x = 0;
        object.position.y = 0;
        object.position.z = 80000;
        scene.add(object);

        objects.push(object);

        //

        var object = new THREE.Object3D();

        //Row (Y)
        var row = table[i].layerID;

        if (layers[table[i].layer].super_layer) {

            object.position.x = ((section[row]) * 140) - (columnWidth * groupsQtty * 140 / 2);

            section[row]++;

        } else {

            //Column (X)
            var column = table[i].groupID;
            object.position.x = (((column * (columnWidth) + section[row][column]) + column) * 140) - (columnWidth * groupsQtty * 140 / 2);

            section[row][column]++;
        }


        object.position.y = -((layerPosition[row]) * 180) + (layersQtty * 180 / 2);

        targets.table.push(object);

    }

    // table groups icons
    headers = new Headers(columnWidth, superLayerMaxHeight, groupsQtty, layersQtty, superLayerPosition);

    // sphere

    var vector = new THREE.Vector3();

    var indexes = [];

    for (var i = 0; i <= groupsQtty; i++) indexes.push(0);

    for (var i = 0; i < objects.length; i++) {

        var g = (table[i].groupID != undefined) ? table[i].groupID : groupsQtty;

        var radious = 300 * (g + 1);

        var phi = Math.acos((2 * indexes[g]) / elementsByGroup[g] - 1);
        var theta = Math.sqrt(elementsByGroup[g] * Math.PI) * phi;

        var object = new THREE.Object3D();

        object.position.x = radious * Math.cos(theta) * Math.sin(phi);
        object.position.y = radious * Math.sin(theta) * Math.sin(phi);
        object.position.z = radious * Math.cos(phi);

        vector.copy(object.position).multiplyScalar(2);

        object.lookAt(vector);

        targets.sphere.push(object);

        indexes[g]++;


    }

    // helix

    var vector = new THREE.Vector3();

    var helixSection = [];
    var current = [];
    var last = 0,
        helixPosition = 0;

    for (var i = 0; i < layersQtty; i++) {

        var totalInRow = 0;

        for (var j = 0; j < groupsQtty; j++) {

            if (typeof(section[i]) == "object")
                totalInRow += section[i][j];
            else if (j == 0)
                totalInRow += section[i];
        }

        helixPosition += last;
        helixSection.push(helixPosition);
        last = totalInRow;

        current.push(0);
    }

    for (var i = 0, l = objects.length; i < l; i++) {

        var row = table[i].layerID;

        var x = helixSection[row] + current[row];
        current[row]++;


        var phi = x * 0.175 + Math.PI;

        var object = new THREE.Object3D();

        object.position.x = 900 * Math.sin(phi);
        object.position.y = -(x * 8) + 450;
        object.position.z = 900 * Math.cos(phi);

        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;

        object.lookAt(vector);

        targets.helix.push(object);

    }

    // grid

    var gridLine = [];
    var gridLayers = [];
    var lastLayer = 0;


    for (var i = 0; i < layersQtty + 1; i++) {

        //gridLine.push(0);
        var gridLineSub = [];
        var empty = true;

        for (var j = 0; j < section.length; j++) {

            if (section[j][i] != 0) empty = false;

            gridLineSub.push(0);
        }

        if (!empty) lastLayer++;

        gridLayers.push(lastLayer);
        gridLine.push(gridLineSub);
    }

    for (var i = 0; i < objects.length; i++) {

        var group = table[i].groupID;
        var layer = table[i].layerID;

        var object = new THREE.Object3D();

        //By layer
        object.position.x = ((gridLine[layer][0] % 5) * 200) - 450;
        object.position.y = (-(Math.floor(gridLine[layer][0] / 5) % 5) * 200) + 0;
        object.position.z = (-gridLayers[layer]) * 200 + (layersQtty * 50);
        gridLine[layer][0]++;

        targets.grid.push(object);

    }

    //



    renderer = new THREE.CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    document.getElementById('container').appendChild(renderer.domElement);

    camera = new Camera(new THREE.Vector3(0, 0, columnWidth * groupsQtty * 140),
        renderer,
        render);


    //

    $('.backButton').click(function() {
        changeView(targets.table);
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

    //Disabled Menu
    //initMenu();

    transform(targets.table, 4000);
}

function initMenu() {

    var button = document.getElementById('table');
    button.addEventListener('click', function(event) {

        changeView(targets.table);

    }, false);

    var button = document.getElementById('sphere');
    button.addEventListener('click', function(event) {

        changeView(targets.sphere);

    }, false);

    var button = document.getElementById('helix');
    button.addEventListener('click', function(event) {

        changeView(targets.helix);

    }, false);

    var button = document.getElementById('grid');
    button.addEventListener('click', function(event) {

        changeView(targets.grid);

    }, false);

}

function createElement(i) {

    var element = document.createElement('div');
    element.className = 'element';
    element.id = i;

    element.addEventListener('click', onElementClick, false);

    if (table[i].picture != undefined) {
        var picture = document.createElement('img');
        picture.id = 'img-' + i;
        picture.className = 'picture';
        picture.src = table[i].picture;
        element.appendChild(picture);
    }

    var difficulty = document.createElement('div');
    difficulty.className = 'difficulty';
    difficulty.textContent = printDifficulty(Math.floor(table[i].difficulty / 2));
    element.appendChild(difficulty);

    var number = document.createElement('div');
    number.className = 'number';
    number.textContent = (table[i].group != undefined) ? table[i].group : layers[table[i].layer].super_layer;
    element.appendChild(number);

    var symbol = document.createElement('div');
    symbol.className = 'symbol';
    symbol.textContent = table[i].code;
    element.appendChild(symbol);

    var details = document.createElement('div');
    details.className = 'details';

    var pluginName = document.createElement('p');
    pluginName.innerHTML = table[i].name;
    pluginName.className = 'name';

    var layerName = document.createElement('p');
    layerName.innerHTML = table[i].layer;

    details.appendChild(pluginName);
    details.appendChild(layerName);
    element.appendChild(details);

    switch (table[i].code_level) {

        case "concept":
            element.style.boxShadow = '0px 0px 12px rgba(150,150,150,0.5)';
            element.style.backgroundColor = 'rgba(170,170,170,' + (Math.random() * 0.25 + 0.45) + ')';

            number.style.color = 'rgba(127,127,127,1)';
            layerName.style.color = 'rgba(127,127,127,1)';

            break;
        case "development":
            element.style.boxShadow = '0px 0px 12px rgba(244,133,107,0.5)';
            element.style.backgroundColor = 'rgba(234,123,97,' + (Math.random() * 0.25 + 0.45) + ')';

            number.style.color = 'rgba(234,123,97,1)';
            layerName.style.color = 'rgba(234,123,97,1)';


            break;
        case "qa":
            element.style.boxShadow = '0px 0px 12px rgba(244,244,107,0.5)';
            element.style.backgroundColor = 'rgba(194,194,57,' + (Math.random() * 0.25 + 0.45) + ')';

            number.style.color = 'rgba(194,194,57,1)';
            layerName.style.color = 'rgba(194,194,57,1)';


            break;
        case "production":
            element.style.boxShadow = '0px 0px 12px rgba(80,188,107,0.5)';
            element.style.backgroundColor = 'rgba(70,178,97,' + (Math.random() * 0.25 + 0.45) + ')';

            number.style.color = 'rgba(70,178,97,1)';
            layerName.style.color = 'rgba(70,178,97,1)';

            break;
    }

    return element;
}

function changeView(targets) {

    camera.enable();
    camera.loseFocus();

    if (targets != null)
        transform(targets, 2000);
}

function onElementClick() {

    var id = this.id;

    var image = document.getElementById('img-' + id);

    if (camera.getFocus() == null) {

        camera.setFocus(id, 2000);
        setTimeout(function() {
            camera.setFocus(id, 1000);
            $('#backButton').fadeTo(1000, 1, function() {
                $('#backButton').show();
            });
        }, 3000);
        camera.disable();

        if (image != null) {

            var handler = function() {
                onImageClick(id, image, handler);
            };

            image.addEventListener('click', handler, true);
        } else {}
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

function printDifficulty(value) {
    var max = 5;
    var result = "";

    while (value > 0) {
        result += '★';
        max--;
        value--;
    }

    while (max > 0) {
        result += '☆';
        max--;
    }

    return result;
}

function fillTable(list) {

    var pluginList = list.plugins;

    for (var i = 0, l = list.superLayers.length; i < l; i++) {
        superLayers[list.superLayers[i].code] = {};
        superLayers[list.superLayers[i].code].name = list.superLayers[i].name;
        superLayers[list.superLayers[i].code].index = list.superLayers[i].index;
    }

    for (var i = 0, l = list.layers.length; i < l; i++) {
        layers[list.layers[i].name] = {};
        layers[list.layers[i].name].index = list.layers[i].index;
        layers[list.layers[i].name].super_layer = list.layers[i].super_layer;
    }

    for (var i = 0, l = list.groups.length; i < l; i++) {
        groups[list.groups[i].code] = list.groups[i].index;
    }


    for (var i = 0, l = pluginList.length; i < l; i++) {

        var data = pluginList[i];

        var _group = data.group;
        var _layer = data.layer;
        var _name = data.name;

        var layerID = layers[_layer].index;
        layerID = (layerID == undefined) ? layers.size() : layerID;

        var groupID = groups[_group];
        groupID = (groupID == undefined) ? groups.size() : groupID;

        var element = {
            group: _group,
            groupID: groupID,
            code: helper.getCode(_name),
            name: _name,
            layer: _layer,
            layerID: layerID,
            type: data.type,
            picture: data.authorPicture,
            author: data.authorName ? data.authorName.trim().toLowerCase() : undefined,
            authorRealName: data.authorRealName ? data.authorRealName.trim() : undefined,
            authorEmail: data.authorEmail ? data.authorEmail.trim() : undefined,
            difficulty: data.difficulty,
            code_level: data.code_level ? data.code_level.trim().toLowerCase() : undefined,
            life_cycle: data.life_cycle
        };

        table.push(element);
    }

    var loader = new Loader();
    loader.findThemAll();
}

function transform(goal, duration) {

    TWEEN.removeAll();

    lastTargets = goal;

    for (var i = 0; i < objects.length; i++) {

        var object = objects[i];
        var target = goal[i];

        new TWEEN.Tween(object.position)
            .to({
                x: target.position.x,
                y: target.position.y,
                z: target.position.z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        new TWEEN.Tween(object.rotation)
            .to({
                x: target.rotation.x,
                y: target.rotation.y,
                z: target.rotation.z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

    }

    if (goal == targets.table) {
        headers.show(duration);
    } else {
        headers.hide(duration);
    }

    new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate(render)
        .start();
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