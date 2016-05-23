/**
 * Responsible for drawing the p2p network
 * @author Ricardo Delgado
 */
function DragManager() {

    var rayCaster = new THREE.Raycaster();

    this.objects = [];

    this.mouseMoveCallBack = null;
    this.mouseDownCallBack = null;
    this.MouseUpCallBack = null;

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
                new THREE.MeshBasicMaterial({visible: false,color: Math.random() * 0xffffff})
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

            var intersects = rayCaster.intersectObjects(self.objects, true);

            if (intersects.length > 0) {

                if(INTERSECTED != intersects[0].object){

                    INTERSECTED = intersects[0].object;

                    if(INTERSECTED.parent.type === "LOD"){
                        plane.position.copy(INTERSECTED.parent.position);
                       // INTERSECTED.parent.material.opacity = 0.5;
                    }
                    else{
                        plane.position.copy(INTERSECTED.position);
                        //INTERSECTED.material.opacity = 0.5;
                    }
                    
                }
                container.style.cursor = 'pointer';
            } 
            else{

                INTERSECTED = null;
                container.style.cursor = 'default';
                window.camera.enable();
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
            window.camera.disable();
            document.body.style.cursor = 'move';
        }
    }

    function mouseUp(event) {

        event.preventDefault();

        if (INTERSECTED){

            if(INTERSECTED.parent.type === "LOD"){
                plane.position.copy(INTERSECTED.parent.position);
                //INTERSECTED.parent.material.opacity = 1;
            }
            else{
                plane.position.copy(INTERSECTED.position);
               // INTERSECTED.material.opacity = 1;
            }

            SELECTED = null;
        }
        window.camera.enable();
        container.style.cursor = 'default';
    }

    this.test = function(){

        //self.objects = window.signLayer.getmesh();

        self.objects = [];

        for(var i = 0; i < window.tilesQtty.length; i++){

                var tile = window.helper.getSpecificTile(window.tilesQtty[i]).mesh;

                self.objects.push(tile);
        }

        window.camera.offFocus();

        self.mouseMoveCallBack = function(mesh, position){

            if(mesh.parent.type === "LOD")
                mesh.parent.position.copy(position);
            else
                mesh.position.copy(position);
        };
    }
}