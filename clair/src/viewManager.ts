/**
 * Responsible for drawing the p2p network
 * @author Miguel Celedon
 */
class ViewManager {

    views: string[] = [];

    constructor(views? : string[]) {
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

        //    if(globals.map.views[sectionName].title !== "Render") {
        sectionName = globals.map.views[sectionName] || globals.map.start;
        var section = sectionName.section || [0, 0];
        var newVector = vector.clone();

        if (typeof section !== 'undefined') {

            newVector.x = vector.x + section[0] * this.SECTION_SIZE;
            newVector.y = vector.y + section[1] * this.SECTION_SIZE;
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

        if (globals.map.views[view].enabled === true) {

            switch (view) {

                case 'table':
                    enter = function () {

                        globals.tableEdit.addButton();

                        globals.tileManager.transform(true, 3000 + transition);

                        setTimeout(function () {
                            globals.signLayer.transformSignLayer();
                        }, 9500);

                        //Special: If coming from home, delay the animation
                        if (globals.actualView === 'home')
                            transition = transition + 3000;

                        globals.headers.transformTable(transition);

                        globals.developer.delete();
                    };

                    backButton = function () {

                        changeView();

                        setTimeout(function () {
                            globals.signLayer.transformSignLayer();
                        }, 2500);

                        globals.developer.delete();
                    };

                    exit = function () {
                        globals.tileManager.rollBack();

                        globals.buttonsManager.removeAllButtons();
                    };

                    reset = function () {
                        globals.tileManager.rollBack();

                        globals.headers.transformTable(2000);

                        setTimeout(function () {
                            globals.signLayer.transformSignLayer();
                        }, 3000);
                    };

                    break;
                case 'stack':
                    enter = function () {

                        if (!globals.headersUp) {
                            globals.headers.showHeaders(transition);
                            globals.headersUp = true;
                        }
                        globals.headers.transformStack(transition);

                        Helper.hideBackButton();

                    };

                    exit = function () {
                        globals.headers.deleteArrows(transition);
                    };

                    break;
                case 'home':
                    enter = function () {
                        globals.logo.stopFade(2000);
                        globals.guide.addButton();
                    };

                    exit = function () {

                        globals.buttonsManager.removeAllButtons();

                    };
                    break;
                case 'workflows':
                    enter = function () {
                        if (!globals.headersUp) {
                            globals.headers.showHeaders(transition);
                            globals.headersUp = true;
                        }
                        globals.workFlowManager.getHeaderFLow();
                        globals.headers.transformWorkFlow(transition);
                        globals.workFlowEdit.addButton();
                    };

                    backButton = reset = function () {

                        globals.workFlowManager.showWorkFlow();
                    };

                    exit = function () {
                        globals.buttonsManager.removeAllButtons();
                        globals.workFlowManager.deleteAllWorkFlows();
                    };
                    break;
                case 'developers':
                    enter = function () {
                        globals.developer.getDeveloper();

                        setTimeout(function () {
                            globals.developer.animateDeveloper();
                        }, 2500);
                    };

                    backButton = reset = function () {
                        //setTimeout(function(){
                        globals.developer.animateDeveloper();
                        //}, 2000);

                        changeView();
                    };

                    exit = function () {
                        globals.developer.delete();
                    };

                    break;
                default:
                    break;
            }
        }

        actions = {
            enter: enter || function () { },
            exit: exit || function () { },
            reset: reset || function () { },
            zoom: zoom || function () { },
            backButton: backButton || function () { }
        };

        return actions;
    }

    /**
     * Create a basic skeleton of the views, with exit, enter and reset functions as empty
     * @author Miguel Celedon
     */
    initViews() {

        for (var view in globals.map.views) {
            this.views[view] = this.setTransition(view);
        }
    }
}
