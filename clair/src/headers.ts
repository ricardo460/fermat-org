/**
 * @class Represents the group of all header icons
 * @param {Number} columnWidth         The number of elements that contains a column
 * @param {Number} superLayerMaxHeight Max rows a superLayer can hold
 * @param {Number} groupsQtty          Number of groups (column headers)
 * @param {Number} layersQtty          Number of layers (rows)
 * @param {Array}  superLayerPosition  Array of the position of every superlayer
 */
class Headers {

    constructor(public columnWidth, public superLayerMaxHeight, public groupsQtty, public layersQtty, public superLayerPosition) {
    }

    // Private members
    objects = [];
    dependencies = {
        root: []
    };
    positions = {
        table: [],
        stack: [],
        workFlow: []
    };
    arrowsPositions = {
        origin: [],
        stack: []
    };
    graph: any = {};
    arrows = [];

    width = this.columnWidth * globals.TILE_DIMENSION.width;
    height = this.width * 443 / 1379;

    onClick(target: THREE.Mesh): void {
        if (globals.actualView === 'workflows') {
            globals.buttonsManager.removeAllButtons();
            this.onElementClickHeader(target.userData.id, this.objects);
        }
    };

    onElementClickHeader(id: number, objects: any[]) {
        let duration = 1000;

        if (globals.camera.getFocus() == null) {
            let camTarget = objects[id].clone();
            camTarget.position.y -= 2500;

            globals.camera.setFocus(camTarget, new THREE.Vector4(0, -2500, 9000, 1), duration);

            for (let i = 0; i < objects.length; i++) {
                if (id !== i)
                    this.letAloneHeader(objects[i]);
            }

            Helper.showBackButton();
        }

        globals.workFlowManager.createColumHeaderFlow(objects[id]);
    }

    /**
     * @author Emmanuel Colina
     * let alone the header
     * @param {Object} objHeader Header target
     */

    letAloneHeader(objHeader: THREE.Mesh) {
        let i, _duration = 2000,
            distance = globals.camera.getMaxDistance() * 2,
            out = globals.viewManager.translateToSection('workflows', new THREE.Vector3(0, 0, distance));

        let target;

        let animate =  (object, target, dur) => {

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

        target = out;
        objHeader.userData.flying = true;
        animate(objHeader, target, Math.random() * _duration + _duration);
    }

    // Public method

    getPositionHeaderViewInFlow() {
        return this.positions.workFlow;
    };
    /**
     * @author Emmanuel Colina
     * @lastmodifiedBy Miguel Celedon
     * Create the Arrows (dependences)
     */

    createArrows(startX, startY, endX, endY) {

        let POSITION_X = 1700;
        let POSITION_Y = 200;
        let POSITION_Z = 44700;

        //camera.resetPosition();

        endY = endY - 300;

        let from = new THREE.Vector3(startX, startY, 0);

        let to = new THREE.Vector3(endX, endY, 0);

        let direction = to.clone().sub(from);

        let length = direction.length();

        let arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, 0XF26662, 550, 300);

        let objectStack = new THREE.Object3D();
        let objectOrigin = new THREE.Object3D();

        arrowHelper.position.x = arrowHelper.position.x - POSITION_X;
        arrowHelper.position.y = arrowHelper.position.y - POSITION_Y;
        arrowHelper.position.z = POSITION_Z;

        objectStack.position.copy(arrowHelper.position);
        objectStack.rotation.copy(arrowHelper.rotation);
        this.arrowsPositions.stack.push(objectStack);

        arrowHelper.line.material.opacity = 0;
        arrowHelper.line.material.transparent = true;

        arrowHelper.cone.material.opacity = 0;
        arrowHelper.cone.material.transparent = true;


        let startingPosition = Helper.getOutOfScreenPoint(0);
        arrowHelper.position.copy(globals.viewManager.translateToSection('stack', startingPosition));
        arrowHelper.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);

