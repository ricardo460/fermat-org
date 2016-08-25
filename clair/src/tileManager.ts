/**
 * Controls how tiles behaves
 */
class TileManager {

    constructor() {
        if (window.location.hash === '#low') {
            this.MAX_TILE_DETAIL_SCALE = 2;
        }
    }

    MAX_TILE_DETAIL_SCALE = 5;


    dimensions: TableDimensions;
    elementsByGroup = [];
    levels = {
        'high': 1000,
        'medium': 2500,
        'small': 5000,
        'mini': 10000
    };

    jsonTile: TileData;
    groupsQtty;
    _firstLayer;
    layersQtty;
    section = [];
    columnWidth = 0;
    layerPosition = [];
    superLayerMaxHeight = 0;
    superLayerPosition = [];
    qualities = {};
    platformsQtty;

    onClick(target : THREE.Object3D) : void {
        if (globals.actualView === 'table')
            onElementClick(target.userData.id);
    };

    JsonTile(callback: (Object) => void): void {
        $.get("json/config_tile.json", {}, (json) => {
            this.jsonTile = json;
            this.qualities = this.jsonTile.qualities;
            callback();
        });
    };

    /**
     * Pre-computes the space layout for next draw
     */
    preComputeLayout(): void {

        let SUPER_LAYER_SEPARATION = 3;

        let section_size = [],
            superLayerHeight = 0,
            isSuperLayer = [],
            i, actualSuperLayerName: string | boolean = '';

        //Initialize
        for (let key in globals.layers) {
            if (key == "size") continue;

            let id = globals.layers[key].index;

            if (globals.layers[key].super_layer !== actualSuperLayerName) {
                superLayerHeight = 0;
                actualSuperLayerName = globals.layers[key].super_layer;
            }

            if (globals.layers[key].super_layer) {

                this.section[id] = 0;
                section_size[id] = 0;
                superLayerHeight++;

                if (this.superLayerMaxHeight < superLayerHeight) this.superLayerMaxHeight = superLayerHeight;
            }
            else {

                let newLayer = [];

                for (i = 0; i < this.groupsQtty; i++)
                    newLayer.push(0);

                section_size[id] = newLayer;
                this.section[id] = newLayer.slice(0); //Use a copy
            }

            isSuperLayer.push(false);
        }

        for (let j = 0; j <= this.groupsQtty; j++) {

            this.elementsByGroup.push([]);
        }

        //Set this.sections sizes

        for (let platfrm in globals.TABLE) {

            for (let layer in globals.TABLE[platfrm].layers) {

                for (i = 0; i < globals.TABLE[platfrm].layers[layer].objects.length; i++) {

                    let tile = globals.TABLE[platfrm].layers[layer].objects[i];

                    let r = tile.data.layerID;

                    let c = tile.data.platformID;
                    let idT = tile.id;

                    this.elementsByGroup[c].push(idT);

                    if (globals.layers[tile.data.layer].super_layer) {

                        section_size[r]++;
                        isSuperLayer[r] = globals.layers[tile.data.layer].super_layer;
                    } else {

                        section_size[r][c]++;
                        if (section_size[r][c] > this.columnWidth) this.columnWidth = section_size[r][c];
                    }

                }
            }
        }

        //Set row height

        let actualHeight = 0;
        let remainingSpace = this.superLayerMaxHeight;
        let inSuperLayer = false;
        let actualSuperLayer = -1;

        actualSuperLayerName = false;

        for (i = 0; i < this.layersQtty; i++) {

            if (isSuperLayer[i] !== actualSuperLayerName) {

                actualHeight += remainingSpace + 1;
                remainingSpace = this.superLayerMaxHeight;

                if (isSuperLayer[i]) {
                    actualSuperLayer++;
                    inSuperLayer = false;
                }

                actualSuperLayerName = isSuperLayer[i];
            }

            if (isSuperLayer[i]) {

                if (!inSuperLayer) {
                    actualHeight += SUPER_LAYER_SEPARATION;

                    if (this.superLayerPosition[actualSuperLayer] === undefined) {
                        this.superLayerPosition[actualSuperLayer] = actualHeight;
                    }
                }

                inSuperLayer = true;
                actualHeight++;
                remainingSpace--;
            } else {

                if (inSuperLayer) {

                    actualHeight += remainingSpace + 1;
                    remainingSpace = this.superLayerMaxHeight;
                }

                inSuperLayer = false;
                actualHeight++;
            }

            if (actualHeight == 6)   //Separates GUI this.section
                actualHeight += 2;

            this.layerPosition[i] = actualHeight;
        }
    };

