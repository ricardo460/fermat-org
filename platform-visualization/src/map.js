var map = {};

/**
 * @author Ricardo Delgado
 * @lastmodifiedBy Miguel Celedon
 * Load the map (XML Version)
 * @param {Function} callback The function to call when it loads the map
 */
/*
function loadMap(callback) {
    
    var view,
    	up,
    	down,
    	left,
	    right,
	    start,
        title;
    
    $.get("config_map.xml",{},function(xml){ 


        $('view',xml).each(function() {

            view = $(this).attr('name');

            title = $(this).attr('title');

            var _up = $(this).find('up').attr('action'),
                _down = $(this).find('down').attr('action'),
                _left = $(this).find('left').attr('action'),
                _right = $(this).find('right').attr('action');
            
            var section = $(this).attr('section').split(',');
            section[0] = parseInt(section[0]);
            section[1] = parseInt(section[1]);

            up = _up || '';
            down = _down || '';
            left = _left || '';
            right = _right || '';
            
            window.map[view] = {up : up, down : down, right : right, left : left, section : section, title : title};

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