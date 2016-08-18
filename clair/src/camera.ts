const ROTATE_SPEED = 1.3;
const MIN_DISTANCE = 50;
const MAX_DISTANCE = 90000;

/**
 *
 * @class Camera
 *
 * @param  {Position}
 * @param  {Renderer}
 * @param  {Function}
 */
class Camera {

    constructor(public position: THREE.Vector3, public renderer: THREE.Renderer, public renderFunc: () => void) {
        this.fake.position.set(MAX_DISTANCE, MAX_DISTANCE, -MAX_DISTANCE);
        this.controls.rotateSpeed = ROTATE_SPEED;
        this.controls.noRotate = true;
        this.controls.noPan = true;
        this.controls.minDistance = MIN_DISTANCE;
        this.controls.maxDistance = MAX_DISTANCE;
        this.controls.addEventListener('change', renderFunc);
        this.controls.position0.copy(position);
        this.camera.position.copy(position);
        window.addEventListener('resize', this.onWindowResize, false);
        window.addEventListener('keydown', this.onKeyDown, false);
    }

    /**
     * private properties
     */
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, MAX_DISTANCE);
    controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
    focus = null;
    rendering = false;
    fake = new THREE.Object3D();

    // Public properties
    dragging = false;
    aspectRatio = this.camera.aspect;
    moving = false;
    freeView = false;




    // Public Methods

    enableFreeMode(): void {
        this.controls.noRotate = false;
        this.controls.noPan = false;
        this.camera.far = MAX_DISTANCE * 2;
        this.controls.maxDistance = Infinity;
        this.onWindowResize();
        this.freeView = true;
    };

    createVector(x: number, y: number): THREE.Vector3 {

        let p = new THREE.Vector3(x, y, 0);
        let vector = p.project(this.camera);

        vector.x = (vector.x + 1) / 2 * window.innerWidth;
        vector.y = -(vector.y - 1) / 2 * window.innerHeight;

        return vector;
    };

    disableFreeMode(): void {
        this.controls.noRotate = true;
        this.controls.noPan = true;
        this.camera.far = MAX_DISTANCE;
        this.controls.maxDistance = MAX_DISTANCE;
        this.onWindowResize();
        //this.freeView = false;
    };

    /**
     * Returns the max distance set
     * @returns {Number} Max distance constant
     */
    getMaxDistance(): number {
        return MAX_DISTANCE;
    };

    /**
     * @method disable disables this.camera this.controls
     */
    disable(): void {
        this.controls.enabled = false;
    };

    /**
     *
     * @method enable enables this.camera this.controls
     */
    enable(): void {
        this.controls.enabled = true;
    };

    /**
     * Returns a copy of the actual position
     * @returns {THREE.Vector3} Actual position of the this.camera
     */
    getPosition(): THREE.Vector3 {
        return this.camera.position.clone();
    };

    setTarget(target: THREE.Vector3, duration = 2000): void {
        new TWEEN.Tween(this.controls.target)
            .to({ x: target.x, y: target.y, z: target.z }, duration)
            .start();
    };

    /**
     * Sets the focus to one object
     * 
     * @author Miguel Celedon
     * @param {THREE.Object3D} target          The target to see
     * @param {THREE.Vector3}  offset          The distance and position to set the this.camera
     * @param {number}         [duration=3000] The duration of the animation
     */
    setFocus(target: THREE.Object3D, offset: THREE.Vector3, duration = 3000): void {

        this.focus = target;

        this.render(this.renderer, globals.scene);
        offset.applyMatrix4(target.matrix);

        new TWEEN.Tween(this.camera.position)
            .to({ x: offset.x, y: offset.y, z: offset.z }, duration)
            .onComplete(render)
            .start();

        this.setTarget(target.position, duration / 2);

        new TWEEN.Tween(this.camera.up)
            .to({ x: target.up.x, y: target.up.y, z: target.up.z }, duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
    };

    /**
     *
     * @method loseFocus    loses focus from target
     *
     */

    loseFocus(): void {

        if (this.focus != null) {
            let backButton = document.getElementById('backButton');
            $(backButton).fadeTo(0, 0,  () => { backButton.style.display = 'none'; });
            $('#sidePanel').fadeTo(1000, 0,  () => { $('#sidePanel').remove(); });
            $('#elementPanel').fadeTo(1000, 0,  () => { $('#elementPanel').remove(); });
            $('#timelineButton').fadeTo(1000, 0,  () => { $('#timelineButton').remove(); });
            if ($('#tlContainer') != null)
                Helper.hide($('#tlContainer'), 1000);
            $(this.renderer.domElement).fadeTo(1000, 1);

            this.focus = null;

            globals.buttonsManager.removeAllButtons();
        }
    };

    /**
     *
     * @method onWindowResize   execute in case of window resizing
     * 
     */
    onWindowResize(): void {
        let innerWidth = window.innerWidth,
            innerHeight = window.innerHeight;

        this.camera.aspect = innerWidth / innerHeight;
        this.camera.updateProjectionMatrix();
        this.aspectRatio = this.camera.aspect;

        this.renderer.setSize(innerWidth, innerHeight);
    };

    /**
     *
     * @method onKeyDown    execute in case of key down pressed
     *
     * @param {Event} event event to listen to
     * 
     */
    onKeyDown = (event: KeyboardEvent | { keyCode: number }) => {

        if (event.keyCode === 27 /* ESC */) {
            //TWEEN.removeAll();
            let duration = 2000;

            if (globals.viewManager !== null) {

                if (globals.viewManager.views && globals.viewManager.views[globals.actualView]) {
                    globals.viewManager.views[globals.actualView].reset();
                }

                if (globals.actualView)
                    this.resetPosition(duration);
            }
        }
    };

    /**
     * Resets the this.camera position
     * @param {Number} [duration=2000] Duration of the animation
     */
    resetPosition(duration = 2000): void {

        this.disable();

        let target = globals.viewManager.translateToSection(globals.actualView, this.controls.position0);

        if (this.freeView) {

            let targetView = globals.viewManager.translateToSection(globals.actualView, new THREE.Vector3(0, 0, 0));

            new TWEEN.Tween(this.controls.target)
                .to({ x: targetView.x, y: targetView.y, z: targetView.z }, duration)
                //.easing( TWEEN.Easing.Cubic.InOut )
                .start();
        }

        new TWEEN.Tween(this.camera.position)
            .to({ x: target.x, y: target.y, z: target.z }, duration)
            //.easing( TWEEN.Easing.Exponential.InOut )
            .onUpdate( () => {
                if (!this.freeView)
                    this.controls.target.set(this.camera.position.x, this.camera.position.y, 1);
            })
            .onComplete( () => {
                this.enable();
                this.disableFreeMode();
            })
            .start();

        new TWEEN.Tween(this.camera.up)
            .to({ x: 0, y: 1, z: 0 }, duration)
            //.easing( TWEEN.Easing.Exponential.InOut )
            .start();
    };

    /**
     *
     * @method update    updates this.camera this.controls  
     *
     */
    update(): void {

        if (this.controls.noPan === true && Math.ceil(this.camera.position.z) !== this.controls.position0.z) {
            this.controls.noPan = false;

            if (this.freeView === true)
                this.enableFreeMode();

            if (globals.viewManager && globals.actualView)
                globals.viewManager.views[globals.actualView].zoom();
        }
        else if (this.controls.noPan === false && Math.ceil(this.camera.position.z) === this.controls.position0.z && this.freeView === false)
            this.onKeyDown({ keyCode: 27 }); //Force reset if far enough

        this.controls.update();
        this.dragging = this.controls.dragging;
    };

    /**
     *
     * @method render    renders an scene
     *
     * @param {Renderer} renderer renderer for this.camera
     * @param {Scene}    scene    scene to render
     *
     */
    render = (renderer: THREE.Renderer, scene: THREE.Scene) => {

        let cam;

        if (this.rendering === false) {

            this.rendering = true;
            scene.traverse( (object) => {
                if (object instanceof THREE.LOD) {
                    if (object.userData.flying === true)
                        cam = this.fake;
                    else
                        cam = this.camera;

                    object.update(cam);
                }
            });

            renderer.render(scene, this.camera);
            this.rendering = false;
        }
        else
            console.log("Render ignored");
    };

    /**
     *
     * @method getFocus gets focused target
     *
     * @return {Number} focused target
     */
    getFocus(): THREE.Object3D {
        return this.focus;
    };

    disableFocus(): void {
        this.focus = true;
    };

    /**
     * Casts a ray between the this.camera to the target
     * @param   {Object} target   Vector2D target
     * @param   {Array}  elements Array of elements expected to collide
     * @returns {Array}  All intercepted members of elements
     */
    rayCast(target: THREE.Vector2, elements: THREE.Object3D[]): THREE.Intersection[] {

        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(target, this.camera);

        /* Debug code, draw lines representing the clicks 
 
        let mat = new THREE.LineBasicMaterial({color : 0xaaaaaa});
        let g = new THREE.Geometry();
        let r = raycaster.ray;
        let dest = new THREE.Vector3(r.origin.x + r.direction.x * MAX_DISTANCE, r.origin.y + r.direction.y * MAX_DISTANCE, r.origin.z + r.direction.z * MAX_DISTANCE);

        g.vertices.push( r.origin, dest);

        let line = new THREE.Line(g, mat);

        scene.add(line);*/

        return raycaster.intersectObjects(elements);
    };

    getRayCast(raycaster: THREE.Raycaster, mouse: THREE.Vector2): void {
        raycaster.setFromCamera(mouse, this.camera);
    };

    /**
     * Moves the this.camera to a position
     * @author Miguel Celedon
     * @param {Number}  x               X coordinate
     * @param {Number}  y               Y coordinate
     * @param {Number}  z               Z coordinate
     * @param {Number}  [duration=2000] Milliseconds of the animation
     * @param {boolean} [synced]        If true, moves like it were not in free view
     */
    move(x: number, y: number, z: number, duration = 2000, synced = false): void {

        let tween = null;

        if (Helper.isValidVector({ x: x, y: y, z: z })) {

            tween = new TWEEN.Tween(this.camera.position)
                .to({ x: x, y: y, z: z }, duration)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onUpdate( () => {
                    if (!this.freeView || synced)
                        this.controls.target.set(this.camera.position.x, this.camera.position.y, 0);
                });

            let next = new TWEEN.Tween(this.camera.up)
                .to({ x: 0, y: 1, z: 0 }, duration)
                .easing(TWEEN.Easing.Cubic.InOut);

            tween.onStart( () => { next.start(); });
            tween.start();

        }
        else
            window.alert("Error: this is not a valid vector (" + x + ", " + y + ", " + z + ")");
    };

    /**
     * Locks the panning of the this.camera
     */
    lockPan(): void {
        this.controls.noPan = true;
    };

    /**
     * Unlocks the panning of the this.camera
     */
    unlockPan(): void {
        this.controls.noPan = false;
    };
}