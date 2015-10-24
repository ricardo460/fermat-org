var map;
/**
 * @author Ricardo Delgado
 * Load the map here.
 */
function loadMap() {
    
//window.map = window.test_map;
    var view,
    	top,
    	bottom,
    	left,
	    right,
	    table,
	    stack,
	    load;

	$(document).ready(function(){

		$.get("config_map.xml",{},function(xml){ 


			$('view',xml).each(function() {

     			view = $(this).attr('name');

				var _top = $(this).find('top').attr('action'),

   	 				_bottom = $(this).find('bottom').attr('action'),

    				_left = $(this).find('left').attr('action'),

    				_right = $(this).find('right').attr('action');


				if(_top !== undefined) 
   					top = _top;
				else 
			   		 top = "";

				if(_bottom !== undefined) 
			    	bottom = _bottom;
				else 
			    	bottom = "";

				if(_left !== undefined) 
			    	left = _left;
				else 
			    	left = "";

				if(_right !== undefined) 
			    	right = _right;
				else 
			   		 right = "";

				if (view === "table") 
					table = {top : top, bottom : bottom, right : right, left : left}; 

				else if(view === "stack") 
					stack = {top : top, bottom : bottom, right : right, left : left}; 


			});

			$('map',xml).each(function() {

				load = $(this).find('load_page').text();

				window.map = {load, table, stack};

			});

		});

	});

}

/*function loadMap(){

window.map = { load : "table",

		table : {top : "",bottom : "",right : "stack",left : ""},

        stack : {top : "",bottom : "",right : "",left : "table"} 
        
            };

}*/


