var NET_RADIOUS = 0;

function BaseNetworkViewer() {
    
    this.nodes = {};
    this.edges = [];
    this.self = this;
    
}

BaseNetworkViewer.prototype = {

    /**
     * Loads the node data
     * @author Miguel Celedon
     */
    load : function() {

        //Ask for nodes
        var networkNodes = this.test_load();

        NET_RADIOUS = 1000 * networkNodes.length;

        this.drawNodes(networkNodes);

        this.configureCamera();
    },

    /**
     * Deletes all data loaded to free memory
     * @author Miguel Celedon
     */
    unload : function() {

        for(var node in this.nodes)
            scene.remove(this.nodes[node].sprite);
        this.nodes = {};

        for(var i = 0; i < this.edges.length; i++)
            scene.remove(this.edges[i].line);
        this.edges = [];

    },

    /**
     * Redraws everything
     * @author Miguel Celedon
     */
    reset : function() {

        this.showEdges();
        this.showNodes();
    },

    /**
     * Set the camera transition to get closer to the graph
     * @author Miguel Celedon
     */
    configureCamera : function() {

        var position = window.viewManager.translateToSection('network', new THREE.Vector3(0,0,0));
        setTimeout(function() {
            window.camera.move(position.x, position.y, NET_RADIOUS, 2000);
        }, 5000);

        setTimeout(function() {
            this.setCameraTarget();
        }, 7500);
    },

    /**
     * Sets the camera to target the center of the network
     * @author Miguel Celedon
     */
    setCameraTarget : function() {

        var position = window.camera.getPosition();

        window.camera.setTarget(new THREE.Vector3(position.x, position.y, -NET_RADIOUS), 1);
    },

    /**
     * Draws the nodes in the network
     * @author Miguel Celedon
     * @param {Array} networkNodes Array of nodes to draw
     */
    drawNodes : function(networkNodes) {

        for(var i = 0; i < networkNodes.length; i++) {

            var position = new THREE.Vector3(
                (Math.random() * 2 - 1) * NET_RADIOUS,
                (Math.random() * 2 - 1) * NET_RADIOUS,
                ((Math.random() * 2 - 1) * NET_RADIOUS) - NET_RADIOUS);

            var sprite = this.createNode(networkNodes[i], position);

            sprite.scale.set(500, 500, 1.0);

            window.scene.add(sprite);
        }

        this.createEdges();
    },

    /**
     * Creates a sprite representing a single node
     * @author Miguel Celedon
     * @param   {object}        nodeData      The data of the actual node
     * @param   {THREE.Vector3} startPosition The starting position of the node
     * @returns {Three.Sprite}  The sprite representing the node
     */
    createNode : function(nodeData, startPosition) {

        var sprite = new THREE.Sprite(new THREE.SpriteMaterial({color : 0x000000}));
        var id = nodeData.id.toString();
        var position = window.viewManager.translateToSection('network', startPosition);

        sprite.userData = {
            id : id,
            originPosition : position,
            onClick : this.onNodeClick
        };

        sprite.position.copy(position);

        this.nodes[id] = nodeData;
        this.nodes[id].sprite = sprite;

        return sprite;
    },

    /**
     * Shows the network nodes
     * @author Miguel Celedon
     */
    showNodes : function() {

        for(var nodeID in this.nodes) {
            this.nodes[nodeID].sprite.visible = true;
        }
    },

    /**
     * Hide all nodes
     * @author Miguel Celedon
     * @param {Array} excludedIDs Array of IDs that will be kept visible
     */
    hideNodes : function(excludedIDs) {

        for(var nodeID in this.nodes) {

            if(!excludedIDs.includes(nodeID)) {

                this.nodes[nodeID].sprite.visible = false;
            }
        }
    },

    /**
     * Draws all adjacencies between the nodes
     * @author Miguel Celedon
     */
    createEdges : function() {

        for(var nodeID in this.nodes) {

            var origin, dest;
            var node = this.nodes[nodeID];

            origin = node.sprite.position;

            for(var i = 0; i < node.edges.length; i++) {

                var actualEdge = node.edges[i];

                if(this.nodes.hasOwnProperty(actualEdge.id) && !this.edgeExists(nodeID, actualEdge.id)) {

                    dest = this.nodes[actualEdge.id].sprite.position;

                    var lineGeo = new THREE.Geometry();
                    lineGeo.vertices.push(origin, dest);

                    var line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({color : 0x000000}));
                    line.visible = false;

                    scene.add(line);
                    this.edges.push({
                        from : nodeID,
                        to : actualEdge.id,
                        line : line
                    });
                }
            }
        }

        this.showEdges();
    },

    /**
     * Show the edges
     * @author Miguel Celedon
     */
    showEdges : function() {

        var duration = 2000;

        for(var i = 0; i < this.edges.length; i++) {
            this.edges[i].line.visible = true;
        }
    },

    /**
     * Hides the edges
     * @author Miguel Celedon
     */
    hideEdges : function() {

        var duration = 2000;

        for(var i = 0; i < this.edges.length; i++) {
            this.edges[i].line.visible = false;
        }
    },

    /**
     * Checks if an edge alreedges exists
     * @author Miguel Celedon
     * @param   {string}  from ID of one node
     * @param   {string}  to   ID of the other node
     * @returns {boolean} true if the edge exists, false otherwise
     */
    edgeExists : function(from, to) {

        for(var i = 0; i < this.edges; i++) {
            var edge = this.edges[i];

            if((edge.from === from && edge.to === to) || (edge.to === from && edge.from === to)) return true;
        }

        return false;
    },

    test_load : function() {

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
    },

    /**
     * To be executed when a nodes is clicked
     * @author Miguel Celedon
     * @param {object} clickedNode The clicked node
     */
    onNodeClick : function(clickedNode) {

        var goalPosition = new THREE.Vector3(0, -2500, 9000);
        goalPosition.add(clickedNode.position);

        window.camera.move(goalPosition.x, goalPosition.y, goalPosition.z, 2000);

        goalPosition.z -= 9000;
        window.camera.setTarget(goalPosition, 1000);

        this.self.hideEdges();
        this.self.hideNodes([clickedNode.userData.id]);
    }
};