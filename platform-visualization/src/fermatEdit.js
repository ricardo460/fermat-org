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

    var self = this;


    /**
     * @author Ricardo Delgado
     */
    this.init = function(){
        createButton();
        
    };

    function createButton(){

        var button,
            text,
            x,
            type;

            createSesionPlatform();
            createSesionType();
            createSesionName();
            createSesionAutor();
            createSesionDifficulty();
            createSesionMaintainer();
            createSesionState();
            createbutton();
            
        function createSesionPlatform(){

            var id = 'label-Platform'; text = 'Select the Platform : '; type = 'label';

            addFields(id, text, null, type);

            id = 'select-Platform'; text = ''; type = 'select';

            addFields(id, text, null, type);

            var optgroup = "<optgroup label = Platform>",
                option = "";

            for(var i in groups){

                if(i != "size"){
    
                    option += "<option value = "+i+">"+i+"</option>";
                }

            }

            optgroup += option + "</optgroup>";

            option = "";

            optgroup += "<optgroup label = superLayer>";

            for(var i in superLayers){

                if(i != "size"){

                    option += "<option value = "+i+">"+i+"</option>";
                }

            }

            optgroup += option + "</optgroup>";

            $("#"+id).html(optgroup);

            createSesionLayer();

            changeSesionLayer(document.getElementById(id).value);

            $("#"+id).change('click', function() {
            
                changeSesionLayer(document.getElementById(id).value);
            });
        }

        function createSesionLayer(){

            var id = 'label-layer'; text = 'Select the Layer : '; type = 'label';

            addFields(id, text, 15, type);

            id = 'select-layer'; text = ''; type = 'select';

            addFields(id, text, null, type);
          
        }

        function changeSesionLayer(platform){

            var state = false;

            if(typeof groups[platform] === 'undefined')
                state = platform;

            var _layers = CLI.query(window.layers,function(el){return (el.super_layer === state)});

            var option = "";

            for(var i = 0;i < _layers.length; i++){

                option += "<option value = "+_layers[i]+">"+_layers[i]+"</option>";

            }

            $("#select-layer").html(option);          
        }

        function createSesionType(){

            var id = 'label-Type'; text = 'Select the Type : '; type = 'label';

            addFields(id, text, 15, type);

            id = 'select-Type'; text = ''; type = 'select';

            addFields(id, text, null, type);

            var option = "";

            option += "<option value = addon>Addon</option>";
            option += "<option value = android>Android</option>";
            option += "<option value = library>Library</option>";
            option += "<option value = plugin>Plugin</option>";


            $("#"+id).html(option);

        }

        function createSesionName(){

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

        function createSesionAutor(){

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

        function createSesionDifficulty(){

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

        function createSesionMaintainer(){

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

        function createSesionState(){

            var id = 'label-State'; text = 'Select the State : '; type = 'label';

            addFields(id, text, 15, type);

            id = 'select-State'; text = ''; type = 'select';

            addFields(id, text, null, type);

            var option = "";

            option += "<option value = concept>concept</option>";
            option += "<option value = development>development</option>";
            option += "<option value = production>production</option>";
            option += "<option value = qa>qa</option>";

            $("#"+id).html(option);

        }

        function createbutton(){

            var id = 'button-save'; text = 'Save'; type = 'button';

            var button = addFields(id, text, 20, type, 2);

            button.className = 'actionButton';
        }
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
    };

    function createDiv(row){

        var div = document.createElement('div');

        div.id = 'div-Edit' + row;

        document.body.appendChild(div);

        objects['row' + row].div = 'div-Edit' + row;

        window.helper.show(div, 1000);


    }

}
//funcion para ver las capas CLI.query(layers,function(el){return (el.super_layer === false)})
//groups platform
//superLayers super layer Autor del componente.