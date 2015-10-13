function ViewManager() {

    this.lastTargets = null;
    this.targets = {
        table: [],
        sphere: [],
        helix: [],
        grid: []
    };
    this.dimensions = {};

    var self = this;
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
                    actualHeight += 3;

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
    /*this.fillTable = function(list) {
        var pluginList = list.plugins,
            i, l, dependency;

        for (i = 0, l = list.superLayers.length; i < l; i++) {
            superLayers[list.superLayers[i].code] = {};
            superLayers[list.superLayers[i].code].name = list.superLayers[i].name;
            superLayers[list.superLayers[i].code].index = list.superLayers[i].index;

            if (list.superLayers[i].dependsOn && list.superLayers[i].dependsOn.length !== 0) {
                dependency = list.superLayers[i].dependsOn.split(' ').join('').split(',');
                superLayers[list.superLayers[i].code].dependsOn = dependency;
            }
        }
        console.dir(superLayers);

        for (i = 0, l = list.layers.length; i < l; i++) {
            layers[list.layers[i].name] = {};
            layers[list.layers[i].name].index = list.layers[i].index;
            layers[list.layers[i].name].super_layer = list.layers[i].super_layer;
        }
        console.dir(layers);


        for (i = 0, l = list.groups.length; i < l; i++) {
            groups[list.groups[i].code] = {};
            groups[list.groups[i].code].index = list.groups[i].index;

            if (list.groups[i].dependsOn && list.groups[i].dependsOn.length !== 0) {
                dependency = list.groups[i].dependsOn.split(' ').join('').split(',');
                groups[list.groups[i].code].dependsOn = dependency;
            }
        }
        console.dir(groups);

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
        console.dir(table);

        groupsQtty = groups.size();
        layersQtty = layers.size();
    };*/

    var getSPL = function(_id, _SPLArray) {
        if (_id) {
            for (var i = 0, l = _SPLArray.length; i < l; i++) {
                if (_SPLArray[i]._id + '' == _id + '') {
                    return _SPLArray[i];
                }
            }
        } else {
            return null;
        }
    };

    var getBestDev = function(_devs) {
        var dev = {};
        if (_devs) {
            var _dev = {};
            dev.percnt = 0;
            for (var i = 0, l = _devs.length; i < l; i++) {
                _dev = _devs[i];
                if (_dev.scope == 'implementation' && _dev.percnt >= dev.percnt) {
                    dev.percnt = _dev.percnt;
                    dev.usrnm = _dev.dev.usrnm;
                    dev.name = _dev.dev.name;
                    dev.email = _dev.dev.email;
                    dev.avatar_url = _dev.dev.avatar_url;
                }
            }
        }
        return dev;
    };

    this.fillTable = function(list) {
        var _suprlays = list.suprlays,
            _platfrms = list.platfrms,
            _layers = list.layers,
            _comps = list.comps,
            i, l, code, name;

        for (i = 0, l = _suprlays.length; i < l; i++) {
            code = _suprlays[i].code;
            superLayers[code] = {};
            superLayers[code].name = _suprlays[i].name;
            superLayers[code].index = _suprlays[i].order;
            //superLayers[code]._id = _suprlays[i]._id;
            superLayers[code].dependsOn = _suprlays[i].deps;
        }

        for (i = 0, l = _platfrms.length; i < l; i++) {
            code = _platfrms[i].code;
            groups[code] = {};
            groups[code].index = _platfrms[i].order;
            groups[code].dependsOn = _platfrms[i].deps;
            //groups[code]._id = _platfrms[i]._id;
        }

        layers['empty layer 0'] = {
            index: 27,
            super_layer: false
        };
        layers['empty layer 1'] = {
            index: 5,
            super_layer: false
        };
        layers['empty layer 2'] = {
            index: 26,
            super_layer: false
        };
        layers['empty layer 3'] = {
            index: 29,
            super_layer: false
        };
        layers['empty layer 4'] = {
            index: 34,
            super_layer: false
        };
        layers['empty layer 5'] = {
            index: 40,
            super_layer: false
        };
        for (i = 0, l = _layers.length; i < l; i++) {
            name = helper.capFirstLetter(_layers[i].name);
            layers[name] = {};
            layers[name].super_layer = _layers[i].suprlay ? _layers[i].suprlay : false;
            /*switch (_layers[i].name) {
                case 'communication':
                    layers[name].super_layer = 'P2P';
                    break;
                case 'multi os':
                    layers[name].super_layer = 'OSA';
                    break;
                case 'android':
                    layers[name].super_layer = 'OSA';
                    break;
                case 'crypto router':
                    layers[name].super_layer = 'BCH';
                    break;
                case 'crypto module':
                    layers[name].super_layer = 'BCH';
                    break;
                case 'crypto vault':
                    layers[name].super_layer = 'BCH';
                    break;
                case 'crypto network':
                    layers[name].super_layer = 'BCH';
                    break;
                default:
                    layers[name].super_layer = false;
                    break;
            }*/
            layers[name].index = _layers[i].order;
            //layers[name]._id = _layers[i]._id;
        }

        for (i = 0, l = _comps.length; i < l; i++) {

            var _comp = _comps[i];

            var _platfrm = getSPL(_comp._platfrm_id, _platfrms);
            var _layer = getSPL(_comp._layer_id, _layers);

            var layerID = _layer.order;
            layerID = (layerID === undefined || layerID == -1) ? layers.size() : layerID;

            var groupID = (_platfrm !== undefined && _platfrm !== null) ? _platfrm.order : undefined;
            groupID = (groupID === undefined || groupID == -1) ? groups.size() : groupID;

            var _author = getBestDev(_comp.devs);

            var element = {
                group: _platfrm ? _platfrm.code : undefined,
                groupID: groupID,
                code: helper.getCode(_comp.name),
                name: helper.capFirstLetter(_comp.name),
                layer: helper.capFirstLetter(_layer.name),
                layerID: layerID,
                type: helper.capFirstLetter(_comp.type),
                picture: _author.avatar_url ? _author.avatar_url : undefined,
                author: _author.usrnm ? _author.usrnm : undefined,
                authorRealName: _author.name ? _author.name : undefined,
                authorEmail: _author.email ? _author.email : undefined,
                difficulty: _comp.difficulty,
                code_level: _comp.code_level ? _comp.code_level : undefined,
                life_cycle: _comp.life_cycle,
                found: _comp.found
            };
            table.push(element);
        }
        
        groupsQtty = groups.size();
        layersQtty = layers.size();
    };

    /**
     * Creates the tile texture
     * @param   {Number} id         ID in the table
     * @param   {String} quality    The quality of the picture as folder in the images dir
     * @param   {Number} tileWidth  Width of the tile
     * @param   {Number} tileHeight Height of the tile
     * @param   {Number} scale      Scale of the pictures, the bigger, the better but heavier
     * @returns {Object} The drawn texture
     */
    this.createTexture = function(id, quality, tileWidth, tileHeight, scale) {
        
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
                    src: base + 'portrait/' + quality + '/' + state + '.png',
                    x: 0,
                    y: 0,
                    w: tileWidth * scale,
                    h: tileHeight * scale
            },
            groupIcon = {
                src : base + 'icons/group/' + quality + '/icon_' + group + '.png',
                    w: 28 * scale,
                    h: 28 * scale
            },
            typeIcon = {
                src : base + 'icons/type/' + quality + '/' + type.toLowerCase() + '_logo.png',
                    w: 28 * scale,
                    h: 28 * scale
            },
            ring = {
                src : base + 'rings/' + quality + '/' + state + '_diff_' + difficulty + '.png'
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

        switch(state) {
            case "concept":
                pic.x = 79 * scale;
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
                pic.x = 79 * scale;
                pic.y = 47 * scale;
                pic.w = 53 * scale;
                pic.h = 53 * scale;

                groupIcon.x = 25 * scale;
                groupIcon.y = 76 * scale;

                typeIcon.x = 154 * scale;
                typeIcon.y = 76 * scale;

                ring.x = 64.5 * scale;
                ring.y = 30.8 * scale;
                ring.w = 82 * scale;
                ring.h = 81.5 * scale;

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
                ring.y = 34.7 * scale;
                ring.w = 79 * scale;
                ring.h = 68.5 * scale;

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
            ring.src = base + 'rings/' + quality + '/linear_diff_' + difficulty + '.png';

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

            if(levels[j][0] === 'high') scale = 5;
            else scale = 1;

            texture = self.createTexture(id, levels[j][0], tileWidth, tileHeight, scale);

            mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(tileWidth, tileHeight),
                new THREE.MeshBasicMaterial({vertexColors : THREE.FaceColors, side : THREE.FrontSide, color : 0xffffff})
            );
            mesh.userData = {id : id};
            mesh.material.map = texture;
            mesh.material.needsUpdate = true;
            element.addLevel(mesh, levels[j][1]);
            element.userData = {flying : false};
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

        //TWEEN.removeAll();

        if (goal) {
            
            this.lastTargets = goal;
            
            var animate = function(object, target) { 
                
                 new TWEEN.Tween(object.position)
                    .to({
                        x: target.position.x,
                        y: target.position.y,
                        z: target.position.z
                    }, Math.random() * duration + duration)
                    .easing(TWEEN.Easing.Exponential.InOut)
                    .onComplete(function() { object.userData.flying = false; })
                    .start();

                new TWEEN.Tween(object.rotation)
                    .to({
                        x: target.rotation.x,
                        y: target.rotation.y,
                        z: target.rotation.z
                    }, Math.random() * duration + duration)
                    .easing(TWEEN.Easing.Exponential.InOut)
                    .start();
                
            };

            
            for (i = 0; i < objects.length; i++) {

                var object = objects[i];
                var target = goal[i];
                
                animate(object, target);

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

            object.position.x = Math.random() * 80000 - 40000;
            object.position.y = Math.random() * 80000 - 40000;
            object.position.z = 80000;
            object.rotation.x = Math.random() * 180;
            object.rotation.y = Math.random() * 180;
            object.rotation.z = Math.random() * 180;
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
            columnWidth: columnWidth,
            superLayerMaxHeight: superLayerMaxHeight,
            groupsQtty: groupsQtty,
            layersQtty: layersQtty,
            superLayerPosition: superLayerPosition
        };
    };

    /**
     * Takes away all the tiles except the one with the id
     * @param {Array}  [ids]           The IDs to let alone
     * @param {Number} [duration=2000] Duration of the animation
     */
    this.letAlone = function(ids, duration) {
        
        if(typeof ids === 'undefined') ids = [];
        if(typeof ids === 'number') ids = [ids];

        var i, _duration = duration || 2000,
            distance = camera.getMaxDistance(),
            out = new THREE.Vector3(0, 0, distance);

        TWEEN.removeAll();

        var target;
        
        var animate = function(object, target, dur) {

            new TWEEN.Tween(object.position)
                .to({
                x: target.x,
                y: target.y,
                z: target.z
            }, dur)
                .easing(TWEEN.Easing.Exponential.InOut)
            .onComplete(function() { object.userData.flying = false; })
                .start();
            
        };
        
        for(i = 0; i < objects.length; i++) {
            
            if(ids.indexOf(i) !== -1) {
                target = this.lastTargets[i].position;
            }
            else {
                target = out;
                objects[i].userData.flying = true;
            }
            
            animate(objects[i], target, Math.random() * _duration + _duration);
        }

        new TWEEN.Tween(this)
            .to({}, _duration * 2)
            .onUpdate(render)
            .start();
    };
    
    //Private methods
    /**
     * Draws a picture in canvas
     * @param {Array}  data    The options of the picture
     * @param {Object} ctx     Canvas context
     * @param {Object} texture The texture object to update
     */
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

    /**
     * Draws a texture in canvas
     * @param {Array}  data    Options of the texture
     * @param {Object} ctx     Canvas Context
     * @param {Object} texture Texture to update
     */
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
}