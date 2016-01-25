/**
 * @author Ricardo Delgado
 */
function ButtonsManager() {

    this.objects = {
        buttons : []
    };

    var self = this;

    /**
     * @author Ricardo Delgado
     * All the buttons and their functions are added.
     * @param {String} id  Tile ID.
     */
    this.actionButtons = function(id, callback){

        if(window.table[id].author) {

            self.createButtons('developerButton', 'View developer', function(){

            	if(typeof(callback) === 'function')
                	callback();
            });
        }

        window.screenshotsAndroid.showButtonScreenshot(id);

        window.fermatEdit.addButtonEdit(id);

        window.flowManager.getAndShowFlows(id);//Always stop last
    };

    /**
     * @author Ricardo Delgado
     * creation of button and its function is added.
     * @param {String}  id  Button ID.
     * @param {String} text  Button text.
	 * @param {Function} callback Function to call when finished.    
     */
    this.createButtons = function(id, text, callback, _x, _type){

    	var object = {
            id : id,
            text : text
          };

        var x = _x || 5,
        	type = _type || 'button',
        	idSucesor = "backButton";

      	if(self.objects.buttons.length !== 0)
      		idSucesor = self.objects.buttons[self.objects.buttons.length - 1].id;

      	var button = document.createElement(type),
          	sucesorButton = document.getElementById(idSucesor);
                  
  		button.id = id;
		button.className = 'actionButton';
		button.style.position = 'absolute';
		button.innerHTML = text;
		button.style.top = '10px';
		button.style.left = (sucesorButton.offsetLeft + sucesorButton.clientWidth + x) + 'px';
		button.style.zIndex = 10;
		button.style.opacity = 0;

      	button.addEventListener('click', function() {
      		
      			self.removeAllButtons();

                if(typeof(callback) === 'function')
                    callback(); 

        	});

      	document.body.appendChild(button);

      	self.objects.buttons.push(object);

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

    	for(var i = 0; i < self.objects.buttons.length; i++){

    		if(self.objects.buttons[i].id === id){
    			self.objects.buttons.splice(i,1);
    			window.helper.hide($('#'+id), 1000, callback);
    			
    		}
    	}
    };

    /**
     * @author Ricardo Delgado
     * Removes all created buttons. 
     */
    this.removeAllButtons = function(){

    	if(self.objects.buttons.length !== 0){

	    	var actualButton = self.objects.buttons.shift();

	    	if( $('#'+actualButton.id) != null ) 
	    		window.helper.hide($('#'+actualButton.id), 1000); 
	    	
	    		self.removeAllButtons();
    	}
    };

}