/**
 * Represents a flow of actions related to some tiles
 * @param   {Object}  flow The objects that describes the flow including a set of steps
 */
function FlowManager(){

    // Private Variables
    var headerFlow = [],
        positionHeaderFlow = [],
        actualFlow = null;

    // Public method
    /**
    * @author Emmanuel Colina
    * @lastmodifiedBy Ricardo Delgado
    * Delete All the actual view to table
    */
    this.deleteAllWorkFlows = function(){

        var _duration = 2000;

        if(headerFlow){
            for(var i = 0; i < headerFlow.length; i++) {

                headerFlow[i].deleteAll();
                window.helper.hideObject(headerFlow[i].objects[0], false, _duration);
            }
        }
        
        headerFlow = [];
    };

    this.getActualFlow = function(){

        if(actualFlow) {
            for(var i = 0; i < actualFlow.length; i++) {
                actualFlow[i].deleteAll();
            }
            actualFlow = null;
        }
    };

    this.getAndShowFlows = function(id) {
        
        var button = document.createElement('button'),
            sucesorButton = document.getElementById('developerButton') || document.getElementById('backButton'),
            element = window.table[id];
        
        button.id = 'showFlows';
        button.className = 'actionButton';
        button.style.position = 'absolute';
        button.innerHTML = 'Loading flows...';
        button.style.top = '10px';
        button.style.left = (sucesorButton.offsetLeft + sucesorButton.clientWidth + 5) + 'px';
        button.style.zIndex = 10;
        button.style.opacity = 0;
        document.body.appendChild(button);
        
        window.helper.show(button, 1000);
        
        $.ajax({
            url: 'http://52.35.117.6:3000/repo/procs?platform=' + (element.group || element.superLayer) + '&layer=' + element.layer + '&component=' + element.name,
            method: "GET"
        }).success(
            function(processes) {
                var p = processes,
                    flows = [];
                
                for(var i = 0; i < p.length; i++) {
                    
                    flows.push(new ActionFlow(p[i]));
                }
                
                if(flows.length > 0) {
                    button.innerHTML = 'Show Workflows';
                    button.addEventListener('click', function() {
                        showFlow(flows);
                        window.helper.hide(button, 1000, false);
                        window.helper.hide('developerButton', 1000, false);
                    });
                }
                else {
                    window.helper.hide(button, 1000, false);
                }
            }
        );
    };

    this.showWorkFlow = function() {

        if (window.camera.getFocus() !== null) {

            window.camera.loseFocus();

            window.headers.transformWorkFlow(2000);

            for (var i = 0; i < headerFlow.length ; i++) {

                if(headerFlow[i].action){

                    headerFlow[i].deleteStep();
                    headerFlow[i].action = false;
                }
                else{
                    headerFlow[i].showAllFlow();
                }
            }
            
            window.helper.hideBackButton();
        }
    };

    /**
     * @author Emmanuel Colina
     * Get the headers flows
     */
    this.getHeaderFLow = function() {

        $.ajax({
            url: 'http://52.35.117.6:3000/v1/repo/procs/',
            method: "GET"
        }).success(
            function(processes) {
                var p = processes, objectHeaderInWFlowGroup;    
                
                for(var i = 0; i < p.length; i++){
                    headerFlow.push(new ActionFlow(p[i])); 
                }
                objectHeaderInWFlowGroup = window.headers.getPositionHeaderViewInFlow();   
                calculatePositionHeaderFLow(headerFlow, objectHeaderInWFlowGroup);   
            }
        );
    };

    // Private method

    /**
     * @author Emmanuel Colina
     * 
     */
     
    this.onElementClickHeaderFlow = function(id) {

        var duration = 1000;

        if (window.camera.getFocus() == null) {
            
            var camTarget = headerFlow[id].objects[0].clone();
            camTarget.position.y -= 850;

            window.camera.setFocus(camTarget, new THREE.Vector4(0, -850, 2600, 1),duration);

            for (var i = 0; i < headerFlow.length ; i++) {
                if(id !== i)
                    headerFlow[i].letAloneHeaderFlow();
            }

            headers.hidetransformWorkFlow(duration);

            setTimeout(function() {
                for (var i = 0; i < headerFlow[id].flow.steps.length; i++) {
                    headerFlow[id].drawTree(headerFlow[id].flow.steps[i], headerFlow[id].positions.target[0].x + 900 * i, headerFlow[id].positions.target[0].y - 211, 0);
                }
               headerFlow[id].showSteps();
            }, 1000);

            window.helper.showBackButton();
        }
    };

    /**
     * @author Emmanuel Colina
     * Calculate the headers flows
     */
    function calculatePositionHeaderFLow (headerFlow, objectHeaderInWFlowGroup) { 

        var position, indice = 1;
        var find = false;

        for (var i = 0; i < objectHeaderInWFlowGroup.length; i++) {

            for (var j = 0; j < headerFlow.length; j++) {

                if(objectHeaderInWFlowGroup[i].name === headerFlow[j].flow.platfrm){
                    
                    if(find === false){

                        position = new THREE.Vector3();

                        position.x = objectHeaderInWFlowGroup[i].position.x - 1500;

                        position.y = objectHeaderInWFlowGroup[i].position.y - 2500;

                        positionHeaderFlow.push(position);

                        headerFlow[j].draw(position.x, position.y, 0, indice, j);

                        find = true;
                    }
                    else
                    {
                        position = new THREE.Vector3();

                        position.x = objectHeaderInWFlowGroup[i].position.x - 1500;
                        
                        position.y = positionHeaderFlow[positionHeaderFlow.length - 1].y - 500;

                        headerFlow[j].draw(position.x, position.y, 0, indice, j);

                        positionHeaderFlow.push(position);
                    }    
                }
            }
            find = false;     
        }
    }

    //Should draw ONLY one flow at a time
    function showFlow (flows) {
    
        var position = window.camera.getFocus().position;
        var indice = 0;

        window.camera.enable();
        window.camera.move(position.x, position.y, position.z + window.TILE_DIMENSION.width * 5);
        
        setTimeout(function() {
            
            actualFlow = [];
            
            for(var i = 0; i < flows.length; i++) {
                actualFlow.push(flows[i]);
                flows[i].draw(position.x, position.y, 0, indice, i);
                
                //Dummy, set distance between flows
                position.x += window.TILE_DIMENSION.width * 10;
            }
            
        }, 1500);
    }
}