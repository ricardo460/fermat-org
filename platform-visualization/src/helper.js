/**
 * Static object with help functions commonly used
 */
function Helper() {
    
    /**
     * Hides an element vanishing it and then eliminating it from the DOM
     * @param {DOMElement} element  The element to eliminate
     * @param {Number} duration Duration of the fade animation
     */
    this.hide = function (element, duration) {
        
        var dur = duration || 1000,
            el = element;
        
        if (typeof (el) === "string") { el = document.getElementById(element); }
        
        $(el).fadeTo(duration, 0, function () {
            $(el).remove();
        });
    };
    
    /**
     * Clones a tile and *without* it's developer picture
     * @param   {String} id    The id of the source
     * @param   {String} newID The id of the created clone
     * @returns {DOMElement} The cloned tile without it's picture
     */
    this.cloneTile = function (id, newID) {
        
        var clone = document.getElementById( id ).cloneNode(true);

        clone.id = newID;
        clone.style.transform = '';
        $(clone).find('img').remove();
        
        return clone;
    };
    
    /**
     * Parses ISODate to a javascript Date
     * @param   {String} date Input
     * @returns {Date}   js Date object (yyyy-mm-dd)
     */
    this.parseDate = function( date ) {
    
        if( date == null ) return null;
        
        var parts = date.split('-');

        return new Date( parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]) );
    };
    
    /**
     * Capitalizes the first letter of a word
     * @param   {String} string Input
     * @returns {String} input capitalized
     */
    this.capFirstLetter = function(string) {
        
        var words = string.split(" ");
        var result = "";

        for(var i = 0; i < words.length; i++)
            result += words[i].charAt(0).toUpperCase() + words[i].slice(1) + " ";

        return result.trim();
    };

    /**
     * Extract the code of a plugin
     * @param   {String} pluginName The name of the plugin
     * @returns {String} Code of the plugin
     */
    this.getCode = function(pluginName) {
    
        var words = pluginName.split(" ");
        var code = "";

        if( words.length == 1) { //if N = 1, use whole word or 3 first letters

            if(words[0].length <= 4)
                code = this.capFirstLetter( words[0] );
            else
                code = this.capFirstLetter( words[0].slice( 0, 3 ) );
        }
        else if( words.length == 2 ) { //if N = 2 use first cap letter, and second letter

            code += words[0].charAt(0).toUpperCase() + words[0].charAt(1);
            code += words[1].charAt(0).toUpperCase() + words[1].charAt(1);
        }
        else { //if N => 3 use the N (up to 4) letters caps

            var max = (words.length < 4) ? words.length : 4;

            for(var i = 0; i < max; i++)
                code += words[i].charAt(0);
        }

        return code;
    };
    
    this.getLevelColor = function(codeLevel, alpha) {
        
        var color;
        alpha = alpha || 1;
        
        switch ( codeLevel ) {

            case "concept":
//                element.style.boxShadow = '0px 0px 12px rgba(150,150,150,0.5)';
//                element.style.backgroundColor = 'rgba(170,170,170,'+ ( Math.random() * 0.25 + 0.45 ) +')';
//
//                number.style.color = 'rgba(127,127,127,1)';
//                layerName.style.color = 'rgba(127,127,127,1)';
                
                color = 'rgba(127,127,127,'+ alpha +')';

                break;
            case "development":
//                element.style.boxShadow = '0px 0px 12px rgba(244,133,107,0.5)';
//                element.style.backgroundColor = 'rgba(234,123,97,' + ( Math.random() * 0.25 + 0.45 ) + ')';
//
//                number.style.color = 'rgba(234,123,97,1)';
//                layerName.style.color = 'rgba(234,123,97,1)';

                color = 'rgba(234,123,97,'+ alpha +')';
                
                break;
            case "qa":
//                element.style.boxShadow = '0px 0px 12px rgba(244,244,107,0.5)';
//                element.style.backgroundColor = 'rgba(194,194,57,' + ( Math.random() * 0.25 + 0.45 ) + ')';
//
//                number.style.color = 'rgba(194,194,57,1)';
//                layerName.style.color = 'rgba(194,194,57,1)';

                color = 'rgba(194,194,57,'+ alpha +')';

                break;
            case "production":
//                element.style.boxShadow = '0px 0px 12px rgba(80,188,107,0.5)';
//                element.style.backgroundColor = 'rgba(70,178,97,'+ ( Math.random() * 0.25 + 0.45 ) +')';
//
//                number.style.color = 'rgba(70,178,97,1)';
//                layerName.style.color = 'rgba(70,178,97,1)';

                color = 'rgba(70,178,97,'+ alpha +')';
                
                break;
        }
        
        return color;
    };
}

// Make helper a static object
var helper = new Helper();