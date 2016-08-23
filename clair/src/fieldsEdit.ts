/**
 * @author Ricardo Delgado
 */
class FieldsEdit {

    objects : any = {
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
        idFields: {}
    };
    actions = { 
        exit : null,
        type : null
    };
    actualTile = null;
    actualFlow = null;
    DATA_USER = globals.api.listDevs;
    button;
    text;
    x;
    type;

    removeAllFields() : void{

        if(this.objects.row1.buttons.length !== 0 || this.objects.row2.buttons.length !== 0){

            let row = 'row1';

            if(this.objects[row].buttons.length === 0)
                row = 'row2';

            let actualButton = this.objects[row].buttons.shift();

            if( $('#'+actualButton.id) != null ) 
                Helper.hide($('#'+actualButton.id), 1000); 
            
                this.removeAllFields();
        }
        else {

            if( $('#'+this.objects.row1.div) != null ) 
                Helper.hide($('#'+this.objects.row1.div), 1000);

            if( $('#'+this.objects.row2.div) != null ) 
                Helper.hide($('#'+this.objects.row2.div), 1000);

            this.objects.row1.div = null;
            this.objects.row2.div = null;
            this.objects.idFields = {};

            if(document.getElementById("hidden-area"))
                Helper.hide('hidden-area', 1000);

            if(globals.actualView === 'table'){ 

                this.actualTile = null;

                globals.tableEdit.formerName = null;
                
                globals.tableEdit.deleteMesh();

                if(globals.camera.getFocus() === null)
                    globals.tableEdit.addButton();              

                if(typeof(this.actions.exit) === 'function'){
                    this.actions.exit();
                    this.actions.exit = null;
                }
            }
            else if(globals.actualView === 'workflows'){
                    
                this.actualFlow = null;
                    
                globals.tableEdit.deleteMesh();

                if(globals.camera.getFocus() === null)
                    globals.workFlowEdit.addButton();              

                if(typeof(this.actions.exit) === 'function'){
                    this.actions.exit();
                    this.actions.exit = null;
                }
            }

        }
    };

    createField(id : string, text : string, _x = 5, _type = 'button', _row = '1') : HTMLElement {

        let object = {
            id : id,
            text : text
          };

        let x = _x,
            type = _type,
            idSucesor = "backButton",
            row = _row;

        if( this.objects['row' + row].div === null)
            this.createDiv(row);

        if(this.objects['row' + row].buttons.length !== 0)
            idSucesor = this.objects['row' + row].buttons[this.objects['row' + row].buttons.length - 1].id;

        let div = document.getElementById(this.objects['row' + row].div);

        let button = document.createElement(type),
            sucesorButton = document.getElementById(idSucesor);
                  
        button.id = id;
        button.className = 'edit-Fermat';
        button.innerHTML = text;
        button.style.zIndex = '10';
        button.style.opacity = '0';

        div.appendChild(button);

        this.objects['row' + row].buttons.push(object);

        Helper.show(button, 1000);

        return button;
    };

    createDiv(row : string) : void{ 

        let div = document.createElement('div');
        div.id = 'div-Edit' + row;
        document.body.appendChild(div);
        this.objects['row' + row].div = 'div-Edit' + row;
        Helper.show(div, 1000);
    };

    setTextSize() : void { 
        
        let object = {
            id : "fermatEditStyle",
            text : "style"
          };

        this.objects.row2.buttons.push(object);

        let windowWidth  = window.innerWidth;
        let size         = windowWidth * 0.009;
        let style        = document.createElement("style");
        let styleSheet   = ".edit-Fermat {font-size:"+size+"px;}";
        let node         = document.createTextNode(styleSheet);
        
        style.appendChild(node);
        document.body.appendChild(style);  
    };

    createFieldTableEdit() : void {

        this.sesionGroup();
        this.sesionType();
        this.sesionName();
        //sesionRepoDir();
        this.sesionDifficulty();
        this.sesionDescription();
        this.sesionState();
        this.sesionAuthor();
        this.createbutton(function(){
            this.actions.exit = null;
            globals.tableEdit.saveTile();  
        });
        this.setTextSize();
    };

