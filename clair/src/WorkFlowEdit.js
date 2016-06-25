function WorkFlowEdit() {

    var self = this;

    var classFlow = null;

    var FOCUS = {
            mesh : null,
            data : null
        };

    var EDIT_STEPS = [];

    var PREVIEW_STEPS = [];

    var REPARED_STEPS = [];

    var actualMode = null;

    var TILEWIDTH = window.TILE_DIMENSION.width - window.TILE_SPACING;
    var TILEHEIGHT = window.TILE_DIMENSION.height - window.TILE_SPACING;

    var vertexOriginX, // nuevo
        vertexOriginY, 
        vertexDestX, 
        vertexDestY, 
        vectorArrow = '', 
        //'Estructura de las flechas'
        LIST_ARROWS = [],
        objArrow = {
            tileOriginId : null,
            tileTargetId : null,
            originID: null,
            targetID: null,
            positionOrigin: null,
            positionTarget: null,
            vector1: null,
            meshPrimary: null,
            vector2:null,
            meshSecondary: null,
            arrow: null,
            type: null
    };

    this.get = function(){
        return EDIT_STEPS;
    };

    this.getp = function(){
        return PREVIEW_STEPS;
    }; 

    this.getr = function(){
        return REPARED_STEPS;
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

                    //validateLock(id, function(){ 

                        window.fieldsEdit.actions.type = "update";
                        window.buttonsManager.removeAllButtons(); 
                        drawHeaderFlow(id, function(){
                            //window.fieldsEdit.createFieldWorkFlowEdit();
                        });
                    //});
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

    }
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

        showBrowser(false);

        window.removeEventListener('keydown', window.camera.onKeyDown, false);

        window.addEventListener('keydown', newOnKeyDown, false);

        window.fieldsEdit.createFieldWorkFlowEdit();

        if(window.fieldsEdit.actions.type === "insert"){

            flow = window.fieldsEdit.getData();

            classFlow = new window.Workflow(flow);

            createElement();

            mesh = window.fieldsEdit.objects.tile.mesh;

            changeMode('edit-step');

        }
        else if(window.fieldsEdit.actions.type === "update"){

            var workFlow = window.workFlowManager.getObjHeaderFlow()[id];

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

            EDIT_STEPS = resetSteps(steps);

            transformData('PREVIEW');

            EDIT_STEPS = [];

            classFlow = new window.Workflow(flow);

            createElement();

            mesh = window.fieldsEdit.objects.tile.mesh;

            fillFields(id);

            var res = msjDeleteSteps();

            if(res){

                REPARED_STEPS = res;
                changeMode('repared');
            }
            else{

                workFlow.deleteStep();
                changeMode('preview');
            }
            
        }

        window.fieldsEdit.actions.exit = function(){

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

            //classFlow.deleteStep();

            //classFlow = null;

            showBrowser(true);

            window.dragManager.off();

            EDIT_STEPS = [];

            PREVIEW_STEPS = [];

            window.fieldsEdit.hiddenModal();

            window.camera.resetPosition();

            window.headers.transformWorkFlow(2000);

            window.removeEventListener('keydown', newOnKeyDown, false);

            window.addEventListener('keydown', window.camera.onKeyDown, false);
        };

        function msjDeleteSteps(){

            var steps = window.fieldsEdit.actualFlow.steps;

            var order = [];

            var msj = "Se han eliminado los siguientes pasos: \n";

            for(var i = 0; i < steps.length; i++){

                var title = steps[i].title;

                if(!PREVIEW_STEPS.find(function(x){if(x.title === title) return x;})){
                    order.push(steps[i]);
                }
            }
            if(order.length > 0){

                order.find(function(x){msj += "* ("+(x.id + 1)+")" +x.title +".\n";});

                msj += "Por los siguentes motivos: \n * No tener un TILE asignado." +
                "\n * Repetir continuamente el mismo TILE.";

                if(window.confirm(msj)) 
                    return order;
                else
                    false;
            }       
        }
    }

    function resetSteps(steps){

        var array = [];

        for(var i = 0; i < steps.length; i++){

            var object = {
                    order : [],
                    children :[],
                    title : [],
                    desc : [],
                    tile : null
                };

            var id = steps[i].id;

            object.order[0] = id + 1;
            object.title[0] = steps[i].title;
            object.desc[0] = steps[i].desc;

            if(steps[i].element !== -1)
                object.tile = steps[i].element;

            if(id !== 0){

                var parent = searchStepParent(id);

                if(typeof parent === 'number'){
                    searchStep(parent + 1).children.push(object.order);
                }
            }

            array.push(object);
        }

        validateTiles();

        return array;

        function validateTiles(){

            var deleteStep = null;

            for(var i = 0; i < array.length; i++){

                if(!deleteStep){

                    if(!array[i].tile)
                        deleteStep = array[i].order[0];
                }
            }

            for(var i = 0; i < array.length; i++){

                if(!deleteStep){

                    var id = validateChildrenTiles(array[i].order[0] - 1);

                    if(id)
                        deleteStep = id;
                }
            }

            if(deleteStep){
                deleteSteps(array, deleteStep);
                validateTiles();
            }

            function validateChildrenTiles(order){

                var tile = array[order].tile;

                var children = array[order].children;

                for(var i = 0; i < children.length; i++){

                    var idTile = array[children[i][0] - 1].tile;

                    if(tile === idTile){
                        return array[children[i][0] - 1].order[0];
                    }
                }

                return false;
            }
        }

        function searchStep(id){

            for(var  i = 0; i < array.length; i++){

                if(id === array[i].order[0])
                    return array[i];
            }

            return false;
        }

        function searchStepParent(id){

            for(var i = 0; i < steps.length; i++){

                var next = steps[i].next;

                for(var l = 0; l < next.length; l++){

                    var _id = parseInt(next[l].id);

                    if(_id === id){
                        return steps[i].id;
                    }

                }
            }

            return false;
        }

        function deleteSteps(array, step){

            var list = array,
                ORDER = Search(step),
                removeStep = [],
                i = 0, l = 0;

            if(list[ORDER].children.length > 0){

                var oldChildren = list[ORDER].children,
                    odlStep = list[ORDER].order,
                    newIdStep = Search(oldChildren[0][0]),
                    newStep = list[newIdStep];
        
                odlStep[0] = newStep.order[0];
                newStep.order = odlStep;

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

            list = orderPositionStep(list);

            function deleteStep(order){

                list.splice(order, 1);
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

            function orderPositionStep(array){

                var array = array;

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

                        array[k].order[0] = newId;
                    }
                }
            }
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

        flow.steps = PREVIEW_STEPS;

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

                    mesh = window.helper.getSpecificTile(getIdSpecificTile(steps[0].name, steps[0].platfrm, steps[0].layer)).data;
                    param.comp_id = mesh.id;
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
                        mesh = window.helper.getSpecificTile(getIdSpecificTile(steps[0].name, steps[0].platfrm, steps[0].layer)).data;
                        param.comp_id = mesh.id;
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
                    children : [],
                    existArrow: false,
                    title : [''],
                    desc : ['']
                };

        EDIT_STEPS.push(object);

        mesh.material.map = changeTextureId(id, parent);

        calculatePositionsSteps(IDtile);

        if(parent){
            orderPositionStep();
        }

        function createIdStep(){

            var height = TILEHEIGHT / 9;
            var width = TILEHEIGHT / 5;

            var mesh = new THREE.Mesh(
                       new THREE.PlaneBufferGeometry(width, height),
                       new THREE.MeshBasicMaterial({ 
                            side: THREE.DoubleSide, 
                            transparent: true, 
                            map:null 
                        }));

            mesh.renderOrder = 1;

            mesh.scale.set(1.4, 1.4, 1.4);

            mesh.material.needsUpdate = true;

            mesh.material.depthTest = false;

            window.scene.add(mesh);

                return mesh;
        }

        // Validaciones 

        if(EDIT_STEPS.length > 1){ // nuevo

            for (var i = 0; i < EDIT_STEPS.length; i++) {

                if(EDIT_STEPS[i].children[0] !== undefined){
                    
                    for (var q = 0; q < EDIT_STEPS[i].children.length; q++) {

                        for (var j = 0; j < EDIT_STEPS.length; j++) {

                             if(EDIT_STEPS[i].children[q][0] === EDIT_STEPS[j].order[0]){// if 2
                                                      
                                 if(EDIT_STEPS.length === 2){
                                    self.createLineStep(EDIT_STEPS[i].target.show, 
                                                        EDIT_STEPS[j].target.show,
                                                        EDIT_STEPS[i].order[0],
                                                        EDIT_STEPS[j].order[0],
                                                        EDIT_STEPS[i].tile,
                                                        EDIT_STEPS[j].tile, false);

                                    updateArrowStep(EDIT_STEPS[j].tile);
                                 }else{

                                    for (var k = 0; k < LIST_ARROWS.length; k++) {
                                        
                                        if((LIST_ARROWS[k].originID === EDIT_STEPS[i].order[0]) && (LIST_ARROWS[k].targetID === EDIT_STEPS[j].order[0])){
                                            find = true;
                                        } 
                                    }

                                    if(find === false){
                                        self.createLineStep(EDIT_STEPS[i].target.show, 
                                                            EDIT_STEPS[j].target.show,
                                                            EDIT_STEPS[i].order[0],
                                                            EDIT_STEPS[j].order[0],
                                                            EDIT_STEPS[i].tile,
                                                            EDIT_STEPS[j].tile, false);

                                        updateArrowStep(EDIT_STEPS[j].tile);
                                    }
                                    find = false;
                                }
                            }//if 2
                        }
                    }
                } 
            }
        }

        // Depuramos el objeto LIST_ARROWS

        for(var m = 0; m < LIST_ARROWS.length; m++){ // nuevo

           if(debug(LIST_ARROWS[m].originID, LIST_ARROWS[m].targetID) === false){

                window.scene.remove(LIST_ARROWS[m].arrow);
                window.scene.remove(LIST_ARROWS[m].meshPrimary);
                window.scene.remove(LIST_ARROWS[m].meshSecondary);
                window.scene.remove(LIST_ARROWS[m].vector1);
                window.scene.remove(LIST_ARROWS[m].vector2);

                LIST_ARROWS.splice(m, 1);
           }

        }

        function debug(origin, target){ // nuevo

            var _search = false;

            for (var n = 0; n < EDIT_STEPS.length; n++) {
                            
                for (var o = 0; o < EDIT_STEPS[n].children.length; o++) {

                    if(LIST_ARROWS[m].originID === EDIT_STEPS[n].order[0] && LIST_ARROWS[m].targetID === EDIT_STEPS[n].children[o][0]){

                        _search =  true;
                    }
                    
                }   
            }

            return _search;
        }

        return mesh;
    }

    this.createLineStep = function(meshOrigin, meshTarget, idOrigin, idTarget, tileOrigin, tileTarget, _isTrue, _indice){ // nuevo

        var mesh, vertexPositions, geometry, from, to, listSteps, midPoint, distanceX, distanceY, indice = _indice || 0;

        vertexOriginX = meshOrigin.position.x;
        vertexOriginY = meshOrigin.position.y;
        vertexDestX = meshTarget.position.x;
        vertexDestY = meshTarget.position.y;

        objArrow.originID = idOrigin;
        objArrow.targetID = idTarget;
        objArrow.tileOriginId = tileOrigin;
        objArrow.tileTargetId = tileTarget;

        //distanceXY = calculateDistanceTileXY(tileOrigin, tileTarget);
        

        /*****************************************/
        //  Si las coordenadas de los puntos extremos, A y B, son:
        //  A   B
        //  ->  ->
        //
        //  Las coordenadas del punto medio de un segmento coinciden con la semisuma de las coordenadas de de los puntos extremos.
        //  //Xm = (x1+x2)/2   Ym = (y1+y2)/2
        //
        //
        //
        //  Por cada Tile en x sera (Xm, Ym) / 2 el calculo de un Xm, Ym 
        //
        //


        if((vertexOriginY >  vertexDestY) && (vertexOriginX !== vertexDestX)){ // si es descendente diagonal
            
            from = new THREE.Vector3(vertexOriginX, vertexOriginY, 2);
            midPoint = midPointCoordinates(vertexOriginX, vertexOriginY, vertexDestX, vertexDestY);
            midPoint = midPointCoordinates(vertexOriginX, vertexOriginY, midPoint.x, midPoint.y);

            to = new THREE.Vector3(midPoint.x, midPoint.y, 2);
           
            vectorArrow = 'arrowDesc';
        }
        else if((vertexOriginY <  vertexDestY) && (vertexOriginX !== vertexDestX)){ // si es ascendente diagonal
        

            from = new THREE.Vector3(vertexOriginX, vertexOriginY, 2);

            midPoint = midPointCoordinates(vertexOriginX, vertexOriginY, vertexDestX, vertexDestY);
            midPoint = midPointCoordinates(vertexOriginX, vertexOriginY, midPoint.x, midPoint.y);

            to = new THREE.Vector3(midPoint.x, midPoint.y, 2);
            vectorArrow = 'arrowAsc';
        }

        if((vertexOriginX == vertexDestX) && (vertexOriginY > vertexDestY)){ // si es vertical descendente

            from = new THREE.Vector3(vertexOriginX, vertexOriginY, 2);
            midPoint = midPointCoordinates(vertexOriginX, vertexOriginY, vertexDestX, vertexDestY);
            midPoint = midPointCoordinates(vertexOriginX, vertexOriginY, midPoint.x, midPoint.y);

            to = new THREE.Vector3(midPoint.x, midPoint.y, 2);

            vectorArrow = 'arrowDescVer';
        }
        else if((vertexOriginX == vertexDestX) && (vertexOriginY < vertexDestY)){ // si es vertical ascendente
           
            from = new THREE.Vector3(vertexOriginX, vertexOriginY, 2);
            midPoint = midPointCoordinates(vertexOriginX, vertexOriginY, vertexDestX, vertexDestY);
            midPoint = midPointCoordinates(vertexOriginX, vertexOriginY, midPoint.x, midPoint.y);

            to = new THREE.Vector3(midPoint.x, midPoint.y, 2);

            vectorArrow = 'arrowAscVer';
        }

        if((vertexOriginY == vertexDestY) && (vertexOriginX < vertexDestX)){ // Horizontal Derecha

            from = new THREE.Vector3(vertexOriginX, vertexOriginY, 2);
            midPoint = midPointCoordinates(vertexOriginX, vertexOriginY, vertexDestX, vertexDestY);
            midPoint = midPointCoordinates(vertexOriginX, vertexOriginY, midPoint.x, midPoint.y);

            to = new THREE.Vector3(midPoint.x, midPoint.y, 2);

            vectorArrow = 'arrowRight';
        } 

        if((vertexOriginY == vertexDestY) && (vertexOriginX > vertexDestX)){ // Horizontal Derecha

            from = new THREE.Vector3(vertexOriginX, vertexOriginY, 2);
            midPoint = midPointCoordinates(vertexOriginX, vertexOriginY, vertexDestX, vertexDestY);
            midPoint = midPointCoordinates(vertexOriginX, vertexOriginY, midPoint.x, midPoint.y);

            to = new THREE.Vector3(midPoint.x, midPoint.y, 2);

            vectorArrow = 'arrowLeft';
        } 
                
        var direction = to.clone().sub(from);

        var length = direction.length();

        var arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, 0xFF0000, 0.1, 0.1); // Arrow Rojo

        scene.add(arrowHelper);

        mesh = createSimbol();// primer mesh(boton)

        switch(vectorArrow){

            case 'arrowDesc':
                mesh.position.set(midPoint.x, midPoint.y, 3); // primer mesh(boton)
                break;

            case 'arrowAsc':
                mesh.position.set(midPoint.x, midPoint.y, 3); // primer mesh(boton)
                break;

            case 'arrowDescVer':
                mesh.position.set(midPoint.x, midPoint.y, 3);
                break;

            case 'arrowAscVer':
                mesh.position.set(midPoint.x, midPoint.y, 3);
                break;

            case 'arrowRight':
                mesh.position.set(midPoint.x, midPoint.y, 3);
                break;

            case 'arrowLeft':
                mesh.position.set(midPoint.x, midPoint.y, 3);
                break;

            default:
                break;
        }

        objArrow.type = vectorArrow;
        objArrow.vector1 = arrowHelper;
        objArrow.meshPrimary = mesh;


        directionLineMesh(midPoint.x, midPoint.y);

        if(_isTrue){ // update

            LIST_ARROWS[indice] = objArrow;

            objArrow = {
                tileOriginId : null,
                tileTargetId : null,
                originID: null,
                targetID: null,
                positionOrigin: null,
                positionTarget: null,
                vector1: null,
                meshPrimary: null,
                vector2:null,
                meshSecondary: null,
                arrow: null,
                type: null
            };
        }
        else{
            LIST_ARROWS.push(objArrow);

            objArrow = {
                tileOriginId : null,
                tileTargetId : null,
                originID: null,
                targetID: null,
                positionOrigin: null,
                positionTarget: null,
                vector1: null,
                meshPrimary: null,
                vector2:null,
                meshSecondary: null,
                arrow: null,
                type: null
            };
        }   
    };
    
    function updateArrowStep(tileTarget){ // nuevo
        
        var list = EDIT_STEPS;

        for (var i = 0; i < list.length - 1; i++) {
            
            if(tileTarget === list[i].tile){ // Revisamos todos los tile que tengan pasos
                    
                for (var j = 0; j < LIST_ARROWS.length; j++) {
                    
                    for (var o = 0; o < list[i].children.length; o++) {

                        if((list[i].order[0] === LIST_ARROWS[j].originID) && (list[i].children[o][0] === LIST_ARROWS[j].targetID)){ // buscamos la flecha a borrar para crear otra con la nueva posicion // if 2

                            window.scene.remove(LIST_ARROWS[j].arrow);
                            window.scene.remove(LIST_ARROWS[j].meshPrimary);
                            window.scene.remove(LIST_ARROWS[j].meshSecondary);
                            window.scene.remove(LIST_ARROWS[j].vector1);
                            window.scene.remove(LIST_ARROWS[j].vector2);

                            for (var k = 0; k < list.length; k++) {

                                if(list[i].children[o][0] === list[k].order[0]){

                                    self.createLineStep(list[i].target.show, 
                                                        list[k].target.show, 
                                                        list[i].order[0], 
                                                        list[k].order[0],
                                                        list[i].tile,
                                                        list[k].tile, true, j);
                                }
                            }  
                        } // if
                    }

                    //actualizacion de las flechas que le llegan a los pasos que estan en ese tile "tileTarget"
                    for(var t = 0; t < list.length; t++) {

                        for(var r = 0; r < list[t].children.length; r++){

                            if(list[i].order[0] === list[t].children[r][0]){

                                for(var m = 0; m < LIST_ARROWS.length; m++){

                                    if(list[t].order[0] === LIST_ARROWS[m].originID && list[i].order[0] === LIST_ARROWS[m].targetID){

                                        window.scene.remove(LIST_ARROWS[m].arrow);
                                        window.scene.remove(LIST_ARROWS[m].meshPrimary);
                                        window.scene.remove(LIST_ARROWS[m].meshSecondary);
                                        window.scene.remove(LIST_ARROWS[m].vector1);
                                        window.scene.remove(LIST_ARROWS[m].vector2);

                                        self.createLineStep(list[t].target.show, 
                                                            list[i].target.show, 
                                                            list[t].order[0], 
                                                            list[i].order[0],
                                                            list[t].tile,
                                                            list[i].tile, true, m);
                                    }
                                }
                            }
                        }      
                    
                    }
                }  
            }
        }
    }
    
    function midPointCoordinates(origenX, origenY, targetX, targetY){ // nuevo

        var xMid, yMid, mid;

        xMid = ((origenX) + (targetX)) / 2;
        yMid = ((origenY) + (targetY)) / 2;

        mid = new THREE.Vector3(xMid, yMid);

        return mid;
    }

    function directionLineMesh(x, y){// nuevo

        var mesh, vertexPositions, from, to, midPoint;

        switch(vectorArrow){

            case 'arrowDesc':
                from = new THREE.Vector3(x, y, 2);
                
                midPoint = midPointCoordinates(vertexOriginX, vertexOriginY, vertexDestX, vertexDestY);
            
                to = new THREE.Vector3(midPoint.x, midPoint.y, 2);

                break;

            case 'arrowAsc':
                from = new THREE.Vector3(x, y, 2);
                
                midPoint = midPointCoordinates(vertexOriginX, vertexOriginY, vertexDestX, vertexDestY);
            
                to = new THREE.Vector3(midPoint.x, midPoint.y, 2);

                break;

            case 'arrowDescVer':
                from = new THREE.Vector3(x, y, 2);
                
                midPoint = midPointCoordinates(vertexOriginX, vertexOriginY, vertexDestX, vertexDestY);
            
                to = new THREE.Vector3(midPoint.x, midPoint.y, 2);
                break;

            case 'arrowAscVer':
                from = new THREE.Vector3(x, y, 2);
                
                midPoint = midPointCoordinates(vertexOriginX, vertexOriginY, vertexDestX, vertexDestY);
            
                to = new THREE.Vector3(midPoint.x, midPoint.y, 2);
                break;

            case 'arrowRight':
                from = new THREE.Vector3(x, y, 2);
                
                midPoint = midPointCoordinates(vertexOriginX, vertexOriginY, vertexDestX, vertexDestY);
            
                to = new THREE.Vector3(midPoint.x, midPoint.y, 2);
                break;

            case 'arrowLeft':
                from = new THREE.Vector3(x, y, 2);
                
                midPoint = midPointCoordinates(vertexOriginX, vertexOriginY, vertexDestX, vertexDestY);
            
                to = new THREE.Vector3(midPoint.x, midPoint.y, 2);
                break;

            default:
                break;
        }

        var direction = to.clone().sub(from);

        var length = direction.length();

        var arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, 0xFF0000, 0.1, 0.1); // Arrow Azul

        scene.add(arrowHelper);
        
        mesh = createSimbol();

        objArrow.vector2 = arrowHelper;
        objArrow.meshSecondary = mesh;

        directionArrowMesh(midPoint.x, midPoint.y);

        switch(vectorArrow){

            case 'arrowDesc':
                mesh.position.set(midPoint.x, midPoint.y, 3);
                break;

            case 'arrowAsc':
                mesh.position.set(midPoint.x, midPoint.y, 3);
                break;

            case 'arrowDescVer':
                mesh.position.set(midPoint.x, midPoint.y, 3);
                break;

            case 'arrowAscVer':
                mesh.position.set(midPoint.x, midPoint.y, 3);
                break;

            case 'arrowRight':
                mesh.position.set(midPoint.x, midPoint.y, 3);
                break;

            case 'arrowLeft':
                mesh.position.set(midPoint.x, midPoint.y, 3);
                break;

            default:
                break;
        }
    }

    function createSimbol(){ // nuevo

        var tileWidth = (window.TILE_DIMENSION.width - window.TILE_SPACING) / 2,
            tileHeight = (window.TILE_DIMENSION.height - window.TILE_SPACING) / 8;

        var mesh =  new THREE.Mesh(
                    new THREE.PlaneBufferGeometry(tileHeight, tileHeight),
                    new THREE.MeshBasicMaterial({
                            side: THREE.DoubleSide,
                            color: Math.random() * 0xffffff
                        })
                    );

        window.scene.add(mesh);
        return mesh;
    }

    function directionArrowMesh(x, y){ // nuevo

        var from, to;

         switch(vectorArrow){

            case 'arrowDesc':
                from = new THREE.Vector3(x, y, 2);
                to = new THREE.Vector3(vertexDestX, vertexDestY, 2); //(+10)
                break;

            case 'arrowAsc':
                from = new THREE.Vector3(x, y, 2);
                to = new THREE.Vector3(vertexDestX, vertexDestY, 2); //(-10)
                break;

            case 'arrowDescVer':
                from = new THREE.Vector3(x, y, 2);
                to = new THREE.Vector3(vertexDestX, vertexDestY, 2); //(+10)
                break;

            case 'arrowAscVer':
                from = new THREE.Vector3(x, y, 2);
                to = new THREE.Vector3(vertexDestX, vertexDestY, 2); //(-10)
                break;

            case 'arrowRight':
                from = new THREE.Vector3(x, y, 2);
                to = new THREE.Vector3(vertexDestX, vertexDestY, 2); //(-10)
                break;

            case 'arrowLeft':
                from = new THREE.Vector3(x, y, 2);
                to = new THREE.Vector3(vertexDestX, vertexDestY, 2); //(+10)
                break;

            default:
                break;
        }

        var direction = to.clone().sub(from);

        var length = direction.length();

        var arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, 0xFF0000, 4*2, 4*2); // Arrow Rojo

        scene.add(arrowHelper);

        objArrow.arrow = arrowHelper;
    }

    function changeTextureId(id, parent){

        if(parent)
            parent = parent.toString();
        else
            parent = '';

        var canvas = document.createElement('canvas');
            canvas.height = 412;
            canvas.width = 635;
        var ctx = canvas.getContext('2d');
        var middle = canvas.width / 2;
        var image = document.createElement('img');
        var texture = new THREE.Texture(canvas);
            texture.minFilter = THREE.NearestFilter;

        image.onload = function() {

            ctx.drawImage(image, 0, 0);

            ctx.textAlign = 'center';

            ctx.font = '140px Arial';
            ctx.fillText(id, middle - 110, middle - 70);

            ctx.font = '75px Arial';
            ctx.fillText(parent, middle + 185, middle - 85);
            
            texture.needsUpdate = true;
        };

        image.src = 'images/workflow/Boton1.png';

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
            }
        }

        if(array.length > 0){ 

            FOCUS.data = window.helper.getLastValueArray(array).mesh;

            updateTileIgnoredAdd();
        }
        else{

            var mesh = FOCUS.mesh;

            var target = window.helper.fillTarget(0, 0, 0, 'table');

            target.hide.rotation.x = 0;
            target.hide.rotation.y = 0;
            target.hide.rotation.z = 0;

            animate(mesh, target.hide, 500);

            FOCUS.data = null;

            window.dragManager.objects = getAllTiles();
        }

        updateTextureParent();
    }

    function updateTileIgnoredAdd(){

        if(actualMode === "edit-path"){

            if(FOCUS.data){ 

                var id = FOCUS.data.userData.id - 1,
                    ignoredTile = FOCUS.data.userData.tile,
                    mesh = FOCUS.mesh;

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
    }

    function deleteSteps(step){

        var list = EDIT_STEPS,
            ORDER = Search(step),
            tilesCalculatePositions = [],
            removeStep = [],
            i = 0, l = 0;

        FOCUS.mesh.material.visible = false;

        if(list[ORDER].children.length > 0){

            if(validateChildrenTiles()){ 

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
            }else{
                resetPositionIdStepMesh(step);
            }
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

        FOCUS.mesh.material.visible = true;

        updateTextureParent();

        updateArrow();

        function updateArrow(){// nuevo // Update after deleted

            for (var i = 0; i < EDIT_STEPS.length; i++) {
                
                for (var j = 0; j < EDIT_STEPS[i].children.length; j++) {
                    
                    for (var k = 0; k < EDIT_STEPS.length; k++) {
                        
                        if(EDIT_STEPS[i].children[j][0] === EDIT_STEPS[k].order[0]){

                            self.createLineStep(EDIT_STEPS[i].target.show, 
                                                EDIT_STEPS[k].target.show,
                                                EDIT_STEPS[i].order[0],
                                                EDIT_STEPS[k].order[0],
                                                EDIT_STEPS[i].tile,
                                                EDIT_STEPS[k].tile, false);
                        }
                    }
                }
            }
        }

        function validateChildrenTiles(){

            var children = list[ORDER].children;

            var parent = searchParentStep(step);

            if(parent){

                var parentTile = list[parent - 1].tile;

                for(i = 0; i < children.length; i++){

                    var idTile = list[children[i][0] - 1].tile;

                    if(parentTile === idTile){
                        return false;
                    }
                }
            }

            return true;
        }

        function deleteStep(order){ // nuevo

            removeMesh(list[order]);

            deleteArrow();

            list.splice(order, 1);
        }

        function deleteArrow(){ // nuevo

            var indice = [];

            for(var j = 0; j < LIST_ARROWS.length; j++){

                window.scene.remove(LIST_ARROWS[j].arrow);
                window.scene.remove(LIST_ARROWS[j].meshPrimary);
                window.scene.remove(LIST_ARROWS[j].meshSecondary);
                window.scene.remove(LIST_ARROWS[j].vector1);
                window.scene.remove(LIST_ARROWS[j].vector2);

                indice.push(j);
            }

            indice.reverse();
            for(var k = 0; k < indice.length; k++){
                LIST_ARROWS.splice(indice[k], 1);
            }
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
    }

    function updateTextureParent(){

        for(var i = 0; i < EDIT_STEPS.length; i++){

            var id = EDIT_STEPS[i].order[0];

            var parent = searchParentStep(id);

            var mesh = EDIT_STEPS[i].mesh;

            mesh.material.map = changeTextureId(id, parent);

            mesh.material.needsUpdate = true;
        }
    }

    function createMeshFocus(){

        if(!FOCUS.mesh){ 

            var height = TILEHEIGHT / 9;
            var width = TILEHEIGHT / 5;

            var canvas = document.createElement('canvas');

            var img = new Image();
            
            var texture = null;

            canvas.height = 412;
            canvas.width = 635;

            var ctx = canvas.getContext('2d');

            img.src = 'images/workflow/Boton2.png';

            var mesh = new THREE.Mesh(
                       new THREE.PlaneBufferGeometry(width, height),
                       new THREE.MeshBasicMaterial({ 
                            side: THREE.DoubleSide, 
                            transparent: true, 
                            map:null 
                        }));

            mesh.renderOrder = 2;

            mesh.scale.set(1.4, 1.4, 1.4);

            mesh.material.depthTest = false;

            window.scene.add(mesh);

            img.onload = function() { 

                ctx.drawImage(img, 0, 0);

                texture = new THREE.Texture(canvas);
                texture.minFilter = THREE.NearestFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.needsUpdate = true;  

                mesh.material.map = texture;

                FOCUS.mesh = mesh;
            };
        }
    }

    function transformData(to){

        var json = [], i = 0, l = 0;

        if(to === 'PREVIEW'){ 

            PREVIEW_STEPS = [];

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
                    title : EDIT_STEPS[i].title[0],
                    desc : EDIT_STEPS[i].desc[0],
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

            EDIT_STEPS = [];

            for(i = 0; i < PREVIEW_STEPS.length; i++){

                var order = null, title = null, platform = null, layer = null, name = null,
                    IDtile = null, parent = null, desc = null;

                order = PREVIEW_STEPS[i].id + 1;

                title = PREVIEW_STEPS[i].title;

                desc = PREVIEW_STEPS[i].desc;

                platform = PREVIEW_STEPS[i].platfrm;

                layer = PREVIEW_STEPS[i].layer;

                name = PREVIEW_STEPS[i].name;

                IDtile = getIdSpecificTile(name, platform, layer);

                parent = searchParent(order - 1);

                if(typeof parent === 'number')
                    parent = parent + 1;

                var mesh = addIdStep(order, IDtile, parent);

                EDIT_STEPS[order - 1].title[0] = title;

                EDIT_STEPS[order - 1].desc[0] = desc;

                FOCUS.data = mesh;
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
    }

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

        if(!MODE().exit()){

            window.buttonsManager.removeAllButtons(true);

            window.dragManager.reset();

            actualMode = mode;

            MODE().enter();
        }

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

                        window.tileManager.transform(false, 1000);

                        window.signLayer.transformSignLayer();

                        var newCenter = new THREE.Vector3(0, 0, 0);
                        var transition = 1500;
                        var z = camera.getMaxDistance() / 2;

                        if(EDIT_STEPS.length > 0){

                            window.dragManager.objects = [];
                            
                            for(var i = 0; i < EDIT_STEPS.length; i++){

                                window.dragManager.objects.push(EDIT_STEPS[i].mesh);
                            }

                            newCenter = EDIT_STEPS[0].target.show.position;

                            z = 500;
                        }
                        else{

                            newCenter = window.viewManager.translateToSection('table', newCenter);
                        }

                        var action = function(tile){

                            if(tile){ 

                                var type = null;

                                if(!tile.userData.type)
                                    type = 'tile';
                                else if(tile.userData.type === 'step')
                                    type = 'step';

                                switch(type) {
                                    case "step":

                                        var step = EDIT_STEPS[tile.userData.id[0] - 1];

                                        updateTileIgnoredAdd();
                                        
                                        window.fieldsEdit.showModal(step);

                                        var vector = window.helper.getSpecificTile(step.tile).mesh.position;

                                        window.camera.move(vector.x, vector.y + 100, 500, 1000, true);

                                        window.dragManager.functions.DROP.push(
                                            function(SELECTED){
                                                SELECTED = null;
                                                window.camera.disable();
                                        });
                                        break;                
                                }
                            }
                            else{
                                window.dragManager.functions.DROP = [];
                                window.fieldsEdit.hiddenModal();
                            }
                        };

                        window.dragManager.functions.CLICK.push(action);

                        window.camera.move(newCenter.x, newCenter.y, z, transition, true);
                        
                        window.headers.transformTable(transition);
                    };             
                    
                    exit = function() {

                        window.fieldsEdit.hiddenModal();
    
                        if(mode === 'preview'){

                            var step = validateFieldSteps();

                            if(step){

                                updateTileIgnoredAdd();
                                            
                                window.fieldsEdit.showModal(step);

                                var vector = window.helper.getSpecificTile(step.tile).mesh.position;

                                window.camera.move(vector.x, vector.y + 100, 500, 1000, true);

                                window.dragManager.functions.DROP.push(
                                    function(SELECTED){
                                        SELECTED = null;
                                        window.camera.disable();
                                });

                                return true;
                            }
                            else{

                                var focus = FOCUS.mesh;

                                focus.visible = false;

                                transformData('PREVIEW');
    
                                cleanEditStep();
    
                                window.dragManager.off();

                                setTimeout(function() { focus.visible = true; }, 1000);
                            }
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
                            window.dragManager.objects = getAllTiles();
                        }

                        var action = function(tile){

                            if(tile){

                                var type = null;

                                if(!tile.userData.type)
                                    type = 'tile';
                                else if(tile.userData.type === 'step')
                                    type = 'step';

                                switch(type) {
                                    case "tile":
                                        var parent = null;

                                        if(FOCUS.data)
                                            parent = FOCUS.data.userData.id[0];

                                        var mesh = addIdStep(EDIT_STEPS.length + 1, tile.userData.id, parent);

                                        FOCUS.data = mesh;
                                        break;
                                    case "step":

                                        FOCUS.data = EDIT_STEPS[tile.userData.id[0] - 1].mesh;

                                        updateTileIgnoredAdd();

                                        window.dragManager.objectsCollision = getAllTiles(tile.userData.tile);
                                        
                                        var drop = function(SELECTED, INTERSECTED, COLLISION, POSITION){

                                            if(SELECTED){

                                                var orderFocus = FOCUS.data.userData.id[0];

                                                if(COLLISION){

                                                    if(!validateCollisionTileSteps(orderFocus, COLLISION.userData.id))
                                                        resetPositionIdStepMesh(orderFocus);
                                                    else
                                                        changeTileStep(orderFocus, COLLISION.userData.id);
                                                }
                                                else{

                                                    if(calculateAreaTile(SELECTED.position)){
                                                        resetPositionIdStepMesh(orderFocus);
                                                    }
                                                    else{
                                                        deleteSteps(orderFocus);
                                                    }
                                                }
                                            }

                                            window.dragManager.objectsCollision = [];
                                            window.dragManager.functions.DROP = [];
                                        };

                                        window.dragManager.functions.DROP = [drop];

                                    break;
                                }
                            }
                        };

                        window.dragManager.functions.CLICK.push(action);

                        var moveAction = function(mesh, position){ 

                            var type;

                            if(!mesh.userData.type)
                                type = 'tile';
                            else if(mesh.userData.type === 'step'){
                                mesh.position.copy(position);
                                FOCUS.mesh.position.copy(position);
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

                        self.changeTexture();

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
                            transformData();
                        }
                        
                    };

                    break; 
                case 'repared':
                    enter = function() {

                        window.dragManager.on();

                        window.helper.hide('backButton', 0, true);

                        window.actualView = false;

                        displayField(false);

                        window.tileManager.transform(false, 1500);

                        window.signLayer.transformSignLayer();

                        var newCenter = new THREE.Vector3(0, 0, 0);
                        var transition = 1500;
                        var z = camera.getMaxDistance() / 2;  

                        newCenter = window.viewManager.translateToSection('table', newCenter);

                        window.camera.move(newCenter.x, newCenter.y, z, transition, true);
                        
                        window.headers.transformTable(transition);

                        createButtonsRepared();
                    };

                    exit = function(){

                    };
            } 

            actions = {
                enter : enter || function(){},
                exit : exit || function(){}
            };

            return actions;
        }
    }

    function createButtonsRepared(){

        for(var i = 0; i < REPARED_STEPS.length; i++){

            var step = window.helper.clone(REPARED_STEPS[i]);

            var id = step.id + 1;

            window.buttonsManager.createButtons('button-step-' + id, 'Step ('+id+')', function(){
                
                window.dragManager.objects = dragModeRepared(step);

            }, null, null, "left");
        }

        function dragModeRepared(step){

            var steps = window.fieldsEdit.actualFlow.steps.slice();

            var parent = searchStepParent();

            var children = validateChildrenTiles();

            var array = [];

            for(var i = 0; i < window.tilesQtty.length; i++){

                if(window.tilesQtty[i] !== parent.element && !children.find(function(x){ if(x.element === window.tilesQtty[i]) return x;})){

                    var tile = window.helper.getSpecificTile(window.tilesQtty[i]).mesh;

                    array.push(tile);
                }
            }

            return array;

            function searchStepParent(){

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

            function validateChildrenTiles(){

                var _array = [];

                var children = step.next;

                for(var i = 0; i < steps.length; i++){

                    if(children.find(function(x){ if(x.id === steps[i].id) return x;}))
                        _array.push(steps[i]);
                }

                return _array;
            }
        }
    }

    function validateFieldSteps(){

        return EDIT_STEPS.find(function(x){ if(x.title[0] === '') return x; });   
    }

    function changeTileStep(orderFocus, newTile){

        var step = EDIT_STEPS[orderFocus - 1];

        var focus = FOCUS.mesh;

        focus.visible = false;

        var oldTile = step.tile;

        var difference = TILEWIDTH / 2;

        var tile = window.helper.getSpecificTile(newTile).target.show;

        var target = window.helper.fillTarget(tile.position.x - difference, tile.position.y, tile.position.z + 1, 'table');

        step.target = target;

        step.tile = newTile;

        step.mesh.userData.tile = newTile;

        calculatePositionsSteps(newTile);

        calculatePositionsSteps(oldTile);

        setTimeout(function() { focus.visible = true; }, 1500);

        updateArrowStepAfterChangeTile(oldTile, newTile, orderFocus);
    }

    function updateArrowStepAfterChangeTile(oldTile, newTile, orderFocus){ // nuevo

        for (var i = 0; i < EDIT_STEPS.length; i++) { 
           
           if((orderFocus === EDIT_STEPS[i].order[0]) && (EDIT_STEPS[i].children.length !== 0)){  
                                                                                                    
                for (var s = 0; s < EDIT_STEPS[i].children.length; s++) {

                    for (var j = 0; j < EDIT_STEPS.length; j++) { 

                        if(EDIT_STEPS[i].children[s][0] === EDIT_STEPS[j].order[0]){ // target // if 2

                            for (var k = 0; k < LIST_ARROWS.length; k++) {
                            
                                if((orderFocus === LIST_ARROWS[k].originID) && (EDIT_STEPS[j].order[0] === LIST_ARROWS[k].targetID)){

                                    window.scene.remove(LIST_ARROWS[k].arrow);
                                    window.scene.remove(LIST_ARROWS[k].meshPrimary);
                                    window.scene.remove(LIST_ARROWS[k].meshSecondary);
                                    window.scene.remove(LIST_ARROWS[k].vector1);
                                    window.scene.remove(LIST_ARROWS[k].vector2);

                                    self.createLineStep(EDIT_STEPS[i].target.show, 
                                                        EDIT_STEPS[j].target.show, 
                                                        EDIT_STEPS[i].order[0], 
                                                        EDIT_STEPS[j].order[0],
                                                        EDIT_STEPS[i].tile,
                                                        EDIT_STEPS[j].tile, true, k);
                                }
                            }
                        } // if 2 
                    }
                }    
            }

            if(EDIT_STEPS[i].children.length !== 0){ 

                for (var t = 0; t < EDIT_STEPS[i].children.length; t++) {

                    if(orderFocus === EDIT_STEPS[i].children[t][0]){ // buscamos el padre y el origen a la vez

                        for (var n = 0; n < EDIT_STEPS[i].children.length; n++) {
                            
                            for (var l = 0; l < EDIT_STEPS.length; l++) {
                                
                                if(EDIT_STEPS[i].children[n][0] === EDIT_STEPS[l].order[0]){ // target

                                    for (var m = 0; m < LIST_ARROWS.length; m++) {
                                        
                                        if(EDIT_STEPS[i].order[0] === LIST_ARROWS[m].originID && EDIT_STEPS[l].order[0] === LIST_ARROWS[m].targetID){

                                            window.scene.remove(LIST_ARROWS[m].arrow);
                                            window.scene.remove(LIST_ARROWS[m].meshPrimary);
                                            window.scene.remove(LIST_ARROWS[m].meshSecondary);
                                            window.scene.remove(LIST_ARROWS[m].vector1);
                                            window.scene.remove(LIST_ARROWS[m].vector2);

                                            self.createLineStep(EDIT_STEPS[i].target.show, 
                                                            EDIT_STEPS[l].target.show, 
                                                            EDIT_STEPS[i].order[0], 
                                                            EDIT_STEPS[l].order[0],
                                                            EDIT_STEPS[i].tile,
                                                            EDIT_STEPS[l].tile, true, m);
                                        }
                                    }
                                }
                            }   
                        }
                    }
                }               
            }
            
            if((oldTile === EDIT_STEPS[i].tile || newTile === EDIT_STEPS[i].tile) && orderFocus !== EDIT_STEPS[i].order[0]){ // origin

                for (var u = 0; u < EDIT_STEPS[i].children.length; u++){
                    
                    if(EDIT_STEPS[i].children.length !== 0){

                        for (var o = 0; o < EDIT_STEPS.length; o++) {

                            if((EDIT_STEPS[i].children[u][0] === EDIT_STEPS[o].order[0])){ // target // if 2 padre hijo

                                for (var p = 0; p < LIST_ARROWS.length; p++) {
                                    
                                    if(EDIT_STEPS[i].order[0] === LIST_ARROWS[p].originID){

                                        window.scene.remove(LIST_ARROWS[p].arrow);
                                        window.scene.remove(LIST_ARROWS[p].meshPrimary);
                                        window.scene.remove(LIST_ARROWS[p].meshSecondary);
                                        window.scene.remove(LIST_ARROWS[p].vector1);
                                        window.scene.remove(LIST_ARROWS[p].vector2);

                                        self.createLineStep(EDIT_STEPS[i].target.show, 
                                                            EDIT_STEPS[o].target.show, 
                                                            EDIT_STEPS[i].order[0], 
                                                            EDIT_STEPS[o].order[0],
                                                            EDIT_STEPS[i].tile,
                                                            EDIT_STEPS[o].tile, true, p);
                                    }
                                }
                            } // if 2
                        }     
                    }
                }

                for (var q = 0; q < EDIT_STEPS.length; q++) {
                    
                    if(EDIT_STEPS[q].children.length !== 0){

                        for (var w = 0; w < EDIT_STEPS[q].children.length; w++) {
                            
                            if(EDIT_STEPS[i].order[0] === EDIT_STEPS[q].children[w][0]){ // origin // if 2 hijo padre

                                for (var r = 0; r < LIST_ARROWS.length; r++) {
                                    
                                    if(EDIT_STEPS[q].order[0] === LIST_ARROWS[r].originID){

                                        window.scene.remove(LIST_ARROWS[r].arrow);
                                        window.scene.remove(LIST_ARROWS[r].meshPrimary);
                                        window.scene.remove(LIST_ARROWS[r].meshSecondary);
                                        window.scene.remove(LIST_ARROWS[r].vector1);
                                        window.scene.remove(LIST_ARROWS[r].vector2);

                                        self.createLineStep(EDIT_STEPS[q].target.show, 
                                                            EDIT_STEPS[i].target.show, 
                                                            EDIT_STEPS[q].order[0], 
                                                            EDIT_STEPS[i].order[0],
                                                            EDIT_STEPS[q].tile,
                                                            EDIT_STEPS[i].tile, true, r);
                                    }
                                }
                            } // if 2
                        }  
                    }
                }
            }
        }
    }

    function resetPositionIdStepMesh(orderFocus){

        var focus = FOCUS.mesh;

        var step = EDIT_STEPS[orderFocus - 1];

        focus.visible = false;

        var mesh = step.mesh;

        var xInit = mesh.position.x - 0.5;

        var xEnd = mesh.position.x + 0.5;

        var target = step.target.show;

        if(target.position.x >= xInit && target.position.x <= xEnd)
            focus.visible = true;

        animate(mesh, target, 300, function(){
            FOCUS.mesh.position.copy(mesh.position);
            focus.visible = true;
        });
    }

    function validateCollisionTileSteps(orderStepFocus, tileValidate){

        var validate = true,
            stepFocus = EDIT_STEPS[orderStepFocus - 1],
            children = stepFocus.children,
            parent = searchParentStep(orderStepFocus);

        if(parent){
            if(tileValidate === EDIT_STEPS[parent - 1].tile)
                validate = false;
        }

        if(children.length > 0){

            for(var i = 0; i < children.length; i++){

                var order = children[i][0];

                if(tileValidate === EDIT_STEPS[order - 1].tile)
                    validate = false;
            }
        }

        return validate;
    }

    function searchParentStep(order){

        var i, l;

        for(i = 0; i < EDIT_STEPS.length; i++){

            var children = EDIT_STEPS[i].children;

            for(l = 0; l < children.length; l++){

                if(children[l][0] === order)
                    return EDIT_STEPS[i].order[0];
            }
        }

        return false;
    }

    function getAllTiles(idIgnore){

        var array = [];

        for(var t = 0; t < window.tilesQtty.length; t++){

            if(window.tilesQtty[t] !== idIgnore){

                var tile = window.helper.getSpecificTile(window.tilesQtty[t]).mesh;

                array.push(tile);
            }
        }

        return array;
    }

    function calculateAreaTile(position){

        var tile = window.helper.getSpecificTile(FOCUS.data.userData.tile).target.show;

        var x = position.x,
            y = position.y,
            xInit = tile.position.x - (TILEWIDTH / 2) - window.TILE_SPACING,
            yInit = tile.position.y + (TILEHEIGHT / 2),
            xEnd = xInit + TILEWIDTH,
            yEnd = yInit - TILEHEIGHT;

        if((x >= xInit && x <= xEnd) && (y <= yInit && y >= yEnd))
            return true;
        else
            return false;
    }

    function displayField(visible){

        if(visible)
            window.helper.show("workflow-header");
        else
            window.helper.hide("workflow-header", 1000, true);
    }

    function newOnKeyDown(event){

        if(event.keyCode === 27) {

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

        FOCUS.data = null;

        EDIT_STEPS = [];
    } 

    function cleanButtons(){

        window.buttonsManager.deleteButton('button-save');
        window.buttonsManager.deleteButton('button-preview');
        window.buttonsManager.deleteButton('button-path');
        window.buttonsManager.deleteButton('button-Steps');   
    }

    function listOrden(){
        function add_step(){
            var canvas = document.createElement('canvas');
            canvas.className = "steps-list-step";
            var ctx = canvas.getContext("2d");
            
            canvas.dataset.num = count;
            canvas.onclick = function () {
                // -- ricardo --
                alert(this.dataset.num);
            };
            
            document.getElementById("steps-list-content").appendChild(canvas);
            
            canvas.width  = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            ctx.width  = canvas.offsetWidth;
            ctx.height = canvas.offsetHeight;
            
            ctx.beginPath();
            ctx.arc(ctx.width/2, ctx.height/2, 45, 0, 2*Math.PI);
            ctx.stroke();
            
            ctx.font = "30px Arial";
            ctx.textAlign = "center";
            ctx.fillText(count, ctx.width/2, ctx.height/2 + 10);
            
            count++;
        }
    }

    this.getFocus = function(){
        return FOCUS;
    };

}