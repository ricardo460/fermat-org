function ClientsViewer(parentNode) {
    
    BaseNetworkViewer.call(this);
    
    this.parentNode = parentNode;
    this.nodes = {};
    this.edges = [];
    this.NET_RADIOUS = 1000;
    this.childNetwork = null;
}

ClientsViewer.prototype = Object.create(BaseNetworkViewer.prototype);
ClientsViewer.prototype.constructor = ClientsViewer;

/**
 * @override
 * Executed when a node is clicked, moves the camera and draw its childs
 * @author Miguel Celedon
 * @param {object} clickedNode The clicked node
 */
ClientsViewer.prototype.onNodeClick = function(clickedNode) {
    
    if(this.childNetwork === null) {
        
        BaseNetworkViewer.prototype.onNodeClick.call(this, clickedNode);

        this.hideEdges(clickedNode.userData.id);
        this.hideNodes([clickedNode.userData.id]);
        //this.childNetwork = new ClientsViewer(clickedNode);
        this.childNetwork = {};
        
        this.open();
    }
};

/**
 * Draws the nodes in the network
 * @author Miguel Celedon
 * @param {Array} networkNodes Array of nodes to draw
 */
ClientsViewer.prototype.drawNodes = function(networkNodes) {

    for(var i = 0; i < networkNodes.length; i++) {

        var position = new THREE.Vector3(
            Math.random() * this.NET_RADIOUS,
            - this.NET_RADIOUS / 2,
            Math.random() * this.NET_RADIOUS);
        
        position.add(this.parentNode.position);

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

ClientsViewer.prototype.createEdges = function() {
    
    for(var nodeID in this.nodes) {
        
        var origin = this.nodes[nodeID].sprite.position;
        var dest = this.parentNode.position;
        
        var lineGeo = new THREE.Geometry();
        lineGeo.vertices.push(origin, dest);

        var line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({color : 0x0000ff}));
        line.visible = false;

        scene.add(line);
        
        this.edges.push({
            from : nodeID,
            to : this.parentNode.userData.id,
            line : line
        });
    }
    
    this.showEdges();
    
    //Not needed now
    //BaseNetworkViewer.prototype.createEdges.call(this);
};

/**
 * Hide edges except the one connecting to the parent
 * @author Miguel Celedon
 * @param {string} clickedID The ID of the clicked node to except its edge hiding
 */
ClientsViewer.prototype.hideEdges = function(clickedID) {
    
    var edgeID = this.edgeExists(this.parentNode.userData.id, clickedID);
    
    BaseNetworkViewer.prototype.hideEdges.call(this, [edgeID]);
    
};

/**
 * Closes and unloads the child, if the child is open, closes it
 * @author Miguel Celedon
 * @returns {object} The reference to itself, if there was no children I'll return null
 */
ClientsViewer.prototype.closeChild = function() {
    
    var self = null;
    
    if(this.childNetwork !== null){
        
        //TODO: Change for a call to childNetwork.closeChild() to keep the chain
        this.childNetwork = null;
        
        self = this;
        
        //If direct child is closed, show its brothers
        if(this.childNetwork === null)
            this.reset();
    }
    else {
        this.close();
        this.unload();
    }
    
    return self;
    
};