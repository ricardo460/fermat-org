/**
 * @author Ricardo Delgado
 */
function ButtonsManager() {

    this.objects = {
        button : []
    };

    var classConfig = {
    	button : 'actionButton',
    	label : 'label'
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
            
                callback();
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
    this.createButtons = function(id, text, callback, _x, _y, _type){

    	var object = {
            id : id,
            text : text
          };

        var x = _x || 5,
        	y = _y || 10,
        	type = _type || 'button',
        	idSucesor = "backButton",
        	_class = classConfig[type];

      	if(self.objects.button.length !== 0)
      		idSucesor = self.objects.button[self.objects.button.length - 1].id;

      	var button = document.createElement(type),
          	sucesorButton = document.getElementById(idSucesor);
                  
  		button.id = id;
		button.className = _class;
		button.style.position = 'absolute';
		button.innerHTML = text;
		button.style.top = y + 'px';
		button.style.left = (sucesorButton.offsetLeft + sucesorButton.clientWidth + x) + 'px';
		button.style.zIndex = 10;
		button.style.opacity = 0;

      	button.addEventListener('click', function() {
      		
                if(callback != null && typeof(callback) === 'function')
                    callback(); 

                self.removeAllButtons();
        	});

      	document.body.appendChild(button);

      	self.objects.button.push(object);

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

    	for(var i = 0; i < self.objects.button.length; i++){

    		if(self.objects.button[i].id === id){
    			self.objects.button.splice(i,1);
    			window.helper.hide($('#'+id), 1000, callback);
    			
    		}
    	}
    };

    /**
     * @author Ricardo Delgado
     * Removes all created buttons. 
     */
    this.removeAllButtons = function(){

    	if(self.objects.button.length !== 0){

	    	var actualButton = self.objects.button.shift();

	    	if( $('#'+actualButton.id) != null ) 
	    		window.helper.hide($('#'+actualButton.id), 1000); 
	    	
	    		self.removeAllButtons();
    	}
    };

}