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
    
    this.load = function() {
        
        //Ask for nodes
        var networkNodes = test_load();
        
        NET_RADIOUS = 1000 * networkNodes.length;
        
        drawNodes(networkNodes);
        
        configureCamera();
    };
    
    this.unload = function() {
        
        for(var node in nodes)
            scene.remove(nodes[node].sprite);
        nodes = {};
        
        for(var i = 0; i < nodeEdges.length; i++)
            scene.remove(nodeEdges[i].line);
        nodeEdges = [];
        
    };
    
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
    
    function createNode(nodeData, startPosition) {
        
        var sprite = new THREE.Sprite(new THREE.SpriteMaterial({color : 0x000000}));
        var id = nodeData.id;
        var position = window.viewManager.translateToSection('network', startPosition);

        sprite.userData = {
            id : id,
            originPosition : position
            //TODO: set onClick()
        };

        sprite.position.copy(position);
            
        nodes[id] = nodeData;
        nodes[id].sprite = sprite;
        
        return sprite;
    }
    
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
    
    function configureCamera() {
        
        var position = window.viewManager.translateToSection('network', new THREE.Vector3(0,0,0));
        setTimeout(function() {window.camera.move(position.x, position.y, NET_RADIOUS, 2000); }, 5000);
        
        setTimeout(function() {window.camera.setTarget(new THREE.Vector3(position.x, position.y, -NET_RADIOUS / 2), 1000); }, 9000);
    }
}