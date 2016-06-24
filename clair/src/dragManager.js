/**
 * @author Ricardo Delgado
 */
function DragManager() {

    var rayCaster = new THREE.Raycaster();

    this.objects = [];
    this.objectsCollision = [];

    this.functions = {
            MOVE : [],
            CLICK : [],
            DROP : [],
            COLLISION :[],
            CROSS : []
        };

    this.styleMouse = {
            MOVE : 'default',
            CLICK : 'default',
            DROP : 'default',
            CROSS : 'pointer',
            default : 'default' 
        };

    var self = this;

    var POSITION = null;

    var mouse = new THREE.Vector2(),
        offset = new THREE.Vector3(),
        container = document.getElementById('container'),
        INTERSECTED = null,
        COLLISION = null,
        OPACITY = null,
        SELECTED = null,
        plane = null,
        STATE = false;

    init();

    function init(){

        plane = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(MAX_DISTANCE * 1.5, MAX_DISTANCE * 0.5),
                new THREE.MeshBasicMaterial({visible: false,color: Math.random() * 0xffffff})
            );

        window.scene.add(plane);
    }

    this.on = function(){

        if(!STATE){ 
            window.renderer.domElement.addEventListener('mousemove', mouseMove, false);
            window.renderer.domElement.addEventListener('mousedown', mouseDown, false);
            window.renderer.domElement.addEventListener('mouseup', mouseUp, false);
        }
    };

    this.off = function(){

        if(STATE){ 
            window.renderer.domElement.removeEventListener('mousemove', mouseMove, false);
            window.renderer.domElement.removeEventListener('mousedown', mouseDown, false);
            window.renderer.domElement.removeEventListener('mouseup', mouseUp, false);
        }
    };

    function mouseMove(event) {

        event.preventDefault();

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        window.camera.getRayCast(rayCaster, mouse);

        var i = 0;

        if(SELECTED){ 

            var intersects = rayCaster.intersectObject(plane);

            if (intersects.length > 0) {

                var position = intersects[0].point.sub(offset);

                POSITION = position;

                if(self.objectsCollision.length > 0){ 

                    var collision = rayCaster.intersectObjects(self.objectsCollision, true);

                    if(collision.length > 0) {

                        if(COLLISION !== collision[0].object)
                            COLLISION = collision[0].object;
                    }
                    else{ 
                        COLLISION = null;
                    }

                }

                for(i = 0; i < self.functions.MOVE.length; i++){

                    var action = self.functions.MOVE[i];

                    if(typeof(action) === 'function')
                        action(SELECTED, position);
                }
        

                container.style.cursor = self.styleMouse.MOVE;
            }
            else
                container.style.cursor = self.styleMouse.MOVE;
        }
        else{ 

            var intersects = rayCaster.intersectObjects(self.objects, true);

            if (intersects.length > 0) {

                if(INTERSECTED != intersects[0].object){

                    INTERSECTED = intersects[0].object;

                    for(i = 0; i < self.functions.CROSS.length; i++){

                        var action = self.functions.CROSS[i];

                        if(typeof(action) === 'function')
                            action();
                    }

                    if(INTERSECTED.parent.type === "LOD")
                        plane.position.copy(INTERSECTED.parent.position);
                    else
                        plane.position.copy(INTERSECTED.position);

                    if(INTERSECTED !== OPACITY){

                        if(OPACITY)
                            OPACITY.material.opacity = 1;

                        OPACITY = INTERSECTED;

                        OPACITY.material.opacity = 0.8; 
                    } 

                    container.style.cursor = self.styleMouse.CROSS;
                }
            } 
            else{

                INTERSECTED = null;

                if(OPACITY){
                    OPACITY.material.opacity = 1;
                    OPACITY = null;
                }

                container.style.cursor = self.styleMouse.default;

                //window.camera.enable();
            }
        }
    }

    function mouseDown(event) { 

        event.preventDefault();

        window.camera.getRayCast(rayCaster, mouse);

        var i = 0;

        var intersects = rayCaster.intersectObjects(self.objects);

        if (intersects.length > 0) {

            SELECTED = intersects[0].object;

            var intersects = rayCaster.intersectObject(plane);

            if (intersects.length > 0){
                offset.copy(intersects[0].point).sub(plane.position);
            }

            window.camera.disable();

            container.style.cursor = self.styleMouse.CLICK;
        }

        for(i = 0; i < self.functions.CLICK.length; i++){

            var action = self.functions.CLICK[i];

            if(typeof(action) === 'function')
                action(SELECTED);
        }
    }

    function mouseUp(event) { 

        var i = 0;

        event.preventDefault();

        window.camera.enable();

        container.style.cursor = self.styleMouse.DROP;

        for(i = 0; i < self.functions.DROP.length; i++){

            var action = self.functions.DROP[i];

            if(typeof(action) === 'function')
                action(SELECTED, INTERSECTED, COLLISION, POSITION);
        }

        if(INTERSECTED){

            if(INTERSECTED.parent.type === "LOD")
                plane.position.copy(INTERSECTED.parent.position);
            else
                plane.position.copy(INTERSECTED.position);

            SELECTED = null;
            INTERSECTED = null;
            COLLISION = null;
        }
    }

    function resetStyleMouse(){

        self.styleMouse.CLICK = 'default';
        self.styleMouse.CROSS = 'pointer';
        self.styleMouse.MOVE = 'default';
        self.styleMouse.DROP = 'default';
    }

    function cleanFunctions(){

        self.functions = {
            MOVE : [],
            CLICK : [],
            DROP : [],
            CROSS : []
        };
    }

    this.reset = function(){
        SELECTED = null;
        INTERSECTED = null;
        COLLISION = null;
        cleanFunctions();
        resetStyleMouse();
        self.objects = [];
        self.objectsColision = [];
    }
}