/**
 * @class Represents the group of all header icons
 * @param {Number} columnWidth         The number of elements that contains a column
 * @param {Number} superLayerMaxHeight Max rows a superLayer can hold
 * @param {Number} groupsQtty          Number of groups (column headers)
 * @param {Number} layersQtty          Number of layers (rows)
 * @param {Array}  superLayerPosition  Array of the position of every superlayer
 */
function Headers(columnWidth, superLayerMaxHeight, groupsQtty, layersQtty, superLayerPosition) {
    
    // Private constants
    var INITIAL_POS = new THREE.Vector3(0, 0, 8000);
    
    // Private members
    var objects = [],
        dependencies = {
            root : []
        },
        positions = {
            table : [],
            stack : []
        },
        self = this,
        graph = {};
    
    this.dep = dependencies;
    
    // Public methods
    /**
     * Arranges the headers by dependency
     * @param {Number} [duration=2000] Duration in milliseconds for the animation
     */
    this.transformStack = function(duration) {
        var _duration = duration || 2000,
            i, l, container, network;
            

        container = document.createElement('div');
        container.id = 'stackContainer';
        container.style.position = 'absolute';
        container.style.opacity = 0;
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.zIndex = 5;
        document.getElementById('container').appendChild(container);
        
        
        network = new vis.Network(container, graph.data, graph.options);
        
        viewManager.letAlone();
        camera.resetPosition();
        
        setTimeout(function() {
            for(i = 0, l = objects.length; i < l; i++) {

                new TWEEN.Tween(objects[i].position)
                .to({
                    x : positions.stack[i].position.x,
                    y : positions.stack[i].position.y,
                    z : positions.stack[i].position.z
                }, _duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
            }

           new TWEEN.Tween(this)
                .to({}, _duration * 2)
                .onUpdate(render)
                .start();

            self.hide(_duration);
            $(container).fadeTo(_duration, 1);
            
        }, _duration);
    };
    
    /**
     * Arranges the headers in the table
     * @param {Number} [duration=2000] Duration of the animation
     */
    this.transformTable = function(duration) {
        var _duration = duration || 2000,
            i, l;
        
        helper.hide('stackContainer', _duration / 2);
        
        viewManager.transform(viewManager.targets.table);
        
        for(i = 0, l = objects.length; i < l; i++) {
            
            new TWEEN.Tween(objects[i].position)
            .to({
                x : positions.table[i].position.x,
                y : positions.table[i].position.y,
                z : positions.table[i].position.z
            }, _duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
        
        self.show(_duration);
    };
    
    /**
     * Shows the headers as a fade
     * @param {Number} duration Milliseconds of fading
     */
    this.show = function (duration) {
        var i;
        
        for (i = 0; i < objects.length; i++ ) {
            new TWEEN.Tween(objects[i].material)
            .to({opacity : 1, needsUpdate : true}, duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
    };
    
    /**
     * Hides the headers (but donesn't delete them)
     * @param {Number} duration Milliseconds to fade
     */
    this.hide = function (duration) {
        var i;
        
        for (i = 0; i < objects.length; i++) {
            new TWEEN.Tween(objects[i].material)
            .to({opacity : 0, needsUpdate : true}, duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
    };
    
    // Initialization code
    //=========================================================
    
    /**
     * Creates the dependency graph used in vis.js
     * @returns {Object} Object containing the data and options used in vis.js
     */
    var buildGraph = function() {
        
        var i, l, data, edges = [], nodes = [], options,
            level = 0;
            
        var trace = function(root, parent, _level, _nodes, _edges) {
                
                var i, l, child,
                    lookup = function(x) { return x.id == child; };
                
                for(i = 0, l = root.length; i < l; i++) {
                    
                    child = root[i];
                    
                    if(_level !== 0) _edges.push({from : parent, to : child});
                    
                    if($.grep(_nodes, lookup).length === 0)
                    {
                        _nodes.push({
                            id : child,
                            shape : 'image',
                            image : 'images/headers/svg/' + child + '_logo.svg',
                            level : _level
                        });
                    }
                    
                    trace(dependencies[child], child, _level + 1, _nodes, _edges);
                }
            };
        
        trace(dependencies.root, null, level, nodes, edges);
        
        data = {
            edges : edges,
            nodes : nodes
        };
        options = {
            physics:{
                hierarchicalRepulsion: {
                  nodeDistance: 150
                }
              },
            edges:{
                color:{
                    color : '#F26662',
                    highlight : '#E05952',
                    hover: '#E05952'
                }
            },
            layout: {
                hierarchical:{
                    enabled : true,
                    direction: 'DU',
                    levelSeparation: 150,
                    sortMethod : 'directed'
                }
            }
        };
        
        graph = {
            data : data,
            options : options
        };
    };
    
    /**
     * Calculates the stack target position
     */
    var calculateStackPositions = function() {
        
        /*var z = window.camera.getPosition().z - 3500,
            dimensions = {
                width : (objects[0]) ? objects[0].clientWidth : columnWidth * window.TILE_DIMENSION.width,
                height : (objects[0]) ? objects[0].clientHeight : columnWidth * window.TILE_DIMENSION.width,
            },
            i, level = 0;*/
        var i, obj;
        
        // Dummy, send all to center
        for(i = 0; i < objects.length; i++) {
            obj = new THREE.Object3D();
            obj.position.copy(INITIAL_POS);
            positions.stack.push(obj);
        }
        
        
    };
    
    var initialize = function() {
        
        var headerData,
            group,
            column,
            image,
            object,
            slayer,
            row;
            
        function createChildren(child, parents) {
                
                var i, l, actual;
                
                if(parents != null && parents.length !== 0) {

                    for(i = 0, l = parents.length; i < l; i++) {

                        dependencies[parents[i]] = dependencies[parents[i]] || [];
                        
                        actual = dependencies[parents[i]];

                        actual.push(child);
                    }
                }
                else {
                    dependencies.root.push(child);
                }
                
                dependencies[child] = dependencies[child] || [];
            }
        
        function createHeader(src, width, height) {
            
            var geometry = new THREE.PlaneGeometry(width, height),
                material = new THREE.MeshBasicMaterial({transparent : true, opacity : 0}),
                object = new THREE.Mesh(geometry, material);
            
            helper.applyTexture(src, object);
            
            return object;
        }
        
        var src, width, height;
            
        for (group in groups) {
            if (window.groups.hasOwnProperty(group) && group !== 'size') {

                headerData = window.groups[group];
                column = headerData.index;

                
                src = 'images/headers/' + group + '_logo.png';
                width = columnWidth * window.TILE_DIMENSION.width;
                height = width * 443 / 1379;

                object = createHeader(src, width, height);
                
                object.position.copy(INITIAL_POS);

                scene.add(object);
                objects.push(object);

                object = new THREE.Object3D();
                
                object.position.x = (columnWidth * window.TILE_DIMENSION.width) * (column - (groupsQtty - 1) / 2) + ((column - 1) * window.TILE_DIMENSION.width);
                object.position.y = ((layersQtty + 10) * window.TILE_DIMENSION.height) / 2;
                
                positions.table.push(object);

                createChildren(group, headerData.dependsOn);
            }
        }

        for (slayer in superLayers) {
            if (window.superLayers.hasOwnProperty(slayer) && slayer !== 'size') {

                headerData = window.superLayers[slayer];
                row = superLayerPosition[headerData.index];

                src = 'images/headers/' + slayer + '_logo.png';
                width = columnWidth * window.TILE_DIMENSION.width;
                height = width * 443 / 1379;

                object = createHeader(src, width, height);
                
                object.position.copy(INITIAL_POS);

                scene.add(object);
                objects.push(object);
                
                object = new THREE.Object3D();

                object.position.x = -(((groupsQtty + 1) * columnWidth * window.TILE_DIMENSION.width / 2) + window.TILE_DIMENSION.width);
                object.position.y = -(row * window.TILE_DIMENSION.height) - (superLayerMaxHeight * window.TILE_DIMENSION.height / 2) + (layersQtty * window.TILE_DIMENSION.height / 2);
                
                positions.table.push(object);

                createChildren(slayer, headerData.dependsOn);
            }
        }
        
        calculateStackPositions();
        buildGraph();
    };
    
    initialize();
    //=========================================================
}