    createFieldWorkFlowEdit() : void{
        this.workflowHeader();
        this.workflowDescription();
        this.createStepsList();
        this.createModeEdit();
    };

    changeLayer(platform : string) : void {

        let state = 'false';

        if(typeof globals.platforms[platform] === 'undefined')
            state = platform;

        let _layers = CLI.query(globals.layers, (el) => {
            return (typeof (el) !== "function" && el.super_layer.toString() === state.toString());
        });

        let option = "";

        for(let i = 0;i < _layers.length; i++){
            option += "<option value = '"+_layers[i]+"' >"+_layers[i]+"</option>";
        }

        $("#select-layer").html(option);  
        
    };

    disabledButtonSave(state : boolean) : void {

        let button = document.getElementById('button-save') as HTMLButtonElement;

        if(state){
            button.innerHTML  = "Saving...";
            button.disabled = true;
        }
        else{
            button.innerHTML  = "Save";
            button.disabled = false;
        }
    };
    
    getData() : any {
        
        let title = document.getElementById("workflow-header-title") as HTMLInputElement;
        let desc = document.getElementById("modal-desc-textarea") as HTMLInputElement;
        let platform = document.getElementById("workflow-header-plataform") as HTMLInputElement;
        
        let json = {
            "platfrm": platform.value,
            "name": title.value,
            "desc": desc.value,
            "prev": null,
            "next": null,
            "steps": []
        };

        return json;
    };
    
    setSelectImages(select : HTMLSelectElement) : void {
        select.style.backgroundSize = select.offsetHeight + "px";
        select.style.width = select.offsetWidth + select.offsetHeight + "px";  
    }

    sesionGroup() : void {

        let id = 'label-Group',
            text = 'Select the Group : ',
            type = 'label';

        this.createField(id, text, null, type);
        id = 'select-Group'; text = ''; type = 'select';
        this.createField(id, text, null, type);
        let optgroup = "<optgroup label = Platform>",
            option = "";

        this.objects.idFields.group = id;

        for(let i in globals.platforms){ 
            if(i != "size"){
                option += "<option value = "+i+" >"+i+"</option>";
            }
        }

        optgroup += option + "</optgroup>";
        option = "";
        optgroup += "<optgroup label = superLayer>";

        for(let _i in globals.superLayers){
            if(_i != "size"){
                option += "<option value = "+_i+" >"+_i+"</option>";
            }
        }

        optgroup += option + "</optgroup>";
        $("#"+id).html(optgroup);
        this.sesionLayer();
        this.changeLayer((document.getElementById(id) as HTMLInputElement).value);
       $("#"+id).change('click', () => {
        
            this.changeLayer((document.getElementById(id) as HTMLInputElement).value);
            globals.tableEdit.changeTexture();
        });
        
        this.setSelectImages(document.getElementById(id) as HTMLSelectElement);
    }

    sesionLayer() : void{

        let id = 'label-layer',
            text = 'Select the Layer : ',
            type = 'label';

        this.createField(id, text, 15, type);
        id = 'select-layer'; text = ''; type = 'select';
        this.createField(id, text, null, type);
        this.objects.idFields.layer = id;
        $("#"+id).change('click', () => {
            globals.tableEdit.changeTexture();
        });
        this.setSelectImages(document.getElementById(id) as HTMLSelectElement);
    }

    sesionType() : void{

        let id = 'label-Type',
            text = 'Select the Type : ',
            type = 'label';

        this.createField(id, text, 15, type);
        id = 'select-Type'; text = ''; type = 'select';
        this.createField(id, text, null, type);
        this.objects.idFields.type = id;        
        let option = "";
        option += "<option value = Addon>Addon</option>";
        option += "<option value = Android>Android</option>";
        option += "<option value = Library>Library</option>";
        option += "<option value = Plugin>Plugin</option>";
        $("#"+id).html(option);
        $("#"+id).change('click', () => {
            globals.tableEdit.changeTexture();
        });
        
        this.setSelectImages(document.getElementById(id) as HTMLSelectElement);
    }

