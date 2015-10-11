/**
 * Represents a flow of actions related to some tiles
 * @param   {Object}  flow The objects that describes the flow including a set of steps
 */
function ActionFlow(flow) {
    
    this.flow = flow || [];
    var self = this;
    var objects = [];
    
    var used = [];
    
    var i, l;
    
    for(i = 0, l = self.flow.steps.length; i < l; i++) {
        
        var element = self.flow.steps[i];
        
        self.flow.steps[i].element = helper.searchElement(
            (element.platfrm || element.suprlay) + '/' + element.layer + '/' + element.name
        );
    }
    
    /**
     * Draws the flow
     * @param   {Number}  initialX Position where to start
     * @param   {Number}  initialY Position where to start
     */
    this.draw = function(initialX, initialY) {
        
        var title = createTextBox(self.flow.name, {
            height : window.TILE_DIMENSION.height, size : 36, textAlign : 'center', fontWeight : 'bold'
        });
        
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

                    var rootPoint = new THREE.Vector3(x, y - rowHeight / 2);

                    lineGeo.vertices.push(
                        new THREE.Vector3(x, y - rowHeight * 0.25, 0),
                        rootPoint);

                    var rootLine = new THREE.Line(lineGeo, lineMat);
                    objects.push(rootLine);
                    window.scene.add(rootLine);

                    var nextX, nextY, childLine, child, i, isLoop;

                    for(i = 0; i < childCount; i++) {

                        child = getStep(root.next[i].id);
                        isLoop = (typeof child.drawn !== 'undefined');
                        
                        
                        nextX = startX + i * columnWidth;
                        
                        if(nextX !== rootPoint.x && colides(nextX, root)) {
                            nextX += childCount * columnWidth;
                        }
                        
                        if(isLoop) {
                            console.log(Math.abs(nextX));
                            lineMat = new THREE.LineBasicMaterial({color : 0x888888, transparent : true, opacity : 0});
                            nextY = child.drawn.y;
                        }
                        else {
                            lineMat = new THREE.LineBasicMaterial({color : 0x000000, transparent : true, opacity : 0});
                            nextY = y - rowHeight;
                        }

                        lineGeo = new THREE.Geometry();
                        lineGeo.vertices.push(
                            rootPoint,
                            new THREE.Vector3(nextX, rootPoint.y, 0),
                            new THREE.Vector3(nextX, nextY + rowHeight * 0.05, 0)
                        );
                        
                        if(isLoop) {
                            lineGeo.vertices[2].setY(nextY + rowHeight * 0.1);
                            
                            lineGeo.vertices.push(
                                new THREE.Vector3(child.drawn.x, child.drawn.y + rowHeight * 0.1, 0)
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
            
            var tile;

            var titleHeight = window.TILE_DIMENSION.height / 2,
                descWidth = window.TILE_DIMENSION.width * 2,
                descX = 0;
            
            if(node.element !== -1) {
                
                descWidth = window.TILE_DIMENSION.width;
                descX = window.TILE_DIMENSION.width / 2;
                
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
                    .to({x : x - window.TILE_DIMENSION.width / 2, y : y - titleHeight * 3 / 2, z : 0}, 2000)
                    .easing(TWEEN.Easing.Exponential.Out)
                    //.onUpdate(render)
                    .start();
            }

            var title = createTextBox(node.title, {size : 24, fontWeight : 'bold', height : titleHeight, textAlign : 'center'});
            title.position.set(x, y, 0);

            var description = createTextBox(node.desc, {width : descWidth});
            description.position.set(x + descX, y - titleHeight * 3 / 2, 0);

            node.drawn = {
                x : x,
                y : y
            };

            objects.push(title);
            objects.push(description);
            window.scene.add(title);
            window.scene.add(description);
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
    
    function getStep(id) {
        
        var i, l, actual;
        
        for(i = 0, l = self.flow.steps.length; i < l; i++) {
            
            actual = self.flow.steps[i];
            
            //Should not be done, the id in 'next' and in each step should be the same type (strings)
            if(actual.id == id) return actual;
        }
        
        return null;
    }
    
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
     * Creates a single text box
     * @param   {String} text        The text to draw
     * @param   {Object} [params={}] Object with the parameters of the draw
     * @returns {Object} The mesh of the textbox
     */
    function createTextBox(text, params) {
        
        if(typeof params === 'undefined') params = {};
        
        params = $.extend({
            fontWeight : 'normal',
            size : 12,
            fontFamily : 'Arial',
            width : window.TILE_DIMENSION.width * 2,
            height : window.TILE_DIMENSION.height,
            background : '#F26662',
            textColor : '#FFFFFF',
            textAlign : 'left'
        }, params);
        
        
        
        var width = params.width;
        var height = params.height;
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        var texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.NearestFilter;
        
        var ctx = canvas.getContext('2d');
        ctx.font = params.fontWeight + ' ' + params.size + 'px ' + params.fontFamily;
        ctx.textAlign = params.textAlign;
        
        
        ctx.fillStyle = params.background;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = params.textColor;
        
        var start = (params.textAlign !== 'center') ? 10 : width / 2;
        
        //var height = Math.abs(helper.drawText(text, 0, font, ctx, width, font)) * 2;
        var paragraphs = text.split('\n');
        var i, l, tempY = params.size;
        
        for(i = 0, l = paragraphs.length; i < l; i++) {
            tempY = helper.drawText(paragraphs[i], start, tempY, ctx, width - 10, params.size);
        }
        
        var mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            new THREE.MeshBasicMaterial({map : texture, vertexColors : THREE.FaceColors, side : THREE.FrontSide, color : 0xffffff, transparent : true, opacity : 0}));
        
        mesh.material.needsUpdate = true;
        texture.needsUpdate = true;
        
        return mesh;
    }
}