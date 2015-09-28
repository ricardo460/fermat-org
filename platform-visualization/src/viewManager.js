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
                    actualHeight+= 3;

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
    this.createElement = function(id) {

        var mesh,
            element = new THREE.LOD(),
            levels = [
            ['high', 0],
            ['medium', 1000],
            ['small', 1800],
            ['mini', 2300]],
            texture,
            tileWidth = window.TILE_DIMENSION.width - window.TILE_SPACING,
            tileHeight = window.TILE_DIMENSION.height - window.TILE_SPACING,
            scale = 2;
        
        for(var j = 0, l = levels.length; j < l; j++) {
            
            texture = createTexture(id, tileWidth, tileHeight, scale);
            
            mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(tileWidth, tileHeight),
                new THREE.MeshBasicMaterial({vertexColors : THREE.FaceColors, side : THREE.FrontSide, color : 0xffffff})
            );
            mesh.userData = {id : id};
            mesh.material.map = texture;
            mesh.material.needsUpdate = true;
            element.addLevel(mesh, levels[j][1]);
        }
        
        function createTexture(id, tileWidth, tileHeight, scale) {
            
            var state = table[id].code_level,
                difficulty = Math.ceil(table[id].difficulty / 2),
                group = table[id].group || window.layers[table[id].layer].super_layer,
                type = table[id].type,
                picture = table[id].picture,
                base = 'images/tiles/';
            
            var canvas = document.createElement('canvas');
            canvas.width = tileWidth * scale;
            canvas.height = tileHeight * scale;
            
            var middle = canvas.width / 2;
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, tileWidth * scale, tileHeight * scale);
            ctx.textAlign = 'center';
            
            var texture = new THREE.Texture(canvas);
            texture.minFilter = THREE.NearestFilter;
            texture.magFilter = THREE.LinearFilter;
            
            var pic = {
                    src : picture || base + 'buster.png',
                    alpha : 0.8
                },
                portrait = {
                    src : base + 'portrait/' + levels[j][0] + '/' + state + '.png',
                    x : 0, y : 0,
                    w : tileWidth * scale, h : tileHeight * scale
                },
                groupIcon = {
                    src : base + 'icons/group/' + levels[j][0] + '/icon_' + group + '.png',
                    w : 28 * scale, h : 28 * scale
                },
                typeIcon = {
                    src : base + 'icons/type/' + levels[j][0] + '/' + type.toLowerCase() + '_logo.png',
                    w : 28 * scale, h : 28 * scale
                },
                ring = {
                    src : base + 'rings/' + levels[j][0] + '/' + state + '_diff_' + difficulty + '.png'
                },
                codeText = {
                    text : table[id].code,
                    font : (18 * scale) + "px Arial"
                },
                nameText = {
                    text : table[id].name,
                    font : (10 * scale) + 'px Arial'
                },
                layerText = {
                    text : table[id].layer,
                    font : (6 * scale) + 'px Arial'
                },
                authorText = {
                    text : table[id].authorRealName || table[id].author || '',
                    font : (3.5 * scale) + 'px Arial'
                };
            
            if(id === 185)
                console.log("now");
            
            switch(state) {
                case "concept":
                    pic.x = 80 * scale;
                    pic.y = 36 * scale;
                    pic.w = 53 * scale;
                    pic.h = 53 * scale;
                    
                    groupIcon.x = 25 * scale;
                    groupIcon.y = 49 * scale;
                    
                    typeIcon.x = 160 * scale;
                    typeIcon.y = 49 * scale;
                    
                    ring.x = 72 * scale;
                    ring.y = 93 * scale;
                    ring.w = 68 * scale;
                    ring.h = 9 * scale;
                    
                    codeText.x = middle;
                    codeText.y = 21 * scale;
                    
                    nameText.x = middle;
                    nameText.y = 33 * scale;
                    nameText.font = (9 * scale) + 'px Arial';
                    nameText.color = "#000000";
                    
                    layerText.x = middle;
                    layerText.y = 114 * scale;
                    
                    authorText.x = middle;
                    authorText.y = 80 * scale;
                    
                    break;
                case "development":
                    pic.x = 82 * scale;
                    pic.y = 47 * scale;
                    pic.w = 53 * scale;
                    pic.h = 53 * scale;
                    
                    groupIcon.x = 35 * scale;
                    groupIcon.y = 76 * scale;
                    
                    typeIcon.x = 154 * scale;
                    typeIcon.y = 76 * scale;
                    
                    ring.x = 66 * scale;
                    ring.y = 31 * scale;
                    ring.w = 82 * scale;
                    ring.h = 81 * scale;
                    
                    codeText.x = middle;
                    codeText.y = 20 * scale;
                    
                    nameText.x = middle;
                    nameText.y = 28 * scale;
                    nameText.font = (6 * scale) + 'px Arial';
                    
                    layerText.x = middle;
                    layerText.y = 113 * scale;
                    layerText.color = "#F26662";
                    
                    authorText.x = middle;
                    authorText.y = 88 * scale;
                    
                    break;
                case "qa":
                    pic.x = 80 * scale;
                    pic.y = 35 * scale;
                    pic.w = 53 * scale;
                    pic.h = 53 * scale;
                    
                    groupIcon.x = 35 * scale;
                    groupIcon.y = 76 * scale;
                    
                    typeIcon.x = 154 * scale;
                    typeIcon.y = 76 * scale;
                    
                    ring.x = 68 * scale;
                    ring.y = 35 * scale;
                    ring.w = 79 * scale;
                    ring.h = 68 * scale;
                    
                    codeText.x = middle;
                    codeText.y = 20 * scale;
                    
                    nameText.x = middle;
                    nameText.y = 28 * scale;
                    nameText.font = (6 * scale) + 'px Arial';
                    
                    layerText.x = middle;
                    layerText.y = 112 * scale;
                    layerText.color = "#FCC083";
                    
                    authorText.x = middle;
                    authorText.y = 78 * scale;
                    
                    break;
                case "production":
                    pic.x = 56 * scale;
                    pic.y = 33 * scale;
                    pic.w = 53 * scale;
                    pic.h = 53 * scale;
                    
                    groupIcon.x = 17 * scale;
                    groupIcon.y = 30 * scale;
                    
                    typeIcon.x = 17 * scale;
                    typeIcon.y = 62 * scale;
                    
                    ring.x = 25 * scale;
                    ring.y = 99 * scale;
                    ring.w = 68 * scale;
                    ring.h = 9 * scale;
                    
                    codeText.x = 170 * scale;
                    codeText.y = 26 * scale;
                    
                    nameText.x = 170 * scale;
                    nameText.y = 71 * scale;
                    nameText.font = (7 * scale) + 'px Arial';
                    nameText.constraint = 60 * scale;
                    nameText.lineHeight = 9 * scale;
                    nameText.wrap = true;
                    
                    layerText.x = 170 * scale;
                    layerText.y = 107 * scale;
                    
                    authorText.x = 82 * scale;
                    authorText.y = 77 * scale;
                    
                    break;
            }
            
            if(state == "concept" || state == "production")
                ring.src = base + 'rings/' + levels[j][0] + '/linear_diff_' + difficulty + '.png';
            
            if(difficulty === 0)
                ring = {};
            
            var data = [
                    pic,
                    portrait,
                    groupIcon,
                    typeIcon,
                    ring,
                    codeText,
                    nameText,
                    layerText,
                    authorText
                ];
            
            drawPicture(data, ctx, texture);
            
            return texture;
        }
        
        function drawPicture(data, ctx, texture) {
            
            var image = new Image();
            var actual = data.shift();
            
            if(actual.src && actual.src != 'undefined') {
            
                image.onload = function() {


                    if(actual.alpha)
                        ctx.globalAlpha = actual.alpha;

                    ctx.drawImage(image, actual.x, actual.y, actual.w, actual.h);
                    if(texture)
                        texture.needsUpdate = true;

                    ctx.globalAlpha = 1;

                    if(data.length !== 0) {

                        if(data[0].text)
                            drawText(data, ctx, texture);
                        else
                            drawPicture(data, ctx, texture);
                    }
                };
                
                image.onerror = function() {
                    if(data.length !== 0) {
                        if(data[0].text)
                            drawText(data, ctx, texture);
                        else
                            drawPicture(data, ctx, texture);
                    }
                };
                
                image.crossOrigin="anonymous";
                image.src = actual.src;
            }
            else {
                if(data.length !== 0) {
                    if(data[0].text)
                        drawText(data, ctx, texture);
                    else
                        drawPicture(data, ctx, texture);
                }
            }
        }
        
        function drawText(data, ctx, texture) {
            
            var actual = data.shift();
            
            //TODO: Set Roboto typo
            
            if(actual.color)
                ctx.fillStyle = actual.color;
            
            ctx.font = actual.font;
            
            if(actual.constraint)
                if(actual.wrap)
                    helper.drawText(actual.text, actual.x, actual.y, ctx, actual.constraint, actual.lineHeight);
                else
                    ctx.fillText(actual.text, actual.x, actual.y, actual.constraint);
            else
                ctx.fillText(actual.text, actual.x, actual.y);
            
            if(texture)
                texture.needsUpdate = true;
            
            ctx.fillStyle = "#FFFFFF";
            
            if(data.length !== 0)
                drawText(data, ctx);
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

            var object = this.createElement(i);
            
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

                object.position.x = ((section[row]) * window.TILE_DIMENSION.width) - (columnWidth * groupsQtty * window.TILE_DIMENSION.width / 2);

                section[row]++;

            } else {

                //Column (X)
                var column = table[i].groupID;
                object.position.x = (((column * (columnWidth) + section[row][column]) + column) * window.TILE_DIMENSION.width) - (columnWidth * groupsQtty * window.TILE_DIMENSION.width / 2);

                section[row][column]++;
            }


            object.position.y = -((layerPosition[row]) * window.TILE_DIMENSION.height) + (layersQtty * window.TILE_DIMENSION.height / 2);

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