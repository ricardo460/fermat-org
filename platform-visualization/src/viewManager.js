function ViewManager() {
    
    this.lastTargets = null;
    this.targets = {
        table: [],
        sphere: [],
        helix: [],
        grid: []
    };
    this.dimensions = {};
    
    var groupsQtty;
    var layersQtty;
    var section = [];
    var columnWidth = 0;
    var layerPosition = [];
    
    var elementsByGroup = [];
    var superLayerMaxHeight = 0;
    var superLayerPosition = [];

    
    /**
     * Pre-computes the space layout for next draw
     */
    this.preComputeLayout = function() {

        var section_size = [],
            superLayerHeight = 0,
            isSuperLayer = [],
            i;

        //Initialize
        for (var key in layers) {
            if (key == "size") continue;

            if (layers[key].super_layer) {

                section.push(0);
                section_size.push(0);
                superLayerHeight++;

                if (superLayerMaxHeight < superLayerHeight) superLayerMaxHeight = superLayerHeight;
            } else {

                var newLayer = [];
                superLayerHeight = 0;

                for (i = 0; i < groupsQtty; i++)
                    newLayer.push(0);

                section_size.push(newLayer);
                section.push(newLayer.slice(0)); //Use a copy
            }

            isSuperLayer.push(false);
        }

        for (var j = 0; j <= groupsQtty; j++) {

            elementsByGroup.push(0);
        }

        //Set sections sizes

        for (i = 0; i < table.length; i++) {

            var r = table[i].layerID;
            var c = table[i].groupID;

            elementsByGroup[c]++;

            if (layers[table[i].layer].super_layer) {

                section_size[r]++;
                isSuperLayer[r] = true;
            } else {

                section_size[r][c]++;

                if (section_size[r][c] > columnWidth) columnWidth = section_size[r][c];
            }
        }

        //Set row height

        var actualHeight = 0;
        var remainingSpace = superLayerMaxHeight;
        var inSuperLayer = false;
        var actualSuperLayer = 0;

        for (i = 0; i < layersQtty; i++) {

            if (isSuperLayer[i]) {

                if (!inSuperLayer) {
                    actualHeight++;

                    if (superLayerPosition[actualSuperLayer] === undefined) {
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
    
    // Disabled
    this.otherViews = function() {
        
        var i, j, l, vector, phi, object;
        
        // sphere

        vector = new THREE.Vector3();

        var indexes = [];

        for (i = 0; i <= groupsQtty; i++) indexes.push(0);

        for (i = 0; i < objects.length; i++) {

            var g = (table[i].groupID !== undefined) ? table[i].groupID : groupsQtty;

            var radious = 300 * (g + 1);

            phi = Math.acos((2 * indexes[g]) / elementsByGroup[g] - 1);
            var theta = Math.sqrt(elementsByGroup[g] * Math.PI) * phi;

            object = new THREE.Object3D();

            object.position.x = radious * Math.cos(theta) * Math.sin(phi);
            object.position.y = radious * Math.sin(theta) * Math.sin(phi);
            object.position.z = radious * Math.cos(phi);

            vector.copy(object.position).multiplyScalar(2);

            object.lookAt(vector);

            this.targets.sphere.push(object);

            indexes[g]++;


        }

        // helix

        vector = new THREE.Vector3();

        var helixSection = [];
        var current = [];
        var last = 0,
            helixPosition = 0;

        for (i = 0; i < layersQtty; i++) {

            var totalInRow = 0;

            for (j = 0; j < groupsQtty; j++) {

                if (typeof(section[i]) == "object")
                    totalInRow += section[i][j];
                else if (j === 0)
                    totalInRow += section[i];
            }

            helixPosition += last;
            helixSection.push(helixPosition);
            last = totalInRow;

            current.push(0);
        }

        for (i = 0, l = objects.length; i < l; i++) {

            var row = table[i].layerID;

            var x = helixSection[row] + current[row];
            current[row]++;


            phi = x * 0.175 + Math.PI;

            object = new THREE.Object3D();

            object.position.x = 900 * Math.sin(phi);
            object.position.y = -(x * 8) + 450;
            object.position.z = 900 * Math.cos(phi);

            vector.x = object.position.x * 2;
            vector.y = object.position.y;
            vector.z = object.position.z * 2;

            object.lookAt(vector);

            this.targets.helix.push(object);

        }

        // grid

        var gridLine = [];
        var gridLayers = [];
        var lastLayer = 0;


        for (i = 0; i < layersQtty + 1; i++) {

            //gridLine.push(0);
            var gridLineSub = [];
            var empty = true;

            for (j = 0; j < section.length; j++) {

                if (section[j][i] !== 0) empty = false;

                gridLineSub.push(0);
            }

            if (!empty) lastLayer++;

            gridLayers.push(lastLayer);
            gridLine.push(gridLineSub);
        }

        for (i = 0; i < objects.length; i++) {

            var group = table[i].groupID;
            var layer = table[i].layerID;

            object = new THREE.Object3D();

            //By layer
            object.position.x = ((gridLine[layer][0] % 5) * 200) - 450;
            object.position.y = (-(Math.floor(gridLine[layer][0] / 5) % 5) * 200) + 0;
            object.position.z = (-gridLayers[layer]) * 200 + (layersQtty * 50);
            gridLine[layer][0]++;

            this.targets.grid.push(object);

        }

        //
    };

    /**
     * Uses the list to fill all global data
     * @param {Object} list List returned by the server
     */
    this.fillTable = function(list) {

        var pluginList = list.plugins,
            i, l, dependency;

        for (i = 0, l = list.superLayers.length; i < l; i++) {
            superLayers[list.superLayers[i].code] = {};
            superLayers[list.superLayers[i].code].name = list.superLayers[i].name;
            superLayers[list.superLayers[i].code].index = list.superLayers[i].index;

            if(list.superLayers[i].dependsOn && list.superLayers[i].dependsOn.length !== 0) {
                dependency = list.superLayers[i].dependsOn.split(' ').join('').split(',');
                superLayers[list.superLayers[i].code].dependsOn = dependency;
            }
        }

        for (i = 0, l = list.layers.length; i < l; i++) {
            layers[list.layers[i].name] = {};
            layers[list.layers[i].name].index = list.layers[i].index;
            layers[list.layers[i].name].super_layer = list.layers[i].super_layer;
        }

        for (i = 0, l = list.groups.length; i < l; i++) {
            groups[list.groups[i].code] = {};
            groups[list.groups[i].code].index = list.groups[i].index;

            if(list.groups[i].dependsOn && list.groups[i].dependsOn.length !== 0) {
                dependency = list.groups[i].dependsOn.split(' ').join('').split(',');
                groups[list.groups[i].code].dependsOn = dependency;
            }
        }


        for (i = 0, l = pluginList.length; i < l; i++) {

            var data = pluginList[i];

            var _group = data.group;
            var _layer = data.layer;
            var _name = data.name;

            var layerID = layers[_layer].index;
            layerID = (layerID === undefined) ? layers.size() : layerID;

            var groupID = (_group !== undefined) ? groups[_group].index : undefined;
            groupID = (groupID === undefined) ? groups.size() : groupID;

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
        
        groupsQtty = groups.size();
        layersQtty = layers.size();
    };
    
    /**
     * Creates a Tile
     * @param   {Number}     i ID of the tile (index in table)
     * @returns {DOMElement} The drawable element that represents the tile
     */
    this.createElement = function(i) {

        var element = document.createElement('div');
        element.className = 'element';
        element.id = i;

        element.addEventListener('click', onElementClick, false);

        if (table[i].picture !== undefined) {
            var picture = document.createElement('img');
            picture.id = 'img-' + i;
            picture.className = 'picture';
            picture.src = table[i].picture;
            element.appendChild(picture);
        }

        var difficulty = document.createElement('div');
        difficulty.className = 'difficulty';
        difficulty.textContent = helper.printDifficulty(Math.floor(table[i].difficulty / 2));
        element.appendChild(difficulty);

        var number = document.createElement('div');
        number.className = 'number';
        number.textContent = (table[i].group !== undefined) ? table[i].group : layers[table[i].layer].super_layer;
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
    };
    
    /**
     * Converts the table in another form
     * @param {Array}  goal     Member of ViewManager.targets
     * @param {Number} duration Milliseconds of animation
     */
    this.transform = function(goal, duration) {

        var i, l;
        
        duration = duration || 2000;
        
        TWEEN.removeAll();

        if(goal) {
            this.lastTargets = goal;

            for (i = 0; i < objects.length; i++) {

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

            if (goal == this.targets.table) {
                headers.show(duration);
            } else {
                headers.hide(duration);
            }
        }
        
        new TWEEN.Tween(this)
            .to({}, duration * 2)
            .onUpdate(render)
            .start();
    };
    
    /**
     * Goes back to last target set in last transform
     */
    this.rollBack = function() {
        changeView(this.lastTargets);
    };
    
    /**
     * Inits and draws the table, also creates the Dimensions object
     */
    this.drawTable = function() {
        
        this.preComputeLayout();
        
        for (var i = 0; i < table.length; i++) {

            var element = this.createElement(i);

            var object = new THREE.CSS3DObject(element);
            object.position.x = 0;
            object.position.y = 0;
            object.position.z = 80000;
            scene.add(object);

            objects.push(object);

            //

            object = new THREE.Object3D();

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

            this.targets.table.push(object);

        }
        
        this.dimensions = {
            columnWidth : columnWidth,
            superLayerMaxHeight : superLayerMaxHeight,
            groupsQtty : groupsQtty,
            layersQtty : layersQtty,
            superLayerPosition : superLayerPosition
        };
    };
    
    /**
     * Takes away all the tiles except the one with the id
     * @param {Number} [id]            The id to let alone
     * @param {Number} [duration=2000] Duration of the animation
     */
    this.letAlone = function(id, duration) {
        
        var i, _duration = duration || 2000,
            distance = camera.getMaxDistance();
        
        TWEEN.removeAll();
        
        for(i = 0; i < objects.length; i++) {
            
            if(i === id) continue;
            
            new TWEEN.Tween(objects[i].position)
            .to({
                x: 0,
                y: 0,
                z: distance
            }, Math.random() * _duration + _duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
        
        new TWEEN.Tween(this)
            .to({}, _duration * 2)
            .onUpdate(render)
            .start();
    };
    
}