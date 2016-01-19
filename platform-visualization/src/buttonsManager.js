/**
 * @author Ricardo Delgado
 */
function ButtonsManager() {

    var objects = {
        button : []
    };

    var self = this;
    /**
     * @author Ricardo Delgado
     * All the buttons and their functions are added.
     * @param {String} id  Tile ID.
     */
    this.actionButtons = function(id){

        if(window.table[id].author) {

            self.createButtons('developerButton', 'View developer', function(){
            
                window.showDeveloper(id);
            });
        }

        window.screenshotsAndroid.showButtonScreenshot(id);

        window.flowManager.getAndShowFlows(id);//Always stop last
    };

    /**
     * @author Ricardo Delgado
     * creation of button and its function is added.
     * @param {String}  id  Button ID.
     * @param {String} text  Button text.
	 * @param {Function} callback Function to call when finished.    
     */
    this.createButtons = function(id, text, callback){

    	var object = {
            id : id,
            text : text
          };

      	var idSucesor = "backButton";

      	if(objects.button.length !== 0)
      		idSucesor = objects.button[objects.button.length - 1].id;

      	var button = document.createElement('button'),
          	sucesorButton = document.getElementById(idSucesor);
                  
      	button.id = id;
    		button.className = 'actionButton';
    		button.style.position = 'absolute';
    		button.innerHTML = text;
    		button.style.top = '10px';
    		button.style.left = (sucesorButton.offsetLeft + sucesorButton.clientWidth + 5) + 'px';
    		button.style.zIndex = 10;
    		button.style.opacity = 0;

      	button.addEventListener('click', function() {
      		
                if(callback != null && typeof(callback) === 'function')
                    callback(); 

                self.removeAllButtons();
        	});

      	document.body.appendChild(button);

      	objects.button.push(object);

      	window.helper.show(button, 1000);

      	return button;
    };

    /**
     * @author Ricardo Delgado
     * Eliminates the desired button.
     * @param {String}  id  Button ID.
	 * @param {Function} callback Function to call when finished.    
     */
    this.deleteButton = function(id, callback){

    	for(var i = 0; i < objects.button.length; i++){

    		if(objects.button[i].id === id){
    			objects.button.splice(i,1);
    			window.helper.hide($('#'+id), 1000, callback);
    			
    		}
    	}
    };

    /**
     * @author Ricardo Delgado
     * Removes all created buttons. 
     */
    this.removeAllButtons = function(){

    	if(objects.button.length !== 0){

	    	var actualButton = objects.button.shift();

	    	if( $('#'+actualButton.id) != null ) 
	    		window.helper.hide($('#'+actualButton.id), 1000); 
	    	
	    		self.removeAllButtons();
    	}
    };

}