    fillTable(list: Object): void {
        let _suprlays = list.suprlays,
            _platfrms = list.platfrms,
            _layers = list.layers,
            _comps = list.comps,
            i, l, code, name;

        for (i = 0, l = _suprlays.length; i < l; i++) {
            code = _suprlays[i].code;
            globals.superLayers[code] = {};
            globals.superLayers[code].name = _suprlays[i].name;
            globals.superLayers[code].index = _suprlays[i].order;
            globals.superLayers[code]._id = _suprlays[i]._id;
            globals.superLayers[code].dependsOn = _suprlays[i].deps;
            globals.TABLE[code] = {
                layers: {},
                ID: _suprlays[i]._id,
                isSlayer: code
            };
        }

        for (i = 0, l = _platfrms.length; i < l; i++) {
            code = _platfrms[i].code;
            globals.platforms[code] = {};
            globals.platforms[code].index = _platfrms[i].order;
            globals.platforms[code].dependsOn = _platfrms[i].deps;
            globals.platforms[code]._id = _platfrms[i]._id;
            globals.TABLE[code] = {
                layers: {},
                ID: _platfrms[i]._id,
                isSlayer: false
            };
        }

        for (i = 0, l = _layers.length; i < l; i++) {
            name = Helper.capFirstLetter(_layers[i].name);
            globals.layers[name] = {};
            //TODO: Temp fix of the server
            globals.layers[name].super_layer = (_layers[i].suprlay !== "false") ? _layers[i].suprlay : false;
            globals.layers[name].index = _layers[i].order;
            globals.layers[name]._id = _layers[i]._id;
        }

        let buildElement = (e) => {

            let _comp = _comps[e];

            let _platfrm = this.getSPL(_comp._platfrm_id, _platfrms);
            let _layer = this.getSPL(_comp._layer_id, _layers);
            let _suprlay = this.getSPL(_comp._suprlay_id, _suprlays);

            let layerID = _layer.order;
            layerID = (layerID === undefined) ? globals.layers.size() : layerID;

            let superlayerID = _suprlay ? _suprlay.order + globals.platforms.size() : undefined;

            let platformID = _platfrm ? _platfrm.order : undefined;
            platformID = (platformID === undefined) ? superlayerID : platformID;

            let _author = this.getBestDev(_comp.devs, "author");
            let _maintainer = this.getBestDev(_comp.devs, "maintainer");

            _layer = Helper.capFirstLetter(_layer.name);

            let element = {
                id: _comp._id,
                platform: _platfrm ? _platfrm.code : undefined,
                platformID: platformID,
                superLayer: globals.layers[_layer].super_layer,
                code: Helper.getCode(_comp.name),
                name: Helper.capFirstLetter(_comp.name),
                layer: _layer,
                layerID: layerID,
                type: Helper.capFirstLetter(_comp.type),
                picture: _author.avatar_url ? _author.avatar_url : undefined,
                author: _author.usrnm ? _author.usrnm : undefined,
                authorRealName: _author.name ? _author.name : undefined,
                authorEmail: _author.email ? _author.email : undefined,
                maintainer: _maintainer.usrnm ? _maintainer.usrnm : undefined,
                maintainerPicture: _maintainer.avatar_url ? _maintainer.avatar_url : undefined,
                maintainerRealName: _maintainer.name ? _maintainer.name : undefined,
                difficulty: _comp.difficulty,
                code_level: _comp.code_level ? _comp.code_level : undefined,
                life_cycle: _comp.life_cycle,
                found: _comp.found,
                devs: _comp.devs,
                repo_dir: _comp.repo_dir,
                description: _comp.description
            };
            return element;
        };

        for (i = 0, l = _comps.length; i < l; i++) {

            let element = buildElement(i);

            //An element is always inside a platform or a superlayer
            //TODO: Temp fix of the server
            let group = element.platform || ((element.superLayer !== "false") ? element.superLayer : false),
                layer = element.layer;

            if (typeof globals.TABLE[group] === 'undefined') {
                globals.TABLE[group] = {
                    layers: {},
                    ID: element.platformID,
                    isSlayer: element.superLayer
                };
            }

            if (typeof globals.TABLE[group].layers[layer] === 'undefined') {
                globals.TABLE[group].layers[layer] = {
                    objects: [],
                    y: 0,
                    ID: element.layerID
                };
            }

            let lastObject = globals.TABLE[group].layers[layer].objects.length;
            let count = lastObject;


            let objectTile = {
                mesh: null,
                data: element,
                target: {},
                id: group + '_' + layer + '_' + count
            };


            globals.tilesQtty.push(objectTile.id);

            globals.TABLE[group].layers[layer].objects.push(objectTile);

        }

        this.groupsQtty = _platfrms.length + _suprlays.length;
        this.layersQtty = list.layers.length;
        this.platformsQtty = _platfrms.length;
        this._firstLayer = _layers[0].order;
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
    createTexture(id:number, quality:string, tileWidth:number, tileHeight:number, scale:number, _table?:Object):THREE.Texture {

        let tile = _table || Helper.getSpecificTile(id).data;

        let state = tile.code_level,
            difficulty = Math.ceil(tile.difficulty / 2),
            group = tile.platform || globals.layers[tile.layer].super_layer,
            type = tile.type,
            picture = tile.picture,
            base = 'images/tiles/';

        let canvas = document.createElement('canvas');
        canvas.width = tileWidth * scale;
        canvas.height = tileHeight * scale;

        let middle = canvas.width / 2;
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = 'center';

        let texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.LinearFilter;

        let pic: TileElementData = {
            src: picture || base + 'buster.png',
            x: 0, y: 0, h: 0, w: 0
        },
            portrait: TileElementData = {
                src: base + 'portrait/' + quality + '/' + state + '.png',
                x: this.jsonTile.global.portrait.x,
                y: this.jsonTile.global.portrait.y,
                w: this.jsonTile.global.portrait.w * tileWidth * scale,
                h: this.jsonTile.global.portrait.h * tileHeight * scale,
                skip: this.qualities[(this.jsonTile.global.portrait.minQuality || 'mini')] > this.qualities[quality]
            },
            groupIcon: TileElementData = {
                src: base + 'icons/group/' + quality + '/icon_' + group + '.png',
                w: this.jsonTile.global.groupIcon.w * scale,
                h: this.jsonTile.global.groupIcon.h * scale,
                skip: this.qualities[(this.jsonTile.global.groupIcon.minQuality || 'mini')] > this.qualities[quality],
                x: 0, y: 0
            },
            typeIcon: TileElementData = {
                src: base + 'icons/type/' + quality + '/' + type.toLowerCase() + '_logo.png',
                w: this.jsonTile.global.typeIcon.w * scale,
                h: this.jsonTile.global.typeIcon.h * scale,
                skip: this.qualities[(this.jsonTile.global.typeIcon.minQuality || 'mini')] > this.qualities[quality],
                x: 0, y: 0
            },
            ring: TileElementData = {
                src: base + 'rings/' + quality + '/' + state + '_diff_' + difficulty + '.png',
                skip: this.qualities[(this.jsonTile.global.ring.minQuality || 'mini')] > this.qualities[quality],
                x: 0, y: 0, h: 0, w: 0
            },
            codeText: TileElementData = {
                text: tile.code,
                font: (parseFloat(this.jsonTile.global.codeText.font) * scale) + "px Arial",
                skip: this.qualities[(this.jsonTile.global.codeText.minQuality || 'mini')] > this.qualities[quality],
                x: 0, y: 0, h: 0, w: 0
            },
            nameText: TileElementData = {
                text: tile.name,
                font: (parseFloat(this.jsonTile.global.nameText.font) * scale) + 'px Arial',
                skip: this.qualities[(this.jsonTile.global.nameText.minQuality || 'mini')] > this.qualities[quality],
                x: 0, y: 0, h: 0, w: 0
            },
            layerText: TileElementData = {
                text: tile.layer,
                font: (parseFloat(this.jsonTile.global.layerText.font) * scale) + 'px Arial',
                skip: this.qualities[(this.jsonTile.global.layerText.minQuality || 'mini')] > this.qualities[quality],
                x: 0, y: 0, h: 0, w: 0
            },
            authorText: TileElementData = {
                text: tile.authorRealName || tile.author || '',
                font: (parseFloat(this.jsonTile.global.authorText.font) * scale) + 'px Arial',
                skip: this.qualities[(this.jsonTile.global.authorText.minQuality || 'mini')] > this.qualities[quality],
                x: 0, y: 0, h: 0, w: 0
            },
            picMaintainer: TileElementData = {
                src: tile.maintainerPicture || base + 'buster.png',
                skip: this.qualities[(this.jsonTile.concept.picMaintainer.minQuality || 'mini')] > this.qualities[quality],
                x: 0, y: 0, h: 0, w: 0
            },
            maintainer: TileElementData = {
                text: 'Maintainer',
                font: (parseFloat(this.jsonTile.global.maintainer.font) * scale) + 'px Arial',
                color: "#FFFFFF",
                skip: this.qualities[(this.jsonTile.global.maintainer.minQuality || 'mini')] > this.qualities[quality],
                x: 0, y: 0, h: 0, w: 0
            },
            nameMaintainer: TileElementData = {
                text: tile.maintainerRealName || tile.maintainer || '',
                font: (parseFloat(this.jsonTile.global.nameMaintainer.font) * scale) + 'px Arial',
                color: "#FFFFFF",
                skip: this.qualities[(this.jsonTile.global.nameMaintainer.minQuality || 'mini')] > this.qualities[quality],
                x: 0, y: 0, h: 0, w: 0
            },
            userMaintainer: TileElementData = {
                text: tile.maintainer || 'No Maintainer yet',
                font: (parseFloat(this.jsonTile.global.userMaintainer.font) * scale) + 'px Arial',
                color: "#E2E2E2",
                skip: this.qualities[(this.jsonTile.concept.userMaintainer.minQuality || 'mini')] > this.qualities[quality],
                x: 0, y: 0, h: 0, w: 0
            };

        pic.x = this.jsonTile[state].pic.x * scale;
        pic.y = this.jsonTile[state].pic.y * scale;
        pic.w = this.jsonTile[state].pic.w * scale;
        pic.h = this.jsonTile[state].pic.h * scale;

        groupIcon.x = this.jsonTile[state].groupIcon.x * scale;
        groupIcon.y = this.jsonTile[state].groupIcon.y * scale;

        typeIcon.x = this.jsonTile[state].typeIcon.x * scale;
        typeIcon.y = this.jsonTile[state].typeIcon.y * scale;

        ring.x = this.jsonTile[state].ring.x * scale;
        ring.y = this.jsonTile[state].ring.y * scale;
        ring.w = this.jsonTile[state].ring.w * scale;
        ring.h = this.jsonTile[state].ring.h * scale;

        codeText.x = middle;
        codeText.y = this.jsonTile[state].codeText.y * scale;

        nameText.x = middle;
        nameText.y = this.jsonTile[state].nameText.y * scale;
        nameText.font = (this.jsonTile[state].nameText.font * scale) + 'px Arial';

        layerText.x = middle;
        layerText.y = this.jsonTile[state].layerText.y * scale;

        authorText.x = middle;
        authorText.y = this.jsonTile[state].authorText.y * scale;

        picMaintainer.x = this.jsonTile[state].picMaintainer.x * scale;
        picMaintainer.y = this.jsonTile[state].picMaintainer.y * scale;
        picMaintainer.w = this.jsonTile[state].picMaintainer.w * scale;
        picMaintainer.h = this.jsonTile[state].picMaintainer.h * scale;

        maintainer.x = this.jsonTile[state].maintainer.x * scale;
        maintainer.y = this.jsonTile[state].maintainer.y * scale;

        nameMaintainer.x = this.jsonTile[state].nameMaintainer.x * scale;
        nameMaintainer.y = this.jsonTile[state].nameMaintainer.y * scale;

        userMaintainer.x = this.jsonTile[state].userMaintainer.x * scale;
        userMaintainer.y = this.jsonTile[state].userMaintainer.y * scale;

        if (typeof this.jsonTile[state].layerText.color !== 'undefined')
            layerText.color = this.jsonTile[state].layerText.color;

        if (typeof this.jsonTile[state].nameText.color !== 'undefined')
            nameText.color = this.jsonTile[state].nameText.color;

        if (state === "production") {
            codeText.x = this.jsonTile[state].codeText.x * scale;
            layerText.x = this.jsonTile[state].layerText.x * scale;
            authorText.x = this.jsonTile[state].authorText.x * scale;

            nameText.x = this.jsonTile[state].nameText.x * scale;
            nameText.constraint = this.jsonTile[state].nameText.constraint * scale;
            nameText.lineHeight = this.jsonTile[state].nameText.lineHeight * scale;
            nameText.wrap = true;
        }

        if (state == "concept" || state == "production")
            ring.src = base + 'rings/' + quality + '/linear_diff_' + difficulty + '.png';

        if (difficulty === 0)
            ring = null;

        let data = [
            pic,
            picMaintainer,
            portrait,
            groupIcon,
            typeIcon,
            ring,
            codeText,
            nameText,
            layerText,
            authorText,
            maintainer,
            nameMaintainer,
            userMaintainer
        ];

        if (tile.found !== true) {

            let stamp = {
                src: 'images/alt_not_found.png',
                x: 0,
                y: 0,
                w: tileWidth * scale,
                h: tileHeight * scale
            };

            data.push(stamp);

        }

        this.drawPicture(data, ctx, texture);

        return texture;
    };

    /**
     * Creates a Tile
     * @param   {Number}     i ID of the tile (index in table)
     * @returns {DOMElement} The drawable element that represents the tile
     */

    createElement(id:number, _table?:Object):THREE.LOD {

        let mesh,
            element = new THREE.LOD(),
            texture,
            tileWidth = globals.TILE_DIMENSION.width - globals.TILE_SPACING,
            tileHeight = globals.TILE_DIMENSION.height - globals.TILE_SPACING,
            scale = 2,
            table = _table || null;


        for (let level in this.levels) {

            if (level === 'high') scale = this.MAX_TILE_DETAIL_SCALE;
            else scale = 1;

            texture = this.createTexture(id, level, tileWidth, tileHeight, scale, table);

            mesh = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(tileWidth, tileHeight),
                new THREE.MeshBasicMaterial({
                    side: THREE.DoubleSide,
                    transparent: true,
                    map: texture
                })
            );

            mesh.userData = {
                id: id,
                onClick: this.onClick
            };
            mesh.renderOrder = 1;
            element.addLevel(mesh, this.levels[level]);
            element.userData = {
                flying: false
            };
        }

        return element;
    };

