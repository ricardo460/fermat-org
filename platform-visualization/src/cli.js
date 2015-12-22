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
        
        for(var i = 0; i < list.length; i++) {
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

        scene = new THREE.Scene();

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
}

var CLI = new CLI();