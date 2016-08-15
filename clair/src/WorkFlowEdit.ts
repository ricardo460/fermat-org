class WorkFlowEdit {

    classFlow = null;

    FOCUS = {
            mesh : null,
            data : null,
        };

    EDIT_STEPS = [];

    PREVIEW_STEPS = [];

    LIST_ARROWS = [];

    REPARED_STEPS = { 
            steps : [],
            mesh : null
        };

    SHOW_ARROW = [];

    actualMode = null;

    TILEWIDTH = globals.TILE_DIMENSION.width - globals.TILE_SPACING;
    TILEHEIGHT = globals.TILE_DIMENSION.height - globals.TILE_SPACING;

    TEXTURE = {
        x : null,
        y : null,
        image : null
    };

    getFocus(){
        return this.FOCUS;
    };

    get(){
        return this.EDIT_STEPS; // test
    };

    getp(){
        return this.LIST_ARROWS; // test
    }; 

    /**
     * @author Ricardo Delgado.
     * Repositions to focus. 
     * @param  {Number}  id step number.
     */  
    changeFocusSteps(id){

        this.FOCUS.data = this.EDIT_STEPS[id - 1].mesh;
        this.updateTileIgnored();
    };  

    /**
     * @author Ricardo Delgado.
     * Deletes the selected step.
     * @param {Number} step step number.
     */  
    deleteStepList(step){
        this.deleteSteps(step, this.EDIT_STEPS, 'step', 0);
    }; 

    /**
     * @author Ricardo Delgado.
     * id of the selected workflow.
     * @param {Number} _id 
     */
    addButton(_id){

        let id = null,
            text = 'Edit WorkFlow',
            button = 'buttonWorkFlowEdit',
            side = null,
            callback = null;

        if(typeof _id === 'number')
            id = _id;

        if(id === null){

            if(!globals.session.getIsLoggedIn()){
            
                callback = function(){ 
                    globals.session.getAuthCode();
                };
            }
            else{

                callback = function(){ 

                    globals.fieldsEdit.actions.type = "insert";

                    globals.buttonsManager.removeAllButtons();

                    globals.session.displayLoginButton(false);

                    this.drawHeaderFlow(null);
                };

            }

            globals.session.displayLoginButton(true);

            text = 'Add New WorkFlow';
            button = 'buttonWorkFlowNew';
            side = 'left';
            
            globals.buttonsManager.createButtons(button, text, callback, null, null, side);

        }
        else{

            if(!globals.session.getIsLoggedIn()){
            
                callback = function(){ 
                    globals.session.getAuthCode();
                };
            }
            else{

                callback = function(){

                    this.validateLock(id, function(){ 

                        globals.fieldsEdit.actions.type = "update";
                        globals.buttonsManager.removeAllButtons(); 
                        this.drawHeaderFlow(id);
                    });
                };
            }

            globals.session.displayLoginButton(false);

            globals.buttonsManager.createButtons(button, text, callback, null, null, side);

            if(!globals.session.getIsLoggedIn()){
            
                callback = function(){ 
                    globals.session.getAuthCode();
                };
            }
            else{ 

                callback = function(){

                    this.validateLock(id, function(){ 

                        if(window.confirm("Are you sure you want to remove this process?"))           
                            this.deleteWorkFlow(id);
                    });                
                };
            }

            text = 'Delete WorkFlow';
            button = 'buttonWorkFlowDelete';
            side = 'right';
            
            globals.buttonsManager.createButtons(button, text, callback, null, null, side);
        }   
    };

    /**
     * @author Ricardo Delgado.
     * Updated mesh texture.
     */
    changeTexture(){
        
        let flow = globals.fieldsEdit.getData();

        let texture = this.classFlow.createTitleBox(flow.name, flow.desc, true);

        let mesh = globals.fieldsEdit.objects.tile.mesh;

        mesh.material.map = texture;

        mesh.material.needsUpdate = true; 
    };

    /**
     * @author Ricardo Delgado.
     * Full information for step.
     */
    fillStep(){

        let flow = globals.fieldsEdit.getData();

        flow.steps = this.PREVIEW_STEPS;

        this.classFlow.deleteStep();

        let target = globals.fieldsEdit.objects.tile.target.show;

        this.classFlow.flow = flow;

        this.classFlow.countFlowElement();

        for (let i = 0; i < flow.steps.length; i++) {
            this.classFlow.drawTree(flow.steps[i], target.position.x + 900 * i, target.position.y - 211, 0);
        }

        this.classFlow.showSteps();
    };

    /**
     * @author Ricardo Delgado.
     * Checks and sends the data to the database.
     */
    save(){

        if(validateFields() === ''){ 

            this.disableButtons(true);
            
            if(globals.fieldsEdit.actions.type === "insert")
                this.createWorkFlow();
            else if(globals.fieldsEdit.actions.type === "update")
                this.modifyWorkFlow();
        }
        else{
             window.alert(validateFields());
        }

        function validateFields(){

            let msj = '';

            let name = document.getElementById('workflow-header-title') as HTMLInputElement;

            if(name.value === ""){
                msj += 'The workFlow must have a name \n';
                name.focus();
            }

            return msj;
        }
    };

    /**
     * @author Ricardo Delgado.
     * disable and enable buttons.
     * @param {boolean} state button status
     */
    disableButtons(state){

        let button = document.getElementById('button-Steps') as HTMLButtonElement;

        globals.fieldsEdit.disabledButtonSave(state);

        if(button)
            button.disabled = state;
    }

    /**
     * @author Ricardo Delgado.
     * creates a mesh test for workflow-Edit.
     */ 
    createElement(){

        let mesh = this.classFlow.createTitleBox();
        let newCenter = Helper.getCenterView('workflows');
        let y = this.getPositionY() - 500;
        let target = Helper.fillTarget(newCenter.x, y, newCenter.z, 'workflows');

        mesh.position.copy(target.hide.position);
        mesh.rotation.copy(target.hide.rotation);
        mesh.renderOrder = 1;
        mesh.material.needsUpdate = true;
        globals.scene.add(mesh);
        globals.fieldsEdit.objects.tile.mesh = mesh;
        globals.fieldsEdit.objects.tile.target = target;
    }

    /**
     * @author Ricardo Delgado.
     * seeks the farthest position Y
     * @returns {Number} Position.
     */ 
    getPositionY(){

        let newCenter = Helper.getCenterView('workflows');

        let Ymin = newCenter.y;

        for(let i = 0; i < globals.workFlowManager.getObjHeaderFlow().length; i++){

            let y = globals.workFlowManager.getObjHeaderFlow()[i].positions.target[0].y;

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

    /**
     * @author Ricardo Delgado.
     * initialisation for editing or creating a workflow
     * @param {String} id id workflow
     */ 
    drawHeaderFlow(id){ 

        let flow = null,
            mesh = null;

        this.createMeshFocus();

        this.loadImage();

        this.TEXTURE.x = this.loadTextureButtons('+');

        this.TEXTURE.y = this.loadTextureButtons('y');

        this.showBrowser(false);

        window.removeEventListener('keydown', globals.camera.onKeyDown, false);

        window.addEventListener('keydown', this.newOnKeyDown, false);

        globals.fieldsEdit.createFieldWorkFlowEdit();

        if(globals.fieldsEdit.actions.type === "insert"){

            flow = globals.fieldsEdit.getData();

            this.classFlow = new Workflow(flow);

            this.createElement();

            mesh = globals.fieldsEdit.objects.tile.mesh;

            this.changeMode('edit-step');
            this.changeMode('edit-path');
            (document.getElementById("steps-list")as any).dataset.state = 'show';
        }
        else if(globals.fieldsEdit.actions.type === "update"){

            let workFlow = globals.workFlowManager.getObjHeaderFlow()[id];

            workFlow.letAloneHeaderFlow();

            flow = workFlow.flow;

            flow = Helper.clone(flow);

            let steps = flow.steps;

            for(let i = 0; i < steps.length; i++){

                if(steps[i].element !== -1){

                    let data = Helper.getSpecificTile(steps[i].element).data;

                    steps[i].layer = data.layer;
                    steps[i].name = data.name;
                }
            }

            this.EDIT_STEPS = this.resetSteps(steps);

            this.transformData('PREVIEW');

            this.EDIT_STEPS = [];

            this.classFlow = new Workflow(flow);

            this.createElement();

            mesh = globals.fieldsEdit.objects.tile.mesh;

            this.fillFields(id);

            let res = msjDeleteSteps();

            if(res){

                this.REPARED_STEPS.steps = res as any;
                this.changeMode('repared');
            }
            else{

                workFlow.deleteStep();
                this.changeMode('preview');
            }
        }

        globals.fieldsEdit.actions.exit = function(){

            let allWorkFlow = globals.workFlowManager.getObjHeaderFlow();

            for(let i = 0; i < allWorkFlow.length ; i++) {

                if(allWorkFlow[i].action){

                    allWorkFlow[i].deleteStep();
                    allWorkFlow[i].action = false;
                    allWorkFlow[i].showAllFlow();
                }
                else
                    allWorkFlow[i].showAllFlow();
            }

            this.cleanEditStep();

            if(this.classFlow){

                this.classFlow.deleteStep();

                this.classFlow = null;
            }

            this.showBrowser(true);

            globals.dragManager.disable();
            globals.dragManager.reset();

            this.actualMode = null;

            this.EDIT_STEPS = [];

            this.PREVIEW_STEPS = [];

            globals.fieldsEdit.hiddenModal();
            globals.camera.resetPosition();
            globals.headers.transformWorkFlow(2000);
            window.removeEventListener('keydown', this.newOnKeyDown, false);
            window.addEventListener('keydown', globals.camera.onKeyDown, false);
        };

        function msjDeleteSteps() : any{

            let steps = globals.fieldsEdit.actualFlow.steps.slice();

            let order : any = [];

            let repared = [];

            let msj = "The following steps were removed: \n";

            for(let i = 0; i < steps.length; i++){

                let title = steps[i].title;

                if(!this.PREVIEW_STEPS.find(function(x){if(x.title === title) return x;})){
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

                msj += "Due to the following reasons: \n* They do not have an assigned component." +
                "\n* Two or more sequential steps have the same component." +
                "\n\nDo you want to repair these steps?\n"+
                "Press Accept to repair them or press Cancel "+
                "to delete the steps listed above from the workflow.";

                if(window.confirm(msj)) 
                    return repared;
                else
                    return false;
            }       
        }
    }

    /**
     * @author Ricardo Delgado.
     * hides the navigation arrows.
     * @param {boolean} state visibility arrows.
     */ 
    showBrowser(state){

        let browsers = globals.browserManager.objects.mesh;

        for(let i = 0; i < browsers.length; i++){
            let mesh = browsers[i];
            mesh.visible = state;
        }
    }

    /**
     * @author Ricardo Delgado.
     * creates texture for buttons.
     * @param {String} src image path.
     * @returns {THREE.Texture} texture.
     */ 
    loadTextureButtons(src){


        let canvas = document.createElement('canvas');
            canvas.height = 128;
            canvas.width = 128;
        let ctx = canvas.getContext('2d');
        let image = document.createElement('img');
        let texture = new THREE.Texture(canvas);
            texture.minFilter = THREE.NearestFilter;

        image.onload = function() {

            ctx.drawImage(image, 0, 0);

            ctx.textAlign = 'center';
            
            texture.needsUpdate = true;
        };

        image.src = 'images/workflow/button_'+src+'.png';

        return texture;
    }

    /**
     * @author Ricardo Delgado.
     * loads the image for focus.
     */ 
    loadImage(){

        let image = document.createElement('img');

        image.onload = function() {

            this.TEXTURE.img = image;
        };

        image.src = 'images/workflow/skinStep.png';
    }

    //workFlow action
    /**
     * @author Ricardo Delgado.
     * adds the new workflow to the database.
     */ 
    createWorkFlow(){

        let flow = globals.fieldsEdit.getData();

        flow.steps = this.PREVIEW_STEPS;

        let params = getParamsData(flow);  

        globals.api.postRoutesEdit('wolkFlowEdit', 'insert', params, null,
            function(res){ 

                flow._id = res._id;

                postParamsSteps(flow, function(flow){ 

                    this.addWorkFlow(flow, 3000);

                    globals.camera.loseFocus();

                });  
            },
            function(){

                this.disableButtons(false);    
            });

        function getParamsData(flow){

            let param : any = { };

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

            let steps = flow.steps.slice();

            let newSteps = [];

            let dataPost = {
                    proc_id : flow._id
                };

            postSteps(steps);

            function postSteps(steps){

                if(steps.length > 0){ 

                    let param : any = {};

                    param.type = steps[0].type;

                    this.mesh = Helper.getSpecificTile(this.getIdSpecificTile(steps[0].name, steps[0].platfrm, steps[0].layer)).data;
                    param.comp_id = this.mesh.id;
                    param.title = steps[0].title;
                    if(steps[0].desc)
                        param.desc = steps[0].desc;
                    else
                        param.desc = "pending";
                    param.order = steps[0].id;

                    if(steps[0].next.length > 0)
                        param.next = steps[0].next;

                    globals.api.postRoutesEdit('wolkFlowEdit', 'insert step', param, dataPost,
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
    /**
     * @author Ricardo Delgado.
     * creates and encourages the workflow created.
     * @param {Object}     flow     information for the workflow.
     * @param {Number}   duration   Animation length.
     */ 
    addWorkFlow(flow, duration){

        let newFlow = new Workflow(flow);

        let _target = new THREE.Vector3();

        let target = null,
            find = false,
            id = globals.workFlowManager.getObjHeaderFlow().length;

        for(let i = 0; i < globals.workFlowManager.getObjHeaderFlow().length; i++){

            if(globals.workFlowManager.getObjHeaderFlow()[i].flow.platfrm === flow.platfrm){

                target = globals.workFlowManager.getObjHeaderFlow()[i].positions.target[0];

                find = true;

                if(target.y < _target.y)
                    _target.copy(target);
            }
        }
        if(find === false){ 
            for(let j = 0; j < globals.headers.getPositionHeaderViewInFlow().length; j++){
                if(globals.headers.getPositionHeaderViewInFlow()[j].name === flow.platfrm){
                    _target =  globals.headers.getPositionHeaderViewInFlow()[j].position;
                }
            }
        }

        _target = Helper.clone(_target);
       
        if(find === true){
            _target.y = _target.y - 500;
        }
        else{
            _target.x = _target.x - 1500;
            _target.y = _target.y - 2200;
        }

        globals.camera.move(_target.x, _target.y, 8000, duration);

        setTimeout( function() {
            newFlow.draw(_target.x, _target.y, _target.z, 1, id);
            globals.workFlowManager.getObjHeaderFlow().push(newFlow);
        }, duration);
    }
    /**
     * @author Ricardo Delgado.
     * Modifies the workflow database.
     */ 
    modifyWorkFlow(){ 

        let newFlow = globals.fieldsEdit.getData();

        newFlow.steps = this.PREVIEW_STEPS;

        let params = getParamsData(newFlow);

        let dataPost = {
                proc_id : globals.fieldsEdit.actualFlow._id
            };

        globals.api.postRoutesEdit('wolkFlowEdit', 'update', params, dataPost,
            function(res){ 

                newFlow._id = globals.fieldsEdit.actualFlow._id;

                postParamsStep(newFlow, function(newFlow){

                    let oldFlow = Helper.clone(globals.fieldsEdit.actualFlow),
                        oldGroup = oldFlow.platfrm,
                        newGroup = newFlow.platfrm,
                        id = globals.fieldsEdit.actualFlow.id,
                        target = Helper.fillTarget(0, 0, 160000, 'workflows'),
                        workFlow = globals.workFlowManager.getObjHeaderFlow()[id],
                        mesh = workFlow.objects[0];
                        
                    globals.camera.loseFocus();

                    let positionCameraX = workFlow.positions.target[0].x,
                        positionCameraY = workFlow.positions.target[0].y;

                    globals.camera.move(positionCameraX, positionCameraY, 8000, 2000);

                    setTimeout( function() {

                        if(newGroup !== oldGroup)
                            change();
                        else
                            notChange();

                    }, 1500 );

                    function change(){

                        globals.workFlowManager.getObjHeaderFlow().splice(id, 1);

                        this.animate(mesh, target.hide, 800, function(){
                            globals.scene.remove(mesh);
                            this.updateWorkFlow(workFlow.flow.platfrm);
                            setTimeout( function() {
                                this.addWorkFlow(newFlow, 2000);
                            }, 2500 );
                        });
                    }

                    function notChange(){

                        let texture = workFlow.createTitleBox(newFlow.name, newFlow.desc, true);

                        this.animate(mesh, target.hide, 1000, function(){
                            mesh.material.map = texture;
                            mesh.material.needsUpdate = true;
                            target = Helper.fillTarget(workFlow.positions.target[0].x, workFlow.positions.target[0].y, 0, 'workflows');
                            this.animate(mesh, target.show, 1000, function(){

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
            this.disableButtons(false);
        });

        function getParamsData(flow){

            let param: any = {};

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

            let newSteps = flow.steps.slice(),
                oldSteps = globals.fieldsEdit.actualFlow.steps.slice(),
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

                let difference,
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
                               newSteps[i].name !== oldSteps[i].name){

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
                           newSteps[i].name !== oldSteps[i].name){

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
                               newSteps[i].name!== oldSteps[i].name){

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

                    let dataPost = {
                        proc_id: globals.fieldsEdit.actualFlow._id,
                        steps_id: ''
                        };

                    let param : any = {};

                    if(task === 'update' || task === 'delete')
                        dataPost.steps_id = array[0]._id;

                    if(task !== 'delete'){ 

                        param.type = array[0].type;
                        this.mesh = Helper.getSpecificTile(this.getIdSpecificTile(array[0].name, array[0].platfrm, array[0].layer)).data;
                        param.comp_id = this.mesh.id;
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

                    globals.api.postRoutesEdit('wolkFlowEdit', config[task].route, param, dataPost,
                        function(res){

                            if(task !== 'delete'){ 

                                array[0]._id = res._id;

                                newFlowSteps[array[0].id]._id = array[0]._id;
                            }
                            
                            array.splice(0,1);

                            postSteps(task, array, callback);

                        },
                        function(){
                            this.disableButtons(false);
                        });
                }
                else{

                    callback();
                }
            }
        
        }
    }
    /**
     * @author Ricardo Delgado.
     * Eliminates workflow database.
     * @param {String} id id workflow to eliminate
     */ 
    deleteWorkFlow(id){

        let workFlow = globals.workFlowManager.getObjHeaderFlow()[id];
        let dataPost = {
                proc_id : workFlow.flow._id
            };

        globals.api.postRoutesEdit('wolkFlowEdit', 'delete', false, dataPost,
            function(res){
        
                globals.workFlowManager.showWorkFlow();
                globals.workFlowManager.getObjHeaderFlow().splice(id, 1);
                globals.camera.move(workFlow.positions.target[0].x, workFlow.positions.target[0].y, 8000, 2000);

                setTimeout(function(){

                    let target =  Helper.fillTarget(0, 0, 160000, 'workflows');
                    let mesh = workFlow.objects[0];

                    this.animate(mesh, target.hide, 1500, function(){
                            globals.scene.remove(mesh);
                            this.updateWorkFlow(workFlow.flow.platfrm);
                        });
                    
                }, 2500);
            });
    }
    /**
     * @author Emmanuel Colina.
     * updates the positions of the workflow of a platform.
     * @param {String} platform platform name
     */ 
    updateWorkFlow(platform){

        let positionInit = null,
            ArrayPosition = [];

        for(let j = 0; j < globals.headers.getPositionHeaderViewInFlow().length; j++){
            if(globals.headers.getPositionHeaderViewInFlow()[j].name === platform){
                positionInit =  globals.headers.getPositionHeaderViewInFlow()[j].position;
            }
        }

        for(let i = 0; i < globals.workFlowManager.getObjHeaderFlow().length; i++){

            let workFlow = globals.workFlowManager.getObjHeaderFlow()[i];
            let mesh = workFlow.objects[0];

            mesh.userData.id = i;

            if(workFlow.flow.platfrm === platform){
                if(ArrayPosition.length > 0){
                    workFlow.positions.target[0].y = Helper.getLastValueArray(ArrayPosition).y - 500;
                }
                else{
                    workFlow.positions.target[0].x = positionInit.x - 1500;
                    workFlow.positions.target[0].y = positionInit.y - 2200;
                }

                ArrayPosition.push(workFlow.positions.target[0]);

                let target = Helper.fillTarget(workFlow.positions.target[0].x, workFlow.positions.target[0].y, 0, 'workflows');

                this.animate(workFlow.objects[0], target.show, 1000);
            }
        }
    }
    /**
     * @author Ricardo Delgado.
     * Validates if the workflow is being used by someone else.
     * @param {String}      id      id workflow
     * @param {Function} callback   Function to call when finished
     */ 
    validateLock(_id, callback){

        let id = globals.workFlowManager.getObjHeaderFlow()[_id].flow._id;

        let dataPost = {
                proc_id : id
            };

        globals.api.postValidateLock('wolkFlowEdit', dataPost,
            function(res){ 

                if(typeof(callback) === 'function')
                    callback();
            },
            function(res){

                window.alert("This workFlow is currently being modified by someone else, please try again in about 3 minutes");
            }
        );
    }
    /**
     * @author Ricardo Delgado.
     * looking for a component by its name, platform and layer.
     * @param {String} name     component name.
     * @param {String} platform component platform.
     * @param {String} layer    component layer.
     * @returns {object} component id.
     */ 
    getIdSpecificTile(name, platform, layer){

        let i = 0, tile = null;

        if(globals.TABLE[platform]){

            if(globals.TABLE[platform].layers[layer]){

                for(i = 0; i < globals.TABLE[platform].layers[layer].objects.length; i++){
                    
                    tile = globals.TABLE[platform].layers[layer].objects[i]; 
                    
                    if(tile.data.name.toLowerCase() === name.toLowerCase())
                        return tile.id;
                }
            }
        }
    }
    /**
     * @author Ricardo Delgado.
     * fills the fields for modification.
     * @param {String} id  id workflow.
     */ 
    fillFields(id){

        let flow = this.classFlow.flow;

        flow = Helper.clone(flow);

        globals.fieldsEdit.actualFlow = Helper.clone(flow);

        globals.fieldsEdit.actualFlow.id = id;

        if(flow.platfrm !== undefined)
            (document.getElementById("workflow-header-plataform") as any).value = flow.platfrm;

        if(flow.name !== undefined)
            (document.getElementById("workflow-header-title") as any).value = flow.name;
        
        if(flow.desc !== undefined)
            (document.getElementById("modal-desc-textarea") as any).value = flow.desc; 
    }
    /**
     * @author Ricardo Delgado.
     * creates the animation of the mesh
     * @param {object}     mesh     object three.
     * @param {object}    target    Coordinates.
     * @param {Number}   duration   Animation length.
     * @param {Function} callback   Function to call when finished
     */ 
    animate(mesh, target, duration = 2000, callback?){

        let _duration = duration || 2000,
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
    /**
     * @author Ricardo Delgado.
     * controls the types of mode for creating a workflow.
     * @param {String} mode  editing mode to run
     */ 
    changeMode(mode){ 

        let buttons = {

            path : function(){ 
                document.getElementById("header-next").onclick = function() {
                    this.changeMode('edit-path');
                };
                document.getElementById("header-next").title = "Edit Path";
            },
            steps : function(side){

                if(side){ 
                    globals.buttonsManager.createButtons('button-Steps', 'Edit Steps', function(){
                        this.changeMode('edit-step');}, null, null, side);
                }
                else{ 
                    document.getElementById("header-back").onclick = function() {
                        this.changeMode('edit-step');
                    };
                    document.getElementById("header-back").title = "Edit Steps";
                }
            },
            preview : function(){
                document.getElementById("header-back").onclick = function() {
                    this.changeMode('preview');
                };
                document.getElementById("header-back").title = "Workflow Preview";
            },
            save : function(){
                globals.buttonsManager.createButtons('button-save', 'Save', function(){
                    this.save();}, null, null, "right");
            },
            helpPath : function(){
                globals.buttonsManager.createButtons('help-path', 'Help', function(){
                    globals.guide.HelpWorkFlowEdit('path');}, null, null, "right");
            },
            helpEdit : function(){
                globals.buttonsManager.createButtons('help-edit', 'Help', function(){
                    globals.guide.HelpWorkFlowEdit('edit');}, null, null, "right");
            },
            helpRepared : function(){
                globals.buttonsManager.createButtons('help-repared', 'Help', function(){
                    globals.guide.HelpWorkFlowEdit('repared');}, null, null, "right");
            }
        };

        if(!MODE().exit()){

            globals.buttonsManager.removeAllButtons(true);

            globals.dragManager.reset();

            this.actualMode = mode;

            MODE().enter();
        }

        function MODE() : any {

            let actions = {}, enter = null, exit = null; 

            switch(this.actualMode) {

                case 'edit-step':
                    enter = function() {

                        this.createMeshFocus();
                        globals.fieldsEdit.setModeEdit('Edit Steps Mode', true, true);
                        globals.dragManager.enable();
                        Helper.hide('backButton', 0, true);
                        globals.fieldsEdit.hiddenStepsList(true);
                        buttons.helpEdit();
                        buttons.preview();
                        buttons.path();
                        globals.actualView = false;
                        this.displayField(false);
                        globals.tileManager.transform(false, 1000);
                        globals.signLayer.transformSignLayer();

                        let newCenter = new THREE.Vector3(0, 0, 0);
                        let transition = 1500;
                        let z = globals.camera.getMaxDistance() / 2;

                        if(this.EDIT_STEPS.length > 0){

                            this.this.updateStepList();
                            this.hideButtonsArrows();

                            globals.dragManager.objects = [];
                            
                            for(let i = 0; i < this.EDIT_STEPS.length; i++){

                                globals.dragManager.objects.push(this.EDIT_STEPS[i].mesh);
                            }

                            for(let l = 0; l < this.LIST_ARROWS.length; l++){

                                globals.dragManager.objects.push(this.LIST_ARROWS[l].arrow);
                            }

                            newCenter = this.EDIT_STEPS[0].target.show.position;

                            z = 500;
                        }
                        else{

                            newCenter = globals.viewManager.translateToSection('table', newCenter);
                        }

                        let action = function(tile, mouse){

                            if(tile){ 

                                let type = null;

                                if(!tile.userData.type)
                                    type = 'tile';
                                else
                                    type = tile.userData.type;

                                switch(type) {
                                    case "step":

                                        let step = this.EDIT_STEPS[tile.userData.id[0] - 1];

                                        this.updateTileIgnored();
                                        
                                        globals.fieldsEdit.showModal(step);

                                        let vector = Helper.getSpecificTile(step.tile).mesh.position;

                                        globals.camera.move(vector.x, vector.y + 100, 500, 1000, true);

                                        globals.dragManager.cleanObjects();

                                        globals.dragManager.functions.DROP.push(
                                            function(SELECTED){
                                                SELECTED = null;
                                                globals.camera.disable();
                                        });
                                        break;
                                    case "arrow":

                                        let origin = tile.userData.originOrder,
                                            target = tile.userData.targetOrder;

                                        let arrow = this.searchArrow(origin, target);

                                        this.changeTypeArrow(arrow, mouse);

                                        globals.dragManager.cleanObjects();

                                        globals.dragManager.functions.DROP.push(
                                            function(SELECTED){
                                                SELECTED = null;
                                                globals.camera.disable();
                                        });
                                        break;                
                                }
                            }
                            else{
                                globals.dragManager.functions.DROP = [];
                                globals.fieldsEdit.hiddenModal();
                            }
                        };

                        globals.dragManager.functions.CLICK.push(action);

                        globals.camera.move(newCenter.x, newCenter.y, z, transition, true);
                        
                        globals.headers.transformTable(transition);
                    };             
                    
                    exit = function() {

                        globals.fieldsEdit.hiddenModal();
    
                        if(mode === 'preview'){

                            let step = this.validateFieldSteps();

                            if(step){

                                this.updateTileIgnored();
                                            
                                globals.fieldsEdit.showModal(step, true);

                                let vector = Helper.getSpecificTile(step.tile).mesh.position;

                                globals.camera.move(vector.x, vector.y + 100, 500, 1000, true);

                                globals.dragManager.functions.DROP.push(
                                    function(SELECTED){
                                        SELECTED = null;
                                        globals.camera.disable();
                                });

                                return true;
                            }
                            else{

                                let focus = this.FOCUS.mesh;

                                focus.visible = false;

                                this.transformData('PREVIEW');
    
                                this.cleanEditStep();

                                globals.dragManager.reset();

                                setTimeout(function() { focus.visible = true; }, 1000);
                            }
                        }
                        
                    };

                    break;   
                case 'edit-path':
                    enter = function() {

                        this.createMeshFocus();
                        
                        buttons.helpPath();

                        this.buttons.steps();

                        globals.fieldsEdit.setModeEdit('Edit Path Mode', false, true);

                        globals.dragManager.styleMouse.CROSS = 'copy';

                        if (this.EDIT_STEPS.length > 0){
                            this.this.updateStepList();
                            this.updateTileIgnored();
                            this.hideButtonsArrows(true);
                        }
                        else{
                            globals.dragManager.objects = this.getAllTiles();
                        }

                        let clickAction = function(tile){

                            if(tile){

                                let type = null;

                                let drop = null, mesh = null;

                                if(!tile.userData.type)
                                    type = 'tile';
                                else 
                                    type = tile.userData.type;

                                switch(type) {
                                    case "tile":
                                    
                                        let parent = null;

                                        if(this.FOCUS.data)
                                            parent = this.FOCUS.data.userData.id[0];

                                        mesh = this.addIdStep(this.EDIT_STEPS.length + 1, tile.userData.id, parent);

                                        if(mesh)
                                            this.FOCUS.data = mesh;

                                        break;
                                    case "step":

                                        this.FOCUS.data = this.EDIT_STEPS[tile.userData.id[0] - 1].mesh;

                                        this.createArrowTest(tile.userData.id[0]);

                                        globals.dragManager.objectsCollision = this.getAllTiles(tile.userData.tile);
                                        
                                        drop = function(SELECTED, INTERSECTED, COLLISION, POSITION){

                                            if(SELECTED){

                                                let orderFocus = this.FOCUS.data.userData.id[0];

                                                if(COLLISION){

                                                    if(!this.validateCollisionTileSteps(orderFocus, COLLISION.userData.id))
                                                        this.resetPositionIdStepMesh(orderFocus, 'collision');
                                                    else
                                                        this.changeTileStep(orderFocus, COLLISION.userData.id);
                                                }
                                                else{

                                                    if(this.calculateAreaTile(SELECTED.position)){
                                                        this.resetPositionIdStepMesh(orderFocus);
                                                    }
                                                    else{
                                                        this.deleteSteps(orderFocus, this.EDIT_STEPS, 'step', 1000);
                                                    }
                                                }
                                            }

                                            this.updateTileIgnored();
                                            globals.dragManager.objectsCollision = [];
                                            globals.dragManager.functions.DROP = [];
                                        };

                                        globals.dragManager.functions.DROP = [drop];

                                        break;
                                    case "changeStep":

                                        this.changeArrowTest(type, tile.userData.originOrder[0], tile.userData.targetOrder[0]);

                                        globals.dragManager.objectsCollision = this.getAllTiles(tile.userData.tile);
                                        
                                        drop = function(SELECTED, INTERSECTED, COLLISION, POSITION){

                                            if(SELECTED){

                                                let origen = SELECTED.userData.originOrder[0];

                                                let target = SELECTED.userData.targetOrder[0];

                                                if(COLLISION){

                                                    if(!this.validateCollisionTile(origen, COLLISION.userData.id) || !this.validateCollisionTile(target, COLLISION.userData.id))
                                                        this.resetPositionStepMeshButtons(SELECTED, type, origen, target);
                                                    else
                                                        this.addIdStepDrag(origen, target, COLLISION.userData.id);
                                                }
                                                else{
                                                    this.resetPositionStepMeshButtons(SELECTED, type, origen, target);
                                                }
                                            }

                                            globals.dragManager.objectsCollision = [];
                                            globals.dragManager.functions.DROP = [];
                                        };

                                        globals.dragManager.functions.DROP = [drop];
                                        break;
                                    case "fork":

                                        globals.dragManager.objectsCollision = this.getAllTiles(tile.userData.tile);
                                        
                                        this.validateCollisionTilechangeArrowTest(type, tile.userData.originOrder[0], tile.userData.targetOrder[0]);
                                       
                                        drop = function(SELECTED, INTERSECTED, COLLISION, POSITION){

                                            if(SELECTED){

                                                let origen = SELECTED.userData.originOrder[0];

                                                let target = SELECTED.userData.targetOrder[0];

                                                this.resetPositionStepMeshButtons(SELECTED, type, origen, target);

                                                if(COLLISION){                                                 

                                                    if(this.validateCollisionTile(origen, COLLISION.userData.id)){

                                                        parent = origen;

                                                        mesh = this.addIdStep(this.EDIT_STEPS.length + 1, COLLISION.userData.id, parent);

                                                        this.FOCUS.data = mesh;
                                                    }
                                                }
                                            }

                                            globals.dragManager.objectsCollision = [];
                                            globals.dragManager.functions.DROP = [];
                                        };

                                        globals.dragManager.functions.DROP = [drop];
                                        break;
                                }
                            }
                        };

                        globals.dragManager.functions.CLICK.push(clickAction);

                        let moveAction = function(mesh, position){ 

                            let type = null;

                            if(!mesh.userData.type)
                                type = 'tile';
                            else 
                                type = mesh.userData.type;

                            if(type === 'step'){
                                mesh.position.copy(position);
                                this.FOCUS.mesh.position.copy(position);
                                this.updatePositionArrowTest(position);
                            }
                            else if(type === 'changeStep' || type === 'fork'){
                                mesh.position.copy(position);
                                this.updatePositionArrowTest(position);
                            }
                        }; 

                        globals.dragManager.functions.MOVE.push(moveAction);
                    };
                    
                    exit = function() {
                        
                    };

                    break; 
                case 'preview':
                    enter = function() {

                        Helper.show('backButton', 0);

                        buttons.save();

                        globals.fieldsEdit.hiddenStepsList(false, 0);

                        this.displayField((true));

                        this.changeTexture();

                        globals.actualView = 'workflows';

                        let mesh = globals.fieldsEdit.objects.tile.mesh;

                        this.animate(mesh, globals.fieldsEdit.objects.tile.target.show, 1000, function(){ 

                            globals.camera.setFocus(mesh, new THREE.Vector4(0, 0, 950, 1), 2000);

                            this.fillStep();

                            globals.headers.transformWorkFlow(2000);

                            buttons.steps('left');

                        });
                    };             
                    
                    exit = function() {

                        if(mode === 'edit-step'){
                            this.transformData();
                        }
                        
                    };

                    break; 
                case 'repared':
                    enter = function() {

                        globals.dragManager.enable();

                        Helper.hide('backButton', 0, true);

                        globals.fieldsEdit.setModeEdit('Repair Steps Mode');

                        globals.actualView = false;

                        this.displayField((false));

                        globals.tileManager.transform(false, 1500);

                        globals.signLayer.transformSignLayer();

                        let newCenter = new THREE.Vector3(0, 0, 0);
                        let transition = 1500;
                        let z = globals.camera.getMaxDistance() / 2;  

                        newCenter = globals.viewManager.translateToSection('table', newCenter);

                        globals.camera.move(newCenter.x, newCenter.y, z, transition, true);
                        
                        globals.headers.transformTable(transition);

                        (document.getElementById("steps-list").dataset as any).state = 'show';

                        this.updateStepsRepared();

                        globals.buttonsManager.createButtons('button-back', 'BACK', function(){

                            let event = { keyCode : 27} ;

                            globals.camera.disableFocus();

                            globals.actualView = 'workflows';

                            globals.camera.onKeyDown(event);

                        }, null, null, "left");

                        globals.buttonsManager.createButtons('button-continue', 'Continue', function(){

                            let res = true;
                            
                            if(this.REPARED_STEPS.steps.find(function(x){ if(x.state === 'error')return x;}))
                                res = window.confirm('You still have steps with problems, those steps will be removed from the workflow. \n\nPress Accept to remove them.');

                            if(res){ 

                                this.EDIT_STEPS = this.resetSteps(this.REPARED_STEPS.steps);

                                this.transformData('PREVIEW');

                                this.EDIT_STEPS = [];

                                this.changeMode('preview');

                                this.cleanEditStep();
                            }

                        }, null, null, "right");

                        buttons.helpRepared();

                        let clickAction = function(tile){

                            if(tile){
                                let id = this.FOCUS.data;
                                this.REPARED_STEPS.steps[id].element = tile.userData.id;
                                this.REPARED_STEPS.steps[id].state = 'good';
                                this.updateStepsRepared(id);
                            }
                        };

                        globals.dragManager.functions.CLICK.push(clickAction);
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
    /**
     * @author Ricardo Delgado.
     * adds another step to the workflow.
     * @param {Number} id        Step number.
     * @param {String} IDtile    id component.
     * @param {Number} parent    number step father.
     * @param {String} typeCall  call type of connection.
     * @param {boolean} visible  visibility arrows for connection.
     * @returns {object} mesh step.
     */ 
    addIdStep(id, IDtile, parent, typeCall, visible) : any{

        let mesh = this.createIdStep(),
            difference = this.TILEWIDTH / 2;

        let newArray = [id];

        let tile = Helper.getSpecificTile(IDtile).target.show;

        let target = Helper.fillTarget(tile.position.x - difference, tile.position.y, tile.position.z + 1, 'table');

        mesh.position.copy(target.hide.position);

        mesh.rotation.copy(target.hide.rotation);

        mesh.userData = {
                id : newArray,
                tile : IDtile,
                type: 'step'
            };

        if(parent){

            let tileParent = this.EDIT_STEPS[parent - 1].tile;

            if(IDtile === tileParent)
                return false;

            let children = this.EDIT_STEPS[parent - 1].children;

            if(children.length > 0)
                newArray[0] = Helper.getLastValueArray(children).id[0] + 0.5;

            let obj = {
                id : newArray,
                type : 'direct call'
            };

            if(typeCall)
                obj.type = typeCall;
            
            children.push(obj);
        }
        
        let object = {
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

        this.EDIT_STEPS.push(object);

        (mesh.material as any).map = this.changeTextureId(id, parent);

        this.calculatePositionsSteps(IDtile);

        if(parent){
            this.orderPositionSteps(this.EDIT_STEPS, 'step');
        }
        else{
            this.updateStepList();
        }

        if(visible){

            this.deleteArrow(); 
            this.updateArrow();
        }
        else{

            setTimeout(function(){this.deleteArrow(); this.updateArrow();}, 1500);
        }

        return mesh;   
    }
    /**
     * @author Ricardo Delgado.
     * creates the mesh step.
     * @returns {object} mesh.
     */ 
    createIdStep(){

        let height = this.TILEHEIGHT / 9;
        let width = this.TILEHEIGHT / 5;

        let mesh = new THREE.Mesh(
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
        globals.scene.add(mesh);

        return mesh;
    }
    /**
     * @author Ricardo Delgado.
     * ccreates the mesh connections buttons.
     * @returns {object} mesh.
     */ 
    createSimbol(){

        let tileWidth = (globals.TILE_DIMENSION.width - globals.TILE_SPACING) / 2,
            tileHeight = (globals.TILE_DIMENSION.height - globals.TILE_SPACING) / 8;

        let mesh =  new THREE.Mesh(
                    new THREE.PlaneBufferGeometry(tileHeight, tileHeight),
                    new THREE.MeshBasicMaterial({
                            side: THREE.DoubleSide,
                            transparent: true, 
                            map:null 
                    }));

        mesh.renderOrder = 1;

        mesh.material.needsUpdate = true;

        mesh.material.depthTest = false;

        globals.scene.add(mesh);

        return mesh;
    }
    /**
     * @author Ricardo Delgado.
     * creates the mesh focus.
     */ 
    createMeshFocus(){

        if(!this.FOCUS.mesh){ 

            let height = this.TILEHEIGHT / 9;
            let width = this.TILEHEIGHT / 5;

            let canvas = document.createElement('canvas');

            let img = new Image();
            
            let texture = null;

            canvas.height = 412;
            canvas.width = 635;

            let ctx = canvas.getContext('2d');

            img.src = 'images/workflow/skinStepF.png';

            let mesh = new THREE.Mesh(
                       new THREE.PlaneBufferGeometry(width, height),
                       new THREE.MeshBasicMaterial({ 
                            side: THREE.DoubleSide, 
                            transparent: true, 
                            map:null 
                        }));

            mesh.renderOrder = 2;

            mesh.scale.set(1.4, 1.4, 1.4);

            mesh.material.depthTest = false;

            globals.scene.add(mesh);

            img.onload = function() { 

                ctx.drawImage(img, 0, 0);

                texture = new THREE.Texture(canvas);
                texture.minFilter = THREE.NearestFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.needsUpdate = true;  

                (mesh.material as any).map = texture;

                mesh.material.needsUpdate = true;

                this.FOCUS.mesh = mesh;
            };
        }
    }

    /**
     * @author Emmanuel Colina.
     * Create the arrow of the step
     * @param {mesh, mesh, int, int, string, string}
     * @param {mesh} Mesh of the Origin
     * @param {mesh} Mesh of the Destination
     * @param {int} ID tile origin
     * @param {int} ID tile destination
     * @param {String} ID tile origin
     * @param {String} ID tile destination
     */
    createLineStep(meshOrigin, meshTarget, idOrigin, idTarget, tileOrigin, tileTarget){

	let mesh, from, to, meshTrinogometry, vectorArrow = '', hypotenuse;

        let objArrow : any = {
                tileOriginId : null,
                tileTargetId : null,
                originID: null,
                targetID: null,
                meshPrimary: null,
                meshSecondary: null,
                arrow: null,
                meshPrimaryTarget: [],
                meshSecondaryTarget: []
            };
        

        let object = this.EDIT_STEPS[idOrigin[0] - 1].children.find(function(x){
            if(x.id[0] === idTarget[0])
                return x;
        });

        let color = this.classFlow.getColor('');

        if(object)
            color = this.classFlow.getColor(object.type);
        
        let vertexOriginX = meshOrigin.position.x,
            vertexOriginY = meshOrigin.position.y,
            vertexDestX = meshTarget.position.x,
            vertexDestY = meshTarget.position.y;

        objArrow.originID = idOrigin;
        objArrow.targetID = idTarget;
        objArrow.tileOriginId = tileOrigin;
        objArrow.tileTargetId = tileTarget;

        let angleRadians = Math.atan2(vertexDestY - vertexOriginY, vertexDestX - vertexOriginX);
        var toMain;
        
        if((vertexOriginY >  vertexDestY) && (vertexOriginX !== vertexDestX)){ // si es descendente diagonal
            
            from = new THREE.Vector3(vertexOriginX, vertexOriginY, 2);

            meshTrinogometry = this.trigonometry(vertexOriginX, vertexOriginY, 40, angleRadians);
            
            vectorArrow = 'arrowDesc';

            toMain = this.trigonometry(vertexDestX - 4, vertexDestY + 9.5, 0, angleRadians);
        }
        else if((vertexOriginY <  vertexDestY) && (vertexOriginX !== vertexDestX)){ // si es ascendente diagonal 
        

            from = new THREE.Vector3(vertexOriginX, vertexOriginY, 2);

            meshTrinogometry = this.trigonometry(vertexOriginX, vertexOriginY, 40, angleRadians);

            vectorArrow = 'arrowAsc';

            toMain = this.trigonometry(vertexDestX - 7, vertexDestY - 9.5, 0, angleRadians);
        }

        else if((vertexOriginX == vertexDestX) && (vertexOriginY > vertexDestY)){ // si es vertical descendente

            from = new THREE.Vector3(vertexOriginX, vertexOriginY, 2);

            meshTrinogometry = new THREE.Vector3(vertexOriginX, vertexOriginY - 20, 2);
            
            vectorArrow = 'arrowDescVer';

            toMain = this.trigonometry(vertexOriginX, vertexOriginY, from.distanceTo(new THREE.Vector3(vertexDestX, vertexDestY, 2)) - 10, angleRadians);
        }
        else if((vertexOriginX == vertexDestX) && (vertexOriginY < vertexDestY)){ // si es vertical ascendente
           
            from = new THREE.Vector3(vertexOriginX, vertexOriginY, 2);

            meshTrinogometry = new THREE.Vector3(vertexOriginX, vertexOriginY + 20, 2);
            
            vectorArrow = 'arrowAscVer';

            toMain = this.trigonometry(vertexOriginX, vertexOriginY, from.distanceTo(new THREE.Vector3(vertexDestX, vertexDestY, 2)) - 10, angleRadians);
        }

        else if((vertexOriginY == vertexDestY) && (vertexOriginX < vertexDestX)){ // Horizontal Derecha

            from = new THREE.Vector3(vertexOriginX, vertexOriginY, 2);
            
            meshTrinogometry = new THREE.Vector3(vertexOriginX + 40, vertexOriginY, 2);
            
            vectorArrow = 'arrowRight';

            toMain = this.trigonometry(vertexOriginX, vertexOriginY, from.distanceTo(new THREE.Vector3(vertexDestX, vertexDestY, 2)) - 17, angleRadians);
        } 

        else if((vertexOriginY == vertexDestY) && (vertexOriginX > vertexDestX)){ // Horizontal Derecha

            from = new THREE.Vector3(vertexOriginX, vertexOriginY, 2);
            
            meshTrinogometry = new THREE.Vector3(vertexOriginX - 40, vertexOriginY, 2);
            
            vectorArrow = 'arrowLeft';

            toMain = this.trigonometry(vertexOriginX, vertexOriginY, from.distanceTo(new THREE.Vector3(vertexDestX, vertexDestY, 2)) - 17, angleRadians);
        }  
        
	let direction = toMain.clone().sub(from);

        let length = direction.length();

        let arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, color, 4*2.5, 4*2.5);
        
        let dataArrow = {
            originOrder : idOrigin,
            targetOrder : idTarget,
            type : 'arrow'
        };

        arrowHelper.userData = dataArrow;

        arrowHelper.line.userData = dataArrow;

        arrowHelper.cone.userData = dataArrow;

        globals.scene.add(arrowHelper);

        mesh = this.createSimbol();

        mesh.material.map = this.TEXTURE.x;

        mesh.userData = {
            originOrder : idOrigin,
            targetOrder : idTarget,
            type : 'changeStep'
        };

        mesh.position.set(meshTrinogometry.x, meshTrinogometry.y, 3);

        objArrow.arrow = arrowHelper;
        objArrow.meshPrimary = mesh;

        let target = Helper.fillTarget(meshTrinogometry.x, meshTrinogometry.y, 3, 'table');
        objArrow.meshPrimaryTarget = target;

        directionLineMesh(meshTrinogometry.x, meshTrinogometry.y, angleRadians, tileOrigin, tileTarget);

        this.LIST_ARROWS.push(objArrow);
        

        function directionLineMesh(x, y, angleRadians, tileOrigin, tileTarget){

            let mesh, meshTrinogometry;

            switch(vectorArrow){

                case 'arrowDesc':
                case 'arrowAsc':
                    
                    meshTrinogometry = this.trigonometry(x, y, 30, angleRadians);
                    break;

                case 'arrowDescVer':

                    meshTrinogometry = new THREE.Vector3(x, y - 20, 2);
                    break;

                case 'arrowAscVer':

                    meshTrinogometry = new THREE.Vector3(x, y + 20, 2);
                    break;

                case 'arrowRight':

                    meshTrinogometry = new THREE.Vector3(x + 30, y, 2);
                    break;

                case 'arrowLeft':

                    meshTrinogometry = new THREE.Vector3(x - 30, y, 2);
                    break;

                default:
                    break;
            }
            
            mesh = this.createSimbol();

            mesh.material.map = this.TEXTURE.y;

            objArrow.meshSecondary = mesh;

            mesh.userData = {
                originOrder : objArrow.originID,
                targetOrder : objArrow.targetID,
                type : 'fork'
            };

            mesh.position.set(meshTrinogometry.x, meshTrinogometry.y, 3);
                    
            let target = Helper.fillTarget(meshTrinogometry.x, meshTrinogometry.y, 3, 'table');
            objArrow.meshSecondaryTarget = target;
        }
    }

     /**
     * @author Ricardo Delgado.
     * creates the movement arrows.
     * @param {String} IdOrigen  step source.
     */ 
    createArrowTest(IdOrigen){

        let children = this.EDIT_STEPS[IdOrigen - 1].children;

        let parent = this.searchParentStepEdit(IdOrigen, this.EDIT_STEPS);

        if(children.length > 0){

            for(let i = 0; i < children.length; i++){

                this.changeArrowTest('step', IdOrigen, children[i].id[0]);
            }
        }

        if(typeof parent === 'number'){
            this.changeArrowTest('step', IdOrigen, parent);
        }
    }

    /**
     * @author Emmanuel Colina.
     * 
     * @param {float, float, int, float}
     */
    trigonometry(vertexOriginX, vertexOriginY, hypotenuse, angleRadians){

        let co, ca, vector = new THREE.Vector3(), x, y;

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
    /**
     * @author Ricardo Delgado.
     * repositions a step.
     * @param {Number} idOrigen    step number of origin.
     * @param {Number} idTarget    target step number.
     * @param {String} IDtile    id component.
     * @returns {object} mesh step.
     */ 
    addIdStepDrag(idOrigen, idTarget, IDtile){

        let mesh = this.createIdStep(),
            difference = this.TILEWIDTH / 2,
            stepOrigen = this.EDIT_STEPS[idOrigen - 1],
            stepTarget = this.EDIT_STEPS[idTarget - 1];

        this.searchArrow(idOrigen, idTarget).meshPrimary.visible = false;

        let newArray = [idTarget];

        let tile = Helper.getSpecificTile(IDtile).target.show;

        let target = Helper.fillTarget(tile.position.x - difference, tile.position.y, tile.position.z + 1, 'table');

        mesh.position.copy(target.hide.position);

        mesh.rotation.copy(target.hide.rotation);

        mesh.userData = {
                id : newArray,
                tile : IDtile,
                type: 'step'
            };

        let children = stepOrigen.children;

        for(let i = 0; i < children.length; i++){

            if(children[i].id[0] === idTarget){
                children[i].id = newArray;
            }
        }
    
        let object = {
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

        stepTarget.order[0] =  stepTarget.order[0] + 0.5;

        let obj = {
                id : stepTarget.order,
                type : 'direct call'
            };

        object.children.push(obj);

        this.EDIT_STEPS.push(object);

        (mesh.material as any).map = this.changeTextureId(idTarget, parent);

        this.calculatePositionsSteps(IDtile);

        this.orderPositionSteps(this.EDIT_STEPS, 'step');

        this.removeArrowTest(1000);

        setTimeout(function(){this.deleteArrow(); this.updateArrow();}, 1000);

        return mesh;
    }
    /**
     * @author Ricardo Delgado.
     * hides the arrows and buttons and make connections arrows for movement.
     * @param {String} type        type of button pressed
     * @param {Number} idOrigen    number step father.
     * @param {Number} idTarget    number step children.
     */ 
    changeArrowTest(type, IdOrigen, IdTarget){

        let object = {
            dataArrow : null,
            arrows : {
                vector1: null,
                vector2: null
            }
        };

        let mesh = null, arrowHelper;

        object.dataArrow = this.searchArrow(IdOrigen, IdTarget);

        if(!object.dataArrow)
            object.dataArrow = this.searchArrow(IdTarget, IdOrigen);
        
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

            let typeCall = this.EDIT_STEPS[IdOrigen - 1].children.find(function(x){
                if(x.id[0] === IdTarget)
                    return x;
            });

            if(!typeCall){

                typeCall = this.EDIT_STEPS[IdTarget - 1].children.find(function(x){
                    if(x.id[0] === IdOrigen)
                        return x;
                });
            }

            let color = this.classFlow.getColor('');

            color = this.classFlow.getColor(typeCall.type);
            
            let from = null;
            let to = null;
            let direction = null;
            let length = null;

            let origen = null;
            let target = this.EDIT_STEPS[IdTarget - 1].target.show.position;

            switch(type) {

                case 'changeStep':
                case 'fork':

                    origen = this.EDIT_STEPS[IdOrigen - 1].target.show.position;
                    from = new THREE.Vector3(origen.x, origen.y, 2);
                    to = new THREE.Vector3(mesh.position.x, mesh.position.y, 2);

                    direction = to.clone().sub(from);
                    length = direction.length();
                    arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, color, 0.1, 0.1);
                    arrowHelper.userData.from = from;
                    object.arrows.vector1 = arrowHelper;
                    globals.scene.add(arrowHelper);

                    from = new THREE.Vector3(target.x, target.y, 2);

                    direction = to.clone().sub(from);
                    length = direction.length();
                    arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, color, 0.1, 0.1);
                    arrowHelper.userData.from = from;
                    object.arrows.vector2 = arrowHelper;
                    globals.scene.add(arrowHelper);

                    break;
                default:

                    origen = this.EDIT_STEPS[IdOrigen - 1].mesh.position;

                    from = new THREE.Vector3(target.x, target.y, 2);
                    to = new THREE.Vector3(origen.x, origen.y, 2);

                    direction = to.clone().sub(from);
                    length = direction.length();
                    arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, color, 0.1, 0.1);
                    arrowHelper.userData.from = from;
                    object.arrows.vector1 = arrowHelper;
                    globals.scene.add(arrowHelper);

                    break; 
            }

            this.SHOW_ARROW.push(object);
        }
    }
    /**
     * @author Ricardo Delgado.
     * removes the movement arrows.
     * @param {Number}   duration   Animation length.
     */ 
    removeArrowTest(duration){

        for(let i = 0; i < this.SHOW_ARROW.length; i++){

            let vector1 = this.SHOW_ARROW[i].arrows.vector1;
            let vector2 = this.SHOW_ARROW[i].arrows.vector2;

            if(vector1)
                globals.scene.remove(vector1);

            if(vector2)
                globals.scene.remove(vector2);
        }

        setTimeout(function(){

            for(let i = 0; i < this.SHOW_ARROW.length; i++){

                let dataArrow = this.SHOW_ARROW[i].dataArrow;

                dataArrow.meshPrimary.visible = true;
                dataArrow.meshSecondary.visible = true;
                dataArrow.arrow.visible = true;
            }

            this.SHOW_ARROW = [];

        }, duration);
    }

    /**
     * @author Emmanuel Colina.
     * 
     * 
     */
    deleteArrow(){

        let array = globals.dragManager.objects,
            newArray = [],
            type = null,
            i;

        for(i = 0; i < array.length; i++ ){

            type = array[i].userData.type;

            if(type){

                if(type === 'step')
                    newArray.push(array[i]);

            }
            else{
                newArray.push(array[i]);
            }

        }

        globals.dragManager.objects = newArray;
        
        for(i = 0; i < this.LIST_ARROWS.length; i++){

            globals.scene.remove(this.LIST_ARROWS[i].arrow);
            globals.scene.remove(this.LIST_ARROWS[i].meshPrimary);
            globals.scene.remove(this.LIST_ARROWS[i].meshSecondary);
        }

        this.LIST_ARROWS = [];
    }

    /**
     * @author Emmanuel Colina.
     * 
     * 
     */
    updateArrow(){

        let i, l;

        for(i = 0; i < this.EDIT_STEPS.length; i++){

            let children = this.EDIT_STEPS[i].children;
            
            for (l = 0; l < children.length; l++) {

                let step = (this.EDIT_STEPS as any).find( function(x){
                    if(children[l].id[0] === x.order[0])
                        return x;
                });
              
                if(step){

                    let originID = this.EDIT_STEPS[i].order,
                        targetID = step.order;

                    if(!this.searchArrow(originID, targetID))
                        this.createLineStep(this.EDIT_STEPS[i].target.show, 
                                        step.target.show,
                                        originID,
                                        targetID,
                                        this.EDIT_STEPS[i].tile,
                                        step.tile);
                }
            }
        }

        for(i = 0; i < this.LIST_ARROWS.length; i++){
                    
            globals.dragManager.objects.push(this.LIST_ARROWS[i].meshPrimary);
            globals.dragManager.objects.push(this.LIST_ARROWS[i].meshSecondary);  
        }
    }
    /**
     * @author Ricardo Delgado.
     * updates the positions of the arrows
     * @param {object} position  mesh position
     */ 
    updatePositionArrowTest(position){

        let from = null, to = null, direction = null, length = null;

        for(let i = 0; i < this.SHOW_ARROW.length; i++){

            let vector1 = this.SHOW_ARROW[i].arrows.vector1;
            let vector2 = this.SHOW_ARROW[i].arrows.vector2;

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
    /**
     * @author Ricardo Delgado.
     * hides and shows the buttons connections.
     * @param {boolean}  _keep  button status.
     */ 
    hideButtonsArrows(_keep){

        let keep = _keep || false; 
        
        for(let i = 0; i < this.LIST_ARROWS.length; i++){

            this.LIST_ARROWS[i].meshPrimary.visible = keep;
            this.LIST_ARROWS[i].meshSecondary.visible = keep;
        }
    }
    /**
     * @author Ricardo Delgado.
     * change the type of connection steps
     * @param {Object}  arrow  selected Connection.
     * @param {Object}  event  mouse event.
     */ 
    changeTypeArrow(arrow, event){

        let idOrigin = arrow.originID[0],
            idTarget = arrow.targetID[0],
            color = null;

        let object = this.EDIT_STEPS[idOrigin - 1].children.find(function(x){
            if(x.id[0] === idTarget)
                return x;
        });

        let typeCall = this.classFlow.TYPECALL,
            array = [],
            select = 0;

        if(object){

            for(let i = 0; i < typeCall.length - 1; i++){
                array.push(typeCall[i].title);

                if(object.type.toLowerCase() === typeCall[i].title.toLowerCase())
                    select = i;
            }

            let callback = function(type){

                object.type = type;

                color = this.classFlow.getColor(type);

                ApplyColor(arrow.arrow);
            };

            globals.fieldsEdit.showLineSelectType(array, select, event, callback);
        }

        function ApplyColor(element){

            for(let i = 0; i < element.children.length; i++){

                element.children[i].material.color.setHex(color);
            }
        }
    }
    /**
     * @author Ricardo Delgado.
     * changes the texture of the steps.
     * @param {Number}  id  number step.
     * @param {Number}  parent  number step father.
     * @returns {THREE.Texture} texture.
     */ 
    changeTextureId(id, parent){

        if(parent)
            parent = parent.toString();
        else
            parent = '';

        let canvas = document.createElement('canvas');
            canvas.height = 412;
            canvas.width = 635;
        let ctx = canvas.getContext('2d');
        let middle = canvas.width / 2;
        let image = this.TEXTURE.image;
        let texture = new THREE.Texture(canvas);
            texture.minFilter = THREE.NearestFilter;

        ctx.drawImage(image, 0, 0);

        ctx.textAlign = 'center';

        ctx.font = '140px Arial';
        ctx.fillText(id, middle - 110, middle - 70);

        ctx.font = '75px Arial';
        ctx.fillText(parent, middle + 185, middle - 85);
        
        texture.needsUpdate = true;

        return texture;
    };
    /**
     * @author Ricardo Delgado.
     * updated textures steps.
     */ 
    updateTextureParent(){

        for(let i = 0; i < this.EDIT_STEPS.length; i++){

            let id = this.EDIT_STEPS[i].order[0];

            let parent = this.searchParentStepEdit(id, this.EDIT_STEPS);

            let mesh = this.EDIT_STEPS[i].mesh;

            mesh.material.map = this.changeTextureId(id, parent);

            mesh.material.needsUpdate = true;
        }
    }
    /**
     * @author Ricardo Delgado.
     * calculates the position of the steps within the tile
     * @param {String} IDtile  id component.
     */ 
    calculatePositionsSteps(idTile){

        let countSteps = [],
            rootY = Helper.getSpecificTile(idTile).target.show.position.y,
            i,
            mesh = null,
            target = null,
            focus = this.FOCUS.mesh;
        
        if(focus){

            focus.visible = false;
            setTimeout(function(){focus.visible = true;}, 2500);
        }

        let action = function (){this.updateTileIgnored();};

        for(i = 0; i < this.EDIT_STEPS.length; i++){

            if(this.EDIT_STEPS[i].tile === idTile)
                countSteps.push(this.EDIT_STEPS[i]);
        }

        hideArrow();
        
        if(countSteps.length === 1){ 

            target = countSteps[0].target.show;

            target.position.y = rootY;

            if(this.actualMode === 'edit-path')
                this.animate(countSteps[0].mesh, countSteps[0].target.show, 500, action);
            else
                countSteps[0].mesh.position.copy(countSteps[0].target.show.position);
        }
        else if(countSteps.length === 2){ 

            for(i = 0; i < countSteps.length; i++) {

                target = countSteps[i].target.show;

                mesh = countSteps[i].mesh;

                if(i === 0){

                    target.position.y = rootY + (this.TILEHEIGHT / 4);

                    if(this.actualMode === 'edit-path')
                        this.animate(mesh, target, 1000);
                    else
                        mesh.position.copy(target.position);
                }
                else{

                    target.position.y = rootY - (this.TILEHEIGHT / 4);

                    if(this.actualMode === 'edit-path')
                        this.animate(mesh, target, 1000, action);
                    else
                        mesh.position.copy(target.position);
                }
            }
        }
        else if(countSteps.length > 2){

            let difference = (this.TILEHEIGHT / 6) / 2,
                topY = rootY + ((this.TILEHEIGHT / 2) - difference),
                countSpaceSteps = countSteps.length - 1,
                distanceSteps = (this.TILEHEIGHT - difference - ((this.TILEHEIGHT / 6) / 2)) / countSpaceSteps;

            for(i = 0; i < countSteps.length; i++) {

                mesh = countSteps[i].mesh;

                target = countSteps[i].target.show;

                target.position.y = topY;

                if(i !== countSpaceSteps){

                    if(this.actualMode === 'edit-path')
                        this.animate(mesh, target, 1000);
                    else
                        mesh.position.copy(target.position);
                }
                else{

                    target.position.y = topY;

                    if(this.actualMode === 'edit-path')
                        this.animate(mesh, target, 1000, action);
                    else
                        mesh.position.copy(target.position);
                }

                topY = topY - distanceSteps; 
            }
        }

        function hideArrow(){

            for(i = 0; i < countSteps.length; i++){

                let children = countSteps[i].children;

                let parent = this.searchParentStepEdit(countSteps[i].order[0], this.EDIT_STEPS);

                let originID = parent,
                    targetID = countSteps[i].order[0];

                let connection = this.searchArrow(originID, targetID);

                if(connection){
                    
                    connection.meshPrimary.visible = false;
                    connection.meshSecondary.visible = false;
                    connection.arrow.visible = false;
                }
            
                for (let l = 0; l < children.length; l++) {

                    originID = countSteps[i].order;
                    targetID = children[l].id;

                    connection = this.searchArrow(originID, targetID);

                    if(connection){
                        
                        connection.meshPrimary.visible = false;
                        connection.meshSecondary.visible = false;
                        connection.arrow.visible = false;
                    }
                }
            }
        }
    }
    /**
     * @author Ricardo Delgado.
     * ordered steps positions on the object
     * @param {array} _array  objects to order.
     * @param {String} type   object type to order.
     */ 
    orderPositionSteps(_array, type){

        let array = _array,
            i, l, mesh;

        for(i = 0; i < array.length; i++) {

            for(l = 0; l < array.length - i; l++) {

                if(array[l + 1]){ 

                    if (array[l].order[0] > array[l + 1].order[0]) {

                        let aux;

                        aux = array[l];

                        array[l] = array[l + 1];

                        array[l + 1] = aux;
                    }
                }
            }
        }

        for(i = 0; i < array.length; i++){

            let newId = i + 1;

            if(array[i].order[0] !== newId){

                array[i].order[0] = newId;

                if(type === 'step'){ 

                    mesh = array[i].mesh;

                    mesh.userData.id[0] = newId;
                }
            }
        }

        if(type === 'step'){

            this.updateStepList(); 

            if(array.length > 0){ 

                this.FOCUS.data = Helper.getLastValueArray(array).mesh;

                this.updateTileIgnored();
            }
            else{

                mesh = this.FOCUS.mesh;

                let target = Helper.fillTarget(0, 0, 0, 'table');

                target.hide.rotation.x = 0;
                target.hide.rotation.y = 0;
                target.hide.rotation.z = 0;

                this.animate(mesh, target.hide, 500);

                this.FOCUS.data = null;

                globals.dragManager.objects = this.getAllTiles();
            }

            this.updateTextureParent();
        }
    }
    /**
     * @author Ricardo Delgado.
     * Updates the focus.
     */ 
    updateTileIgnored(){

        if(this.actualMode === "edit-path"){

            if(this.FOCUS.data){ 

                let id = this.FOCUS.data.userData.id,
                    ignoredTile = this.FOCUS.data.userData.tile,
                    mesh = this.FOCUS.mesh,
                    canvas = document.getElementById('canvas-step-' + id),
                    i;

                globals.fieldsEdit.changeFocus(canvas, id[0]);

                globals.dragManager.objects = [];

                for(i = 0; i < this.EDIT_STEPS.length; i++){

                    if(this.EDIT_STEPS[i].order === id)
                        mesh.position.copy(this.EDIT_STEPS[i].mesh.position);
                    
                    globals.dragManager.objects.push(this.EDIT_STEPS[i].mesh);     
                }

                for(i = 0; i < this.LIST_ARROWS.length; i++){
                    
                    globals.dragManager.objects.push(this.LIST_ARROWS[i].meshPrimary);
                    globals.dragManager.objects.push(this.LIST_ARROWS[i].meshSecondary);  
                }

                for(i = 0; i < globals.tilesQtty.length; i++){

                    if(globals.tilesQtty[i] !== ignoredTile){

                        let tile = Helper.getSpecificTile(globals.tilesQtty[i]).mesh;

                        globals.dragManager.objects.push(tile);
                    }
                }
            }
        }
    }
    /**
     * @author Ricardo Delgado.
     * validates if the step father and son share the same component step
     * @param {Number} step  step number
     * @returns {boolean}
     */ 
    validateChildrenTiles(step){

        let list = this.EDIT_STEPS;

        let children = list[step - 1].children;

        let parent = this.searchParentStepEdit(step, list);

        if(parent){

            let parentTile = list[parent - 1].tile;

            for(let i = 0; i < children.length; i++){

                let stepTile = list[children[i].id[0] - 1].tile;

                if(parentTile === stepTile){
                    return false;
                }
            }
        }

        return true;
    }
    /**
     * @author Ricardo Delgado.
     * Transforms the steps (to the database) or (for workflow-edit).
     * @param {String} to  type of transformation.
     */ 
    transformData(to){

        let json = [], i = 0, l = 0;

        if(to === 'PREVIEW'){ 

            this.PREVIEW_STEPS = [];

            for(i = 0; i < this.EDIT_STEPS.length; i++){

                let tile = null, platfrm = null, children = null, next = [];

                tile = Helper.getSpecificTile(this.EDIT_STEPS[i].tile).data;

                platfrm = tile.platform || tile.superLayer;

                children = this.EDIT_STEPS[i].children;

                for(l = 0; l < children.length; l++){

                    let object = {
                        id : children[l].id[0] - 1,
                        type: children[l].type
                    };

                    next.push(object);
                }

                let step = {
                    id : i,
                    title : this.EDIT_STEPS[i].title[0],
                    desc : this.EDIT_STEPS[i].desc[0],
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

            this.PREVIEW_STEPS = json;
        }
        else{

            this.EDIT_STEPS = [];

            for(i = 0; i < this.PREVIEW_STEPS.length; i++){

                let order = null, title = null, platform = null, layer = null, name = null,
                    IDtile = null, parent = null, desc = null, id = null, typeCall = null;

                order = this.PREVIEW_STEPS[i].id + 1;

                title = this.PREVIEW_STEPS[i].title;

                desc = this.PREVIEW_STEPS[i].desc;

                platform = this.PREVIEW_STEPS[i].platfrm;

                layer = this.PREVIEW_STEPS[i].layer;

                name = this.PREVIEW_STEPS[i].name;

                IDtile = this.getIdSpecificTile(name, platform, layer);

                parent = this.searchStepParentPreview(order - 1, this.PREVIEW_STEPS);

                if(parent){
                    id = parent.id + 1;
                    typeCall = parent.typeCall;
                }

                let mesh = this.addIdStep(order, IDtile, id, typeCall, true);

                this.EDIT_STEPS[order - 1].title[0] = title;

                this.EDIT_STEPS[order - 1].desc[0] = desc;

                this.FOCUS.data = mesh;
            }
        }
    }
    /**
     * @author Ricardo Delgado.
     * updates the list of steps to repair
     * @param {String} idStep  number step.
     */ 
    updateStepsRepared(idStep){

        let _obj = this.REPARED_STEPS.steps;
        let div = document.getElementById("steps-list") as any;
        let con = document.getElementById("steps-list-content");
        
        con.innerHTML = "";

        if(!this.REPARED_STEPS.mesh)
            this.REPARED_STEPS.mesh = this.createIdStep();

        let mesh = this.REPARED_STEPS.mesh;

        for(let i = 0; i < _obj.length; i++){

            let step = Helper.clone(_obj[i]);

            step.mesh = mesh;

            let id = step.id + 1;

            div.addStep(id, step, 'repared');
        }

        if(typeof idStep === 'number')
            document.getElementById('canvas-step-' + (idStep + 1)).click();
    }
    /**
     * @author Ricardo Delgado.
     * validates if a step has an empty title.
     */ 
    validateFieldSteps(){

        return (this.EDIT_STEPS as any).find(function(x){ if(x.title[0] === '') return x; });   
    }
    /**
     * @author Ricardo Delgado.
     * changes from tile to a step
     * @param {Number} orderFocus number step.
     * @param {String} newTile    new Tile to move.
     */ 
    changeTileStep(orderFocus, newTile){

        let step = this.EDIT_STEPS[orderFocus - 1];

        let focus = this.FOCUS.mesh;

        focus.visible = false;

        let oldTile = step.tile;

        let difference = this.TILEWIDTH / 2;

        let tile = Helper.getSpecificTile(newTile).target.show;

        let target = Helper.fillTarget(tile.position.x - difference, tile.position.y, tile.position.z + 1, 'table');

        step.target = target;

        step.tile = newTile;

        step.mesh.userData.tile = newTile;

        this.calculatePositionsSteps(newTile);

        this.calculatePositionsSteps(oldTile);

        setTimeout(function() { focus.visible = true; }, 1500);

        this.removeArrowTest(1000);

        setTimeout(function(){ this.deleteArrow(); this.updateArrow();}, 1000);

        this.updateStepList();
    }
    /**
     * @author Ricardo Delgado.
     * validates if the step is released on a step father or children
     * @param {number} orderStepFocus id step
     * @param {String} tileValidate   id tile
     * @returns {boolean}
     */
    validateCollisionTileSteps(orderStepFocus, tileValidate){

        let validate = true,
            stepFocus = this.EDIT_STEPS[orderStepFocus - 1],
            children = stepFocus.children,
            parent = this.searchParentStepEdit(orderStepFocus, this.EDIT_STEPS);

        if(parent){
            if(tileValidate === this.EDIT_STEPS[parent - 1].tile)
                validate = false;
        }

        if(children.length > 0){

            for(let i = 0; i < children.length; i++){

                let order = children[i].id[0];

                if(tileValidate === this.EDIT_STEPS[order - 1].tile)
                    validate = false;
            }
        }

        return validate;
    }
    /**
     * @author Ricardo Delgado.
     * validates if the step is released on the same tile
     * @param {number} order id step
     * @param {String} tile  Validate id tile
     * @returns {boolean} 
     */ 
    validateCollisionTile(order, tileValidate){

        let validate = true,
            stepFocus = this.EDIT_STEPS[order - 1];

        if(stepFocus.tile === tileValidate)
            validate = false;

        return validate;
    }
    /**
     * @author Ricardo Delgado.
     * Finds all the tiles shown
     * @param {String} idIgnore id for the tile to ignore.
     * @returns {Array} Processed list.
     */ 
    getAllTiles(idIgnore?){

        let array = [];

        for(let t = 0; t < globals.tilesQtty.length; t++){

            if(globals.tilesQtty[t] !== idIgnore){

                let tile = Helper.getSpecificTile(globals.tilesQtty[t]).mesh;

                array.push(tile);
            }
        }

        return array;
    }
    /**
     * @author Ricardo Delgado.
     * calculates whether the mouse is inside a tile in specific
     * @param {Object} position Mouse position.
     * @returns {Boolean} true or false.
     */ 
    calculateAreaTile(position){

        let tile = Helper.getSpecificTile(this.FOCUS.data.userData.tile).target.show;

        let x = position.x,
            y = position.y,
            xInit = tile.position.x - (this.TILEWIDTH / 2) - globals.TILE_SPACING,
            yInit = tile.position.y + (this.TILEHEIGHT / 2),
            xEnd = xInit + this.TILEWIDTH,
            yEnd = yInit - this.TILEHEIGHT;

        if((x >= xInit && x <= xEnd) && (y <= yInit && y >= yEnd))
            return true;
        else
            return false;
    }
    /**
     * @author Ricardo Delgado.
     * Hides or shows the header for workflow-edit
     * @param {Boolean} visible
     */ 
    displayField(visible){

        if(visible)
            Helper.show("workflow-header", 1500);
        else
            Helper.hide("workflow-header", 0, true);
    }
    /**
     * @author Ricardo Delgado.
     * New OnKeyDown for 'esc'.
     * @param {Event} event event to listen to.
     */ 
    newOnKeyDown(event){

        if(event.keyCode === 27) {

            globals.camera.disableFocus();

            globals.actualView = 'workflows';

            globals.camera.onKeyDown(event);
        }
    }
    /**
     * @author Ricardo Delgado.
     * Updates the list with the states of the steps.
     */ 
    updateStepList(){

        let _obj = this.EDIT_STEPS.slice();
        let div = document.getElementById("steps-list") as any;
        let con = document.getElementById("steps-list-content");
        
        con.innerHTML = "";

        for(let i = 0; i < _obj.length; i++){

            let id = i + 1;

            if(this.validateChildrenTiles(id)){
                _obj[i].state = 'good';
            }
            else{
                _obj[i].state = 'locked';
            }

            div.addStep(id, _obj[i], this.actualMode);
        }
    }
    /**
     * @author Ricardo Delgado.
     * Delete a step from the list and sort the list.
     * @param {Number} step  step number to be deleted.
     * @param {Array}  array  list processing.
     * @param {type} type  type of item to be deleted.
     * @param {Number}   duration   Animation length.
     */ 
    deleteSteps(step, array, type, duration){

        let list = array,
            ORDER = this.SearchStepPositionEdit(step, list),
            tilesCalculatePositions = [],
            removeStep = [],
            i = 0, l = 0,
            state = true,
            validate = true;

        if(type === 'step')
            this.FOCUS.mesh.material.visible = false;
        else 
            state = false;

        if(list[ORDER].children.length > 0){

            if(type === 'step')
               validate = this.validateChildrenTiles(step);

            if(validate){ 

                let oldChildren = list[ORDER].children,
                    odlStep = list[ORDER].order,
                    newIdStep = this.SearchStepPositionEdit(oldChildren[0].id[0], list),
                    newStep = list[newIdStep];
        
                odlStep[0] = newStep.order[0];
                newStep.order = odlStep;

                if(type === 'step')
                    newStep.mesh.userData.id = odlStep;

                deleteStep(ORDER);

                for(i = 1; i < oldChildren.length; i++){

                    fillRemove(oldChildren[i].id[0]);

                    removeStep.push(oldChildren[i].id[0]);
                }

                for(i = 0; i < removeStep.length; i++)
                     deleteStep(this.SearchStepPositionEdit(removeStep[i], list));
            }else{
                state = false;
                this.resetPositionIdStepMesh(step, 'delete');
            }
        }
        else{

            for(i = 0; i < list.length; i++){

                let children = list[i].children;

                for(l = 0; l < children.length; l++){ 

                    if(children[l].id[0] === step)
                        children.splice(l, 1);
                }
            }

            deleteStep(ORDER);
        }

        if(type === 'step'){ 

            for(i = 0; i < tilesCalculatePositions.length; i++)
                this.calculatePositionsSteps(tilesCalculatePositions[i]);
        }

        if(state){

            this.removeArrowTest(1000);

            this.orderPositionSteps(this.EDIT_STEPS, 'step');

            setTimeout(function(){this.deleteArrow(); this.updateArrow();}, duration);

            this.updateTextureParent();
        }

        if(type === 'step')
            this.FOCUS.mesh.material.visible = true;
        else
            this.orderPositionSteps(list, 'flow');

        function deleteStep(order){

            if(type === 'step')
                removeMesh(list[order]);

            list.splice(order, 1);
        }

        function removeMesh(data){

            let mesh = data.mesh,
                target = data.target,
                tile = data.tile;

            if(!(tilesCalculatePositions as any).find(function(x){if(x === tile) return x;}))
                tilesCalculatePositions.push(tile);

            this.animate(mesh, target.hide, 2000, function(){ 
                globals.scene.remove(mesh);
            });
        }

        function fillRemove(_order){

            let order = this.SearchStepPositionEdit(_order, list),
                i = 0;

            for(i = 0; i < list[order].children.length; i++){

                let children = list[this.SearchStepPositionEdit(list[order].children[i].id[0], list)].children;

                removeStep.push(list[order].children[i].id[0]);

                if(children.length > 0)
                    fillRemove(list[order].children[i].id[0]);
            }
        }
    }
    /**
     * @author Ricardo Delgado.
     * orders and clears the steps with errors.
     * @param {array} steps object to be processed.
     * @returns {array} processed object.
     */ 
    resetSteps(steps){

        let array = [], i;

        for(i = 0; i < steps.length; i++){

            let object = {
                    order : [],
                    children :[],
                    title : [],
                    desc : [],
                    tile : null
                };

            let id = steps[i].id;

            object.order[0] = id + 1;
            object.title[0] = steps[i].title;
            object.desc[0] = steps[i].desc;

            if(steps[i].element !== -1)
                object.tile = steps[i].element;

            if(id !== 0){

                let parent = this.searchStepParentPreview(id, steps);

                if(typeof parent.id === 'number'){

                    let obj = {
                        id : object.order,
                        type : parent.typeCall
                    };

                    this.searchStepEdit(parent.id + 1, array).children.push(obj);
                }
            }

            array.push(object);
        }

        validateTiles();

        return array;

        function validateTiles(){

            let deleteStep = null, i;

            for(i = 0; i < array.length; i++){

                if(!deleteStep){

                    if(!array[i].tile)
                        deleteStep = array[i].order[0];
                }
            }

            for(i = 0; i < array.length; i++){

                if(!deleteStep){

                    let id = validateChildTiles(array[i].order[0] - 1);

                    if(id)
                        deleteStep = id;
                }
            }

            if(deleteStep){
                this.deleteSteps(deleteStep, array, 'flow', 1000);
                validateTiles();
            }

            function validateChildTiles(order){

                let tile = array[order].tile;

                let children = array[order].children;

                for(let i = 0; i < children.length; i++){

                    let idTile = array[children[i].id[0] - 1].tile;

                    if(tile === idTile){
                        return array[children[i].id[0] - 1].order[0];
                    }
                }

                return false;
            }
        }
    }
    /**
     * @author Ricardo Delgado.
     * resets the position of the mesh step.
     * @param {Number} orderFocus   number step.
     * @param {String} typeReset    reason to restart the mesh.
     */
    resetPositionIdStepMesh(orderFocus, typeReset){

        let focus = this.FOCUS.mesh,
            step = this.EDIT_STEPS[orderFocus - 1],
            mesh = step.mesh,
            msj = null;

        focus.visible = false;

        let xInit = mesh.position.x - 0.5;

        let xEnd = mesh.position.x + 0.5;

        let target = step.target.show;

        if(typeReset === 'collision')
            msj = "You can't have a two consequent steps with the same component!";
        else if(typeReset === 'delete')
            msj = "You can't remove this step because its father and child has the same component!";

        if(target.position.x >= xInit && target.position.x <= xEnd){
            focus.visible = true;
            this.removeArrowTest(0);
        }
        else{
            this.removeArrowTest(500);
        }

        this.animate(mesh, target, 300, function(){
            this.FOCUS.mesh.position.copy(mesh.position);
            focus.visible = true;

            if(msj){
                window.alert(msj);
            }
        });
    }
    /**
     * @author Ricardo Delgado.
     * resets the position of the buttons Connection.
     * @param {object} mesh       object mesh animate.
     * @param {String} type       new Tile to move.
     * @param {array} originID    number of step father.
     * @param {array} targetID    number of step children.
     */ 
    resetPositionStepMeshButtons(mesh, type, IdOrigen, IdTarget){

        let object = this.searchArrow(IdOrigen, IdTarget);

        let target = null;

        if(type === 'changeStep')
            target = object.meshPrimaryTarget.show;
        else
            target = object.meshSecondaryTarget.show;

        this.removeArrowTest(0);

        this.animate(mesh, target, 300);
    }

    /**
     * @author Ricardo Delgado.
     * Seeks the position of a specific step
     * @param {String} id   step number.
     * @param {array} array search list.
     * @returns {object} step properties.
     */ 
    searchStepEdit(id, array){

        for(let  i = 0; i < array.length; i++){

            if(id === array[i].order[0])
                return array[i];
        }

        return false;
    }
    /**
     * @author Ricardo Delgado.
     * looking for the father of a step
     * @param {String} id   step number.
     * @param {array} array search list.
     * @returns {Object or Boolean} step properties or false.
     */ 
    searchParentStepEdit(id, array){

        let i, l, children;

        for(i = 0; i < array.length; i++){

            children = array[i].children;

            for(l = 0; l < children.length; l++){

                if(children[l].id[0] === id)
                    return array[i].order[0];
            }
        }

        return false;
    }
    /**
     * @author Ricardo Delgado.
     * seeks the position of step
     * @param {number} id  id step
     * @param {array} array  object to search.
     * @returns {number} position
     */ 
    SearchStepPositionEdit(id, array){

        for(let i = 0; i < array.length; i++){

            if(array[i].order[0] === id)
                return i;
        }
    }

    /**
     * @author Ricardo Delgado.
     * looking for a specific step
     * @param {number} id  number of step.
     * @param {array} array  object to search.
     * @returns {boolean}
     */ 
    searchStepParentPreview(id, array){

        let i, l, next, _id, obj;

        for(i = 0; i < array.length; i++){

            next = array[i].next;

            for(l = 0; l < next.length; l++){

                _id = parseInt(next[l].id);

                if(_id === id){

                    obj = {
                        id : array[i].id,
                        typeCall : next[l].type
                    };

                    return obj;
                }
            }
        }

        return false;
    }
   /**
     * @author Ricardo Delgado.
     * validates the existence of a connection.
     * @param {array} originID  number of step father.
     * @param {array} targetID  number of step children.
     * @returns {boolean}
     */ 
    searchArrow(originID, targetID){

        return  (this.LIST_ARROWS as any).find(function(x){
                    if(x.originID === originID && x.targetID === targetID)
                        return x;
                    else if(x.originID[0] === originID && x.targetID[0] === targetID)
                        return x;
                });
    }

    /**
     * @author Ricardo Delgado.
     * clean all the letiables
     */ 
    cleanEditStep(){

        let target = Helper.fillTarget(0, 0, 0, 'table');

        globals.scene.remove(this.FOCUS.mesh);

        let i = 0;

        for(i = 0; i < this.EDIT_STEPS.length; i++){

            let mesh = this.EDIT_STEPS[i].mesh;

            this.animate(mesh, target.hide, 2000, function(){
                globals.scene.remove(mesh);
            });
        }

        for(i = 0; i < this.LIST_ARROWS.length; i++){

            globals.scene.remove(this.LIST_ARROWS[i].meshPrimary);
            globals.scene.remove(this.LIST_ARROWS[i].meshSecondary);
            globals.scene.remove(this.LIST_ARROWS[i].arrow);
        }

        if(this.REPARED_STEPS.mesh)
            globals.scene.remove(this.REPARED_STEPS.mesh);

        this.FOCUS.data = null;

        this.FOCUS.mesh = null;

        this.EDIT_STEPS = [];

        this.LIST_ARROWS = [];

        this.REPARED_STEPS = { 
            steps : [],
            mesh : null
        };

        this.SHOW_ARROW = [];
    }
    /**
     * @author Ricardo Delgado.
     * deletes all buttons.
     */ 
    cleanButtons(){

        globals.buttonsManager.deleteButton('button-save');
        globals.buttonsManager.deleteButton('button-preview');
        globals.buttonsManager.deleteButton('button-path');
        globals.buttonsManager.deleteButton('button-Steps'); 
        globals.buttonsManager.deleteButton('help-repared');
        globals.buttonsManager.deleteButton('help-path');
        globals.buttonsManager.deleteButton('help-edit');   
    }
}