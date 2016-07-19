function Workflow(flow) {

    var BOX_WIDTH = 825,
        BOX_HEIGHT = 188,
        X_OFFSET = -312, //Because lines don't come from the center
        ROW_SPACING = 350,
        COLUMN_SPACING = 900,
        HEADER_WIDTH = 825,
        HEADER_HEIGHT = 238;

    this.TYPECALL = [//Colors for different call types
        {
            title : 'Direct Call',
            color : 0x0000FF
        },
        {
            title : 'Event',
            color : 0xFF0000
        },
        {
            title : 'Fermat Message',
            color : 0xF8E645
        },
        {
            title : 'defaults',
            color : 0x0000FF
        }
    ];

    var account = 0,
    self = this,
    used = [],
    objectsFlow = {
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

    this.stepsTest = objectsStep;
    this.flow = flow || [];
    this.action = false;
    this.objects = objectsFlow.mesh;
    this.positions = objectsFlow.position;

    this.countFlowElement = function(){

        var i, l;

        for(i = 0, l = self.flow.steps.length; i < l; i++) {

            var element = self.flow.steps[i];

            self.flow.steps[i].element = helper.searchElement(
                (element.platfrm || element.suprlay) + '/' + element.layer + '/' + element.name
            );
        }
    
    };

    self.countFlowElement();

    var onClick = function(target) {

        if(window.actualView === 'workflows'){
            window.workFlowManager.onElementClickHeaderFlow(target.userData.id);
            self.action = true;
        }
    };

    // Public methods

    /**
     * Draws the flow
     * @lastmodifiedBy Emmanuel Colina
     * @lastmodifiedBy Ricardo Delgado
     * @param   {Number}  initialX Position where to start
     * @param   {Number}  initialY Position where to start
     */
    this.draw = function(initialX, initialY, initialZ, indice, id) {

        var title = self.createTitleBox(self.flow.name, self.flow.desc),
            origin = window.helper.getOutOfScreenPoint(0),
            target = new THREE.Vector3(initialX, initialY + window.TILE_DIMENSION.height * 2, initialZ);

        if(indice === 1)
            target = new THREE.Vector3(initialX, initialY, initialZ);

        title.userData = {
                id: id,
                onClick : onClick
        };

        objectsFlow.position.origin.push(origin);
        objectsFlow.position.target.push(target);

        title.position.copy(origin);

        objectsFlow.mesh.push(title);

        window.scene.add(title);

        if(indice === 0){

            for(var i = 0, l = self.flow.steps.length; i < l; i++){
                self.drawTree(self.flow.steps[i], initialX + COLUMN_SPACING * i, initialY, 0);
            }

            window.helper.forceTweenRender(5000);

            self.showAllFlow();
            self.showSteps();
        }
        else if(indice === 1)
            self.showAllFlow();
    };

    /**
     * @author Miguel Celedon
     * @lastmodifiedBy Ricardo Delgado
     * @lastmodifiedBy Emmanuel Colina
     * Recursively draw the flow tree
     * @param {Object} root The root of the tree
     * @param {Number} x    X position of the root
     * @param {Number} y    Y position of the root
     */
    this.drawTree = function(root, x, y, z) {
        
        
        if(typeof root.drawn === 'undefined'){

            drawStep(root, x, y, z);

            var childCount = root.next.length,
                startX = x - 0.5 * (childCount - 1) * COLUMN_SPACING;

            if(childCount !== 0){

                var color = self.getColor(root.next[0].type);

                var lineGeo,
                    lineMat, 
                    rootPoint,
                    rootLine,
                    origin;           

                lineGeo = new THREE.BufferGeometry();
                lineMat = new THREE.LineBasicMaterial({color : color}); 
                rootPoint = new THREE.Vector3(x + X_OFFSET, y - ROW_SPACING / 2, -1);

                var vertexPositions = [
                    [x + X_OFFSET, y, -1],
                    [rootPoint.x, rootPoint.y, rootPoint.z]
                ];
                
                var vertices = new Float32Array(vertexPositions.length * 3);

                for(var j = 0; j < vertexPositions.length; j++) {
                    vertices[j*3 + 0] = vertexPositions[j][0];
                    vertices[j*3 + 1] = vertexPositions[j][1];
                    vertices[j*3 + 2] = vertexPositions[j][2];
                }

                lineGeo.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

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
                    if(collides(nextX, root, false, y)) nextX += COLUMN_SPACING;

                    color = self.getColor(root.next[i].type);

                    if(isLoop) {

                        var gradient = new THREE.Color(color);

                        gradient.r = Math.max(gradient.r, 0.5);
                        gradient.g = Math.max(gradient.g, 0.5);
                        gradient.b = Math.max(gradient.b, 0.5); 

                        lineMat = new THREE.LineBasicMaterial({color : gradient.getHex()}); //gradient
                        nextY = child.drawn.y;

                        if(nextX !== rootPoint.x && collides(nextX, root, true))
                            nextX += COLUMN_SPACING;
                    }
                    else {
                        lineMat = new THREE.LineBasicMaterial({color : color});
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
        account = 0;
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

        animateFlows('flow', 'target', true, 3000);
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
     * @lastmodifiedBy Emmanuel Colina
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

                var data = window.helper.clone(window.helper.getSpecificTile(node.element).data);

                tile = window.tileManager.createElement(node.element + "_clone_" + account, data);
                tile.isClone = true;

                objectsStep.position.origin.push(window.helper.getOutOfScreenPoint(1));
                objectsStep.position.target.push(tilePosition);

                objectsStep.mesh.push(tile);
                window.scene.add(tile);

                account = account + 1;
            }
            else {

                tile = window.helper.getSpecificTile(node.element).mesh;
                used[node.element] = true;

                new TWEEN.Tween(tile.position)
                .to({x : tilePosition.x, y : tilePosition.y, z : tilePosition.z}, 4000)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();

                new TWEEN.Tween(tile.rotation)
                .to({x: 0, y: 0, z: 0}, 4000)
                .easing(TWEEN.Easing.Exponential.InOut)
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
     * @author Miguelcldn
     * @param   {number}  x            The x coordinate of the child
     * @param   {object}  from         The parent object to ignore
     * @param   {boolean} [loop=false] If true, it will consider the box width
     * @param   {number}  [y]          The y coordinate of the child, it loop=false then this will ignore all ancestors
     * @returns {boolean} Whether it collides or no
     */
    function collides(x, from, loop, y) {

        var actual,
            left,
            right;
        
        loop = loop || false;

        for(var i = 0; i < self.flow.steps.length; i++) {
            actual = self.flow.steps[i];
            
            if(loop) {
                if(actual.drawn && actual !== from) {
                    left = Math.min(actual.drawn.x, x);
                    right = Math.max(actual.drawn.x, x);

                    if(right - left - BOX_WIDTH <= 0)
                        return true;
                }
            }
            else {
                if(actual.drawn && actual.drawn.x === x && actual !== from && actual.drawn.y <= y)
                    return true;
            }
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
    function createFlowBox(src, fillBox, width, height, _switch) {

        var canvas = document.createElement('canvas');
        canvas.height = height;
        canvas.width = width;
        var ctx = canvas.getContext('2d');
        var size = 12;
        ctx.fillStyle = '#FFFFFF';

        var image = document.createElement('img');
        var texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.NearestFilter;

        ctx.font = size + 'px Arial';

        image.onload = function() {
            fillBox(ctx, image);
            texture.needsUpdate = true;
        };

        image.src = src;

        if(_switch)
            return texture;
        else{
            var mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(width, height),
            new THREE.MeshBasicMaterial({color : 0xFFFFFF, map : texture, transparent : true})
            );
            return mesh;
        }
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
    this.createTitleBox = function(title, desc, _switch) {

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

        return createFlowBox('images/workflow/titleBox.png', fillBox, HEADER_WIDTH, HEADER_HEIGHT, _switch);
    };

    /**
     * @author Ricardo Delgado.
     * Creates the animation for all flow there.
     * @param   {Object}    objects     .     
     * @param   {String}     target     He says the goal should take the flow.
     * @param   {Boolean}    visible    visible of the object.
     * @param   {Number}    duration    Animation length.
     */
    function animateFlows(objects, target, visible, duration, callback){

        var _duration = duration || 2000,
            _target,
            _objects,
            object;

        if(objects === 'steps'){

            _objects = objectsStep;

            if(!visible){

                used = [];

                objectsStep = { mesh : [], position :{ target : [], origin : [] } };

                for(var _i = 0, _l = self.flow.steps.length; _i < _l; _i++){
                    delete self.flow.steps[_i].drawn;
                }
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
                .easing(TWEEN.Easing.Cubic.Out)
                .onComplete(function() {
                    if(!visible)
                        window.scene.remove(object);    
                })
                .start();
        }
        
        if(objects === 'steps')
            window.helper.forceTweenRender(_duration * 1.3);


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
            if(actual.id == id)
                return actual;
        }

        return null;
    }

    this.getColor = function(call){

        var color = self.TYPECALL.find(function(x){
            if(x.title.toLowerCase() === call.toLowerCase())
                return x;
            else if(x.title === 'defaults')
                return x;
        }).color;

        return color;
    }
}