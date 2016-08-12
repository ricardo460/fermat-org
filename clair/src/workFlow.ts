class Workflow {

    constructor(public flow) {
        this.countFlowElement();
    }

    BOX_WIDTH = 825;
    BOX_HEIGHT = 188;
    X_OFFSET = -312; //Because lines don't come from the center
    ROW_SPACING = 350;
    COLUMN_SPACING = 900;
    HEADER_WIDTH = 825;
    HEADER_HEIGHT = 238;

    TYPECALL: any = [//Colors for different call types
        {
            title: 'Direct Call',
            color: 0x0000FF
        },
        {
            title: 'Event',
            color: 0xFF0000
        },
        {
            title: 'Fermat Message',
            color: 0xF8E645
        },
        {
            title: 'defaults',
            color: 0x0000FF
        }
    ];

    account = 0;
    used = [];
    xDraw = 0;
    objectsFlow = {
        mesh: [],
        position: {
            target: [],
            origin: []
        }
    };
    objectsStep = {
        mesh: [],
        position: {
            target: [],
            origin: []
        }
    };

    action = false;

    countFlowElement() {

        let i, l;

        for (i = 0, l = this.flow.steps.length; i < l; i++) {

            let element = this.flow.steps[i];

            this.flow.steps[i].element = Helper.searchElement(
                (element.platfrm || element.suprlay) + '/' + element.layer + '/' + element.name
            );
        }

    };



    onClick = (target) => {

        if (globals.actualView === 'workflows') {
            globals.workFlowManager.onElementClickHeaderFlow(target.userData.id);
            this.action = true;
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
    draw(initialX, initialY, initialZ, indice, id) {

        let title : any = this.createTitleBox(this.flow.name, this.flow.desc),
            origin = Helper.getOutOfScreenPoint(80000 * 2, 'workflows'),
            target = new THREE.Vector3(initialX, initialY + globals.TILE_DIMENSION.height * 2, initialZ);

        if (indice === 1)
            target = new THREE.Vector3(initialX, initialY, initialZ);

        title.userData = {
            id: id,
            onClick: this.onClick
        };

        this.objectsFlow.position.origin.push(origin);
        this.objectsFlow.position.target.push(target);

        title.position.copy(origin);

        this.objectsFlow.mesh.push(title);

        globals.scene.add(title);

        if (indice === 0) {

            for (let i = 0, l = this.flow.steps.length; i < l; i++) {
                this.drawTree(this.flow.steps[i], initialX + this.COLUMN_SPACING * i, initialY, 0);
            }

            this.showAllFlow();
            this.showSteps();
        }
        else if (indice === 1)
            this.showAllFlow();
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

    drawTree(root, x, y, z) { //TODO

        if (typeof root.drawn === 'undefined') {

            this.drawStep(root, x, y, z);

            let childCount = root.next.length,
                startX = x - 0.5 * (childCount - 1) * this.COLUMN_SPACING;

            if (childCount !== 0) {

                let color = this.getColor(root.next[0].type);

                let lineGeo,
                    lineMat,
                    rootPoint,
                    rootLine,
                    origin;

                lineGeo = new THREE.BufferGeometry();
                lineMat = new THREE.LineBasicMaterial({ color: color });
                rootPoint = new THREE.Vector3(x + this.X_OFFSET, y - this.ROW_SPACING / 2, -1);

                let vertexPositions = [
                    [x + this.X_OFFSET, y, -1],
                    [rootPoint.x, rootPoint.y, rootPoint.z]
                ];

                let vertices = new Float32Array(vertexPositions.length * 3);

                for (let j = 0; j < vertexPositions.length; j++) {
                    vertices[j * 3 + 0] = vertexPositions[j][0];
                    vertices[j * 3 + 1] = vertexPositions[j][1];
                    vertices[j * 3 + 2] = vertexPositions[j][2];
                }

                lineGeo.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

                rootLine = new THREE.Line(lineGeo, lineMat);
                origin = Helper.getOutOfScreenPoint(-1);
                rootLine.position.copy(origin);
                this.objectsStep.position.origin.push(origin);
                this.objectsStep.position.target.push(new THREE.Vector3(0, 0, 0));

                this.objectsStep.mesh.push(rootLine);
                globals.scene.add(rootLine);

                let nextX,
                    nextY,
                    childLine,
                    child,
                    i,
                    isLoop,
                    nextZ = z;

                for (i = 0; i < childCount; i++) {

                    child = this.getStep(root.next[i].id);
                    isLoop = (typeof child.drawn !== 'undefined');
                    nextX = startX + i * this.COLUMN_SPACING;
                    if (this.collides(nextX, root, false, y)) nextX += this.COLUMN_SPACING;

                    color = this.getColor(root.next[i].type);

                    if (isLoop) {

                        let gradient = new THREE.Color(color);

                        gradient.r = Math.max(gradient.r, 0.5);
                        gradient.g = Math.max(gradient.g, 0.5);
                        gradient.b = Math.max(gradient.b, 0.5);

                        lineMat = new THREE.LineBasicMaterial({ color: gradient.getHex() }); //gradient
                        nextY = child.drawn.y;

                        if (nextX !== rootPoint.x && this.collides(nextX, root, true))
                            nextX += this.COLUMN_SPACING;
                    }
                    else {
                        lineMat = new THREE.LineBasicMaterial({ color: color });
                        nextY = y - this.ROW_SPACING;
                    }

                    lineGeo = new THREE.Geometry();
                    lineGeo.vertices.push(
                        rootPoint,
                        new THREE.Vector3(nextX + this.X_OFFSET, rootPoint.y, -1),
                        new THREE.Vector3(nextX + this.X_OFFSET, nextY, -1)
                    );

                    if (isLoop) {

                        lineGeo.vertices[2].setY(nextY + this.ROW_SPACING * 0.25);

                        lineGeo.vertices.push(
                            new THREE.Vector3(child.drawn.x + this.X_OFFSET, child.drawn.y + this.ROW_SPACING * 0.25, -1)
                        );
                    }

                    childLine = new THREE.Line(lineGeo, lineMat);
                    //childLine.position.z = 80000;

                    origin = Helper.getOutOfScreenPoint(-1);
                    childLine.position.copy(origin);
                    this.objectsStep.position.origin.push(origin);
                    this.objectsStep.position.target.push(new THREE.Vector3(0, 0, 0));

                    this.objectsStep.mesh.push(childLine);
                    globals.scene.add(childLine);

                    if (nextX !== undefined) {

                        if (this.xDraw < nextX) {

                            this.xDraw = nextX;
                        }
                    }

                    this.drawTree(child, nextX, nextY, nextZ);
                }
            }
        }
        this.account = 0;
        return this.xDraw;
    };

    /**
     * @author Emmanuel Colina
     * @lastmodifiedBy Ricardo Delgado
     * Takes away all the tiles except the one with the id
     */
    letAloneHeaderFlow() {

        this.animateFlows('steps', 'origin', false);
        this.animateFlows('flow', 'origin', true);
    };

    /**
     * @author Ricardo Delgado
     * Displays all flow in the table.
     */
    showAllFlow() {

        this.animateFlows('flow', 'target', true, 3000);
    };

    /**
     * @author Ricardo Delgado
     * It shows all the steps of the flow.
     */
    showSteps() {

        this.animateFlows('steps', 'target', true, 3000);
    };

    /**
     * @author Ricardo Delgado.
     * Deletes all objects related to the flow.
     */
    deleteAll() {

        this.animateFlows('steps', 'origin', false);
        this.animateFlows('flow', 'origin', false);
    };

    /**
     * @author Ricardo Delgado.
     * Deletes all step related to the flow.
     */
    deleteStep() {

        globals.tileManager.letAlone();
        this.animateFlows('steps', 'origin', false, 3000);
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
    drawStep(node, x, y, _z) {

        let z = _z || 0,
            tile,
            stepBox,
            origin,
            target,
            tilePosition = new THREE.Vector3(x - 108, y - 2, z + 1);

        if (node.element !== -1) {

            if (typeof this.used[node.element] !== 'undefined') {

                let data = Helper.clone(Helper.getSpecificTile(node.element).data);

                tile = globals.tileManager.createElement(node.element + "_clone_" + this.account, data);
                tile.isClone = true;

                this.objectsStep.position.origin.push(Helper.getOutOfScreenPoint(1));
                this.objectsStep.position.target.push(tilePosition);

                this.objectsStep.mesh.push(tile);
                globals.scene.add(tile);

                this.account = this.account + 1;
            }
            else {

                tile = Helper.getSpecificTile(node.element).mesh;
                this.used[node.element] = true;

                new TWEEN.Tween(tile.position)
                    .to({ x: tilePosition.x, y: tilePosition.y, z: tilePosition.z }, 4000)
                    .easing(TWEEN.Easing.Exponential.InOut)
                    .start();

                new TWEEN.Tween(tile.rotation)
                    .to({ x: 0, y: 0, z: 0 }, 4000)
                    .easing(TWEEN.Easing.Exponential.InOut)
                    .start();
            }


        }

        stepBox = this.createStepBox(node);

        origin = Helper.getOutOfScreenPoint(0);

        target = new THREE.Vector3(x, y, z);

        this.objectsStep.position.origin.push(origin);
        this.objectsStep.position.target.push(target);

        stepBox.position.copy(origin);

        this.objectsStep.mesh.push(stepBox);
        globals.scene.add(stepBox);

        node.drawn = {
            x: x,
            y: y
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
    collides(x, from, loop = false, y?) {

        let actual,
            left,
            right;

        loop = loop || false;

        for (let i = 0; i < this.flow.steps.length; i++) {
            actual = this.flow.steps[i];

            if (loop) {
                if (actual.drawn && actual !== from) {
                    left = Math.min(actual.drawn.x, x);
                    right = Math.max(actual.drawn.x, x);

                    if (right - left - this.BOX_WIDTH <= 0)
                        return true;
                }
            }
            else {
                if (actual.drawn && actual.drawn.x === x && actual !== from && actual.drawn.y <= y)
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
    createFlowBox(src, fillBox, width, height, _switch?) : THREE.Texture | THREE.Mesh {

        let canvas = document.createElement('canvas');
        canvas.height = height;
        canvas.width = width;
        let ctx = canvas.getContext('2d');
        let size = 12;
        ctx.fillStyle = '#FFFFFF';

        let image = document.createElement('img');
        let texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.NearestFilter;

        ctx.font = size + 'px Arial';

        image.onload = function () {
            fillBox(ctx, image);
            texture.needsUpdate = true;
        };

        image.src = src;

        if (_switch)
            return texture;
        else {
            let mesh = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(width, height),
                new THREE.MeshBasicMaterial({ color: 0xFFFFFF, map: texture, transparent: true })
            );
            return mesh;
        }
    }

    /**
     * Creates a single step box
     * @param {Object} node The node to draw
     * @author Miguel Celedon
     */
    createStepBox(node) {

        let fillBox = function (ctx, image) {

            ctx.drawImage(image, 0, 0);

            //ID
            let nodeValue = parseInt(node.id) + 1;
            let Nodeid = '';
            Nodeid = (nodeValue < 10) ? '0' + Nodeid.toString() : Nodeid.toString();

            let size = 83;
            ctx.font = size + 'px Arial';
            ctx.fillStyle = '#000000';
            Helper.drawText(Nodeid, 57, 130, ctx, 76, size);
            ctx.fillStyle = '#FFFFFF';

            //Title
            size = 18;
            ctx.font = 'bold ' + size + 'px Arial';
            Helper.drawText(node.title, 421, 59, ctx, 250, size);

            //Description
            size = 12;
            ctx.font = size + 'px Arial';
            Helper.drawText(node.desc, 421, 114, ctx, 250, size);
        };

        return this.createFlowBox('images/workflow/stepBox.png', fillBox, this.BOX_WIDTH, this.BOX_HEIGHT);
    }

    /**
     * Creates the title box
     * @param {String} title The title of the box
     * @param {String} desc  The description of the whole process
     * @author Miguel Celedon
     */
    createTitleBox(title, desc, _switch?) {

        let fillBox = function (ctx, image) {

            ctx.drawImage(image, 0, 0);

            //Title
            let size = 24;
            ctx.font = 'bold ' + size + 'px Arial';
            Helper.drawText(title, 190, 61, ctx, 400, size);

            //Description
            size = 17;
            ctx.font = size + 'px Arial';
            Helper.drawText(desc, 190, 126, ctx, 550, size);
        };

        return this.createFlowBox('images/workflow/titleBox.png', fillBox, this.HEADER_WIDTH, this.HEADER_HEIGHT, _switch);
    };

    /**
     * @author Ricardo Delgado.
     * Creates the animation for all flow there.
     * @param   {Object}    objects     .     
     * @param   {String}     target     He says the goal should take the flow.
     * @param   {Boolean}    visible    visible of the object.
     * @param   {Number}    duration    Animation length.
     */
    animateFlows(objects, target, visible, duration = 2000, callback?) {

        let _duration = duration || 2000,
            _target,
            _objects,
            object;

        if (objects === 'steps') {

            _objects = this.objectsStep;

            if (!visible) {

                this.used = [];

                this.objectsStep = { mesh: [], position: { target: [], origin: [] } };

                for (let _i = 0, _l = this.flow.steps.length; _i < _l; _i++) {
                    delete this.flow.steps[_i].drawn;
                }
            }
        }
        else {

            _objects = this.objectsFlow;

            if (!visible) {

                this.used = [];

                this.objectsFlow = { mesh: [], position: { target: [], origin: [] } };

            }
        }

        for (let i = 0, l = _objects.mesh.length; i < l; i++) {

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
                .onComplete(function () {
                    if (!visible)
                        globals.scene.remove(object);
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
    getStep(id) {

        let i, l, actual;

        for (i = 0, l = this.flow.steps.length; i < l; i++) {

            actual = this.flow.steps[i];

            //Should not be done, the id in 'next' and in each step should be the same type (strings)
            if (actual.id == id)
                return actual;
        }

        return null;
    }

    getColor(call) {

        let color = this.TYPECALL.find(function (x) {
            if (x.title.toLowerCase() === call.toLowerCase())
                return x;
            else if (x.title === 'defaults')
                return x;
        }).color;

        return color;
    }
}