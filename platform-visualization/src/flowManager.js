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
    function onElementClickHeaderFlow(id) {

        var duration = 1000;

        if (window.camera.getFocus() == null) {

            window.camera.setFocus(id, headerFlow[id].objects[0], new THREE.Vector4(0, -850, 2600, 1),duration);

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
    }

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
    
        var position = objects[window.camera.getFocus()].position;
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

    function ActionFlow(flow) {

        var BOX_WIDTH = 825,
            BOX_HEIGHT = 188,
            X_OFFSET = -312, //Because lines don't come from the center
            ROW_SPACING = 350,
            COLUMN_SPACING = 900,
            HEADER_WIDTH = 825,
            HEADER_HEIGHT = 238;

        var self = this;

        var used = [];

        var objectsFlow = {
                mesh : [],
                position :{
                    target : [],
                    origin : []
                } 
        },
            objectsStep = {
                mesh : [],
                position :{
                    target : [],
                    origin : []
                }
        };

        this.flow = flow || [];

        this.action = false;

        this.objects = objectsFlow.mesh;

        this.positions = objectsFlow.position;

        initFlow();

        var onClick = function(target) {

            if(window.actualView === 'workflows'){
                
                onElementClickHeaderFlow(target.userData.id);
                self.action = true;
            }
        };

        // Public method

        /**
         * Draws the flow
         * @lastmodifiedBy Emmanuel Colina
         * @lastmodifiedBy Ricardo Delgado
         * @param   {Number}  initialX Position where to start
         * @param   {Number}  initialY Position where to start
         */
        this.draw = function(initialX, initialY, initialZ, indice, id) {

            var title = createTitleBox(self.flow.name, self.flow.desc),
                origin = window.helper.getOutOfScreenPoint(0),
                target = new THREE.Vector3(initialX, initialY + window.TILE_DIMENSION.height * 2, initialZ);

            title.userData = {
                    id: id,
                    onClick : onClick
            };
            
            objectsFlow.position.origin.push(origin);
            objectsFlow.position.target.push(target);
            
            title.position.copy(origin);
            
            objectsFlow.mesh.push(title);
            
            window.scene.add(title);

            if (indice === 0){
                
                for(var i = 0, l = self.flow.steps.length; i < l; i++){
                    self.drawTree(self.flow.steps[i], initialX + COLUMN_SPACING * i, initialY, 0);
                }
                
                new TWEEN.Tween(this)
                    .to({}, 8000)
                    .onUpdate(window.render)
                    .start();

                self.showAllFlow();
                self.showSteps();
            }

            else if (indice === 1){
                self.showAllFlow();
            }
        };

        /**
         * @author Miguel Celedon
         * @lastmodifiedBy Ricardo Delgado
         * Recursively draw the flow tree
         * @param {Object} root The root of the tree
         * @param {Number} x    X position of the root
         * @param {Number} y    Y position of the root
         */

        this.drawTree = function(root, x, y, z) {
            
            if (typeof root.drawn === 'undefined'){
                
                drawStep(root, x, y, z);

                var childCount = root.next.length,
                    startX = x - 0.5 * (childCount - 1) * COLUMN_SPACING;

                if (childCount !== 0){
                    
                     var lineGeo,
                         lineMat, 
                         rootPoint,
                         rootLine,
                         origin;           
                    
                    lineGeo = new THREE.Geometry();
                    lineMat = new THREE.LineBasicMaterial({color : 0x000000});
                    rootPoint = new THREE.Vector3(x + X_OFFSET, y - ROW_SPACING / 2, -1);

                    lineGeo.vertices.push(
                                new THREE.Vector3(x + X_OFFSET, y, -1),
                                rootPoint
                                );

                    rootLine = new THREE.Line(lineGeo, lineMat);
                    origin = helper.getOutOfScreenPoint(-1);
                    rootLine.position.copy(origin);
                    objectsStep.position.origin.push(origin);
                    objectsStep.position.target.push(new THREE.Vector3(0, 0, 0));
                    
                    objectsStep.mesh.push(rootLine);
                    window.scene.add(rootLine);

                    var nextX, 
                        nextY, 
                        childLine, 
                        child, 
                        i, 
                        isLoop, 
                        nextZ = z;

                    for(i = 0; i < childCount; i++) {

                        child = getStep(root.next[i].id);
                        isLoop = (typeof child.drawn !== 'undefined');


                        nextX = startX + i * COLUMN_SPACING;

                        if(isLoop) {
                            lineMat = new THREE.LineBasicMaterial({color : 0x888888});
                            nextY = child.drawn.y;

                            if(nextX !== rootPoint.x && colides(nextX, root)) {
                                nextX += (childCount + 1) * COLUMN_SPACING;
                            }
                        }
                        else {
                            lineMat = new THREE.LineBasicMaterial({color : 0x000000});
                            nextY = y - ROW_SPACING;
                        }

                        lineGeo = new THREE.Geometry();
                        lineGeo.vertices.push(
                                rootPoint,
                                new THREE.Vector3(nextX + X_OFFSET, rootPoint.y, -1),
                                new THREE.Vector3(nextX + X_OFFSET, nextY, -1)
                            );

                        if(isLoop) {
                            
                            lineGeo.vertices[2].setY(nextY + ROW_SPACING * 0.25);

                            lineGeo.vertices.push(
                                new THREE.Vector3(child.drawn.x + X_OFFSET, child.drawn.y + ROW_SPACING * 0.25, -1)
                            );
                        }

                        childLine = new THREE.Line(lineGeo, lineMat);
                        
                        //childLine.position.z = 80000;

                        origin = helper.getOutOfScreenPoint(-1);
                        childLine.position.copy(origin);
                        objectsStep.position.origin.push(origin);
                        objectsStep.position.target.push(new THREE.Vector3(0, 0, 0));
                        
                        objectsStep.mesh.push(childLine);
                        window.scene.add(childLine);

                        self.drawTree(child, nextX, nextY, nextZ);
                    }
                }
            }
        };
        /**
         * @author Emmanuel Colina
         * @lastmodifiedBy Ricardo Delgado
         * Takes away all the tiles except the one with the id
         */
        this.letAloneHeaderFlow = function() {

            animateFlows('steps', 'origin', false);

            animateFlows('flow', 'origin', true);
        };
        
        /**
         * @author Ricardo Delgado
         * Displays all flow in the table.
         */
        this.showAllFlow = function() {
            
            animateFlows('flow', 'target', true, 2500);
        };

        /**
         * @author Ricardo Delgado
         * It shows all the steps of the flow.
         */
        this.showSteps = function() {

            animateFlows('steps', 'target', true, 3000);
        };

        /**
         * @author Ricardo Delgado.
         * Deletes all objects related to the flow.
         */
        this.deleteAll = function() {

            animateFlows('steps', 'origin', false);
            animateFlows('flow', 'origin', false);  
        };

        /**
         * @author Ricardo Delgado.
         * Deletes all step related to the flow.
         */    
        this.deleteStep = function() {

            window.tileManager.letAlone();
            animateFlows('steps', 'origin', false, 3000);
        };

        //Private methods

        /**
         * @lastmodifiedBy Ricardo Delgado
         * Draws a single step
         * @param {Object} node The information of the step
         * @param {Number} x    X position
         * @param {Number} y    Y position
         */
        function drawStep(node, x, y, _z) {

            var z = _z || 0,
                tile,
                stepBox,
                origin,
                target,
                tilePosition = new THREE.Vector3(x - 108, y - 2, z + 1);

            if(node.element !== -1) {

                if(typeof used[node.element] !== 'undefined') {
                    
                    tile = window.objects[node.element].clone();
                    tile.isClone = true;
                    
                    objectsStep.position.origin.push(window.helper.getOutOfScreenPoint(1));
                    objectsStep.position.target.push(tilePosition);
                    
                    objectsStep.mesh.push(tile);
                    window.scene.add(tile);
                }
                else {
                    
                    tile = window.objects[node.element];
                    used[node.element] = true;

                    new TWEEN.Tween(tile.position)
                    .to({x : tilePosition.x, y : tilePosition.y, z : tilePosition.z}, 7000)
                    .easing(TWEEN.Easing.Cubic.InOut)
                    .start();
                }


            }

            stepBox = createStepBox(node);
            
            origin = window.helper.getOutOfScreenPoint(0);
            
            target = new THREE.Vector3(x, y, z);
            
            objectsStep.position.origin.push(origin);
            objectsStep.position.target.push(target);
            
            stepBox.position.copy(origin);
            
            objectsStep.mesh.push(stepBox);
            scene.add(stepBox);

            node.drawn = {
                x : x,
                y : y
            };
        }

        /**
         * Check if the line collides a block
         * @param   {Number}  x    Position to check
         * @param   {Object}  from Object where the line starts
         * @returns {Boolean} true if collision is detected
         */

        function colides(x, from) {
                
            var actual;

            for(var i = 0; i < self.flow.steps.length; i++) {
                actual = self.flow.steps[i];

                if(actual.drawn && actual.drawn.x === x && actual !== from) return true;
            }

            return false;
        }
        
        
        /**
         * @author Miguel Celedon
         * Creates a flow box and when texture is loaded, calls fillBox
         * @param   {String}     src     The texture to load
         * @param   {Function}   fillBox Function to call after load, receives context and image
         * @returns {THREE.Mesh} The created plane with the drawed texture
         */
        function createFlowBox(src, fillBox, width, height) {
            
            var canvas = document.createElement('canvas');
            canvas.height = height;
            canvas.width = width;
            var ctx = canvas.getContext('2d');
            var size = 12;
            ctx.fillStyle = '#FFFFFF';
            
            var image = document.createElement('img');
            var texture = new THREE.Texture(canvas);
            texture.minFilter = THREE.LinearFilter;
            
            ctx.font = size + 'px Arial';
            
            image.onload = function() {
                fillBox(ctx, image);
                texture.needsUpdate = true;
            };
            
            image.src = src;
            
            var mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(width, height),
                new THREE.MeshBasicMaterial({color : 0xFFFFFF, map : texture, transparent : true})
            );
            
            return mesh;
        }
        
        /**
         * Creates a single step box
         * @param {Object} node The node to draw
         * @author Miguel Celedon
         */
        function createStepBox(node) {
            
            var fillBox = function(ctx, image) {
                
                ctx.drawImage(image, 0, 0);
                
                //ID
                var Nodeid = parseInt(node.id) + 1;
                Nodeid = (Nodeid < 10) ? '0' + Nodeid.toString() : Nodeid.toString();
                
                var size = 83;
                ctx.font = size + 'px Arial';
                ctx.fillStyle = '#000000';
                window.helper.drawText(Nodeid, 57, 130, ctx, 76, size);
                ctx.fillStyle = '#FFFFFF';
                
                //Title
                size = 18;
                ctx.font = 'bold ' + size + 'px Arial';
                window.helper.drawText(node.title, 421, 59, ctx, 250, size);
                
                //Description
                size = 12;
                ctx.font = size + 'px Arial';
                window.helper.drawText(node.desc, 421, 114, ctx, 250, size);
            };
            
            return createFlowBox('images/workflow/stepBox.png', fillBox, BOX_WIDTH, BOX_HEIGHT);
        }

        /**
         * Creates the title box
         * @param {String} title The title of the box
         * @param {String} desc  The description of the whole process
         * @author Miguel Celedon
         */
        function createTitleBox(title, desc) {
            
            var fillBox = function(ctx, image) {
                
                ctx.drawImage(image, 0, 0);
                
                //Title
                var size = 24;
                ctx.font = 'bold ' + size + 'px Arial';
                window.helper.drawText(title, 190, 61, ctx, 400, size);
                
                //Description
                size = 17;
                ctx.font = size + 'px Arial';
                window.helper.drawText(desc, 190, 126, ctx, 550, size);
            };
            
            return createFlowBox('images/workflow/titleBox.png', fillBox, HEADER_WIDTH, HEADER_HEIGHT);
        }

        /**
         * @author Ricardo Delgado.
         * Creates the animation for all flow there.
         * @param   {Object}    objects     .     
         * @param   {String}     target     He says the goal should take the flow.
         * @param   {Boolean}    visible    visible of the object.
         * @param   {Number}    duration    Animation length.
         */
        function animateFlows(objects, target, visible, duration){

            var _duration = duration || 2000,
                _target,
                _objects,
                object;

            if(objects === 'steps'){

                _objects = objectsStep;

                if(!visible){

                    used = [];

                    objectsStep = { mesh : [], position :{ target : [], origin : [] } };
            
                    for(var _i = 0, _l = self.flow.steps.length; _i < _l; _i++)

                        delete self.flow.steps[_i].drawn;
                }
            }
            else{

                _objects = objectsFlow;

                if(!visible){

                    used = [];

                    objectsFlow = { mesh : [], position :{ target : [], origin : [] } };
            
                }
            }

            for(var i = 0, l = _objects.mesh.length; i < l; i++){

                _target = _objects.position[target][i];
                object = _objects.mesh[i];
                moveObject(object, _target, _duration, visible);
            }

            function moveObject(object, target, duration, visible) {

                new TWEEN.Tween(object.position)
                    .to({
                        x: target.x,
                        y: target.y,
                        z: target.z
                    }, duration)
                    .easing(TWEEN.Easing.Cubic.InOut)
                    .onComplete(function () {
                        if(!visible)
                            window.scene.remove(object);    
                    })
                    .start();
            }


        }
        
        /**
         * Looks for the node related to that step
         * @param   {Number} id The id of the step
         * @returns {Object} The node found or null otherwise
         * @author Miguel Celedon
         */
        function getStep(id) {
            
            var i, l, actual;
            
            for(i = 0, l = self.flow.steps.length; i < l; i++) {
                
                actual = self.flow.steps[i];
                
                //Should not be done, the id in 'next' and in each step should be the same type (strings)
                if(actual.id == id) return actual;
            }
            
            return null;
        }
        
        //-----------------------------------------------------------------------------

        function initFlow(){ 

            var i, l;
        
            for(i = 0, l = self.flow.steps.length; i < l; i++) {
                
                var element = self.flow.steps[i];
                
                self.flow.steps[i].element = helper.searchElement(
                    (element.platfrm || element.suprlay) + '/' + element.layer + '/' + element.name
                );
            }
        }
    }

}