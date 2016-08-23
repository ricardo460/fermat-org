/**
 * @author Miguel Celedon
 * Loads the map (json version)
 * @param {Function} callback Function to call when finished
 */
function loadMap(callback) {

    $.get("json/config_map.json", {}, function (json) {
        globals.map = json;
        callback();
    });
}