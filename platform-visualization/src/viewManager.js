function ViewManager() {
    
    var SECTION_SIZE = window.MAX_DISTANCE * 1.5;
    
    this.views = {};
    
    var self = this;
    
    /**
     * Convert a vector to the relative coordiantes of a section
     * @author Miguel Celedon
     * @param   {String}        sectionName The name of the section
     * @param   {Object}        vector      The original vector
     * @returns {THREE.Vector3} A new vector with the positions relative to the section center
     */
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
    
    /**
     * Creates the structure of the transition functions depending of the view
     * @author Miguel Celedon
     * @lastmodifiedBy Emmanuel Colina
     * @param   {String} view The name of the view to process
     * @returns {Object} An object containing all the possible functions that can be called
     */
    function setTransition(view) {
        
        var transition = 5000;
        var actions = {},
            enter = null, exit = null, reset = null;
        
        if(window.map.views[view].enabled === true) {
        
            switch(view) {

                case 'table':
                    enter = function() {

                        window.browserManager.modifyButtonLegend(1,'block');

                        window.tileManager.transform(window.tileManager.targets.table, 3000 + transition);

                        //Special: If coming from home, delay the animation
                        if(window.actualView === 'home')
                            transition = transition + 3000;

                        window.headers.transformTable(transition);

                        window.changeViewWorkFlows();
                    };

                    reset = function() {
                        window.tileManager.rollBack();
                    };

                    break;
                case 'stack':
                    enter = function() {

                        window.headers.transformStack(transition);

                        window.browserManager.modifyButtonBack(0,'none');

                        window.browserManager.modifyButtonLegend(0,'none');
                    };

                    break;
                case 'home':
                    enter = function() {
                        logo.stopFade(2000);
                    };

                    break;
                case 'book':
                case 'readme':
                case 'whitepaper':
                    enter = function() {
                        window.magazine.init(view);
                    };

                    exit = function() {
                        window.magazine.remove();
                    };

                    break;
                case 'workflows':
                    enter = function() {
                        window.getHeaderFLow();
                    };

                    reset = function() {
                        window.tileManager.rollBack();

                        setTimeout(function() {
                            window.changeViewWorkFlows();
                            window.getHeaderFLow();
                        }, 1000);
                    };

                    break;
                default:
                    break;
            }
        }
        
        actions = {
            enter : enter || function(){},
            exit : exit || function(){},
            reset : reset || function(){}
        };
        
        return actions;
    }
    
    /**
     * Create a basic skeleton of the views, with exit, enter and reset functions as empty
     * @author Miguel Celedon
     */
    function initViews() {
        
        for(var view in window.map.views) {
            self.views[view] = setTransition(view);
        }
    }
    
    initViews();
}