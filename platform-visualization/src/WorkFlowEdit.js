function WorkFlowEdit() {

    var actualStepsQtty = 0,
        target;
    var idSteps = [];

    var self = this;

    this.testDataSteps =  [
            {
                "id": 0,
                "title": "select broker and submit request",
                "desc": "the customer selects a broker from the list and submits the request to connect to him.",
                "type": "start",
                "next": [

                ],
                "name": "crypto broker community",
                "layer": "sub app",
                "platfrm": "CBP"
            },
            {
                "id": 1,
                "title": "route request to network service",
                "desc": "the module routes this request to the network service to reach the selected broker.",
                "type": "activity",
                "next": [
                    {
                        "id": "0",
                        "type": "direct call"
                    }
                ],
                "name": "crypto broker community",
                "layer": "sub app module",
                "platfrm": "CBP"
            },
            {
                "id": 2,
                "title": "call the broker to deliver the request",
                "desc": "the network service places a call to the broker and then it delivers the request via the fermat network.",
                "type": "activity",
                "next": [
                    {
                        "id": "1",
                        "type": "direct call"
                    }
                ],
                "name": "crypto broker",
                "layer": "actor network service",
                "platfrm": "CBP"
            }
        ];

    var classFlow = null;

    this.addButton = function(_id){

        var id = _id || null,
            text = 'Edit WorkFlow',
            button = 'buttonWorkFlowEdit',
            side = null,
            callback = null;

        if(id === null){

            if(!window.session.getIsLogin()){
            
                callback = function(){ 
                    window.session.getAuthCode();
                };
            }
            else{

                callback = function(){ 

                    window.fieldsEdit.actions.type = "insert";

                    window.buttonsManager.removeAllButtons();

                    window.session.displayLoginButton(false);

                    drawHeaderFlow(null);
                };

            }

            window.session.displayLoginButton(true);

            text = 'Add New WorkFlow';
            button = 'buttonWorkFlowNew';
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

                    window.fieldsEdit.actions.type = "update";
                    window.buttonsManager.removeAllButtons(); 
                    drawHeaderFlow(id, addAllForm);
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
                        deleteWorkFlow(id);                
                };
            }

            text = 'Delete WorkFlow';
            button = 'buttonWorkFlowDelete';
            side = 'right';
            
            window.buttonsManager.createButtons(button, text, callback, null, null, side);
        }   
    
    };

    function createElement(){

        mesh = classFlow.createTitleBox();

        var newCenter = window.helper.getCenterView('workflows');
        
        target = window.helper.fillTarget(newCenter.x, -135000, newCenter.z, 'workflows');

        mesh.position.copy(target.hide.position);

        mesh.rotation.copy(target.hide.rotation);

        mesh.renderOrder = 1;

        mesh.material.needsUpdate = true;

        window.scene.add(mesh);

        window.fieldsEdit.objects.tile.mesh = mesh;

        window.fieldsEdit.objects.tile.target = target;
    }

    function addAllForm(){

        formPlatform();
        formTitleHeaderFlow();
        formSubTitleHeaderFlow();
        window.fieldsEdit.createFieldWorkFlowEdit();
        creatButtonPreview();

        window.fieldsEdit.setTextSize();

        //Main Element
        function formPlatform(){

            var id = 'label-Group'; text = 'Select the Platform : '; type = 'label';

            window.fieldsEdit.createField(id, text, null, type, 1);

            id = 'select-Group'; text = ''; type = 'select';

            window.fieldsEdit.createField(id, text, null, type, 1);

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

        }

        function formTitleHeaderFlow(){

            var id = 'label-Name'; text = 'Enter Name: '; type = 'label';

            window.fieldsEdit.createField(id, text, null, type, 1);

            var idSucesor = window.fieldsEdit.objects.row1.buttons[window.fieldsEdit.objects.row1.buttons.length - 1].id;

            var object = {
                id : "input-Name",
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

            var id = 'label-SubTitle'; text = 'Enter input-desc : '; type = 'label';

            window.fieldsEdit.createField(id, text, null, type, 1);

            var idSucesor = window.fieldsEdit.objects.row1.buttons[window.fieldsEdit.objects.row1.buttons.length - 1].id;

            var object = {
                id : "input-desc",
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

        function creatButtonPreview(){

            var text, button, side;

            callback = function(){

                fillStep();
                
            };

            text = 'Preview';
            button = 'buttonPreview';
            side = 'right';

            window.buttonsManager.createButtons(button, text, callback, null, null, side);
        }

    }

    function drawHeaderFlow(id, callback){ 

        var flow = null;

        if(window.fieldsEdit.actions.type === "insert"){

            addAllForm();

            flow = fillFlow();

            classFlow = new ActionFlow(flow);

            createElement();

            var mesh = window.fieldsEdit.objects.tile.mesh;

            window.fieldsEdit.actions.exit = function(){

                classFlow.deleteStep();

                classFlow = null;

                window.camera.resetPosition();

            };

            animate(mesh, window.fieldsEdit.objects.tile.target.show, 1000, function(){ 

                window.camera.setFocus(mesh, new THREE.Vector4(0, 0, 950, 1), 2000);

                if(typeof(callback) === 'function')
                    callback();

                window.helper.showBackButton();

            });
        }
        else if(window.fieldsEdit.actions.type === "update"){

            flow = window.flowManager.getObjHeaderFlow()[id].flow;

            flow = JSON.parse(JSON.stringify(flow));

            classFlow = new ActionFlow(flow);

            createElement();

            var mesh = window.fieldsEdit.objects.tile.mesh;

            window.fieldsEdit.actions.exit = function(){

                classFlow.deleteStep();

                classFlow = null;

                window.camera.resetPosition();

            };

            animate(mesh, window.fieldsEdit.objects.tile.target.show, 1000, function(){ 

                window.camera.setFocus(mesh, new THREE.Vector4(0, 0, 950, 1), 2000);

                if(typeof(callback) === 'function')
                    callback();

                fillFields(id);

                changeTexture();

                fillStep();

                window.helper.showBackButton();

            });
            
        }
    }

    this.save = function(){

        if(validateFields() === ''){ 

            //window.fieldsEdit.disabledButtonSave(true);
            
            if(window.fieldsEdit.actions.type === "insert")
                createWorkFlow();
            else if(window.fieldsEdit.actions.type === "update")
                modifyTile();
        }
        else{
             window.alert(validateFields());
        }
    };

    function validateFields(){

        var msj = '';

        var name = document.getElementById('input-Name');

        if(name.value === ""){
            msj += 'The component must have a name \n';
            name.focus();
        }

        return msj;
    }

    //workFlow action

    function createWorkFlow(){

        var flow = fillFlow();

        var params = getParamsData(flow);  

        window.helper.postRoutesProcess('insert', params, null,
            function(res){ 

                flow._id = res._id;

                var newFlow = new ActionFlow(flow);

                var target = null,
                    find = false,
                    id = window.flowManager.getObjHeaderFlow().length;

                for(var i = 0; i < window.flowManager.getObjHeaderFlow().length; i++){

                    if(window.flowManager.getObjHeaderFlow()[i].flow.platfrm === flow.platfrm){
                        target = flowManager.getObjHeaderFlow()[i].positions.target[0];
                        find = true;
                    }

                }

                if(find === false){ 
                    for(var j = 0; j < window.headers.getPositionHeaderViewInFlow().length; j++){
                        if(window.headers.getPositionHeaderViewInFlow()[j].name === flow.platfrm){
                            target =  window.headers.getPositionHeaderViewInFlow()[j].position;
                        }
                    }
                }

                target = JSON.parse(JSON.stringify(target));
               
                if(find === true){
                    target.y = target.y - 500;
                }
                else{
                    target.x = target.x - 1500;
                    target.y = target.y - 2200;
                }

                window.camera.move(target.x, target.y, 8000, 3000);

                setTimeout( function() { 

                    newFlow.drawEdit(target.x, target.y, target.z, id);
                    
                    window.camera.loseFocus();
                    
                    window.flowManager.getObjHeaderFlow().push(newFlow);

                }, 3000 ); 
            },
            function(){
                window.fieldsEdit.disabledButtonSave(false);
            });

        function getParamsData(flow){

            var param = { };

            param.platfrm = flow.platfrm;
            
            param.name = flow.name;

            param.prev = "null";

            param.next = "null";

            if(flow.desc)
                param.desc = flow.desc;
            else
                param.desc = "pending";

            return param;
        }

        function postParamsSteps(table, callback){

            var devs = table.devs;

            var newDevs = [];

            /*postDevs(devs);

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
            }*/
        }

    }

    function deleteWorkFlow(id){

        var workFlow = window.flowManager.getObjHeaderFlow()[id];

        var dataPost = {
                proc_id : workFlow.flow._id
            };

        window.helper.postRoutesProcess('delete', false, dataPost,
            function(res){
        
                window.flowManager.showWorkFlow();

                window.flowManager.getObjHeaderFlow().splice(id, 1);

                window.camera.move(workFlow.positions.target[0].x, workFlow.positions.target[0].y, 8000, 3000);

                setTimeout(function(){
                    var target =  window.helper.fillTarget(0, 0, 160000, 'workflows');
                    var mesh = workFlow.objects[0];
                    animate(mesh, target.hide, 1500, function(){
                            window.scene.remove(mesh);
                            updateWorkFlow(workFlow.flow.platfrm);
                        });
                    
                }, 5500);
            });
    }



    function updateWorkFlow(platform){

        var positionInit = null,
            ArrayPosition = [];

        for(var j = 0; j < window.headers.getPositionHeaderViewInFlow().length; j++){

            if(window.headers.getPositionHeaderViewInFlow()[j].name === platform){

                positionInit =  window.headers.getPositionHeaderViewInFlow()[j].position;
            }
        }

        for(var i = 0; i < window.flowManager.getObjHeaderFlow().length; i++){

            var workFlow = window.flowManager.getObjHeaderFlow()[i];

            var mesh = workFlow.objects[0];

            mesh.userData.id = i;

            if(workFlow.flow.platfrm === platform){

                if(ArrayPosition.length > 0){

                    workFlow.positions.target[0].y = window.helper.getLastValueArray(ArrayPosition).y - 500;

                }
                else{
                    workFlow.positions.target[0].x = positionInit.x - 1500;
                    workFlow.positions.target[0].y = positionInit.y - 2200;
                }

                ArrayPosition.push(workFlow.positions.target[0]);

                var target = window.helper.fillTarget(workFlow.positions.target[0].x, workFlow.positions.target[0].y, 0, 'workflows');;

                animate(workFlow.objects[0], target.show, 2000);
            }
        }
    }

    function changeTexture(){
        
        var flow = fillFlow();

        texture = classFlow.createTitleBox(flow.name, flow.desc, true);

        var mesh = window.fieldsEdit.objects.tile.mesh;

        mesh.material.map = texture;

        mesh.material.needsUpdate = true; 
    }

    function fillStep(){

        var flow = fillFlow();

        classFlow.deleteStep();

        var target = window.fieldsEdit.objects.tile.target.show;

        flow.steps = self.testDataSteps;

        classFlow.flow = flow;

        classFlow.countFlowElement();

        for (var i = 0; i < flow.steps.length; i++) {
            classFlow.drawTree(flow.steps[i], target.position.x + 900 * i, target.position.y - 211, 0);
        }

        classFlow.showSteps();

    }

    function fillFlow(){

        var flow = {},
            step = [];

        flow.steps = step;

        flow.name = document.getElementById('input-Name').value;
        flow.desc = document.getElementById('input-desc').value;
        flow.platfrm = document.getElementById('select-Group').value;

        return flow; 
    }

    function fillFields(id){

        var flow = classFlow.flow;

        flow = JSON.parse(JSON.stringify(flow));

        window.fieldsEdit.actualFlow = JSON.parse(JSON.stringify(flow));

        if(flow.platform !== undefined)
            document.getElementById('select-Group').value = flow.platform;

        if(flow.name !== undefined)
            document.getElementById('input-Name').value = flow.name;
        
        if(flow.desc !== undefined)
            document.getElementById('input-desc').value = flow.desc;

        self.testDataSteps = flow.steps;
        
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