/**
 * @author Ricardo Delgado
 */
function FermatEdit() {

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

    var tileWidth = window.TILE_DIMENSION.width - window.TILE_SPACING,
        tileHeight = window.TILE_DIMENSION.height - window.TILE_SPACING;

    var self = this;

    var testDataUser = [
            {
               "_id": null,
               "usrnm": "campol",
               "upd_at": null,
               "bio": null,
               "url": "https://github.com/campol",
               "avatar_url": "https://avatars3.githubusercontent.com/u/12051946?v=3&s=400",
               "location": null,
               "bday": null,
               "name": "Luis Campo",
               "email": "campusprize@gmail.com",
               "__v": null
            },
            {
               "_id": null,
               "usrnm": "Miguelcldn",
               "upd_at": null,
               "bio": null,
               "url": "https://github.com/Miguelcldn",
               "avatar_url": "https://avatars1.githubusercontent.com/u/5544266?v=3&s=400",
               "location": null,
               "bday": null,
               "name": "Miguel Celedon",
               "email": "miguelceledon@outlook.com",
               "__v": null 
            },
            {
               "_id": null,
               "usrnm": "fvasquezjatar",
               "upd_at": null,
               "bio": null,
               "url": "https://github.com/fvasquezjatar",
               "avatar_url": "https://avatars2.githubusercontent.com/u/8290154?v=3&s=400",
               "location": null,
               "bday": null,
               "name": "Francisco Vasquez",
               "email": "fvasquezjatar@gmail.com",
               "__v": null 
            }
        ];

    /**
     * @author Ricardo Delgado
     */

    this.addButton = function(_id){

        var id = _id || null,
            text = 'Edit Component',
            button = 'buttonFermatEdit',
            side = null;

        var callback = function(){ 
                addAllFilds();
                fillFields(id);
                drawTile(id); 
            };

        if(id === null){
            callback = function(){ 
                drawTile(null, addAllFilds);
            };

            text = 'Add New Component';
            button = 'buttonFermatNew';
            side = 'right';
        }

        window.buttonsManager.createButtons(button, text, callback, null, null, side);
           
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
            deleteMesh();
            //self.addButton();

        }
    };

    function fillFields(id){

        var tile = window.table[id]; 

        if(tile.group !== undefined)
            document.getElementById('select-Platform').value = tile.group;

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

        var px = Math.random() * 80000 - 40000,
            py = Math.random() * 80000 - 40000,
            pz = 80000 * 2,
            rx = Math.random() * 180,
            ry = Math.random() * 180,
            rz = Math.random() * 180,
            newCenter = new THREE.Vector3(0, 0, 0);

        var mesh = new THREE.Mesh(
                   new THREE.PlaneBufferGeometry(tileWidth, tileHeight),
                   new THREE.MeshBasicMaterial({
                            side: THREE.DoubleSide,
                            transparent : true,
                            map : null
                        })
                );

        mesh.userData = {
           // onClick : onClick
        };

        newCenter = window.viewManager.translateToSection('table', newCenter);

        var target = { x : newCenter.x, y : newCenter.y, z : newCenter.z,
                       px : px, py : py, pz : pz,
                       rx : rx, ry : ry, rz : rz };

        mesh.position.set(px, py, pz);

        mesh.rotation.set(rx, ry, rz);

        mesh.renderOrder = 1;

        scene.add(mesh);

        objects.tile.mesh = mesh;

        objects.tile.target = target;
    }

    function drawTile(id, callback){

        if(objects.tile.mesh === null)
            createElement();

        var mesh = objects.tile.mesh;

        if (window.camera.getFocus() === null) {

            window.tileManager.letAlone();

            animate(mesh, objects.tile.target, true, 500, function(){ 

                window.camera.setFocus(mesh, new THREE.Vector4(0, 0, tileWidth, 1), 2000);
                
                window.headers.hideHeaders(2000);

                if(typeof(callback) === 'function')
                    callback(); 
                
                changeTexture();

                window.camera.disable(); 

                window.helper.showBackButton();

            });
        }
        else{

            var position = window.tileManager.targets.table[id].position;

            animate(window.objects[id], objects.tile.target, false, 2000);

            changeTexture();

            animate(mesh, position, true, 1500, function(){ 

                window.camera.setFocus(mesh, new THREE.Vector4(0, 0, tileWidth, 1), 1000);

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
            button.style.position = 'absolute';
            button.innerHTML = text;
            button.style.top = objects['row' + row].y + 'px';
            button.style.left = (sucesorButton.offsetLeft + sucesorButton.clientWidth + x) + 'px';
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

            for(var i in platforms){

                if(i != "size"){

                    option += "<option value = "+i+" >"+i+"</option>";
                }

            }

            optgroup += option + "</optgroup>";

            option = "";

            optgroup += "<optgroup label = superLayer>";

            for(var _i in superLayers){

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
                  
            button.placeholder = 'Component Name';      
            button.style.position = 'absolute';
            button.style.top = objects.row2.y + 'px';
            button.style.left = (sucesorButton.offsetLeft + sucesorButton.clientWidth + 5) + 'px';
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

            button.placeholder = 'Github User';     
            button.style.position = 'absolute';
            button.style.top = objects.row2.y + 'px';
            button.style.left = (sucesorButton.offsetLeft + sucesorButton.clientWidth + 5) + 'px';
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
                  
            button.placeholder = 'Github User';      
            button.style.position = 'absolute';
            button.style.top = objects.row2.y + 'px';
            button.style.left = (sucesorButton.offsetLeft + sucesorButton.clientWidth + 5) + 'px';
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

        }

        function createbutton(){

            var id = 'button-save'; text = 'Save'; type = 'button';

            var button = createField(id, text, 20, type, 2);

            button.className = 'actionButton';
            
            button.addEventListener('click', function() {

            });

        }

    }

    function changeLayer(platform){

        var state = false;

        if(typeof platforms[platform] === 'undefined')
            state = platform;

        var _layers = window.CLI.query(window.layers,function(el){return (el.super_layer === state);});

        var option = "";

        for(var i = 0;i < _layers.length; i++){

            option += "<option value = '"+_layers[i]+"' >"+_layers[i]+"</option>";

        }

        $("#select-layer").html(option);          
    }

    function changeTexture(){

        var table = {},
            data = {},
            scale = 5,
            mesh = null;

        table.group = document.getElementById(objects.idFields.platform).value;
        table.layer = document.getElementById(objects.idFields.layer).value;
        table.type = document.getElementById(objects.idFields.type).value;
        table.code_level = document.getElementById(objects.idFields.state).value;
        table.difficulty = document.getElementById(objects.idFields.difficulty).value;
        table.name = document.getElementById(objects.idFields.name).value;
        table.code = fillCode(document.getElementById(objects.idFields.name).value);
        table.author = document.getElementById(objects.idFields.author).value;
        table.maintainer = document.getElementById(objects.idFields.maintainer).value;
        table.found = true;

        data = dataUser(table.author);

        table.picture = data.picture;
        table.authorRealName = data.authorRealName;

        data = dataUser(table.maintainer);

        table.maintainerPicture = data.picture;
        table.maintainerRealName = data.authorRealName;

        mesh = objects.tile.mesh;

        mesh.material.map = window.tileManager.createTexture(null, 'high', tileWidth, tileHeight, scale, table); 
        mesh.material.needsUpdate = true; 

        function dataUser(user){

            var data = {};

            for(var i = 0; i < testDataUser.length; i++){

                if(user.toLowerCase() === testDataUser[i].usrnm.toLowerCase()){

                    data.picture = testDataUser[i].avatar_url;
                    data.authorRealName = testDataUser[i].name;
                    data.authorEmail = testDataUser[i].email;
                }
            }

            return data;
        }

        function fillCode(text){

            var code = '',
                words = text.split(" "),
                cantWord = words.length,
                end = 1;

            if(cantWord === 1)       
                end = 3;
            else if(cantWord === 2)
                end = 2;

            for(var i = 0; i < words.length; i++){

                code += words[i].substr(0, end);
            }

            return code;
        }
    }

    function deleteMesh(){

        var mesh = objects.tile.mesh;

        if(mesh != null){

            animate(mesh, objects.tile.target, false, 1500, function(){ 
                    window.scene.remove(mesh);
                });

            objects.tile.mesh = null;
        }
    }

    function animate(mesh, target, state, duration, callback){

        var _duration = duration || 2000,
            x,
            y,
            z,
            rx,
            ry,
            rz;

        if (state) {

           x = target.x;
           y = target.y;
           z = target.z;

           rx = 0;
           ry = 0;
           rz = 0;
        } 
        else {

           x = target.px;
           y = target.py;
           z = target.pz;
           
           rx = target.rx;
           ry = target.ry;
           rz = target.rz; 
        }  

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


