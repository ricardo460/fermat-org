function ClientsViewer(parentNode) {
    
    var self = this;
    var nodes = {};
    var edges = [];
    
    function init() {
        
        loadData();
        
        for(var nodeID in nodes) {
            
            
        }
    }
    
    function loadData() {
        
        test_loadData();
    }
    
    function test_loadData() {
        
        var NUM_CLIENTS = 10;
        
        for(var i = 0; i < NUM_CLIENTS; i++) {
            
            nodes[i.toString()] = {
                id : i.toString(),
                edges : [
                    { 
                        id : parentNode.userData.id
                    }
                ]
            };
        }
    }
    
    function createNode() {
    }
    
    function showNodes() {}
    
    function hideNodes() {}
    
    function createEdges() {
        
    }
    
    function showEdges() {}
    
    function hideEdges() {}
    
    init();
}