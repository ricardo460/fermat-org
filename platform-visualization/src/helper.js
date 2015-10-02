/**
 * Static object with help functions commonly used
 */
function Helper() {

    /**
     * Hides an element vanishing it and then eliminating it from the DOM
     * @param {DOMElement} element         The element to eliminate
     * @param {Number}     [duration=1000] Duration of the fade animation
     * @param {Boolean}    [keep=false]     If set true, don't remove the element, just dissapear
     */
    this.hide = function(element, duration, keep) {

        var dur = duration || 1000,
            el = element;

        if (typeof(el) === "string") {
            el = document.getElementById(element);
        }

        $(el).fadeTo(duration, 0, function() {
            if(keep)
                el.style.display = 'none';
            else
                $(el).remove();
        });
    };

    /**
     * Clones a tile and *without* it's developer picture
     * @param   {String} id    The id of the source
     * @param   {String} newID The id of the created clone
     * @returns {DOMElement} The cloned tile without it's picture
     */
    this.cloneTile = function(id, newID) {

        var clone = document.getElementById(id).cloneNode(true);

        clone.id = newID;
        clone.style.transform = '';
        $(clone).find('.picture').remove();

        return clone;
    };

    /**
     * Parses ISODate to a javascript Date
     * @param   {String} date Input
     * @returns {Date}   js Date object (yyyy-mm-dd)
     */
    this.parseDate = function(date) {

        if (date == null) return null;

        var parts = date.split('-');

        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    };

    /**
     * Capitalizes the first letter of a word
     * @param   {String} string Input
     * @returns {String} input capitalized
     */
    this.capFirstLetter = function(string) {

        var words = string.split(" ");
        var result = "";

        for (var i = 0; i < words.length; i++)
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

        if (words.length == 1) { //if N = 1, use whole word or 3 first letters

            if (words[0].length <= 4)
                code = this.capFirstLetter(words[0]);
            else
                code = this.capFirstLetter(words[0].slice(0, 3));
        } else if (words.length == 2) { //if N = 2 use first cap letter, and second letter

            code += words[0].charAt(0).toUpperCase() + words[0].charAt(1);
            code += words[1].charAt(0).toUpperCase() + words[1].charAt(1);
        } else { //if N => 3 use the N (up to 4) letters caps

            var max = (words.length < 4) ? words.length : 4;

            for (var i = 0; i < max; i++)
                code += words[i].charAt(0);
        }

        return code;
    };

    /**
     * parse dir route from an element data
     * @method getRepoDir
     * @param  {Element}   item table element
     * @return {String}   directory route
     */
    this.getRepoDir = function(item) {
        //console.dir(item);
        var _root = "fermat",
            _group = item.group ? item.group.toUpperCase().split(' ').join('_') : null,
            _type = item.type ? item.type.toLowerCase().split(' ').join('_') : null,
            _layer = item.layer ? item.layer.toLowerCase().split(' ').join('_') : null,
            _name = item.name ? item.name.toLowerCase().split(' ').join('-') : null;

        if (_group && _type && _layer && _name) {
            return _group + "/" + _type + "/" + _layer + "/" +
                _root + "-" + _group.split('_').join('-').toLowerCase() + "-" + _type.split('_').join('-') + "-" + _layer.split('_').join('-') + "-" + _name + "-bitdubai";
        } else {
            return null;
        }
    };
    
    /**
     * Prints difficulty as stars
     * @param   {Number} value Difficulty to represent (max 5)
     * @returns {String} A maximun of 5 stars
     */
    this.printDifficulty = function(value) {
        var max = 5;
        var result = "";

        while (value > 0) {
            result += '★';
            max--;
            value--;
        }

        while (max > 0) {
            result += '☆';
            max--;
        }

        return result;
    };
    
    /**
     * Loads a texture and applies it to the given mesh
     * @param {String}   source     Address of the image to load
     * @param {Mesh}     object     Mesh to apply the texture
     * @param {Function} [callback] Function to call when texture gets loaded, with mesh as parameter
     */
    this.applyTexture = function(source, object, callback) {
        
        var loader = new THREE.TextureLoader();
        
        loader.load(
            source,
            function(tex) {
                tex.minFilter = THREE.NearestFilter;
                tex.needsUpdate = true;
                object.material.map = tex;
                object.needsUpdate = true;
                
                //console.log(tex.image.currentSrc);
                
                if(callback != null && typeof(callback) === 'function')
                    callback(object);
            });
    };
    
    this.drawText = function(text, x, y, context, maxWidth, lineHeight) {
    
        var words = text.split(' ');
        var line = '';

        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
          }
          else {
            line = testLine;
          }
        }
        context.fillText(line, x, y);

        return y + lineHeight;
    };
    
    this.searchElement = function(elementFullName) {
        
        if(typeof elementFullName !== 'string') return -1;
        
        var group,
            components = elementFullName.split('/');
        
        if(components.length === 3) {
        
            for(var i = 0, l = table.length; i < l; i++) {

                group = table[i].group || window.layers[table[i].layer].super_layer;

                if(group.toLowerCase() === components[0].toLowerCase() &&
                   table[i].layer.toLowerCase() === components[1].toLowerCase() &&
                   table[i].name.toLowerCase() === components[2].toLowerCase())
                    return i;
            }
        }
        
        return -1;
    };
}
