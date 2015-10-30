var map = {};

/**
 * @author Miguel Celedon
 * Loads the map (json version)
 * @param {Function} callback Function to call when finished
 */
function loadMap(callback){
    
    $.get("config_map.json", {}, function(json) {
        window.map = json;
        callback();
    });
}