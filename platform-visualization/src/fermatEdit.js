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
            }
        };

    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;

    var button,
        text,
        x,
        type;

    var self = this;

    /**
     * @author Ricardo Delgado
     */
    this.init = function(){

            sesionPlatform();
            sesionType();
            sesionName();
            sesionAutor();
            sesionDifficulty();
            sesionMaintainer();
            sesionState();
            createbutton();
    };


    function sesionPlatform(){

        var id = 'label-Platform'; text = 'Select the Platform : '; type = 'label';

        addFields(id, text, null, type);

        id = 'select-Platform'; text = ''; type = 'select';

        addFields(id, text, null, type);

        var optgroup = "<optgroup label = Platform>",
            option = "";


        for(var i in groups){

            if(i != "size"){

                option += "<option value = "+i+" >"+i+"</option>";
            }

        }

        optgroup += option + "</optgroup>";

        option = "";

        optgroup += "<optgroup label = superLayer>";

        for(var i in superLayers){

            if(i != "size"){

                option += "<option value = "+i+" >"+i+"</option>";
            }

        }

        optgroup += option + "</optgroup>";

        $("#"+id).html(optgroup);

        sesionLayer();

        changeLayer(document.getElementById(id).value);

       $("#"+id).change('click', function() {
        
            changeLayer(document.getElementById(id).value);
        });
    }

    function sesionLayer(){

        var id = 'label-layer'; text = 'Select the Layer : '; type = 'label';

        addFields(id, text, 15, type);

        id = 'select-layer'; text = ''; type = 'select';

        addFields(id, text, null, type);
      
    }

    function changeLayer(platform){

        var state = false;

        if(typeof groups[platform] === 'undefined')
            state = platform;

        var _layers = CLI.query(window.layers,function(el){return (el.super_layer === state)});

        var option = "";

        for(var i = 0;i < _layers.length; i++){

            option += "<option value = '"+_layers[i]+"' >"+_layers[i]+"</option>";

        }

        $("#select-layer").html(option);          
    }

    function sesionType(){

        var id = 'label-Type'; text = 'Select the Type : '; type = 'label';

        addFields(id, text, 15, type);

        id = 'select-Type'; text = ''; type = 'select';

        addFields(id, text, null, type);

        var option = "";

        option += "<option value = Addon>Addon</option>";
        option += "<option value = Android>Android</option>";
        option += "<option value = Library>Library</option>";
        option += "<option value = Plugin>Plugin</option>";


        $("#"+id).html(option);

    }

    function sesionName(){

        var id = 'label-Name'; text = 'Enter Name : '; type = 'label';

        addFields(id, text, null, type, 2);

        idSucesor = objects.row2.buttons[objects.row2.buttons.length - 1].id;

        var object = {
            id : "imput-Name",
            text : "textfield"
          };

        var imput = $('<input />', {"id" : object.id, "type" : "text", "text" : object.text });

        $("#"+objects.row2.div).append(imput);

        var button = document.getElementById(object.id);

        sucesorButton = document.getElementById(idSucesor);
              
        button.placeholder = 'Component Name';      
        button.style.position = 'absolute';
        button.style.top = objects.row2.y + 'px';
        button.style.left = (sucesorButton.offsetLeft + sucesorButton.clientWidth + 5) + 'px';
        button.style.zIndex = 10;
        button.style.opacity = 0;

        window.helper.show(button, 1000);

        objects.row2.buttons.push(object);

    }

    function sesionAutor(){

        var id = 'label-Autor'; text = 'Enter Autor : '; type = 'label';

        addFields(id, text, 15, type, 2);

        idSucesor = objects.row2.buttons[objects.row2.buttons.length - 1].id;

        var object = {
            id : "imput-autor",
            text : "textfield"
          };

        var imput = $('<input />', {"id" : object.id, "type" : "text", "text" : object.text });

        $("#"+objects.row2.div).append(imput);

        var button = document.getElementById(object.id);

        sucesorButton = document.getElementById(idSucesor);

        button.placeholder = 'Github User';     
        button.style.position = 'absolute';
        button.style.top = objects.row2.y + 'px';
        button.style.left = (sucesorButton.offsetLeft + sucesorButton.clientWidth + 5) + 'px';
        button.style.zIndex = 10;
        button.style.opacity = 0;

        button.addEventListener('blur', function() {

        });

        window.helper.show(button, 1000);

        objects.row2.buttons.push(object);

    }

    function sesionDifficulty(){

        var id = 'label-Difficulty'; text = 'Select Difficulty : '; type = 'label';

        addFields(id, text, 15, type);

        id = 'select-Difficulty'; text = ''; type = 'select';

        addFields(id, text, null, type);

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

    }

    function sesionMaintainer(){

        var id = 'label-Maintainer'; text = 'Enter Maintainer : '; type = 'label';

        addFields(id, text, 15, type, 2);

        idSucesor = objects.row2.buttons[objects.row2.buttons.length - 1].id;

        var object = {
            id : "imput-Maintainer",
            text : "textfield"
          };

        var imput = $('<input />', {"id" : object.id, "type" : "text", "text" : object.text });

        $("#"+objects.row2.div).append(imput);

        var button = document.getElementById(object.id);

        sucesorButton = document.getElementById(idSucesor);
              
        button.placeholder = 'Github User';      
        button.style.position = 'absolute';
        button.style.top = objects.row2.y + 'px';
        button.style.left = (sucesorButton.offsetLeft + sucesorButton.clientWidth + 5) + 'px';
        button.style.zIndex = 10;
        button.style.opacity = 0;

        window.helper.show(button, 1000);

        objects.row2.buttons.push(object);

    }

    function sesionState(){

        var id = 'label-State'; text = 'Select the State : '; type = 'label';

        addFields(id, text, 15, type);

        id = 'select-State'; text = ''; type = 'select';

        addFields(id, text, 8, type);

        var option = "";

        option += "<option value = concept>Concept</option>";
        option += "<option value = development>Development</option>";
        option += "<option value = production>Production</option>";
        option += "<option value = qa>QA</option>";

        $("#"+id).html(option);

    }

    function createbutton(){

        var id = 'button-save'; text = 'Save'; type = 'button';

        var button = addFields(id, text, 20, type, 2);

        button.className = 'actionButton';

        
        button.addEventListener('click', function() {

                    self.removeAllFields();
        });

    }

    function addFields(id, text, _x, _type, _row){

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

    function createDiv(row){

        var div = document.createElement('div');

        div.id = 'div-Edit' + row;

        document.body.appendChild(div);

        objects['row' + row].div = 'div-Edit' + row;

        window.helper.show(div, 1000);

    }

    function fillFields(id){

        var tile = window.table[id]; 

        if(tile.group != undefined)
            document.getElementById('select-Platform').value = tile.group;

        changeLayer(document.getElementById('select-Platform').value);

        if(tile.layer != undefined)        
            document.getElementById('select-layer').value = tile.layer;

        if(tile.type != undefined){
            document.getElementById('select-Type').value = tile.type;
            console.log(tile.type);
        }

        if(tile.difficulty != undefined)
            document.getElementById('select-Difficulty').value = tile.difficulty; 

        if(tile.code_level != undefined)
            document.getElementById('select-State').value = tile.code_level; 

        if(tile.name != undefined)
            document.getElementById('imput-Name').value = tile.name;         
        
        if(tile.author != undefined)
            document.getElementById('imput-autor').value = tile.author; 

        if(tile.maintainer != undefined)
            document.getElementById('imput-Maintainer').value = tile.maintainer; 

        console.log(id) 
       ;
    }

    this.createButtonAction = function(){

        self.removeAllFields();
        buttonsManager.createButtons('buttonNew', 'New Component', self.init);
        
    }

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
        }
    };

    this.addButtonEdit = function(id){
        self.removeAllFields();

        buttonsManager.createButtons('buttonEdit', 'Edit Component', function (){

            self.init();

            fillFields(id);
        });
    }

}


