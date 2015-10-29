function ViewManager() {
    
    var SECTION_SIZE = window.MAX_DISTANCE * 1.5;
    
    var self = this;
    
    this.translateToSection = function(sectionName, vector) {
        
        sectionName = window.map.views[sectionName] || window.map.start;
        var section = sectionName.section || [0, 0];
        var newVector = vector.clone();
        
        if(typeof section !== 'undefined') {
        
            newVector.x = vector.x + section[0] * SECTION_SIZE;
            newVector.y = vector.y + section[1] * SECTION_SIZE;
        }
        
        return newVector;
    };
}