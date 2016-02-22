/**
 * @author Ricardo Delgado
 */
function FermatEdit() {

    var DATA_USER = {};

    var DATA_TEST_USER = '';

    var objects = {
            row1 : {
                div : null,
                buttons : [],
                y : 10
            },
            row2 : {            
                div : null,
                buttons : [],
                y : 30
            },
            tile : { 
                mesh : null,
                target : {}
            },
            idFields : {}
        };

    var actions = { 
        exit : null,
        type : null
    };

    var actualTile = null;

    var tileWidth = window.TILE_DIMENSION.width - window.TILE_SPACING,
        tileHeight = window.TILE_DIMENSION.height - window.TILE_SPACING;

    var self = this;

    this.init = function(){

        if(window.session.getIsLogin())
            DATA_TEST_USER = window.session.getUserLogin()._id;

        var url = window.helper.getAPIUrl("user");

        $.ajax({
            url: url,
            method: "GET"
        }).success(
            function(user) {

                DATA_USER = user;

            });
    };

    /**
     * @author Ricardo Delgado
     */

    this.addButton = function(_id){

        var id = _id || null,
            text = 'Edit Component',
            button = 'buttonFermatEdit',
            side = null,
            callback = null;

        if(id === null){

            callback = function(){ 

                actions.type = "insert";

                window.buttonsManager.removeAllButtons();

                window.session.displayLoginButton(false);

                drawTile(null, addAllFilds);
            };

            window.session.displayLoginButton(true);

            text = 'Add New Component';
            button = 'buttonFermatNew';
            side = 'left';

            window.buttonsManager.createButtons(button, text, callback, null, null, side);

        }
        else{

            if(!window.session.getIsLogin()){
            
                callback = function(){ 
                    window.session.getAuthCode();
                };
            }
            else{

                callback = function(){

                    actions.type = "update";
                    window.buttonsManager.removeAllButtons(); 
                    addAllFilds();
                    fillFields(id);
                    drawTile(id);
                };
            }

            window.session.displayLoginButton(false);

            window.buttonsManager.createButtons(button, text, callback, null, null, side);

            if(!window.session.getIsLogin()){
            
                callback = function(){ 
                    window.session.getAuthCode();
                };
            }
            else{ 

                callback = function(){

                    if(window.confirm("Really remove this component?"))           
                        deleteTile(id);                
                };
            }

            text = 'Delete Component';
            button = 'buttonFermatDelete';
            side = 'right';

            window.buttonsManager.createButtons(button, text, callback, null, null, side);
        }   
    
    };

    this.removeAllFields = function(){

        if(objects.row1.buttons.length !== 0 || objects.row2.buttons.length !== 0){

            var row = 'row1';

            if(objects[row].buttons.length === 0)
                row = 'row2';

            var actualButton = objects[row].buttons.shift();

            if( $('#'+actualButton.id) != null ) 
                window.helper.hide($('#'+actualButton.id), 1000); 
            
                self.removeAllFields();
        }
        else {

            if( $('#'+objects.row1.div) != null ) 
                window.helper.hide($('#'+objects.row1.div), 1000);

            if( $('#'+objects.row2.div) != null ) 
                window.helper.hide($('#'+objects.row2.div), 1000);

            objects.row1.div = null;
            objects.row2.div = null;
            objects.idFields = {};
            actualTile = null;
            deleteMesh();

            if(window.actualView === 'table'){ 

                if(window.camera.getFocus() === null)
                    self.addButton();              

                if(typeof(actions.exit) === 'function'){
                    actions.exit();
                    actions.exit = null;
                }
            }

        }
    };

    // Start editing
    function fillFields(id){

        var tile = window.helper.getSpecificTile(id).data; 

        self.actualTile = tile;

        if(tile.platform !== undefined)
            document.getElementById('select-Platform').value = tile.platform;
        else
            document.getElementById('select-Platform').value = window.layers[tile.layer].super_layer;

        changeLayer(document.getElementById('select-Platform').value);

        if(tile.layer !== undefined)        
            document.getElementById('select-layer').value = tile.layer;

        if(tile.type !== undefined)
            document.getElementById('select-Type').value = tile.type;
        
        if(tile.difficulty !== undefined)
            document.getElementById('select-Difficulty').value = tile.difficulty; 

        if(tile.code_level !== undefined)
            document.getElementById('select-State').value = tile.code_level; 

        if(tile.name !== undefined)
            document.getElementById('imput-Name').value = tile.name;         
        
        if(tile.author !== undefined)
            document.getElementById('imput-author').value = tile.author; 

        if(tile.maintainer !== undefined)
            document.getElementById('imput-Maintainer').value = tile.maintainer; 
    }

    function createElement() {

        var newCenter = helper.getCenterView('table');

        var y = helper.getLastValueArray(window.tileManager.dimensions.layerPositions) + (window.TILE_DIMENSION.height * 2);

        var mesh = new THREE.Mesh(
                   new THREE.PlaneBufferGeometry(tileWidth, tileHeight),
                   new THREE.MeshBasicMaterial({
                            side: THREE.DoubleSide,
                            transparent : true,
                            map : null
                        })
                );

        var target = window.helper.fillTarget(newCenter.x, y, newCenter.z, 'table');

        mesh.position.copy(target.hide.position);

        mesh.rotation.copy(target.hide.rotation);

        mesh.renderOrder = 1;

        window.scene.add(mesh);

        objects.tile.mesh = mesh;

        objects.tile.target = target;
    }

    function drawTile(id, callback){

        if(objects.tile.mesh === null)
            createElement();

        var mesh = objects.tile.mesh;
        
        var exit = null;

        if(actions.type === "insert") {

            exit = function(){
                window.camera.resetPosition();
            };

            actions.exit = exit;

            animate(mesh, objects.tile.target.show, 1000, function(){ 

                window.camera.setFocus(mesh, new THREE.Vector4(0, 0, tileWidth, 1), 2000);

                if(typeof(callback) === 'function')
                    callback(); 
                
                changeTexture();

                window.camera.disable(); 

                window.helper.showBackButton();

            });
        }
        else{

            exit = function(){
                window.camera.resetPosition();
            };

            actions.exit = exit;

            changeTexture();

            animate(mesh, objects.tile.target.show, 1000, function(){ 

                window.camera.setFocus(mesh, new THREE.Vector4(0, 0, tileWidth, 1), 1500);

                window.tileManager.transform(false, 1000);
                window.signLayer.transformSignLayer();

                setTimeout( function() {
                    var data = helper.getSpecificTile(id);
                    animate(data.mesh, data.target.hide, 1000);
                }, 2000 );

            });

        }
    } 

    function addAllFilds() {

        var button,
            text,
            x,
            type;

        sesionPlatform();
        sesionType();
        sesionName();
        sesionAuthor();
        sesionDifficulty();
        sesionMaintainer();
        sesionState();
        createbutton();
        setTextSize();
        
        function setSelectImages(select) {
            
            select.style.backgroundSize = select.offsetHeight + "px";
            select.style.width = select.offsetWidth + select.offsetHeight + "px";
            
        }
        
        function setTextSize() {
            
            var object = {
                id : "fermatEditStyle",
                text : "style"
              };

            objects.row2.buttons.push(object);

            var windowWidth  = window.innerWidth;
            var size         = windowWidth * 0.009;
            var style        = document.createElement("style");
            var styleSheet   = ".edit-Fermat {font-size:"+size+"px;}";
            var node         = document.createTextNode(styleSheet);
            
            style.appendChild(node);
            document.body.appendChild(style);
            
        }

        function createDiv(row){

            var div = document.createElement('div');

            div.id = 'div-Edit' + row;

            document.body.appendChild(div);

            objects['row' + row].div = 'div-Edit' + row;

            window.helper.show(div, 1000);

        }

        function createField(id, text, _x, _type, _row){

            var object = {
                id : id,
                text : text
              };

            var x = _x || 5,
                type = _type || 'button',
                idSucesor = "backButton",
                row = _row || '1';

            if( objects['row' + row].div === null)
                createDiv(row);

            if(objects['row' + row].buttons.length !== 0)
                idSucesor = objects['row' + row].buttons[objects['row' + row].buttons.length - 1].id;

            var div = document.getElementById(objects['row' + row].div);

            var button = document.createElement(type),
                sucesorButton = document.getElementById(idSucesor);
                      
            button.id = id;
            button.className = 'edit-Fermat';
            button.innerHTML = text;
            button.style.zIndex = 10;
            button.style.opacity = 0;

            div.appendChild(button);

            objects['row' + row].buttons.push(object);

            window.helper.show(button, 1000);

            return button;
        }

        function sesionPlatform(){

            var id = 'label-Platform'; text = 'Select the Platform : '; type = 'label';

            createField(id, text, null, type);

            id = 'select-Platform'; text = ''; type = 'select';

            createField(id, text, null, type);

            var optgroup = "<optgroup label = Platform>",
                option = "";

            objects.idFields.platform = id;

            for(var i in window.platforms){ 

                if(i != "size"){

                    option += "<option value = "+i+" >"+i+"</option>";
                }

            }

            optgroup += option + "</optgroup>";

            option = "";

            optgroup += "<optgroup label = superLayer>";

            for(var _i in window.superLayers){

                if(_i != "size"){

                    option += "<option value = "+_i+" >"+_i+"</option>";
                }

            }

            optgroup += option + "</optgroup>";

            $("#"+id).html(optgroup);

            sesionLayer();

            changeLayer(document.getElementById(id).value);

           $("#"+id).change('click', function() {
            
                changeLayer(document.getElementById(id).value);
                changeTexture();
            });
            
            setSelectImages(document.getElementById(id));
        }

        function sesionLayer(){

            var id = 'label-layer'; text = 'Select the Layer : '; type = 'label';

            createField(id, text, 15, type);

            id = 'select-layer'; text = ''; type = 'select';

            createField(id, text, null, type);

            objects.idFields.layer = id;

            $("#"+id).change('click', function() {
            
                changeTexture();
            });
            
            setSelectImages(document.getElementById(id));
        }

        function sesionType(){

            var id = 'label-Type'; text = 'Select the Type : '; type = 'label';

            createField(id, text, 15, type);

            id = 'select-Type'; text = ''; type = 'select';

            createField(id, text, null, type);

            objects.idFields.type = id;        

            var option = "";

            option += "<option value = Addon>Addon</option>";
            option += "<option value = Android>Android</option>";
            option += "<option value = Library>Library</option>";
            option += "<option value = Plugin>Plugin</option>";

            $("#"+id).html(option);

            $("#"+id).change('click', function() {
            
                changeTexture();
            });
            
            setSelectImages(document.getElementById(id));

        }

        function sesionName(){

            var id = 'label-Name'; text = 'Enter Name : '; type = 'label';

            createField(id, text, null, type, 2);

            var idSucesor = objects.row2.buttons[objects.row2.buttons.length - 1].id;

            var object = {
                id : "imput-Name",
                text : "textfield"
              };

            objects.idFields.name = object.id;

            var imput = $('<input />', {"id" : object.id, "type" : "text", "text" : object.text });

            $("#"+objects.row2.div).append(imput);

            var button = document.getElementById(object.id);

            var sucesorButton = document.getElementById(idSucesor);
                  
            button.className = 'edit-Fermat';
            button.placeholder = 'Component Name';
            button.style.zIndex = 10;
            button.style.opacity = 0;

            window.helper.show(button, 1000);

            objects.row2.buttons.push(object);

            button.addEventListener('blur', function() {

                changeTexture();
            });

        }

        function sesionAuthor(){

            var id = 'label-author'; text = 'Enter Author : '; type = 'label';

            createField(id, text, 15, type, 2);

            var idSucesor = objects.row2.buttons[objects.row2.buttons.length - 1].id;

            var object = {
                id : "imput-author",
                text : "textfield"
              };

            objects.idFields.author = object.id;

            var imput = $('<input />', {"id" : object.id, "type" : "text", "text" : object.text });

            $("#"+objects.row2.div).append(imput);

            var button = document.getElementById(object.id);

            var sucesorButton = document.getElementById(idSucesor);

            button.className = 'edit-Fermat';
            button.placeholder = 'Github User';     
            button.style.zIndex = 10;
            button.style.opacity = 0;

            button.addEventListener('blur', function() {

                changeTexture();
            });

            window.helper.show(button, 1000);

            objects.row2.buttons.push(object);

        }

        function sesionDifficulty(){

            var id = 'label-Difficulty'; text = 'Select Difficulty : '; type = 'label';

            createField(id, text, 15, type);

            id = 'select-Difficulty'; text = ''; type = 'select';

            createField(id, text, null, type);

            objects.idFields.difficulty = id;

            var option = "";

            option += "<option value = 0>0</option>";
            option += "<option value = 1>1</option>";
            option += "<option value = 2>2</option>";
            option += "<option value = 3>3</option>";
            option += "<option value = 4>4</option>";
            option += "<option value = 5>5</option>";
            option += "<option value = 6>6</option>";
            option += "<option value = 7>7</option>";
            option += "<option value = 8>8</option>";
            option += "<option value = 9>9</option>";
            option += "<option value = 10>10</option>";

            $("#"+id).html(option);

            $("#"+id).change('click', function() {
            
                changeTexture();
            });
            
            setSelectImages(document.getElementById(id));

        }

        function sesionMaintainer(){

            var id = 'label-Maintainer'; text = 'Enter Maintainer : '; type = 'label';

            createField(id, text, 15, type, 2);

            var idSucesor = objects.row2.buttons[objects.row2.buttons.length - 1].id;

            var object = {
                id : "imput-Maintainer",
                text : "textfield"
              };

            objects.idFields.maintainer = object.id;

            var imput = $('<input />', {"id" : object.id, "type" : "text", "text" : object.text });

            $("#"+objects.row2.div).append(imput);

            var button = document.getElementById(object.id);

            var sucesorButton = document.getElementById(idSucesor);
                  
            button.className = 'edit-Fermat';
            button.placeholder = 'Github User';    
            button.style.zIndex = 10;
            button.style.opacity = 0;

            window.helper.show(button, 1000);

            objects.row2.buttons.push(object);

            button.addEventListener('blur', function() {

                changeTexture();
            });        

        }

        function sesionState(){

            var id = 'label-State'; text = 'Select the State : '; type = 'label';

            createField(id, text, 15, type);

            id = 'select-State'; text = ''; type = 'select';

            createField(id, text, 8, type);

            objects.idFields.state = id;

            var option = "";

            option += "<option value = concept>Concept</option>";
            option += "<option value = development>Development</option>";
            option += "<option value = production>Production</option>";
            option += "<option value = qa>QA</option>";

            $("#"+id).html(option);

            $("#"+id).change('click', function() {
            
                changeTexture();
            });
            
            setSelectImages(document.getElementById(id));

        }

        function createbutton(){
            
            var id = 'button-save', text = 'Save', type = 'button';
            
            window.buttonsManager.createButtons(id, text, function(){
                actions.exit = null;
                saveTile();            

            }, null, null, "right");

        }
    }

    function changeLayer(platform){

        var state = false;

        if(typeof window.platforms[platform] === 'undefined')
            state = platform;

        var _layers = window.CLI.query(window.layers,function(el){return (el.super_layer === state);});

        var option = "";

        for(var i = 0;i < _layers.length; i++){

            option += "<option value = '"+_layers[i]+"' >"+_layers[i]+"</option>";

        }

        $("#select-layer").html(option);  
        
    }

    function changeTexture(){

        var table = null,
            scale = 5, //5
            mesh = null;

        table = fillTable(true);

        mesh = objects.tile.mesh;

        mesh.material.map = window.tileManager.createTexture(null, 'high', tileWidth, tileHeight, scale, table); 
        mesh.material.needsUpdate = true; 

    }

    function deleteMesh(){

        var mesh = objects.tile.mesh;

        if(mesh != null){

            animate(mesh, objects.tile.target.hide, 1500, function(){ 
                    window.scene.remove(mesh);
                });

            objects.tile.mesh = null;
        }
    }
    // end

    //Save Tile
    function saveTile(){

        if(validateFields() === ''){ 

            var table = fillTable(false);

            if(actions.type === "insert")
                createTile(table);
            else if(actions.type === "update")
                modifyTile(table);
        }
        else{
             window.alert(validateFields());
        }
    }

    function validateFields(){
        var msj = '';

        var name = document.getElementById('imput-Name');

        if(name.value === ""){
            msj += 'The component must have a name \n';
            name.focus();
        }

        return msj;
    }
    // end

    //tile action
    function createTile(table){

        var params = getParamsData(table);

        var dataPost = {
                usr_id : DATA_TEST_USER
            };

        window.helper.postRoutesComponents('insert', params, dataPost,
            function(res){ 

                table.id = res._id;

                postParamsDev(table);

                window.camera.loseFocus();
                window.camera.enable();
                    
                var x, y, z;

                var platform = table.platform || window.layers[table.layer].super_layer,
                    layer = table.layer,
                    object = { 
                        mesh : null,
                        data : {},
                        target : {},
                        id : null
                    };

                if(typeof window.TABLE[platform].layers[layer] === 'undefined'){ 
                    window.TABLE[platform].layers[layer] = {   
                        objects : [],
                        y : y 
                    };
                }

                var count = window.TABLE[platform].layers[layer].objects.length;

                object.id = platform + '_' + layer + '_' + count;

                var mesh = window.tileManager.createElement(object.id, table);

                var lastObject = helper.getLastValueArray(window.TABLE[platform].layers[layer].objects);

                x = 0;

                if(!lastObject)
                    x = window.TABLE[platform].x;
                else
                    x = lastObject.target.show.position.x + window.TILE_DIMENSION.width;

                var index = window.layers[layer].index;

                y = window.tileManager.dimensions.layerPositions[index];

                z = 0;

                var target = helper.fillTarget(x, y, z, 'table');

                mesh.position.copy(target.hide.position);
                mesh.rotation.copy(target.hide.rotation);

                window.scene.add(mesh);

                object.mesh = mesh;
                object.data = table;
                object.target = target;

                window.camera.move(target.show.position.x, target.show.position.y, target.show.position.z + 8000, 4000);

                animate(mesh, target.show, 4500, function(){

                   window.screenshotsAndroid.hidePositionScreenshots(platform, layer); 
                   window.tileManager.updateElementsByGroup();
                });
                        
                window.TABLE[platform].layers[layer].objects.push(object);
            });

        function getParamsData(table){

            var param = { };

            var newLayer = table.layer,
                newGroup = table.platform || window.layers[table.layer].super_layer;

            if(typeof window.platforms[newGroup] !== "undefined"){
                param.platfrm_id = window.platforms[newGroup]._id;
                param.suprlay_id = null;
            }
            else{
                param.suprlay_id = window.superLayers[newGroup]._id;
                param.platfrm_id = null;
            }
            
            param.layer_id = window.layers[newLayer]._id;
            
            param.name = table.name;

            param.type = table.type.toLowerCase();

            param.difficulty = parseInt(table.difficulty);

            param.code_level = table.code_level.toLowerCase();

            param.repo_dir = "root";

            param.scrnshts = false;

            param.found = false;

            param.description = "pending";

            return param;
        }

        function postParamsDev(table){

            if(table.author !== '' && table.author !== undefined && table.author !== null){ 

                var param = {};

                param.dev_id = dataUser(table.author).id;
                param.percnt = 100;
                param.role = 'author';
                param.scope = 'implementation';

                var dataPost = {
                        usr_id : DATA_TEST_USER,
                        comp_id : table.id
                    };

                window.helper.postRoutesComponents('insert dev', param, dataPost);
            }
        }
    }

    function modifyTile(table){ 

        var params = getParamsData(table);

        var dataPost = {
                usr_id : DATA_TEST_USER,
                comp_id : self.actualTile.id
            };

        window.helper.postRoutesComponents('update', params, dataPost,
            function(res){ 

                //postParamsDev(table);

                window.camera.loseFocus();
                window.camera.enable();

                table.id = self.actualTile.id;

                var newLayer = table.layer,
                    newGroup = table.platform || window.layers[table.layer].super_layer,
                    oldLayer = self.actualTile.layer,
                    oldGroup = self.actualTile.platform || window.layers[self.actualTile.layer].super_layer;

                var arrayObject = window.TABLE[oldGroup].layers[oldLayer].objects;

                for(var i = 0; i < arrayObject.length; i++){
                    
                    if(arrayObject[i].data.author === self.actualTile.author && arrayObject[i].data.name === self.actualTile.name){

                        window.scene.remove(arrayObject[i].mesh);
                        
                    }
                }

                var positionCameraX = window.TABLE[oldGroup].x,
                    positionCameraY = helper.getPositionYLayer(oldLayer);

                window.camera.move(positionCameraX, positionCameraY, 8000, 2000);

                setTimeout( function() {

                    if(newGroup !== oldGroup || newLayer !== oldLayer)
                        change();
                    else
                        notChange();

                }, 2000 );
            

            function change(){

                window.TABLE[oldGroup].layers[oldLayer].objects = [];
                var idScreenshot = oldGroup + "_" + oldLayer + "_" + self.actualTile.name;

                window.screenshotsAndroid.deleteScreenshots(idScreenshot);
       
                for(var i = 0; i < arrayObject.length; i++){
                    
                    if(arrayObject[i].data.author === self.actualTile.author && arrayObject[i].data.name === self.actualTile.name){

                        arrayObject.splice(i,1);
                    }
                }

                window.TABLE[oldGroup].layers[oldLayer].objects = modifyRowTable(arrayObject, oldGroup, oldLayer);

                setTimeout( function() { 

                    positionCameraX = window.TABLE[newGroup].x;
                    positionCameraY = window.helper.getPositionYLayer(newLayer);
                    camera.move(positionCameraX, positionCameraY,8000, 2000);
                    createNewElementTile(table);
                    window.screenshotsAndroid.hidePositionScreenshots(newGroup, newLayer);
                    window.tileManager.updateElementsByGroup();

                }, 2000 );

            }

            function notChange(){

                var arrayObject = window.TABLE[oldGroup].layers[oldLayer].objects;
                var target = null;
                var _ID = null;
                var id = 0;

                var idScreenshot = oldGroup + "_" + oldLayer + "_" + self.actualTile.name;

                if(self.actualTile.name !== table.name)
                    window.screenshotsAndroid.deleteScreenshots(idScreenshot);

                for(var i = 0; i < arrayObject.length; i++){
                    
                    if(arrayObject[i].data.author === self.actualTile.author && arrayObject[i].data.name === self.actualTile.name){

                        id = i;
                        window.TABLE[oldGroup].layers[oldLayer].objects[i].data = table;
                        target = window.TABLE[oldGroup].layers[oldLayer].objects[i].target;
                        _ID = window.TABLE[oldGroup].layers[oldLayer].objects[i].id;
                    }
                }

                var mesh = window.tileManager.createElement(_ID, table);

                window.TABLE[oldGroup].layers[oldLayer].objects[id].mesh = mesh;

                window.scene.add(mesh);
                
                animate(mesh, target.show, 2000,function(){
                    window.screenshotsAndroid.hidePositionScreenshots(oldGroup, oldLayer); 
                });

            }

        });

        function getParamsData(table){

            var param = {};

            var newLayer = table.layer,
                newGroup = table.platform || window.layers[table.layer].super_layer,
                oldLayer = self.actualTile.layer,
                oldGroup = self.actualTile.platform || window.layers[self.actualTile.layer].super_layer;

            //if(newGroup !== oldGroup){

                if(typeof window.platforms[newGroup] !== "undefined"){ 
                    param.platfrm_id = window.platforms[newGroup]._id;
                    //param.suprlay_id = null;
                }
                else{
                    param.suprlay_id = window.superLayers[newGroup]._id;
                    //param.platfrm_id = null;
                }
            //}

            //if(newLayer !== oldLayer)
                param.layer_id = window.layers[newLayer]._id;
            
            //if(table.name !== self.actualTile.name)
                param.name = table.name;

            //if(table.type !== self.actualTile.type)
                param.type = table.type.toLowerCase();

            //if(table.difficulty !== self.actualTile.difficulty)
                param.difficulty = parseInt(table.difficulty);

            //if(table.code_level !== self.actualTile.code_level)
                param.code_level = table.code_level.toLowerCase();

            param.found = false;

            return param;
        }

        function postParamsDev(table){
        
            if(table.author !== self.actualTile.author && (table.author !== '' || table.author !== undefined)){

                var param = {};

                param.dev_id = dataUser(table.author).id;
                param.percnt = 100;
                param.role = 'author';
                param.scope = 'implementation';

                console.log(param);

                var dataPost = {
                        usr_id : DATA_TEST_USER,
                        comp_id : self.actualTile.id,
                        devs_id : dataUser(self.actualTile.author).id
                    };

                window.helper.postRoutesComponents('update dev', param, dataPost);
            }
            else if(self.actualTile.author !== '' && self.actualTile.author !== undefined && table.author === '' && table.author === undefined){

                var dataPost = {
                        usr_id : DATA_TEST_USER,
                        comp_id : self.actualTile.id,
                        devs_id : dataUser(self.actualTile.author).id
                    };

                window.helper.postRoutesComponents('delete dev', false, dataPost);
            }
        }
    }

    function deleteTile(id){

        var table = window.helper.getSpecificTile(id).data;

        var dataPost = {
                usr_id : DATA_TEST_USER,
                comp_id : table.id
            };

        window.helper.postRoutesComponents('delete', false, dataPost,
            function(res){ 

            var oldLayer = table.layer,
                oldGroup = table.platform || window.layers[table.layer].super_layer,
                arrayObject = window.TABLE[oldGroup].layers[oldLayer].objects,
                idScreenshot = oldGroup + "_" + oldLayer + "_" + table.name;

            window.screenshotsAndroid.deleteScreenshots(idScreenshot);

            var positionCameraX = window.TABLE[oldGroup].x,
                positionCameraY = helper.getPositionYLayer(oldLayer);

            window.camera.loseFocus();
            window.camera.enable();

            window.tileManager.transform(false, 1000);
            window.signLayer.transformSignLayer();

            window.camera.move(positionCameraX, positionCameraY, 8000, 2000);

            setTimeout( function() {

                window.TABLE[oldGroup].layers[oldLayer].objects = [];
           
                id = id.split("_");

                id = parseInt(id[2]);

                var mesh = arrayObject[id].mesh;

                var target =  window.helper.fillTarget(0, 0, 160000, 'table');

                animate(mesh, target.hide, 1500, function(){
                    window.scene.remove(mesh);
                });

                arrayObject.splice(id, 1);

                window.TABLE[oldGroup].layers[oldLayer].objects = modifyRowTable(arrayObject, oldGroup, oldLayer);

                window.tileManager.updateElementsByGroup();

            }, 3500 );

        });
    }
    //

    //Tools
    function createNewElementTile(table){

        var x, y, z;

        var platform = table.platform || window.layers[table.layer].super_layer,
            layer = table.layer,
            object = { 
                mesh : null,
                data : {},
                target : {},
                id : null
            };

        if(typeof window.TABLE[platform].layers[layer] === 'undefined'){ 
            window.TABLE[platform].layers[layer] = {   
                objects : [],
                y : window.helper.getPositionYLayer(layer)
            };
        }

        var lastObject = helper.getLastValueArray(window.TABLE[platform].layers[layer].objects);

        var count = window.TABLE[platform].layers[layer].objects.length;

        object.id = platform + '_' + layer + '_' + count;

        var mesh = window.tileManager.createElement(object.id, table);
    
        x = 0;

        if(!lastObject)
            x = window.TABLE[platform].x;
        else
            x = lastObject.target.show.position.x + window.TILE_DIMENSION.width;

        y = window.helper.getPositionYLayer(layer);

        z = 0;

        var target = helper.fillTarget(x, y, z, 'table');

        mesh.position.copy(target.hide.position);
        mesh.rotation.set(target.hide.rotation.x, target.hide.rotation.y, target.hide.rotation.z);

        window.scene.add(mesh);

        object.mesh = mesh;
        object.data = table;
        object.target = target;

        animate(mesh, target.show, 2500);
                
        window.TABLE[platform].layers[layer].objects.push(object);
    }

    function fillTable(found){

        var table = {platform : undefined},
            data = {},
            group = document.getElementById(objects.idFields.platform).value,
            layer = document.getElementById(objects.idFields.layer).value,
            platformID = helper.getCountObject(window.platforms) - 1,
            layerID = 0,
            superLayer = false;

        if(window.platforms[group]){
            table.platform = group;
            platformID = window.platforms[group].index;
        }
        else{
            window.superLayer = group;
        }

        if(window.layers[layer])
            window.layerID = layers[layer].index;

        table.layer = layer;
        table.type = document.getElementById(objects.idFields.type).value;
        table.code_level = document.getElementById(objects.idFields.state).value;
        table.difficulty = document.getElementById(objects.idFields.difficulty).value;
        table.name = document.getElementById(objects.idFields.name).value;
        table.code = helper.getCode(document.getElementById(objects.idFields.name).value);
        table.author = document.getElementById(objects.idFields.author).value;
        table.maintainer = document.getElementById(objects.idFields.maintainer).value;
        table.found = found;
        table.platformID = platformID;
        table.layerID = layerID;
        table.superLayer = superLayer;

        data = dataUser(table.author);

        table.picture = data.picture;
        table.authorRealName = data.authorRealName;
        table.authorEmail = data.authorEmail;

        data = dataUser(table.maintainer);

        table.maintainerPicture = data.picture;
        table.maintainerRealName = data.authorRealName;

        return table;       
    }

    function dataUser(user){

        var data = {};

        for(var i = 0; i < DATA_USER.length; i++){

            if(user.toLowerCase() === DATA_USER[i].usrnm.toLowerCase()){

                data.picture = DATA_USER[i].avatar_url;
                data.authorRealName = DATA_USER[i].name;
                data.authorEmail = DATA_USER[i].email;
                data.id = DATA_USER[i]._id;
            }
        }

        return data;
    }

    function modifyRowTable(arrayObject, oldGroup, oldLayer){

        var newArrayObject = [];

        for(var t = 0; t < arrayObject.length; t++){

            var data = arrayObject[t].data,
                mesh = arrayObject[t].mesh,
                target = null,
                object = { 
                    mesh : null,
                    data : {},
                    target : {},
                    id : null
                };
                
            var x = 0, y = 0, z = 0;

            var lastObject = helper.getLastValueArray(newArrayObject);

            var count = newArrayObject.length;

            object.id = oldGroup + '_' + oldLayer + '_' + count;

            for(var i = 0; i < mesh.levels.length; i++)
                mesh.levels[i].object.userData.id = object.id;

            x = 0;

            if(!lastObject)
                x = window.TABLE[oldGroup].x;
            else
                x = lastObject.target.show.position.x + window.TILE_DIMENSION.width;

            y = window.helper.getPositionYLayer(oldLayer);

            z = 0;

            var idScreenshots = oldGroup + "_" + oldLayer + "_" + data.name;

            window.screenshotsAndroid.changePositionScreenshots(idScreenshots, x, y);
            
            target = window.helper.fillTarget(x, y, z, 'table');

            object.mesh = mesh;
            object.data = data;
            object.target = target;

            animate(object.mesh, target.show, 1500);

            newArrayObject.push(object);
        }

        return newArrayObject;
    }

    function animate(mesh, target, duration, callback){

        var _duration = duration || 2000,
            x = target.position.x,
            y = target.position.y,
            z = target.position.z,
            rx = target.rotation.x,
            ry = target.rotation.y,
            rz = target.rotation.z; 

        _duration = Math.random() * _duration + _duration;

        new TWEEN.Tween(mesh.position)
            .to({x : x, y : y, z : z}, _duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        new TWEEN.Tween(mesh.rotation)
            .to({x: rx, y: ry, z: rz}, _duration + 500)
            .easing(TWEEN.Easing.Exponential.InOut)
            .onComplete(function () {
                    if(typeof(callback) === 'function')
                        callback();   
                })
            .start();
    }
    
}