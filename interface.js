/*global THREE*/
//onkeydown="changeState(event);" onkeyup="keyUp(event);" onload="init();"


//Constants
var CAM_SPEED = 0.05;
var INFLUENCE_RADIOUS = 1;
var CAM_ROTATION = 0.002;


//Variables
//May them be in closure?
var keyStates = {
    W : false,
    A : false,
    S : false,
    D : false,
    SPACE : false,
    Z : false,
    Mouse_Click : false
};

var cameraVectors = {
    frontBack : new THREE.Vector3(0,0,-1),
    rightLeft : new THREE.Vector3(-1,0,0),
    upDown : new THREE.Vector3(0,1,0)
};  

var scene;
var camera;
var renderer;
var nodes = [];
var lastSelectedNode = null;    //Can be in closure
var lastPosition = new THREE.Vector2(); //Can be in closure
//var mouse; It's not necesary to be global... yet

var init = function () {
    
    var container = document.getElementById("container"); //document.createElement('div');
    
    //Get Test Data
    crawler.fill();
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 100);
    renderer = new THREE.WebGLRenderer();
    raycaster = new THREE.Raycaster();
    
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);
    document.body.appendChild(container);

    camera.position.z = 5;
    camera.rotation.set(0, 0, 0);
    camera.rotation.order = 'YXZ';
    
    scene.add(camera);
    create3DNodes(crawler.graph);
    animate();
};

var animate = function () {
    requestAnimationFrame( animate );
    
    //Move camera along its vectors
    if(keyStates.W) camera.translateOnAxis(cameraVectors.frontBack, CAM_SPEED);
    if(keyStates.S) camera.translateOnAxis(cameraVectors.frontBack, -CAM_SPEED);
    if(keyStates.A) camera.translateOnAxis(cameraVectors.rightLeft, CAM_SPEED);
    if(keyStates.D) camera.translateOnAxis(cameraVectors.rightLeft, -CAM_SPEED);
    if(keyStates.Z) camera.translateOnAxis(cameraVectors.upDown, -CAM_SPEED);
    if(keyStates.SPACE) camera.translateOnAxis(cameraVectors.upDown, CAM_SPEED);
    
    camera.updateProjectionMatrix();
    
    render();
};

var render = function () {
    renderer.render(scene, camera);
};

var create3DNodes = function (newNodes) {
    
    var infStack = [];
    var influence = new THREE.Vector3(0, 0, 0);
    
    for(i = 0; i < newNodes.length; i++) {
        
        var x = Math.random() * influence.x + INFLUENCE_RADIOUS;
        var y = Math.random() * influence.y + INFLUENCE_RADIOUS;
        var z = Math.random() * influence.z + INFLUENCE_RADIOUS;
        
        var geo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        var mat = new THREE.MeshBasicMaterial({color : 0xff0000});
        
        var newNode = new THREE.Mesh(geo, mat);
        newNode.position.x = x;
        newNode.position.y = y;
        newNode.position.z = z;
        
        influence.x = x;
        influence.y = y;
        influence.z = z;
        
        scene.add(newNode);
        nodes.push(newNode);
    }
    
};


/* Events */
var onKeyDown = function (e) {
    //alert(e.keyCode);
    
    switch(e.keyCode) {
        case 87: //W
            keyStates.W = true;
            break;
        case 83: //S
            keyStates.S = true;
            break;
        case 65: //A
            keyStates.A = true;
            break;
        case 68: //D
            keyStates.D = true;
            break;
        case 32: //SPACE
            keyStates.SPACE = true;
            break;
        case 90: //Z
            keyStates.Z = true;
            break;
        default:
            break;
    }
};

var onKeyUp = function (e) {
    
    switch(e.keyCode) {
        case 87: //W
            keyStates.W = false;
            break;
        case 83: //S
            keyStates.S = false;
            break;
        case 65: //A
            keyStates.A = false;
            break;
        case 68: //D
            keyStates.D = false;
            break;
        case 32: //SPACE
            keyStates.SPACE = false;
            break;
        case 90: //Z
            keyStates.Z = false;
            break;
        default:
            break;
    }
};

var onMouseDown = function (e) {
    
    keyStates.Mouse_Click = true;
    
    var mouse = new THREE.Vector3(0, 0, 20);
    var raycaster = new THREE.Raycaster();
    
    //Obtain normalized click location (-1...1)
    mouse.x = ((e.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width) * 2 - 1;
    mouse.y = - ((e.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1;
    
    
    //Select an object and highlight it
    if(lastSelectedNode != null)
        lastSelectedNode.object.material.color.setHex(0xff0000);
    
    raycaster.setFromCamera(mouse, camera);
    
    var intersect = raycaster.intersectObjects(nodes);
    
    if(intersect.length > 0) {
        intersect[0].object.material.color.setHex(0x0000ff);
    
        lastSelectedNode = intersect[0];
    }
    
    
    //DEBUG DATA
    //document.getElementById("deltas").innerHTML = "X = " + mouse.x + "; Y = " + mouse.y + "; Z = " + raycaster.ray.origin.z;
    var mat = new THREE.LineBasicMaterial({color : 0xffffff});
    var g = new THREE.Geometry();
    var r = raycaster.ray;
    var dest = new THREE.Vector3(r.origin.x + r.direction.x * 5, r.origin.y + r.direction.y * 5, r.origin.z + r.direction.z * 5);
    
    g.vertices.push( r.origin, dest);
    
    var line = new THREE.Line(g, mat);
    
    scene.add(line);
    
};

var onMouseMove = function(e) {
    
    var deltaX = e.clientX - lastPosition.x;
    var deltaY = e.clientY - lastPosition.y;
        
    if(keyStates.Mouse_Click){
        //e.preventDefault();
        
        //yawObject.rotation.y -= deltaX * CAM_ROTATION;
        //pitchObject.rotation.x -= deltaY * CAM_ROTATION;
        
        //pitchObject.rotation.x = Math.max( - Math.PI / 2, Math.min(Math.PI / 2, pitchObject.rotation.x));
        
        camera.rotation.y -= deltaX * CAM_ROTATION;
        camera.rotation.x -= deltaY * CAM_ROTATION;
        
        camera.updateProjectionMatrix();
        
    }
    
    lastPosition.x = e.clientX;
    lastPosition.y = e.clientY;
};

var onMouseUp = function() {
    
    keyStates.Mouse_Click = false;
    //lastPosition.x = 0;
    //lastPosition.y = 0;
};

var updateCameraVectors = function () {
    cameraVectors.frontBack.applyAxisAngle(new THREE.Vector3(1,0,0), camera.rotation.x); //Pitch
    cameraVectors.rightLeft.applyAxisAngle(new THREE.Vector3(0,1,0), camera.rotation.y); //Yaw
    cameraVectors.upDown.applyAxisAngle(new THREE.Vector3(0,0,1), camera.rotation.z); //Roll
};

/* Event listeners */
//document.body.addEventListener('keyDown', onKeyDown);
//document.body.addEventListener('keyUp', onKeyUp);
container.addEventListener("mousedown", onMouseDown);
container.addEventListener("mouseup", onMouseUp);
container.addEventListener("mousemove", onMouseMove);