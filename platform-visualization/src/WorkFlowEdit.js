function WorkFlowEdit() {

    var actualStepsQtty = 0, target;
    var idSteps = [];

    var actions = { 
        exit : null,
        type : null
    };

    //var idCall = [];

    var flow = {
        _id : null,
        desc : "",
        name : "",
        next: null,
        platfrm : null,
        prev: null,
        steps : [],
        upd_at: null
    };

    var flows = [];

	this.createButtonWorkFlow = function (){
    	
    	var text, button, side;

    	callback = function(){

            actions.type = "insert";

            window.buttonsManager.removeAllButtons();

            //addAllForm();

            drawHeaderFlow(null, addAllForm());
    	};

    	text = 'Add New WorkFlow';
    	button = 'buttonWorkFlowNew';
    	side = 'left';

    	window.buttonsManager.createButtons(button, text, callback, null, null, side);
	};

    this.deleteWorFlowEdit = function (){

        function animate(){

            new TWEEN.Tween(flows[0].objects[0].position)
                .to({
                    x: target.hide.position.x,
                    y: target.hide.position.y,
                    z: target.hide.position.z
                }, 2000)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
        }
        
        animate();

        window.scene.remove(flows[0].objects[0]);    
        flows = [];
    };

	function addAllForm(){

		formPlatform();
		formTitleHeaderFlow();
		formSubTitleHeaderFlow();
		formStepsQttyHeaderFlow();

		$("body").append(document.createElement("br"));

		window.fieldsEdit.setTextSize();

		//Main Element
		function formPlatform(){

            var id = 'label-Platform'; text = 'Select the Platform : '; type = 'label';

            window.fieldsEdit.createField(id, text, null, type, 1);

            id = 'select-Platform'; text = ''; type = 'select';

            window.fieldsEdit.createField(id, text, null, type, 1);
            document.getElementById(id).style.width = '56px';
            var optgroup = "<optgroup label = Platform>",
                option = "";

            window.fieldsEdit.objects.idFields.platform = id;

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

            formLayer();

            changeLayer(document.getElementById(id).value);
        }

        function formLayer(){

            var id = 'label-layer'; text = 'Select the Layer : '; type = 'label';

            window.fieldsEdit.createField(id, text, null, type, 1);

            id = 'select-layer'; text = ''; type = 'select';

            window.fieldsEdit.createField(id, text, null, type, 1);

            window.fieldsEdit.objects.idFields.layer = id;

            document.getElementById(id).style.width = '56px';
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

        function formTitleHeaderFlow(){

			var id = 'label-Title'; text = 'Enter Title : '; type = 'label';

			window.fieldsEdit.createField(id, text, null, type, 1);

			var idSucesor = window.fieldsEdit.objects.row1.buttons[window.fieldsEdit.objects.row1.buttons.length - 1].id;

            var object = {
                id : "imput-Title",
                text : "textfield"
              };

            window.fieldsEdit.objects.idFields.title = object.id;

            var imput = $('<input />', {"id" : object.id, "type" : "text", "text" : object.text });

            $("#"+window.fieldsEdit.objects.row1.div).append(imput);

            var button = document.getElementById(object.id);

            var sucesorButton = document.getElementById(idSucesor);
                  
            button.className = 'edit-Fermat';
            button.placeholder = 'Title Name';
            button.style.zIndex = 10;
            button.style.opacity = 0;

            window.helper.show(button, 1000);

            window.fieldsEdit.objects.row1.buttons.push(object);

            button.addEventListener('blur', function() {
                changeTexture();
            });
		}

		function formSubTitleHeaderFlow(){

			var id = 'label-SubTitle'; text = 'Enter Sub-Title : '; type = 'label';

			window.fieldsEdit.createField(id, text, null, type, 1);

			var idSucesor = window.fieldsEdit.objects.row1.buttons[window.fieldsEdit.objects.row1.buttons.length - 1].id;

            var object = {
                id : "imput-SubTitle",
                text : "textfield"
              };

            window.fieldsEdit.objects.idFields.subTitle = object.id;

            var imput = $('<input />', {"id" : object.id, "type" : "text", "text" : object.text });

            $("#"+window.fieldsEdit.objects.row1.div).append(imput);

            var button = document.getElementById(object.id);

            var sucesorButton = document.getElementById(idSucesor);
                  
            button.className = 'edit-Fermat';
            button.placeholder = 'SubTitle Name';
            button.style.zIndex = 10;
            button.style.opacity = 0;

            window.helper.show(button, 1000);

            window.fieldsEdit.objects.row1.buttons.push(object);

            button.addEventListener('blur', function() {
                changeTexture();
            });
		}

		function formStepsQttyHeaderFlow(){

			var id = 'label-StepsQtty'; text = 'No Steps : '; type = 'label';

			window.fieldsEdit.createField(id, text, null, type, 1);

			var idSucesor = window.fieldsEdit.objects.row1.buttons[window.fieldsEdit.objects.row1.buttons.length - 1].id;

            var object = {
                id : "imput-StepsQtty",
                text : "textfield"
              };

            window.fieldsEdit.objects.idFields.stepsQtty = object.id;

            var imput = $('<input />', {"id" : object.id, "type" : "text", "text" : object.text });

            $("#"+window.fieldsEdit.objects.row1.div).append(imput);

            var button = document.getElementById(object.id);

            var sucesorButton = document.getElementById(idSucesor);
                  
            button.className = 'edit-Fermat';
            button.placeholder = '0';
            button.style.zIndex = 10;
            button.style.opacity = 0;
            button.style.width = '40px';

            window.helper.show(button, 1000);

            window.fieldsEdit.objects.row1.buttons.push(object);

            button.addEventListener('keyup', function(e) {
        		if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105) && e.keyCode != 8 && e.keyCode != 9)
          			e.preventDefault();
                else{
              		if(actualStepsQtty !== parseInt($("#imput-StepsQtty").val())) {

                        creatButtonPreview();

                        /*if(idCall.length > 0)  
                            idCall = [];*/

              			actualStepsQtty = parseInt($("#imput-StepsQtty").val());
              			
              			
              			window.fieldsEdit.objects.row2.buttons = [];

              			if( window.fieldsEdit.objects.row2.div !== null ){

                    		$('#'+window.fieldsEdit.objects.row2.div).remove();
                    		window.fieldsEdit.objects.row2.div = null;
              			}

                        flow.steps = [];
              			for(var i = 1; i <= parseInt($("#imput-StepsQtty").val()); i++){
    					     
                             var steps = {desc: "", element: "", id: 0, layer: "", name: "", next: [], platfrm: "", title: "", type: ""}; 

                             createSteps(i);
                             
                             flow.steps.push(steps);
    					}
              		}
                }
            });
		}

        function creatButtonPreview(){

            var text, button, side;

            var newidSteps = [];

            callback = function(){

                
                if(document.getElementsByName("nameTypeCall").length > 0){ // si existe al mens un type call
                    idSteps = [];
                    
                    for(var i = 0; i < window.fieldsEdit.objects.row2.buttons.length; i++){
                        idSteps[i] = newidSteps;
                        for(var j = 0; j < window.fieldsEdit.objects.row2.buttons[i].elemnt.id.length - 2; j++){
                            idSteps[i][j] = window.fieldsEdit.objects.row2.buttons[i].elemnt.id[j];
                        }
                        newidSteps = [];
                    }

                    fillWorkFlow(); // aqui vamos a llenar todo
                }
            };

            text = 'Preview';
            button = 'buttonPreview';
            side = 'left';

            window.buttonsManager.createButtons(button, text, callback, null, null, side);
        }

		//Second Elements
		function createSteps(i){

			var _valueSteps = ["Title", "SubTitle", "Type", "Name", "next", "layer", "platafrm"];
			var _fieldsSteps = ["textfield", "textfield", "textfield", "textfield", "textfield", "select", "select"];

			var id = 'label-Steps_' + i; text = 'Step ' + i + ' : '; type = 'label';

			window.fieldsEdit.createField(id, text, null, type, 2);

			window.fieldsEdit.objects.row2.buttons[i-1].elemnt = {id:[], text:[], typeCall:[]};


			var idSucesor = window.fieldsEdit.objects.row2.buttons[window.fieldsEdit.objects.row2.buttons.length - 1].id;
            
			for(var j = 0; j < _valueSteps.length; j++){

				window.fieldsEdit.objects.row2.buttons[i-1].elemnt.id[j] = _valueSteps[j] + "_" + j + "_" + i;
				window.fieldsEdit.objects.row2.buttons[i-1].elemnt.text[j] = _fieldsSteps[j];
			}

			var sucesorButton = document.getElementById(idSucesor);

			for(var k = 0; k < 5; k++)
			{
				createStepsChildrenTextfield(window.fieldsEdit.objects.row2.buttons[i-1].elemnt.id[k], _valueSteps[k]);
			}

			$("#"+window.fieldsEdit.objects.row2.div).append("<br>");     

		}

		function createStepsChildrenTextfield(id, text){

            var _event = 'keyup';

			var imput = $('<input />', {"id" : id, "type" : "text", "text" : "textfield" });
            $("#"+window.fieldsEdit.objects.row2.div).append(imput);

            var button = document.getElementById(id);
                  
            button.className = 'edit-Fermat';

            if(text === 'next'){
                button.placeholder = 'Number of Calls';
                button.style.width = '80 px';
            }
            else
                button.placeholder = 'Enter ' + text;

            button.style.zIndex = 10;

            window.helper.show(button, 1000);

            button.addEventListener(_event, function() {



                if($(this).attr("id").substring(0, 4) === 'next'){

                    for (var j = 1; j <= window.fieldsEdit.objects.row2.buttons[parseInt($(this).attr("id").substring(7, 8)) - 1].elemnt.typeCall.length; j++) {
                        if(window.fieldsEdit.objects.row2.buttons[parseInt($(this).attr("id").substring(7, 8)) - 1].elemnt.typeCall[j-1] !== undefined){
                            $("#" + window.fieldsEdit.objects.row2.buttons[parseInt($(this).attr("id").substring(7, 8)) - 1].elemnt.typeCall[j-1]).remove();
                        }
                    }

                    window.fieldsEdit.objects.row2.buttons[parseInt($(this).attr("id").substring(7, 8)) - 1].elemnt.typeCall = [];

                    for(var i = 1; i <= parseInt($("#" + $(this).attr("id")).val()); i++){
                        createTypeCall($(this).attr("id") + "_typeCall_" + i, window.fieldsEdit.objects.row2.buttons[parseInt($(this).attr("id").substring(7, 8)) - 1].text, $(this).attr("id"));
                        window.fieldsEdit.objects.row2.buttons[parseInt($(this).attr("id").substring(7, 8)) - 1].elemnt.typeCall[i-1] = $(this).attr("id") + "_typeCall_" + i;
                    }
                }
            });   
		}

        function createTypeCall(id, text, jquery){

            //var newidSteps = [];
            //idCall.push(id);
            $('<input />', {"id" : id, "type" : "text", "text" : "textfield" }).insertAfter("#" + jquery);

            var button = document.getElementById(id);

            button.className = 'edit-Fermat';
            button.placeholder = text.substring(0,7) + "to: ";
            button.style.width.important = '70 px';
            button.style.zIndex = 10;
            button.name = "nameTypeCall";

            window.helper.show(button, 1000);

            button.addEventListener('blur', function() {
            });   
        }
	}

    function drawHeaderFlow(id, callback){

        var exit = null, mesh;

        if(actions.type === "insert"){ // si es insertar

            flows.push(new ActionFlow(flow));

            mesh = flows[0].createTitleBox("","");
            flows[0].objects.push(mesh);

            mesh.userData = {
                id: window.flowManager.getObjHeaderFlow().length,
                onClick : onClick
            };

            var newCenter = helper.getCenterView('workflows');
            
            target = window.helper.fillTarget(newCenter.x, -135000, newCenter.z, 'workflows');

            mesh.position.copy(target.hide.position);

            mesh.rotation.copy(target.hide.rotation);

            mesh.renderOrder = 1;

            window.scene.add(mesh);

            exit = function(){

                window.camera.resetPosition();

            };

            actions.exit = exit;

            animate(mesh, target.show, 1000, function(){ 

                window.camera.setFocus(mesh, new THREE.Vector4(0, 0, 950), 500);

                if(typeof(callback) === 'function')
                    callback();
                window.helper.showBackButton();

            });

            window.helper.showBackButton();
        }
    }

    function changeTexture(){
        
        fillWorkFlowHeader();

        texture = flows[0].createTitleBox(flow.name,flow.desc, true);
        flows[0].objects[0].material.map = texture;
    }

    function fillWorkFlowHeader(){

        flow.name = document.getElementById(window.fieldsEdit.objects.idFields.title).value;
        flow.desc = document.getElementById(window.fieldsEdit.objects.idFields.subTitle).value;
    }

    function fillWorkFlow(){

        var value = [], indice = 0;

        flows[0].flow.name = document.getElementById(window.fieldsEdit.objects.idFields.title).value;
        flows[0].flow.desc = document.getElementById(window.fieldsEdit.objects.idFields.subTitle).value;
        flows[0].flow.platfrm = document.getElementById(window.fieldsEdit.objects.idFields.platform).value;

        for (var j = 0; j < idSteps.length; j++) {
           for (var k = 0; k < idSteps[j].length; k++) {
              value[k] = document.getElementById(idSteps[j][k]).value;
            }

            setValue(value, j);
        }

        setTimeout(function() {
            for (var i = 0; i < flows[0].flow.steps.length; i++) {
                flows[0].drawTree(flows[0].flow.steps[i], target.show.position.x + 900 * i, target.show.position.y - 211, 0);
            }
            flows[0].showSteps();
        }, 1000);
    }

    function setValue(value, j){

        var next;

        if(document.getElementsByName("nameTypeCall") !== undefined){

            for(var i = 0; i < document.getElementsByName("nameTypeCall").length; i++){

                if(parseInt(document.getElementsByName("nameTypeCall")[i].id.substring(7, 8)) - 1 === j){
                    if(document.getElementsByName("nameTypeCall")[i].value - 1 > 0){
                        next = {id: document.getElementsByName("nameTypeCall")[i].value - 1, type: "direct call"};
                        flows[0].flow.steps[j].next.push(next);
                    }
                }
            }
        }

        flows[0].flow.steps[j].name = value[3];
        flows[0].flow.steps[j].desc = value[1];
        flows[0].flow.steps[j].element = -1;//document.getElementById(objects.idFields.platform).value + "_" + document.getElementById(objects.idFields.layer).value;
        flows[0].flow.steps[j].id = j;
        flows[0].flow.steps[j].layer = document.getElementById(window.fieldsEdit.objects.idFields.layer).value;
        flows[0].flow.steps[j].platfrm = document.getElementById(window.fieldsEdit.objects.idFields.platform).value;
        flows[0].flow.steps[j].title = value[0];
        flows[0].flow.steps[j].type = value[2];

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