        objectOrigin.position.copy(arrowHelper.position);
        objectOrigin.rotation.copy(arrowHelper.rotation);
        this.arrowsPositions.origin.push(objectOrigin);

        globals.scene.add(arrowHelper);
        this.arrows.push(arrowHelper);
    };

    /**
     * @author Isaias Taborda
     * Deletes the arrows in the graph when the user leaves the stack view
     * so they can be drawn from scrath if the user comes back to this view
     * @param {Number} [duration=5000] Duration in milliseconds for the animation
     */
    deleteArrows(duration) {
        let limit = this.arrows.length;

        for (let i = 0; i < limit; i++) {

            new TWEEN.Tween(this.arrows[i].position)
                .to({
                    x: this.arrowsPositions.origin[i].position.x,
                    y: this.arrowsPositions.origin[i].position.y,
                    z: this.arrowsPositions.origin[i].position.z
                }, Math.random() * duration + duration)
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();

            new TWEEN.Tween(this.arrows[i].rotation)
                .to({
                    x: this.arrowsPositions.origin[i].rotation.x,
                    y: this.arrowsPositions.origin[i].rotation.y,
                    z: this.arrowsPositions.origin[i].rotation.z
                }, Math.random() * duration + duration)
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();
        }

        setTimeout(function () {
            this.arrowsPositions.origin = [];
            this.arrowsPositions.stack = [];
            for (let i = 0; i < limit; i++) {
                globals.scene.remove(this.arrows[i]);
            }
            this.arrows = [];
        }, duration);
    };

    /**
     * @author Miguel Celedon
     * @lastmodifiedBy Miguel Celedon
     * Arranges the headers by dependency
     * @param {Number} [duration=2000] Duration in milliseconds for the animation
     */
    transformStack(duration) {
        let _duration = duration || 2000;


        this.createEdges();
        this.moveToPosition(duration, duration / 2);

        let i, l;

        for (i = 0, l = this.objects.length; i < l; i++) {
            new TWEEN.Tween(this.objects[i].position)
                .to({
                    x: this.positions.stack[i].position.x,
                    y: this.positions.stack[i].position.y,
                    z: this.positions.stack[i].position.z
                }, _duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
        }
    };

    /**
     * @author Emmanuel Colina
     * Arranges the headers by dependency
     * @param {Number} [duration=2000] Duration in milliseconds for the animation
     */
    transformWorkFlow(duration) {
        let _duration = duration || 2000;

        let i, l;

        for (i = 0, l = this.objects.length; i < l; i++) {
            new TWEEN.Tween(this.objects[i].position)
                .to({
                    x: this.positions.workFlow[i].position.x,
                    y: this.positions.workFlow[i].position.y,
                    z: this.positions.workFlow[i].position.z
                }, _duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
        }
    };

    /**
     * @author Emmanuel Colina
     * Hide the headers
     */
    hidetransformWorkFlow(duration) {
        let i, j,
            position;

        for (i = 0; i < this.objects.length; i++) {

            position = Helper.getOutOfScreenPoint(0);

            new TWEEN.Tween(this.objects[i].position)
                .to({ x: position.x, y: position.y, z: position.z }, duration)
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();
        }
    };

    /**
     * @author Simón Oroño
     * Retrieves the node associated with an object
     */
    getObjectNode(id) {
        for (let i = 0; i < this.graph.nodes.length; i++) {
            if (this.graph.nodes[i].id === id) {
                return this.graph.nodes[i];
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
    calculateStackPositions() {
        let i, obj, node;
        let nodesInLevel = {};
        let nodesAlreadyProcessedInLevel = {};

        /*objects.sort(function(a, b) {
            return (a === b) ? 0 : ((a > b) ? 1 : -1);
        });*/

        let initialX = -20000;
        let initialY = -15000;
        let separationX = this.width + 1500;
        let separationY = 6000.0;
        let positionZ = 45000;

        for (i = 0; i < this.graph.nodes.length; i++) {
            node = this.graph.nodes[i];

            // We calculate how much nodes there are for each level
            if (!(node.level in nodesInLevel)) {
                nodesInLevel[node.level] = 0;
                nodesAlreadyProcessedInLevel[node.level] = 0;
            } else {
                nodesInLevel[node.level] += 1;
            }
        }

        // Send all objects to the center
        for (i = 0; i < this.objects.length; i++) {
            obj = new THREE.Object3D();
            obj.name = this.positions.table[i].name;
            this.positions.stack.push(obj);
        }

        for (i = 0; i < this.objects.length; i++) {
            node = this.getObjectNode(this.objects[i].name);

            let levelDifference = nodesInLevel[0] - nodesInLevel[node.level];
            let margin = (levelDifference / 2.0) * (separationX);

            this.positions.stack[i].position.x = initialX + (separationX * nodesAlreadyProcessedInLevel[node.level]) + margin;
            this.positions.stack[i].position.y = initialY + (separationY * node.level);
            this.positions.stack[i].position.z = positionZ;

            nodesAlreadyProcessedInLevel[node.level] += 1;
        }

        //Transport all headers to the stack section
        for (i = 0; i < this.positions.stack.length; i++) {
            this.positions.stack[i].position.copy(globals.viewManager.translateToSection('stack', this.positions.stack[i].position));
        }
    };

    /**
     * @author Emmanuel Colina
     * @lastmodifiedBy Miguel Celedon
     * Paint the dependences
     */
    createEdges() {
        let startX, startY, endX, endY;
        let i, j;

        for (i = 0; i < this.graph.edges.length; i++) {
            startX = 0;
            startY = 0;
            endX = 0;
            endY = 0;

            for (j = 0; j < this.objects.length; j++) {
                if (this.graph.edges[i].from === this.objects[j].name) {
                    startX = this.positions.stack[j].position.x;
                    startY = this.positions.stack[j].position.y;
                }

                if (this.graph.edges[i].to === this.objects[j].name) {
                    endX = this.positions.stack[j].position.x;
                    endY = this.positions.stack[j].position.y;
                }
            }

            this.createArrows(startX, startY, endX, endY);
        }
    };

    /**
     * @author Emmanuel Colina
     * @lastmodifiedBy Miguel Celedon
     * Arranges the headers in the table
     * @param {Number} [duration=2000] Duration of the animation
     */
    flyOut(duration = 2000) {

        let _duration = duration, i, l;

        for (i = 0, l = this.arrows.length; i < l; i++) {

            new TWEEN.Tween(this.arrows[i].position)
                .to({
                    x: this.arrowsPositions.origin[i].position.x,
                    y: this.arrowsPositions.origin[i].position.y,
                    z: this.arrowsPositions.origin[i].position.z
                }, Math.random() * _duration + _duration)
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();

            new TWEEN.Tween(this.arrows[i].rotation)
                .to({
                    x: this.arrowsPositions.origin[i].rotation.x,
                    y: this.arrowsPositions.origin[i].rotation.y,
                    z: this.arrowsPositions.origin[i].rotation.z
                }, Math.random() * _duration + _duration)
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();

            Helper.hideObject(this.arrows[i].line, false, _duration);
            Helper.hideObject(this.arrows[i].cone, false, _duration);
        }

        this.arrows = [];
    };

    /**
     * @author Emmanuel Colina
     * @lastmodifiedBy Miguel Celedon
     *  Arranges the headers in the table
     * @param {Number} [duration=2000] Duration of the animation
     * @param {Number} [delay=0]       Delay of the animation
     */
    moveToPosition(duration, delay) {

        let _duration = duration || 2000,
            i, l;

        delay = (delay !== undefined) ? delay : 0;

        for (i = 0, l = this.arrows.length; i < l; i++) {

            Helper.showMaterial(this.arrows[i].line.material, Math.random() * _duration + _duration, TWEEN.Easing.Exponential.InOut, delay);
            Helper.showMaterial(this.arrows[i].cone.material, Math.random() * _duration + _duration, TWEEN.Easing.Exponential.InOut, delay);

            new TWEEN.Tween(this.arrows[i].position)
                .to({
                    x: this.arrowsPositions.stack[i].position.x,
                    y: this.arrowsPositions.stack[i].position.y,
                    z: this.arrowsPositions.stack[i].position.z
                }, Math.random() * _duration + _duration)
                .easing(TWEEN.Easing.Cubic.InOut)
                .delay(delay)
                .start();

            new TWEEN.Tween(this.arrows[i].rotation)
                .to({
                    x: this.arrowsPositions.stack[i].rotation.x,
                    y: this.arrowsPositions.stack[i].rotation.y,
                    z: this.arrowsPositions.stack[i].rotation.z
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

    transformTable(duration) {
        let _duration = duration || 2000,
            i, l;

        this.flyOut();

        this.showHeaders(_duration);
    };

    /**
     * Shows the headers as a fade
     * @param {Number} duration Milliseconds of fading
     */
    showHeaders(duration) {
        let i, j;

        for (i = 0; i < this.objects.length; i++) {

            new TWEEN.Tween(this.objects[i].position)
                .to({
                    x: this.positions.table[i].position.x,
                    y: this.positions.table[i].position.y,
                    z: this.positions.table[i].position.z
                }, duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();


            for (j = 0; j < this.objects[i].levels.length; j++) {
                new TWEEN.Tween(this.objects[i].levels[j].object.material)
                    .to({ opacity: 1, needsUpdate: true }, duration)
                    .easing(TWEEN.Easing.Exponential.InOut)
                    .start();
            }
        }
    };

    /**
     * Hides the headers (but donesn't delete them)
     * @param {Number} duration Milliseconds to fade
     */
    hideHeaders(duration) {
        let i, j,
            position;

        for (i = 0; i < this.objects.length; i++) {

            position = Helper.getOutOfScreenPoint(0);

            new TWEEN.Tween(this.objects[i].position)
                .to({ x: position.x, y: position.y, z: position.z }, duration)
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();

            for (j = 0; j < this.objects[i].levels.length; j++) {

                new TWEEN.Tween(this.objects[i].levels[j].object.material)
                    .to({ opacity: 0, needsUpdate: true }, duration)
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
    buildGraph() {

        let data, edges = [], nodes = [], options, level = 0, pending = {};

        let trace = (root, parent, _level, _nodes, _edges) => {

            if (parent)
                pending[parent] = true;

            let i, l, child,
                lookup =  (x) => {
                    return x.id == child;
                };

            for (i = 0, l = root.length; i < l; i++) {

                child = root[i];

                if (_level !== 0)
                    _edges.push({ from: parent, to: child });

                if ($.grep(_nodes, lookup).length === 0) {
                    _nodes.push({
                        id: child,
                        image: 'images/headers/svg/' + child + '_logo.svg',
                        level: _level
                    });
                }

                if (pending[child] === undefined)
                    trace(this.dependencies[child], child, _level + 1, _nodes, _edges);
            }
        };

        trace(this.dependencies.root, null, level, nodes, edges);

        data = {
            edges: edges,
            nodes: nodes
        };

        this.graph = data;
    };

    /**
     * @author Emmanuel Colina
     * Calculate the position header
     */

    calculateWorkflowPositions () {

        let calculatePosition = (group, offset) => {
            for (let element in group) {
                if (group.hasOwnProperty(element) && element !== 'size') {
                    let headerData = group[element];

                    let column = headerData.index + offset;

                    let headerObject = new THREE.Object3D();

                    headerObject.position.x = (this.width * (column - (this.groupsQtty - 1) / 2) + ((column - 1) * globals.TILE_DIMENSION.width)) - 20000;
                    headerObject.position.y = ((this.layersQtty + 10) * globals.TILE_DIMENSION.height) / 2;
                    headerObject.name = element;

                    headerObject.position.copy(globals.viewManager.translateToSection('workflows', headerObject.position));
                    this.positions.workFlow.push(headerObject);
                }
            }
        };

        calculatePosition(globals.platforms, globals.superLayers.size());
        calculatePosition(globals.superLayers, 0);
    };

    initialize() {

        let headerData,
            group,
            column,
            image,
            object,
            slayer,
            row;

        let createChildren = (child, parents) => {

            let i, l, actual;

            if (parents != null && parents.length !== 0) {

                for (i = 0, l = parents.length; i < l; i++) {
                    this.dependencies[parents[i]] = this.dependencies[parents[i]] || [];
                    actual = this.dependencies[parents[i]];
                    actual.push(child);
                }
            }
            else {
                this.dependencies.root.push(child);
            }

            this.dependencies[child] = this.dependencies[child] || [];
        }

        let createHeader = (group, width, height, index) => {

            let source,
                levels: Array<Array<any>> = [
                    ['high', 0],
                    ['medium', 8000],
                    ['small', 16000]],
                i, l,
                header = new THREE.LOD();

            for (i = 0, l = levels.length; i < l; i++) {

                source = 'images/headers/' + levels[i][0] + '/' + group + '_logo.png';

                let object = new THREE.Mesh(
                    new THREE.PlaneBufferGeometry(width, height),
                    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
                );

                object.name = group;
                object.userData = {
                    id: index,
                    onClick: onClick
                };
                Helper.applyTexture(source, object);
                header.addLevel(object, levels[i][1]);
            }
            return header;
        }

        let src;

        for (group in globals.platforms) {
            if (globals.platforms.hasOwnProperty(group) && group !== 'size') {

                headerData = globals.platforms[group];
                column = headerData.index;

                object = createHeader(group, this.width, this.height, column);

                object.position.copy(globals.viewManager.translateToSection('table', Helper.getOutOfScreenPoint(0)));
                object.name = group;

                globals.scene.add(object);
                this.objects.push(object);

                object = new THREE.Object3D();

                object.position.x = this.width * (column - (this.groupsQtty - 1) / 2) + ((column - 1) * globals.TILE_DIMENSION.width);
                object.position.y = ((this.layersQtty + 10) * globals.TILE_DIMENSION.height) / 2;
                object.name = group;

                object.position.copy(globals.viewManager.translateToSection('table', object.position));

                this.positions.table.push(object);

                createChildren(group, headerData.dependsOn);
            }
        }

        for (slayer in globals.superLayers) {
            if (globals.superLayers.hasOwnProperty(slayer) && slayer !== 'size') {
                headerData = globals.superLayers[slayer];
                row = globals.platforms.size() + headerData.index;
                object = createHeader(slayer, this.width, this.height, row);
                object.position.copy(globals.viewManager.translateToSection('table', Helper.getOutOfScreenPoint(0)));
                object.name = slayer;
                globals.scene.add(object);
                this.objects.push(object);
                object = new THREE.Object3D();
                object.position.x = -(((this.groupsQtty + 1) * this.width / 2) + globals.TILE_DIMENSION.width);
                object.position.y = (-(this.superLayerPosition[headerData.index]) - (this.superLayerMaxHeight / 2) + (this.layersQtty / 2)) * globals.TILE_DIMENSION.height;
                object.name = slayer;
                object.position.copy(globals.viewManager.translateToSection('table', object.position));
                this.positions.table.push(object);
                createChildren(slayer, headerData.dependsOn);
            }
        }

        this.buildGraph();
        this.calculateStackPositions();
        this.calculateWorkflowPositions();
    };
    //=========================================================
}