    /**
     * Converts the table in another form
     * @param {Array}  goal     Member of ViewManager.targets
     * @param {Number} duration Milliseconds of animation
     */
    transform(ordered?:boolean, duration?:number){

        let i, l, j,
            DELAY = 500;

        duration = duration || 2000;
        ordered = ordered || false;

        //TWEEN.removeAll();

        let animate = (object, target, delay) => {

            delay = delay || 0;

            let move = new TWEEN.Tween(object.position)
                .to({
                    x: target.position.x,
                    y: target.position.y,
                    z: target.position.z
                }, Math.random() * duration + duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .delay(delay)
                .onComplete(() => { object.userData.flying = false; });

            let rotation = new TWEEN.Tween(object.rotation)
                .to({
                    x: target.rotation.x,
                    y: target.rotation.y,
                    z: target.rotation.z
                }, Math.random() * duration + duration)
                .delay(delay)
                .easing(TWEEN.Easing.Exponential.InOut);

            move.onStart(() => { rotation.start(); });

            return move;
        };

        if (ordered === true) {

            for (i = 0; i < this.elementsByGroup.length; i++) {

                let k = (i + this.elementsByGroup.length - 1) % (this.elementsByGroup.length);
                let delay = i * DELAY;

                for (j = 0; j < this.elementsByGroup[k].length; j++) {

                    let index = this.elementsByGroup[k][j];

                    let target = Helper.getSpecificTile(index);

                    let animation = animate(target.mesh, target.target.show, delay);

                    animation.start();

                }
            }
        }
        else {

            for (let r = 0; r < globals.tilesQtty.length; r++) {

                let tile = Helper.getSpecificTile(globals.tilesQtty[r]);

                animate(tile.mesh, tile.target.show, 0).start();
            }
        }

        if (globals.actualView === 'table') {
            if (!globals.headersUp) {
                globals.headers.showHeaders(duration);
                globals.headersUp = true;
            }
        }

        setTimeout(globals.screenshotsAndroid.show, duration);
    };

    /**
     * Goes back to last target set in last transform
     */
    rollBack() {

        globals.camera.enable();
        globals.camera.loseFocus();

        Helper.show('container', 2000);

        globals.workFlowManager.getActualFlow();

        this.transform();

        //globals.changeView(this.lastTargets);
    };

    /**
     * Inits and draws the table, also creates the Dimensions object
     */
    drawTable() {

        this.preComputeLayout();

        let layerCoordinates = [];

        let signRow = null,
            signColumn = null;

        for (let i = 0; i < globals.tilesQtty.length; i++) {

            let id = globals.tilesQtty[i];
            let mesh = this.createElement(id);
            globals.scene.add(mesh);
            Helper.getSpecificTile(id).mesh = mesh;

            let object = new THREE.Object3D();

            //Row (Y)
            let tile = Helper.getSpecificTile(id).data;
            let group = tile.platform || globals.layers[tile.layer].super_layer;
            let row = tile.layerID;

            if (globals.layers[tile.layer].super_layer) {
                object.position.x = ((this.section[row]) * globals.TILE_DIMENSION.width) - (this.columnWidth * this.platformsQtty * globals.TILE_DIMENSION.width / 2);
                this.section[row]++;
            } else {
                //Column (X)
                let column = tile.platformID;
                object.position.x = (((column * (this.columnWidth) + this.section[row][column]) + column) * globals.TILE_DIMENSION.width) - (this.columnWidth * this.platformsQtty * globals.TILE_DIMENSION.width / 2);
                this.section[row][column]++;
            }

            object.position.y = -((this.layerPosition[row]) * globals.TILE_DIMENSION.height) + (this.layersQtty * globals.TILE_DIMENSION.height / 2);

            if (typeof layerCoordinates[row] === 'undefined')
                layerCoordinates[row] = object.position.y;

            /*start Positioning tiles*/

            object.position.copy(globals.viewManager.translateToSection('table', object.position));

            if (globals.layers[tile.layer].super_layer) {
                if (typeof globals.TABLE[globals.layers[tile.layer].super_layer].x === 'undefined')
                    globals.TABLE[globals.layers[tile.layer].super_layer].x = object.position.x;
            }

            let target = Helper.fillTarget(object.position.x, object.position.y, object.position.z, 'table');

            Helper.getSpecificTile(id).target = target;
            mesh.position.copy(target.hide.position);
            mesh.rotation.set(target.hide.rotation.x, target.hide.rotation.y, target.hide.rotation.z);

            /*End*/
            if (!globals.signLayer.findSignLayer(group, tile.layer)) {
                if (tile.layerID !== signRow || tile.platformID !== signColumn) { // Column or layer change
                    globals.signLayer.createSignLayer(object.position.x, object.position.y, tile.layer, group);
                    signRow = tile.layerID;
                    signColumn = tile.platformID;
                    globals.TABLE[group].layers[tile.layer].y = object.position.y;
                }
            }
        }

        this.dimensions = {
            columnWidth: this.columnWidth,
            superLayerMaxHeight: this.superLayerMaxHeight,
            groupsQtty: this.platformsQtty,
            layersQtty: this.layersQtty,
            superLayerPosition: this.superLayerPosition,
            layerPositions: layerCoordinates
        };
    };

    /**
     * Takes away all the tiles except the one with the id
     * @param {Array}  [ids]           The IDs to let alone
     * @param {Number} [duration=2000] Duration of the animation
     */
    letAlone(ids:Array, duration?:number) {

        let i, _duration = duration || 2000,
            distance = globals.camera.getMaxDistance() * 2,
            out = globals.viewManager.translateToSection('table', new THREE.Vector3(0, 0, distance));

        //TWEEN.removeAll();

        let target;

        let animate = (object, target, dur) => {

            new TWEEN.Tween(object.position)
                .to({
                    x: target.x,
                    y: target.y,
                    z: target.z
                }, dur)
                .easing(TWEEN.Easing.Exponential.InOut)
                .onComplete(() => {
                    object.userData.flying = false;
                })
                .start();

        };

        for (i = 0; i < globals.tilesQtty.length; i++) {

            let tile = Helper.getSpecificTile(globals.tilesQtty[i]);

            if (ids === tile.id) {
                target = tile.target.show.position;
            }
            else {
                target = out;
                tile.mesh.userData.flying = true;
            }

            animate(tile.mesh, target, Math.random() * _duration + _duration);
        }

        globals.screenshotsAndroid.hide();
        globals.signLayer.letAloneSignLayer();
    };

    updateElementsByGroup() {

        this.elementsByGroup = [];

        globals.tilesQtty = [];

        let i = 0;

        for (let j = 0; j <= this.groupsQtty; j++) {

            this.elementsByGroup.push([]);
        }

        for (let platform in globals.TABLE) {

            for (let layer in globals.TABLE[platform].layers) {

                for (i = 0; i < globals.TABLE[platform].layers[layer].objects.length; i++) {

                    let tile = globals.TABLE[platform].layers[layer].objects[i];

                    let c = tile.data.platformID;
                    let id = tile.id;

                    globals.tilesQtty.push(id);

                    this.elementsByGroup[c].push(id);
                }
            }
        }
    };

    //Private methods

    /**
     * Draws a picture in canvas
     * @param {Array}  data    The options of the picture
     * @param {Object} ctx     Canvas context
     * @param {Object} texture The texture object to update
     */
    drawPicture(data : any[], ctx:any, texture:any) {

        let image = new Image();
        let actual = data.shift();

        if (actual && actual.src && actual.src != 'undefined') {

            image.onload = () => {

                if (!actual.skip) {
                    ctx.drawImage(image, actual.x, actual.y, actual.w, actual.h);
                }
                if (texture)
                    texture.needsUpdate = true;

                if (data.length !== 0) {
                    
                    if (!data[0]) data.shift();

                    if (data[0].text)
                        this.drawText(data, ctx, texture);
                    else
                        this.drawPicture(data, ctx, texture);
                }
            };

            image.onerror = () => {
                if (data.length !== 0) {
                    if (data[0].text)
                        this.drawText(data, ctx, texture);
                    else
                        this.drawPicture(data, ctx, texture);
                }
            };

            image.crossOrigin = "anonymous";
            image.src = actual.src;
        } else {
            if (data.length !== 0) {
                if (data[0].text)
                    this.drawText(data, ctx, texture);
                else
                    this.drawPicture(data, ctx, texture);
            }
        }
    }

    /**
     * Draws a texture in canvas
     * @param {Array}  data    Options of the texture
     * @param {Object} ctx     Canvas Context
     * @param {Object} texture Texture to update
     */
    drawText(data: any[], ctx:any, texture:any) {

        let actual = data.shift();

        //TODO: Set Roboto typo

        if (!actual.skip) {
            if (actual.color)
                ctx.fillStyle = actual.color;

            ctx.font = actual.font;

            if (actual.constraint)
                if (actual.wrap)
                    Helper.drawText(actual.text, actual.x, actual.y, ctx, actual.constraint, actual.lineHeight);
                else
                    ctx.fillText(actual.text, actual.x, actual.y, actual.constraint);
            else
                ctx.fillText(actual.text, actual.x, actual.y);
        }

        if (texture)
            texture.needsUpdate = true;

        ctx.fillStyle = "#FFFFFF";

        if (data.length !== 0) {

            if (data[0].text)
                this.drawText(data, ctx, texture);
            else
                this.drawPicture(data, ctx, texture);
        }
    }

    getSPL(_id, _SPLArray) {
        if (_id) {
            for (let i = 0, l = _SPLArray.length; i < l; i++) {
                if (_SPLArray[i]._id + '' == _id + '') {
                    return _SPLArray[i];
                }
            }
        } else {
            return null;
        }
    }

    /**
     * Gets the best developer in the given role
     * @param   {Array}  _devs The array of developers
     * @param   {string} role  The role to look for
     * @returns {object} The best developer by the given criteria
     */
    getBestDev(_devs:Array, role:string): AuthorData {
        let dev: any = {};
        if (_devs) {
            let _dev: any;
            dev.percnt = 0;
            for (let i = 0, l = _devs.length; i < l; i++) {
                _dev = _devs[i];

                if ((role === 'author' && _dev.role === 'author' && _dev.scope === 'implementation') ||
                    (role === 'maintainer' && _dev.role === 'maintainer')) {

                    if (_dev.percnt >= dev.percnt) {

                        dev.percnt = _dev.percnt;
                        dev.usrnm = _dev.dev.usrnm;
                        dev.name = _dev.dev.name;
                        dev.email = _dev.dev.email;
                        dev.avatar_url = _dev.dev.avatar_url;
                    }
                }
            }
        }
        return dev;
    }
}
