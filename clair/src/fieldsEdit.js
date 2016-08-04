/**
 * @author Ricardo Delgado
 */
function FieldsEdit() {

    this.objects = {
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

    this.actions = { 
        exit : null,
        type : null
    };

    this.actualTile = null;

    this.actualFlow = null;

    var self = this;

    var DATA_USER = window.API.listDevs;

    var button,
        text,
        x,
        type;

    this.removeAllFields = function(){

        if(self.objects.row1.buttons.length !== 0 || self.objects.row2.buttons.length !== 0){

            var row = 'row1';

            if(self.objects[row].buttons.length === 0)
                row = 'row2';

            var actualButton = self.objects[row].buttons.shift();

            if( $('#'+actualButton.id) != null ) 
                window.helper.hide($('#'+actualButton.id), 1000); 
            
                self.removeAllFields();
        }
        else {

            if( $('#'+self.objects.row1.div) != null ) 
                window.helper.hide($('#'+self.objects.row1.div), 1000);

            if( $('#'+self.objects.row2.div) != null ) 
                window.helper.hide($('#'+self.objects.row2.div), 1000);

            self.objects.row1.div = null;
            self.objects.row2.div = null;
            self.objects.idFields = {};

            if(document.getElementById("hidden-area"))
                window.helper.hide('hidden-area', 1000);

            if(window.actualView === 'table'){ 

                self.actualTile = null;

                window.tableEdit.formerName = null;
                
                window.tableEdit.deleteMesh();

                if(window.camera.getFocus() === null)
                    window.tableEdit.addButton();              

                if(typeof(self.actions.exit) === 'function'){
                    self.actions.exit();
                    self.actions.exit = null;
                }
            }
            else if(window.actualView === 'workflows'){
                    
                self.actualFlow = null;
                    
                window.tableEdit.deleteMesh();

                if(window.camera.getFocus() === null)
                    window.workFlowEdit.addButton();              

                if(typeof(self.actions.exit) === 'function'){
                    self.actions.exit();
                    self.actions.exit = null;
                }
            }

        }
    };

    this.createField = function(id, text, _x, _type, _row){

        var object = {
            id : id,
            text : text
          };

        var x = _x || 5,
            type = _type || 'button',
            idSucesor = "backButton",
            row = _row || '1';

        if( self.objects['row' + row].div === null)
            self.createDiv(row);

        if(self.objects['row' + row].buttons.length !== 0)
            idSucesor = self.objects['row' + row].buttons[self.objects['row' + row].buttons.length - 1].id;

        var div = document.getElementById(self.objects['row' + row].div);

        var button = document.createElement(type),
            sucesorButton = document.getElementById(idSucesor);
                  
        button.id = id;
        button.className = 'edit-Fermat';
        button.innerHTML = text;
        button.style.zIndex = 10;
        button.style.opacity = 0;

        div.appendChild(button);

        self.objects['row' + row].buttons.push(object);

        window.helper.show(button, 1000);

        return button;
    };

    this.createDiv = function(row){ 

        var div = document.createElement('div');

        div.id = 'div-Edit' + row;

        document.body.appendChild(div);

        self.objects['row' + row].div = 'div-Edit' + row;

        window.helper.show(div, 1000);
    };

    this.setTextSize = function() { 
        
        var object = {
            id : "fermatEditStyle",
            text : "style"
          };

        self.objects.row2.buttons.push(object);

        var windowWidth  = window.innerWidth;
        var size         = windowWidth * 0.009;
        var style        = document.createElement("style");
        var styleSheet   = ".edit-Fermat {font-size:"+size+"px;}";
        var node         = document.createTextNode(styleSheet);
        
        style.appendChild(node);
        document.body.appendChild(style);  
    };

    this.createFieldTableEdit = function(){

        sesionGroup();
        sesionType();
        sesionName();
        //sesionRepoDir();
        sesionDifficulty();
        sesionDescription();
        sesionState();
        sesionAuthor();
        createbutton(function(){
            self.actions.exit = null;
            window.tableEdit.saveTile();  
        });
        self.setTextSize();

    };

    this.createFieldWorkFlowEdit = function(){

        workflowHeader();
        workflowDescription();
        createStepsList();
        createModeEdit();
    };

    this.changeLayer = function(platform){

        var state = false;

        if(typeof window.platforms[platform] === 'undefined')
            state = platform;

        var _layers = window.CLI.query(window.layers,function(el){return (typeof(el) !== "function" && el.super_layer.toString() === state.toString());});

        var option = "";

        for(var i = 0;i < _layers.length; i++){

            option += "<option value = '"+_layers[i]+"' >"+_layers[i]+"</option>";

        }

        $("#select-layer").html(option);  
        
    };

    this.disabledButtonSave = function(state){

        var button = document.getElementById('button-save');

        if(state){
            button.innerHTML  = "Saving...";
            button.disabled = true;
        }
        else{
            button.innerHTML  = "Save";
            button.disabled = false;
        }
    };
    
    this.getData = function() {
        
        var title = document.getElementById("workflow-header-title");
        var desc = document.getElementById("modal-desc-textarea");
        var platform = document.getElementById("workflow-header-plataform");
        
        var json = {
            "platfrm": platform.value,
            "name": title.value,
            "desc": desc.value,
            "prev": null,
            "next": null,
            "steps": []
        };

        return json;
    };
    
    function setSelectImages(select) {
        
        select.style.backgroundSize = select.offsetHeight + "px";
        select.style.width = select.offsetWidth + select.offsetHeight + "px";  
    }

    function sesionGroup(){

        var id = 'label-Group'; text = 'Select the Group : '; type = 'label';

        self.createField(id, text, null, type);

        id = 'select-Group'; text = ''; type = 'select';

        self.createField(id, text, null, type);

        var optgroup = "<optgroup label = Platform>",
            option = "";

        self.objects.idFields.group = id;

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

        self.changeLayer(document.getElementById(id).value);

       $("#"+id).change('click', function() {
        
            self.changeLayer(document.getElementById(id).value);
            window.tableEdit.changeTexture();
        });
        
        setSelectImages(document.getElementById(id));
    }

    function sesionLayer(){

        var id = 'label-layer'; text = 'Select the Layer : '; type = 'label';

        self.createField(id, text, 15, type);

        id = 'select-layer'; text = ''; type = 'select';

        self.createField(id, text, null, type);

        self.objects.idFields.layer = id;

        $("#"+id).change('click', function() {
        
            window.tableEdit.changeTexture();
        });
        
        setSelectImages(document.getElementById(id));
    }

    function sesionType(){

        var id = 'label-Type'; text = 'Select the Type : '; type = 'label';

        self.createField(id, text, 15, type);

        id = 'select-Type'; text = ''; type = 'select';

        self.createField(id, text, null, type);

        self.objects.idFields.type = id;        

        var option = "";

        option += "<option value = Addon>Addon</option>";
        option += "<option value = Android>Android</option>";
        option += "<option value = Library>Library</option>";
        option += "<option value = Plugin>Plugin</option>";

        $("#"+id).html(option);

        $("#"+id).change('click', function() {
        
            window.tableEdit.changeTexture();
        });
        
        setSelectImages(document.getElementById(id));
    }

    function sesionName(){

        var id = 'label-Name'; text = 'Enter Name : '; type = 'label';

        self.createField(id, text, null, type, 2);

        var idSucesor = self.objects.row2.buttons[self.objects.row2.buttons.length - 1].id;

        var object = {
            id : "imput-Name",
            text : "textfield"
          };

        self.objects.idFields.name = object.id;

        var imput = $('<input />', {"id" : object.id, "type" : "text", "text" : object.text });

        $("#"+self.objects.row2.div).append(imput);

        var button = document.getElementById(object.id);

        var sucesorButton = document.getElementById(idSucesor);
              
        button.className = 'edit-Fermat';
        button.placeholder = 'Component Name';
        button.style.zIndex = 10;
        button.style.opacity = 0;

        window.helper.show(button, 1000);

        self.objects.row2.buttons.push(object);

        button.addEventListener('blur', function() {

            window.tableEdit.changeTexture();
        });
    }
    
    function sesionAuthor(){
        
        var idSucesor = self.objects.row2.buttons[self.objects.row2.buttons.length - 1].id;

        var object = {
            id : "button-author",
            text : "button"
        };
        
        self.objects.idFields.author = object.id;

        var input = $('<input />', {"id" : object.id, "type" : "button", "text" : object.text });

        $("#"+self.objects.row2.div).append(input);

        self.objects.row2.buttons.push(object);
        
        var button = document.getElementById(object.id);
        
        button.className = 'actionButton edit-Fermat';
        button.style.zIndex = 10;
        button.style.opacity = 0;
        button.value = "Authors";
        button.style.marginLeft = "5px";

        object = {
            id : "modal-devs",
            text : "modal"
        };

        self.objects.row2.buttons.push(object);
        
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
                        '<input id="finder-input" type="text" placeholder="Search"></input>'+
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
                        '<button id="modal-accept-button" style="border-left: 2px solid #00b498;">Accept</button>'+
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
            window.tableEdit.changeTexture();
            
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
            window.tableEdit.changeTexture();
            
        });

        window.helper.show(button, 1000);
    }

    function sesionDifficulty(){

        var id = 'label-Difficulty'; text = 'Select Difficulty : '; type = 'label';

        self.createField(id, text, 15, type);

        id = 'select-Difficulty'; text = ''; type = 'select';

        self.createField(id, text, null, type);

        self.objects.idFields.difficulty = id;

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
        
            window.tableEdit.changeTexture();
        });
        
        setSelectImages(document.getElementById(id));
    }

    function sesionDescription(){
        
        var idSucesor = self.objects.row2.buttons[self.objects.row2.buttons.length - 1].id;

        var object = {
            id : "button-desc",
            text : "Description"
          };

        self.objects.idFields.maintainer = object.id;

        var input = $('<input />', {"id" : object.id, "type" : "button", "text" : object.text });

        $("#"+self.objects.row2.div).append(input);

        var button = document.getElementById(object.id);
        
        button.className = 'actionButton edit-Fermat';
        button.value = "Description";
        button.style.marginLeft = "5px";
        button.style.zIndex = 10;
        button.style.opacity = 0;
        
        self.objects.row2.buttons.push(object);

        object = {
            id : "modal-desc",
            text : "modal"
        };

        self.objects.row2.buttons.push(object);
        

        window.helper.show(button, 1000);
        
        if(!document.getElementById("modal-desc")) {
            
            var modal = document.createElement("div");
            modal.id = "modal-desc";
            modal.style.top = (window.innerHeight / 4) + "px" ;
            modal.dataset.state = "hidden";
            
            modal.innerHTML = ''+
                    '<label>Description:</label>'+
                    '<textarea id="modal-desc-textarea" rows="12" maxlength="300"></textarea>'+
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

        self.createField(id, text, 15, type);

        id = 'select-State'; text = ''; type = 'select';

        self.createField(id, text, 8, type);

        self.objects.idFields.state = id;

        var option = "";

        option += "<option value = concept>Concept</option>";
        option += "<option value = development>Development</option>";
        option += "<option value = production>Production</option>";
        option += "<option value = qa>QA</option>";

        $("#"+id).html(option);

        $("#"+id).change('click', function() {
        
            window.tableEdit.changeTexture();
        });
        
        setSelectImages(document.getElementById(id));
    }

    function createbutton(callback){
        
        var id = 'button-save', text = 'Save', type = 'button';
        
        window.buttonsManager.createButtons(id, text, function(){

            if(typeof(callback) === 'function')
                callback();          

        }, null, null, "right");
    }

    function deleteMesh(){

        var mesh = self.objects.tile.mesh;

        if(mesh != null){ 

            animate(mesh, self.objects.tile.target.hide, 1500, function(){ 
                    window.scene.remove(mesh);
                    
                    self.objects.tile.mesh = null;
                });
        }
    }

    function workflowHeader() {
        
        if(!document.getElementById("workflow-header")) {
            
            var div = document.createElement("div");
            div.id = "workflow-header";
            div.innerHTML += '<label> Title: </label>';
            div.innerHTML += '<input id="workflow-header-title" class="edit-Fermat" placeholder="Title" type="text" maxlength="68"></input>';
            div.innerHTML += '<label> Select the Group : </label>';
            var select = document.createElement("select");
            select.id = "workflow-header-plataform";
            select.className = "edit-Fermat";

            var object = {
                id : "workflow-header",
                text : "workflow-header"
            };

            self.objects.row1.buttons.push(object);
  
            var optgroup = "<optgroup label = Platform>",
            option = "";

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

            select.innerHTML = optgroup;
            
            
            div.appendChild(select);
            
            div.innerHTML += '<input id="workflow-header-description" style="margin-left: 5px" type="button" class="actionButton edit-Fermat" value="Description"></input>';

            document.body.appendChild(div);
            
            document.getElementById("workflow-header-title").addEventListener('blur', function() {
               window.workFlowEdit.changeTexture();
            });
            
            setSelectImages(document.getElementById("workflow-header-plataform"));
        }   
    }
    
    function workflowDescription() {

        var div = document.createElement("div");
        div.id = "workflow-modal-desc";
        var modal = document.createElement("div");
        modal.id = "modal-desc";
        modal.style.top = (window.innerHeight / 4) + "px" ;
        modal.dataset.state = "hidden";

        var object = {
            id : "workflow-modal-desc",
            text : "workflow-header"
        };

        self.objects.row1.buttons.push(object);

        modal.innerHTML = ''+
            '<label>Description:</label>'+
            '<textarea id="modal-desc-textarea" rows="12" maxlength="280"></textarea>'+
            '<div>'+
                '<button id="modal-desc-cancel">Cancel</button>'+
                '<button id="modal-desc-accept">Accept</button>'+
            '</div>';
        
        div.appendChild(modal);
        document.body.appendChild(div);
        
        var button = document.getElementById("workflow-header-description");
        
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
            
            window.workFlowEdit.changeTexture();
        });
    }
    
    this.showLineSelectType = function(array, select, mouse, callback) {

        var div = document.getElementById("modal-call");

        if(!div){ 
        
            div = document.createElement("div");
            div.id = "modal-call";
            document.body.appendChild(div);
        }

        div.innerHTML = `
            <div id="modal-call-type">
              <div id="modal-call-select">
                <select id="modal-call-select_">
                </select>
              </div>
              <div id="modal-solap-a">
              </div>
              <div id="modal-solap-b">
              </div></div>`;

        var _select = document.getElementById("modal-call-select_");

        _select.innerHTML = "";
            
        for(var i = 0; i < array.length; i++){ 

            if(i === select)
                _select.innerHTML += "<option selected>" + array[i] + "</option>";
            else
                _select.innerHTML += "<option>" + array[i] + "</option>";
        }

        div.style.top = (mouse.clientY - 39) + 'px';
        div.style.left = (mouse.clientX - 70) + 'px';

        div.style.position = 'absolute';

        $("#modal-call").change('click', function() {
    
            callback(_select.value);
            
        }); 
    };

    this.showModal = function(step, missing) {

        var div = document.getElementById("step-modal");

        var title = step.title[0],
            desc = step.desc[0],
            _title, _desc, b1, b2;

        if(!div){ 
        
            div = document.createElement("div");
            div.id  = "step-modal";
            
            div.innerHTML += 
            `  <canvas id="step-modal-canvas"></canvas>
                <div id="step-error" data-state="hidden">
                  The Title field is required.
                  <div id="part-a"></div>
                  <div id="part-b"></div>
                </div>
               <input type="text" placeholder="Title" id="step-modal-title" maxlength = "75"/>
               <textarea placeholder="Description" id="step-modal-desc" maxlength = "127"></textarea>
            `;
            
            b1 = document.createElement("button");
            b2 = document.createElement("button");
            
            b1.id = "step-modal-accept";
            b2.id = "step-modal-cancel";
            
            b1.innerHTML = "Accept";
            b2.innerHTML = "Cancel";
            
            div.appendChild(b1);
            div.appendChild(b2);
            
            document.body.appendChild(div);
            
            window.onresize  = function() {
                div.style.width = (div.offsetHeight * 0.9) + "px";
            };
            
            window.onresize();
        }
        else{

            b1 = document.getElementById("step-modal-accept");
            b2  = document.getElementById("step-modal-cancel");
        }

        if(missing)
            document.getElementById("step-error").dataset.state = "show";

        _title = document.getElementById("step-modal-title");
        _desc  = document.getElementById("step-modal-desc");

        _title.value = title;
        _desc.value  = desc;

        b1.onclick = function() {
            step.title[0] = _title.value;
            step.desc[0] = _desc.value;
            window.dragManager.functions.DROP = [];
            window.fieldsEdit.hiddenModal();
        };
        
        b2.onclick = function() {
            window.dragManager.functions.DROP = [];
            window.fieldsEdit.hiddenModal();
        };

        _title.addEventListener('blur', function() {

            workflowPreview(step);

            if(_title.value === '')
                document.getElementById("step-error").dataset.state = "show";
            else
                document.getElementById("step-error").dataset.state = "hidden";
        });

        _desc.addEventListener('blur', function() {
            workflowPreview(step);
        });

        workflowPreview(step);
    };

    this.setModeEdit = function(mode, buttonRight, ButtonsLeft){

        var div = document.getElementById("header-text");

        var right = document.getElementById("header-next"),
            left = document.getElementById("header-back");

        if(div){
            div.innerHTML = mode;

            if(buttonRight){
                window.helper.show(right, 500, function(){
                    right.style.opacity = "";
                    right.style.transition = "";
                });
            }
            else{
                window.helper.hide(right, 500, true);
            }

            if(ButtonsLeft){
                window.helper.show(left, 500, function(){
                    left.style.opacity = "";
                    left.style.transition = "";
                });
            }
            else{
                window.helper.hide(left, 500, true);
            }
        }
    };
 
    function createModeEdit(){

        var div = document.getElementById("workflow-mode");

        if(!div){ 

            var object = {
                id : "workflow-mode",
                text : ""
            };

            self.objects.row1.buttons.push(object);

            div = document.createElement("div");

            div.id  = "workflow-mode";
            
            div.innerHTML += 
            ` 
            <div id="header-container">
                <button id="header-back"></button>
                <div id="header-text">
                </div>
                <button id="header-next"></button>
            </div>
            `;
            
            window.onresize  = function() {
                var cont = document.getElementById("header-container");
                cont.style.height = cont.offsetWidth/5.6 + "px";
                document.getElementById("header-text").style.lineHeight = (cont.offsetWidth/5.6) + "px";
            };
            
            
            document.body.appendChild(div);
            window.onresize();
        }
    }

    function createStepsList(){

        var div = document.getElementById("steps-list");

        if(!div){ 
        
            div = document.createElement("div");
            div.id  = "steps-list";

            var object = {
                id : "steps-list",
                text : ""
            };

            div.dataset.state = "hidden";

            self.objects.row1.buttons.push(object);
            
            div.innerHTML += 
            `
            <div id="steps-list-content">
            </div>
            <div id="steps-list-expand">
            <button id="steps-expand"></button>
            </div>
            `;
			
			div.addStep = function(i, obj, type) {

				var div = document.createElement('div');
				var div2 = document.createElement('div');
				var close = document.createElement('button');
                var alert = document.createElement('div');
                var foto = document.createElement('div');
				var canvas = document.createElement('canvas');

                canvas.id = 'canvas-step-' + i;
				
				div.className = "steps-list-step";
                alert.className = "steps-alert";
				div2.className = "steps-div-close";
				close.className = "steps-button-close";
				canvas.className = "steps-list-step";

				var ctx = canvas.getContext("2d");

                switch(obj.state) {

                    case 'good':
                        alert.style.backgroundImage = "url('images/workflow/tick.png')";
                        alert.style.backgroundColor = '#4DE539';
                        break;
                    case 'locked':
                        alert.style.backgroundImage = "url('images/workflow/locked.png')";
                        alert.style.backgroundColor = '#666';
                        break;
                    case 'error':
                        alert.style.backgroundImage = "url('images/workflow/error.png')";
                        alert.style.backgroundColor = '#E12727';
                        break;
                }

				div.appendChild(div2);
				div.appendChild(canvas);
                div2.appendChild(alert);

                if(type === 'edit-path')
                    div2.appendChild(close);

                canvas.dataset.state = false;

				canvas.onclick = function () {

                    if(type === 'edit-step' || type === 'edit-path'){ 

    					var mesh = obj.mesh;

                        var position = mesh.position;

                        window.camera.move(position.x, position.y, 200, 1500, true);

                        if(type === 'edit-path'){
                            window.workFlowEdit.changeFocusSteps(obj.order[0]);
                        }

                    }
                    else{

                        var state = obj.state;

                        if(state === 'error'){
                            
                            window.dragManager.objects = dragModeRepared(obj);
                            window.workFlowEdit.getFocus().data = obj.id;
                            obj.mesh.visible = false;
                            window.fieldsEdit.hiddenModal();
                        }
                        else{
                            
                            window.dragManager.objects = [];
                            var parent = searchStepParent(obj);
                            var mesh = obj.mesh;
                            mesh.material.map  = window.workFlowEdit.changeTextureId(obj.id + 1, parent.id + 1);
                            mesh.material.needsUpdate = true;
                            var difference = (window.TILE_DIMENSION.width - window.TILE_SPACING) / 2;
                            var tile = window.helper.getSpecificTile(obj.element).mesh;

                            var target = window.helper.fillTarget(tile.position.x - difference, tile.position.y, tile.position.z + 1, 'table');

                            mesh.position.copy(target.show.position);

                            var position = mesh.position;

                            obj.mesh.visible = true;

                            window.camera.move(position.x, position.y, 200, 1500, true);
                        }
                    }

                    self.changeFocus(canvas, i);
				};
				
				close.onclick = function () {

                    window.workFlowEdit.deleteStepList(obj.order[0]);
				};
				
				document.getElementById("steps-list-content").appendChild(div);
				
				canvas.width  = canvas.offsetWidth;
				canvas.height = canvas.offsetHeight;
				ctx.width  = canvas.offsetWidth;
				ctx.height = canvas.offsetHeight;

                applyTextureCanvas(ctx, i, "images/workflow/step.png");
			}
            
            document.body.appendChild(div); 

            document.getElementById("steps-list-expand").onclick = function() {

                var element = document.getElementById("steps-list");

                if(element.dataset.state == "hidden") 
                    element.dataset.state = "show"; 
                else 
                    element.dataset.state = "hidden";
            };
        }
        
        function searchStepParent(step){

            var steps = window.fieldsEdit.actualFlow.steps.slice();

            for(var i = 0; i < steps.length; i++){

                var next = steps[i].next;

                for(var l = 0; l < next.length; l++){

                    var _id = parseInt(next[l].id);

                    if(_id === step.id){
                        return steps[i];
                    }
                }
            }

            return false;
        }

        function dragModeRepared(step){

            var steps = window.fieldsEdit.actualFlow.steps.slice();

            var parent = searchStepParent(step);

            var children = validateChildrenTiles();

            var array = [];

            for(var i = 0; i < window.tilesQtty.length; i++){

                if(window.tilesQtty[i] !== parent.element && !children.find(function(x){ if(x.element === window.tilesQtty[i]) return x;})){

                    var tile = window.helper.getSpecificTile(window.tilesQtty[i]).mesh;

                    array.push(tile);
                }
            }

            return array;

            function validateChildrenTiles(){

                var _array = [];

                var children = step.next;

                for(var i = 0; i < steps.length; i++){

                    if(children.find(function(x){ if(parseInt(x.id) === steps[i].id) return x;}))
                        _array.push(steps[i]);
                }

                return _array;
            }
        }
    }

    function applyTextureCanvas(ctx, id, src){

        var img = new Image();

        img.src = src;

        img.onload = function() {

            ctx.drawImage(this, ctx.width/2 - 45, ctx.height/2 - 45, 90, 90);

            ctx.font = "60px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(id, ctx.width/2, ctx.height/2 + 21);
        };
    }

    this.changeFocus = function(canvas, id){

        if(canvas){ 

            if(canvas.dataset.state === "false"){ 

                var ctx = canvas.getContext("2d");

                applyTextureCanvas(ctx, id, "images/workflow/stepF.png");
                
                var count = $("#steps-list-content canvas").length;

                for(var i = 1; i <= count; i++){

                    var _canvas = document.getElementById('canvas-step-' + i);

                    if(_canvas.dataset.state === "true"){

                        var _ctx = _canvas.getContext("2d");

                        cleanPreview(_canvas);

                        applyTextureCanvas(_ctx, i, "images/workflow/step.png");

                        _canvas.dataset.state = false;
                    }
                }

                canvas.dataset.state = true;
            }
        }
    }
    
    this.hiddenStepsList = function(state, duration) {

        duration = duration || 500;

        if(state){
            window.helper.show(document.getElementById("workflow-mode"), duration);
            window.helper.show(document.getElementById("steps-list"), duration);  
        }
        else{
            window.helper.hide(document.getElementById("workflow-mode"), duration, true);
            window.helper.hide(document.getElementById("steps-list"), duration, true);
        }
    };
    
    this.hiddenModal = function(duration) {

        duration = duration || 500;
        window.helper.hide(document.getElementById("step-modal"), duration);
        window.helper.hide(document.getElementById("modal-call"), duration);
    };

    function workflowPreview(steps) {

        var step = steps;

        var fillBox = function(ctx, image) {

            ctx.drawImage(image, 0, 0, 300, 150);

            var mesh = window.helper.getSpecificTile(step.tile).mesh;

            var texture = mesh.levels[0].object.material.map.image;

            var img = document.createElement('img');

            img.src = texture.toDataURL("image/png");

            img.onload = function() {
                ctx.drawImage(img, 65, 27, 85, 98);
            };

            //ID
            var Nodeid = parseInt(step.order[0]);
            Nodeid = (Nodeid < 10) ? '0' + Nodeid.toString() : Nodeid.toString();

            var size = 37;
            ctx.font = size + 'px Arial';
            ctx.fillStyle = '#000000';
            window.helper.drawText(Nodeid, 16, 90, ctx, 76, size);
            ctx.fillStyle = '#FFFFFF';

            //Title
            size = 8;
            ctx.font = 'bold ' + size + 'px Arial';
            window.helper.drawText(step.title[0], 151, 40, ctx, 100, size);

            //Description
            size = 6;
            ctx.font = size + 'px Arial';
            window.helper.drawText(step.desc[0], 151, 80, ctx, 100, size);
        };

        var canvas = document.getElementById('step-modal-canvas');
        var ctx = canvas.getContext('2d');
        cleanPreview(canvas);
        var size = 12;
        ctx.fillStyle = '#FFFFFF';

        var image = document.createElement('img');

        ctx.font = size + 'px Arial';

        image.onload = function() {
            fillBox(ctx, image);
        };

        image.src = "images/workflow/stepBox.png";
    }

    function cleanPreview(canvas){

        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }  
}