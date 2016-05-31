function WorkFlowEdit() {

    var self = this;

    var classFlow = null;

    var jsonSteps = [];

    var steps = {
        mesh : [],
        tile : []
    };

    this.addButton = function(_id){

        var id = null,
            text = 'Edit WorkFlow',
            button = 'buttonWorkFlowEdit',
            side = null,
            callback = null;

        if(typeof _id === 'number')
            id = _id;

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

                    validateLock(id, function(){ 

                        window.fieldsEdit.actions.type = "update";
                        window.buttonsManager.removeAllButtons(); 
                        drawHeaderFlow(id, function(){
                            window.fieldsEdit.createFieldWorkFlowEdit();
                        });
                    });
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

                    validateLock(id, function(){ 

                        if(window.confirm("Are you sure you want to remove this process?"))           
                            deleteWorkFlow(id);
                    });                
                };
            }

            text = 'Delete WorkFlow';
            button = 'buttonWorkFlowDelete';
            side = 'right';
            
            window.buttonsManager.createButtons(button, text, callback, null, null, side);
        }   
    
    };

    this.changeTexture = function(){
        
        var flow = window.fieldsEdit.getData();

        var texture = classFlow.createTitleBox(flow.name, flow.desc, true);

        var mesh = window.fieldsEdit.objects.tile.mesh;

        mesh.material.map = texture;

        mesh.material.needsUpdate = true; 
    };

    this.fillStep = function(){

        var flow = window.fieldsEdit.getData();

        classFlow.deleteStep();

        var target = window.fieldsEdit.objects.tile.target.show;

        classFlow.flow = flow;

        classFlow.countFlowElement();

        for (var i = 0; i < flow.steps.length; i++) {
            classFlow.drawTree(flow.steps[i], target.position.x + 900 * i, target.position.y - 211, 0);
        }

        classFlow.showSteps();

    };

    this.save = function(){

        if(validateFields() === ''){ 

            window.fieldsEdit.disabledButtonSave(true);
            
            if(window.fieldsEdit.actions.type === "insert")
                createWorkFlow();
            else if(window.fieldsEdit.actions.type === "update")
                modifyWorkFlow();
        }
        else{
             window.alert(validateFields());
        }
    };



    function createElement(){

        var mesh = classFlow.createTitleBox();

        var newCenter = window.helper.getCenterView('workflows');

        var y = getPositionY() - 500;
        
        var target = window.helper.fillTarget(newCenter.x, y, newCenter.z, 'workflows');

        mesh.position.copy(target.hide.position);

        mesh.rotation.copy(target.hide.rotation);

        mesh.renderOrder = 1;

        mesh.material.needsUpdate = true;

        window.scene.add(mesh);

        window.fieldsEdit.objects.tile.mesh = mesh;

        window.fieldsEdit.objects.tile.target = target;
    }

    function getPositionY(){

        var newCenter = window.helper.getCenterView('workflows');

        var Ymin = newCenter.y;

        for(var i = 0; i < window.workFlowManager.getObjHeaderFlow().length; i++){

            var y = window.workFlowManager.getObjHeaderFlow()[i].positions.target[0].y;

            if(Ymin === 0){
                Ymin = y;
            }
            else 
            if(Ymin > y){ 
                    Ymin = y;
            }
        }

        return Ymin;
    }

    function drawHeaderFlow(id, callback){ 

        var flow = null,
            mesh = null;

        if(window.fieldsEdit.actions.type === "insert"){

            window.fieldsEdit.createFieldWorkFlowEdit();

            flow = window.fieldsEdit.getData();

            classFlow = new Workflow(flow);

            createElement();

            jsonSteps = [];

            window.dragManager.on();

            mesh = window.fieldsEdit.objects.tile.mesh;

            showBrowser(false);

            buttonModeEditSteps();

            window.removeEventListener('keydown', window.camera.onKeyDown, false);

            window.addEventListener('keydown', newOnKeyDown, false);

            window.fieldsEdit.actions.exit = function(){

                classFlow.deleteStep();

                classFlow = null;

                showBrowser(true);

                window.dragManager.off();

                window.camera.resetPosition();

                window.headers.transformWorkFlow(2000);

                window.removeEventListener('keydown', newOnKeyDown, false);

                window.addEventListener('keydown', window.camera.onKeyDown, false);


            };
        }
        else if(window.fieldsEdit.actions.type === "update"){

            var workFlow = window.workFlowManager.getObjHeaderFlow()[id];

            workFlow.deleteStep();

            flow = workFlow.flow;

            flow = window.helper.clone(flow);

            classFlow = new Workflow(flow);

            createElement();

            mesh = window.fieldsEdit.objects.tile.mesh;

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

                self.changeTexture();

                self.fillStep();

                window.headers.transformWorkFlow(2000);

                var allWorkFlow = window.workFlowManager.getObjHeaderFlow();

                for(var i = 0; i < allWorkFlow.length ; i++) {

                    if(allWorkFlow[i].action){

                        allWorkFlow[i].deleteStep();
                        allWorkFlow[i].action = false;
                        allWorkFlow[i].showAllFlow();
                    }
                    else
                        allWorkFlow[i].showAllFlow();
                }

                window.helper.showBackButton();

            });
            
        }
    }

    function showBrowser(state){

        var browsers = window.browserManager.objects.mesh;

        for(var i = 0; i < browsers.length; i++){
            var mesh = browsers[i];
            mesh.visible = state;
        }
    }

    function validateFields(){

        var msj = '';

        var name = document.getElementById('workflow-header-title');

        if(name.value === ""){
            msj += 'The workFlow must have a name \n';
            name.focus();
        }

        return msj;
    }

    //workFlow action

    function createWorkFlow(){

        var flow = window.fieldsEdit.getData();

        var params = getParamsData(flow);  

        window.API.postRoutesEdit('wolkFlowEdit', 'insert', params, null,
            function(res){ 

                flow._id = res._id;

                postParamsSteps(flow, function(flow){ 

                    addWorkFlow(flow, 3000);

                    classFlow.deleteStep();

                    classFlow = null;

                    window.camera.loseFocus();

                });  
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

        function postParamsSteps(flow, callback){

            var steps = flow.steps.slice();

            var newSteps = [];

            var dataPost = {
                    proc_id : flow._id
                };

            postSteps(steps);

            function postSteps(steps){

                if(steps.length > 0){ 

                    var param = {};

                    param.type = steps[0].type;
                    param.comp_id = getIdSpecificTile(steps[0].name);
                    param.title = steps[0].title;
                    if(steps[0].desc)
                        param.desc = steps[0].desc;
                    else
                        param.desc = "pending";
                    param.order = steps[0].id;

                    if(steps[0].next.length > 0)
                        param.next = steps[0].next;

                    window.API.postRoutesEdit('wolkFlowEdit', 'insert step', param, dataPost,
                        function(res){

                            steps[0]._id = res._id;

                            newSteps.push(steps[0]);
                            
                            steps.splice(0,1);

                            postSteps(steps);

                        });
                }
                else{

                    flow.steps = newSteps;

                    callback(flow);
                }
            }
        }

    }

    function addWorkFlow(flow, duration){

        var newFlow = new Workflow(flow);

        var _target = new THREE.Vector3();

        var target = null,
            find = false,
            id = window.workFlowManager.getObjHeaderFlow().length;

        for(var i = 0; i < window.workFlowManager.getObjHeaderFlow().length; i++){

            if(window.workFlowManager.getObjHeaderFlow()[i].flow.platfrm === flow.platfrm){

                target = window.workFlowManager.getObjHeaderFlow()[i].positions.target[0];

                find = true;

                if(target.y < _target.y)
                    _target.copy(target);
            }
        }
        if(find === false){ 
            for(var j = 0; j < window.headers.getPositionHeaderViewInFlow().length; j++){
                if(window.headers.getPositionHeaderViewInFlow()[j].name === flow.platfrm){
                    _target =  window.headers.getPositionHeaderViewInFlow()[j].position;
                }
            }
        }

        _target = window.helper.clone(_target);
       
        if(find === true){
            _target.y = _target.y - 500;
        }
        else{
            _target.x = _target.x - 1500;
            _target.y = _target.y - 2200;
        }

        window.camera.move(_target.x, _target.y, 8000, duration);

        setTimeout( function() {

            newFlow.drawEdit(_target.x, _target.y, _target.z, id);
            
            window.workFlowManager.getObjHeaderFlow().push(newFlow);

        }, duration);

    }

    function modifyWorkFlow(){ 

        var newFlow = window.fieldsEdit.getData();

        var params = getParamsData(newFlow);

        var dataPost = {
                proc_id : window.fieldsEdit.actualFlow._id
            };

        window.API.postRoutesEdit('wolkFlowEdit', 'update', params, dataPost,
            function(res){ 

                newFlow._id = window.fieldsEdit.actualFlow._id;

                postParamsStep(newFlow, function(newFlow){

                    var oldFlow = window.helper.clone(window.fieldsEdit.actualFlow),
                        oldGroup = oldFlow.platfrm,
                        newGroup = newFlow.platfrm,
                        id = window.fieldsEdit.actualFlow.id,
                        target = window.helper.fillTarget(0, 0, 160000, 'workflows'),
                        workFlow = window.workFlowManager.getObjHeaderFlow()[id],
                        mesh = workFlow.objects[0];
                        
                    window.camera.loseFocus();

                    classFlow.deleteStep();

                    classFlow = null;

                    var positionCameraX = workFlow.positions.target[0].x,
                        positionCameraY = workFlow.positions.target[0].y;

                    window.camera.move(positionCameraX, positionCameraY, 8000, 2000);

                    setTimeout( function() {

                        if(newGroup !== oldGroup)
                            change();
                        else
                            notChange();

                    }, 1500 );

                    function change(){

                        window.workFlowManager.getObjHeaderFlow().splice(id, 1);

                        animate(mesh, target.hide, 800, function(){

                            window.scene.remove(mesh);

                            updateWorkFlow(workFlow.flow.platfrm);

                            setTimeout( function() {

                                addWorkFlow(newFlow, 2000);

                            }, 2500 );

                        });
                    }

                    function notChange(){

                        var texture = workFlow.createTitleBox(newFlow.name, newFlow.desc, true);

                        animate(mesh, target.hide, 1000, function(){

                            mesh.material.map = texture;

                            mesh.material.needsUpdate = true;

                            target = window.helper.fillTarget(workFlow.positions.target[0].x, workFlow.positions.target[0].y, 0, 'workflows');

                            animate(mesh, target.show, 1000, function(){

                                workFlow.flow.name = newFlow.name;

                                workFlow.flow.desc = newFlow.desc;

                                workFlow.flow.platfrm = newFlow.platfrm;

                                workFlow.flow.steps = newFlow.steps;

                                workFlow.countFlowElement();
                            });
                        });
                    }

                });

        },
        function(){
            window.fieldsEdit.disabledButtonSave(false);
        });

        function getParamsData(flow){

            var param = {};

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

        function postParamsStep(flow, callback){

            var newSteps = flow.steps.slice(),
                oldSteps = window.fieldsEdit.actualFlow.steps.slice(),
                newFlowSteps = newSteps.slice(),
                config = { 
                        insert :{
                            steps : [],
                            route : 'insert step'
                        },
                        update : {
                            steps : [],
                            route : 'update step'
                        },
                        delete :{
                            steps : [],
                            route : 'delete step'
                        }
                    };

            fillSteps(newSteps, oldSteps);

            postSteps('delete',config.delete.steps.slice(0), function(){

                postSteps('update',config.update.steps.slice(0), function(){

                    postSteps('insert',config.insert.steps.slice(0), function(){

                        flow.steps = newFlowSteps;
                        
                        callback(flow);
                    });
                });
            });

            function fillSteps(newSteps, oldSteps){ 

                var difference,
                    i;   

                if(newSteps.length > oldSteps.length){

                    difference = (newSteps.length - (newSteps.length - oldSteps.length)) - 1;

                    for(i = 0; i < newSteps.length; i++){

                        if(i > difference){
                            config.insert.steps.push(newSteps[i]);  
                        }
                        else{

                            if(newSteps[i].title.toLowerCase() !== oldSteps[i].title.toLowerCase() ||
                               newSteps[i].desc.toLowerCase() !== oldSteps[i].desc.toLowerCase() ||
                               newSteps[i].name.toLowerCase() !== oldSteps[i].name.toLowerCase()){

                                newSteps[i]._id = oldSteps[i]._id;
                                config.update.steps.push(newSteps[i]);
                            }
                            else if(newSteps[i].next.length !== oldSteps[i].next.length){

                                newSteps[i]._id = oldSteps[i]._id;
                                config.update.steps.push(newSteps[i]);
                            }
                            else if(newSteps[i].next.length !== 0){

                                for(var t = 0; t < newSteps[i].next.length; t++){

                                    if(newSteps[i].next[t].id !== oldSteps[i].next[t].id ||
                                       newSteps[i].next[t].type !== oldSteps[i].next[t].type){
                                        newSteps[i]._id = oldSteps[i]._id;
                                        config.update.steps.push(newSteps[i]);
                                    }
                                }
                            }
                        }
                    }
                }
                else if(newSteps.length === oldSteps.length){

                    for(i = 0; i < newSteps.length; i++){

                        if(newSteps[i].title.toLowerCase() !== oldSteps[i].title.toLowerCase() ||
                           newSteps[i].desc.toLowerCase() !== oldSteps[i].desc.toLowerCase() ||
                           newSteps[i].name.toLowerCase() !== oldSteps[i].name.toLowerCase() ){

                            newSteps[i]._id = oldSteps[i]._id;
                            config.update.steps.push(newSteps[i]);
                        }
                        else if(newSteps[i].next.length !== oldSteps[i].next.length){

                            newSteps[i]._id = oldSteps[i]._id;
                            config.update.steps.push(newSteps[i]);
                        }
                        else if(newSteps[i].next.length !== 0){

                            for(var t = 0; t < newSteps[i].next.length; t++){

                                if(newSteps[i].next[t].id !== oldSteps[i].next[t].id ||
                                   newSteps[i].next[t].type !== oldSteps[i].next[t].type){
                                    newSteps[i]._id = oldSteps[i]._id;
                                    config.update.steps.push(newSteps[i]);
                                }
                            }
                        }
                    }
                }
                else if(newSteps.length < oldSteps.length){

                    difference = (oldSteps.length - (oldSteps.length - newSteps.length)) - 1;

                    for(i = 0; i < oldSteps.length; i++){

                        if(i > difference){
                            config.delete.steps.push(oldSteps[i]);  
                            
                        }
                        else{ 

                            if(newSteps[i].title.toLowerCase() !== oldSteps[i].title.toLowerCase() ||
                               newSteps[i].desc.toLowerCase()!== oldSteps[i].desc.toLowerCase() ||
                               newSteps[i].name.toLowerCase()!== oldSteps[i].name.toLowerCase() ){

                                newSteps[i]._id = oldSteps[i]._id;
                                config.update.steps.push(newSteps[i]);
                            }
                            else if(newSteps[i].next.length !== oldSteps[i].next.length){

                                newSteps[i]._id = oldSteps[i]._id;
                                config.update.steps.push(newSteps[i]);
                            }
                            else if(newSteps[i].next.length !== 0){

                                for(var t = 0; t < newSteps[i].next.length; t++){

                                    if(newSteps[i].next[t].id !== oldSteps[i].next[t].id ||
                                       newSteps[i].next[t].type !== oldSteps[i].next[t].type){
                                        newSteps[i]._id = oldSteps[i]._id;
                                        config.update.steps.push(newSteps[i]);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            function postSteps(task, array, callback){

                if(array.length > 0){

                    var dataPost = {
                            proc_id : window.fieldsEdit.actualFlow._id
                        };

                    var param = {};

                    if(task === 'update' || task === 'delete')
                        dataPost.steps_id = array[0]._id;

                    if(task !== 'delete'){ 

                        param.type = array[0].type;
                        param.comp_id = getIdSpecificTile(array[0].name);
                        param.title = array[0].title;
                        if(array[0].desc)
                            param.desc = array[0].desc;
                        else
                            param.desc = "pending";
                        param.order = array[0].id;

                        if(task === 'update'){

                            param.next = array[0].next;
                        }
                        else{

                            if(array[0].next.length > 0)
                                param.next = array[0].next;
                        }
                    }

                    window.API.postRoutesEdit('wolkFlowEdit', config[task].route, param, dataPost,
                        function(res){

                            if(task !== 'delete'){ 

                                array[0]._id = res._id;

                                newFlowSteps[array[0].id]._id = array[0]._id;
                            }
                            
                            array.splice(0,1);

                            postSteps(task, array, callback);

                        },
                        function(){
                            window.fieldsEdit.disabledButtonSave(false);
                        });
                }
                else{

                    callback();
                }
            }
        
        }
    }

    function deleteWorkFlow(id){

        var workFlow = window.workFlowManager.getObjHeaderFlow()[id];

        var dataPost = {
                proc_id : workFlow.flow._id
            };

        window.API.postRoutesEdit('wolkFlowEdit', 'delete', false, dataPost,
            function(res){
        
                window.workFlowManager.showWorkFlow();

                window.workFlowManager.getObjHeaderFlow().splice(id, 1);

                window.camera.move(workFlow.positions.target[0].x, workFlow.positions.target[0].y, 8000, 2000);

                setTimeout(function(){

                    var target =  window.helper.fillTarget(0, 0, 160000, 'workflows');
                    var mesh = workFlow.objects[0];

                    animate(mesh, target.hide, 1500, function(){
                            window.scene.remove(mesh);
                            updateWorkFlow(workFlow.flow.platfrm);
                        });
                    
                }, 2500);
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

        for(var i = 0; i < window.workFlowManager.getObjHeaderFlow().length; i++){

            var workFlow = window.workFlowManager.getObjHeaderFlow()[i];

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

                var target = window.helper.fillTarget(workFlow.positions.target[0].x, workFlow.positions.target[0].y, 0, 'workflows');

                animate(workFlow.objects[0], target.show, 1000);
            }
        }
    }

    function validateLock(_id, callback){

        var id = window.workFlowManager.getObjHeaderFlow()[_id].flow._id;

        var dataPost = {
                proc_id : id
            };

        window.API.postValidateLock('wolkFlowEdit', dataPost,
            function(res){ 

                if(typeof(callback) === 'function')
                    callback();
            },
            function(res){

                window.alert("This workFlow is currently being modified by someone else, please try again in about 3 minutes");
            }
        );
    }

    function getIdSpecificTile(name){

        for(var platfrm in window.TABLE){

            for (var layer in window.TABLE[platfrm].layers){

                for(var i = 0; i < window.TABLE[platfrm].layers[layer].objects.length; i++){
                    
                    var tile = window.TABLE[platfrm].layers[layer].objects[i].data; 
                    
                    if(tile.name.toLowerCase() === name.toLowerCase())
                        return tile.id;
                }   
            }        
        } 
    }

    function fillFields(id){

        var flow = classFlow.flow;

        flow = window.helper.clone(flow);

        window.fieldsEdit.actualFlow = window.helper.clone(flow);

        var steps = flow.steps;

        for(var i = 0; i < steps.length; i++){

            if(steps[i].element !== -1){

                var data = window.helper.getSpecificTile(steps[i].element).data;

                steps[i].layer = data.layer;
                steps[i].name = data.name;
            }
        }

        var list = document.getElementById("step-List");

        list.valueJson = steps.slice();

        window.fieldsEdit.actualFlow.id = id;

        if(flow.platfrm !== undefined)
            document.getElementById("workflow-header-plataform").value = flow.platfrm;

        if(flow.name !== undefined)
            document.getElementById("workflow-header-title").value = flow.name;
        
        if(flow.desc !== undefined)
            document.getElementById("modal-desc-textarea").value = flow.desc;

        list.update();

        if(steps.length > 0)
            document.getElementById("modal-steps-div").changeStep(0);
        
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
            .easing(TWEEN.Easing.Cubic.Out)
            .start();

        new TWEEN.Tween(mesh.rotation)
            .to({x: rx, y: ry, z: rz}, _duration + 500)
            .easing(TWEEN.Easing.Cubic.Out)
            .onComplete(function () {
                    if(typeof(callback) === 'function')
                        callback();   
                })
            .start();
    }

    //Botones 

    function buttonModeEditSteps(position){

        window.helper.hide('backButton', 0, true);

        window.actualView = false;

        displayField(false);

        cleanButtons();

        window.dragManager.objects = [];

        window.tileManager.transform(false, 2000);

        window.signLayer.transformSignLayer();

        var newCenter = position || new THREE.Vector3(0, 0, 0);
        var transition = 3000;

        newCenter = window.viewManager.translateToSection('table', newCenter);
        window.camera.move(newCenter.x, newCenter.y, camera.getMaxDistance() / 2, transition, true);
        
        window.headers.transformTable(transition);

        window.buttonsManager.createButtons('button-preview', 'Workflow Preview', function(){
            buttonModePreview();}, null, null, "left");

        window.buttonsManager.createButtons('button-path', 'Edit Path', function(){
            buttonModeEditPath();}, null, null, "right");
    }

    function buttonModeEditPath(){

        cleanButtons();

        window.dragManager.objects = [];

        window.buttonsManager.createButtons('button-Steps', 'Edit Steps', function(){
            buttonModeEditSteps();}, null, null, "left");

        if(jsonSteps.length <= 0){

            window.dragManager.styleMouse.CROSS = 'copy';

            for(var i = 0; i < window.tilesQtty.length; i++){

                var tile = window.helper.getSpecificTile(window.tilesQtty[i]).mesh;

                window.dragManager.objects.push(tile);
            }
        }
        else{

        }

        var action = function(mesh, position){

            if(mesh.parent.type === "LOD")
                mesh.parent.position.copy(position);
            else
                mesh.position.copy(position);
        };

        window.dragManager.functions.MOVE.push(action); 
    }

    this.createButon = function(){

        var tileWidth = (window.TILE_DIMENSION.width - window.TILE_SPACING) / 2,
            tileHeight = (window.TILE_DIMENSION.height - window.TILE_SPACING) / 4;

        var mesh =  new THREE.Mesh(
                    new THREE.PlaneBufferGeometry(tileHeight, tileHeight),
                    new THREE.MeshBasicMaterial({
                            side: THREE.DoubleSide,
                            color: Math.random() * 0xffffff
                        })
                    );

        window.scene.add(mesh);

        var tile = window.helper.getSpecificTile(window.tilesQtty[0]).mesh;

        window.camera.setFocus(tile, new THREE.Vector4(0, 0, 950, 1), 2000);

        mesh.position.set(tile.position.x - tileWidth, tile.position.y, tile.position.z + 2);
    
    return mesh;}

    function buttonModePreview(){

        cleanButtons();

        displayField(true);

        window.actualView = 'workflows';

        var mesh = window.fieldsEdit.objects.tile.mesh;

        animate(mesh, window.fieldsEdit.objects.tile.target.show, 1000, function(){ 

            window.camera.setFocus(mesh, new THREE.Vector4(0, 0, 950, 1), 2000);

            window.headers.transformWorkFlow(2000);

            window.helper.show('backButton', 0);

            window.buttonsManager.createButtons('button-save', 'Save', function(){
                buttonModePreview();}, null, null, "right");

            window.buttonsManager.createButtons('button-Steps', 'Edit Steps', function(){
                buttonModeEditSteps();}, null, null, "left");
        }); 
    }

    function displayField(visible){

        if(visible)
            window.helper.show("workflow-header");
        else
            window.helper.hide("workflow-header", 1000, true);
    }

    function newOnKeyDown(event){

        if(event.keyCode === 27 /* ESC */) {

            window.camera.offFocus();

            window.actualView = 'workflows';

            window.camera.onKeyDown(event);
        }
    }

    function cleanButtons(){

        window.buttonsManager.deleteButton('button-save');
        window.buttonsManager.deleteButton('button-preview');
        window.buttonsManager.deleteButton('button-path');
        window.buttonsManager.deleteButton('button-Steps');   
    }

}