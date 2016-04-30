/**
 * Command Line Interface. Contains functions defined to be used when debugging
 * @author Miguel Celedon
 */
function CLI() {
    
    /**
     * Used to execute a condition through an array
     * @author Miguel Celedon
     * @param   {Array}    list      The source of the search
     * @param   {function} condition A function receiving the actual element and must return true or false
     * @returns {Array}    Set of indices of that array that complies the condition
     */
    this.query = function(list, condition) {
        
        var found = [];
        
        for(var i in list) {
            if(condition(list[i]))
                found.push(i);
        }
        
        return found;
    };
    
    /**
     * This function is meant to be used only for testing in the debug console,
     * it cleans the entire scene so the website frees some memory and so you can
     * let it in the background without using so much resources.
     * @author Miguel Celedon
     */
    this.shutDown = function() {

        window.scene = new THREE.Scene();

    };
    
    /**
     * Executes a click event on a tile
     * @author Miguel Celedon
     * @param {number} id The ID (position in the table) of the element
     */
    this.forceElementClick = function(id) {
        
        var obj = window.objects[id].levels[0].object;
        
        obj.userData.onClick(obj);
        
    };
    
    /**
     * Moves the camera to a distances so the tiles and elements gets the respective quality
     * @author Miguelcldn
     * @param {string} qa Can be {"mini" | "small" | "medium" | "high"}
     */
    this.goToQuality = function(qa) {
        var qs = window.tileManager.levels;
        var pos = window.camera.getPosition();
        
        window.camera.move(pos.x, pos.y, qs[qa] + 1);
    };
}

var CLI = new CLI();