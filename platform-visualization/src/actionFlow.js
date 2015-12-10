/**
 * Represents a flow of actions related to some tiles
 * @param   {Object}  flow The objects that describes the flow including a set of steps
 */
function ActionFlow(flow) {
    
    var BOX_WIDTH = 790;
    var BOX_HEIGHT = 172;
    var X_OFFSET = -312; //Because lines don't come from the center
    var ROW_SPACING = 350;
    var COLUMN_SPACING = 900;
    var HEADER_WIDTH = 804;
    var HEADER_HEIGHT = 232;
    
    this.flow = flow || [];
    
    
    var self = this;

    var objects = [];
    var positions = {
        target : [],
        origin : []
    };
    
    var onClick = function(target) {
        if(window.actualView === 'workflows')
            window.onElementClickHeaderFlow(target.userData.id);
    };

    this.objects = objects;
    this.positions = positions;

    /**
     * Draws the flow
     * @lastmodifiedBy Emmanuel Colina
     * @param   {Number}  initialX Position where to start
     * @param   {Number}  initialY Position where to start
     */
    this.draw = function(initialX, initialY, initialZ, indice, id) {

        var title = createTitleBox(self.flow.name, self.flow.desc);
        
        var origin = window.helper.getOutOfScreenPoint(0);
        var target = new THREE.Vector3(initialX, initialY + window.TILE_DIMENSION.height * 2, initialZ);

        title.userData = {
                id: id,
                onClick : onClick
        };
        positions.origin.push(origin);
        positions.target.push(target);
        
        title.position.copy(origin);
        
        objects.push(title);
        scene.add(title);

        if (indice === 0){
            for(i = 0, l = self.flow.steps.length; i < l; i++){
                self.drawTree(self.flow.steps[i], initialX + COLUMN_SPACING * i, initialY, 0);
            }
            new TWEEN.Tween(this)
                .to({}, 8000)
                .onUpdate(window.render)
                .start();
            self.showSteps();
        }

        if (indice === 1){
            self.showStepsFlow();
        }
    };

    /**
     * Takes away all the tiles except the one with the id
     * @author Emmanuel Colina
     */

    this.letAloneHeaderFlow = function() {
        
        var i, _duration = 2000,
            distance = camera.getMaxDistance() * 2,
            out = window.viewManager.translateToSection('workflows', new THREE.Vector3(0, 0, distance));

        var target;

        var animate = function (object, target, dur) {

            new TWEEN.Tween(object.position)
                .to({
                    x: target.x,
                    y: target.y,
                    z: target.z
                }, dur)
                .easing(TWEEN.Easing.Exponential.InOut)
                .onComplete(function () {
                    object.userData.flying = false;
                })
                .start();

        };

        for (i = 0; i < objects.length; i++) {

            target = out;
            objects[i].userData.flying = true;
            animate(objects[i], target, Math.random() * _duration + _duration);
        }
    };

     /**
     * Recursively draw the flow tree
     * @param {Object} root The root of the tree
     * @param {Number} x    X position of the root
     * @param {Number} y    Y position of the root
     * @author Miguel Celedon
     */

    this.drawTree = function(root, x, y, z) {
        
        if(typeof root.drawn === 'undefined') {
            drawStep(root, x, y, z);

            var childCount = root.next.length,
                startX = x - 0.5 * (childCount - 1) * COLUMN_SPACING;

            if(childCount !== 0) {

                var lineGeo = new THREE.Geometry();
                var lineMat = new THREE.LineBasicMaterial({color : 0x000000});

                var rootPoint = new THREE.Vector3(x + X_OFFSET, y - ROW_SPACING / 2, -1);

                lineGeo.vertices.push(
                    new THREE.Vector3(x + X_OFFSET, y, -1),
                    rootPoint);

                var rootLine = new THREE.Line(lineGeo, lineMat);
                var origin = helper.getOutOfScreenPoint(-1);
                rootLine.position.copy(origin);
                positions.origin.push(origin);
                positions.target.push(new THREE.Vector3(0, 0, 0));
                
                objects.push(rootLine);
                window.scene.add(rootLine);

                var nextX, nextY, childLine, child, i, isLoop, nextZ = z;

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
                    positions.origin.push(origin);
                    positions.target.push(new THREE.Vector3(0, 0, 0));
                    
                    objects.push(childLine);
                    window.scene.add(childLine);

                    self.drawTree(child, nextX, nextY, nextZ);
                }
            }
        }
    };

    //Private methods

    /**
     * Draws a single step
     * @param {Object} node The information of the step
     * @param {Number} x    X position
     * @param {Number} y    Y position
     */
    function drawStep(node, x, y, _z) {

        var z = _z || 0;
        var tile,
            tilePosition = new THREE.Vector3(x - 108, y - 2, z + 1);

        if(node.element !== -1) {

            if(typeof used[node.element] !== 'undefined') {
                tile = window.objects[node.element].clone();
                tile.isClone = true;
                
                positions.origin.push(window.helper.getOutOfScreenPoint(1));
                positions.target.push(tilePosition);
                
                objects.push(tile);
                window.scene.add(tile);
            }
            else {
                tile = window.objects[node.element];
                used[node.element] = true;
            }

            new TWEEN.Tween(tile.position)
                .to({x : tilePosition.x, y : tilePosition.y, z : tilePosition.z}, 2000)
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();
        }

        var stepBox = createStepBox(node);
        
        var origin = window.helper.getOutOfScreenPoint(0);
        var target = new THREE.Vector3(x, y, z);
        positions.origin.push(origin);
        positions.target.push(target);
        
        stepBox.position.copy(origin);
        
        objects.push(stepBox);
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
     * Deletes all objects related to the flow
     */
     
    this.delete = function() {
        
        var moveAndDelete = function(id) {
            
            var target = positions.origin[id];
            var object = objects[id];
            
            new TWEEN.Tween(object.position)
                .to({x : target.x, y : target.y, z : target.z}, 6000)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onComplete(function() { window.scene.remove(object); })
                .start();
        };
        
        for(var i = 0, l = objects.length; i < l; i++) {
            moveAndDelete(i);
        }
        
        objects = [];
    };

    this.showSteps = function() {
        
        var move = function(id) {
            
            var target = positions.target[id];
            
            new TWEEN.Tween(objects[id].position)
                .to({x : target.x, y : target.y, z : target.z}, 4000)
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();
        };
        
        for(var i = 0, l = objects.length; i < l; i++) {
            move(i);
        }
    };

    this.showStepsFlow = function() {
        
        var move = function(id) {
            
            var target = positions.target[id];
            
            new TWEEN.Tween(objects[id].position)
                .to({x : target.x, y : target.y, z : target.z}, 4000)
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();
        };
        
        for(var i = 0, l = objects.length; i < l; i++) {
            move(i);
        }
    };
    
    /**
     * Creates a flow box and when texture is loaded, calls fillBox
     * @param   {String}     src     The texture to load
     * @param   {Function}   fillBox Function to call after load, receives context and image
     * @returns {THREE.Mesh} The created plane with the drawed texture
     * @author Miguel Celedon
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
            window.helper.drawText(Nodeid, 40, 122, ctx, 76, size);
            ctx.fillStyle = '#FFFFFF';
            
            //Title
            size = 20;
            ctx.font = 'bold ' + size + 'px Arial';
            window.helper.drawText(node.title, 404, 51, ctx, 250, size);
            
            //Description
            size = 12;
            ctx.font = size + 'px Arial';
            window.helper.drawText(node.desc, 404, 96, ctx, 250, size);
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
            var size = 20;
            ctx.font = 'bold ' + size + 'px Arial';
            window.helper.drawText(title, 190, 61, ctx, 274, size * 1.5);
            
            //Description
            size = 15;
            ctx.font = size + 'px Arial';
            window.helper.drawText(desc, 190, 126, ctx, 550, size);
        };
        
        return createFlowBox('images/workflow/titleBox.png', fillBox, HEADER_WIDTH, HEADER_HEIGHT);
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
    var used = [];
    
    var i, l;
    
    for(i = 0, l = self.flow.steps.length; i < l; i++) {
        
        var element = self.flow.steps[i];
        
        self.flow.steps[i].element = helper.searchElement(
            (element.platfrm || element.suprlay) + '/' + element.layer + '/' + element.name
        );
    }
}