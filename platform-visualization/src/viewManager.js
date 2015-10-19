function ViewManager() {
    
    var SECTION_SIZE = window.MAX_DISTANCE * 1.5;
    
    this.map = {
        table : [0, 0],
        stack : [1, 0]
    };
    var self = this;
    
    this.translateToSection = function(sectionName, vector) {
        
        sectionName = sectionName || 'table';
        var section = self.map[sectionName];
        
        if(typeof section !== 'undefined') {
        
            vector.x = vector.x + section[0] * SECTION_SIZE;
            vector.y = vector.y + section[1] * SECTION_SIZE;
        }
        
        return vector;
    };
}