/**
 * Represents a flow of actions related to some tiles
 * @param   {Object}  flow The objects that describes the flow including a set of steps
 */
class WorkFlowManager {

    // Private letiables
    headerFlow = [];
    positionHeaderFlow = [];
    actualFlow = null;

    // Public method
    getObjHeaderFlow(){ 
        return this.headerFlow;
    };

    getpositionHeaderFlow(){ 
        return this.positionHeaderFlow;
    };
    /**
     * @author Emmanuel Colina
     * Set position for each Header Flow
     * @param {Object} header target
     */

    createColumHeaderFlow(header){

        let countElement = 0,
            obj,
            ids = [],
            position = [],
            center;

        for(let i = 0; i < this.headerFlow.length; i++) {
            if(header.name === this.headerFlow[i].flow.platfrm){
                countElement = countElement + 1;
                ids.push(i);
            }
        }

        center = new THREE.Vector3();
        center.copy(header.position);
        center.y = center.y - 2700;

        if(countElement === 1)
            position.push(center);
        else if(countElement === 2) {

            center.x = center.x - 500;

            obj = new THREE.Vector3();

            obj.x = center.x;
            obj.y = center.y;

            position.push(obj);
        }
        else if(countElement > 2){

            let mid;

            mid = Math.round(countElement / 2);

            for(let x = mid; x > 0; x--) {

                center.x = center.x - 2000;
            }

            obj = new THREE.Vector3();

            obj.x = center.x + 2200;
            obj.y = center.y;

            position.push(obj);
        }

        this.letAloneColumHeaderFlow(ids);

        this.drawColumHeaderFlow(ids, position); // create
    };

    /**
    * @author Emmanuel Colina
    * @lastmodifiedBy Ricardo Delgado
    * Delete All the actual view to table
    */
    deleteAllWorkFlows(){

        let _duration = 2000;

        if(this.headerFlow){
            for(let i = 0; i < this.headerFlow.length; i++) {
                this.headerFlow[i].deleteAll();
                Helper.hideObject(this.headerFlow[i].objects[0], false, _duration);
                globals.scene.remove(this.headerFlow[i]);
            }
        }

        this.headerFlow = [];
    };

    getActualFlow(){

        if(this.actualFlow) {
            for(let i = 0; i < this.actualFlow.length; i++) {
                this.actualFlow[i].deleteAll();
            }
            this.actualFlow = null;
        }
    };

    getAndShowFlows(id) {

        let element = Helper.getSpecificTile(id).data;

        let button = globals.buttonsManager.createButtons('showFlows', 'Loading flows...');

        let params = {
            group : (element.platform || element.superLayer),
            layer : element.layer,
            component : element.name
        };

        let url = '';

        if(!globals.disconnected)
            url = globals.api.getAPIUrl("procs", params);
        else
            url = 'json/testData/procs.json';

        $.ajax({
            url: url,
            method: "GET"
        }).done(
            function(processes) {
                let p = processes,
                    flows = [];

                for(let i = 0; i < p.length; i++) {

                    flows.push(new Workflow(p[i]));
                }

                if(flows.length > 0) {
                    button.innerHTML = 'Show Workflows';
                    button.addEventListener('click', function() {
                        this.showFlow(flows);
                        globals.buttonsManager.removeAllButtons();
                    });
                }
                else
                    globals.buttonsManager.deleteButton('showFlows');
            }
        );
    };

    showWorkFlow() {

        if(globals.camera.getFocus() !== null) {

            globals.camera.loseFocus();

            globals.headers.transformWorkFlow(2000);

            for(let i = 0; i < this.headerFlow.length ; i++) {

                if(this.headerFlow[i].action){

                    this.headerFlow[i].deleteStep();
                    this.headerFlow[i].action = false;
                    this.headerFlow[i].showAllFlow();
                }
                else
                    this.headerFlow[i].showAllFlow();
            }

            Helper.hideBackButton();
        }
    };

    /**
     * @author Emmanuel Colina
     * Get the headers flows
     */
    getHeaderFLow() {

        let url = '';

        if(!globals.disconnected)
            url = globals.api.getAPIUrl("procs");
        else
            url = 'json/testData/procs.json';

        $.ajax({
            url: url,
            method: "GET"
        }).done(
            function(processes) {
                let p = processes, objectHeaderInWFlowGroup;

                for(let i = 0; i < p.length; i++){
                    
                    if(globals.platforms[p[i].platfrm] || globals.superLayers[p[i].platfrm])
                        this.headerFlow.push(new Workflow(p[i]));
                }
                objectHeaderInWFlowGroup = globals.headers.getPositionHeaderViewInFlow();
                this.calculatePositionHeaderFLow(this.headerFlow, objectHeaderInWFlowGroup);
            }
        );
    };

