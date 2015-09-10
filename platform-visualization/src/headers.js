function Headers(columnWidth, superLayerMaxHeight, groupsQtty, layersQtty, superLayerPosition) {
    
    var headers = [],
        source,
        column,
        row,
        x,
        y,
        width;
    
    var loadJson = function(source, x, y, width, height) {
        
        var object;
        var loader = new THREE.JSONLoader();
        
        try {
            loader.load(
                source,
                function(geometry, materials) {

                    var material = new THREE.MeshFaceMaterial(materials);
                    var object = new THREE.Mesh(geometry, material);
                    //var light = new THREE.PointLight(0xFFFFFF, 0.5, 0);
                    //var helper = new THREE.PointLightHelper(light, 180);
                    //light.position.set(x, y, 200);
                    
                    
                    
                    headers.push(object);
                   //headers.push(light);

                    object.position.x = x;
                    object.position.y = y;
                    object.scale.copy(new THREE.Vector3(75, 75, 30));

                    scene.add(object);
                    //scene.add(light);
                    //scene.add(helper);
                });
        }
        catch(err) {
            console.log('Missing ' + source);
        }
    };
    
    for (var group in groups) {
        if (groups.hasOwnProperty(group) && group !== 'size') {
        
            source = 'images/' + group + '_logo.json';
            column = groups[group];
            x = (columnWidth * 140) * (column - (groupsQtty - 1) / 2) + ((column - 1) * 140);
            y = ((layersQtty + 5) * 180) / 2;
            width = columnWidth * 140;
            
            loadJson(source, x, y, width, width);
        }
    }
    
    /*for (var slayer in superLayers) {
        if (superLayers.hasOwnProperty(slayer) && slayer !== 'size') {
        
            row = superLayerPosition[superLayers[slayer].index];
            source = 'images/' + slayer + '_logo.svg';
            width = columnWidth * 140;
            x = -(((groupsQtty + 1) * columnWidth * 140 / 2) + 140);
            y = -(row * 180) - (superLayerMaxHeight * 180 / 2) + (layersQtty * 180 / 2);

            loadJson(source, x, y, width, width);
        }
    }*/
    
    this.show = function (duration) {
        var i;
        return;
        
        for (i = 0; i < headers.length; i++ ) {
            $(headers[i]).fadeTo(Math.random() * duration + duration, 1);
        }
    };
    
    this.hide = function (duration) {
        var i;
        return;
        
        for (i = 0; i < headers.length; i++) {
            $(headers[i]).fadeTo(Math.random() * duration + duration, 0);
        }
    };
    
    this.H = headers;
}