    sesionName() : void {

        let id = 'label-Name',
            text = 'Enter Name : ',
            type = 'label';

        this.createField(id, text, null, type, '2');
        let idSucesor = this.objects.row2.buttons[this.objects.row2.buttons.length - 1].id;
        let object = {
            id : "imput-Name",
            text : "textfield"
          };
        this.objects.idFields.name = object.id;
        let imput = $('<input />', {"id" : object.id, "type" : "text", "text" : object.text });
        $("#"+this.objects.row2.div).append(imput);
        let button = document.getElementById(object.id) as HTMLInputElement;
        let sucesorButton = document.getElementById(idSucesor);
        button.className = 'edit-Fermat';
        button.placeholder = 'Component Name';
        button.style.zIndex = '10';
        button.style.opacity = '0';

        Helper.show(button, 1000);
        this.objects.row2.buttons.push(object);
        button.addEventListener('blur', () => {
            globals.tableEdit.changeTexture();
        });
    }
    
    sesionAuthor() : void {
        
        let idSucesor = this.objects.row2.buttons[this.objects.row2.buttons.length - 1].id;

        let object = {
            id : "button-author",
            text : "button"
        };
        
        this.objects.idFields.author = object.id;
        let input = $('<input />', {"id" : object.id, "type" : "button", "text" : object.text });
        $("#"+this.objects.row2.div).append(input);
        this.objects.row2.buttons.push(object);
        let button = document.getElementById(object.id) as HTMLButtonElement;
        
        button.className = 'actionButton edit-Fermat';
        button.style.zIndex = '10';
        button.style.opacity = '0';
        button.value = "Authors";
        button.style.marginLeft = "5px";

        object = {
            id : "modal-devs",
            text : "modal"
        };

        this.objects.row2.buttons.push(object);
        
        // Modal
        // START
        
        if(!document.getElementById("modal-devs")){
            
            let modal : any = document.createElement("div");
            modal.id            = "modal-devs";
            modal.style.left    = (window.innerWidth/2-227)+"px";
            modal.style.top     = (window.innerHeight/2-186)+"px";
            
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
                
                let cont_list = document.getElementById("cont-devs");
                cont_list.innerHTML = "";
                let finder = document.getElementById("finder-input") as HTMLInputElement;
                
                for(let i = 0; i < this.DATA_USER.length; i++) {
                    let filt = this.DATA_USER[i].usrnm.search(finder.value);
                    
                    if(filt != -1) {
                        let img_src;
                        if(this.DATA_USER[i].avatar_url)
                            img_src = this.DATA_USER[i].avatar_url;
                        else
                            img_src = "images/modal/avatar.png";

                        let usr_html  = '<div class="dev-fermat-edit">'+
                                            '<div>'+
                                                '<img crossorigin="anonymous" src="'+img_src+'">'+
                                                '<label>'+this.DATA_USER[i].usrnm+'</label>'+
                                                '<button data-usrid="'+this.DATA_USER[i].usrnm+'" class="add_btn"></button>'+
                                            '</div>'+
                                        '</div>';

                        cont_list.innerHTML += usr_html;
                    }
                }
                
                let list_btn = document.getElementsByClassName("add_btn") as NodeListOf<HTMLButtonElement>;
                
                function btnOnclickAccept() {
                        
                        let modal : any = document.getElementById("modal-devs");
                        modal.value[modal.value.length] = {
                            dev: this.DATA_USER.find((x) => {
                                if(x.usrnm == this.dataset.usrid)
                                    return x;
                            }),
                            scope: "implementation",
                            role: "author",
                            percnt: 100
                        };
                        
                        modal.updateModal();
                }

                
                for(let i = 0; i < list_btn.length; i++) {
                    let btn = list_btn[i];
                    btn.onclick = btnOnclickAccept;
                }
                
                cont_list = document.getElementById("cont-devs-actives");
                cont_list.innerHTML = "";
                
                for(let i = 0; i < this.value.length; i++) {
                    
                    let img_src1;
                    
                    if(this.value[i].dev.avatar_url)
                        img_src1 = this.value[i].dev.avatar_url;
                    else
                        img_src1 = "images/modal/avatar.png";
                    
                    let dev_html = ''+
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
                
                let devDiv = document.getElementsByClassName("dev-active") as any;

                for(let i=0; i < devDiv.length; i++) {

                    let div = devDiv[i];
                    let dev     = modal.value[div.dataset.usrid];
                    
                    let role    = div.getElementsByClassName("select-role")[0];
                    let scope   = div.getElementsByClassName("select-scope")[0];
                    let prc     = div.getElementsByClassName("input-prcnt")[0];
                    prc.value   = dev.percnt;
                    scope.value = dev.scope;
                    role.value  = dev.role;
                    
                }
                
                list_btn = document.getElementsByClassName("rem_btn") as NodeListOf<HTMLButtonElement>;
                
                function btnOnclickRemove() {

                    let modal = document.getElementById("modal-devs") as any;
                    modal.value.splice(this.dataset.usrid, 1);
                    modal.updateModal();

                }
                
                for(let i = 0; i < list_btn.length; i++) {
                    let btn1 = list_btn[i];

                    btn1.onclick = btnOnclickRemove;

                }
                
                let list_dev = document.getElementsByClassName("dev-active");
                
                
                function dev_onmouseout() {
                    this.dataset.expand = "false";

                    let selectRole = this.getElementsByClassName("select-role")[0].value;
                    let selectScope = this.getElementsByClassName("select-scope")[0].value;
                    let inputPrcnt = this.getElementsByClassName("input-prcnt")[0].value;

                    modal.value[this.dataset.usrid].role = selectRole;
                    modal.value[this.dataset.usrid].scope = selectScope;
                    modal.value[this.dataset.usrid].percnt = inputPrcnt;
                }
                
                function dev_onmouseover() {
                    this.dataset.expand = "true";
                }
                
                for(let i = 0; i < list_dev.length; i++) {
                    let dev1 = list_dev[i] as any;
                    dev1.onmouseover = dev_onmouseover;
                    dev1.onmouseout = dev_onmouseout;
                }
            };
            
            document.body.appendChild(modal);
            let finder = document.getElementById("finder-input");
            finder.onkeyup = () => {
                (document.getElementById("modal-devs") as any).updateModal();
            };
        }
        
        
        // END
        

        button.addEventListener('click', function() {
            
            let modal = document.getElementById("modal-devs") as any;
            modal.dataset.state = "show";
            modal.updateModal();
            let area = document.createElement("div");
            area.id = "hidden-area";
            document.body.appendChild(area);
            Helper.show(area, 1000);
            
        });
        
        document.getElementById("modal-close-button").addEventListener("click", function() {
            
            let modal = document.getElementById("modal-devs") as any;
            modal.dataset.state = "hidden";
            let area = document.getElementById("hidden-area");
            Helper.hide(area, 500);
            globals.tableEdit.changeTexture();
            
        });
        
        document.getElementById("modal-accept-button").addEventListener("click", function() {
            
            let modal = document.getElementById("modal-devs") as any;
            modal.dataset.state = "hidden";
            
            //update data of devs (modal.value)
            
            let devDiv = document.getElementsByClassName("dev-active");
            
            for(let i=0; i < devDiv.length; i++) {
                
                let div = devDiv[i] as any;
                
                let selectRole = (div.getElementsByClassName("select-role")[0] as HTMLInputElement).value;
                let selectScope = (div.getElementsByClassName("select-scope")[0] as HTMLInputElement).value;
                let inputPrcnt = (div.getElementsByClassName("input-prcnt")[0] as HTMLInputElement).value;

                modal.value[div.dataset.usrid].role = selectRole;
                modal.value[div.dataset.usrid].scope = selectScope;
                modal.value[div.dataset.usrid].percnt = inputPrcnt;
                
            }
            
            //---------------------------------
            
            let area = document.getElementById("hidden-area");
            Helper.hide(area, 500);
            globals.tableEdit.changeTexture();
            
        });

        Helper.show(button, 1000);
    }

