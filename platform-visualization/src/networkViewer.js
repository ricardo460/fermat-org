function NetworkViewer() {
    
    BaseNetworkViewer.call(this);
    
    this.childNetwork = null;
}

NetworkViewer.prototype = Object.create(BaseNetworkViewer.prototype);
NetworkViewer.prototype.constructor = NetworkViewer;

/**
 * @override
 * Loads the data and configures camera
 * @author Miguel Celedon
 */
NetworkViewer.prototype.load = function() {
    
    BaseNetworkViewer.prototype.load.call(this);
    
    this.configureCamera();
};

/**
 * @override
 * Unloads and undraws everything and closes its children
 * @author Miguel Celedon
 */
NetworkViewer.prototype.unload = function() {
    
    if(this.childNetwork) {
        
        this.close();
    }
    
    BaseNetworkViewer.prototype.unload.call(this);
    
};

/**
 * @override
 * To be executed when a nodes is clicked
 * @author Miguel Celedon
 * @param {object} clickedNode The clicked node
 */
NetworkViewer.prototype.onNodeClick = function(clickedNode) {
    
    if(this.childNetwork === null) {
        
        BaseNetworkViewer.prototype.onNodeClick.call(this, clickedNode);

        this.hideEdges();
        this.hideNodes([clickedNode.userData.id]);
        this.childNetwork = new ClientsViewer(clickedNode);
        
        this.open();
    }
};

/**
 * @override
 * Called when the function needs to show its details
 * @author Miguel Celedon
 */
NetworkViewer.prototype.open = function() {
    
    this.childNetwork.load();
    
};

/**
 * @override
 * Called when needed to hide the details
 * @author Miguel Celedon
 */
NetworkViewer.prototype.close = function() {
    
    if(this.childNetwork !== null) {
        
        this.childNetwork.close();
        this.childNetwork.unload();
        this.childNetwork = null;
    }
};

/**
 * @override
 * Draws the nodes in the network
 * @author Miguel Celedon
 * @param {Array} networkNodes Array of nodes to draw
 */
NetworkViewer.prototype.drawNodes = function(networkNodes) {

    for(var i = 0; i < networkNodes.length; i++) {

        var position = new THREE.Vector3(
            (Math.random() * 2 - 1) * this.NET_RADIOUS,
            (Math.random() * 2 - 1) * this.NET_RADIOUS,
            ((Math.random() * 2 - 1) * this.NET_RADIOUS) - this.NET_RADIOUS);
        
        position = window.viewManager.translateToSection('network', position);

        var sprite = this.createNode(networkNodes[i], position);

        sprite.scale.set(500, 500, 1.0);
        
        window.console.log("Sprite Z position: " + position.z);

        window.scene.add(sprite);
    }

    this.createEdges();
};

/**
 * @override
 * Set the camera transition to get closer to the graph
 * @author Miguel Celedon
 */
NetworkViewer.prototype.configureCamera = function() {
    
    var self = this;
    var position = window.viewManager.translateToSection('network', new THREE.Vector3(0,0,0));
    setTimeout(function() {
        window.camera.move(position.x, position.y, self.NET_RADIOUS, 2000);
    }, 5000);

    setTimeout(function() {
        self.setCameraTarget();
    }, 7500);
};

NetworkViewer.prototype.test_load = function() {
    
    var networkNodes = [];
    var NUM_NODES = 25,
        MAX_CONNECTIONS = 10;

    for(var i = 0; i < NUM_NODES; i++) {

        var node = {
            id : i,
            edges : []
        };

        var connections = Math.floor(Math.random() * MAX_CONNECTIONS);

        for(var j = 0; j < connections; j++) {

            node.edges.push({
                id : Math.floor(Math.random() * NUM_NODES)
            });
        }

        networkNodes.push(node);
    }

    return networkNodes;
};

/**
 * @override
 * Resets the network and unload its children
 * @author Miguel Celedon
 */
NetworkViewer.prototype.reset = function() {
    
    BaseNetworkViewer.prototype.reset.call(this);
    
    this.close();
};

/**
 * Closes and unloads the child, if the child is open, closes it
 * @author Miguel Celedon
 * @returns {object} The reference to itself, if there was no children I'll return null
 */
NetworkViewer.prototype.closeChild = function() {
    
    var self = null;
    
    if(this.childNetwork !== null) {
        this.childNetwork = this.childNetwork.closeChild();
        self = this;
    }
    else {
        this.reset();
    }
    
    return self;
};