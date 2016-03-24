/**
 * @class Represents the group of all header icons
 * @param {Number} columnWidth         The number of elements that contains a column
 * @param {Number} superLayerMaxHeight Max rows a superLayer can hold
 * @param {Number} groupsQtty          Number of groups (column headers)
 * @param {Number} layersQtty          Number of layers (rows)
 * @param {Array}  superLayerPosition  Array of the position of every superlayer
 */
function Headers(columnWidth, superLayerMaxHeight, groupsQtty, layersQtty, superLayerPosition) {

    // Private members
    var objects = [],
        dependencies = {
            root : []
        },
        positions = {
            table : [],
            stack : [],
            workFlow: []
        },
        arrowsPositions = {
            origin: [],
            stack: []
        },
        self = this,
        graph = {},
        arrows = [];

    var width = columnWidth * window.TILE_DIMENSION.width;
    var height = width * 443 / 1379;

    this.dep = dependencies;
    this.arrows = arrows;
    this.arrowPositions = arrowsPositions;

    var onClick = function(target) {
        if(window.actualView === 'workflows')
            onElementClickHeader(target.userData.id, objects);
    };

    function onElementClickHeader(id, objects)
    {
        var duration = 1000;

        if(camera.getFocus() == null){
            var camTarget = objects[id].clone();
            camTarget.position.y -= 2500;

            window.camera.setFocus(camTarget, new THREE.Vector4(0, -2500, 9000, 1), duration);

        for(var i = 0; i < objects.length ; i++) {
                if(id !== i)
                    letAloneHeader(objects[i]);
            }

            helper.showBackButton();
        }

        window.flowManager.createColumHeaderFlow(objects[id]);
    }

    /**
     * @author Emmanuel Colina
     * let alone the header
     * @param {Object} objHeader Header target
     */

    function letAloneHeader(objHeader){
        var i, _duration = 2000,
            distance = camera.getMaxDistance() * 2,
            out = window.viewManager.translateToSection('workflows', new THREE.Vector3(0, 0, distance));

        var target;

        var animate = function(object, target, dur) {

            new TWEEN.Tween(object.position)
                .to({
                    x: target.x,
                    y: target.y,
                    z: target.z
                }, dur)
                .easing(TWEEN.Easing.Exponential.InOut)
                .onComplete(function() {
                    object.userData.flying = false;
                })
                .start();
        };

        target = out;
        objHeader.userData.flying = true;
        animate(objHeader, target, Math.random() * _duration + _duration);
    }

    // Public method

    this.getPositionHeaderViewInFlow = function(){
        return positions.workFlow;
    };
    /**
     * @author Emmanuel Colina
     * @lastmodifiedBy Miguel Celedon
     * Create the Arrows (dependences)
     */

    this.createArrows = function(startX,startY,endX,endY) {

        var POSITION_X = 1700;
        var POSITION_Y = 200;
        var POSITION_Z = 44700;

        //camera.resetPosition();

        endY = endY - 300;

        var from = new THREE.Vector3(startX, startY, 0);

        var to = new THREE.Vector3(endX, endY, 0);

        var direction = to.clone().sub(from);

        var length = direction.length();

        var arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, 0XF26662, 550, 300);

        var objectStack = new THREE.Object3D();
        var objectOrigin = new THREE.Object3D();

        arrowHelper.position.x = arrowHelper.position.x - POSITION_X;
        arrowHelper.position.y = arrowHelper.position.y - POSITION_Y;
        arrowHelper.position.z = POSITION_Z;

        objectStack.position.copy(arrowHelper.position);
        objectStack.rotation.copy(arrowHelper.rotation);
        arrowsPositions.stack.push(objectStack);

        arrowHelper.line.material.opacity = 0;
        arrowHelper.line.material.transparent = true;

        arrowHelper.cone.material.opacity = 0;
        arrowHelper.cone.material.transparent = true;


        var startingPosition = window.helper.getOutOfScreenPoint(0);
        arrowHelper.position.copy(viewManager.translateToSection('stack', startingPosition));
        arrowHelper.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);

        objectOrigin.position.copy(arrowHelper.position);
        objectOrigin.rotation.copy(arrowHelper.rotation);
        arrowsPositions.origin.push(objectOrigin);

        scene.add(arrowHelper);
        arrows.push(arrowHelper);
    };

    /**
     * @author Isaias Taborda
     * Deletes the arrows in the graph when the user leaves the stack view
     * so they can be drawn from scrath if the user comes back to this view
     * @param {Number} [duration=5000] Duration in milliseconds for the animation
     */
    this.deleteArrows = function(duration) {
        var limit = arrows.length;

        for(var i = 0; i < limit; i++) {

            new TWEEN.Tween(arrows[i].position)
            .to({
                x : arrowsPositions.origin[i].position.x,
                y : arrowsPositions.origin[i].position.y,
                z : arrowsPositions.origin[i].position.z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();

            new TWEEN.Tween(arrows[i].rotation)
            .to({
                x : arrowsPositions.origin[i].rotation.x,
                y : arrowsPositions.origin[i].rotation.y,
                z : arrowsPositions.origin[i].rotation.z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();
        }

        setTimeout(function(){
            arrowsPositions.origin = [];
            arrowsPositions.stack = [];
            for(i = 0; i < limit; i++){
                window.scene.remove(arrows[i]);
            }
            arrows = [];
        }, duration);
    };

    /**
     * @author Miguel Celedon
     * @lastmodifiedBy Miguel Celedon
     * Arranges the headers by dependency
     * @param {Number} [duration=2000] Duration in milliseconds for the animation
     */
    this.transformStack = function(duration) {
        var _duration = duration || 2000;


        createEdges();
        self.moveToPosition(duration, duration / 2);

        var i, l;

        for(i = 0, l = objects.length; i < l; i++) {
            new TWEEN.Tween(objects[i].position)
            .to({
                x : positions.stack[i].position.x,
                y : positions.stack[i].position.y,
                z : positions.stack[i].position.z
            }, _duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }

        new TWEEN.Tween(this)
        .to({}, duration * 3)
        .onUpdate(render)
        .start();
    };

    /**
     * @author Emmanuel Colina
     * Arranges the headers by dependency
     * @param {Number} [duration=2000] Duration in milliseconds for the animation
     */
    this.transformWorkFlow = function(duration) {
        var _duration = duration || 2000;

        var i, l;

        for(i = 0, l = objects.length; i < l; i++) {
            new TWEEN.Tween(objects[i].position)
            .to({
                x : positions.workFlow[i].position.x,
                y : positions.workFlow[i].position.y,
                z : positions.workFlow[i].position.z
            }, _duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }

        new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate(render)
        .start();
    };

    /**
     * @author Emmanuel Colina
     * Hide the headers
     */
    this.hidetransformWorkFlow = function(duration) {
        var i, j,
            position;

        for(i = 0; i < objects.length; i++) {

            position = window.helper.getOutOfScreenPoint(0);

            new TWEEN.Tween(objects[i].position)
            .to({x : position.x, y : position.y, z : position.z}, duration)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();
        }
    };

    /**
     * @author Simón Oroño
     * Retrieves the node associated with an object
     */
    function getObjectNode(id) {
        for (var i = 0; i < graph.nodes.length; i++) {
            if (graph.nodes[i].id === id) {
                return graph.nodes[i];
            }
        }

        return null;
    }

    /**
     * @author Emmanuel Colina
     * @lastmodifiedBy Isaias Taborda
     * @lastmodifiedBy Simón Oroño
     * Calculates the stack target position
     */
    var calculateStackPositions = function() {
        var i, obj, node;
        var nodesInLevel = {};
        var nodesAlreadyProcessedInLevel = {};

        /*objects.sort(function(a, b) {
            return (a === b) ? 0 : ((a > b) ? 1 : -1);
        });*/

        var initialX = -20000;
        var initialY = -15000;
        var separationX = width + 1500;
        var separationY = 6000.0;
        var positionZ = 45000;

        for (i = 0; i < graph.nodes.length; i++) {
            node = graph.nodes[i];

            // We calculate how much nodes there are for each level
            if (!(node.level in nodesInLevel)) {
                nodesInLevel[node.level] = 0;
                nodesAlreadyProcessedInLevel[node.level] = 0;
            } else {
                nodesInLevel[node.level] += 1;
            }
        }

        // Send all objects to the center
        for(i = 0; i < objects.length; i++) {
            obj = new THREE.Object3D();
            obj.name = positions.table[i].name;
            positions.stack.push(obj);
        }

        for (i = 0; i < objects.length; i++) {
            node = getObjectNode(objects[i].name);

            var levelDifference = nodesInLevel[0] - nodesInLevel[node.level];
            var margin = (levelDifference / 2.0) * (separationX);

            positions.stack[i].position.x = initialX + (separationX * nodesAlreadyProcessedInLevel[node.level]) + margin;
            positions.stack[i].position.y = initialY + (separationY * node.level);
            positions.stack[i].position.z = positionZ;

            nodesAlreadyProcessedInLevel[node.level] += 1;
        }

        //Transport all headers to the stack section
        for(i = 0; i < positions.stack.length; i++) {
            positions.stack[i].position.copy(window.viewManager.translateToSection('stack', positions.stack[i].position));
        }
    };

    /**
     * @author Emmanuel Colina
     * @lastmodifiedBy Miguel Celedon
     * Paint the dependences
     */
    var createEdges = function() {
        var startX, startY, endX, endY;
        var i, j;

        for (i = 0; i < graph.edges.length; i++) {
            startX = 0;
            startY = 0;
            endX = 0;
            endY = 0;

            for (j = 0; j < objects.length; j++) {
                if (graph.edges[i].from === objects[j].name) {
                    startX = positions.stack[j].position.x;
                    startY = positions.stack[j].position.y;
                }

                if (graph.edges[i].to === objects[j].name) {
                    endX = positions.stack[j].position.x;
                    endY = positions.stack[j].position.y;
                }
            }

            self.createArrows(startX, startY, endX, endY);
        }
    };

    /**
     * @author Emmanuel Colina
     * @lastmodifiedBy Miguel Celedon
     * Arranges the headers in the table
     * @param {Number} [duration=2000] Duration of the animation
     */
    this.flyOut = function(duration){

        var _duration = duration || 2000, i, l;

        for(i = 0, l = arrows.length; i < l; i++) {

            new TWEEN.Tween(arrows[i].position)
            .to({
                x : arrowsPositions.origin[i].position.x,
                y : arrowsPositions.origin[i].position.y,
                z : arrowsPositions.origin[i].position.z
            }, Math.random() * _duration + _duration)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();

             new TWEEN.Tween(arrows[i].rotation)
            .to({
                x : arrowsPositions.origin[i].rotation.x,
                y : arrowsPositions.origin[i].rotation.y,
                z : arrowsPositions.origin[i].rotation.z
            }, Math.random() * _duration + _duration)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();

            helper.hideObject(arrows[i].line, false, _duration);
            helper.hideObject(arrows[i].cone, false, _duration);
        }

        new TWEEN.Tween(this)
        .to({}, _duration * 2)
        .onUpdate(render)
        .start();

        arrows = [];
    };

    /**
     * @author Emmanuel Colina
     * @lastmodifiedBy Miguel Celedon
     *  Arranges the headers in the table
     * @param {Number} [duration=2000] Duration of the animation
     * @param {Number} [delay=0]       Delay of the animation
     */
    this.moveToPosition = function(duration, delay){

        var _duration = duration || 2000,
            i, l;

        delay = (delay !== undefined) ? delay : 0;

        for(i = 0, l = arrows.length; i < l; i++) {

            helper.showMaterial(arrows[i].line.material, Math.random() * _duration + _duration, TWEEN.Easing.Exponential.InOut, delay);
            helper.showMaterial(arrows[i].cone.material, Math.random() * _duration + _duration, TWEEN.Easing.Exponential.InOut, delay);

            new TWEEN.Tween(arrows[i].position)
            .to({
                x : arrowsPositions.stack[i].position.x,
                y : arrowsPositions.stack[i].position.y,
                z : arrowsPositions.stack[i].position.z
            }, Math.random() * _duration + _duration)
            .easing(TWEEN.Easing.Cubic.InOut)
            .delay(delay)
            .start();

            new TWEEN.Tween(arrows[i].rotation)
            .to({
                x : arrowsPositions.stack[i].rotation.x,
                y : arrowsPositions.stack[i].rotation.y,
                z : arrowsPositions.stack[i].rotation.z
            }, Math.random() * _duration + _duration)
            .easing(TWEEN.Easing.Cubic.InOut)
            .delay(delay)
            .start();
        }
    };

    /**
     * @author Miguel Celedon
     * @lastmodifiedBy Miguel Celedon
     * Arranges the headers in the table
     * @param {Number} [duration=2000] Duration of the animation
     */

    this.transformTable = function(duration) {
        var _duration = duration || 2000,
            i, l;

        self.flyOut();

        self.showHeaders(_duration);

        new TWEEN.Tween(this)
            .to({}, _duration * 2)
            .onUpdate(render)
            .start();
    };

    /**
     * Shows the headers as a fade
     * @param {Number} duration Milliseconds of fading
     */
    this.showHeaders = function(duration) {
        var i, j;

        for(i = 0; i < objects.length; i++) {

            new TWEEN.Tween(objects[i].position)
            .to({
                x : positions.table[i].position.x,
                y : positions.table[i].position.y,
                z : positions.table[i].position.z
            }, duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();


            for(j = 0; j < objects[i].levels.length; j++) {
                new TWEEN.Tween(objects[i].levels[j].object.material)
                .to({opacity : 1, needsUpdate : true}, duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
            }
        }
    };

    /**
     * Hides the headers (but donesn't delete them)
     * @param {Number} duration Milliseconds to fade
     */
    this.hideHeaders = function(duration) {
        var i, j,
            position;

        for(i = 0; i < objects.length; i++) {

            position = window.helper.getOutOfScreenPoint(0);

            new TWEEN.Tween(objects[i].position)
            .to({x : position.x, y : position.y, z : position.z}, duration)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();

            for(j = 0; j < objects[i].levels.length; j++) {

                new TWEEN.Tween(objects[i].levels[j].object.material)
                .to({opacity : 0, needsUpdate : true}, duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
            }
        }
    };

    // Initialization code
    //=========================================================

    /**
     * @author Miguel Celedon
     * @lastmodifiedBy Miguel Celedon
     * Creates the dependency graph
     * @returns {Object} Object containing the data and options
     */
    var buildGraph = function() {

        var data, edges = [], nodes = [], options, level = 0, pending = {};

        var trace = function(root, parent, _level, _nodes, _edges) {

            if(parent)
                pending[parent] = true;

            var i, l, child,
                lookup = function(x) {
                    return x.id == child;
                };

            for(i = 0, l = root.length; i < l; i++) {

                child = root[i];

                if(_level !== 0)
                    _edges.push({from : parent, to : child});

                if($.grep(_nodes, lookup).length === 0)
                {
                    _nodes.push({
                        id : child,
                        image : 'images/headers/svg/' + child + '_logo.svg',
                        level : _level
                    });
                }

                if(pending[child] === undefined)
                    trace(dependencies[child], child, _level + 1, _nodes, _edges);
            }
        };

        trace(dependencies.root, null, level, nodes, edges);

        data = {
            edges : edges,
            nodes : nodes
        };

        graph = data;
    };

    /**
     * @author Emmanuel Colina
     * Calculate the position header
     */

    var headersPositionsViewWorkFlow = function() {

        var group, headerData, objectHeaderInWFlowGroup, slayer, column;

        for(group in window.platforms){
            if(window.platforms.hasOwnProperty(group) && group !== 'size'){
                headerData = window.platforms[group];
                column = headerData.index;


                objectHeaderInWFlowGroup = new THREE.Object3D();

                objectHeaderInWFlowGroup.position.x = (width * (column - (groupsQtty - 1) / 2) + ((column - 1) * window.TILE_DIMENSION.width)) + 10000;
                objectHeaderInWFlowGroup.position.y = ((layersQtty + 10) * window.TILE_DIMENSION.height) / 2;
                objectHeaderInWFlowGroup.name = group;

                objectHeaderInWFlowGroup.position.copy(window.viewManager.translateToSection('workflows', objectHeaderInWFlowGroup.position));
                positions.workFlow.push(objectHeaderInWFlowGroup);
            }
        }
        for(slayer in superLayers){
            if(window.superLayers.hasOwnProperty(slayer) && slayer !== 'size'){
                headerData = window.superLayers[slayer];

                column = headerData.index + 1;

                objectHeaderInWFlowGroup = new THREE.Object3D();

                objectHeaderInWFlowGroup.position.x = (width * (column - (groupsQtty - 1) / 2) + ((column - 1) * window.TILE_DIMENSION.width)) - 15000;
                objectHeaderInWFlowGroup.position.y = ((layersQtty + 10) * window.TILE_DIMENSION.height) / 2;
                objectHeaderInWFlowGroup.name = slayer;

                objectHeaderInWFlowGroup.position.copy(window.viewManager.translateToSection('workflows', objectHeaderInWFlowGroup.position));
                positions.workFlow.push(objectHeaderInWFlowGroup);
            }
        }
    };

    var initialize = function() {

        var headerData,
            group,
            column,
            image,
            object,
            slayer,
            row;

        function createChildren(child, parents) {

                var i, l, actual;

                if(parents != null && parents.length !== 0) {

                    for(i = 0, l = parents.length; i < l; i++) {

                        dependencies[parents[i]] = dependencies[parents[i]] || [];

                        actual = dependencies[parents[i]];

                        actual.push(child);
                    }
                }
                else
                    dependencies.root.push(child);

                dependencies[child] = dependencies[child] || [];
            }

        function createHeader(group, width, height, index) {

            var source,
                levels = [
                    ['high', 0],
                    ['medium', 8000],
                    ['small', 16000]],
                i, l,
                header = new THREE.LOD();

            for(i = 0, l = levels.length; i < l; i++) {

                source = 'images/headers/' + levels[i][0] + '/' + group + '_logo.png';

                var object = new THREE.Mesh(
                    new THREE.PlaneBufferGeometry(width, height),
                    new THREE.MeshBasicMaterial({transparent : true, opacity : 0})
                    );

                object.name = group;
                object.userData = {
                    id: index,
                    onClick : onClick
                };

                helper.applyTexture(source, object);

                header.addLevel(object, levels[i][1]);
            }

            return header;
        }

        var src;

        for(group in window.platforms) {
            if(window.platforms.hasOwnProperty(group) && group !== 'size') {

                headerData = window.platforms[group];
                column = headerData.index;

                object = createHeader(group, width, height, column);

                object.position.copy(window.viewManager.translateToSection('table', window.helper.getOutOfScreenPoint(0)));
                object.name = group;

                scene.add(object);
                objects.push(object);

                object = new THREE.Object3D();

                object.position.x = width * (column - (groupsQtty - 1) / 2) + ((column - 1) * window.TILE_DIMENSION.width);
                object.position.y = ((layersQtty + 10) * window.TILE_DIMENSION.height) / 2;
                object.name = group;

                object.position.copy(window.viewManager.translateToSection('table', object.position));

                positions.table.push(object);

                createChildren(group, headerData.dependsOn);
            }
        }

        for(slayer in superLayers) {
            if(window.superLayers.hasOwnProperty(slayer) && slayer !== 'size') {

                headerData = window.superLayers[slayer];

                row = window.platforms.size() + headerData.index;

                object = createHeader(slayer, width, height, row);

                object.position.copy(window.viewManager.translateToSection('table', window.helper.getOutOfScreenPoint(0)));

                object.name = slayer;

                scene.add(object);
                objects.push(object);

                object = new THREE.Object3D();

                object.position.x = -(((groupsQtty + 1) * width / 2) + window.TILE_DIMENSION.width);
                object.position.y = -(superLayerPosition[headerData.index] * window.TILE_DIMENSION.height) - (superLayerMaxHeight * window.TILE_DIMENSION.height / 2) + (layersQtty * window.TILE_DIMENSION.height / 2);
                object.name = slayer;

                object.position.copy(window.viewManager.translateToSection('table', object.position));

                positions.table.push(object);

                createChildren(slayer, headerData.dependsOn);
            }
        }

        buildGraph();
        calculateStackPositions();
        headersPositionsViewWorkFlow();
    };

    initialize();
    //=========================================================
}
