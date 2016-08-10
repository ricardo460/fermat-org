/**
 * @author Ricardo Delgado
 */
class DragManager {

    rayCaster = new THREE.Raycaster();
    objects = [];
    objectsCollision = [];
    functions: {
        MOVE: Array<any>,
        CLICK: Array<any>,
        DROP: Array<any>,
        COLLISION: Array<any>,
        CROSS: Array<any>
    };
    styleMouse = {
        MOVE: 'default',
        CLICK: 'default',
        DROP: 'default',
        CROSS: 'pointer',
        default: 'default'
    };
    POSITION = null;
    mouse = new THREE.Vector2();
    offset = new THREE.Vector3();
    container = document.getElementById('container');
    INTERSECTED = null;
    COLLISION = null;
    OPACITY = null;
    SELECTED = null;
    plane = null;
    STATE = false;

    /**
     * @author Ricardo Delgado.
     * Crea el plano utilizado para la interseccion.
     * @param {String}
     */
    constructor() {

        this.plane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(MAX_DISTANCE * 1.5, MAX_DISTANCE * 0.5),
            new THREE.MeshBasicMaterial({ visible: false, color: Math.random() * 0xffffff })
        );

        window.scene.add(this.plane);
    }
    /**
     * @author Ricardo Delgado.
     * Enables raycaster.
     */
    enable(): void {

        if (!this.STATE) {

            this.STATE = true;

            window.renderer.domElement.addEventListener('mousemove', mouseMove, false);
            window.renderer.domElement.addEventListener('mousedown', mouseDown, false);
            window.renderer.domElement.addEventListener('mouseup', mouseUp, false);
        }
    };
    /**
     * @author Ricardo Delgado.
     * Disables raycaster.
     */
    disable(): void {

        if (this.STATE) {

            this.STATE = false;

            window.renderer.domElement.removeEventListener('mousemove', mouseMove, false);
            window.renderer.domElement.removeEventListener('mousedown', mouseDown, false);
            window.renderer.domElement.removeEventListener('mouseup', mouseUp, false);
        }
    };
    /**
     * @author Ricardo Delgado.
     * Intersect objects 
     * @param {String}
     */
    mouseMove(event: MouseEvent): void {

        event.preventDefault();
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        window.camera.getRayCast(this.rayCaster, this.mouse);
        let i = 0;

        if (this.SELECTED) {
            let intersects = this.rayCaster.intersectObject(this.plane);
            if (intersects.length > 0) {
                let position = intersects[0].point.sub(this.offset);
                this.POSITION = position;
                if (this.objectsCollision.length > 0) {
                    let collision = this.rayCaster.intersectObjects(this.objectsCollision, true);
                    if (collision.length > 0) {
                        if (this.COLLISION !== collision[0].object)
                            this.COLLISION = collision[0].object;
                    }
                    else {
                        this.COLLISION = null;
                    }
                }

                for (i = 0; i < this.functions.MOVE.length; i++) {
                    let action = this.functions.MOVE[i];
                    if (typeof (action) === 'function')
                        action(this.SELECTED, position);
                }
                this.container.style.cursor = this.styleMouse.MOVE;
            }
            else
                this.container.style.cursor = this.styleMouse.MOVE;
        }
        else {
            let intersects = this.rayCaster.intersectObjects(this.objects, true);

            if (intersects.length > 0) {
                if (this.INTERSECTED != intersects[0].object) {
                    this.INTERSECTED = intersects[0].object;
                    for (i = 0; i < this.functions.CROSS.length; i++) {
                        let action = this.functions.CROSS[i];
                        if (typeof (action) === 'function')
                            action();
                    }

                    if (this.INTERSECTED.parent) {
                        if (this.INTERSECTED.parent.type === "LOD")
                            this.plane.position.copy(this.INTERSECTED.parent.position);
                        else
                            this.plane.position.copy(this.INTERSECTED.position);
                    }
                    else
                        this.plane.position.copy(this.INTERSECTED.position);

                    if (this.INTERSECTED !== this.OPACITY) {
                        if (this.OPACITY)
                            this.OPACITY.material.opacity = 1;
                        this.OPACITY = this.INTERSECTED;
                        this.OPACITY.material.opacity = 0.8;
                    }

                    this.container.style.cursor = this.styleMouse.CROSS;
                }
            }
            else {
                this.INTERSECTED = null;

                if (this.OPACITY) {
                    this.OPACITY.material.opacity = 1;
                    this.OPACITY = null;
                }
                this.container.style.cursor = this.styleMouse.default;
            }
        }
    }
    /**
     * @author Ricardo Delgado.
     * 
     * @param {String}
     */
    mouseDown(event: MouseEvent): void {

        event.preventDefault();
        window.camera.getRayCast(this.rayCaster, this.mouse);

        let i = 0;
        let intersects = this.rayCaster.intersectObjects(this.objects, true);

        if (intersects.length > 0) {

            this.SELECTED = intersects[0].object;

            intersects = this.rayCaster.intersectObject(this.plane);

            if (intersects.length > 0) {
                this.offset.copy(intersects[0].point).sub(this.plane.position);
            }

            window.camera.disable();
            this.container.style.cursor = this.styleMouse.CLICK;
        }

        for (i = 0; i < this.functions.CLICK.length; i++) {

            let action = this.functions.CLICK[i];

            if (typeof (action) === 'function')
                action(this.SELECTED, event);
        }

    }
    /**
     * @author Ricardo Delgado.
     * 
     * @param {String}
     */
    mouseUp(event: MouseEvent): void {

        let i = 0;

        event.preventDefault();
        window.camera.enable();
        this.container.style.cursor = this.styleMouse.DROP;

        for (i = 0; i < this.functions.DROP.length; i++) {

            let action = this.functions.DROP[i];

            if (typeof (action) === 'function')
                action(this.SELECTED, this.INTERSECTED, this.COLLISION, this.POSITION);
        }

        if (this.INTERSECTED) {

            if (this.INTERSECTED.parent) {

                if (this.INTERSECTED.parent.type === "LOD")
                    this.plane.position.copy(this.INTERSECTED.parent.position);
                else
                    this.plane.position.copy(this.INTERSECTED.position);
            }
            else
                this.plane.position.copy(this.INTERSECTED.position);

            this.cleanObjects();
        }
    }
    /**
     * @author Ricardo Delgado.
     * 
     */
    resetStyleMouse(): void {

        this.styleMouse.CLICK = 'default';
        this.styleMouse.CROSS = 'pointer';
        this.styleMouse.MOVE = 'default';
        this.styleMouse.DROP = 'default';
    }
    /**
     * @author Ricardo Delgado.
     * 
     */
    cleanFunctions(): void {

        this.functions = {
            MOVE: new Array<any>(),
            CLICK: new Array<any>(),
            DROP: new Array<any>(),
            CROSS: new Array<any>(),
            COLLISION: new Array<any>()
        };
    }

    cleanObjects(): void {

        this.SELECTED = null;
        this.INTERSECTED = null;
        this.COLLISION = null;
    }
    /**
     * @author Ricardo Delgado.
     * 
     */
    reset(): void {
        this.cleanFunctions();
        this.resetStyleMouse();
        this.cleanObjects();
        this.objects = [];
        this.objectsCollision = [];
    }
}