function NetworkViewer() {
    
    var self = this;
    var globalScene = window.scene;
    var p2pScene = new THREE.Scene();
    var nodes = {};
    
    //TODO: Delete me
    this.nodes = nodes;
    
    this.load = function() {
        
        //Ask for nodes
        var networkNodes = window.testNetworkNodes;
        
        for(var i = 0; i < networkNodes.length; i++) {
            
            var sprite = createNode(networkNodes[i]);
            var position = new THREE.Vector3(
                Math.random() * 10000 - 5000,
                Math.random() * 10000 - 5000,
                Math.random() * window.MAX_DISTANCE - (window.MAX_DISTANCE / 2));
            
            sprite.position.copy(window.viewManager.translateToSection('network', position));
            sprite.scale.set(500, 500, 1.0);
            
            window.console.log("Sprite Z position: " + position.z);
            
            window.scene.add(sprite);
        }
    };
    
    this.unload = function() {
        
    };
    
    function createNode(nodeData) {
        
        var sprite = new THREE.Sprite(new THREE.SpriteMaterial({color : 0x000000}));
        var id = nodeData.id;

        sprite.userData = {
            id : id
            //TODO: set onClick()
        };

        nodes[id] = nodeData;
        nodes[id].sprite = sprite;
        
        return sprite;
    }
}