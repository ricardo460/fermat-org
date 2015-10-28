function ViewManager() {
    
    var SECTION_SIZE = window.MAX_DISTANCE * 1.5;
    
    var self = this;
    
    this.translateToSection = function(sectionName, vector) {
        
        sectionName = window.map.views[sectionName] || window.map.start;
        var section = sectionName.section || [0, 0];
        
        if(typeof section !== 'undefined') {
        
            vector.x = vector.x + section[0] * SECTION_SIZE;
            vector.y = vector.y + section[1] * SECTION_SIZE;
        }
        
        return vector;
    };
}