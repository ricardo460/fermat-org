/**
 * Responsible for drawing the p2p network
 * @author Ricardo Delgado
 */
function DragManager() {

    var rayCaster = new THREE.Raycaster();

    this.objects = [];

    this.mouseMoveCallBack = function(){};
    this.mouseDownCallBack = function(){};
    this.MouseUpCallBack = function(){};

    var self = this;

    var mouse = new THREE.Vector2(),
        offset = new THREE.Vector3(),
        container = document.getElementById('container'),
        INTERSECTED = null,
        SELECTED = null,
        plane = null;

    init();

    function init(){

        plane = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(MAX_DISTANCE * 1.5, MAX_DISTANCE * 0.5),
                new THREE.MeshBasicMaterial({visible: false})
            );

        window.scene.add(plane);
    }

    this.on = function(){
        window.renderer.domElement.addEventListener('mousemove', mouseMove, false);
        window.renderer.domElement.addEventListener('mousedown', mouseDown, false);
        window.renderer.domElement.addEventListener('mouseup', mouseUp, false);
    };

    this.off = function(){
        window.renderer.domElement.removeEventListener('mousemove', mouseMove, false);
        window.renderer.domElement.removeEventListener('mousedown', mouseDown, false);
        window.renderer.domElement.removeEventListener('mouseup', mouseUp, false);
    }

    function mouseMove(event) {

        event.preventDefault();

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        window.camera.getRayCast(rayCaster, mouse);

        if (SELECTED) {
            var intersects = rayCaster.intersectObject(plane);
            if (intersects.length > 0) {

                if(typeof(self.mouseMoveCallBack) === 'function'){ 

                    var position = intersects[0].point.sub(offset);

                    self.mouseMoveCallBack(SELECTED, position);
                }
            }
        }
        else{ 

            var intersects = rayCaster.intersectObjects(self.objects);

            if (intersects.length > 0) {

                if (INTERSECTED != intersects[0].object) {

                    INTERSECTED = intersects[0].object;

                    plane.position.copy(INTERSECTED.position);
                }

                container.style.cursor = 'pointer';
            } 
            else{

                INTERSECTED = null;
                container.style.cursor = 'default';
            }
        }
    }

    function mouseDown( event ) {

        event.preventDefault();

        window.camera.getRayCast(rayCaster, mouse);

        var intersects = rayCaster.intersectObjects(self.objects);

        if (intersects.length > 0) {

            SELECTED = intersects[0].object;

            var intersects = rayCaster.intersectObject(plane);

            if (intersects.length > 0){
                offset.copy(intersects[0].point).sub(plane.position);
            }

            document.body.style.cursor = 'move';
        }
    }

    function mouseUp(event) {

        event.preventDefault();

        if (INTERSECTED){
            plane.position.copy(INTERSECTED.position);
            SELECTED = null;
        }

        container.style.cursor = 'default';
    }

    this.test = function(){

        self.objects = [];

        for(var i = 0; i < window.tilesQtty.length; i++){

                var tile = window.helper.getSpecificTile(window.tilesQtty[i]).mesh;

                self.objects.push(tile);
        }

        /*self.mouseMoveCallBack = function(mesh, position){
            mesh.position.copy(position);
        };*/

    }
}