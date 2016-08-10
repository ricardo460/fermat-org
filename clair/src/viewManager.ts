/**
 * Responsible for drawing the p2p network
 * @author Miguel Celedon
 */
class ViewManager {

    constructor(public views) {
        this.initViews();
    }

    SECTION_SIZE = MAX_DISTANCE * 1.5;

    /**
     * Convert a vector to the relative coordiantes of a section
     * @author Miguel Celedon
     * @param   {String}        sectionName The name of the section
     * @param   {Object}        vector      The original vector
     * @returns {THREE.Vector3} A new vector with the positions relative to the section center
     */
    translateToSection(sectionName, vector) {

    //    if(window.map.views[sectionName].title !== "Render") {
            sectionName = window.map.views[sectionName] || window.map.start;
            var section = sectionName.section || [0, 0];
            var newVector = vector.clone();

            if(typeof section !== 'undefined') {

                newVector.x = vector.x + section[0] * SECTION_SIZE;
                newVector.y = vector.y + section[1] * SECTION_SIZE;
            }

            return newVector;
    //    }
    };

    /**
     * Creates the structure of the transition functions depending of the view
     * @author Miguel Celedon
     * @lastmodifiedBy Emmanuel Colina
     * @lastmodifiedBy Ricardo Delgado
     * @param   {String} view The name of the view to process
     * @returns {Object} An object containing all the possible functions that can be called
     */
    setTransition(view) {

        var transition = 5000;
        var actions = {},
            enter = null, exit = null, reset = null, zoom = null, backButton = null;

        if(window.map.views[view].enabled === true) {

            switch(view) {

                case 'table':
                    enter = function() {

                        window.tableEdit.addButton();

                        window.tileManager.transform(true, 3000 + transition);

                        setTimeout(function(){
                            window.signLayer.transformSignLayer();
                         }, 9500);

                        //Special: If coming from home, delay the animation
                        if(window.actualView === 'home')
                            transition = transition + 3000;

                        window.headers.transformTable(transition);

                        window.developer.delete();
                    };

                    backButton = function() {

                        window.changeView();

                        setTimeout(function(){
                            window.signLayer.transformSignLayer();
                        }, 2500);

                        window.developer.delete();
                    };

                    exit = function() {
                        window.tileManager.rollBack();

                        buttonsManager.removeAllButtons();
                    };

                    reset = function() {
                        window.tileManager.rollBack();

                        window.headers.transformTable(2000);

                        setTimeout(function(){
                            window.signLayer.transformSignLayer();
                         }, 3000);
                    };

                    break;
                case 'stack':
                    enter = function() {

                        if(!window.headersUp) {
                            headers.showHeaders(transition);
                            window.headersUp = true;
                        }
                        window.headers.transformStack(transition);

                        window.helper.hideBackButton();

                    };

                    exit = function() {
                        window.headers.deleteArrows(transition);
                    };

                    break;
                case 'home':
                    enter = function() {
                        window.logo.stopFade(2000);
                        window.guide.addButton();
                    };

                    exit = function() {

                        window.buttonsManager.removeAllButtons();

                    };
                    break;
                case 'workflows':
                    enter = function() {
                        if(!window.headersUp) {
                            headers.showHeaders(transition);
                            window.headersUp = true;
                        }
                        window.workFlowManager.getHeaderFLow();
                        window.headers.transformWorkFlow(transition);
                        window.workFlowEdit.addButton();
                    };

                    backButton = reset = function() {

                        window.workFlowManager.showWorkFlow();
                    };

                    exit = function() {
                        window.buttonsManager.removeAllButtons();
                        window.workFlowManager.deleteAllWorkFlows();
                    };
                    break;
                case 'developers':
                    enter = function(){
                        window.developer.getDeveloper();

                        setTimeout(function(){
                            window.developer.animateDeveloper();
                        }, 2500);
                    };

                    backButton = reset = function() {
                        //setTimeout(function(){
                            window.developer.animateDeveloper();
                        //}, 2000);

                        window.changeView();
                    };

                    exit = function() {
                        window.developer.delete();
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
    initViews() {

        for(var view in window.map.views) {
            this.views[view] = this.setTransition(view);
        }
    }
}
