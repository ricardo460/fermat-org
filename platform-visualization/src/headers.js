/**
 * @class Represents the group of all header icons
 * @param {Number} columnWidth         The number of elements that contains a column
 * @param {Number} superLayerMaxHeight Max rows a superLayer can hold
 * @param {Number} groupsQtty          Number of groups (column headers)
 * @param {Number} layersQtty          Number of layers (rows)
 * @param {Array}  superLayerPosition  Array of the position of every superlayer
 */
function Headers(columnWidth, superLayerMaxHeight, groupsQtty, layersQtty, superLayerPosition) {
    
    // Private members
    var headers = [],
        group,
        column,
        image,
        object,
        slayer,
        row;
    
    // Private methods
    var buildDependencies = function() {
        
        // Does platform depends on superlayers or vice versa?
    };
    
    
    
    // Initialization code
    //=========================================================
    for (group in groups) {
        if (window.groups.hasOwnProperty(group) && group !== 'size') {
        
            column = window.groups[group];

            image = document.createElement('img');
            image.src = 'images/' + group + '_logo.svg';
            image.width = columnWidth * 140;
            image.style.opacity = 0;
            headers.push(image);

            object = new THREE.CSS3DObject(image);

            object.position.x = (columnWidth * 140) * (column - (groupsQtty - 1) / 2) + ((column - 1) * 140);
            object.position.y = ((layersQtty + 5) * 180) / 2;

            scene.add(object);
        }
    }
    
    for (slayer in superLayers) {
        if (window.superLayers.hasOwnProperty(slayer) && slayer !== 'size') {
        
            row = superLayerPosition[superLayers[slayer].index];

            image = document.createElement('img');
            image.src = 'images/' + slayer + '_logo.svg';
            image.width = columnWidth * 140;
            image.style.opacity = 0;
            headers.push(image);

            object = new THREE.CSS3DObject(image);

            object.position.x = -(((groupsQtty + 1) * columnWidth * 140 / 2) + 140);
            object.position.y = -(row * 180) - (superLayerMaxHeight * 180 / 2) + (layersQtty * 180 / 2);

            scene.add(object);
        }
    }
    
    buildDependencies();
    //=========================================================
    
    // Public methods
    /**
     * Arranges the headers by dependency
     * @param {Number} duration Duration in milliseconds for the animation
     */
    this.arrangeByDependency = function(duration) {
        var _duration = duration || 2000;
        
        
    };
    
    /**
     * Shows the headers as a fade
     * @param {Number} duration Milliseconds of fading
     */
    this.show = function (duration) {
        var i;
        
        for (i = 0; i < headers.length; i++ ) {
            $(headers[i]).fadeTo(Math.random() * duration + duration, 1);
        }
    };
    
    /**
     * Hides the headers (but don't deletes them)
     * @param {Number} duration Milliseconds to fade
     */
    this.hide = function (duration) {
        var i;
        
        for (i = 0; i < headers.length; i++) {
            $(headers[i]).fadeTo(Math.random() * duration + duration, 0);
        }
    };
}

/*

Para obtener la lista completa de dependencias hay dos opciones:
1) Recibir del servidor un json con las dependencias como una lista de adyacencias hecha a mano
2) 3 pasadas:
    1 obtener la lista de grupos
    2 recorrer agregando la adyacencia
    3 crear un nodo raiz con la lista de independientes

*/