    sesionDifficulty() : void{

        let id = 'label-Difficulty',
            text = 'Select Difficulty : ',
            type = 'label';

        this.createField(id, text, 15, type);

        id = 'select-Difficulty'; text = ''; type = 'select';

        this.createField(id, text, null, type);

        this.objects.idFields.difficulty = id;

        let option = "";

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
        
            globals.tableEdit.changeTexture();
        });
        
        this.setSelectImages(document.getElementById(id) as HTMLSelectElement);
    }

    sesionDescription() : void{
        
        let idSucesor = this.objects.row2.buttons[this.objects.row2.buttons.length - 1].id;

        let object = {
            id : "button-desc",
            text : "Description"
          };

        this.objects.idFields.maintainer = object.id;

        let input = $('<input />', {"id" : object.id, "type" : "button", "text" : object.text });

        $("#"+this.objects.row2.div).append(input);

        let button = document.getElementById(object.id) as HTMLInputElement;
        
        button.className = 'actionButton edit-Fermat';
        button.value = "Description";
        button.style.marginLeft = "5px";
        button.style.zIndex = '10';
        button.style.opacity = '0';
        
        this.objects.row2.buttons.push(object);

        object = {
            id : "modal-desc",
            text : "modal"
        };

        this.objects.row2.buttons.push(object);
        

        Helper.show(button, 1000);
        
        if(!document.getElementById("modal-desc")) {
            
            let modal = document.createElement("div") as any;
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
            
            let modal = document.getElementById("modal-desc") as any;
            modal.dataset.state = "show";
            
            modal.oldValue = (document.getElementById("modal-desc-textarea") as any).value;
            
            let area = document.createElement("div");
            area.id = "hidden-area";
            document.body.appendChild(area);
            Helper.show(area, 1000);
            
        });
        
        document.getElementById("modal-desc-cancel").onclick = function() {
            
            let modal = document.getElementById("modal-desc") as any;
            modal.dataset.state = "hidden";
            (document.getElementById("modal-desc-textarea") as any).value = modal.oldValue;
            
            let area = document.getElementById("hidden-area");
            Helper.hide(area, 500);
            
        };
        
        document.getElementById("modal-desc-accept").addEventListener("click", function() {
            
            let modal = document.getElementById("modal-desc") as any;
            modal.dataset.state = "hidden";
            
            let area = document.getElementById("hidden-area");
            Helper.hide(area, 500);
            
        });
    }

    sesionState() : void {

        let id = 'label-State',
            text = 'Select the State : ',
            type = 'label';

        this.createField(id, text, 15, type);

        id = 'select-State'; text = ''; type = 'select';

        this.createField(id, text, 8, type);

        this.objects.idFields.state = id;

        let option = "";

        option += "<option value = concept>Concept</option>";
        option += "<option value = development>Development</option>";
        option += "<option value = production>Production</option>";
        option += "<option value = qa>QA</option>";

        $("#"+id).html(option);

        $("#"+id).change('click', function() {
        
            globals.tableEdit.changeTexture();
        });
        
        this.setSelectImages(document.getElementById(id) as HTMLSelectElement);
    }

    createbutton(callback : () => void) : void {
        
        let id = 'button-save', text = 'Save', type = 'button';
        
        globals.buttonsManager.createButtons(id, text, function(){

            if(typeof(callback) === 'function')
                callback();          

        }, null, null, "right");
    }

    workflowHeader() : void {
        
        if(!document.getElementById("workflow-header")) {
            
            let div = document.createElement("div");
            div.id = "workflow-header";
            div.innerHTML += '<label> Title: </label>';
            div.innerHTML += '<input id="workflow-header-title" class="edit-Fermat" placeholder="Title" type="text" maxlength="68"></input>';
            div.innerHTML += '<label> Select the Group : </label>';
            let select = document.createElement("select");
            select.id = "workflow-header-plataform";
            select.className = "edit-Fermat";

            let object = {
                id : "workflow-header",
                text : "workflow-header"
            };

            this.objects.row1.buttons.push(object);
  
            let optgroup = "<optgroup label = Platform>",
            option = "";

            for(let i in globals.platforms){ 

                if(i != "size"){

                    option += "<option value = "+i+" >"+i+"</option>";
                }

            }

            optgroup += option + "</optgroup>";

            option = "";

            optgroup += "<optgroup label = superLayer>";

            for(let _i in globals.superLayers){

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
               globals.workFlowEdit.changeTexture();
            });
            
            this.setSelectImages(document.getElementById("workflow-header-plataform") as HTMLSelectElement);
        }   
    }
    
    workflowDescription() : void {

        let div = document.createElement("div");
        div.id = "workflow-modal-desc";
        let modal = document.createElement("div") as any;
        modal.id = "modal-desc";
        modal.style.top = (window.innerHeight / 4) + "px" ;
        modal.dataset.state = "hidden";

        let object = {
            id : "workflow-modal-desc",
            text : "workflow-header"
        };

        this.objects.row1.buttons.push(object);

        modal.innerHTML = ''+
            '<label>Description:</label>'+
            '<textarea id="modal-desc-textarea" rows="12" maxlength="280"></textarea>'+
            '<div>'+
                '<button id="modal-desc-cancel">Cancel</button>'+
                '<button id="modal-desc-accept">Accept</button>'+
            '</div>';
        
        div.appendChild(modal);
        document.body.appendChild(div);
        
        let button = document.getElementById("workflow-header-description");
        
        button.addEventListener('click', () => {
            
            let modal = document.getElementById("modal-desc") as any;
            modal.dataset.state = "show";
            
            modal.oldValue = (document.getElementById("modal-desc-textarea") as HTMLInputElement).value;
            
            let area = document.createElement("div");
            area.id = "hidden-area";
            document.body.appendChild(area);
            Helper.show(area, 1000);
            
        });
        
        document.getElementById("modal-desc-cancel").onclick = () => {
            let modal = document.getElementById("modal-desc") as any;
            modal.dataset.state = "hidden";
            (document.getElementById("modal-desc-textarea") as HTMLInputElement).value = modal.oldValue;
            
            let area = document.getElementById("hidden-area");
            Helper.hide(area, 500);
            
        };
        
        document.getElementById("modal-desc-accept").addEventListener("click", () => {
            let modal = document.getElementById("modal-desc") as any;
            modal.dataset.state = "hidden";
            
            let area = document.getElementById("hidden-area");
            Helper.hide(area, 500);
            
            globals.workFlowEdit.changeTexture();
        });
    }
    
    showLineSelectType(array, select, mouse, callback) {

        let div = document.getElementById("modal-call");

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

        let _select = document.getElementById("modal-call-select_") as HTMLInputElement;

        _select.innerHTML = "";
            
        for(let i = 0; i < array.length; i++){ 

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

    showModal(step, missing) {

        let div = document.getElementById("step-modal");

        let title = step.title[0],
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
            
            window.onresize  = () => {
                div.style.width = (div.offsetHeight * 0.9) + "px";
            };
            
            window.onresize(undefined);
        }
        else{

            b1 = document.getElementById("step-modal-accept");
            b2  = document.getElementById("step-modal-cancel");
        }

        if(missing)
            (document.getElementById("step-error") as any).dataset.state = "show";

        _title = document.getElementById("step-modal-title");
        _desc  = document.getElementById("step-modal-desc");

        _title.value = title;
        _desc.value  = desc;

        b1.onclick = function() {
            step.title[0] = _title.value;
            step.desc[0] = _desc.value;
            globals.dragManager.functions.DROP = [];
            globals.fieldsEdit.hiddenModal();
        };
        
        b2.onclick = function() {
            globals.dragManager.functions.DROP = [];
            globals.fieldsEdit.hiddenModal();
        };

        _title.addEventListener('blur', function() {

            this.workflowPreview(step);

            if(_title.value === '')
                (document.getElementById("step-error").dataset as any).state = "show";
            else
                (document.getElementById("step-error").dataset as any).state = "hidden";
        });

        _desc.addEventListener('blur', function() {
            this.workflowPreview(step);
        });

        this.workflowPreview(step);
    };

    setModeEdit(mode, buttonRight, ButtonsLeft){

        let div = document.getElementById("header-text");

        let right = document.getElementById("header-next"),
            left = document.getElementById("header-back");

        if(div){
            div.innerHTML = mode;

            if(buttonRight){
                Helper.show(right, 500, function(){
                    right.style.opacity = "";
                    right.style.transition = "";
                });
            }
            else{
                Helper.hide(right, 500, true);
            }

            if(ButtonsLeft){
                Helper.show(left, 500, function(){
                    left.style.opacity = "";
                    left.style.transition = "";
                });
            }
            else{
                Helper.hide(left, 500, true);
            }
        }
    };
 
    createModeEdit(){

        let div = document.getElementById("workflow-mode");

        if(!div){ 

            let object = {
                id : "workflow-mode",
                text : ""
            };

            this.objects.row1.buttons.push(object);

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
                let cont = document.getElementById("header-container");
                cont.style.height = cont.offsetWidth/5.6 + "px";
                document.getElementById("header-text").style.lineHeight = (cont.offsetWidth/5.6) + "px";
            };
            
            
            document.body.appendChild(div);
            window.onresize(undefined);
        }
    }

    createStepsList(){

        let div = document.getElementById("steps-list") as any;

        if(!div){ 
        
            div = document.createElement("div");
            div.id  = "steps-list";

            let object = {
                id : "steps-list",
                text : ""
            };

            div.dataset.state = "hidden";

            this.objects.row1.buttons.push(object);
            
            div.innerHTML += 
            `
            <div id="steps-list-content">
            </div>
            <div id="steps-list-expand">
            <button id="steps-expand"></button>
            </div>
            `;
			
			div.addStep = function(i, obj, type) {

				let div = document.createElement('div');
				let div2 = document.createElement('div');
				let close = document.createElement('button');
                let alert = document.createElement('div');
                let foto = document.createElement('div');
				let canvas = document.createElement('canvas') as any;

                canvas.id = 'canvas-step-' + i;
				
				div.className = "steps-list-step";
                alert.className = "steps-alert";
				div2.className = "steps-div-close";
				close.className = "steps-button-close";
				canvas.className = "steps-list-step";

				let ctx = canvas.getContext("2d");

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

				canvas.onclick = () => {

                    if(type === 'edit-step' || type === 'edit-path'){ 

    					let mesh = obj.mesh;

                        let position = mesh.position;

                        globals.camera.move(position.x, position.y, 200, 1500, true);

                        if(type === 'edit-path'){
                            globals.workFlowEdit.changeFocusSteps(obj.order[0]);
                        }

                    }
                    else{

                        let state = obj.state;

                        if(state === 'error'){
                            
                            globals.dragManager.this.objects = dragModeRepared(obj);
                            globals.workFlowEdit.getFocus().data = obj.id;
                            obj.mesh.visible = false;
                            this.hiddenModal();
                        }
                        else{
                            
                            globals.dragManager.this.objects = [];
                            let parent = searchStepParent(obj);
                            let mesh = obj.mesh;
                            mesh.material.map  = globals.workFlowEdit.changeTextureId(obj.id + 1, parent.id + 1);
                            mesh.material.needsUpdate = true;
                            let difference = (globals.TILE_DIMENSION.width - globals.TILE_SPACING) / 2;
                            let tile = Helper.getSpecificTile(obj.element).mesh;

                            let target = Helper.fillTarget(tile.position.x - difference, tile.position.y, tile.position.z + 1, 'table');

                            mesh.position.copy(target.show.position);

                            let position = mesh.position;

                            obj.mesh.visible = true;

                            globals.camera.move(position.x, position.y, 200, 1500, true);
                        }
                    }

                    this.changeFocus(canvas, i);
				};
				
				close.onclick = function () {

                    globals.workFlowEdit.deleteStepList(obj.order[0]);
				};
				
				document.getElementById("steps-list-content").appendChild(div);
				
				canvas.width  = canvas.offsetWidth;
				canvas.height = canvas.offsetHeight;
				ctx.width  = canvas.offsetWidth;
				ctx.height = canvas.offsetHeight;

                this.applyTextureCanvas(ctx, i, "images/workflow/step.png");
			}
            
            document.body.appendChild(div); 

            document.getElementById("steps-list-expand").onclick = function() {

                let element = document.getElementById("steps-list") as any;

                if(element.dataset.state == "hidden") 
                    element.dataset.state = "show"; 
                else 
                    element.dataset.state = "hidden";
            };
        }
        
        function searchStepParent(step){

            let steps = globals.fieldsEdit.this.actualFlow.steps.slice();

            for(let i = 0; i < steps.length; i++){

                let next = steps[i].next;

                for(let l = 0; l < next.length; l++){

                    let _id = parseInt(next[l].id);

                    if(_id === step.id){
                        return steps[i];
                    }
                }
            }

            return false;
        }

        function dragModeRepared(step){

            let steps = globals.fieldsEdit.this.actualFlow.steps.slice();

            let parent = searchStepParent(step);

            let children = validateChildrenTiles() as any;

            let array = [];

            for(let i = 0; i < globals.tilesQtty.length; i++){

                if(globals.tilesQtty[i] !== parent.element && !children.find(function(x){ if(x.element === globals.tilesQtty[i]) return x;})){

                    let tile = Helper.getSpecificTile(globals.tilesQtty[i]).mesh;

                    array.push(tile);
                }
            }

            return array;

            function validateChildrenTiles(){

                let _array = [];

                let children = step.next;

                for(let i = 0; i < steps.length; i++){

                    if(children.find(function(x){ if(parseInt(x.id) === steps[i].id) return x;}))
                        _array.push(steps[i]);
                }

                return _array;
            }
        }
    }

    applyTextureCanvas(ctx, id, src){

        let img = new Image();

        img.src = src;

        img.onload = function() {

            ctx.drawImage(this, ctx.width/2 - 45, ctx.height/2 - 45, 90, 90);

            ctx.font = "60px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(id, ctx.width/2, ctx.height/2 + 21);
        };
    }

    changeFocus(canvas, id){

        if(canvas){ 
            if(canvas.dataset.state === "false"){ 
                let ctx = canvas.getContext("2d");
                this.applyTextureCanvas(ctx, id, "images/workflow/stepF.png");
                let count = $("#steps-list-content canvas").length;

                for(let i = 1; i <= count; i++){
                    let _canvas = document.getElementById('canvas-step-' + i) as any;
                    if(_canvas.dataset.state === "true"){
                        let _ctx = _canvas.getContext("2d");
                        this.cleanPreview(_canvas);
                        this.applyTextureCanvas(_ctx, i, "images/workflow/step.png");
                        _canvas.dataset.state = false;
                    }
                }
                canvas.dataset.state = true;
            }
        }
    }
    
    hiddenStepsList (state, duration) {

        duration = duration || 500;

        if(state){
            Helper.show(document.getElementById("workflow-mode"), duration);
            Helper.show(document.getElementById("steps-list"), duration);  
        }
        else{
            Helper.hide(document.getElementById("workflow-mode"), duration, true);
            Helper.hide(document.getElementById("steps-list"), duration, true);
        }
    };
    
    hiddenModal(duration) {

        duration = duration || 500;
        Helper.hide(document.getElementById("step-modal"), duration);
        Helper.hide(document.getElementById("modal-call"), duration);
    };

    workflowPreview(steps) {

        let step = steps;

        let fillBox = function(ctx, image) {

            ctx.drawImage(image, 0, 0, 300, 150);

            let mesh = Helper.getSpecificTile(step.tile).mesh;

            let texture = mesh.levels[0].object.material.map.image;

            let img = document.createElement('img');

            img.src = texture.toDataURL("image/png");

            img.onload = function() {
                ctx.drawImage(img, 65, 27, 85, 98);
            };

            //ID
            let Nodeid = step.order[0] as string;
            Nodeid = (parseInt(Nodeid) < 10) ? '0' + Nodeid.toString() : Nodeid.toString();

            let size = 37;
            ctx.font = size + 'px Arial';
            ctx.fillStyle = '#000000';
            Helper.drawText(Nodeid, 16, 90, ctx, 76, size);
            ctx.fillStyle = '#FFFFFF';

            //Title
            size = 8;
            ctx.font = 'bold ' + size + 'px Arial';
            Helper.drawText(step.title[0], 151, 40, ctx, 100, size);

            //Description
            size = 6;
            ctx.font = size + 'px Arial';
            Helper.drawText(step.desc[0], 151, 80, ctx, 100, size);
        };

        let canvas = document.getElementById('step-modal-canvas') as any;
        let ctx = canvas.getContext('2d');
        this.cleanPreview(canvas);
        let size = 12;
        ctx.fillStyle = '#FFFFFF';

        let image = document.createElement('img');

        ctx.font = size + 'px Arial';

        image.onload = function() {
            fillBox(ctx, image);
        };

        image.src = "images/workflow/stepBox.png";
    }

    cleanPreview(canvas){

        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }  
}