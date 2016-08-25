/**
 * @author Ricardo Delgado
 */
class TableEdit {

    tileWidth = globals.TILE_DIMENSION.width - globals.TILE_SPACING;
    tileHeight = globals.TILE_DIMENSION.height - globals.TILE_SPACING;


    /**
     * @author Ricardo Delgado
     */

    addButton(_id) {

        let id = _id || null,
            text = 'Edit Component',
            button = 'buttonFermatEdit',
            side = 'left',
            callback = null;

        if (id === null) {

            if (!globals.session.getIsLoggedIn()) {

                callback = () => {
                    globals.session.getAuthCode();
                };
            }
            else {

                callback = () => {

                    globals.fieldsEdit.actions.type = "insert";

                    globals.buttonsManager.removeAllButtons();

                    globals.session.displayLoginButton(false);

                    this.drawTile(null, this.addAllFilds);
                };

            }

            globals.session.displayLoginButton(true);

            text = 'Add New Component';
            button = 'buttonFermatNew';
            side = 'left';

            globals.buttonsManager.createButtons(button, text, callback, null, null, side);

        }
        else {

            if (!globals.session.getIsLoggedIn()) {

                callback = () => {
                    globals.session.getAuthCode();
                };
            }
            else {

                callback = () => {

                    this.validateLock(id, () => {

                        globals.fieldsEdit.actions.type = "update";
                        globals.buttonsManager.removeAllButtons();
                        this.addAllFilds();
                        this.fillFields(id);
                        this.drawTile(id);
                    });
                };
            }

            globals.session.displayLoginButton(false);

            globals.buttonsManager.createButtons(button, text, callback, null, null, side);

            if (!globals.session.getIsLoggedIn()) {

                callback = () => {
                    globals.session.getAuthCode();
                };
            }
            else {

                callback = () => {

                    this.validateLock(id, () => {

                        if (window.confirm("Are you sure you want to remove this component?"))
                            this.deleteTile(id);
                    });
                };
            }

            text = 'Delete Component';
            button = 'buttonFermatDelete';
            side = 'right';

            globals.buttonsManager.createButtons(button, text, callback, null, null, side);
        }

    };

    addAllFilds() {

        globals.fieldsEdit.createFieldTableEdit();
    }

    // Start editing
    fillFields(id) {

        let tile = Helper.clone(Helper.getSpecificTile(id).data);

        globals.fieldsEdit.actualTile = Helper.clone(tile);

        if (tile.platform !== undefined)
            (document.getElementById('select-Group') as any).value = tile.platform;
        else
            (document.getElementById('select-Group') as any).value = globals.layers[tile.layer].super_layer;

        (globals.fieldsEdit.changeLayer(document.getElementById('select-Group') as any).value);

        if (tile.layer !== undefined)
            (document.getElementById('select-layer') as any).value = tile.layer;

        if (tile.type !== undefined)
            (document.getElementById('select-Type') as any).value = tile.type;

        if (tile.difficulty !== undefined)
            (document.getElementById('select-Difficulty') as any).value = tile.difficulty;

        if (tile.code_level !== undefined)
            (document.getElementById('select-State') as any).value = tile.code_level;

        if (tile.name !== undefined)
            (document.getElementById('imput-Name') as any).value = tile.name;


        if (tile.devs !== undefined)
            (document.getElementById('modal-devs') as any).value = tile.devs.slice(0);

        if (tile.description !== undefined)
            (document.getElementById('modal-desc-textarea') as any).value = tile.description;
    }

