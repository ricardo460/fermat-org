/*
 *  Responsible for getting the data from the network
 */

var crawler = {
    graph : [],
    
    //TODO: Change with actual data
    fill : function () {
        
        for(var i = 0; i < 10; i++) {
            
            var newNode = { 
                name : "MyName",
                adj : []
            };
            
            var links = Math.floor((Math.random() * 9) + 1);
            
            for(var j = 0; j < links; j++) {
                var link = Math.floor((Math.random() * 9) + 1);
                
                if(link != i && newNode.adj.indexOf(link) == -1)
                    newNode.adj.push(link);
            }
            
            this.graph.push(newNode);
        }
        
        
    }
};