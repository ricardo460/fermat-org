/**
 * @author Emmanuel Colina
 * @lastmodifiedBy Miguel Celedon
 * function create a logo (wallet) and charge your textures
 */
function Logo(){
    
    var self = this;

    var POSITION_Z = 35000,
        SCALE = 24;
    
    var logo = createLogo(1000, 1000, "images/fermat_logo.png", new THREE.Vector3(0, 0, POSITION_Z));
    this.logo = logo;
    
    function createLogo(width, height, texture, position) {
        
        var mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(width, height),
            new THREE.MeshBasicMaterial({ side: THREE.FrontSide, transparent : true, opacity : 0, color : 0xFFFFFF}));
        helper.applyTexture(texture, mesh);
        
        mesh.scale.set(SCALE, SCALE, SCALE);
        mesh.position.copy(position);
        scene.add(mesh);
        
        return mesh;
    }
    
    /**
     * Starts the logo fade animation
     * @param {Number} [duration=1000] The duration of the fade
     * @author Miguel Celedon
     */
    this.startFade = function(duration) {
        
        var _duration = duration || 1500;

        var tween1 = new TWEEN.Tween(logo.material)
        .to({ opacity : 1, needsUpdate : true}, _duration)
        .onUpdate(render);
        
        var tween2 = new TWEEN.Tween(logo.material)
        .to({ opacity : 0.05, needsUpdate : true}, _duration)
        .onUpdate(render);

        tween1.chain(tween2);
        tween2.chain(tween1);

        tween1.start();
    };
    
    /**
     * Stops the fade animation
     * @param {Number} [duration=1000] The duration of the fade
     * @author Miguel Celedon
     */
    this.stopFade = function(duration) {
        
        var _duration = duration || 1000;

        var tweenstop = new TWEEN.Tween(logo.material)
        .to({ opacity : 1, needsUpdate : true}, _duration)
        .onUpdate(render)
        .start();
    };
}
