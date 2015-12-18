/**
 * Responsible for drawing the p2p network
 * @author Miguel Celedon
 */
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
     * @lastmodifiedBy Ricardo Delgado
     * @param   {String} view The name of the view to process
     * @returns {Object} An object containing all the possible functions that can be called
     */
    function setTransition(view) {
        
        var transition = 5000;
        var actions = {},
            enter = null, exit = null, reset = null, zoom = null, backButton = null;
        
        if(window.map.views[view].enabled === true) {
        
            switch(view) {

                case 'table':
                    enter = function() {

                        window.browserManager.modifyButtonLegend(1,'block');

                        window.tileManager.transform(window.tileManager.targets.table, 3000 + transition);
                        
                        setTimeout(function(){
                            window.signLayer.transformSignLayer();
                         }, 9500);
                        
                        //Special: If coming from home, delay the animation
                        if(window.actualView === 'home')
                            transition = transition + 3000;

                        window.headers.transformTable(transition);

                        window.deleteAllWorkFlows();

                        window.developer.delete();
                    };
                    
                    backButton = function() {
                        
                        window.changeView(tileManager.targets.table);
            
                        setTimeout(function(){
                            window.signLayer.transformSignLayer();
                        }, 2500);
                    };                    
                    
                    exit = function() {
                        window.tileManager.rollBack();
                    };

                    reset = function() {
                        window.tileManager.rollBack();

                        setTimeout(function(){
                            window.signLayer.transformSignLayer();
                         }, 3000);
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
                        setTimeout(function(){
                            window.magazine.init(view);
                        }, 2000);    
                    };
                    
                    reset = function() {
                        window.magazine.actionSpecial();
                    };

                    exit = function() {
                        window.magazine.remove();
                    };

                    break;
                case 'workflows':
                    enter = function() {
                        window.getHeaderFLow();
                        window.headers.transformWorkFlow(8000);
                    };
                    
                    backButton = reset = function() {
                        window.showWorkFlow();
                    };

                    exit = function() {
                        window.deleteAllWorkFlows();
                    };
                    
                    break;
                case 'network':
                    enter = function() {
                        window.networkViewer = new NetworkViewer();
                        window.networkViewer.load();
                    };
                    
                    exit = function() {
                        window.networkViewer.unload();
                        window.networkViewer = null;
                        
                        window.camera.disableFreeMode();
                        window.camera.freeView = false;
                    };
                    
                    zoom = function() {
                        
                        window.camera.enableFreeMode();
                        
                        if(window.networkViewer)
                            window.networkViewer.setCameraTarget();
                    };
                    
                    reset = function() {
                        if(window.networkViewer)
                            window.networkViewer.reset();
                    };
                    
                    break;
                case 'developers':
                    enter = function(){
                        window.developer.getDeveloper();

                        setTimeout(function(){
                            window.developer.animateDeveloper();
                        }, 2000);        
                    };
                    
                    backButton = reset = function() {
                        setTimeout(function(){
                            window.developer.animateDeveloper();
                        }, 4000);
                        
                        window.changeView(tileManager.targets.table);
                    };

                    break;
                default:
                    break;
            }
        }
        
        actions = {
            enter : enter || function(){},
            exit : exit || function(){},
            reset : reset || function(){},
            zoom : zoom || function(){},
            backButton : backButton || function(){}
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