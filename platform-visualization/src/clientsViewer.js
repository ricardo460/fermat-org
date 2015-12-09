function ClientsViewer(parentNode) {
    
    BaseNetworkViewer.call(this);
    
    this.parentNode = parentNode;
    this.nodes = {};
    this.edges = [];
    this.NET_RADIOUS = 100;
}

ClientsViewer.prototype = Object.create(BaseNetworkViewer.prototype);
ClientsViewer.prototype.constructor = ClientsViewer;

/**
 * Creates a sprite representing a single node
 * @author Miguel Celedon
 * @param   {object}        nodeData      The data of the actual node
 * @param   {THREE.Vector3} startPosition The starting position of the node
 * @returns {Three.Sprite}  The sprite representing the node
 */
ClientsViewer.prototype.createNode = function(nodeData, startPosition) {

    var sprite = new THREE.Sprite(new THREE.SpriteMaterial({color : 0x0000ff}));
    var id = nodeData.id.toString();
    var position = window.viewManager.translateToSection('network', startPosition);

    sprite.userData = {
        id : id,
        originPosition : position,
        onClick : this.onNodeClick.bind(this)
    };

    sprite.position.copy(position);

    this.nodes[id] = nodeData;
    this.nodes[id].sprite = sprite;

    return sprite;
};

/**
 * Draws the nodes in the network
 * @author Miguel Celedon
 * @param {Array} networkNodes Array of nodes to draw
 */
ClientsViewer.prototype.drawNodes = function(networkNodes) {

    for(var i = 0; i < networkNodes.length; i++) {

        var position = new THREE.Vector3(
            (Math.random() * 2 - 1) * this.NET_RADIOUS,
            this.NET_RADIOUS / 2,
            ((Math.random() * 2 - 1) * this.NET_RADIOUS) - this.NET_RADIOUS);

        var sprite = this.createNode(networkNodes[i], position);

        sprite.scale.set(500, 500, 1.0);

        window.scene.add(sprite);
    }

    this.createEdges();
};

ClientsViewer.prototype.test_load = function() {
    
    var networkNodes = [];
    var NUM_NODES = 5;
    
    for(var i = 0; i < NUM_NODES; i++) {
        
        var node = {
            id : i,
            edges : [{id : this.parentNode.userData.id}]
        };
        
        networkNodes.push(node);
    }
    
    return networkNodes;
    
};