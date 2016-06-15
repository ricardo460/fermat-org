function WorkFlowEdit() {

    var self = this;

    var classFlow = null;

    var focus = {
            mesh : null,
            data : null
        };

    var EDIT_STEPS = [];

    var PREVIEW_STEPS = [];

    var actualMode = null;

    var TILEWIDTH = window.TILE_DIMENSION.width - window.TILE_SPACING;
    var TILEHEIGHT = window.TILE_DIMENSION.height - window.TILE_SPACING;

    this.get = function(){
        return EDIT_STEPS;
    };

    this.getp = function(){
        return PREVIEW_STEPS;
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

        flow.steps = PREVIEW_STEPS;

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

        createMeshFocus();

        if(window.fieldsEdit.actions.type === "insert"){

            window.fieldsEdit.createFieldWorkFlowEdit();

            flow = window.fieldsEdit.getData();

            classFlow = new window.Workflow(flow);

            createElement();

            mesh = window.fieldsEdit.objects.tile.mesh;

            showBrowser(false);

            changeMode('edit-step');

            window.removeEventListener('keydown', window.camera.onKeyDown, false);

            window.addEventListener('keydown', newOnKeyDown, false);

            window.fieldsEdit.actions.exit = function(){

                classFlow.deleteStep();

                classFlow = null;

                showBrowser(true);

                window.dragManager.off();

                EDIT_STEPS = [];

                PREVIEW_STEPS = [];

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

            var steps = flow.steps;

            for(var i = 0; i < steps.length; i++){

                if(steps[i].element !== -1){

                    var data = window.helper.getSpecificTile(steps[i].element).data;

                    steps[i].layer = data.layer;
                    steps[i].name = data.name;
                }
            }

            classFlow = new window.Workflow(flow);

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

   /* function resetSteps(steps){

        var removeStep = [],
            i = 0;

        for(i = 0; i < steps.length; i++){

            if(steps[i].element !== -1){

                var data = window.helper.getSpecificTile(steps[i].element).data;

                steps[i].layer = data.layer;
                steps[i].name = data.name;
            }
            else{
                removeStep.push(steps[i]);
            }
        }   

        for(i = 0; i < steps.length; i++){

            if(steps[i].element === -1){

                var data = window.helper.getSpecificTile(steps[i].element).data;

                steps[i].layer = data.layer;
                steps[i].name = data.name;
            }
        }

        function orderPositionStep(array){

            var array = EDIT_STEPS;

            for(var i = 0; i < array.length; i++) {

                for(var t = 0; t < array.length - i; t++) {

                    if(array[t + 1]){ 

                        if (array[t].order[0] > array[t + 1].order[0]) {

                            var aux;

                            aux = array[t];

                            array[t] = array[t + 1];

                            array[t + 1] = aux;
                        }
                    }
                }
            }

            for(var k = 0; k < array.length; k++){

                var newId = k + 1;

                if(array[k].order[0] !== newId){

                    var mesh = array[k].mesh;

                    array[k].order[0] = newId;
                    mesh.userData.id[0] = newId;

                    mesh.material.map = changeTextureId(newId);
                }
            }
        }     

        return steps;
    }
    */
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
                    param.comp_id = getIdSpecificTile(steps[0].name, steps[0].platfrm, steps[0].layer);
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

        var newFlow = new window.Workflow(flow);

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
                    i, l;   

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

                                for(l = 0; l < newSteps[i].next.length; l++){

                                    if(newSteps[i].next[l].id !== oldSteps[i].next[l].id ||
                                       newSteps[i].next[l].type !== oldSteps[i].next[l].type){
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

                            for(l = 0; l < newSteps[i].next.length; l++){

                                if(newSteps[i].next[l].id !== oldSteps[i].next[l].id ||
                                   newSteps[i].next[l].type !== oldSteps[i].next[l].type){
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

                                for(l = 0; l < newSteps[i].next.length; l++){

                                    if(newSteps[i].next[l].id !== oldSteps[i].next[l].id ||
                                       newSteps[i].next[l].type !== oldSteps[i].next[l].type){
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

    function getIdSpecificTile(name, platform, layer){

        var i = 0, tile = null;

        if(window.TABLE[platform]){

            if(window.TABLE[platform].layers[layer]){

                for(i = 0; i < window.TABLE[platform].layers[layer].objects.length; i++){
                    
                    tile = window.TABLE[platform].layers[layer].objects[i]; 
                    
                    if(tile.data.name.toLowerCase() === name.toLowerCase())
                        return tile.id;
                }
            }
        }

        for(var platfrm in window.TABLE){

            for(var _layer in window.TABLE[platfrm].layers){

                for(i = 0; i < window.TABLE[platfrm].layers[_layer].objects.length; i++){
                    
                    tile = window.TABLE[platfrm].layers[_layer].objects[i].data; 
                    
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

        window.fieldsEdit.actualFlow.id = id;

        if(flow.platfrm !== undefined)
            document.getElementById("workflow-header-plataform").value = flow.platfrm;

        if(flow.name !== undefined)
            document.getElementById("workflow-header-title").value = flow.name;
        
        if(flow.desc !== undefined)
            document.getElementById("modal-desc-textarea").value = flow.desc; 
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

    function addIdStep(id, IDtile, parent){

        var mesh = createIdStep(),
            difference = TILEWIDTH / 2;

        var newArray = [id];

        var tile = window.helper.getSpecificTile(IDtile).target.show;

        var target = window.helper.fillTarget(tile.position.x - difference, tile.position.y, tile.position.z + 1, 'table');

        mesh.position.copy(target.hide.position);

        mesh.rotation.copy(target.hide.rotation);

        mesh.userData = {
                id : newArray,
                tile : IDtile,
                type: 'step'
            };

        if(parent){
            var children = EDIT_STEPS[parent - 1].children;

            if(children.length > 0)
                newArray[0] = window.helper.getLastValueArray(children)[0] + 0.5;
            
            children.push(newArray);
        }
        

        var object = {
                    order : newArray,
                    mesh : mesh,
                    target : target,
                    tile : IDtile,
                    children : []
                };

        EDIT_STEPS.push(object);

        mesh.material.map = changeTextureId(id);

        calculatePositionsSteps(IDtile);

        if(parent){
            orderPositionStep();
        }

        return mesh;

        function createIdStep(){

            var size = TILEHEIGHT / 6;

            var mesh = new THREE.Mesh(
                       new THREE.PlaneBufferGeometry(size, size),
                       new THREE.MeshBasicMaterial({ 
                            side: THREE.DoubleSide, 
                            transparent: true, 
                            map:null 
                        }));

            mesh.renderOrder = 1;

            mesh.material.depthTest = false;

            window.scene.add(mesh);

                return mesh;
        }
    }

    function changeTextureId(id){

        var canvas = document.createElement('canvas');
            canvas.height = TILEHEIGHT;
            canvas.width = TILEHEIGHT;
        var ctx = canvas.getContext('2d');
        var middle = canvas.width / 2;
        var image = document.createElement('img');
        var texture = new THREE.Texture(canvas);
            texture.minFilter = THREE.NearestFilter;

        image.onload = function() {

            ctx.drawImage(image, 0, 0);

            ctx.textAlign = 'center';

            ctx.font = '48px Canaro, Sans-serif';
            ctx.fillText(id, middle, middle);
            
            texture.needsUpdate = true;
        };

        image.src = 'images/workflow/buttoncircle.png';

        return texture;
    }

    function calculatePositionsSteps(idTile){

        var countSteps = [],
            rootY = window.helper.getSpecificTile(idTile).target.show.position.y,
            i,
            mesh = null,
            target = null;

        var action = function (){updateTileIgnoredAdd();};

        for(i = 0; i < EDIT_STEPS.length; i++){

            if(EDIT_STEPS[i].tile === idTile)
                countSteps.push(EDIT_STEPS[i]);
        }
        
        if(countSteps.length === 1){ 

            target = countSteps[0].target.show;

            target.position.y = rootY;

            if(actualMode === 'edit-path')
                animate(countSteps[0].mesh, countSteps[0].target.show, 500, action);
            else
                countSteps[0].mesh.position.copy(countSteps[0].target.show.position);
        }
        else if(countSteps.length === 2){ 

            for(i = 0; i < countSteps.length; i++) {

                target = countSteps[i].target.show;

                mesh = countSteps[i].mesh;

                if(i === 0){

                    target.position.y = rootY + (TILEHEIGHT / 4);

                    if(actualMode === 'edit-path')
                        animate(mesh, target, 1000);
                    else
                        mesh.position.copy(target.position);
                }
                else{

                    target.position.y = rootY - (TILEHEIGHT / 4);

                    if(actualMode === 'edit-path')
                        animate(mesh, target, 1000, action);
                    else
                        mesh.position.copy(target.position);
                }
            }
        }
        else if(countSteps.length > 2){

            var difference = (TILEHEIGHT / 6) / 2,
                topY = rootY + ((TILEHEIGHT / 2) - difference),
                countSpaceSteps = countSteps.length - 1,
                distanceSteps = (TILEHEIGHT - difference - ((TILEHEIGHT / 6) / 2)) / countSpaceSteps;

            for(i = 0; i < countSteps.length; i++) {

                mesh = countSteps[i].mesh;

                target = countSteps[i].target.show;

                target.position.y = topY;

                if(i !== countSpaceSteps){

                    if(actualMode === 'edit-path')
                        animate(mesh, target, 1000);
                    else
                        mesh.position.copy(target.position);
                }
                else{

                    target.position.y = topY;

                    if(actualMode === 'edit-path')
                        animate(mesh, target, 1000, action);
                    else
                        mesh.position.copy(target.position);
                }

                topY = topY - distanceSteps; 
            }
        }
    }

    function orderPositionStep(){

        var array = EDIT_STEPS;

        for(var i = 0; i < array.length; i++) {

            for(var t = 0; t < array.length - i; t++) {

                if(array[t + 1]){ 

                    if (array[t].order[0] > array[t + 1].order[0]) {

                        var aux;

                        aux = array[t];

                        array[t] = array[t + 1];

                        array[t + 1] = aux;
                    }
                }
            }
        }

        for(var k = 0; k < array.length; k++){

            var newId = k + 1;

            if(array[k].order[0] !== newId){

                var mesh = array[k].mesh;

                array[k].order[0] = newId;
                mesh.userData.id[0] = newId;

                mesh.material.map = changeTextureId(newId);
            }
        }

        focus.data = window.helper.getLastValueArray(array).mesh;

        updateTileIgnoredAdd();
    }

    function updateTileIgnoredAdd(){

        if(actualMode === "edit-path"){ 

            var id = focus.data.userData.id - 1,
                ignoredTile = focus.data.userData.tile,
                mesh = focus.mesh;

            window.dragManager.objects = [];

            for(var i = 0; i < EDIT_STEPS.length; i++){

                if(i === id)
                    mesh.position.copy(EDIT_STEPS[i].mesh.position);
                
                window.dragManager.objects.push(EDIT_STEPS[i].mesh); 
                
            }

            for(var t = 0; t < window.tilesQtty.length; t++){

                if(window.tilesQtty[t] !== ignoredTile){

                    var tile = window.helper.getSpecificTile(window.tilesQtty[t]).mesh;

                    window.dragManager.objects.push(tile);

                }
            }
        }
    }

    this.deleteStep = function(step){

        var list = EDIT_STEPS,
            ORDER = Search(step),
            tilesCalculatePositions = [],
            removeStep = [],
            i = 0, l = 0;

        focus.mesh.material.visible = false;

        if(list[ORDER].children.length > 0){

            var oldChildren = list[ORDER].children,
                odlStep = list[ORDER].order,
                newIdStep = Search(oldChildren[0][0]),
                newStep = list[newIdStep];
    
            odlStep[0] = newStep.order[0];
            newStep.order = odlStep;
            newStep.mesh.userData.id = odlStep;

            deleteStep(ORDER);

            for(i = 1; i < oldChildren.length; i++){

                fillRemove(oldChildren[i][0]);

                removeStep.push(oldChildren[i][0]);
            }

            for(i = 0; i < removeStep.length; i++)
                 deleteStep(Search(removeStep[i]));
        }
        else{

            for(i = 0; i < list.length; i++){

                var children = list[i].children;

                for(l = 0; l < children.length; l++){ 

                    if(children[l][0] === step)
                        children.splice(l, 1);
                }
            }

            deleteStep(ORDER);
        }

        for(i = 0; i < tilesCalculatePositions.length; i++)
            calculatePositionsSteps(tilesCalculatePositions[i]);

        orderPositionStep();

        focus.mesh.material.visible = true;

        function deleteStep(order){

            removeMesh(list[order]);

            list.splice(order, 1);
        }

        function removeMesh(data){

            var mesh = data.mesh,
                target = data.target,
                tile = data.tile;

            if(!tilesCalculatePositions.find(function(x){if(x === tile) return x;}))
                tilesCalculatePositions.push(tile);

            animate(mesh, target.hide, 2000, function(){ 
                window.scene.remove(mesh);
            });
        }

        function fillRemove(_order){

            var order = Search(_order),
                i = 0;

            for(i = 0; i < list[order].children.length; i++){

                var children = list[Search(list[order].children[i][0])].children;

                removeStep.push(list[order].children[i][0]);

                if(children.length > 0)
                    fillRemove(list[order].children[i][0]);
            }
        }

        function Search(order){

            var i = 0;

            for(i = 0; i < list.length; i++){

                if(list[i].order[0] === order)
                    return i;
            }
        }
    };

    function createMeshFocus(){

        if(!focus.mesh){ 

            var size = TILEHEIGHT / 6;

            var canvas = document.createElement('canvas');

            var img = new Image();
            
            var texture = null;

            canvas.height = TILEHEIGHT;
            canvas.width = TILEHEIGHT;

            var ctx = canvas.getContext('2d');

            img.src = 'images/workflow/focus.png';

            var mesh = new THREE.Mesh(
                       new THREE.PlaneBufferGeometry(size, size),
                       new THREE.MeshBasicMaterial({ 
                            side: THREE.DoubleSide, 
                            transparent: true, 
                            map:null 
                        }));

            mesh.renderOrder = 2;

            mesh.material.depthTest = false;

            window.scene.add(mesh);

            img.onload = function() { 

                ctx.drawImage(img, 0, 0);

                texture = new THREE.Texture(canvas);
                texture.minFilter = THREE.NearestFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.needsUpdate = true;  

                mesh.material.map = texture;

                focus.mesh = mesh;
            };
        }
    }

    this.transformData = function(to){

        var json = [], i = 0, l = 0;

        if(to === 'PREVIEW'){ 

            for(i = 0; i < EDIT_STEPS.length; i++){

                var tile = null, platfrm = null, children = null, next = [];

                tile = window.helper.getSpecificTile(EDIT_STEPS[i].tile).data;

                platfrm = tile.platform || tile.superLayer;

                children = EDIT_STEPS[i].children;

                for(l = 0; l < children.length; l++){

                    var object = {
                        id : children[l][0] - 1,
                        type: "direct call"
                    };

                    next.push(object);
                }

                var step = {
                    id : i,
                    title : "prueba",
                    desc : "test data",
                    type : "start",
                    next : next,
                    name : tile.name,
                    layer : tile.layer,
                    platfrm : platfrm
                };

                json.push(step);
            }

            if(json.length > 1){

                for(i = 1; i < json.length; i++){

                    if(i === (json.length - 1))
                        json[i].type = 'end';
                    else 
                        json[i].type = 'activity';
                }
            }

            PREVIEW_STEPS = json;
        }
        else{

            for(i = 0; i < PREVIEW_STEPS.length; i++){

                var order = null, title = null, platform = null, layer = null, name = null,
                    IDtile = null, parent = null;

                order = PREVIEW_STEPS[i].id + 1;

                title = PREVIEW_STEPS[i].title;

                platform = PREVIEW_STEPS[i].platfrm;

                layer = PREVIEW_STEPS[i].layer;

                name = PREVIEW_STEPS[i].name;

                IDtile = getIdSpecificTile(name, platform, layer);

                parent = searchParent(order - 1);

                if(typeof parent === 'number')
                    parent = parent + 1;

                var mesh = addIdStep(order, IDtile, parent);

                focus.data = mesh;
            }
        }

        function searchParent(id){

            var i, l;

            for(i = 0; i < PREVIEW_STEPS.length; i++){

                var next = PREVIEW_STEPS[i].next;

                for(l = 0; l < next.length; l++){

                    if(next[l].id === id)    
                        return PREVIEW_STEPS[i].id;
                }
            }
            return null;
        }
    };

    function changeMode(mode){ 

        var buttons = {

            path : function(){ 
                window.buttonsManager.createButtons('button-path', 'Edit Path', function(){
                    changeMode('edit-path');}, null, null, "right");
            },
            steps : function(){
                window.buttonsManager.createButtons('button-Steps', 'Edit Steps', function(){
                    changeMode('edit-step');}, null, null, "left");
            },
            preview : function(){
                window.buttonsManager.createButtons('button-preview', 'Workflow Preview', function(){
                    changeMode('preview');}, null, null, "left");
            },
            save : function(){
                window.buttonsManager.createButtons('button-save', 'Save', function(){
                    self.save();}, null, null, "right");
            }
        };

        cleanButtons();

        window.dragManager.reset();

        MODE().exit();

        actualMode = mode;

        MODE().enter();

        function MODE(){

            var actions = {}, enter = null, exit = null; 

            switch(actualMode) {

                case 'edit-step':
                    enter = function() {

                        window.dragManager.on();

                        window.helper.hide('backButton', 0, true);

                        buttons.preview();

                        buttons.path();

                        window.actualView = false;

                        displayField(false);

                        window.tileManager.transform(false, 2000);

                        window.signLayer.transformSignLayer();

                        var newCenter = new THREE.Vector3(0, 0, 0);
                        var transition = 3000;

                        newCenter = window.viewManager.translateToSection('table', newCenter);
                        window.camera.move(newCenter.x, newCenter.y, camera.getMaxDistance() / 2, transition, true);
                        
                        window.headers.transformTable(transition);
                    };             
                    
                    exit = function() {

                        if(mode === 'preview'){

                            self.transformData('PREVIEW');

                            cleanEditStep();

                            window.dragManager.off();
                        }
                    };

                    break;   
                case 'edit-path':
                    enter = function() {

                        buttons.steps();

                        window.dragManager.styleMouse.CROSS = 'copy';

                        if(EDIT_STEPS.length > 0){
                            updateTileIgnoredAdd();
                        }
                        else{

                            for(var t = 0; t < window.tilesQtty.length; t++){

                                var tile = window.helper.getSpecificTile(window.tilesQtty[t]).mesh;

                                window.dragManager.objects.push(tile);
                            }                           
                        }

                        var action = function(tile){

                            var type = null;

                            if(!tile.userData.type)
                                type = 'tile';
                            else if(tile.userData.type === 'step')
                                type = 'step';

                            switch(type) {
                                case "tile":
                                    var parent = null;

                                    if(focus.data)
                                        parent = focus.data.userData.id[0];

                                    var mesh = addIdStep(EDIT_STEPS.length + 1, tile.userData.id, parent);

                                    focus.data = mesh;
                                    break;
                                case "step":
                                    focus.data = EDIT_STEPS[tile.userData.id[0] - 1].mesh;
                                    updateTileIgnoredAdd();
                                    break;                
                            }
                        };

                        window.dragManager.functions.CLICK.push(action);

                        var moveAction = function(mesh, position){ 

                            var type;

                            if(!mesh.userData.type)
                                type = 'tile';
                            else if(mesh.userData.type === 'step'){
                                mesh.position.copy(position);
                                focus.mesh.position.copy(position);
                            }
                        }; 

                        window.dragManager.functions.MOVE.push(moveAction);
                    };             
                    
                    exit = function() {
                        
                    };

                    break; 
                case 'preview':
                    enter = function() {

                        window.helper.show('backButton', 0);

                        buttons.save();

                        displayField(true);

                        window.actualView = 'workflows';

                        var mesh = window.fieldsEdit.objects.tile.mesh;

                        animate(mesh, window.fieldsEdit.objects.tile.target.show, 1000, function(){ 

                            window.camera.setFocus(mesh, new THREE.Vector4(0, 0, 950, 1), 2000);

                            self.fillStep();

                            window.headers.transformWorkFlow(2000);

                            buttons.steps();

                        });
                    };             
                    
                    exit = function() {

                        if(mode === 'edit-step'){
                            self.transformData();
                        }
                        
                    };

                    break; 
            } 

            actions = {
                enter : enter || function(){},
                exit : exit || function(){}
            };

            return actions;
        }
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

    function cleanEditStep(){

        var target = window.helper.fillTarget(0, 0, 0, 'table');

        for(var i = 0; i < EDIT_STEPS.length; i++){

            var mesh = EDIT_STEPS[i].mesh;

            animate(mesh, target.hide, 2000, function(){
                window.scene.remove(mesh);
            }); 
        }

        focus.data = null;

        EDIT_STEPS = [];
    } 

    function cleanButtons(){

        window.buttonsManager.deleteButton('button-save');
        window.buttonsManager.deleteButton('button-preview');
        window.buttonsManager.deleteButton('button-path');
        window.buttonsManager.deleteButton('button-Steps');   
    }

}