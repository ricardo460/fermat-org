function WorkFlowEdit() {

    var self = this;

    var classFlow = null;

    var vectorArrow = '';

    var FOCUS = {
            mesh : null,
            data : null,
        };

    var EDIT_STEPS = [];

    var PREVIEW_STEPS = [];

    var REPARED_STEPS = [];

    var SHOW_ARROW = [];

    var TYPE = {
            async : 0xFF0000,
            direct: 0x0000FF
        };

    var actualMode = null;

    var TILEWIDTH = window.TILE_DIMENSION.width - window.TILE_SPACING;
    var TILEHEIGHT = window.TILE_DIMENSION.height - window.TILE_SPACING;

    var LIST_ARROWS = [];


    this.get = function(){
        return EDIT_STEPS;
    };

    this.getp = function(){
        return PREVIEW_STEPS;
    }; 

    this.getr = function(){
        return LIST_ARROWS;
    };  

    this.deleteStepList = function(step){
        deleteSteps(step);
    } 

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

            cleanEditStep();

            classFlow.deleteStep();

            classFlow = null;

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

            var steps = window.fieldsEdit.actualFlow.steps.slice();

            var order = [];

            var repared = [];

            var msj = "Se han eliminado los siguientes pasos: \n";

            for(var i = 0; i < steps.length; i++){

                var title = steps[i].title;

                if(!PREVIEW_STEPS.find(function(x){if(x.title === title) return x;})){
                    order.push(steps[i]);
                    steps[i].state = 'error';
                }
                else{
                    steps[i].state = 'good';
                }

                repared.push(steps[i]);
            }
            if(order.length > 0){

                order.find(function(x){msj += "* ("+(x.id + 1)+")" +x.title +".\n";});

                msj += "Por los siguentes motivos: \n * No tener un TILE asignado." +
                "\n * Repetir continuamente el mismo TILE.";

                if(window.confirm(msj)) 
                    return repared;
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

                if(typeof parent.id === 'number'){
                    var obj = {
                        id : object.order,
                        type : parent.typeCall
                    };
                    searchStep(parent.id + 1).children.push(obj);
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

                    var idTile = array[children[i].id[0] - 1].tile;

                    if(tile === idTile){
                        return array[children[i].id[0] - 1].order[0];
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

                        var obj = {
                            id : steps[i].id,
                            typeCall : next[l].type
                        }
                        return obj;
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
                    newIdStep = Search(oldChildren[0].id[0]),
                    newStep = list[newIdStep];
        
                odlStep[0] = newStep.order[0];
                newStep.order = odlStep;

                deleteStep(ORDER);

                for(i = 1; i < oldChildren.length; i++){

                    fillRemove(oldChildren[i].id[0]);

                    removeStep.push(oldChildren[i].id[0]);
                }

                for(i = 0; i < removeStep.length; i++)
                     deleteStep(Search(removeStep[i]));
            }
            else{

                for(i = 0; i < list.length; i++){

                    var children = list[i].children;

                    for(l = 0; l < children.length; l++){ 

                        if(children[l].id[0] === step)
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

                    var children = list[Search(list[order].children[i].id[0])].children;

                    removeStep.push(list[order].children[i].id[0]);

                    if(children.length > 0)
                        fillRemove(list[order].children[i].id[0]);
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

    function addIdStep(id, IDtile, parent, typeCall){

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
                newArray[0] = window.helper.getLastValueArray(children).id[0] + 0.5;

            var obj = {
                id : newArray,
                type : 'direct call'
            };

            if(typeCall)
                obj.type = typeCall;
            
            children.push(obj);
        }
        
        var object = {
                    order : newArray,
                    mesh : mesh,
                    target : target,
                    tile : IDtile,
                    children : [],
                    existArrow: false,
                    title : [''],
                    desc : [''], 
                    state : 'good'
                };

        EDIT_STEPS.push(object);

        mesh.material.map = changeTextureId(id, parent);

        calculatePositionsSteps(IDtile);

        if(parent){
            orderPositionSteps();
        }

        updateArrow();

        return mesh;
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

    function changeArrowTest(state, type, IdOrigen, IdTarget){

        var object = {
            dataArrow : null,
            arrows : {
                vector1: null,
                vector2: null
            }
        };

        if(state){

            for(var i = 0; i < SHOW_ARROW.length; i++){

                var dataArrow = SHOW_ARROW[i].dataArrow;

                dataArrow.meshPrimary.visible = true;
                dataArrow.meshSecondary.visible = true;
                dataArrow.arrow.visible = true;
                dataArrow.vector1.visible = true;
                dataArrow.vector2.visible = true;

                var vector1 = SHOW_ARROW[i].arrows.vector1;
                var vector2 = SHOW_ARROW[i].arrows.vector2;

                if(vector1)
                    window.scene.remove(vector1);

                if(vector2)
                    window.scene.remove(vector2);
            }

            SHOW_ARROW = [];
        }
        else{

            var mesh = null;

            object.dataArrow = LIST_ARROWS.find(function(x){
                if(x.originID[0] === IdOrigen && x.targetID[0] === IdTarget)
                    return x;
            });

            if(!object.dataArrow){
                object.dataArrow = LIST_ARROWS.find(function(x){
                    if(x.originID[0] === IdTarget && x.targetID[0] === IdOrigen)
                        return x;
                });
            }

            if(object.dataArrow){ 

                if(type === 'changeStep'){
                    mesh = object.dataArrow.meshPrimary;
                    object.dataArrow.meshSecondary.visible = false;
                }
                else if(type === 'fork'){
                    mesh = object.dataArrow.meshSecondary;
                    object.dataArrow.meshPrimary.visible = false;
                }
                else{
                    object.dataArrow.meshPrimary.visible = false;
                    object.dataArrow.meshSecondary.visible = false;
                }

                object.dataArrow.arrow.visible = false;
                object.dataArrow.vector1.visible = false;
                object.dataArrow.vector2.visible = false;

                var color = TYPE.async;

                var typeCall = EDIT_STEPS[IdOrigen - 1].children.find(function(x){
                    if(x.id[0] === IdTarget)
                        return x;
                });

                if(!typeCall){

                    typeCall = EDIT_STEPS[IdTarget - 1].children.find(function(x){
                        if(x.id[0] === IdOrigen)
                            return x;
                    });
                }

                if(typeCall){

                    if(typeCall.type === "direct call")
                        color = TYPE.direct;
                }

                var from = null;
                var to = null;
                var direction = null;
                var length = null;

                var origen = null;
                var target = EDIT_STEPS[IdTarget - 1].target.show.position;

                switch(type) {

                    case 'changeStep':
                    case 'fork':

                        origen = EDIT_STEPS[IdOrigen - 1].target.show.position;
                        from = new THREE.Vector3(origen.x, origen.y, 2);
                        to = new THREE.Vector3(mesh.position.x, mesh.position.y, 2);

                        direction = to.clone().sub(from);
                        length = direction.length();
                        arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, color, 0.1, 0.1);
                        arrowHelper.userData.from = from;
                        object.arrows.vector1 = arrowHelper;
                        window.scene.add(arrowHelper);

                        from = new THREE.Vector3(target.x, target.y, 2);

                        direction = to.clone().sub(from);
                        length = direction.length();
                        arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, color, 0.1, 0.1);
                        arrowHelper.userData.from = from;
                        object.arrows.vector2 = arrowHelper;
                        window.scene.add(arrowHelper);

                        break;
                    default:

                        origen = EDIT_STEPS[IdOrigen - 1].mesh.position;

                        from = new THREE.Vector3(target.x, target.y, 2);
                        to = new THREE.Vector3(origen.x, origen.y, 2);

                        direction = to.clone().sub(from);
                        length = direction.length();
                        arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, color, 0.1, 0.1);
                        arrowHelper.userData.from = from;
                        object.arrows.vector1 = arrowHelper;
                        window.scene.add(arrowHelper);

                        break; 
                }

                SHOW_ARROW.push(object);
            }
        }
    }

    function updatePositionArrowTest(position){

        var from = null, to = null, direction = null, length = null;

        for(var i = 0; i < SHOW_ARROW.length; i++){

            var vector1 = SHOW_ARROW[i].arrows.vector1;
            var vector2 = SHOW_ARROW[i].arrows.vector2;

            if(vector1){ 

                from = vector1.userData.from;
                to = new THREE.Vector3(position.x, position.y, 2);
                direction = to.clone().sub(from);
                length = direction.length();
                vector1.setDirection(direction.normalize());
                vector1.setLength(length,0.1,0.1);
            }

            if(vector2){ 

                from = vector2.userData.from;
                to = new THREE.Vector3(position.x, position.y, 2);
                direction = to.clone().sub(from);
                length = direction.length();
                vector2.setDirection(direction.normalize());
                vector2.setLength(length,0.1,0.1);
            }
        }
    }

    function createArrowTest(IdOrigen){

        var children = EDIT_STEPS[IdOrigen - 1].children;

        var parent = searchParentStep(IdOrigen);

        if(children.length > 0){

            for(var i = 0; i < children.length; i++){

                changeArrowTest(false, 'step', IdOrigen, children[i].id[0]);
            }
        }

        if(typeof parent === 'number'){
            changeArrowTest(false, 'step', IdOrigen, parent);
        }
    }

    function hideButtonsArrows(_keep){

        var keep = _keep || false; 
        
        for(var i = 0; i < LIST_ARROWS.length; i++){

            LIST_ARROWS[i].meshPrimary.visible = keep;
            LIST_ARROWS[i].meshSecondary.visible = keep;
        }
    }

    function addIdStepDrag(idOrigen, idTarget, IDtile){

        var mesh = createIdStep(),
            difference = TILEWIDTH / 2,
            stepOrigen = EDIT_STEPS[idOrigen - 1],
            stepTarget = EDIT_STEPS[idTarget - 1];

        var newArray = [idTarget];

        var tile = window.helper.getSpecificTile(IDtile).target.show;

        var target = window.helper.fillTarget(tile.position.x - difference, tile.position.y, tile.position.z + 1, 'table');

        mesh.position.copy(target.hide.position);

        mesh.rotation.copy(target.hide.rotation);

        mesh.userData = {
                id : newArray,
                tile : IDtile,
                type: 'step'
            };

        var children = stepOrigen.children;

        for(var i = 0; i < children.length; i++){

            if(children[i].id[0] === idTarget){
                children[i].id = newArray;
            }
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

        stepTarget.order[0] =  stepTarget.order[0] + 0.5;

        var obj = {
                id : stepTarget.order,
                type : 'direct call'
            };

        object.children.push(obj);

        EDIT_STEPS.push(object);

        mesh.material.map = changeTextureId(idTarget, parent);

        calculatePositionsSteps(IDtile);

        orderPositionSteps();

        updateArrow();

        return mesh;
    }

    function changeTypeArrow(arrow){

        var idOrigin = arrow.originID[0],
            idTarget = arrow.targetID[0];

        var object = EDIT_STEPS[idOrigin - 1].children.find(function(x){
            if(x.id[0] === idTarget)
                return x;
        });

        if(object){

            if(object.type === 'direct call'){
                object.type = 'event';
                color = TYPE.async;
            }
            else{
                object.type = 'direct call';
                color = TYPE.direct;
            }

            aplicarColor(arrow.arrow);
            aplicarColor(arrow.vector1);
            aplicarColor(arrow.vector2);
        }

        function aplicarColor(element){

            for(var i = 0; i < element.children.length; i++){

                element.children[i].material.color.setHex(color);
            }
        }
    }

    this.createLineStep = function(meshOrigin, meshTarget, idOrigin, idTarget, tileOrigin, tileTarget){

        var mesh, vertexPositions, geometry, from, to, color, listSteps, midPoint, distanceX, distanceY;
        var positionMesh = {x: null, y: null, z : null}, meshTrinogometry;

        var objArrow = {
                tileOriginId : null,
                tileTargetId : null,
                originID: null,
                targetID: null,
                vector1: null,
                meshPrimary: null,
                vector2:null,
                meshSecondary: null,
                arrow: null,
                meshPrimaryTarget: [],
                meshSecondaryTarget: []
            };
        

        var object = EDIT_STEPS[idOrigin[0] - 1].children.find(function(x){
            if(x.id[0] === idTarget[0])
                return x;
        });

        var color = TYPE.direct;

        if(object){

            if(object.type !== "direct call")
                color = TYPE.async;
        }

        var vertexOriginX = meshOrigin.position.x,
            vertexOriginY = meshOrigin.position.y,
            vertexDestX = meshTarget.position.x,
            vertexDestY = meshTarget.position.y;

        objArrow.originID = idOrigin;
        objArrow.targetID = idTarget;
        objArrow.tileOriginId = tileOrigin;
        objArrow.tileTargetId = tileTarget;

        var angleRadians = Math.atan2(vertexDestY - vertexOriginY, vertexDestX - vertexOriginX);

        if((vertexOriginY >  vertexDestY) && (vertexOriginX !== vertexDestX)){ // si es descendente diagonal
            
            from = new THREE.Vector3(vertexOriginX, vertexOriginY, 2);

            meshTrinogometry = trigonometry(vertexOriginX, vertexOriginY, 40, angleRadians);
            to = new THREE.Vector3(meshTrinogometry.x, meshTrinogometry.y, 2);
            
            vectorArrow = 'arrowDesc';
        }
        else if((vertexOriginY <  vertexDestY) && (vertexOriginX !== vertexDestX)){ // si es ascendente diagonal 
        

            from = new THREE.Vector3(vertexOriginX, vertexOriginY, 2);

            meshTrinogometry = trigonometry(vertexOriginX, vertexOriginY, 40, angleRadians);
            to = new THREE.Vector3(meshTrinogometry.x, meshTrinogometry.y, 2);

            vectorArrow = 'arrowAsc';
        }

        else if((vertexOriginX == vertexDestX) && (vertexOriginY > vertexDestY)){ // si es vertical descendente

            from = new THREE.Vector3(vertexOriginX, vertexOriginY, 2);

            to = new THREE.Vector3(vertexOriginX, vertexOriginY - 20, 2);

            meshTrinogometry = to;
            vectorArrow = 'arrowDescVer';
        }
        else if((vertexOriginX == vertexDestX) && (vertexOriginY < vertexDestY)){ // si es vertical ascendente
           
            from = new THREE.Vector3(vertexOriginX, vertexOriginY, 2);

            to = new THREE.Vector3(vertexOriginX, vertexOriginY + 20, 2);

            meshTrinogometry = to;
            vectorArrow = 'arrowAscVer';
        }

        else if((vertexOriginY == vertexDestY) && (vertexOriginX < vertexDestX)){ // Horizontal Derecha

            from = new THREE.Vector3(vertexOriginX, vertexOriginY, 2);
            
            to = new THREE.Vector3(vertexOriginX + 40, vertexOriginY, 2);
            
            meshTrinogometry = to;
            vectorArrow = 'arrowRight';
        } 

        else if((vertexOriginY == vertexDestY) && (vertexOriginX > vertexDestX)){ // Horizontal Derecha

            from = new THREE.Vector3(vertexOriginX, vertexOriginY, 2);
            
            to = new THREE.Vector3(vertexOriginX - 40, vertexOriginY, 2);
            
            meshTrinogometry = to;
            vectorArrow = 'arrowLeft';
        }  
                
        var direction = to.clone().sub(from);

        var length = direction.length();

        var arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, color, 0.1, 0.1);
        
        var dataArrow = {
            originOrder : idOrigin,
            targetOrder : idTarget,
            type : 'arrow'
        };

        arrowHelper.userData = dataArrow;

        arrowHelper.line.userData = dataArrow;

        arrowHelper.cone.userData = dataArrow;

        window.scene.add(arrowHelper);

        mesh = createSimbol();

        mesh.material.map = createTextureButton('+');

        mesh.userData = {
            originOrder : idOrigin,
            targetOrder : idTarget,
            type : 'changeStep'
        };

        mesh.position.set(meshTrinogometry.x, meshTrinogometry.y, 3);

        objArrow.vector1 = arrowHelper;
        objArrow.meshPrimary = mesh;

        var target = window.helper.fillTarget(meshTrinogometry.x, meshTrinogometry.y, 3, 'table');
        objArrow.meshPrimaryTarget = target;

        directionLineMesh(meshTrinogometry.x, meshTrinogometry.y, angleRadians);

        LIST_ARROWS.push(objArrow);
         
        function directionLineMesh(x, y, angleRadians){

            var mesh, vertexPositions, from, to, midPoint, meshTrinogometry;
            var positionMesh = {x: null, y: null, z : null};

            switch(vectorArrow){

                case 'arrowDesc':
                case 'arrowAsc':
                    from = new THREE.Vector3(x, y, 2);
                    
                    meshTrinogometry = trigonometry(x, y, 30, angleRadians);

                    to = new THREE.Vector3(meshTrinogometry.x, meshTrinogometry.y, 2);

                    break;

                case 'arrowDescVer':
                    from = new THREE.Vector3(x, y, 2);
                    
                    to = new THREE.Vector3(x, y - 20, 2);

                    meshTrinogometry = to;

                    break;

                case 'arrowAscVer':
                    from = new THREE.Vector3(x, y, 2);
                    
                    to = new THREE.Vector3(x, y + 20, 2);

                    meshTrinogometry = to;

                    break;

                case 'arrowRight':
                    from = new THREE.Vector3(x, y, 2);
                
                    to = new THREE.Vector3(x + 30, y, 2);

                    meshTrinogometry = to;

                    break;

                case 'arrowLeft':
                    from = new THREE.Vector3(x, y, 2);

                    to = new THREE.Vector3(x - 30, y, 2);

                    meshTrinogometry = to;

                    break;

                default:
                    break;
            }

            var direction = to.clone().sub(from);

            var length = direction.length();

            var arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, color, 0.1, 0.1); // Arrow Azul

            arrowHelper.userData = dataArrow;

            arrowHelper.line.userData = dataArrow;

            arrowHelper.cone.userData = dataArrow;

            window.scene.add(arrowHelper);
            
            mesh = createSimbol();

            mesh.material.map = createTextureButton('y');

            objArrow.vector2 = arrowHelper;
            objArrow.meshSecondary = mesh;

            mesh.userData = {
                originOrder : objArrow.originID,
                targetOrder : objArrow.targetID,
                type : 'fork'
            };

            directionArrowMesh(meshTrinogometry.x, meshTrinogometry.y, angleRadians);


            mesh.position.set(meshTrinogometry.x, meshTrinogometry.y, 3);
                    

            var target = window.helper.fillTarget(meshTrinogometry.x, meshTrinogometry.y, 3, 'table');
            objArrow.meshSecondaryTarget = target;
        }

        function createTextureButton(src){

            var canvas = document.createElement('canvas');
                canvas.height = 128;
                canvas.width = 128;
            var ctx = canvas.getContext('2d');
            var image = document.createElement('img');
            var texture = new THREE.Texture(canvas);
                texture.minFilter = THREE.NearestFilter;

            image.onload = function() {

                ctx.drawImage(image, 0, 0);

                ctx.textAlign = 'center';
                
                texture.needsUpdate = true;
            };

            image.src = 'images/workflow/button_'+src+'.png';

            return texture;
        }

        function directionArrowMesh(x, y, angleRadians){ // x y origen 

            var from, to, hypotenuse;

            from = new THREE.Vector3(x, y, 2);
            
            if(vectorArrow === 'arrowDescVer' || vectorArrow === 'arrowAscVer'){ // valor de distancia de la felcha

                hypotenuse = 10;
            }
            else{
                hypotenuse = 15;
            }

            to = trigonometry(x, y, from.distanceTo(new THREE.Vector3(vertexDestX, vertexDestY, 2)) - hypotenuse, angleRadians);
            to.z = 2;

            var direction = to.clone().sub(from);

            var length = direction.length();

            var arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, color, 4*2.5, 4*2.5);

            arrowHelper.userData = dataArrow;

            arrowHelper.line.userData = dataArrow;

            arrowHelper.cone.userData = dataArrow;

            window.scene.add(arrowHelper);

            objArrow.arrow = arrowHelper;
        }
    };

    function trigonometry(vertexOriginX, vertexOriginY, hypotenuse, angleRadians){

        var co, ca, vector = new THREE.Vector3(), x, y;

        x = vertexOriginX;
        y = vertexOriginY;

        co = Math.sin(angleRadians) * hypotenuse;
        ca = Math.cos(angleRadians) * hypotenuse;

        x = x + ca;
        y = y + co;

        vector.x = x;
        vector.y = y;

        return vector;
    }

    function createSimbol(){ 

        var tileWidth = (window.TILE_DIMENSION.width - window.TILE_SPACING) / 2,
            tileHeight = (window.TILE_DIMENSION.height - window.TILE_SPACING) / 8;

        var mesh =  new THREE.Mesh(
                    new THREE.PlaneBufferGeometry(tileHeight, tileHeight),
                    new THREE.MeshBasicMaterial({
                            side: THREE.DoubleSide,
                            transparent: true, 
                            map:null 
                    }));

        mesh.renderOrder = 1;

        mesh.material.needsUpdate = true;

        mesh.material.depthTest = false;

        window.scene.add(mesh);

        return mesh;
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

    function orderPositionSteps(){

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

            updateStepList();

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

            updateStepList();

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

                for(var i = 0; i < LIST_ARROWS.length; i++){
                    
                    window.dragManager.objects.push(LIST_ARROWS[i].meshPrimary);
                    window.dragManager.objects.push(LIST_ARROWS[i].meshSecondary);  
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
            i = 0, l = 0,
            state = true;

        FOCUS.mesh.material.visible = false;

        if(list[ORDER].children.length > 0){

            if(validateChildrenTiles(step)){ 

                var oldChildren = list[ORDER].children,
                    odlStep = list[ORDER].order,
                    newIdStep = Search(oldChildren[0].id[0]),
                    newStep = list[newIdStep];
        
                odlStep[0] = newStep.order[0];
                newStep.order = odlStep;
                newStep.mesh.userData.id = odlStep;

                deleteStep(ORDER);

                for(i = 1; i < oldChildren.length; i++){

                    fillRemove(oldChildren[i].id[0]);

                    removeStep.push(oldChildren[i].id[0]);
                }

                for(i = 0; i < removeStep.length; i++)
                     deleteStep(Search(removeStep[i]));
            }else{
                state = false;
                resetPositionIdStepMesh(step);
            }
        }
        else{

            for(i = 0; i < list.length; i++){

                var children = list[i].children;

                for(l = 0; l < children.length; l++){ 

                    if(children[l].id[0] === step)
                        children.splice(l, 1);
                }
            }

            deleteStep(ORDER);
        }

        for(i = 0; i < tilesCalculatePositions.length; i++)
            calculatePositionsSteps(tilesCalculatePositions[i]);


        if(state){

            orderPositionSteps();

            updateArrow();

            updateTextureParent();
        }

        FOCUS.mesh.material.visible = true;

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

                var children = list[Search(list[order].children[i].id[0])].children;

                removeStep.push(list[order].children[i].id[0]);

                if(children.length > 0)
                    fillRemove(list[order].children[i].id[0]);
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

    function validateChildrenTiles(step){

        var list = EDIT_STEPS;

        var children = list[step - 1].children;

        var parent = searchParentStep(step);

        if(parent){

            var parentTile = list[parent - 1].tile;

            for(i = 0; i < children.length; i++){

                var idTile = list[children[i].id[0] - 1].tile;

                if(parentTile === idTile){
                    return false;
                }
            }
        }

        return true;
    }

    function updateArrow(){

        var i, l;

        for(i = 0; i < LIST_ARROWS.length; i++){

            window.scene.remove(LIST_ARROWS[i].arrow);
            window.scene.remove(LIST_ARROWS[i].meshPrimary);
            window.scene.remove(LIST_ARROWS[i].meshSecondary);
            window.scene.remove(LIST_ARROWS[i].vector1);
            window.scene.remove(LIST_ARROWS[i].vector2);
        }

        LIST_ARROWS = [];

        for(i = 0; i < EDIT_STEPS.length; i++){

            var children = EDIT_STEPS[i].children;
            
            for (l = 0; l < children.length; l++) {

                var step = EDIT_STEPS.find( function(x){
                    if(children[l].id[0] === x.order[0])
                        return x;
                });
              
                if(step){

                    self.createLineStep(EDIT_STEPS[i].target.show, 
                                        step.target.show,
                                        EDIT_STEPS[i].order,
                                        step.order,
                                        EDIT_STEPS[i].tile,
                                        step.tile, false);
                }
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

                mesh.material.needsUpdate = true;

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
                        id : children[l].id[0] - 1,
                        type: children[l].type
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
                    IDtile = null, parent = null, desc = null, id = null, typeCall = null;

                order = PREVIEW_STEPS[i].id + 1;

                title = PREVIEW_STEPS[i].title;

                desc = PREVIEW_STEPS[i].desc;

                platform = PREVIEW_STEPS[i].platfrm;

                layer = PREVIEW_STEPS[i].layer;

                name = PREVIEW_STEPS[i].name;

                IDtile = getIdSpecificTile(name, platform, layer);

                parent = searchParent(order - 1);

                if(parent){
                    id = parent.id + 1;
                    typeCall = parent.typeCall;
                }

                var mesh = addIdStep(order, IDtile, id, typeCall);

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

                    if(next[l].id === id){

                        var obj = {
                            id : PREVIEW_STEPS[i].id,
                            typeCall : next[l].type
                        };
                        return obj;
                    }    
                }
            }
            return null;
        }

        function searchChildren(id, type){

            var i, l;

            for(i = 0; i < EDIT_STEPS.length; i++){

                var children = EDIT_STEPS[i].children;

                for(l = 0; l < children.length; l++){

                    if(children[l].id[0] === id){

                        EDIT_STEPS[i].children[l].type = type;
                        return null;
                    }    
                }
            }
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

                        createMeshFocus();

                        window.dragManager.on();

                        window.helper.hide('backButton', 0, true);

                        window.fieldsEdit.hiddenStepsList(true);

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

                            updateStepList();

                            hideButtonsArrows();

                            window.dragManager.objects = [];
                            
                            for(var i = 0; i < EDIT_STEPS.length; i++){

                                window.dragManager.objects.push(EDIT_STEPS[i].mesh);
                            }

                            for(var l = 0; l < LIST_ARROWS.length; l++){

                                window.dragManager.objects.push(LIST_ARROWS[l].arrow);
                                window.dragManager.objects.push(LIST_ARROWS[l].vector1);
                                window.dragManager.objects.push(LIST_ARROWS[l].vector2);
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
                                else
                                    type = tile.userData.type;

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
                                    case "arrow":

                                        var origin = tile.userData.originOrder[0],
                                            target = tile.userData.targetOrder[0];

                                        var arrow = LIST_ARROWS.find(function(x){
                                                        if(x.originID[0] === origin && x.targetID[0] === target)
                                                            return x;
                                                    });

                                        changeTypeArrow(arrow);
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

                        createMeshFocus();

                        buttons.steps();

                        window.dragManager.styleMouse.CROSS = 'copy';

                        if(EDIT_STEPS.length > 0){
                            updateTileIgnoredAdd();
                            hideButtonsArrows(true);
                        }
                        else{
                            window.dragManager.objects = getAllTiles();
                        }

                        var clickAction = function(tile){

                            if(tile){

                                var type = null;

                                if(!tile.userData.type)
                                    type = 'tile';
                                else 
                                    type = tile.userData.type;

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

                                        createArrowTest(tile.userData.id[0]);

                                        window.dragManager.objectsCollision = getAllTiles(tile.userData.tile);
                                        
                                        var drop = function(SELECTED, INTERSECTED, COLLISION, POSITION){

                                            if(SELECTED){

                                                changeArrowTest(true, type, tile.userData.originOrder, tile.userData.targetOrder);

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
                                    case "changeStep":

                                        changeArrowTest(false, type, tile.userData.originOrder[0], tile.userData.targetOrder[0]);

                                        window.dragManager.objectsCollision = getAllTiles(tile.userData.tile);
                                        
                                        var drop = function(SELECTED, INTERSECTED, COLLISION, POSITION){

                                            changeArrowTest(true, type, tile.userData.originOrder[0], tile.userData.targetOrder[0]);

                                            if(SELECTED){

                                                var origen = SELECTED.userData.originOrder[0];

                                                var target = SELECTED.userData.targetOrder[0];

                                                if(COLLISION){

                                                    if(!validateCollisionTile(origen, COLLISION.userData.id) || !validateCollisionTile(target, COLLISION.userData.id))
                                                        resetPositionStepMeshButtons(SELECTED, type, origen, target);
                                                    else
                                                        addIdStepDrag(origen, target, COLLISION.userData.id);
                                                }
                                                else{
                                                    resetPositionStepMeshButtons(SELECTED, type, origen, target);
                                                }
                                            }

                                            window.dragManager.objectsCollision = [];
                                            window.dragManager.functions.DROP = [];
                                        };

                                        window.dragManager.functions.DROP = [drop];
                                        break;
                                    case "fork":
                                        window.dragManager.objectsCollision = getAllTiles(tile.userData.tile);
                                        changeArrowTest(false, type, tile.userData.originOrder[0], tile.userData.targetOrder[0]);
                                        var drop = function(SELECTED, INTERSECTED, COLLISION, POSITION){

                                            changeArrowTest(true, type, tile.userData.originOrder[0], tile.userData.targetOrder[0]);

                                            if(SELECTED){

                                                var origen = SELECTED.userData.originOrder[0];

                                                var target = SELECTED.userData.targetOrder[0];

                                                resetPositionStepMeshButtons(SELECTED, type, origen, target);

                                                if(COLLISION){                                                 

                                                    if(validateCollisionTile(origen, COLLISION.userData.id)){

                                                        parent = origen;

                                                        var mesh = addIdStep(EDIT_STEPS.length + 1, COLLISION.userData.id, parent);

                                                        FOCUS.data = mesh;
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

                        window.dragManager.functions.CLICK.push(clickAction);

                        var moveAction = function(mesh, position){ 

                            var type = null;

                            if(!mesh.userData.type)
                                type = 'tile';
                            else 
                                type = mesh.userData.type;

                            if(type === 'step'){
                                mesh.position.copy(position);
                                FOCUS.mesh.position.copy(position);
                                updatePositionArrowTest(position);
                            }
                            else if(type === 'changeStep' || type === 'fork'){
                                mesh.position.copy(position);
                                updatePositionArrowTest(position);
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

                        window.fieldsEdit.hiddenStepsList(false);

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

                        var clickAction = function(tile){

                            if(tile){

                                var type = null;

                                if(!tile.userData.type)
                                    type = 'tile';
                                else 
                                    type = tile.userData.type;

                                switch(type) {
                                    case "tile":
                                        var parent = null;

                                        if(FOCUS.data)
                                            parent = FOCUS.data.userData.id[0];

                                        var mesh = addIdStep(EDIT_STEPS.length + 1, tile.userData.id, parent);

                                        FOCUS.data = mesh;
                                        break;
                                }
                            }
                        };

                        window.dragManager.functions.CLICK.push(clickAction);
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

        var _obj = REPARED_STEPS;
        var div = document.getElementById("steps-list");
        var con = document.getElementById("steps-list-content");
        
        con.innerHTML = "";

        for(var i = 0; i < REPARED_STEPS.length; i++){

            var step = window.helper.clone(REPARED_STEPS[i]);

            var id = step.id + 1;

            div.addStep(id, step, 'repared');
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

        updateArrow();
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

    function resetPositionStepMeshButtons(mesh, type, IdOrigen, IdTarget){

        var object = LIST_ARROWS.find(function(x){
            if(x.originID[0] === IdOrigen && x.targetID[0] === IdTarget)
                return x;
        });

        var target = null;

        if(type === 'changeStep')
            target = object.meshPrimaryTarget.show;
        else
            target = object.meshSecondaryTarget.show;

        animate(mesh, target, 300);
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

                var order = children[i].id[0];

                if(tileValidate === EDIT_STEPS[order - 1].tile)
                    validate = false;
            }
        }

        return validate;
    }

    function validateCollisionTile(order, tileValidate){

        var validate = true,
            stepFocus = EDIT_STEPS[order - 1];

        if(stepFocus.tile === tileValidate)
            validate = false;

        return validate;
    }

    function searchParentStep(order){

        var i, l;

        for(i = 0; i < EDIT_STEPS.length; i++){

            var children = EDIT_STEPS[i].children;

            for(l = 0; l < children.length; l++){

                if(children[l].id[0] === order)
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

    function updateStepList(){

        var _obj = EDIT_STEPS.slice();
        var div = document.getElementById("steps-list");
        var con = document.getElementById("steps-list-content");
        
        con.innerHTML = "";

        for(var i = 0; i < _obj.length; i++) {

            var id = i + 1;

            if(validateChildrenTiles(id)){
                _obj[i].state = 'good';
            }
            else{
                _obj[i].state = 'locked';
            }

            div.addStep(id, _obj[i], 'normal');
        }
    }

    function cleanEditStep(){

        var target = window.helper.fillTarget(0, 0, 0, 'table');

        window.scene.remove(FOCUS.mesh);

        var i = 0;

        for(i = 0; i < EDIT_STEPS.length; i++){

            var mesh = EDIT_STEPS[i].mesh;

            animate(mesh, target.hide, 2000, function(){
                window.scene.remove(mesh);
            }); 
        }

        for(i = 0; i < LIST_ARROWS.length; i++){

            window.scene.remove(LIST_ARROWS[i].meshPrimary);
            window.scene.remove(LIST_ARROWS[i].meshSecondary);
            window.scene.remove(LIST_ARROWS[i].arrow);
            window.scene.remove(LIST_ARROWS[i].vector1);
            window.scene.remove(LIST_ARROWS[i].vector2);
        }

        FOCUS.data = null;

        FOCUS.mesh = null;

        EDIT_STEPS = [];

        LIST_ARROWS = [];

        REPARED_STEPS = [];

        SHOW_ARROW = [];
    } 

    function cleanButtons(){

        window.buttonsManager.deleteButton('button-save');
        window.buttonsManager.deleteButton('button-preview');
        window.buttonsManager.deleteButton('button-path');
        window.buttonsManager.deleteButton('button-Steps');   
    }

    this.getFocus = function(){
        return FOCUS;
    };

}