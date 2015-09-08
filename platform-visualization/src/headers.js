function Headers(columnWidth, superLayerMaxHeight, groupsQtty, layersQtty, superLayerPosition) {
    
    var headers = [],
        group,
        column,
        image,
        object,
        slayer,
        row;
    
    
    for (group in groups) {
        if (groups.hasOwnProperty(group) && group !== 'size') {
        
            column = groups[group];

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
        if (superLayers.hasOwnProperty(slayer) && slayer !== 'size') {
        
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
    
    
    this.show = function (duration) {
        var i;
        
        for (i = 0; i < headers.length; i++ ) {
            $(headers[i]).fadeTo(Math.random() * duration + duration, 1);
        }
    };
    
    this.hide = function (duration) {
        var i;
        
        for (i = 0; i < headers.length; i++) {
            $(headers[i]).fadeTo(Math.random() * duration + duration, 0);
        }
    };
}