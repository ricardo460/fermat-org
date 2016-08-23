/**
 * @author Emmanuel Colina
 * @lastmodifiedBy Miguel Celedon
 * function create a logo (wallet) and charge your textures
 */
class Logo {


    POSITION_Z = 35000;
    SCALE = 24;

    logo = this.createLogo(1000, 1000, "images/fermat_logo.png", new THREE.Vector3(0, 0, this.POSITION_Z));

    createLogo(width, height, texture, position) {

        let mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(width, height),
            new THREE.MeshBasicMaterial({ side: THREE.FrontSide, transparent: true, opacity: 0, color: 0xFFFFFF }));
        Helper.applyTexture(texture, mesh);

        mesh.scale.set(this.SCALE, this.SCALE, this.SCALE);
        mesh.position.copy(position);
        globals.scene.add(mesh);

        return mesh;
    }

    /**
     * Starts the logo fade animation
     * @param {Number} [duration=1000] The duration of the fade
     * @author Miguel Celedon
     */
    startFade(duration = 1500) {

        let _duration = duration || 1500;

        let tween1 = new TWEEN.Tween(this.logo.material)
            .to({ opacity: 1, needsUpdate: true }, _duration)
            .onUpdate(render);

        let tween2 = new TWEEN.Tween(this.logo.material)
            .to({ opacity: 0.05, needsUpdate: true }, _duration)
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
    stopFade(duration = 1000) {

        let _duration = duration || 1000;

        let tweenstop = new TWEEN.Tween(this.logo.material)
            .to({ opacity: 1, needsUpdate: true }, _duration)
            .onUpdate(render)
            .start();
    };
}
