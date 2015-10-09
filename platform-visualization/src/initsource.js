
/**
 * @author Emmanuel Colina
 * function init camera and renderer a logo
 */

function initsource()
{

	MIN_DISTANCE = 50,
	MAX_DISTANCE = 80000;

	renderSource = new THREE.WebGLRenderer({antialias : true, logarithmicDepthBuffer : true});

	sceneSource = new THREE.Scene();

	renderSource.setClearColor(0xffffff);

	renderSource.setSize(window.innerWidth ,window.innerHeight);
	renderSource.domElement.style.position = 'absolute';
	renderSource.domElement.id = 'idCanvas';

	document.getElementById('container').appendChild(renderSource.domElement);

	cameraSource = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, MAX_DISTANCE );

	cameraSource.position.z=1500

	sceneSource.add(cameraSource);

	creteSourceplanowallet();
	creteSourceplanofermat();
}


/**
 * @author Emmanuel Colina
 * function create a plane and textures (wallet)
 */

function creteSourceplanowallet(){

	planeGeometrysourcelogo = new THREE.PlaneGeometry(995, 700);

	loadTexturesourcelogo = new THREE.ImageUtils.loadTexture("images/walletlogo.png");
	loadTexturesourcelogo.minFilter = THREE.NearestFilter;

	meshSourcelogo = new THREE.MeshBasicMaterial({map:loadTexturesourcelogo,side:THREE.FrontSide,transparent: true, opacity: 0 , color:0xffffff});

	walletSorcelogo = new THREE.Mesh(planeGeometrysourcelogo,meshSourcelogo);

	walletSorcelogo.position.x = 0;
    walletSorcelogo.position.y = 230;
    walletSorcelogo.position.z = -200;

	sceneSource.add(walletSorcelogo);

	var _delay =  2000;

    tween1 = new TWEEN.Tween(walletSorcelogo.material)
    .to({ opacity : 1, needsUpdate : true}, 1000)
    .delay( _delay )
    
    tween2 = new TWEEN.Tween(walletSorcelogo.material)
    .to({ opacity : 0, needsUpdate : true}, 1000)
    .delay( _delay )

    tween1.chain(tween2);
    tween2.chain(tween1);

	tween1.start();
}

/**
 * @author Emmanuel Colina
 * function create a plane and textures (fermat)
 */

function creteSourceplanofermat(){

	planeGeometrysourcefermat = new THREE.PlaneGeometry(950, 300);

	loadTexturesourcefermat = new THREE.ImageUtils.loadTexture("images/fermatlogo.png");
	loadTexturesourcefermat.minFilter = THREE.NearestFilter;

	meshSourcefermat = new THREE.MeshBasicMaterial({map:loadTexturesourcefermat,side:THREE.FrontSide,transparent: true, opacity: 0 , color:0xffffff});

	fermatSorcelogo = new THREE.Mesh(planeGeometrysourcefermat,meshSourcefermat);

	fermatSorcelogo.position.x = 0;
    fermatSorcelogo.position.y = -310;
    fermatSorcelogo.position.z = -200;

	sceneSource.add(fermatSorcelogo);

	var _delay =  2000;

    tween1 = new TWEEN.Tween(fermatSorcelogo.material)
    .to({ opacity : 1, needsUpdate : true}, 1000)
    .delay( _delay )
    
    tween2 = new TWEEN.Tween(fermatSorcelogo.material)
    .to({ opacity : 0, needsUpdate : true}, 1000)
    .delay( _delay )

    tween1.chain(tween2);
    tween2.chain(tween1);

	tween1.start();
}

/**
 * @author Emmanuel Colina
 * function animate
 */

function animateSource(){

	requestAnimationFrame(animateSource);
	TWEEN.update();

	rendererSource();
}

/**
 * @author Emmanuel Colina
 * function renderer
 */

function rendererSource(){

	renderSource.render(sceneSource,cameraSource);
}

