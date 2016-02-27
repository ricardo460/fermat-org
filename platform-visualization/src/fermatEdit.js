/**
 * @author Ricardo Delgado
 */
function FermatEdit() {

    var DATA_USER = {};

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

    this.actualTile = null;

    var tileWidth = window.TILE_DIMENSION.width - window.TILE_SPACING,
        tileHeight = window.TILE_DIMENSION.height - window.TILE_SPACING;

    var self = this;

    this.init = function(){

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
            self.actualTile = null;
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

        var tile = JSON.parse(JSON.stringify(window.helper.getSpecificTile(id).data));

        self.actualTile = JSON.parse(JSON.stringify(tile));

        if(tile.platform !== undefined)
            document.getElementById('select-Group').value = tile.platform;
        else
            document.getElementById('select-Group').value = window.layers[tile.layer].super_layer;

        changeLayer(document.getElementById('select-Group').value);

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
        
        if(tile.devs !== undefined) 
            document.getElementById('modal-devs').value = tile.devs.slice(0);
        
        if(tile.description !== undefined)
            document.getElementById('modal-desc-textarea').value = tile.description;
        
        if(tile.repo_dir !== undefined)
            document.getElementById(objects.idFields.repo).value = tile.repo_dir;
        
    }

    function createElement() {

        var newCenter = window.helper.getCenterView('table');

        var y = window.helper.getLastValueArray(window.tileManager.dimensions.layerPositions) + (window.TILE_DIMENSION.height * 2);

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

        sesionGroup();
        sesionType();
        sesionName();
        sesionRepoDir();
        sesionDifficulty();
        sesionDescription();
        sesionState();
        sesionAuthor();
        createbutton();
        setTextSize();
        
        function sesionRepoDir() {

            var id = 'label-Repositorio'; text = 'Dir. Repo. : '; type = 'label';

            createField(id, text, null, type, 2);

            var idSucesor = objects.row2.buttons[objects.row2.buttons.length - 1].id;

            var object = {
                id : "input-repodir",
                text : "textfield"
              };

            objects.idFields.repo = object.id;

            var input = $('<input />', {"id" : object.id, "type" : "text", "text" : object.text });

            $("#"+objects.row2.div).append(input);

            var button = document.getElementById(object.id);

            var sucesorButton = document.getElementById(idSucesor);
                  
            button.className = 'edit-Fermat';
            button.placeholder = 'Directory of repository';
            button.style.zIndex = 10;
            button.style.opacity = 0;

            window.helper.show(button, 1000);

            objects.row2.buttons.push(object);

            button.addEventListener('blur', function() {
                changeTexture();
            });

        }
        
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

        function sesionGroup(){

            var id = 'label-Group'; text = 'Select the Group : '; type = 'label';

            createField(id, text, null, type);

            id = 'select-Group'; text = ''; type = 'select';

            createField(id, text, null, type);

            var optgroup = "<optgroup label = Platform>",
                option = "";

            objects.idFields.group = id;

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
            
            var idSucesor = objects.row2.buttons[objects.row2.buttons.length - 1].id;

            var object = {
                id : "button-author",
                text : "button"
            };
            
            objects.idFields.author = object.id;

            var input = $('<input />', {"id" : object.id, "type" : "button", "text" : object.text });

            $("#"+objects.row2.div).append(input);

            objects.row2.buttons.push(object);
            
            var button = document.getElementById(object.id);
            
            button.className = 'actionButton edit-Fermat';
            button.style.zIndex = 10;
            button.style.opacity = 0;
            button.value = "Autores";
            button.style.marginLeft = "5px";

            object = {
                id : "modal-devs",
                text : "modal"
            };

            objects.row2.buttons.push(object);
            
            // Modal
            // START
            
            if(!document.getElementById("modal-devs")){
                
                var modal = document.createElement("div");
                modal.id            = "modal-devs";
                modal.style.left    = (window.innerWidth/2-227)+"px";
                modal.style.top     = (window.innerHeight/2-186)+"px";
                modal.value         = [];
                
                modal.innerHTML = '<div id="a">'+
                        '<div id="finder">'+
                            '<input id="finder-input" type="text" placeholder="Buscar"></input>'+
                            '<input id="finder-button" type="button" value=""></input>'+
                        '</div>'+
                        '<div id="list">'+
                            '<div id="cont-devs" class="list-content">'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                    '<div id="b">'+
                        '<div id="list">'+
                            '<div id="cont-devs-actives" class="list-content">'+
                            '</div>'+
                        '</div>'+
                        '<div id="buttons" >'+
                            '<button id="modal-close-button" >Cancel</button>'+
                            '<button id="modal-accept-button" style="border-left: 2px solid #00b498;">Aceptar</button>'+
                        '</div>'+
                    '</div>';
                
                modal.updateModal = function() {
                    
                    var cont_list = document.getElementById("cont-devs");
                    cont_list.innerHTML = "";
                    
                    var finder = document.getElementById("finder-input");
                    
                    for(var i = 0; i < DATA_USER.length; i++) {
                        
                        var filt = DATA_USER[i].usrnm.search(finder.value);
                        
                        if(filt != -1) {
                        
                            var img_src;

                            if(DATA_USER[i].avatar_url)
                                img_src = DATA_USER[i].avatar_url;
                            else
                                img_src = "images/modal/avatar.png";

                            var usr_html  = '<div class="dev-fermat-edit">'+
                                                '<div>'+
                                                    '<img crossorigin="anonymous" src="'+img_src+'">'+
                                                    '<label>'+DATA_USER[i].usrnm+'</label>'+
                                                    '<button data-usrid="'+DATA_USER[i].usrnm+'" class="add_btn"></button>'+
                                                '</div>'+
                                            '</div>';

                            cont_list.innerHTML += usr_html;
                            
                        }
                    }
                    
                    var list_btn = document.getElementsByClassName("add_btn");
                    
                    function btnOnclickAccept() {
                            
                            var modal = document.getElementById("modal-devs");
                            var _self = this;
                            modal.value[modal.value.length] = {
                                dev: DATA_USER.find(function(x) {
                                    
                                    if(x.usrnm == _self.dataset.usrid)
                                        return x;
                                    
                                }),
                                scope: "implementation",
                                role: "author",
                                percnt: 100
                            };
                            
                            modal.updateModal();

                    }

                    
                    for(i = 0; i < list_btn.length; i++) {
                        var btn = list_btn[i];

                        btn.onclick = btnOnclickAccept;
                    }
                    
                    cont_list = document.getElementById("cont-devs-actives");
                    cont_list.innerHTML = "";
                    
                    for(i = 0; i < this.value.length; i++) {
                        
                        var img_src1;
                        
                        if(this.value[i].dev.avatar_url)
                            img_src1 = this.value[i].dev.avatar_url;
                        else
                            img_src1 = "images/modal/avatar.png";
                        
                        var dev_html = ''+
                        '<div data-expand="false" data-usrid='+ i +' class="dev-fermat-edit dev-active">'+
                            '<div>'+
                                '<img crossorigin="anonymous" src="' + img_src1 + '">'+
                                '<label>' + this.value[i].dev.usrnm + '</label>'+
                                '<button data-usrid='+ i +' class="rem_btn"></button>'+
                                '<div class="dev-data">'+
                                    '<table width="100%">'+
                                        '<tr>'+
                                            '<td align="right">Scope</td>'+
                                            '<td>'+
                                                '<select class="select-scope">'+
                                                    '<option>implementation</option>'+
                                                    '<option>architecture</option>'+
                                                    '<option>design</option>'+
                                                    '<option>unit-tests</option>'+
                                                '</select>'+
                                            '</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                           '<td align="right">Role</td>'+
                                            '<td>'+
                                                '<select class="select-role">'+
                                                    '<option>maintainer</option>'+
                                                    '<option>author</option>'+
                                                '</select>'+
                                           '</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<td align="right">%</td>'+
                                            '<td><input class="input-prcnt" type="text" value="` + this.value[i].percnt + `"></input></td>'+
                                        '</tr>'+
                                    '</table>'+
                                '</div>'+
                            '</div>'+
                        '</div>';
                        
                        cont_list.innerHTML += dev_html;
                        
                        
                    }
                    
                    var devDiv = document.getElementsByClassName("dev-active");

                    for(i=0; i < devDiv.length; i++) {

                        var div = devDiv[i];
                        var dev     = modal.value[div.dataset.usrid];
                        
                        var role    = div.getElementsByClassName("select-role")[0];
                        var scope   = div.getElementsByClassName("select-scope")[0];
                        var prc     = div.getElementsByClassName("input-prcnt")[0];
                        prc.value   = dev.percnt;
                        scope.value = dev.scope;
                        role.value  = dev.role;
                        
                    }
                    
                    list_btn = document.getElementsByClassName("rem_btn");
                    
                    function btnOnclickRemove() {

                        var modal = document.getElementById("modal-devs");
                        modal.value.splice(this.dataset.usrid, 1);
                        modal.updateModal();

                    }
                    
                    for(i = 0; i < list_btn.length; i++) {
                        var btn1 = list_btn[i];

                        btn1.onclick = btnOnclickRemove;

                    }
                    
                    var list_dev = document.getElementsByClassName("dev-active");
                    
                    
                    function dev_onmouseout() {
                        this.dataset.expand = "false";

                        var selectRole = this.getElementsByClassName("select-role")[0].value;
                        var selectScope = this.getElementsByClassName("select-scope")[0].value;
                        var inputPrcnt = this.getElementsByClassName("input-prcnt")[0].value;

                        modal.value[this.dataset.usrid].role = selectRole;
                        modal.value[this.dataset.usrid].scope = selectScope;
                        modal.value[this.dataset.usrid].percnt = inputPrcnt;
                    }
                    
                    function dev_onmouseover() {
                        this.dataset.expand = "true";
                    }
                    
                    for(i = 0; i < list_dev.length; i++) {
                        var dev1 = list_dev[i];

                        dev1.onmouseover = dev_onmouseover;
                        
                        dev1.onmouseout = dev_onmouseout;

                    }
                    
                };
                
                document.body.appendChild(modal);

                var finder = document.getElementById("finder-input");

                finder.onkeyup = function() {
                    
                    document.getElementById("modal-devs").updateModal();
                    
                };

                
            }
            
            
            // END
            

            button.addEventListener('click', function() {
                
                var modal = document.getElementById("modal-devs");
                modal.dataset.state = "show";
                modal.updateModal();
                var area = document.createElement("div");
                area.id = "hidden-area";
                document.body.appendChild(area);
                window.helper.show(area, 1000);
                
            });
            
            document.getElementById("modal-close-button").addEventListener("click", function() {
                
                var modal = document.getElementById("modal-devs");
                modal.dataset.state = "hidden";
                var area = document.getElementById("hidden-area");
                window.helper.hide(area, 500);
                changeTexture();
                
            });
            
            document.getElementById("modal-accept-button").addEventListener("click", function() {
                
                var modal = document.getElementById("modal-devs");
                modal.dataset.state = "hidden";
                
                //update data of devs (modal.value)
                
                var devDiv = document.getElementsByClassName("dev-active");
                
                for(var i=0; i < devDiv.length; i++) {
                    
                    var div = devDiv[i];
                    
                    var selectRole = div.getElementsByClassName("select-role")[0].value;
                    var selectScope = div.getElementsByClassName("select-scope")[0].value;
                    var inputPrcnt = div.getElementsByClassName("input-prcnt")[0].value;

                    modal.value[div.dataset.usrid].role = selectRole;
                    modal.value[div.dataset.usrid].scope = selectScope;
                    modal.value[div.dataset.usrid].percnt = inputPrcnt;
                    
                }
                
                //---------------------------------
                
                var area = document.getElementById("hidden-area");
                window.helper.hide(area, 500);
                changeTexture();
                
            });

            window.helper.show(button, 1000);
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

        function sesionDescription(){
            
            var idSucesor = objects.row2.buttons[objects.row2.buttons.length - 1].id;

            var object = {
                id : "button-desc",
                text : "Description"
              };

            objects.idFields.maintainer = object.id;

            var input = $('<input />', {"id" : object.id, "type" : "button", "text" : object.text });

            $("#"+objects.row2.div).append(input);

            var button = document.getElementById(object.id);
            
            button.className = 'actionButton edit-Fermat';
            button.value = "Description";
            button.style.marginLeft = "5px";
            button.style.zIndex = 10;
            button.style.opacity = 0;
            
            objects.row2.buttons.push(object);

            object = {
                id : "modal-desc",
                text : "modal"
            };

            objects.row2.buttons.push(object);
            

            window.helper.show(button, 1000);
            
            if(!document.getElementById("modal-desc")) {
                
                var modal = document.createElement("div");
                modal.id = "modal-desc";
                modal.style.top = (window.innerHeight / 4) + "px" ;
                modal.dataset.state = "hidden";
                
                modal.innerHTML = ''+
                        '<label>Description:</label>'+
                        '<textarea id="modal-desc-textarea" rows="12"></textarea>'+
                        '<div>'+
                            '<button id="modal-desc-cancel">Cancel</button>'+
                            '<button id="modal-desc-accept">Accept</button>'+
                        '</div>';
                
                
                
                document.body.appendChild(modal);
            }


            button.addEventListener('click', function() {
                
                var modal = document.getElementById("modal-desc");
                modal.dataset.state = "show";
                
                modal.oldValue = document.getElementById("modal-desc-textarea").value;
                
                var area = document.createElement("div");
                area.id = "hidden-area";
                document.body.appendChild(area);
                window.helper.show(area, 1000);
                
            });
            
            document.getElementById("modal-desc-cancel").onclick = function() {
                
                var modal = document.getElementById("modal-desc");
                modal.dataset.state = "hidden";
                document.getElementById("modal-desc-textarea").value = modal.oldValue;
                
                var area = document.getElementById("hidden-area");
                window.helper.hide(area, 500);
                
            };
            
            document.getElementById("modal-desc-accept").addEventListener("click", function() {
                
                var modal = document.getElementById("modal-desc");
                modal.dataset.state = "hidden";
                
                var area = document.getElementById("hidden-area");
                window.helper.hide(area, 500);
                
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
            scale = 5,
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

            disabledButtonSave(true);
            
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
    function createTile(_table){

        var params = getParamsData(_table);

        window.helper.postRoutesComponents('insert', params, null,
            function(res){ 

                _table.id = res._id;

                postParamsDev(_table, function(table){

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
            },
            function(){
                disabledButtonSave(false);
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

            param.repo_dir = table.repo_dir;

            param.scrnshts = false;

            if(table.repo_dir)
                param.found = true;
            else
                param.found = false;

            if(table.repo_dir)
                param.description = table.repo_dir;
            else
                param.description = "pending";

            return param;
        }

        function postParamsDev(table, callback){

            var devs = table.devs;

            var newDevs = [];

            postDevs(devs);

            function postDevs(devs){

                if(devs.length > 0){ 

                    var dataPost = {
                                comp_id : table.id
                            };

                    var param = {};

                    param.dev_id = devs[0].dev._id;
                    param.percnt = devs[0].percnt;
                    param.role = devs[0].role;
                    param.scope = devs[0].scope;

                    window.helper.postRoutesComponents('insert dev', param, dataPost,
                        function(res){

                            devs[0]._id = res._id;

                            newDevs.push(devs[0]);
                            
                            devs.splice(0,1);

                            postDevs(devs);

                        });
                }
                else{

                    table.devs = newDevs;

                    callback(table);
                }
            }
        }
    }

    function modifyTile(_table){ 

        var params = getParamsData(_table);

        var dataPost = {
                comp_id : self.actualTile.id
            };

        window.helper.postRoutesComponents('update', params, dataPost,
            function(res){ 

                _table.id = self.actualTile.id;

                postParamsDev(_table, function(table){

                    var oldTile = JSON.parse(JSON.stringify(self.actualTile)),
                        newLayer = table.layer,
                        newGroup = table.platform || window.layers[table.layer].super_layer,
                        oldLayer = oldTile.layer,
                        oldGroup = oldTile.platform || window.layers[oldTile.layer].super_layer;
                        

                    window.camera.loseFocus();
                    window.camera.enable();

                    var arrayObject = window.TABLE[oldGroup].layers[oldLayer].objects.slice(0);

                    for(var i = 0; i < arrayObject.length; i++){
                        
                        if(arrayObject[i].data.author === oldTile.author && arrayObject[i].data.name === oldTile.name){

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
                        var idScreenshot = oldGroup + "_" + oldLayer + "_" + oldTile.name;

                        window.screenshotsAndroid.deleteScreenshots(idScreenshot);
               
                        for(var i = 0; i < arrayObject.length; i++){
                            
                            if(arrayObject[i].data.author === oldTile.author && arrayObject[i].data.name === oldTile.name){

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

                        var idScreenshot = oldGroup + "_" + oldLayer + "_" + oldTile.name;

                        if(oldTile.name !== table.name)
                            window.screenshotsAndroid.deleteScreenshots(idScreenshot);

                        for(var i = 0; i < arrayObject.length; i++){
                            
                            if(arrayObject[i].data.author === oldTile.author && arrayObject[i].data.name === oldTile.name){

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

        },
        function(){
            disabledButtonSave(false);
        });

        function getParamsData(table){

            var param = {};

            var newLayer = table.layer,
                newGroup = table.platform || window.layers[table.layer].super_layer,
                oldLayer = self.actualTile.layer,
                oldGroup = self.actualTile.platform || window.layers[self.actualTile.layer].super_layer;

            if(typeof window.platforms[newGroup] !== "undefined"){ 
                param.platfrm_id = window.platforms[newGroup]._id;
                param.suprlay_id = null;
            }
            else{
                param.suprlay_id = window.superLayers[newGroup]._id;
                param.platfrm_id = null;
            }

            if(newLayer !== oldLayer)
                param.layer_id = window.layers[newLayer]._id;
            
            if(table.name !== self.actualTile.name)
                param.name = table.name;

            if(table.type !== self.actualTile.type)
                param.type = table.type.toLowerCase();

            if(table.difficulty !== self.actualTile.difficulty)
                param.difficulty = parseInt(table.difficulty);

            if(table.code_level !== self.actualTile.code_level)
                param.code_level = table.code_level.toLowerCase();

            if(table.description !== self.actualTile.description)
                param.description = table.description;

            if(table.repo_dir.toLowerCase() !== self.actualTile.repo_dir.toLowerCase())
                param.repo_dir = table.repo_dir.toLowerCase();

            if(table.repo_dir)
                param.found = true;
            else
                param.found = false;

            return param;
        }

        function postParamsDev(table, callback){

            var newDevs = table.devs.slice(0),
                oldDevs = self.actualTile.devs.slice(0),
                newTableDevs = [],
                config = { 
                        insert :{
                            devs : [],
                            route : 'insert dev'
                        },
                        update : {
                            devs : [],
                            route : 'update dev'
                        },
                        delete :{
                            devs : [],
                            route : 'delete dev'
                        }
                    };

            fillDevs(newDevs, oldDevs, 'insert');

            postDevs('delete',config.delete.devs.slice(0), function(){

                postDevs('update',config.update.devs.slice(0), function(){

                    postDevs('insert',config.insert.devs.slice(0), function(){

                        table.devs = newTableDevs;
                        
                        callback(table);
                    });
                });
            });

            function fillDevs(newDevs, oldDevs, task){
                
                function find_Dev(_index) {
                    if(_index._id === oldDevs[f]._id)
                        return _index;            
                }

                if(newDevs.length > 0){

                    if(task === 'insert'){

                        var array = [];

                        for(var i = 0; i < newDevs.length; i++){

                            if(!newDevs[i]._id)
                                config.insert.devs.push(newDevs[i]);
                            else
                                array.push(newDevs[i]);
                        }

                        fillDevs(array, oldDevs, 'update');
                    }
                    else if(task === 'update'){

                        if(oldDevs.length > 0){
                            

                            for(var f = 0; f < oldDevs.length; f++){

                                var t = newDevs.find(find_Dev);
                                
                                if(t){

                                    if(t.role!= oldDevs[f].role ||
                                       t.scope != oldDevs[f].scope ||
                                       t.percnt.toString() != oldDevs[f].percnt.toString()){
                                        
                                        config.update.devs.push(t);                                      
                                    }
                                    else{
                                        newTableDevs.push(oldDevs[f]);
                                    }
                                }
                                else{

                                    config.delete.devs.push(oldDevs[f]);                                  
                                }
                            }
                        }
                    }
                }
                else{

                    for(var l = 0; l < oldDevs.length; l++){
                        config.delete.devs.push(oldDevs[l]);
                    }
                }
            }

            function postDevs(task, array, callback){

                if(array.length > 0){

                    var dataPost = {
                                comp_id : table.id
                            };

                    var param = {};

                    if(task === 'update' || task === 'delete')
                        dataPost.devs_id = array[0]._id;

                    param.dev_id = array[0].dev._id;
                    param.percnt = array[0].percnt;
                    param.role = array[0].role;

                    if(param.role !== 'maintainer')
                        param.scope = array[0].scope;
                    else
                        param.scope = 'default';

                    window.helper.postRoutesComponents(config[task].route, param, dataPost,
                        function(res){

                            if(task !== 'delete'){ 

                                array[0]._id = res._id;

                                newTableDevs.push(array[0]);
                            }
                            
                            array.splice(0,1);

                            postDevs(task, array, callback);

                        },
                        function(){
                            disabledButtonSave(false);
                        });
                
                }
                else{

                    callback();
                }
            }
        
        }
    }

    function deleteTile(id){

        var table = window.helper.getSpecificTile(id).data;

        var dataPost = {
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
            group = document.getElementById(objects.idFields.group).value,
            layer = document.getElementById(objects.idFields.layer).value,
            platformID = helper.getCountObject(window.platforms) - 1,
            layerID = 0,
            superLayer = false,
            _author;

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
        table.repo_dir = document.getElementById(objects.idFields.repo).value;
        table.description = document.getElementById("modal-desc-textarea").value;
        table.found = found;
        table.platformID = platformID;
        table.layerID = layerID;
        table.superLayer = superLayer;

        var devs = document.getElementById("modal-devs").value;
        
        table.devs = devs.slice(0);

        _author = getBestDev(table.devs, "author");

        table.picture = _author.avatar_url ? _author.avatar_url : undefined;
        table.author = _author.usrnm ? _author.usrnm : undefined;
        table.authorRealName = _author.name ? _author.name : undefined;
        table.authorEmail = _author.email ? _author.email : undefined;

        var _maintainer = getBestDev(table.devs, "maintainer");

        table.maintainer = _maintainer.usrnm ? _maintainer.usrnm : undefined;
        table.maintainerPicture = _maintainer.avatar_url ? _maintainer.avatar_url : undefined;
        table.maintainerRealName = _maintainer.name ? _maintainer.name : undefined;
        
        return table;
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

    function disabledButtonSave(state){

        var button = document.getElementById('button-save');

        if(state){
            button.innerHTML  = "Saving...";
            button.disabled=true;
        }
        else{
            button.innerHTML  = "Save";
            button.disabled=false;
        }
    }

    function getBestDev(_devs, role) {
        var dev = {};
        if (_devs) {
            var _dev = {};
            dev.percnt = 0;
            for (var i = 0, l = _devs.length; i < l; i++) {
                _dev = _devs[i];
                
                if((role === 'author' && _dev.role === 'author' && _dev.scope === 'implementation') ||
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