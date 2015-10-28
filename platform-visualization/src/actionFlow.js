/**
 * Represents a flow of actions related to some tiles
 * @param   {Object}  flow The objects that describes the flow including a set of steps
 */
function ActionFlow(flow) {
    
    var BOX_WIDTH = 790;
    var BOX_HEIGHT = 172;
    var X_OFFSET = -312; //Because lines doesn't come from the center
    
    this.flow = flow || [];
    
    
    var self = this;
    var objects = [];
    
    /**
     * Draws the flow
     * @param   {Number}  initialX Position where to start
     * @param   {Number}  initialY Position where to start
     */
    this.draw = function(initialX, initialY) {
        
        var title = createTitleBox(self.flow.name, self.flow.desc);
        
        title.position.set(initialX, initialY + window.TILE_DIMENSION.height * 2, 0);
        objects.push(title);
        scene.add(title);
        
        var columnWidth = window.TILE_DIMENSION.width * 3,
            rowHeight = window.TILE_DIMENSION.width * 3;
        
        new TWEEN.Tween(this)
            .to({}, 4000)
            .onUpdate(window.render)
            .start();
        
        for(i = 0, l = self.flow.steps.length; i < l; i++)
            drawTree(self.flow.steps[i], initialX + columnWidth * i, initialY);
        
        for(i = 0, l = objects.length; i < l; i++) {
            helper.showMaterial(objects[i].material);
        }
        
        
        function drawTree(root, x, y) {
            
            if(typeof root.drawn === 'undefined') {
                drawStep(root, x, y);
            
                var childCount = root.next.length,
                    startX = x - 0.5 * (childCount - 1) * columnWidth;

                if(childCount !== 0) {

                    var lineGeo = new THREE.Geometry();
                    var lineMat = new THREE.LineBasicMaterial({color : 0x000000, transparent : true, opacity : 0});

                    var rootPoint = new THREE.Vector3(x + X_OFFSET, y - rowHeight / 2);

                    lineGeo.vertices.push(
                        new THREE.Vector3(x + X_OFFSET, y, -1),
                        rootPoint);

                    var rootLine = new THREE.Line(lineGeo, lineMat);
                    objects.push(rootLine);
                    window.scene.add(rootLine);

                    var nextX, nextY, childLine, child, i, isLoop;

                    for(i = 0; i < childCount; i++) {

                        child = getStep(root.next[i].id);
                        isLoop = (typeof child.drawn !== 'undefined');
                        
                        
                        nextX = startX + i * columnWidth;
                        
                        if(isLoop) {
                            console.log(Math.abs(nextX));
                            lineMat = new THREE.LineBasicMaterial({color : 0x888888, transparent : true, opacity : 0});
                            nextY = child.drawn.y;
                            
                            if(nextX !== rootPoint.x && colides(nextX, root)) {
                                nextX += (childCount + 1) * columnWidth;
                            }
                        }
                        else {
                            lineMat = new THREE.LineBasicMaterial({color : 0x000000, transparent : true, opacity : 0});
                            nextY = y - rowHeight;
                        }

                        lineGeo = new THREE.Geometry();
                        lineGeo.vertices.push(
                            rootPoint,
                            new THREE.Vector3(nextX + X_OFFSET, rootPoint.y, -1),
                            new THREE.Vector3(nextX + X_OFFSET, nextY, -1)
                        );
                        
                        if(isLoop) {
                            lineGeo.vertices[2].setY(nextY + rowHeight * 0.25);
                            
                            lineGeo.vertices.push(
                                new THREE.Vector3(child.drawn.x + X_OFFSET, child.drawn.y + rowHeight * 0.25, -1)
                            );
                        }

                        childLine = new THREE.Line(lineGeo, lineMat);
                        objects.push(childLine);
                        window.scene.add(childLine);

                        drawTree(child, nextX, nextY);
                    }
                }
            }
        }
        
        function drawStep(node, x, y) {
            
            var tile,
                tilePosition = new THREE.Vector3(x - 108, y - 2, 1);
            
            if(node.element !== -1) {
                
                if(typeof used[node.element] !== 'undefined') {
                    tile = window.objects[node.element].clone();
                    tile.isClone = true;
                }
                else {
                    tile = window.objects[node.element];
                    used[node.element] = true;
                }
                
                objects.push(tile);
                window.scene.add(tile);

                new TWEEN.Tween(tile.position)
                    .to({x : tilePosition.x, y : tilePosition.y, z : tilePosition.z}, 2000)
                    .easing(TWEEN.Easing.Exponential.Out)
                    //.onUpdate(render)
                    .start();
            }
            
            var stepBox = createStepBox(node);
            stepBox.position.set(x, y, 0);
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
    };
    
    /**
     * Deletes all objects related to the flow
     */
    this.delete = function() {
        
        var moveAndDelete = function(lod) {
            
            new TWEEN.Tween(lod.position)
                .to({z : camera.getMaxDistance()}, 4000)
                .easing(TWEEN.Easing.Exponential.InOut)
                .onComplete(function() { window.scene.remove(lod); })
                .start();
        };
        
        for(var i = 0, l = objects.length; i < l; i++) {
            
            if(objects[i] instanceof THREE.LOD) {
                    if(typeof objects[i].isClone !== 'undefined') {
                        moveAndDelete(objects[i]);
                }
            }
            else {
                helper.hideObject(objects[i], false);
            }
        }
        
        objects = [];
    };
    
    //Private methods
    
    /**
     * Creates a flow box and when texture is loaded, calls fillBox
     * @param   {String}     src     The texture to load
     * @param   {Function}   fillBox Function to call after load, receives context and image
     * @returns {THREE.Mesh} The created plane with the drawed texture
     * @author Miguel Celedon
     */
    function createFlowBox(src, fillBox) {
        
        var canvas = document.createElement('canvas');
        canvas.height = BOX_HEIGHT;
        canvas.width = BOX_WIDTH;
        var ctx = canvas.getContext('2d');
        var size = 12;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
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
            new THREE.PlaneGeometry(BOX_WIDTH, BOX_HEIGHT),
            new THREE.MeshBasicMaterial({color : 0xFFFFFF, map : texture, opacity : 0, transparent : true})
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
            var Nodeid = (parseInt(node.id) < 10) ? '0' + node.id.toString() : node.id.toString();
            var size = 83;
            ctx.font = size + 'px Arial';
            ctx.fillStyle = '#000000';
            window.helper.drawText(Nodeid, 40, 122, ctx, 76, size);
            ctx.fillStyle = '#FFFFFF';
            
            //Title
            size = 20;
            ctx.font = 'bold ' + size + 'px Arial';
            window.helper.drawText(node.title, 404, 51, ctx, 274, size);
            
            //Description
            size = 12;
            ctx.font = size + 'px Arial';
            window.helper.drawText(node.desc, 404, 96, ctx, 274, size);
        };
        
        return createFlowBox('images/workflow/stepBox.png', fillBox);
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
        
        return createFlowBox('images/workflow/titleBox.png', fillBox);
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