    createElement() {

        let newCenter = Helper.getCenterView('table'),
            y = Helper.getLastValueArray(globals.tileManager.dimensions.layerPositions) + (globals.TILE_DIMENSION.height * 2);

        let mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.tileWidth, this.tileHeight),
            new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                transparent: true,
                map: null
            })
        );

        y = this.transformPositionY(y);

        let target = Helper.fillTarget(newCenter.x, y, newCenter.z, 'table');

        mesh.position.copy(target.hide.position);

        mesh.rotation.copy(target.hide.rotation);

        mesh.renderOrder = 1;

        globals.scene.add(mesh);

        globals.fieldsEdit.objects.tile.mesh = mesh;

        globals.fieldsEdit.objects.tile.target = target;
    }

    drawTile(id, callback?) {

        if (globals.fieldsEdit.objects.tile.mesh === null)
            this.createElement();

        let mesh = globals.fieldsEdit.objects.tile.mesh;

        let exit = null;

        if (globals.fieldsEdit.actions.type === "insert") {

            exit = () => {
                globals.camera.resetPosition();
            };

            globals.fieldsEdit.actions.exit = exit;

            this.animate(mesh, globals.fieldsEdit.objects.tile.target.show, 1000, () => {

                globals.camera.setFocus(mesh, new THREE.Vector4(0, 0, this.tileWidth, 1), 2000);

                if (typeof (callback) === '')
                    callback();

                this.changeTexture();

                globals.camera.disable();

                Helper.showBackButton();

            });
        }
        else {

            exit = () => {
                globals.camera.resetPosition();
            };

            globals.fieldsEdit.actions.exit = exit;

            this.changeTexture();

            this.animate(mesh, globals.fieldsEdit.objects.tile.target.show, 1000, () => {

                globals.camera.setFocus(mesh, new THREE.Vector4(0, 0, this.tileWidth, 1), 1500);

                globals.tileManager.transform(false, 1000);
                globals.signLayer.transformSignLayer();

                setTimeout(() => {
                    let data = Helper.getSpecificTile(id);
                    this.animate(data.mesh, data.target.hide, 1000);
                }, 2000);

            });

        }
    }

    changeTexture() {

        let table = null,
            scale = 5,
            mesh = null;

        table = this.fillTable();

        mesh = globals.fieldsEdit.objects.tile.mesh;

        mesh.material.map = globals.tileManager.createTexture(null, 'high', this.tileWidth, this.tileHeight, scale, table);
        mesh.material.needsUpdate = true;

    };

    deleteMesh() {

        let mesh = globals.fieldsEdit.objects.tile.mesh;

        if (mesh != null) {

            this.animate(mesh, globals.fieldsEdit.objects.tile.target.hide, 1500, () => {
                globals.scene.remove(mesh);
            });

            globals.fieldsEdit.objects.tile.mesh = null;
        }
    };
    // end

    //Save Tile
    saveTile() {

        if (this.validateFields() === '') {

            let table = this.fillTable();

            globals.fieldsEdit.disabledButtonSave(true);

            if (globals.fieldsEdit.actions.type === "insert")
                this.createTile(table);
            else if (globals.fieldsEdit.actions.type === "update")
                this.modifyTile(table);
        }
        else {
            window.alert(this.validateFields());
        }
    };

    validateFields() {
        let msj = '';

        let name = document.getElementById('imput-Name') as any;

        if (name.value === "") {
            msj += 'The component must have a name \n';
            name.focus();
        }

        return msj;
    }
    // end

    //tile action
    createTile(_table) {

        let getParamsData = (table) => {

            let param: any = {};

            let newLayer = table.layer,
                newGroup = table.platform || globals.layers[table.layer].super_layer;

            if (typeof globals.platforms[newGroup] !== "undefined") {
                param.platfrm_id = globals.platforms[newGroup]._id;
                param.suprlay_id = null;
            }
            else {
                param.suprlay_id = globals.superLayers[newGroup]._id;
                param.platfrm_id = null;
            }

            param.layer_id = globals.layers[newLayer]._id;

            param.name = table.name;

            param.type = table.type.toLowerCase();

            param.difficulty = parseInt(table.difficulty);

            param.code_level = table.code_level.toLowerCase();

            param.scrnshts = false;

            if (table.repo_dir) {
                param.found = true;
                param.repo_dir = table.repo_dir;
            }
            else {
                param.found = false;
                param.repo_dir = "root";
            }

            if (table.description)
                param.description = table.description;
            else
                param.description = "pending";

            return param;
        }

        let params = getParamsData(_table);

        globals.api.postRoutesEdit('tableEdit', 'insert', params, null,
            (res) => {

                _table.id = res._id;

                postParamsDev(_table, (table) => {

                    globals.camera.loseFocus();
                    globals.camera.enable();

                    let x, y, z;

                    let platform = table.platform || globals.layers[table.layer].super_layer,
                        layer = table.layer,
                        object = {
                            mesh: null,
                            data: {},
                            target: {},
                            id: null
                        };

                    if (typeof globals.TABLE[platform].layers[layer] === 'undefined') {
                        globals.TABLE[platform].layers[layer] = {
                            objects: [],
                            y: y
                        };
                    }

                    let count = globals.TABLE[platform].layers[layer].objects.length;

                    object.id = platform + '_' + layer + '_' + count;

                    let mesh = globals.tileManager.createElement(object.id, table);

                    let lastObject = Helper.getLastValueArray(globals.TABLE[platform].layers[layer].objects);

                    x = 0;

                    if (!lastObject)
                        x = globals.TABLE[platform].x;
                    else
                        x = lastObject.target.show.position.x + globals.TILE_DIMENSION.width;

                    let index = globals.layers[layer].index;

                    y = this.transformPositionY(globals.tileManager.dimensions.layerPositions[index]);

                    z = 0;

                    let target = Helper.fillTarget(x, y, z, 'table');

                    mesh.position.copy(target.hide.position);
                    mesh.rotation.copy(target.hide.rotation);

                    globals.scene.add(mesh);

                    object.mesh = mesh;
                    object.data = table;
                    object.target = target;

                    globals.camera.move(target.show.position.x, target.show.position.y, target.show.position.z + 8000, 3000);

                    this.animate(mesh, target.show, 3500, () => {

                        globals.screenshotsAndroid.hidePositionScreenshots(platform, layer);
                        globals.tileManager.updateElementsByGroup();
                    });

                    setTimeout(() => {

                        if (count < 1) {

                            if (!globals.signLayer.findSignLayer(platform, layer)) {

                                globals.signLayer.createSignLayer(x, y, layer, platform);
                                globals.signLayer.transformSignLayer();
                            }
                        }
                    }, 2000);

                    globals.TABLE[platform].layers[layer].objects.push(object);

                });
            },
            () => {
                window.alert('There is already a component with that name in this group and layer, please use another one');
                globals.fieldsEdit.disabledButtonSave(false);
            });



        let postParamsDev = (table, callback) => {

            let devs = table.devs;

            let newDevs = [];



            let postDevs = (devs) => {

                if (devs.length > 0) {

                    let dataPost = {
                        comp_id: table.id
                    };

                    let param: any = {};

                    param.dev_id = devs[0].dev._id;
                    param.percnt = devs[0].percnt;
                    param.role = devs[0].role;
                    param.scope = devs[0].scope;

                    globals.api.postRoutesEdit('tableEdit', 'insert dev', param, dataPost,
                        (res) => {

                            devs[0]._id = res._id;

                            newDevs.push(devs[0]);

                            devs.splice(0, 1);

                            postDevs(devs);

                        });
                }
                else {

                    table.devs = newDevs;

                    callback(table);
                }
            };

            postDevs(devs);
        }
    }

    modifyTile(_table) {

        let getParamsData = (table) => {

            let param: any = {};

            let newLayer = table.layer,
                newGroup = table.platform || globals.layers[table.layer].super_layer,
                oldLayer = globals.fieldsEdit.actualTile.layer,
                oldGroup = globals.fieldsEdit.actualTile.platform || globals.layers[globals.fieldsEdit.actualTile.layer].super_layer;

            if (typeof globals.platforms[newGroup] !== "undefined") {
                param.platfrm_id = globals.platforms[newGroup]._id;
                param.suprlay_id = null;
            }
            else {
                param.suprlay_id = globals.superLayers[newGroup]._id;
                param.platfrm_id = null;
            }

            if (newLayer !== oldLayer)
                param.layer_id = globals.layers[newLayer]._id;

            if (table.name !== globals.fieldsEdit.actualTile.name)
                param.name = table.name;

            if (table.type !== globals.fieldsEdit.actualTile.type)
                param.type = table.type.toLowerCase();

            if (table.difficulty !== globals.fieldsEdit.actualTile.difficulty)
                param.difficulty = parseInt(table.difficulty);

            if (table.code_level !== globals.fieldsEdit.actualTile.code_level)
                param.code_level = table.code_level.toLowerCase();

            if (table.description !== globals.fieldsEdit.actualTile.description)
                param.description = table.description;

            if (table.repo_dir.toLowerCase() !== globals.fieldsEdit.actualTile.repo_dir.toLowerCase())
                param.repo_dir = table.repo_dir;

            param.found = true;

            return param;
        }

        let params = getParamsData(_table);

        let dataPost = {
            comp_id: globals.fieldsEdit.actualTile.id
        };

        globals.api.postRoutesEdit('tableEdit', 'update', params, dataPost,
            (res) => {

                _table.id = globals.fieldsEdit.actualTile.id;

                postParamsDev(_table, (table) => {

                    let oldTile = Helper.clone(globals.fieldsEdit.actualTile),
                        newLayer = table.layer,
                        newGroup = table.platform || globals.layers[table.layer].super_layer,
                        oldLayer = oldTile.layer,
                        oldGroup = oldTile.platform || globals.layers[oldTile.layer].super_layer;


                    globals.camera.loseFocus();
                    globals.camera.enable();

                    let arrayObject = globals.TABLE[oldGroup].layers[oldLayer].objects.slice(0);

                    for (let i = 0; i < arrayObject.length; i++) {

                        if (arrayObject[i].data.author === oldTile.author && arrayObject[i].data.name === oldTile.name) {

                            globals.scene.remove(arrayObject[i].mesh);

                        }
                    }

                    let positionCameraX = globals.TABLE[oldGroup].x,
                        positionCameraY = this.transformPositionY(Helper.getPositionYLayer(oldLayer));

                    globals.camera.move(positionCameraX, positionCameraY, 8000, 2000);

                    setTimeout(() => {

                        if (newGroup !== oldGroup || newLayer !== oldLayer)
                            change();
                        else
                            notChange();

                    }, 2000);

                    let change = () => {

                        globals.TABLE[oldGroup].layers[oldLayer].objects = [];
                        let idScreenshot = oldGroup + "_" + oldLayer + "_" + oldTile.name;

                        globals.screenshotsAndroid.deleteScreenshots(idScreenshot);

                        for (let i = 0; i < arrayObject.length; i++) {

                            if (arrayObject[i].data.author === oldTile.author && arrayObject[i].data.name === oldTile.name) {

                                arrayObject.splice(i, 1);
                            }
                        }

                        globals.TABLE[oldGroup].layers[oldLayer].objects = this.modifyRowTable(arrayObject, oldGroup, oldLayer);

                        setTimeout(() => {

                            positionCameraX = globals.TABLE[newGroup].x;
                            positionCameraY = this.transformPositionY(Helper.getPositionYLayer(newLayer));

                            globals.camera.move(positionCameraX, positionCameraY, 8000, 2000);

                            this.createNewElementTile(table);
                            globals.screenshotsAndroid.hidePositionScreenshots(newGroup, newLayer);
                            globals.tileManager.updateElementsByGroup();

                        }, 2000);

                    }

                    let notChange = () => {

                        let arrayObject = globals.TABLE[oldGroup].layers[oldLayer].objects;
                        let target = null;
                        let _ID = null;
                        let id = 0;

                        let idScreenshot = oldGroup + "_" + oldLayer + "_" + oldTile.name;

                        if (oldTile.name !== table.name)
                            globals.screenshotsAndroid.deleteScreenshots(idScreenshot);

                        for (let i = 0; i < arrayObject.length; i++) {

                            if (arrayObject[i].data.author === oldTile.author && arrayObject[i].data.name === oldTile.name) {

                                id = i;
                                globals.TABLE[oldGroup].layers[oldLayer].objects[i].data = table;
                                target = globals.TABLE[oldGroup].layers[oldLayer].objects[i].target;
                                _ID = globals.TABLE[oldGroup].layers[oldLayer].objects[i].id;
                            }
                        }

                        let mesh = globals.tileManager.createElement(_ID, table);

                        globals.TABLE[oldGroup].layers[oldLayer].objects[id].mesh = mesh;

                        globals.scene.add(mesh);

                        this.animate(mesh, target.show, 2000, () => {
                            globals.screenshotsAndroid.hidePositionScreenshots(oldGroup, oldLayer);
                        });

                    }

                });

            },
            () => {
                window.alert('There is already a component with that name in this group and layer, please use another one');

                globals.fieldsEdit.disabledButtonSave(false);
            });



        let postParamsDev = (table, callback) => {

            let fillDevs = (newDevs, oldDevs, task) => {

                let find_Dev = (_index) => {
                    for (let f = 0; f < oldDevs.length; f++) {
                        if (_index._id === oldDevs[f]._id)
                            return _index;
                    }
                    return null;
                }

                if (newDevs.length > 0) {

                    if (task === 'insert') {

                        let array = [];

                        for (let i = 0; i < newDevs.length; i++) {

                            if (!newDevs[i]._id)
                                config.insert.devs.push(newDevs[i]);
                            else
                                array.push(newDevs[i]);
                        }

                        fillDevs(array, oldDevs, 'update');
                    }
                    else if (task === 'update') {

                        if (oldDevs.length > 0) {


                            for (let f = 0; f < oldDevs.length; f++) {

                                let t = newDevs.find(find_Dev);

                                if (t) {

                                    if (t.role != oldDevs[f].role ||
                                        t.scope != oldDevs[f].scope ||
                                        t.percnt.toString() != oldDevs[f].percnt.toString()) {

                                        config.update.devs.push(t);
                                    }
                                    else {
                                        newTableDevs.push(oldDevs[f]);
                                    }
                                }
                                else {

                                    config.delete.devs.push(oldDevs[f]);
                                }
                            }
                        }
                    }
                }
                else {

                    for (let l = 0; l < oldDevs.length; l++) {
                        config.delete.devs.push(oldDevs[l]);
                    }
                }
            }

            let postDevs = (task, array, callback) => {

                if (array.length > 0) {

                    let dataPost: any = {
                        comp_id: table.id
                    };

                    let param: any = {};

                    if (task === 'update' || task === 'delete')
                        dataPost.devs_id = array[0]._id;

                    param.dev_id = array[0].dev._id;
                    param.percnt = array[0].percnt;
                    param.role = array[0].role;

                    if (param.role !== 'maintainer')
                        param.scope = array[0].scope;
                    else
                        param.scope = 'default';

                    globals.api.postRoutesEdit('tableEdit', config[task].route, param, dataPost,
                        (res) => {

                            if (task !== 'delete') {

                                array[0]._id = res._id;

                                newTableDevs.push(array[0]);
                            }

                            array.splice(0, 1);

                            postDevs(task, array, callback);

                        },
                        () => {
                            globals.fieldsEdit.disabledButtonSave(false);
                        });

                }
                else {

                    callback();
                }
            }

            let newDevs = table.devs.slice(0),
                oldDevs = globals.fieldsEdit.actualTile.devs.slice(0),
                newTableDevs = [],
                config = {
                    insert: {
                        devs: [],
                        route: 'insert dev'
                    },
                    update: {
                        devs: [],
                        route: 'update dev'
                    },
                    delete: {
                        devs: [],
                        route: 'delete dev'
                    }
                };

            fillDevs(newDevs, oldDevs, 'insert');

            postDevs('delete', config.delete.devs.slice(0), () => {

                postDevs('update', config.update.devs.slice(0), () => {

                    postDevs('insert', config.insert.devs.slice(0), () => {

                        table.devs = newTableDevs;

                        callback(table);
                    });
                });
            });



        }
    }

    deleteTile(id) {

        let table = Helper.getSpecificTile(id).data;

        let dataPost = {
            comp_id: table.id
        };

        globals.api.postRoutesEdit('tableEdit', 'delete', false, dataPost,
            (res) => {

                let oldLayer = table.layer,
                    oldGroup = table.platform || globals.layers[table.layer].super_layer,
                    arrayObject = globals.TABLE[oldGroup].layers[oldLayer].objects.slice(),
                    idScreenshot = oldGroup + "_" + oldLayer + "_" + table.name;

                globals.screenshotsAndroid.deleteScreenshots(idScreenshot);

                let positionCameraX = globals.TABLE[oldGroup].x,
                    positionCameraY = this.transformPositionY(Helper.getPositionYLayer(oldLayer));

                globals.camera.loseFocus();
                globals.camera.enable();

                globals.tileManager.transform(false, 1000);
                globals.headers.transformTable(1000);
                globals.signLayer.transformSignLayer();

                globals.camera.move(positionCameraX, positionCameraY, 8000, 2000);

                setTimeout(() => {

                    globals.TABLE[oldGroup].layers[oldLayer].objects = [];

                    id = id.split("_");

                    id = parseInt(id[2]);

                    let mesh = arrayObject[id].mesh;

                    let target = Helper.fillTarget(0, 0, 160000, 'table');

                    this.animate(mesh, target.hide, 1500, () => {
                        globals.scene.remove(mesh);
                    });

                    arrayObject.splice(id, 1);

                    globals.TABLE[oldGroup].layers[oldLayer].objects = this.modifyRowTable(arrayObject, oldGroup, oldLayer);

                    globals.tileManager.updateElementsByGroup();

                }, 3500);

            });
    }
    //

    //Tools
    createNewElementTile(table) {

        let x, y, z;

        let platform = table.platform || globals.layers[table.layer].super_layer,
            layer = table.layer,
            object = {
                mesh: null,
                data: {},
                target: {},
                id: null
            };

        if (typeof globals.TABLE[platform].layers[layer] === 'undefined') {
            globals.TABLE[platform].layers[layer] = {
                objects: [],
                y: this.transformPositionY(Helper.getPositionYLayer(layer))
            };
        }

        let lastObject = Helper.getLastValueArray(globals.TABLE[platform].layers[layer].objects);

        let count = globals.TABLE[platform].layers[layer].objects.length;

        object.id = platform + '_' + layer + '_' + count;

        let mesh = globals.tileManager.createElement(object.id, table);

        x = 0;

        if (!lastObject)
            x = globals.TABLE[platform].x;
        else
            x = lastObject.target.show.position.x + globals.TILE_DIMENSION.width;

        y = this.transformPositionY(Helper.getPositionYLayer(layer));

        z = 0;

        let target = Helper.fillTarget(x, y, z, 'table');

        mesh.position.copy(target.hide.position);
        mesh.rotation.set(target.hide.rotation.x, target.hide.rotation.y, target.hide.rotation.z);

        globals.scene.add(mesh);

        object.mesh = mesh;
        object.data = table;
        object.target = target;

        this.animate(mesh, target.show, 2500, () => {

            if (count < 1) {

                if (!globals.signLayer.findSignLayer(platform, layer)) {

                    globals.signLayer.createSignLayer(x, y, layer, platform);
                    globals.signLayer.transformSignLayer();
                }
            }
        });

        globals.TABLE[platform].layers[layer].objects.push(object);
    }

    validateLock(_id, callback) {

        let id = Helper.getSpecificTile(_id).data.id;

        let dataPost = {
            comp_id: id
        };

        globals.api.postValidateLock('tableEdit', dataPost,
            (res) => {

                if (typeof (callback) === '')
                    callback();
            },
            (res) => {

                window.alert("This component is currently being modified by someone else, please try again in about 3 minutes");
            }
        );
    }

    fillTable() {

        let table: any = { platform: undefined },
            data = {},
            group = (document.getElementById(globals.fieldsEdit.objects.idFields.group) as any).value,
            layer = (document.getElementById(globals.fieldsEdit.objects.idFields.layer) as any).value,
            platformID = Helper.getCountObject(globals.platforms) - 1,
            layerID = 0,
            superLayer = false,
            _author;

        if (globals.platforms[group]) {
            table.platform = group;
            platformID = globals.platforms[group].index;
        }
        else {
            superLayer = group;
        }

        if (globals.layers[layer])
            layerID = globals.layers[layer].index;

        table.layer = layer;
        table.type = (document.getElementById(globals.fieldsEdit.objects.idFields.type) as any).value;
        table.code_level = (document.getElementById(globals.fieldsEdit.objects.idFields.state) as any).value;
        table.difficulty = (document.getElementById(globals.fieldsEdit.objects.idFields.difficulty) as any).value;
        table.name = (document.getElementById(globals.fieldsEdit.objects.idFields.name) as any).value;
        table.code = Helper.getCode((document.getElementById(globals.fieldsEdit.objects.idFields.name) as any).value);
        table.description = (document.getElementById("modal-desc-textarea") as any).value;
        table.found = true;
        table.platformID = platformID;
        table.layerID = layerID;
        table.superLayer = superLayer;

        let dir = group + "/" + table.type.toLowerCase() + "/" + layer.toLowerCase() + "/";

        while (dir.match(' ') !== null)
            dir = dir.replace(' ', '_');

        dir = dir + "fermat-" + group.toLowerCase() + "-" + table.type.toLowerCase() + "-" + layer.toLowerCase() + "-" + table.name.toLowerCase() + "-bitdubai";

        while (dir.match(' ') !== null)
            dir = dir.replace(' ', '-');

        table.repo_dir = dir;

        let devs = (document.getElementById("modal-devs") as any).value;

        table.devs = devs.slice(0);

        _author = this.getBestDev(table.devs, "author");

        table.picture = _author.avatar_url ? _author.avatar_url : undefined;
        table.author = _author.usrnm ? _author.usrnm : undefined;
        table.authorRealName = _author.name ? _author.name : undefined;
        table.authorEmail = _author.email ? _author.email : undefined;

        let _maintainer: any = this.getBestDev(table.devs, "maintainer");

        table.maintainer = _maintainer.usrnm ? _maintainer.usrnm : undefined;
        table.maintainerPicture = _maintainer.avatar_url ? _maintainer.avatar_url : undefined;
        table.maintainerRealName = _maintainer.name ? _maintainer.name : undefined;

        return table;
    }

    modifyRowTable(arrayObject, oldGroup, oldLayer) {

        let newArrayObject = [];

        if (arrayObject.length < 1) {

            if (globals.signLayer.findSignLayer(oldGroup, oldLayer)) {
                setTimeout(() => {
                    globals.signLayer.deleteSignLayer(oldGroup, oldLayer);
                }, 2000);
            }
        }

        for (let t = 0; t < arrayObject.length; t++) {

            let data = arrayObject[t].data,
                mesh = arrayObject[t].mesh,
                target = null,
                object = {
                    mesh: null,
                    data: {},
                    target: {},
                    id: null
                };

            let x = 0, y = 0, z = 0;

            let lastObject = Helper.getLastValueArray(newArrayObject);

            let count = newArrayObject.length;

            object.id = oldGroup + '_' + oldLayer + '_' + count;

            for (let i = 0; i < mesh.levels.length; i++)
                mesh.levels[i].object.userData.id = object.id;

            x = 0;

            if (!lastObject)
                x = globals.TABLE[oldGroup].x;
            else
                x = lastObject.target.show.position.x + globals.TILE_DIMENSION.width;

            y = this.transformPositionY(Helper.getPositionYLayer(oldLayer));


            z = 0;

            let idScreenshots = oldGroup + "_" + oldLayer + "_" + data.name;

            globals.screenshotsAndroid.changePositionScreenshots(idScreenshots, x, y);

            target = Helper.fillTarget(x, y, z, 'table');

            object.mesh = mesh;
            object.data = data;
            object.target = target;

            this.animate(object.mesh, target.show, 1500);

            newArrayObject.push(object);
        }

        return newArrayObject;
    }

    getBestDev(_devs, role) {

        let dev: any = {};
        if (_devs) {
            let _dev: any = {};
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

    transformPositionY(y) {

        let newPosition = new THREE.Vector3(0, y, 0);

        return globals.viewManager.translateToSection('table', newPosition).y;
    }

    animate(mesh, target, duration = 2000, callback?) {

        let _duration = duration || 2000,
            x = target.position.x,
            y = target.position.y,
            z = target.position.z,
            rx = target.rotation.x,
            ry = target.rotation.y,
            rz = target.rotation.z;

        _duration = Math.random() * _duration + _duration;

        new TWEEN.Tween(mesh.position)
            .to({ x: x, y: y, z: z }, _duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        new TWEEN.Tween(mesh.rotation)
            .to({ x: rx, y: ry, z: rz }, _duration + 500)
            .easing(TWEEN.Easing.Exponential.InOut)
            .onComplete(() => {
                if (typeof (callback) === '')
                    callback();
            })
            .start();
    }

}