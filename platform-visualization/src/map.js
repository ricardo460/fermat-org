var map = {};

/* Map example
{
    start: "table",
    table: {
        top: "",
        bottom: "",
        right: "stack",
        left: "",
        section : [0, 0]
    },
    stack: {
        top: "",
        bottom: "",
        right: "",
        left: "table",
        section : [1, 0]
    }
}*/

/**
 * @author Ricardo Delgado
 * @lastmodifiedBy Miguel Celedon
 * Load the map (XML Version)
 * @param {Function} callback The function to call when it loads the map
 */
/*function loadMap(callback) {
    
//window.map = window.test_map;
    var view,
    	top,
    	bottom,
    	left,
	    right,
	    table,
	    stack,
	    start;
    
    $.get("config_map.xml",{},function(xml){ 


        $('view',xml).each(function() {

            view = $(this).attr('name');

            var _top = $(this).find('top').attr('action'),
                _bottom = $(this).find('bottom').attr('action'),
                _left = $(this).find('left').attr('action'),
                _right = $(this).find('right').attr('action');
            
            var section = $(this).attr('section').split(',');
            section[0] = parseInt(section[0]);
            section[1] = parseInt(section[1]);

            top = _top || '';
            bottom = _bottom || '';
            left = _left || '';
            right = _right || '';
            
            window.map[view] = {top : top, bottom : bottom, right : right, left : left, section : section};

        });

        start = $(xml).find('start_page').text();

        window.map.start = start;
        
        callback();

    });

}*/


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