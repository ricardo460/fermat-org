function NetworkViewer() {
    
    var self = this;
    var globalScene = window.scene;
    var p2pScene = new THREE.Scene();
    var nodes = {};
    var nodeEdges = [];
    
    var NET_RADIOUS = 0;
    
    //TODO: Delete me
    this.nodes = nodes;
    this.nodeEdges = nodeEdges;
    
    /**
     * Loads the node data
     * @author Miguel Celedon
     */
    this.load = function() {
        
        //Ask for nodes
        var networkNodes = test_load();
        
        NET_RADIOUS = 1000 * networkNodes.length;
        
        drawNodes(networkNodes);
        
        self.configureCamera();
    };
    
    /**
     * Deletes all data loaded to free memory
     * @author Miguel Celedon
     */
    this.unload = function() {
        
        for(var node in nodes)
            scene.remove(nodes[node].sprite);
        nodes = {};
        
        for(var i = 0; i < nodeEdges.length; i++)
            scene.remove(nodeEdges[i].line);
        nodeEdges = [];
        
    };
    
    /**
     * Set the camera transition to get closer to the graph
     * @author Miguel Celedon
     */
    this.configureCamera = function() {
        
        var position = window.viewManager.translateToSection('network', new THREE.Vector3(0,0,0));
        setTimeout(function() { window.camera.move(position.x, position.y, NET_RADIOUS, 2000); }, 5000);
        
        setTimeout(function() { self.setCameraTarget(); window.alert("View Set."); }, 7500);
    };
    
    /**
     * Sets the camera to target the center of the network
     * @author Miguel Celedon
     */
    this.setCameraTarget = function() {
        
        var position = window.camera.getPosition();
        
        window.camera.setTarget(new THREE.Vector3(position.x, position.y, -NET_RADIOUS), 1);
    };
    
    /**
     * Draws the nodes in the network
     * @author Miguel Celedon
     * @param {Array} networkNodes Array of nodes to draw
     */
    function drawNodes(networkNodes) {
        
        for(var i = 0; i < networkNodes.length; i++) {
            
            var position = new THREE.Vector3(
                (Math.random() * 2 - 1) * NET_RADIOUS,
                (Math.random() * 2 - 1) * NET_RADIOUS,
                ((Math.random() * 2 - 1) * NET_RADIOUS) - NET_RADIOUS);
            
            var sprite = createNode(networkNodes[i], position);
            
            sprite.scale.set(500, 500, 1.0);
            
            window.console.log("Sprite Z position: " + position.z);
            
            window.scene.add(sprite);
        }
        
        drawAdy();
    }
    
    /**
     * Creates a sprite representing a single node
     * @author Miguel Celedon
     * @param   {object}        nodeData      The data of the actual node
     * @param   {THREE.Vector3} startPosition The starting position of the node
     * @returns {Three.Sprite}  The sprite representing the node
     */
    function createNode(nodeData, startPosition) {
        
        var sprite = new THREE.Sprite(new THREE.SpriteMaterial({color : 0x000000}));
        var id = nodeData.id;
        var position = window.viewManager.translateToSection('network', startPosition);

        sprite.userData = {
            id : id,
            originPosition : position,
            onClick : onNodeClick
        };

        sprite.position.copy(position);
            
        nodes[id] = nodeData;
        nodes[id].sprite = sprite;
        
        return sprite;
    }
    
    /**
     * Draws all adyacencies between the nodes
     * @author Miguel Celedon
     */
    function drawAdy() {
        
        for(var nodeID in nodes) {
            
            var origin, dest;
            var node = nodes[nodeID];
                
            origin = node.sprite.position;

            for(var i = 0; i < node.ady.length; i++) {

                var ady = node.ady[i];
                
                if(nodes.hasOwnProperty(ady.id) && !edgeExists(nodeID, ady.id)) {
                    
                    dest = nodes[ady.id].sprite.position;
                    
                    var lineGeo = new THREE.Geometry();
                    lineGeo.vertices.push(origin, dest);
                    
                    var line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({color : 0x000000}));
                    
                    scene.add(line);
                    nodeEdges.push({
                        from : nodeID,
                        to : ady.id,
                        line : line
                    });
                }
            }
        }
    }
    
    /**
     * Checks if an edge already exists
     * @author Miguel Celedon
     * @param   {string}  from ID of one node
     * @param   {string}  to   ID of the other node
     * @returns {boolean} true if the edge exists, false otherwise
     */
    function edgeExists(from, to) {
        
        for(var i = 0; i < nodeEdges; i++) {
            var edge = nodeEdges[i];
            
            if((edge.from === from && edge.to === to) || (edge.to === from && edge.from === to)) return true;
        }
        
        return false;
    }
    
    function test_load() {
        
        var networkNodes = [];
        var NUM_NODES = 25,
            MAX_CONNECTIONS = 10;
        
        for(var i = 0; i < NUM_NODES; i++) {
            
            var node = {
                id : i,
                ady : []
            };
            
            var connections = Math.floor(Math.random() * MAX_CONNECTIONS);
            
            for(var j = 0; j < connections; j++) {
                
                node.ady.push({
                    id : Math.floor(Math.random() * NUM_NODES)
                });
            }
            
            networkNodes.push(node);
        }
        
        return networkNodes;
    }
    
    /**
     * To be executed when a nodes is clicked
     * @author Miguel Celedon
     * @param {object} clickedNode The clicked node
     */
    function onNodeClick(clickedNode) {
        
        var nodePosition = clickedNode.position;
        window.camera.move(nodePosition.x, nodePosition.y, nodePosition.z + 1000, 2000);
        window.camera.setTarget(nodePosition, 1000);
    }
}