    // Private method

    /**
     * @author Emmanuel Colina
     *
     */

    onElementClickHeaderFlow(id) {

        let duration = 1000;

        if(globals.camera.getFocus() == null) {

            let camTarget = this.headerFlow[id].objects[0].clone();
            camTarget.position.y -= 850;

            globals.camera.setFocus(camTarget, new THREE.Vector4(0, -850, 2600, 1), duration);

            for(let i = 0; i < this.headerFlow.length ; i++) {
                if(id !== i)
                    this.headerFlow[i].letAloneHeaderFlow();
            }

            globals.headers.hidetransformWorkFlow(duration);

            setTimeout(function() {
                for(let i = 0; i < this.headerFlow[id].flow.steps.length; i++) {
                    this.headerFlow[id].drawTree(this.headerFlow[id].flow.steps[i], this.headerFlow[id].positions.target[0].x + 900 * i, this.headerFlow[id].positions.target[0].y - 211, 0);
                }
               this.headerFlow[id].showSteps();
            }, 1000);

            globals.buttonsManager.removeAllButtons();
            Helper.showBackButton();
            globals.workFlowEdit.addButton(id);
        }
    };

    /**
     * @author Emmanuel Colina
     * Calculate the headers flows
     */
    calculatePositionHeaderFLow(headerFlow, objectHeaderInWFlowGroup) {

        let position, indice = 1;
        let find = false;

        for(let i = 0; i < objectHeaderInWFlowGroup.length; i++) {

            for(let j = 0; j < headerFlow.length; j++) {

                if(objectHeaderInWFlowGroup[i].name === headerFlow[j].flow.platfrm){

                    if(find === false){

                        position = new THREE.Vector3();

                        position.x = objectHeaderInWFlowGroup[i].position.x - 1500;

                        position.y = objectHeaderInWFlowGroup[i].position.y - 2500;

                        this.positionHeaderFlow.push(position);

                        headerFlow[j].draw(position.x, position.y, 0, indice, j);

                        find = true;
                    }
                    else{

                        position = new THREE.Vector3();

                        position.x = objectHeaderInWFlowGroup[i].position.x - 1500;

                        position.y = this.positionHeaderFlow[this.positionHeaderFlow.length - 1].y - 500;

                        headerFlow[j].draw(position.x, position.y, 0, indice, j);

                        this.positionHeaderFlow.push(position);
                    }
                }
            }
            find = false;
        }
    }

    //Should draw ONLY one flow at a time
    showFlow(flows) {

        let position = globals.camera.getFocus().position;
        let indice = 0;

        globals.camera.enable();
        globals.camera.move(position.x, position.y, position.z + globals.TILE_DIMENSION.width * 5);

        setTimeout(function() {

            this.actualFlow = [];

            for(let i = 0; i < flows.length; i++) {
                this.actualFlow.push(flows[i]);
                flows[i].draw(position.x, position.y, 0, indice, i);

                //Dummy, set distance between flows
                position.x += globals.TILE_DIMENSION.width * 10;
            }

        }, 1500);
    }

    /**
     * @author Emmanuel Colina
     * let alone the header flow
     * @param {Object} ids id of header flow
     */
    letAloneColumHeaderFlow(ids){

        let find = false;

        for(let p = 0; p < this.headerFlow.length ; p++) {

            for(let q = 0; q < ids.length; q++){
                if(ids[q] === p)
                    find = true;
            }
            if(find === false)
                this.headerFlow[p].letAloneHeaderFlow();

            find = false;
        }
    }

    /**
     * @author Emmanuel Colina
     * set position to header flow
     * @param {Object} ids id of header flow
     * @param {Object} position of header flow
     */

    setPositionColumHeaderFlow(ids, position){

        let duration = 3000;

        new TWEEN.Tween(this.headerFlow[ids].objects[0].position)
        .to({
            x : position[0].x,
            y : position[0].y,
            z : position[0].z
        }, Math.random() * duration + duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();
    }

    /**
     * @author Emmanuel Colina
     * draw header flow
     * @param {Object} ids id of header flow
     * @param {Object} position of header flow
     */
    drawColumHeaderFlow(ids, position){ 

        let xDraw;

        for(let m = 0; m < ids.length; m++) {

            for(let k = 0; k < this.headerFlow[ids[m]].flow.steps.length; k++) {
                xDraw = this.headerFlow[ids[m]].drawTree(this.headerFlow[ids[m]].flow.steps[k], position[0].x + 900 * k, position[0].y - 211, 0);
            }

            this.headerFlow[ids[m]].showSteps();
            this.headerFlow[ids[m]].action = true;

            this.setPositionColumHeaderFlow(ids[m], position);

            position[0].x = xDraw + 1500;
        }
    }
}
