/**
 * Static object with help functions commonly used
 */
function API() {

    var self = this;

    this.listDevs = {};

    this.getCompsUser = function(callback){

        var url = "";

        var list = {};

        var param;

        //window.session.useTestData();

        if(window.session.getIsLogin()){

            var usr = window.helper.clone(window.session.getUserLogin());

            url = window.helper.SERVER + "/v1/repo/usrs/"+usr._id+"/";

            param = {
                env : window.helper.ENV,
                axs_key : usr.axs_key
            };

            var port = window.helper.buildURL('', param);

            callAjax('comps', port, function(route, res){

               list[route] = res;

                callAjax('layers', port,function(route, res){

                    list[route] = res;

                    callAjax('platfrms', port,function(route, res){

                        list[route] = res;

                        callAjax('suprlays', port,function(route, res){

                            list[route] = res;

                            url = self.getAPIUrl("user");

                            callAjax('', '',function(route, res){

                                self.listDevs = res;

                                callback(list);

                            });
                        });
                    });
                });
            });
        }
        else{

            url = self.getAPIUrl("comps");

            callAjax('', '',function(route, res){

                list = res;

                url = self.getAPIUrl("user");

                callAjax('', '',function(route, res){

                    self.listDevs = res;

                    callback(list);

                });
            });
        }

        function callAjax(route, port, callback){

            $.ajax({
                url: url + route + port,
                method: "GET"
            }).success (
                function (res) {

                    if(typeof(callback) === 'function')
                        callback(route, res);

                });
        }

    };

    this.postRoutesEdit = function(type, route, params, data, doneCallback, failCallback){

        var method = "",
            setup = {},
            usr = window.helper.clone(window.session.getUserLogin()),
            param,
            url;

        param = {
                usrs : usr._id,
                env : window.helper.ENV,
                axs_key : usr.axs_key
            };

        for(var i in data)
            param[i] = data[i];

        route = type + " " + route;

        if(route.match('insert'))
            method = "POST";
        else if(route.match('update'))
            method = "PUT";
        else
            method = "DELETE";

        setup.method = method;
        setup.url = self.getAPIUrl(route, param);
        setup.headers = {
            "Content-Type": "application/json"
             };

        if(params)
            setup.data = params;

        makeCorsRequest(setup.url, setup.method, setup.data,
            function(res){

                switch(route) {

                    case "tableEdit insert":

                        if(res._id){

                            if(typeof(doneCallback) === 'function')
                                doneCallback(res);
                        }
                        else{

                            window.alert('There is already a component with that name in this group and layer, please use another one');

                            if(typeof(failCallback) === 'function')
                                failCallback(res);
                        }

                        break;
                    case "tableEdit update":

                        if(!exists("[component]")){

                            if(typeof(doneCallback) === 'function')
                                doneCallback(res);
                        }
                        else{

                            var name = document.getElementById('imput-Name').value;

                            if(window.fieldsEdit.actualTile.name.toLowerCase() === name.toLowerCase()){

                                if(typeof(doneCallback) === 'function')
                                    doneCallback(res);
                            }
                            else{

                                window.alert('There is already a component with that name in this group and layer, please use another one');

                                if(typeof(failCallback) === 'function')
                                    failCallback(res);
                            }
                        }

                        break;
                    case "wolkFlowEdit insert":

                        if(res._id){

                            if(typeof(doneCallback) === 'function')
                                doneCallback(res);
                        }
                        else{

                            if(typeof(failCallback) === 'function')
                                failCallback(res);
                        }

                        break;
                    case "wolkFlowEdit update":

                            doneCallback(res);
                        
                        break;

                    default:
                            if(typeof(doneCallback) === 'function')
                                    doneCallback(res);
                        break;
                }

            },
            function(res){

                if(typeof(failCallback) === 'function')
                    failCallback(res);
            }
        );

    };

    this.postValidateLock = function(route, data, doneCallback, failCallback){

        var msj = "Component",
            usr = window.helper.clone(window.session.getUserLogin()),
            param = {};

        if(route === "wolkFlowEdit")
            msj = "WolkFlow";

        param = {
                usrs : usr._id,
                env : window.helper.ENV,
                axs_key : usr.axs_key
            };

        for(var i in data)
            param[i] = data[i];

        route = route + " get";

        $.ajax({
            url:  self.getAPIUrl(route, param),
            method: 'GET',
            dataType: 'json',
            success:  function (res) {

                if(res._id)
                    doneCallback();
                else
                    failCallback();
            },
            error: function(res){

                if(res.status === 423){
                    window.alert("This " + msj + " is currently being modified by someone else, please try again in about 3 minutes");
                }
                else if(res.status === 404){
                    window.alert(msj + " not found");
                }
            }
        });
    };

    var makeCorsRequest = function(url, method, params, success, error) {

        //TODO: DELETE THIS IF
        if((method === "PUT" || method === "POST") && !url.match("/comps-devs/") && exists("[Component]")) {
            error();
        }
        else {
            var xhr = createCORSRequest(url, method);

            xhr.setRequestHeader('Content-type','application/json; charset=utf-8');

              if(!xhr) {
                window.alert('CORS not supported');
                return;
              }

            xhr.onload = function() {

                var res = null;

                if(method !== 'DELETE')
                    res = JSON.parse(xhr.responseText);

                success(res);

            };

            xhr.onerror = function() {

                error(arguments);

            };

            if(typeof params !== 'undefined'){

                var data = JSON.stringify(params);

                xhr.send(data);
            }
            else
                xhr.send();
        }

        function createCORSRequest(url, method) {

            var xhr = new XMLHttpRequest();

            if("withCredentials" in xhr)
                xhr.open(method, url, true);
            else
                xhr = null;

            return xhr;
        }
    };

    /**
     * Returns the route of the API server
     * @author Miguel Celedon
     * @param   {string} route The name of the route to get
     * @returns {string} The URL related to the requested route
     */
    this.getAPIUrl = function(route, params) {

        var tail = "";

        switch(route) {

            case "comps":
                tail = "/v1/repo/comps";
                break;
            case "procs":
                tail = "/v1/repo/procs";
                break;
            case "servers":
                tail = "/v1/net/servrs";
                break;
            case "nodes":
                tail = "/v1/net/nodes/:server/childrn";
                break;
            case "login":
                tail = "/v1/auth/login";
                break;
            case "logout":
                tail = "/v1/auth/logout";
                break;
            case "user":
                tail = "/v1/repo/devs";
                break;

            case "tableEdit insert":
                tail = "/v1/repo/usrs/:usrs/comps";
                break;
            case "tableEdit get":
            case 'tableEdit update':
            case 'tableEdit delete':
                tail = "/v1/repo/usrs/:usrs/comps/:comp_id";
                break;
            case "tableEdit insert dev":
                tail = "/v1/repo/usrs/:usrs/comps/:comp_id/comp-devs";
                break;
            case "tableEdit delete dev":
            case "tableEdit update dev":
                tail = "/v1/repo/usrs/:usrs/comps/:comp_id/comp-devs/:devs_id";
                break;

            case "wolkFlowEdit insert":
                tail = "/v1/repo/usrs/:usrs/procs";
                break;
            case "wolkFlowEdit get":    
            case "wolkFlowEdit update":
            case "wolkFlowEdit delete":
                tail = "/v1/repo/usrs/:usrs/procs/:proc_id";
                break;
            case "wolkFlowEdit insert step":
                tail = "/v1/repo/usrs/:usrs/procs/:proc_id/steps";
                break;
            case "wolkFlowEdit delete step":
            case "wolkFlowEdit update step":
                tail = "/v1/repo/usrs/:usrs/procs/:proc_id/steps/:steps_id";
                break;
        }

        return window.helper.buildURL(window.helper.SERVER + tail, params);
    };

    /**
     * TODO: MUST BE DELETED
     * @author Miguelcldn
     * @param {Object} data Post Data
     */
    function exists() { 

        if(window.actualView === 'table'){ 
        
            var group = $("#select-Group").val();
            var layer = $("#select-layer").val();
            var name = $("#imput-Name").val().toLowerCase();
            var type = $("#select-Type").val();
            var location;

            if(!window.TABLE[group].layers[layer])
                return false;
            else
                location = window.TABLE[group].layers[layer].objects;
            

            if(window.tableEdit.formerName){ 

                if(window.tableEdit.formerName.toLowerCase() === name) 
                    return false;
            }
            
            for(var i = 0; i < location.length; i++) {

                if(location[i].data.name.toLowerCase() === name && location[i].data.type === type) {
                    return true;
                }
            }
            
            return false;
        } 
        else{

            return false;
        }
    }
}

/**
 * @class
 * @classdesc The base class that represents a node network
 * @author Miguel Celedon
 */
function BaseNetworkViewer() {
    
    this.nodes = {};
    this.edges = [];
    this.NET_RADIOUS = 1000;
    this.hasFocus = false;
}

BaseNetworkViewer.prototype = {

    /**
     * Loads the node data
     * @author Miguel Celedon
     */
    load : function() {},

    /**
     * Deletes all data loaded to free memory
     * @author Miguel Celedon
     */
    unload : function() {

        for(var node in this.nodes){
            scene.remove(this.nodes[node].sprite);
        }
        this.nodes = {};

        for(var i = 0; i < this.edges.length; i++){
            scene.remove(this.edges[i].line);
        }
        this.edges = [];
        
        window.render();
    },

    /**
     * Redraws everything
     * @author Miguel Celedon
     */
    reset : function() {

        this.show();
    },

    /**
     * Set the camera transition to get closer to the graph
     * @author Miguel Celedon
     */
    configureCamera : function() {},

    /**
     * Sets the camera to target the center of the network
     * @author Miguel Celedon
     */
    setCameraTarget : function() {

        var position = window.camera.getPosition();

        window.camera.setTarget(new THREE.Vector3(position.x, position.y, -this.NET_RADIOUS), 1);
    },

    /**
     * Draws the nodes in the network
     * @author Miguel Celedon
     * @param {Array} networkNodes Array of nodes to draw
     */
    drawNodes : function(networkNodes) {},

    /**
     * Creates a sprite representing a single node
     * @author Miguel Celedon
     * @param   {object}        nodeData      The data of the actual node
     * @param   {THREE.Vector3} startPosition The starting position of the node
     * @returns {Three.Sprite}  The sprite representing the node
     */
    createNode : function(nodeData, startPosition) {
        
        var texture = THREE.ImageUtils.loadTexture(this.PICTURES[nodeData.extra.hardware] || this.PICTURES.desktop);
        texture.minFilter = THREE.NearestFilter;
        
        var sprite = new THREE.Sprite(new THREE.SpriteMaterial({color : 0xffffff, map : texture}));
        sprite.renderOrder = 100;
        //sprite.material.blending = THREE.NoBlending;
        
        var id = nodeData.hash.toString();

        sprite.userData = {
            id : id,
            originPosition : startPosition,
            onClick : this.onNodeClick.bind(this)
        };

        sprite.position.copy(viewManager.translateToSection('network', helper.getOutOfScreenPoint(startPosition.z)));

        this.nodes[id] = nodeData;
        this.nodes[id].sprite = sprite;

        return sprite;
    },

    /**
     * Shows the network nodes
     * @author Miguel Celedon
     * @returns {TWEEN.Tween} The first in the animation chain
     */
    showNodes : function() {
        
        var former = null,
            original = null,
            duration = 2000;
        
        var createTween = function(nodeID, self) {
            
            var actual = self.nodes[nodeID].sprite;
            
            var next = new TWEEN.Tween(actual.position)
                        .to({x : actual.userData.originPosition.x,
                             y : actual.userData.originPosition.y,
                             z : actual.userData.originPosition.z},
                            duration)
                        .easing(TWEEN.Easing.Cubic.InOut);
            
            if(former)
                former.onStart(function() {next.start(); actual.visible = true; });
            else
                original = next;
            
            former = next;
            
        };

        for(var nodeID in this.nodes) {
            
            createTween(nodeID, this);
            
        }
        
        //Send empty tween if there is nothing to do
        return original || new TWEEN.Tween(this).to({}, 1);
    },

    /**
     * Hide all nodes
     * @author Miguel Celedon
     * @param {Array}       [excludedIDs] Array of IDs that will be kept visible
     * @returns {TWEEN.Tween} The first in the animation chain
     */
    hideNodes : function(excludedIDs) {
        
        excludedIDs = (typeof excludedIDs !== "undefined") ? excludedIDs : [];
        
        var former = null,
            original = null,
            duration = 2000;
        
        var createTween = function(nodeID, self) {
            
            if(!excludedIDs.includes(nodeID)) {
                
                var actual = self.nodes[nodeID].sprite;
                var target = helper.getOutOfScreenPoint(actual.position.z, 'network');
                
                var next = new TWEEN.Tween(actual.position)
                            .to({x : target.x,
                                 y : target.y,
                                 z : target.z},
                                duration)
                            .easing(TWEEN.Easing.Cubic.InOut)
                            .onComplete(function() { actual.visible = false; });
                
                if(former)
                    former.onStart(function() { next.start(); });
                else
                    original = next;
                
                former = next;
            }
        };

        for(var nodeID in this.nodes) {
            
            createTween(nodeID, this);
        
        }
        
        //Send empty tween if there is nothing to do
        return original || new TWEEN.Tween(this).to({}, 1);
    },

    /**
     * Draws all adjacencies between the nodes
     * @author Miguel Celedon
     */
    createEdges : function() {

        for(var nodeID in this.nodes) {

            var origin, dest;
            var node = this.nodes[nodeID];

            origin = node.sprite.userData.originPosition;

            for(var i = 0; i < node.children.length; i++) {

                var actualEdge = node.children[i];

                if(this.nodes.hasOwnProperty(actualEdge.id) && this.edgeExists(nodeID, actualEdge.id) === -1) {

                    dest = this.nodes[actualEdge.id].sprite.userData.originPosition;

                    var lineGeo = new THREE.Geometry();
                    lineGeo.vertices.push(origin, dest);

                    var line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({color : 0x000000, transparent : true, opacity : 0}));

                    scene.add(line);
                    this.edges.push({
                        from : nodeID,
                        to : actualEdge.id,
                        line : line
                    });
                }
            }
        }
    },

    /**
     * Show the edges
     * @author Miguel Celedon
     * @returns {TWEEN.Tween} The first in the animation chain
     */
    showEdges : function() {

        var duration = 2000,
            former = null,
            original = null;
        
        var createTween = function(i, self) {
            
            var actual = self.edges[i].line;
            
            var next = new TWEEN.Tween(actual.material)
            .to({opacity : 1}, duration);
            
            if(former)
                former.onStart(function() { actual.visible = true; next.start(); });
            else
                original = next;
            
            former = next;
            
        };

        for(var i = 0; i < this.edges.length; i++) {
            createTween(i, this);
        }
        
        //Send empty tween if there is nothing to do
        return original || new TWEEN.Tween(this).to({}, 1);
    },

    /**
     * Hides the edges immediately
     * @author Miguel Celedon
     * @param {Array}         [excludedIDs] Array of IDs that will be kept visible
     */
    hideEdges : function(excludedIDs) {

        var duration = 250;
        
        excludedIDs = (typeof excludedIDs !== "undefined") ? excludedIDs : [];
        
        var createTween = function(i, self) {
            
            if(!excludedIDs.includes(i)) {
            
                var actual = self.edges[i].line;

                var next = new TWEEN.Tween(actual.material)
                            .to({opacity : 0}, duration).onComplete(function() {actual.visible = false;}).start();
            }
        };

        for(var i = 0; i < this.edges.length; i++) {
            createTween(i, this);
        }
    },
    
    show : function() {
        this.showNodes()
        .chain(this.showEdges())
        .start();
        window.helper.forceTweenRender(6000);
    },
    
    hide : function(excludedNodes, excludedEdges) {
        
        this.hideEdges(excludedEdges);
        this.hideNodes(excludedNodes).start();
        window.helper.forceTweenRender(6000);
    },

    /**
     * Checks if an edge already exists
     * @author Miguel Celedon
     * @param   {string} from ID of one node
     * @param   {string} to   ID of the other node
     * @returns {number} The index in the edges array, -1 if not found
     */
    edgeExists : function(from, to) {

        for(var i = 0; i < this.edges.length; i++) {
            var edge = this.edges[i];

            if((edge.from === from && edge.to === to) || (edge.to === from && edge.from === to))
                return i;
        }

        return -1;
    },

    test_load : function() {

        var networkNodes = [];
        var NUM_NODES = 25,
            MAX_CONNECTIONS = 10;
        
        var TYPES = ['desktop', 'server', 'phone', 'tablet'];

        for(var i = 0; i < NUM_NODES; i++) {

            var node = {
                id : i,
                edges : [],
                subType : TYPES[Math.floor(Math.random() * 10) % 2]
            };

            var connections = Math.floor(Math.random() * MAX_CONNECTIONS);

            for(var j = 0; j < connections; j++) {

                node.edges.push({
                    id : Math.floor(Math.random() * NUM_NODES)
                });
            }

            networkNodes.push(node);
        }

        return networkNodes;
    },

    /**
     * To be executed when a nodes is clicked
     * @author Miguel Celedon
     * @param {object} clickedNode The clicked node
     */
    onNodeClick : function(clickedNode) {
        
        var goalPosition = new THREE.Vector3(0, -2500, 9000);
        goalPosition.add(clickedNode.position);

        window.camera.move(goalPosition.x, goalPosition.y, goalPosition.z, 2000);

        goalPosition.z -= 9000;
        window.camera.setTarget(goalPosition, 1000);
    },
    
    /**
     * Action to open the details about a node
     * @author Miguel Celedon
     */
    open : function() {},
    
    /**
     * Action to close the details of a node
     * @author Miguel Celedon
     */
    close : function() {},
    
    PICTURES : {
        server : "/images/network/server.png",
        desktop : "/images/network/desktop.png",
        phone : "/images/network/phone.png",
        actor : "/images/network/actor.png",
        tablet : "/images/network/tablet.png"
    }
};
/**
 * @author Ricardo Delgado
 * @last modified By Miguel Celedon
 * function create a Buttons Browser and charge your textures
 */
function BrowserManager() {

       this.objects = {
            mesh : []
        };

    var self = this;
    
    var wide = (Math.floor(window.camera.aspectRatio * 10) !== Math.floor(40/3));
    
    var LOWER_LAYER = 63000,
        POSITION_X = (wide) ? 15000 : 12000,
        POSITION_Y = (wide) ? 7500 : 8000,
        SCALE = (wide) ? 70 : 40;

    var onClick = function(target) {

       actionButton(target.userData.view);

    };

     /**
     * @author Ricardo Delgado
     * Pressed button function.
     * @param {String} view  vista a cargar
     */
    function actionButton(view) {

       window.goToView(view);

    }

   /**
     * @author Ricardo Delgado
     * Button changes the value legend.
     * @param {Number}  valor    value of opacity.
     * @param {String} display   button status.
     */
   this.modifyButtonLegend = function(valor, display) {
    
      var browserButton = document.getElementById('legendButton');
      
      $(browserButton).fadeTo(1000, valor, function() {

            $(browserButton).show();

            browserButton.style.display = display;

      });
  
   };

   /**
    * @author Ricardo Delgado
    * Initialization of the arrows
    */
   this.init = function() {
       
        for(var view in window.map.views) {
            loadView(view);
        }

   };
    
   /**
    * @author Ricardo Delgado
    * Loading the necessary views and arrows according to varible map. 
    * @param {String} view  view to load
    */
    function loadView(view) {
        
        var directions = ['up', 'down', 'right', 'left'];

        var newCenter = new THREE.Vector3(0, 0, 0);
        newCenter = window.viewManager.translateToSection(view, newCenter);
        
        if(window.map.views[view].enabled !== true)
            showSign(newCenter);
        
        var dir = '';

        for(var i = 0; i < directions.length; i++) {
            
            //Get up, down, left and right views
            dir = window.map.views[view][directions[i]];
            
            if(dir !== '')
                addArrow(dir, newCenter.x, newCenter.y, directions[i]);
        }

    }
    
    /**
     * Shows a sign in the given position
     * @author Miguel Celedon
     * @param {THREE.Vector3} center Center of the sign
     */
     
    function showSign(center) {
        
        var newCenter = center.clone();
        newCenter.z = LOWER_LAYER;
        
        var texture = THREE.ImageUtils.loadTexture('images/sign.png');
        texture.minFilter = THREE.NearestFilter;
        
        //Create placeholder for now
        var sign = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(8000, 6000),
            new THREE.MeshBasicMaterial({color : 0xFFFFFF, map : texture})
        );
        
        sign.position.copy(newCenter);
        
        window.scene.add(sign);
    }

   /**
     * @author Ricardo Delgado
     * creating arrows.
     * @param {String}   view    view load.
     * @param {Number}  center   camera Center.
     * @param {String}  button   position arrow.
     */
   function addArrow(view, centerX, centerY, button) {

        var mesh,
            _position,
            id = self.objects.mesh.length;

        mesh = new THREE.Mesh(
               new THREE.PlaneBufferGeometry(60, 60),
               new THREE.MeshBasicMaterial({ map:null , side: THREE.FrontSide, transparent: true }));
    
       _position = calculatePositionArrow(centerX, centerY, button);

       mesh.position.set(_position.x, _position.y, _position.z);

       mesh.scale.set(SCALE, SCALE, SCALE);

       mesh.userData = { 
        id : id ,
        arrow : button, 
        view : view,
        onClick : onClick };

       mesh.material.opacity = 1;
    
       window.scene.add(mesh);
    
       self.objects.mesh.push(mesh);

       addTextura(view, button, mesh);

   }

   /**
     * @author Ricardo Delgado
     * Calculate Position Arrow .
     * @param {Number}  center   camera Center.
     * @param {String}  button   position arrow.
     */
   function calculatePositionArrow(centerX, centerY, button) {

      var position = {},
          x = centerX,
          y = centerY,
          z = 80000 * -2; 

     if(button === "right")
         x = centerX + POSITION_X; 
     else if(button === "left")
         x = centerX + (POSITION_X * -1);
     else if(button === "up")
         y = centerY + POSITION_Y;
     else 
         y = centerY + (POSITION_Y * -1);

     position = { x: x, y: y, z: z };

     return position;

   }

   /**
     * @author Ricardo Delgado
     * Creates textures arrows and stored in the variable texture.
     * @param {String}   view    view.
     * @param {String}  button   image to use.
     * @param {object}   mesh    button to load texture.
     */
   function addTextura(view, button, mesh) {
       
        var canvas,
            ctx,
            img = new Image(),
            texture,
            config = configTexture(view, button);

        canvas = document.createElement('canvas');
        canvas.width  = 400;
        canvas.height = 370;

        ctx = canvas.getContext("2d");
        ctx.globalAlpha = 0.90;

        img.src = "images/browsers_arrows/arrow-"+button+".png";

        img.onload = function() {

            ctx.textAlign = 'center';

            ctx.font = config.text.font;
            window.helper.drawText(config.text.label, 200, config.image.text, ctx, canvas.width, config.text.size);
            ctx.drawImage(img, config.image.x, config.image.y, 200, 200);

            texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;  
            texture.minFilter = THREE.NearestFilter;

            mesh.material.map = texture;
            mesh.material.needsUpdate = true;

            animate(mesh, LOWER_LAYER, 3000);

        };

   }

   /**
     * @author Ricardo Delgado
     * Configures all texture options.
     * @param {String}   view    view.
     * @param {String}  button   image to use.
     */
   function configTexture(view, button) {
     
    var config = {},
        text = {},
        image = {},
        label;

    if(button !== "down")  
        image = { x: 100, y : 0, text : 238 };
    else 
        image = { x: 100, y : 120, text : 108 };
 

    label = window.map.views[view].title;


    text = { label : label, font: "48px Canaro, Sans-serif", size : 48 };

    config = { image : image, text : text };

    return config;

   }

   /**
     * @author Ricardo Delgado.
     * Animate Button.
     * @param {Object}     mesh        Button.
     * @param {Number}     target      The objetive Z position.
     * @param {Number} [duration=2000] Duration of the animation.
     */
   function animate(mesh, target, duration) {

        var _duration = duration || 2000,
            z = target;

        new TWEEN.Tween(mesh.position)
            .to({z : z}, _duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .onUpdate(window.render)
            .start();

   }

}
/**
 * @author Ricardo Delgado
 */
function ButtonsManager() {

    this.objects = {
        left : { 
            buttons : []
        },
        right : {
            buttons : []
        }
    };

    var self = this;

    /**
     * @author Ricardo Delgado
     * All the buttons and their functions are added.
     * @param {String} id  Tile ID.
     */
    this.actionButtons = function(id, callback){

        self.removeAllButtons();

        if(window.helper.getSpecificTile(id).data.author) {

            self.createButtons('developerButton', 'View developer', function(){

                self.removeAllButtons();
                
                if(typeof(callback) === 'function')
                    callback();

            });
        }

        window.screenshotsAndroid.showButtonScreenshot(id);

        window.tableEdit.addButton(id);
    };

    /**
     * @author Ricardo Delgado
     * creation of button and its function is added.
     * @param {String}  id  Button ID.
     * @param {String} text  Button text.
     * @param {Function} callback Function to call when finished.    
     */
    this.createButtons = function(id, text, callback, _x, _type, _side){

        if(!document.getElementById(id)){ 

            var object = {
                id : id,
                text : text
              };

            var x = _x || 5,
                type = _type || 'button',
                side = _side || 'left',
                idSucesor = "backButton";

            if(side === 'right')
                idSucesor = '';

            if(self.objects[side].buttons.length !== 0)
                idSucesor = helper.getLastValueArray(self.objects[side].buttons).id;



            var button = document.createElement(type),
                sucesorButton = document.getElementById(idSucesor);
                      
            button.id = id;
            button.className = 'actionButton';
            button.style.position = 'absolute';
            button.innerHTML = text;
            button.style.top = '10px';
            button.style[side] = calculatePosition(sucesorButton, side, x);
            button.style.zIndex = 10;
            button.style.opacity = 0;

            button.addEventListener('click', function() {

                    if(typeof(callback) === 'function')
                        callback(); 

                });

            document.body.appendChild(button);

            self.objects[side].buttons.push(object);

            window.helper.show(button, 1000);

            return button;
        }
    };

    /**
     * @author Ricardo Delgado
     * Eliminates the desired button.
     * @param {String}  id  Button ID.
     * @param {Function} callback Function to call when finished.    
     */
    this.deleteButton = function(id, _side, callback){

        var side = _side || 'left';

        for(var i = 0; i < self.objects[side].buttons.length; i++){

            if(self.objects[side].buttons[i].id === id){
                self.objects[side].buttons.splice(i,1);
                window.helper.hide($('#'+id), 1000, callback);
                
            }
        }
    };

    /**
     * @author Ricardo Delgado
     * Removes all created buttons. 
     */
    this.removeAllButtons = function(){

        if(self.objects.left.buttons.length !== 0 || self.objects.right.buttons.length !== 0){

            var side = 'left';

            if(self.objects[side].buttons.length === 0)
                side = 'right';

            var actualButton = self.objects[side].buttons.shift();

            if($('#'+actualButton.id) != null) 
                window.helper.hide($('#'+actualButton.id), 1000); 
            
                self.removeAllButtons();
        }
        else
            window.fieldsEdit.removeAllFields();
    };

    function calculatePosition(sucesorButton, side, x){

        if(side === 'left')
            return ((sucesorButton.offsetLeft + sucesorButton.clientWidth + x) + 'px');
        else {
            if(!sucesorButton)
                return (x + 'px'); 
            else
                return ((window.innerWidth - sucesorButton.offsetLeft + x) + 'px');
        }
    
    }

}
var ROTATE_SPEED = 1.3,
        MIN_DISTANCE = 50,
        MAX_DISTANCE = 90000;

/**
 *
 * @class Camera
 *
 * @param  {Position}
 * @param  {Renderer}
 * @param  {Function}
 */
function Camera(position, renderer, renderFunc) {
    /**
     * private constans
     */

    /**
     * private properties
     */    
    var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, MAX_DISTANCE);
    var controls = new THREE.TrackballControls(camera, renderer.domElement);
    var focus = null;
    var self = this;
    var rendering = false;
    
    var fake = new THREE.Object3D();
    fake.position.set(MAX_DISTANCE, MAX_DISTANCE, -MAX_DISTANCE);
    
    camera.position.copy(position);

    controls.rotateSpeed = ROTATE_SPEED;
    controls.noRotate = true;
    controls.noPan = true;
    controls.minDistance = MIN_DISTANCE;
    controls.maxDistance = MAX_DISTANCE;
    controls.addEventListener('change', renderFunc);
    controls.position0.copy(position);
    
    // Public properties
    this.dragging = false;
    this.aspectRatio = camera.aspect;
    this.moving = false;
    this.freeView = false;
    
    this.controls = controls;
    
    // Public Methods
    
    this.enableFreeMode = function() {
        controls.noRotate = false;
        controls.noPan = false;
        camera.far = MAX_DISTANCE * 2;
        controls.maxDistance = Infinity;
        self.onWindowResize();
        self.freeView = true;
    };
    
    this.disableFreeMode = function() {
        controls.noRotate = true;
        controls.noPan = true;
        camera.far = MAX_DISTANCE;
        controls.maxDistance = MAX_DISTANCE;
        self.onWindowResize();
        //self.freeView = false;
    };
    
    /**
     * Returns the max distance set
     * @returns {Number} Max distance constant
     */
    this.getMaxDistance = function() { 
        return MAX_DISTANCE; 
    };

    /**
     * @method disable disables camera controls
     */
    this.disable = function() {
        controls.enabled = false;
    };
    
    /**
     *
     * @method enable enables camera controls
     */
    this.enable = function() {
        controls.enabled = true;
    };
    
    /**
     * Returns a copy of the actual position
     * @returns {THREE.Vector3} Actual position of the camera
     */
    this.getPosition = function() {
        return camera.position.clone();
    };
    
    this.setTarget = function(target, duration) {
        
        duration = (duration !== undefined) ? duration : 2000;
        
        new TWEEN.Tween(controls.target)
        .to({x : target.x, y : target.y, z : target.z}, duration)
        .onUpdate(window.render)
        .start();
    };
    
    /**
     * 
     * @method setFocus sets focus to a target given its id
     *
     * @param {Number} id       target id
     * @param {Number} duration animation duration time
     * @param {Object} target  target of the focus
     * @param {Vector} offset  offset of the focus
     */

    /**
     * Sets the focus to one object
     * 
     * @author Miguel Celedon
     * @param {THREE.Object3D} target          The target to see
     * @param {THREE.Vector3}  offset          The distance and position to set the camera
     * @param {number}         [duration=3000] The duration of the animation
     */
    this.setFocus = function(target, offset, duration){

        duration = duration || 3000;
        focus = target;

        self.render(renderer, scene); 
        offset.applyMatrix4(target.matrix);

        new TWEEN.Tween(camera.position)
            .to({ x: offset.x, y: offset.y, z: offset.z }, duration)
            .onComplete(render)
            .start();
        
        self.setTarget(target.position, duration / 2);

        new TWEEN.Tween(camera.up)
            .to({ x: target.up.x, y: target.up.y, z: target.up.z }, duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
    };

    /**
     *
     * @method loseFocus    loses focus from target
     *
     */
     
    this.loseFocus = function() {
        
        if(focus != null) {
            var backButton = document.getElementById('backButton');
            $(backButton).fadeTo(0, 0, function() { backButton.style.display = 'none'; });
            $('#sidePanel').fadeTo(1000, 0, function() { $('#sidePanel').remove(); });
            $('#elementPanel').fadeTo(1000, 0, function() { $('#elementPanel').remove(); });
            $('#timelineButton').fadeTo(1000, 0, function() { $('#timelineButton').remove(); });
            if($('#tlContainer') != null)
                helper.hide($('#tlContainer'), 1000);
            $(renderer.domElement).fadeTo(1000, 1);

            focus = null;
            
            window.buttonsManager.removeAllButtons();
        }
    };
    
    /**
     *
     * @method onWindowResize   execute in case of window resizing
     * 
     */
    this.onWindowResize = function() {
        var innerWidth = window.innerWidth,
            innerHeight = window.innerHeight;
        
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        self.aspectRatio = camera.aspect;

        renderer.setSize(innerWidth, innerHeight);

        render();
    };
    
    /**
     *
     * @method onKeyDown    execute in case of key down pressed
     *
     * @param {Event} event event to listen to
     * 
     */
    this.onKeyDown = function(event) {
        
        if(event.keyCode === 27 /* ESC */) {
            //TWEEN.removeAll();
            var duration = 2000;

            if(viewManager.views && viewManager.views[window.actualView])
                viewManager.views[window.actualView].reset();

            self.resetPosition(duration);
        }
    };
    
    /**
     * Resets the camera position
     * @param {Number} [duration=2000] Duration of the animation
     */
    this.resetPosition = function(duration) {
        
        duration = duration || 2000;
        self.disable();
        
        var target = window.viewManager.translateToSection(window.actualView, controls.position0);
        
        if(self.freeView) {
            
            var targetView = window.viewManager.translateToSection(window.actualView, new THREE.Vector3(0, 0, 0));
            
            new TWEEN.Tween(controls.target)
                    .to({ x: targetView.x, y: targetView.y, z: targetView.z }, duration)
                    //.easing( TWEEN.Easing.Cubic.InOut )
                    .start();
        }

            new TWEEN.Tween(camera.position)
                .to({ x: target.x, y: target.y, z: target.z }, duration)
                //.easing( TWEEN.Easing.Exponential.InOut )
                .onUpdate(function(){ 
                    if(!self.freeView)
                     controls.target.set(camera.position.x, camera.position.y, 1); 
                })
                .onComplete(function() {
                    self.enable();
                    self.disableFreeMode();
                })
                .start();

            new TWEEN.Tween(camera.up)
                .to({ x: 0, y: 1, z: 0 }, duration)
                //.easing( TWEEN.Easing.Exponential.InOut )
                .start();
    };
    
    /**
     *
     * @method update    updates camera controls  
     *
     */
    this.update = function() {
        
        if(controls.noPan === true && Math.ceil(camera.position.z) !== controls.position0.z) {
            
            controls.noPan = false;
        
            if(self.freeView === true)
                self.enableFreeMode();
            
            if(window.viewManager && window.actualView)
                window.viewManager.views[window.actualView].zoom();
        }
        else if(controls.noPan === false && Math.ceil(camera.position.z) === controls.position0.z && self.freeView === false)
            this.onKeyDown({keyCode : 27}); //Force reset if far enough
        
        controls.update();
        self.dragging = controls.dragging;
    };
    
    /**
     *
     * @method render    renders an scene
     *
     * @param {Renderer} renderer renderer for camera
     * @param {Scene}    scene    scene to render
     *
     */
    this.render = function(renderer, scene) {
        
        var cam;
        
        if(rendering === false) {
            
            rendering = true;

            scene.traverse(function (object) {

                if(object instanceof THREE.LOD) {

                    if(object.userData.flying === true)
                        cam = fake;
                    else
                        cam = camera;

                    object.update(cam);
                }
            });

            renderer.render(scene, camera);
            
            rendering = false;
        }
        else
            console.log("Render ignored");
    };
    
    /**
     *
     * @method getFocus gets focused target
     *
     * @return {Number} focused target
     */
    this.getFocus = function() { 
        return focus;
    };
    
    /**
     * Casts a ray between the camera to the target
     * @param   {Object} target   Vector2D target
     * @param   {Array}  elements Array of elements expected to collide
     * @returns {Array}  All intercepted members of elements
     */
    this.rayCast = function(target, elements) {
        
        var raycaster = new THREE.Raycaster();
        
        raycaster.setFromCamera(target, camera);
        
        /* Debug code, draw lines representing the clicks 
 
        var mat = new THREE.LineBasicMaterial({color : 0xaaaaaa});
        var g = new THREE.Geometry();
        var r = raycaster.ray;
        var dest = new THREE.Vector3(r.origin.x + r.direction.x * MAX_DISTANCE, r.origin.y + r.direction.y * MAX_DISTANCE, r.origin.z + r.direction.z * MAX_DISTANCE);

        g.vertices.push( r.origin, dest);

        var line = new THREE.Line(g, mat);

        scene.add(line);*/
        
        return raycaster.intersectObjects(elements);
    };
    
    /**
     * Moves the camera to a position
     * @author Miguel Celedon
     * @param {Number}  x               X coordinate
     * @param {Number}  y               Y coordinate
     * @param {Number}  z               Z coordinate
     * @param {Number}  [duration=2000] Milliseconds of the animation
     * @param {boolean} [synced]        If true, moves like it were not in free view
     */
    this.move = function(x, y, z, duration, synced) {
        
        var _duration = duration || 2000;
        synced = synced || false;
        
        var tween = null;
        
        if(window.helper.isValidVector({x : x, y : y, z : z})) {
            
            tween = new TWEEN.Tween(camera.position)
                    .to({x : x, y : y, z : z}, _duration)
                    .easing(TWEEN.Easing.Cubic.InOut)
                    .onUpdate(function(){
                        if(!self.freeView || synced)
                            controls.target.set(camera.position.x, camera.position.y, 0);

                        window.render();
                    });
            
            var next = new TWEEN.Tween(camera.up)
                        .to({x : 0, y : 1, z : 0}, _duration)
                        .easing(TWEEN.Easing.Cubic.InOut);
            
            tween.onStart(function() { next.start(); });
            tween.start();
            
        }
        else
            window.alert("Error: this is not a valid vector (" + x + ", " + y + ", " + z + ")"); 
    };
    
    /**
     * Locks the panning of the camera
     */
    this.lockPan = function() {
        controls.noPan = true;
    };
    
    /**
     * Unlocks the panning of the camera
     */
    this.unlockPan = function() {
        controls.noPan = false;
    };
    
    // Events
    window.addEventListener('resize', this.onWindowResize, false);
    window.addEventListener('keydown', this.onKeyDown, false);
}
/**
 * Command Line Interface. Contains functions defined to be used when debugging
 * @author Miguel Celedon
 */
function CLI() {
    
    /**
     * Used to execute a condition through an array
     * @author Miguel Celedon
     * @param   {Array}    list      The source of the search
     * @param   {function} condition A function receiving the actual element and must return true or false
     * @returns {Array}    Set of indices of that array that complies the condition
     */
    this.query = function(list, condition) {
        
        var found = [];
        
        for(var i in list) {
            if(condition(list[i]))
                found.push(i);
        }
        
        return found;
    };
    
    /**
     * This function is meant to be used only for testing in the debug console,
     * it cleans the entire scene so the website frees some memory and so you can
     * let it in the background without using so much resources.
     * @author Miguel Celedon
     */
    this.shutDown = function() {

        scene = new THREE.Scene();

    };
    
    /**
     * Executes a click event on a tile
     * @author Miguel Celedon
     * @param {number} id The ID (position in the table) of the element
     */
    this.forceElementClick = function(id) {
        
        var obj = window.objects[id].levels[0].object;
        
        obj.userData.onClick(obj);
        
    };
    
    /**
     * Moves the camera to a distances so the tiles and elements gets the respective quality
     * @author Miguelcldn
     * @param {string} qa Can be {"mini" | "small" | "medium" | "high"}
     */
    this.goToQuality = function(qa) {
        var qs = window.tileManager.levels;
        var pos = window.camera.getPosition();
        
        window.camera.move(pos.x, pos.y, qs[qa] + 1);
    };
}

var CLI = new CLI();
function ClientsViewer(parentNode) {
    
    BaseNetworkViewer.call(this);
    
    this.parentNode = parentNode;
    this.childNetwork = null;
    
    //this.parentNode.hide(parentNode.userData.id);
}

ClientsViewer.prototype = Object.create(BaseNetworkViewer.prototype);
ClientsViewer.prototype.constructor = ClientsViewer;

ClientsViewer.prototype.load = function() {
    
    var baseUrl = window.API.getAPIUrl("nodes", {server : this.parentNode.userData.id});
    
    $.ajax({
        url : baseUrl,
        method : "GET",
        context: this
    }).success(function(data) {
        
        this.NET_RADIOUS = (data.children.length - 1) * this.NET_RADIOUS;
        this.drawNodes(data.children);
        
    }).error(function(request, error) {
        
        window.console.log("Error: " + error);
        window.alert("Error, please check the console and inform on github");
    });
    
};

/**
 * @override
 * Executed when a node is clicked, moves the camera and draw its childs
 * @author Miguel Celedon
 * @param {object} clickedNode The clicked node
 */
ClientsViewer.prototype.onNodeClick = function(clickedNode) {
    
    /*Disabled as there is no lower level for now
    if(this.childNetwork === null) {
        
        TWEEN.removeAll();
        
        BaseNetworkViewer.prototype.onNodeClick.call(this, clickedNode);

        this.hide([clickedNode.userData.id], clickedNode.userData.id);
        
        //this.childNetwork = new ClientsViewer(clickedNode);
        this.childNetwork = new ServicesViewer(clickedNode);
        
        this.open();
    }*/
};

ClientsViewer.prototype.open = function() {
    
    //Right now it has no sub-level
    //this.childNetwork.load();
};

/**
 * Draws the nodes in the network
 * @author Miguel Celedon
 * @param {Array} networkNodes Array of nodes to draw
 */
ClientsViewer.prototype.drawNodes = function(networkNodes) {

    for(var i = 0; i < networkNodes.length; i++) {
        
        var halfRadious = (this.NET_RADIOUS / 2) * 7;

        var position = new THREE.Vector3(
            (Math.random() * halfRadious * 2) - halfRadious,
            - (Math.random() * halfRadious + halfRadious),
            (Math.random() * halfRadious * 2) - halfRadious);
        
        position.add(this.parentNode.position);

        var sprite = this.createNode(networkNodes[i], position);

        sprite.scale.set(1000, 1000, 1.0);

        window.scene.add(sprite);
    }

    this.createEdges();
    
    this.show();
};

ClientsViewer.prototype.createEdges = function() {
    
    for(var nodeID in this.nodes) {
        
        var origin = this.nodes[nodeID].sprite.userData.originPosition;
        var dest = this.parentNode.position;
        
        var lineGeo = new THREE.Geometry();
        lineGeo.vertices.push(origin, dest);

        var line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({color : 0x0000ff, transparent : true, opacity : 0}));

        scene.add(line);
        
        this.edges.push({
            from : nodeID,
            to : this.parentNode.userData.id,
            line : line
        });
    }
    
    //Not needed now
    //BaseNetworkViewer.prototype.createEdges.call(this);
};

/**
 * Hide edges except the one connecting to the parent
 * @author Miguel Celedon
 * @param   {string}      clickedID The ID of the clicked node to except its edge hiding
 * @returns {TWEEN.Tween} The first in the tween chain
 */
ClientsViewer.prototype.hideEdges = function(clickedID) {
    
    var edgeID = this.edgeExists(this.parentNode.userData.id, clickedID);
    
    return BaseNetworkViewer.prototype.hideEdges.call(this, [edgeID]);
    
};

/**
 * Closes and unloads the child, if the child is open, closes it
 * @author Miguel Celedon
 * @returns {object} The reference to itself, if there was no children I'll return null
 */
ClientsViewer.prototype.closeChild = function() {
    
    var self = null;
    
    if(this.childNetwork !== null){
        
        //If the child is closed we need the parent to reset focus
        var parent = this.childNetwork.parentNode;
        
        this.childNetwork = this.childNetwork.closeChild();
        
        self = this;
        
        //If direct child is closed, show its brothers
        if(this.childNetwork === null)
            this.reset();
    }
    else {
        
        var that = this;
        this.hide();
        
        setTimeout(function() {
            that.close();
            that.unload();
        }, 2000);
    }
    
    return self;
    
};
var configAPIUrl = {
		trueData : {
			server : 'http://api.fermat.org',
			port : {
				devs : 'env=development'
			},
			route : {
				comps : '/v1/repo/comps',
				procs : '/v1/repo/procs',
				user : '/v1/repo/devs',
				servers : '/v1/network/servers',
				nodes : '/v1/network/node',
				login : '/v1/auth/login',
				logout : '/v1/auth/logout'
			}
		},
		testData : {
			server : 'json/testData',
			port : {
				devs : ''
			},
			route : {
				comps : 'comps.json',
				procs : 'procs.json',
				user : 'devs.json',
				servers : 'servers.json',
				nodes : 'node.json'
			}
		}
};


var test_map = {load : "table",table : {top : "",bottom : "",right : "stack",left : ""},stack : {top : "",bottom : "",right : "",left : "table"} };
var testFlow = [
    {
        "platfrm": "CBP",
        "name": "connection request from customer to broker",
        "desc": "a customer sends a connection request to crypto broker in order to be able to see his products and start a negotiation.",
        "prev": "list crypto brokers",
        "next": null,
        "steps": [
            {
                "id": 0,
                "title": "select broker and submit request",
                "desc": "the customer selects a broker from the list and submits the request to connect to him.",
                "type": "start",
                "next": [
                    {
                        "id": "1",
                        "type": "direct call"
                    }
                ],
                "name": "crypto broker community",
                "layer": "sub app",
                "platfrm": "CBP"
            },
            {
                "id": 1,
                "title": "route request to network service",
                "desc": "the module routes this request to the network service to reach the selected broker.",
                "type": "activity",
                "next": [
                    {
                        "id": "2",
                        "type": "direct call"
                    }
                ],
                "name": "crypto broker community",
                "layer": "sub app module",
                "platfrm": "CBP"
            },
            {
                "id": 2,
                "title": "call the broker to deliver the request",
                "desc": "the network service places a call to the broker and then it delivers the request via the fermat network.",
                "type": "activity",
                "next": [
                    {
                        "id": "1",
                        "type": "direct call"
                    }
                ],
                "name": "crypto broker",
                "layer": "actor network service",
                "platfrm": "CBP"
            }
        ],
        "upd_at": "5629db8be934756e08c9751a",
        "_id": "5629db8be934756e08c9751b"
    }
];
var testNetworkNodes = [
    {
        id : "server0",
        type : "node",
        subType : "server",
        os : "linux",
        ady : [
            {
                id : "server1",
                linkType : "connected"
            }
        ]
    },
    {
        id : "server1",
        type : "node",
        subType : "server",
        os : "windows",
        ady : [
            {
                id : "server2",
                linkType : "connected"
            }
        ]
    },
    {
        id : "server2",
        type : "node",
        subType : "pc",
        os : "linux",
        ady : []
    }
];
var testNetworkClients = {
    server0 : [
        {
            id : "client0",
            type : "client",
            subType : "phone",
            ady : [
                {
                    id : "server0",
                    linkType : "connected"
                },
                {
                    id : "client3",
                    from : "nService0",
                    linkType : "connected"
                }
            ]
        },
        {
            id : "client1",
            type : "client",
            subType : "pc",
            ady : [
                {
                    id : "server0",
                    linkType : "connected"
                }
            ]
        },
        {
            id : "client2",
            type : "client",
            subType : "phone",
            ady : [
                {
                    id : "server0",
                    linkType : "connected"
                }
            ]
        }
    ],
    server1 : [
        {
            id : "client3",
            type : "client",
            subType : "phone",
            ady : [
                {
                    id : "server1",
                    linkType : "connected"
                },
                {
                    id : "client0",
                    from : "nService0",
                    linkType : "connected"
                }
            ]
        }
    ],
    server2 : []
};
var testNetworkServices = {
    client0 : [
        {
            id : "wallet0",
            type : "wallet",
            subType : "bitcoin_wallet",
            currency : "bitcoin",
            symbol : "BTC",
            balance : "0.0123",
            ady : [
                {
                    id : "client0",
                    linkType : "installed"
                }
            ]
        },
        {
            id : "nService0",
            type : "nservice",
            subType : "ukn_service",
            ady : [
                {
                    id : "client0",
                    linkType : "running"
                }
            ]
        },
        {
            id : "nService1",
            type : "nservice",
            subType : "ukn_service",
            ady : [
                {
                    id : "client0",
                    linkType : "running"
                }
            ]
        },
        {
            id : "nService2",
            type : "nservice",
            subType : "ukn_service",
            ady : [
                {
                    id : "client0",
                    linkType : "running"
                }
            ]
        }
    ],
    client1 : [],
    client2 : [],
    client3 : [
        {
            id : "nService0",
            type : "nservice",
            subType : "ukn_service",
            ady : [
                {
                    id : "client3",
                    linkType : "running"
                }
            ]
        }
    ]
};


var layers = {
    
    size : function(){
        var size = 0;
        
        for(var key in this){
            //if(this.hasOwnProperty(key))
                size++;
        }
        
        return size - 1;
    }
};

var platforms = {
    
    size : function(){
        var size = 0;
        
        for(var key in this){
            //if(this.hasOwnProperty(key))
                size++;
        }
        
        return size - 1;
    }
};

var superLayers = {
    
    size : function(){
        var size = 0;
        
        for(var key in this){
            //if(this.hasOwnProperty(key))
                size++;
        }
        
        return size - 1;
    }
};
function Developer (){

	var objectsDeveloper = [];
	var developers = {};
	var self = this;
	var position = {
		target : [],
		lastTarget : []
	};

	var onClick = function(target) {
        if(window.actualView === 'developers')
            onElementClickDeveloper(target.userData.id, objectsDeveloper);
    };

    function onElementClickDeveloper(id, objectsDevelopers){

        var duration = 1000;

        if(camera.getFocus() == null){
            var camTarget = objectsDevelopers[id].clone();

            window.camera.setFocus(camTarget, new THREE.Vector4(0, 0, 1000, 1), duration);

            for(var i = 0; i < objectsDevelopers.length ; i++) {
                if(id !== i)
                    letAloneDeveloper(objectsDevelopers[i]);
            }

            helper.showBackButton();
            setTimeout(function(){
                self.showDeveloperTiles(id);
            }, 1000);
        }
    }

    /**
     * Let Alone Developer
     * @param   {object}     objectsDevelopers all the developers
     * @author Emmanuel Colina
     */

    function letAloneDeveloper(objectsDevelopers){

        var i, _duration = 2000,
            distance = camera.getMaxDistance() * 2,
            out = window.viewManager.translateToSection('developers', new THREE.Vector3(0, 0, distance));

        var target;

        var animate = function(object, target, dur) {

            new TWEEN.Tween(object.position)
                .to({
                    x: 0,
                    y: 0,
                    z: 0
                }, dur)
                .easing(TWEEN.Easing.Exponential.InOut)
                .onComplete(function () {
                    object.userData.flying = false;
                })
                .start();
        };

        target = out;
        objectsDevelopers.userData.flying = true;
        animate(objectsDevelopers, target, Math.random() * _duration + _duration);
    }

    /**
     * Draws the developer's picture taken from GitHub
     * @param {Array}  data    Options of the texture
     * @param {Object} ctx     Canvas Context
     * @param {Object} texture Texture to update
     */
    function drawPictureDeveloper(data, ctx, texture) {

        var image = new Image();
        var actual = data.shift();

        if(actual.src && actual.src != 'undefined') {

            image.onload = function () {


                if(actual.alpha)
                    ctx.globalAlpha = actual.alpha;

                ctx.drawImage(image, actual.x, actual.y, actual.w, actual.h);
                if(texture)
                    texture.needsUpdate = true;

                ctx.globalAlpha = 1;

                if(data.length !== 0) {

                    if(data[0].text)
                        drawTextDeveloper(data, ctx, texture);
                    else
                        drawPictureDeveloper(data, ctx, texture);
                }
            };

            image.onerror = function () {
                if(data.length !== 0) {
                    if(data[0].text)
                        drawTextDeveloper(data, ctx, texture);
                    else
                        drawPictureDeveloper(data, ctx, texture);
                }
            };

            image.crossOrigin = "anonymous";
            image.src = actual.src;
        }
        else {
            if(data.length !== 0) {
                if(data[0].text)
                    drawTextDeveloper(data, ctx, texture);
                else
                    drawPictureDeveloper(data, ctx, texture);
            }
        }
    }

    /**
     * Draws a texture in canvas
     * @param {Array}  data    Options of the texture
     * @param {Object} ctx     Canvas Context
     * @param {Object} texture Texture to update
     */
    function drawTextDeveloper(data, ctx, texture) {

        var actual = data.shift();

        if(actual.color)
            ctx.fillStyle = actual.color;

        ctx.font = actual.font;

        if(actual.constraint){
            if(actual.wrap)
                helper.drawText(actual.text, actual.x, actual.y, ctx, actual.constraint, actual.lineHeight);
            else
                ctx.fillText(actual.text, actual.x, actual.y, actual.constraint);
        }
        else
            ctx.fillText(actual.text, actual.x, actual.y);

        if(texture)
            texture.needsUpdate = true;

        ctx.fillStyle = "#FFFFFF";

        if(data.length !== 0){
          if(data[0].text)
            drawTextDeveloper(data, ctx, texture);
          else
            drawPictureDeveloper(data, ctx, texture);
        }
    }

	this.getDeveloper = function(){

		var id = 0;

        for(var i = 0; i < window.tilesQtty.length; i++){

            var tile = window.helper.getSpecificTile(window.tilesQtty[i]).data;

            if(tile.author && developers[tile.author] === undefined)
            {
                developers[tile.author] = {
                    id : id,
                    author : tile.author,
                    picture : tile.picture,
                    authorRealName : tile.authorRealName,
                    authorEmail : tile.authorEmail
                };
                id++;
            }
        }

		self.createDevelopers();
	};

	/**
     * Creates a Texture
     * @param   {Number}     id ID of the developer
     * @param   {object}     developerLink link of the picture developer
     * @param   {object}     developerAuthor nick of the developer
     * @param   {object}     developerAuthorRealName name of the developer
     * @param   {object}     developerAuthorEmail email of the developer
     * @returns {texture} 	 Texture of the developer
     * @author Emmanuel Colina
     */
	this.createTextureDeveloper = function(developer){

		var canvas = document.createElement('canvas');
        canvas.width = 230 * 2;
        canvas.height = 120 * 2;

        var ctx = canvas.getContext('2d');

        ctx.globalAlpha = 0;
        ctx.fillStyle = "#FFFFFF";
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';

        var texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.LinearFilter;

		var pic = {
            src: developer.picture,
            alpha: 0.8
        };
        pic.x = 26.5;
        pic.y = 40;
        pic.w = 84 * 1.9;
        pic.h = 84 * 1.9;

		var background = {
		    src: 'images/developer/background_300.png',
		    x: 0,
		    y: 0,
		    w: 230 * 2,
		    h: 120 * 2
		};

		var ringDeveloper = {

			src: 'images/developer/icon_developer_300.png'
		};
		ringDeveloper.x = 25.5;
        ringDeveloper.y = 33.5;
        ringDeveloper.w = 82.7 * 2.0;
        ringDeveloper.h = 82.7 * 2.0;

        var nameDeveloper = {
            text: developer.authorRealName,
            font: (9 * 2.2) + 'px Roboto Bold'
        };
        nameDeveloper.x = 250;
        nameDeveloper.y = 90;
        nameDeveloper.color = "#FFFFFF";

        var nickDeveloper = {
            text: developer.author,
            font: (5 * 2.2) + 'px Canaro'
        };
        nickDeveloper.x = 250;
        nickDeveloper.y = 176;
        nickDeveloper.color = "#00B498";

        var emailDeveloper = {
            text: developer.authorEmail,
            font: (5 * 1.2) + 'px Roboto Medium'
        };
        emailDeveloper.x = 250;
        emailDeveloper.y = 202;
        emailDeveloper.color = "#E05A52";

		var data = [
            pic,
            background,
            ringDeveloper,
            nameDeveloper,
            nickDeveloper,
            emailDeveloper
		];

        drawPictureDeveloper(data, ctx, texture);

        return texture;
	};

	/**
     * Creates a Developer
     * @author Emmanuel Colina
     */
	this.createDevelopers = function(){

		var mesh, texture, lastTarget;
        var i = 0;

        //Just need the number of developers
		position.target = self.setPositionDeveloper(Object.keys(developers));

		for(var key in developers){

			lastTarget = window.helper.getOutOfScreenPoint(0);
			position.lastTarget.push(lastTarget);

			texture = self.createTextureDeveloper(developers[key]);

			mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(230, 120),
            new THREE.MeshBasicMaterial({ transparent : true, color : 0xFFFFFF}));

            mesh.userData = {
                id: developers[key].id,
                onClick : onClick
            };

            mesh.material.map = texture;
            mesh.material.needsUpdate = true;
        	mesh.position.x = position.lastTarget[i].x;
        	mesh.position.y = position.lastTarget[i].y;
        	mesh.position.z = position.lastTarget[i].z;

        	mesh.name = developers[key].author;
            mesh.scale.set(5, 5, 3);
        	scene.add(mesh);
        	objectsDeveloper.push(mesh);

            i++;
		}
	};

	/**
     * @author Emmanuel Colina
     * Creates a Position
     * @param   {object}        devs  array containing all developers
     */
	this.setPositionDeveloper = function(devs){

		var positionDeveloper = [];
		var position;
	    var indice = 1;

	    var center = new THREE.Vector3(0, 0, 0);
	    center = viewManager.translateToSection('developers', center);

	    if(devs.length === 1)
	        positionDeveloper.push(center);

	    else if(devs.length === 2) {

	        center.x = center.x - 500;

	        for(var k = 0; k < devs.length; k++) {

	            position = new THREE.Vector3();

	            position.x = center.x;
	            position.y = center.y;

	            positionDeveloper.push(position);

	            center.x = center.x + 1000;
	        }

	    }
	    else if(devs.length > 2) {
			var devsSpacingConst = 100;
			var xSpacingConst = devsSpacingConst; // |
			var ySpacingConst = devsSpacingConst; //  \ So far, both are equal. Can't think of a situation where they must be different.
			var scale = 5;

			var n = Math.floor(Math.sqrt(devs.length));
			var ROW_W = 230;
			var ROW_H = 120;

            var initial = center;
            initial.x -= ((n * ROW_W + (xSpacingConst * (n - 1))) / 2.0);
            initial.y -= ((n * ROW_H + (ySpacingConst * (n - 1))) / 2.0);

			for (var i = 0; i < devs.length; i += 1) {
				position = new THREE.Vector3();

				var xSpace = (xSpacingConst * (i % n));
				var ySpace = (ySpacingConst * (Math.floor(i / n)));

				position.x = initial.x + ((i % n) * ROW_W + xSpace) * scale;
				position.y = initial.y + (Math.floor(i / n) * ROW_H + ySpace) * -scale;

				positionDeveloper.push(position);
			}
	    }

	    return positionDeveloper;
	};

	/**
     * Animate Developer
     * @author Emmanuel Colina
     */
	this.animateDeveloper = function(){

		var duration = 750;

		for(var i = 0, l = objectsDeveloper.length; i < l; i++) {
            new TWEEN.Tween(objectsDeveloper[i].position)
            .to({
                x : position.target[i].x,
                y : position.target[i].y,
                z : position.target[i].z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
	};

	/**
     * Delete Developer
     * @author Emmanuel Colina
     */
	this.delete = function() {

        var _duration = 2000;

        var moveAndDelete = function(id) {

            var target = position.lastTarget[id];

            new TWEEN.Tween(objectsDeveloper[id].position)
                .to({x : target.x, y : target.y, z : target.z}, 6000)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onComplete(function() { window.scene.remove(objectsDeveloper[id]); })
                .start();
        };

        for(var i = 0, l = objectsDeveloper.length; i < l; i++) {
            moveAndDelete(i);
            helper.hideObject(objectsDeveloper[i], false, _duration);
        }
        objectsDeveloper = [];
        developers = {};
		position = {
			target : [],
			lastTarget : []
		};
    };

    this.showDeveloperTiles = function(id){

        var section = 0;
        var center = objectsDeveloper[id].position;

        for(var i = 0; i < window.tilesQtty.length; i++){

            var tile = window.helper.getSpecificTile(window.tilesQtty[i]).data;

            var mesh = window.helper.getSpecificTile(window.tilesQtty[i]).mesh;

            if(tile.author === objectsDeveloper[id].name && !isNaN(mesh.position.y)){

                new TWEEN.Tween(mesh.position)
                .to({
                    x : (center.x + (section % 5) * window.TILE_DIMENSION.width) - 450,
                    y : (center.y - Math.floor(section / 5) * window.TILE_DIMENSION.height) - 440,
                    z : 0
                }, 2000)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();

                section += 1;
            }
        }
    };

    /**
     * @author Isaías Taborda
     * Finds a developer's tile.
     * @param   {String}  name   Component author nickname.
     * @returns {mesh}    dev    Developer's mesh.
     */
    this.findDeveloper = function(name){
        var dev;
        for(var i = 0, l = objectsDeveloper.length; i < l; i++) {

            if(name === objectsDeveloper[i].name)
                dev = objectsDeveloper[i];

        }
        return dev;
    };
}

/**
 * @author Ricardo Delgado
 */
function FieldsEdit() {

    this.objects = {
            row1 : {
                div : null,
                buttons : [],
                y : 10
            },
            row2 : {            
                div : null,
                buttons : [],
                y : 30
            },
            tile : { 
                mesh : null,
                target : {}
            },
            idFields : {}
        };

    this.actions = { 
        exit : null,
        type : null
    };

    this.actualTile = null;

    this.actualFlow = null;

    var self = this;

    var DATA_USER = window.API.listDevs;

    var button,
        text,
        x,
        type;

    this.removeAllFields = function(){

        if(self.objects.row1.buttons.length !== 0 || self.objects.row2.buttons.length !== 0){

            var row = 'row1';

            if(self.objects[row].buttons.length === 0)
                row = 'row2';

            var actualButton = self.objects[row].buttons.shift();

            if( $('#'+actualButton.id) != null ) 
                window.helper.hide($('#'+actualButton.id), 1000); 
            
                self.removeAllFields();
        }
        else {

            if( $('#'+self.objects.row1.div) != null ) 
                window.helper.hide($('#'+self.objects.row1.div), 1000);

            if( $('#'+self.objects.row2.div) != null ) 
                window.helper.hide($('#'+self.objects.row2.div), 1000);

            self.objects.row1.div = null;
            self.objects.row2.div = null;
            self.objects.idFields = {};

            if(document.getElementById("hidden-area"))
                window.helper.hide('hidden-area', 1000);

            if(window.actualView === 'table'){ 

                self.actualTile = null;

                window.tableEdit.formerName = null;
                
                window.tableEdit.deleteMesh();

                if(window.camera.getFocus() === null)
                    window.tableEdit.addButton();              

                if(typeof(self.actions.exit) === 'function'){
                    self.actions.exit();
                    self.actions.exit = null;
                }
            }
            else if(window.actualView === 'workflows'){
                    
                self.actualFlow = null;
                    
                window.tableEdit.deleteMesh();

                if(window.camera.getFocus() === null)
                    window.workFlowEdit.addButton();              

                if(typeof(self.actions.exit) === 'function'){
                    self.actions.exit();
                    self.actions.exit = null;
                }
            }

        }
    };

    this.createField = function(id, text, _x, _type, _row){

        var object = {
            id : id,
            text : text
          };

        var x = _x || 5,
            type = _type || 'button',
            idSucesor = "backButton",
            row = _row || '1';

        if( self.objects['row' + row].div === null)
            self.createDiv(row);

        if(self.objects['row' + row].buttons.length !== 0)
            idSucesor = self.objects['row' + row].buttons[self.objects['row' + row].buttons.length - 1].id;

        var div = document.getElementById(self.objects['row' + row].div);

        var button = document.createElement(type),
            sucesorButton = document.getElementById(idSucesor);
                  
        button.id = id;
        button.className = 'edit-Fermat';
        button.innerHTML = text;
        button.style.zIndex = 10;
        button.style.opacity = 0;

        div.appendChild(button);

        self.objects['row' + row].buttons.push(object);

        window.helper.show(button, 1000);

        return button;
    };

    this.createDiv = function(row){ 

        var div = document.createElement('div');

        div.id = 'div-Edit' + row;

        document.body.appendChild(div);

        self.objects['row' + row].div = 'div-Edit' + row;

        window.helper.show(div, 1000);
    };

    this.setTextSize = function() { 
        
        var object = {
            id : "fermatEditStyle",
            text : "style"
          };

        self.objects.row2.buttons.push(object);

        var windowWidth  = window.innerWidth;
        var size         = windowWidth * 0.009;
        var style        = document.createElement("style");
        var styleSheet   = ".edit-Fermat {font-size:"+size+"px;}";
        var node         = document.createTextNode(styleSheet);
        
        style.appendChild(node);
        document.body.appendChild(style);  
    };

    this.createFieldTableEdit = function(){

        sesionGroup();
        sesionType();
        sesionName();
        //sesionRepoDir();
        sesionDifficulty();
        sesionDescription();
        sesionState();
        sesionAuthor();
        createbutton(function(){
            self.actions.exit = null;
            window.tableEdit.saveTile();  
        });
        self.setTextSize();

    };

    this.createFieldWorkFlowEdit = function(){

        workflowHeader();
        workflowDescription();
        workflowModalSteps();

        createbutton(function(){
            self.actions.exit = null;
            window.workFlowEdit.save();  
        });

    };

    this.changeLayer = function(platform){

        var state = false;

        if(typeof window.platforms[platform] === 'undefined')
            state = platform;

        var _layers = window.CLI.query(window.layers,function(el){return (typeof(el) !== "function" && el.super_layer.toString() === state.toString());});

        var option = "";

        for(var i = 0;i < _layers.length; i++){

            option += "<option value = '"+_layers[i]+"' >"+_layers[i]+"</option>";

        }

        $("#select-layer").html(option);  
        
    };

    this.disabledButtonSave = function(state){

        var button = document.getElementById('button-save');

        if(state){
            button.innerHTML  = "Saving...";
            button.disabled = true;
        }
        else{
            button.innerHTML  = "Save";
            button.disabled = false;
        }
    };
    
    this.getData = function() {
        
        var title = document.getElementById("workflow-header-title");
        var desc = document.getElementById("modal-desc-textarea");
        var platform = document.getElementById("workflow-header-plataform");
        var steps = document.getElementById("step-List").valueJson.slice();

        if(steps.length > 1){

            for(var i = 1; i < steps.length; i++){

                if(i === (steps.length - 1))
                    steps[i].type = 'end';
                else 
                    steps[i].type = 'activity';
            }
        }
        
        var json = {
            "platfrm": platform.value,
            "name": title.value,
            "desc": desc.value,
            "prev": null,
            "next": null,
            "steps": steps
        };

        return json;
    };

        
    function sesionRepoDir() {

        var id = 'label-Repositorio'; text = 'Dir. Repo. : '; type = 'label';

        self.createField(id, text, null, type, 2);

        var idSucesor = self.objects.row2.buttons[self.objects.row2.buttons.length - 1].id;

        var object = {
            id : "input-repodir",
            text : "textfield"
          };

        self.objects.idFields.repo = object.id;

        var input = $('<input />', {"id" : object.id, "type" : "text", "text" : object.text });

        $("#"+self.objects.row2.div).append(input);

        var button = document.getElementById(object.id);

        var sucesorButton = document.getElementById(idSucesor);
              
        button.className = 'edit-Fermat';
        button.placeholder = 'Directory of repository';
        button.style.zIndex = 10;
        button.style.opacity = 0;

        window.helper.show(button, 1000);

        self.objects.row2.buttons.push(object);

        button.addEventListener('blur', function() {
            window.tableEdit.changeTexture();
        });

    }
    
    function setSelectImages(select) {
        
        select.style.backgroundSize = select.offsetHeight + "px";
        select.style.width = select.offsetWidth + select.offsetHeight + "px";  
    }

    function sesionGroup(){

        var id = 'label-Group'; text = 'Select the Group : '; type = 'label';

        self.createField(id, text, null, type);

        id = 'select-Group'; text = ''; type = 'select';

        self.createField(id, text, null, type);

        var optgroup = "<optgroup label = Platform>",
            option = "";

        self.objects.idFields.group = id;

        for(var i in window.platforms){ 

            if(i != "size"){

                option += "<option value = "+i+" >"+i+"</option>";
            }

        }

        optgroup += option + "</optgroup>";

        option = "";

        optgroup += "<optgroup label = superLayer>";

        for(var _i in window.superLayers){

            if(_i != "size"){

                option += "<option value = "+_i+" >"+_i+"</option>";
            }

        }

        optgroup += option + "</optgroup>";

        $("#"+id).html(optgroup);

        sesionLayer();

        self.changeLayer(document.getElementById(id).value);

       $("#"+id).change('click', function() {
        
            self.changeLayer(document.getElementById(id).value);
            window.tableEdit.changeTexture();
        });
        
        setSelectImages(document.getElementById(id));
    }

    function sesionLayer(){

        var id = 'label-layer'; text = 'Select the Layer : '; type = 'label';

        self.createField(id, text, 15, type);

        id = 'select-layer'; text = ''; type = 'select';

        self.createField(id, text, null, type);

        self.objects.idFields.layer = id;

        $("#"+id).change('click', function() {
        
            window.tableEdit.changeTexture();
        });
        
        setSelectImages(document.getElementById(id));
    }

    function sesionType(){

        var id = 'label-Type'; text = 'Select the Type : '; type = 'label';

        self.createField(id, text, 15, type);

        id = 'select-Type'; text = ''; type = 'select';

        self.createField(id, text, null, type);

        self.objects.idFields.type = id;        

        var option = "";

        option += "<option value = Addon>Addon</option>";
        option += "<option value = Android>Android</option>";
        option += "<option value = Library>Library</option>";
        option += "<option value = Plugin>Plugin</option>";

        $("#"+id).html(option);

        $("#"+id).change('click', function() {
        
            window.tableEdit.changeTexture();
        });
        
        setSelectImages(document.getElementById(id));
    }

    function sesionName(){

        var id = 'label-Name'; text = 'Enter Name : '; type = 'label';

        self.createField(id, text, null, type, 2);

        var idSucesor = self.objects.row2.buttons[self.objects.row2.buttons.length - 1].id;

        var object = {
            id : "imput-Name",
            text : "textfield"
          };

        self.objects.idFields.name = object.id;

        var imput = $('<input />', {"id" : object.id, "type" : "text", "text" : object.text });

        $("#"+self.objects.row2.div).append(imput);

        var button = document.getElementById(object.id);

        var sucesorButton = document.getElementById(idSucesor);
              
        button.className = 'edit-Fermat';
        button.placeholder = 'Component Name';
        button.style.zIndex = 10;
        button.style.opacity = 0;

        window.helper.show(button, 1000);

        self.objects.row2.buttons.push(object);

        button.addEventListener('blur', function() {

            window.tableEdit.changeTexture();
        });
    }
    
    function sesionAuthor(){
        
        var idSucesor = self.objects.row2.buttons[self.objects.row2.buttons.length - 1].id;

        var object = {
            id : "button-author",
            text : "button"
        };
        
        self.objects.idFields.author = object.id;

        var input = $('<input />', {"id" : object.id, "type" : "button", "text" : object.text });

        $("#"+self.objects.row2.div).append(input);

        self.objects.row2.buttons.push(object);
        
        var button = document.getElementById(object.id);
        
        button.className = 'actionButton edit-Fermat';
        button.style.zIndex = 10;
        button.style.opacity = 0;
        button.value = "Authors";
        button.style.marginLeft = "5px";

        object = {
            id : "modal-devs",
            text : "modal"
        };

        self.objects.row2.buttons.push(object);
        
        // Modal
        // START
        
        if(!document.getElementById("modal-devs")){
            
            var modal = document.createElement("div");
            modal.id            = "modal-devs";
            modal.style.left    = (window.innerWidth/2-227)+"px";
            modal.style.top     = (window.innerHeight/2-186)+"px";
            modal.value         = [];
            
            modal.innerHTML = '<div id="a">'+
                    '<div id="finder">'+
                        '<input id="finder-input" type="text" placeholder="Search"></input>'+
                        '<input id="finder-button" type="button" value=""></input>'+
                    '</div>'+
                    '<div id="list">'+
                        '<div id="cont-devs" class="list-content">'+
                        '</div>'+
                    '</div>'+
                '</div>'+
                '<div id="b">'+
                    '<div id="list">'+
                        '<div id="cont-devs-actives" class="list-content">'+
                        '</div>'+
                    '</div>'+
                    '<div id="buttons" >'+
                        '<button id="modal-close-button" >Cancel</button>'+
                        '<button id="modal-accept-button" style="border-left: 2px solid #00b498;">Accept</button>'+
                    '</div>'+
                '</div>';
            
            modal.updateModal = function() {
                
                var cont_list = document.getElementById("cont-devs");
                cont_list.innerHTML = "";
                
                var finder = document.getElementById("finder-input");
                
                for(var i = 0; i < DATA_USER.length; i++) {
                    
                    var filt = DATA_USER[i].usrnm.search(finder.value);
                    
                    if(filt != -1) {
                    
                        var img_src;

                        if(DATA_USER[i].avatar_url)
                            img_src = DATA_USER[i].avatar_url;
                        else
                            img_src = "images/modal/avatar.png";

                        var usr_html  = '<div class="dev-fermat-edit">'+
                                            '<div>'+
                                                '<img crossorigin="anonymous" src="'+img_src+'">'+
                                                '<label>'+DATA_USER[i].usrnm+'</label>'+
                                                '<button data-usrid="'+DATA_USER[i].usrnm+'" class="add_btn"></button>'+
                                            '</div>'+
                                        '</div>';

                        cont_list.innerHTML += usr_html;
                        
                    }
                }
                
                var list_btn = document.getElementsByClassName("add_btn");
                
                function btnOnclickAccept() {
                        
                        var modal = document.getElementById("modal-devs");
                        var _self = this;
                        modal.value[modal.value.length] = {
                            dev: DATA_USER.find(function(x) {
                                
                                if(x.usrnm == _self.dataset.usrid)
                                    return x;
                                
                            }),
                            scope: "implementation",
                            role: "author",
                            percnt: 100
                        };
                        
                        modal.updateModal();

                }

                
                for(i = 0; i < list_btn.length; i++) {
                    var btn = list_btn[i];

                    btn.onclick = btnOnclickAccept;
                }
                
                cont_list = document.getElementById("cont-devs-actives");
                cont_list.innerHTML = "";
                
                for(i = 0; i < this.value.length; i++) {
                    
                    var img_src1;
                    
                    if(this.value[i].dev.avatar_url)
                        img_src1 = this.value[i].dev.avatar_url;
                    else
                        img_src1 = "images/modal/avatar.png";
                    
                    var dev_html = ''+
                    '<div data-expand="false" data-usrid='+ i +' class="dev-fermat-edit dev-active">'+
                        '<div>'+
                            '<img crossorigin="anonymous" src="' + img_src1 + '">'+
                            '<label>' + this.value[i].dev.usrnm + '</label>'+
                            '<button data-usrid='+ i +' class="rem_btn"></button>'+
                            '<div class="dev-data">'+
                                '<table width="100%">'+
                                    '<tr>'+
                                        '<td align="right">Scope</td>'+
                                        '<td>'+
                                            '<select class="select-scope">'+
                                                '<option>implementation</option>'+
                                                '<option>architecture</option>'+
                                                '<option>design</option>'+
                                                '<option>unit-tests</option>'+
                                            '</select>'+
                                        '</td>'+
                                    '</tr>'+
                                    '<tr>'+
                                       '<td align="right">Role</td>'+
                                        '<td>'+
                                            '<select class="select-role">'+
                                                '<option>maintainer</option>'+
                                                '<option>author</option>'+
                                            '</select>'+
                                       '</td>'+
                                    '</tr>'+
                                    '<tr>'+
                                        '<td align="right">%</td>'+
                                        '<td><input class="input-prcnt" type="text" value="` + this.value[i].percnt + `"></input></td>'+
                                    '</tr>'+
                                '</table>'+
                            '</div>'+
                        '</div>'+
                    '</div>';
                    
                    cont_list.innerHTML += dev_html;
                    
                    
                }
                
                var devDiv = document.getElementsByClassName("dev-active");

                for(i=0; i < devDiv.length; i++) {

                    var div = devDiv[i];
                    var dev     = modal.value[div.dataset.usrid];
                    
                    var role    = div.getElementsByClassName("select-role")[0];
                    var scope   = div.getElementsByClassName("select-scope")[0];
                    var prc     = div.getElementsByClassName("input-prcnt")[0];
                    prc.value   = dev.percnt;
                    scope.value = dev.scope;
                    role.value  = dev.role;
                    
                }
                
                list_btn = document.getElementsByClassName("rem_btn");
                
                function btnOnclickRemove() {

                    var modal = document.getElementById("modal-devs");
                    modal.value.splice(this.dataset.usrid, 1);
                    modal.updateModal();

                }
                
                for(i = 0; i < list_btn.length; i++) {
                    var btn1 = list_btn[i];

                    btn1.onclick = btnOnclickRemove;

                }
                
                var list_dev = document.getElementsByClassName("dev-active");
                
                
                function dev_onmouseout() {
                    this.dataset.expand = "false";

                    var selectRole = this.getElementsByClassName("select-role")[0].value;
                    var selectScope = this.getElementsByClassName("select-scope")[0].value;
                    var inputPrcnt = this.getElementsByClassName("input-prcnt")[0].value;

                    modal.value[this.dataset.usrid].role = selectRole;
                    modal.value[this.dataset.usrid].scope = selectScope;
                    modal.value[this.dataset.usrid].percnt = inputPrcnt;
                }
                
                function dev_onmouseover() {
                    this.dataset.expand = "true";
                }
                
                for(i = 0; i < list_dev.length; i++) {
                    var dev1 = list_dev[i];

                    dev1.onmouseover = dev_onmouseover;
                    
                    dev1.onmouseout = dev_onmouseout;

                }
                
            };
            
            document.body.appendChild(modal);

            var finder = document.getElementById("finder-input");

            finder.onkeyup = function() {
                
                document.getElementById("modal-devs").updateModal();
                
            };

            
        }
        
        
        // END
        

        button.addEventListener('click', function() {
            
            var modal = document.getElementById("modal-devs");
            modal.dataset.state = "show";
            modal.updateModal();
            var area = document.createElement("div");
            area.id = "hidden-area";
            document.body.appendChild(area);
            window.helper.show(area, 1000);
            
        });
        
        document.getElementById("modal-close-button").addEventListener("click", function() {
            
            var modal = document.getElementById("modal-devs");
            modal.dataset.state = "hidden";
            var area = document.getElementById("hidden-area");
            window.helper.hide(area, 500);
            window.tableEdit.changeTexture();
            
        });
        
        document.getElementById("modal-accept-button").addEventListener("click", function() {
            
            var modal = document.getElementById("modal-devs");
            modal.dataset.state = "hidden";
            
            //update data of devs (modal.value)
            
            var devDiv = document.getElementsByClassName("dev-active");
            
            for(var i=0; i < devDiv.length; i++) {
                
                var div = devDiv[i];
                
                var selectRole = div.getElementsByClassName("select-role")[0].value;
                var selectScope = div.getElementsByClassName("select-scope")[0].value;
                var inputPrcnt = div.getElementsByClassName("input-prcnt")[0].value;

                modal.value[div.dataset.usrid].role = selectRole;
                modal.value[div.dataset.usrid].scope = selectScope;
                modal.value[div.dataset.usrid].percnt = inputPrcnt;
                
            }
            
            //---------------------------------
            
            var area = document.getElementById("hidden-area");
            window.helper.hide(area, 500);
            window.tableEdit.changeTexture();
            
        });

        window.helper.show(button, 1000);
    }

    function sesionDifficulty(){

        var id = 'label-Difficulty'; text = 'Select Difficulty : '; type = 'label';

        self.createField(id, text, 15, type);

        id = 'select-Difficulty'; text = ''; type = 'select';

        self.createField(id, text, null, type);

        self.objects.idFields.difficulty = id;

        var option = "";

        option += "<option value = 0>0</option>";
        option += "<option value = 1>1</option>";
        option += "<option value = 2>2</option>";
        option += "<option value = 3>3</option>";
        option += "<option value = 4>4</option>";
        option += "<option value = 5>5</option>";
        option += "<option value = 6>6</option>";
        option += "<option value = 7>7</option>";
        option += "<option value = 8>8</option>";
        option += "<option value = 9>9</option>";
        option += "<option value = 10>10</option>";

        $("#"+id).html(option);

        $("#"+id).change('click', function() {
        
            window.tableEdit.changeTexture();
        });
        
        setSelectImages(document.getElementById(id));
    }

    function sesionDescription(){
        
        var idSucesor = self.objects.row2.buttons[self.objects.row2.buttons.length - 1].id;

        var object = {
            id : "button-desc",
            text : "Description"
          };

        self.objects.idFields.maintainer = object.id;

        var input = $('<input />', {"id" : object.id, "type" : "button", "text" : object.text });

        $("#"+self.objects.row2.div).append(input);

        var button = document.getElementById(object.id);
        
        button.className = 'actionButton edit-Fermat';
        button.value = "Description";
        button.style.marginLeft = "5px";
        button.style.zIndex = 10;
        button.style.opacity = 0;
        
        self.objects.row2.buttons.push(object);

        object = {
            id : "modal-desc",
            text : "modal"
        };

        self.objects.row2.buttons.push(object);
        

        window.helper.show(button, 1000);
        
        if(!document.getElementById("modal-desc")) {
            
            var modal = document.createElement("div");
            modal.id = "modal-desc";
            modal.style.top = (window.innerHeight / 4) + "px" ;
            modal.dataset.state = "hidden";
            
            modal.innerHTML = ''+
                    '<label>Description:</label>'+
                    '<textarea id="modal-desc-textarea" rows="12" maxlength="300"></textarea>'+
                    '<div>'+
                        '<button id="modal-desc-cancel">Cancel</button>'+
                        '<button id="modal-desc-accept">Accept</button>'+
                    '</div>';
            
            
            
            document.body.appendChild(modal);
        }


        button.addEventListener('click', function() {
            
            var modal = document.getElementById("modal-desc");
            modal.dataset.state = "show";
            
            modal.oldValue = document.getElementById("modal-desc-textarea").value;
            
            var area = document.createElement("div");
            area.id = "hidden-area";
            document.body.appendChild(area);
            window.helper.show(area, 1000);
            
        });
        
        document.getElementById("modal-desc-cancel").onclick = function() {
            
            var modal = document.getElementById("modal-desc");
            modal.dataset.state = "hidden";
            document.getElementById("modal-desc-textarea").value = modal.oldValue;
            
            var area = document.getElementById("hidden-area");
            window.helper.hide(area, 500);
            
        };
        
        document.getElementById("modal-desc-accept").addEventListener("click", function() {
            
            var modal = document.getElementById("modal-desc");
            modal.dataset.state = "hidden";
            
            var area = document.getElementById("hidden-area");
            window.helper.hide(area, 500);
            
        });
    }

    function sesionState(){

        var id = 'label-State'; text = 'Select the State : '; type = 'label';

        self.createField(id, text, 15, type);

        id = 'select-State'; text = ''; type = 'select';

        self.createField(id, text, 8, type);

        self.objects.idFields.state = id;

        var option = "";

        option += "<option value = concept>Concept</option>";
        option += "<option value = development>Development</option>";
        option += "<option value = production>Production</option>";
        option += "<option value = qa>QA</option>";

        $("#"+id).html(option);

        $("#"+id).change('click', function() {
        
            window.tableEdit.changeTexture();
        });
        
        setSelectImages(document.getElementById(id));
    }

    function createbutton(callback){
        
        var id = 'button-save', text = 'Save', type = 'button';
        
        window.buttonsManager.createButtons(id, text, function(){

            if(typeof(callback) === 'function')
                callback();          

        }, null, null, "right");
    }

    function deleteMesh(){

        var mesh = self.objects.tile.mesh;

        if(mesh != null){ 

            animate(mesh, self.objects.tile.target.hide, 1500, function(){ 
                    window.scene.remove(mesh);
                    
                    self.objects.tile.mesh = null;
                });
        }
    }

    function workflowHeader() {
        
        if(!document.getElementById("workflow-header")) {
            
            var div = document.createElement("div");
            div.id = "workflow-header";
            div.innerHTML += '<label> Title: </label>';
            div.innerHTML += '<input id="workflow-header-title" class="edit-Fermat" placeholder="Title" type="text" maxlength="85"></input>';
            div.innerHTML += '<label> Select the Group : </label>';
            var select = document.createElement("select");
            select.id = "workflow-header-plataform";
            select.className = "edit-Fermat";

            var object = {
                id : "workflow-header",
                text : "workflow-header"
            };

            self.objects.row1.buttons.push(object);
  
            var optgroup = "<optgroup label = Platform>",
            option = "";

            for(var i in window.platforms){ 

                if(i != "size"){

                    option += "<option value = "+i+" >"+i+"</option>";
                }

            }

            optgroup += option + "</optgroup>";

            option = "";

            optgroup += "<optgroup label = superLayer>";

            for(var _i in window.superLayers){

                if(_i != "size"){

                    option += "<option value = "+_i+" >"+_i+"</option>";
                }

            }

            optgroup += option + "</optgroup>";

            select.innerHTML = optgroup;
            
            
            div.appendChild(select);
            
            div.innerHTML += '<input id="workflow-header-description" style="margin-left: 5px" type="button" class="actionButton edit-Fermat" value="Description"></input>';
            div.innerHTML += '<input id="workflow-header-steps" style="margin-left: 5px" type="button" class="actionButton edit-Fermat" value="Steps"></input>';
            
            document.body.appendChild(div);
            
            document.getElementById("workflow-header-title").addEventListener('blur', function() {
               window.workFlowEdit.changeTexture();
            });
            
            setSelectImages(document.getElementById("workflow-header-plataform"));
        }   
    }
    
    function workflowDescription() {

        var div = document.createElement("div");
        div.id = "workflow-modal-desc";
        var modal = document.createElement("div");
        modal.id = "modal-desc";
        modal.style.top = (window.innerHeight / 4) + "px" ;
        modal.dataset.state = "hidden";

        var object = {
            id : "workflow-modal-desc",
            text : "workflow-header"
        };

        self.objects.row1.buttons.push(object);

        modal.innerHTML = ''+
            '<label>Description:</label>'+
            '<textarea id="modal-desc-textarea" rows="12" maxlength="340"></textarea>'+
            '<div>'+
                '<button id="modal-desc-cancel">Cancel</button>'+
                '<button id="modal-desc-accept">Accept</button>'+
            '</div>';
        
        div.appendChild(modal);
        document.body.appendChild(div);
        
        var button = document.getElementById("workflow-header-description");
        
        button.addEventListener('click', function() {
            
            var modal = document.getElementById("modal-desc");
            modal.dataset.state = "show";
            
            modal.oldValue = document.getElementById("modal-desc-textarea").value;
            
            var area = document.createElement("div");
            area.id = "hidden-area";
            document.body.appendChild(area);
            window.helper.show(area, 1000);
            
        });
        
        document.getElementById("modal-desc-cancel").onclick = function() {
            var modal = document.getElementById("modal-desc");
            modal.dataset.state = "hidden";
            document.getElementById("modal-desc-textarea").value = modal.oldValue;
            
            var area = document.getElementById("hidden-area");
            window.helper.hide(area, 500);
            
        };
        
        document.getElementById("modal-desc-accept").addEventListener("click", function() {
            var modal = document.getElementById("modal-desc");
            modal.dataset.state = "hidden";
            
            var area = document.getElementById("hidden-area");
            window.helper.hide(area, 500);
            
            window.workFlowEdit.changeTexture();
        });
    }
    
    function workflowModalSteps() {
        
        //create modal

        var backJson = [];
        
        if(!document.getElementById("modal-steps-div")) {

            var modal = document.createElement("div");
            modal.id = "modal-steps-div";
            modal.dataset.state = "hidden";
            modal.innerHTML = `
                <div id="modal-steps">
                  <div id="left">
                    <div id="inputs">
                      <span id="step-Number">Steps</span>
                      <div>
                        <label>Title:</label>
                        <input id="step-Title" type="text" placeholder="Title of Step" maxlength="80"/>
                        <label>Group:</label>
                        <select id="step-Plataform">
                        </select>
                        <label>Layer:</label>
                        <select id="step-Layer">
                        </select>
                        <label id = "label-compo">Component:</label>
                        <select id="step-Component">
                        </select>
                        <label>Description:</label>
                        <textarea id="step-Description" maxlength="170"></textarea>
                      </div>
                    </div>

                    <div id="next">
                      <div id="blank">
                        <legend>Calls</legend>
                      </div>
                      <div id="inputs">
                        <fieldset>
                          <label>Step:</label>
                          <select id="next-step-Select">
                          </select>
                          <label>Type Call:</label>
                          <select id="step-TypeCall">
                          </select>
                        </fieldset>
                      </div>

                      <div id="selector-steps">
                        <div id="graphic-selector">
                          <div style="width:25%;"></div>
                          <div style="width:25%;" class="on"></div>
                          <div style="width:25%;"></div>
                          <div style="width:25%;"></div>
                        </div>

                        <div id="input-selector">
                          <button id="input-selector-old">&lt;</button>
                          <center id="input-selector-num"> 1 </center>
                          <button id="input-selector-nex">&gt;</button>
                          <button id="input-selector-new">+</button>
                          <button id="input-selector-rem">-</button>
                        </div>

                      </div>
                    </div>
                  </div>
                  <div id="right">

                    <div id="preview">
                      <label>Preview</label>
                      <canvas id="step-Preview"></canvas>
                    </div>

                    <div id="list">
                      <select id="step-List" size="2">
                        <option>1</option>
                      </select>
                    </div>

                    <div id="buttons">
                      <button id="step-NewStep"    >New Step</button>
                      <button id="step-RemoveStep" >Remove Step</button>
                      <button id="step-Cancel"     >Cancel</button>
                      <button id="step-Accept"     >Update</button>
                    </div>

                  </div>
                </div>

            `;

            var object = {
                id : "modal-steps-div",
                text : "workflow-header"
            };

            self.objects.row1.buttons.push(object);     
            
            /*
                step-Number
                step-Title
                step-Layer
                step-Plataform
                step-Component
                step-Padre
                step-Description
                step-List
                step-TypeCall
                next-step-Select
                
                buttons:
                    step-NewStep
                    step-RemoveStep
                    step-Accept
                    step-Cancel
                
                canvas:
                    step-Preview
                
                (id:step-List) .valueJson = [];
            */

            document.body.appendChild(modal);
            
            var nTitle       = document.getElementById("step-Title");
            var nLayer       = document.getElementById("step-Layer");
            var nPlataform   = document.getElementById("step-Plataform");
            var nComponent   = document.getElementById("step-Component");
            var nDescription = document.getElementById("step-Description");
            var nTypeCall    = document.getElementById("step-TypeCall");
            var list         = document.getElementById("step-List");
            var nextSelect   = document.getElementById("next-step-Select");
            var inputNum     = document.getElementById("input-selector-num");
            var gSelect      = document.getElementById("graphic-selector");
                        
            nextSelect.update = function() {
                var inputNum = document.getElementById("input-selector-num");
                
                if(!list.valueJson[nextSelect.step].next.length) {
                    nextSelect.disabled = true;
                    nTypeCall.disabled  = true;
                    inputNum.innerHTML  = "None";
                } else {
                    nextSelect.disabled = false;
                    nTypeCall.disabled  = false;
                    inputNum.innerHTML  = "Child " + nextSelect.call;
                    
                    nextSelect.innerHTML = "";
                    var opt;

                    for(var i = 0; i < list.valueJson.length; i++) {
                        opt = document.createElement("option");
                        opt.value = i;
                        opt.innerHTML = (i + 1) + " - " + list.valueJson[i].title;
                        nextSelect.appendChild(opt);                    
                    }
                    
                    nTypeCall.innerHTML = `
                        <option>direct call</option>
                        <option>fermat message</option>
                        <option>event</option>
                    `;
                    
                    nTypeCall.value = list.valueJson[nextSelect.step].next[nextSelect.call-1].type;
                    nextSelect.value = list.valueJson[nextSelect.step].next[nextSelect.call-1].id;
                    
                }
                                
                gSelect.update();
            };
            
            list.update = function() {

                var opt;
                
                this.innerHTML = "";
                
                for(var i = 0; i < this.valueJson.length; i++) {
                    opt = document.createElement("option");
                    opt.value = i;
                    opt.innerHTML = (i + 1) + " - " + this.valueJson[i].title;
                    this.appendChild(opt);
                }
                
            };
            
            nLayer.update = function() { 

                var nPlataform = document.getElementById("step-Plataform");
                var _layers = TABLE[nPlataform.value].layers;
                var option = "";

                for(var layer in _layers){
                    option += "<option value = '" + layer + "' >" + layer + "</option>";
                }
                nLayer.innerHTML = option;

                list.valueJson[nLayer.step].layer = nLayer.value;
            };         
            
            nComponent.update = function() {
                var nPlataform = document.getElementById("step-Plataform");
                var nLayer     = document.getElementById("step-Layer");
                var obj = TABLE[nPlataform.value].layers[nLayer.value].objects.slice();
                var option = "";
                
                for(var i = 0; i < obj.length; i++) {
                    option += "<option value='" + obj[i].data.name + "'>" + obj[i].data.name + "</option>";
                }

                this.innerHTML = option;
                list.valueJson[nComponent.step].name = nComponent.value;

            };
            
            nDescription.onkeyup = function() {
                list.valueJson[nDescription.step].desc = nDescription.value;
            };
            
            nTitle.onkeyup = function() {
                list.valueJson[nTitle.step].title = nTitle.value;
                list.update();
            };
            
            nLayer.onchange = function() {
                list.valueJson[nLayer.step].layer = nLayer.value;

                nComponent.update();
            };
            
            nPlataform.onchange = function() {
                list.valueJson[nPlataform.step].platfrm = nPlataform.value;

                nLayer.update();
                nComponent.update();
            };
            
            nComponent.onchange = function() {
                list.valueJson[nComponent.step].name = nComponent.value;
                workflowPreview(list.valueJson[nComponent.step]);
            };
            
            nTypeCall.onchange = function() {
                list.valueJson[nTypeCall.step].next[nextSelect.call-1].type = nTypeCall.value;
            };
            
            nextSelect.onchange = function() {
                list.valueJson[nextSelect.step].next[nextSelect.call-1].id = nextSelect.value;
            };
            
            list.valueJson = [];
            
            list.onchange = function() {
                var modal = document.getElementById("modal-steps-div");
                modal.changeStep(parseInt(list.value));
            };
            
            modal.getStepData = function() {
                for(var i=0; i < list.valueJson.length; i++) {
                    list.valueJson[i].type = "activity";
                }
                                
                list.valueJson[0].type = "start";
                list.valueJson[list.valueJson-1].type = "end";
                
                return list.valueJson.slice();
            };
            
            modal.previewUpdate = function(Step) {
                
            };
            
            modal.changeStep = function(Step) {
                
                var nTitle       = document.getElementById("step-Title");
                var stepNumber   = document.getElementById("step-Number");
                var list         = document.getElementById("step-List");
                var nStep        = document.getElementById("step-Number");
                var nLayer       = document.getElementById("step-Layer");
                var nPlataform   = document.getElementById("step-Plataform");
                var nComponent   = document.getElementById("step-Component");
                var nDescription = document.getElementById("step-Description");
                var nTypeCall    = document.getElementById("step-TypeCall");
                var nextSelect   = document.getElementById("next-step-Select");
                var gSelect      = document.getElementById("graphic-selector");
                var inputOld     = document.getElementById("input-selector-old");
                var inputNex     = document.getElementById("input-selector-nex");
                var inputNew     = document.getElementById("input-selector-new");
                var inputRem     = document.getElementById("input-selector-rem");
                
                if(Step != -1) {
                    
                    var step = window.helper.clone(list.valueJson[Step]);
                    
                    nTitle.disabled = false;
                    nStep.disabled = false;
                    nLayer.disabled = false;
                    nPlataform.disabled = false;
                    nDescription.disabled = false;
                    nTypeCall.disabled = false;
                    nComponent.disabled = false;
                    nextSelect.disabled = false;
                    gSelect.disabled = false;
                    inputOld.disabled = false;
                    inputNex.disabled = false;
                    inputNew.disabled = false;
                    inputRem.disabled = false;

                    nLayer.step       = Step;
                    nPlataform.step   = Step;
                    nComponent.step   = Step;
                    nDescription.step = Step;
                    nTitle.step       = Step;
                    nTypeCall.step    = Step;
                    nTypeCall.step    = Step;
                    nextSelect.step   = Step;
                    gSelect.step      = Step;


                    stepNumber.innerHTML = "Step " + (step.id + 1) + ":";

                    //----------Type Call-----------

                    nTypeCall.innerHTML = "";

                    //------------List--------------

                    list.update();
                    list.value = Step;

                    //----------Plataform-----------

                    var optgroup = "<optgroup label = Platform>",
                    option = "";

                    for(var i in window.platforms){ 
                        if(i != "size"){
                            option += "<option value = "+i+" >"+i+"</option>";
                        }
                    }

                    optgroup += option + "</optgroup>";
                    option = "";
                    optgroup += "<optgroup label = superLayer>";

                    for(var _i in window.superLayers){
                        if(_i != "size"){
                            option += "<option value = "+_i+" >"+_i+"</option>";
                        }
                    }

                    optgroup += option + "</optgroup>";

                    nPlataform.innerHTML = optgroup;

                    if(step.platfrm || step.suprlay){

                        var group = step.platfrm || step.suprlay;

                        nPlataform.value = group;
                        list.valueJson[nPlataform.step].platfrm = group;
                    } else {

                        nPlataform.selectedIndex = 0;
                        list.valueJson[nPlataform.step].platfrm = nPlataform.value;
                    }
                    
                    //------------Layer-------------

                    nLayer.update();

                    if(step.layer){
                        nLayer.value = step.layer;
                        list.valueJson[nLayer.step].layer = step.layer;
                    }
                    else{
                        nLayer.selectedIndex = 0;
                        list.valueJson[nLayer.step].layer =  nLayer.value;
                    }
                    
                    //-----------Component------------

                    nComponent.update();

                    if(step.name){
                        nComponent.value = step.name;
                        list.valueJson[nComponent.step].name = step.name;
                    }
                    else{
                        nComponent.selectedIndex = 0;
                        list.valueJson[nComponent.step].name = nComponent.value;
                    }

                    workflowPreview(list.valueJson[nComponent.step]);

                    //------------Next--------------

                    nextSelect.call = list.valueJson[nextSelect.step].next.length;
                    nextSelect.update();

                    //------------------------------

                    nTitle.value = step.title;
                    nStep.value = "Step " + step.id + ":";
                    nDescription.value = step.desc;
                    
                } else {

                    nTitle.disabled = true;
                    nStep.disabled = true;
                    nLayer.disabled = true;
                    nPlataform.disabled = true;
                    nDescription.disabled = true;
                    nTypeCall.disabled = true;
                    nComponent.disabled = true;
                    nextSelect.disabled = true;
                    gSelect.disabled = true;
                    inputOld.disabled = true;
                    inputNex.disabled = true;
                    inputNew.disabled = true;
                    inputRem.disabled = true;

                    stepNumber.innerHTML = "Step :";
                    
                    list.innerHTML = "";
                    
                    cleanPreview();
                }
            };
            
            modal.newStep = function() {
                var list = document.getElementById("step-List");
                var num  = list.valueJson.length;
                list.valueJson[list.valueJson.length] = {
                    "id": num,
                    "title": "",
                    "desc": "",
                    "type": "start",
                    "next": []
                };
                
                list.update();
                
                return num;
            };
                        
            window.onresize = function() {
                var m = document.getElementById("modal-steps");
                var div = document.getElementById("modal-steps-div");
                var w = (m.offsetHeight*1.6) + "px";
                m.style.width = w;
                
                var m_y = (window.innerHeight/2) - (m.offsetHeight/2);
                
                div.style.top = m_y + "px";
                
            };
            
            var inputOld = document.getElementById("input-selector-old");
            var inputNex = document.getElementById("input-selector-nex");
            var inputNew = document.getElementById("input-selector-new");
            var inputRem = document.getElementById("input-selector-rem");
            
            inputNew.onmouseup = function() {
                list.valueJson[nextSelect.step].next[list.valueJson[nextSelect.step].next.length] = {
                    "id": 0,
                    "type": "direct call"
                };
                
                nextSelect.call = list.valueJson[nextSelect.step].next.length;
                nextSelect.update();
            };
            
            inputRem.onmouseup = function() {
                var next = list.valueJson[nextSelect.step].next;
                var low  = next.splice(0, nextSelect.call-1);
                var high = next.splice(1, next.length);
                
                list.valueJson[nextSelect.step].next = low.concat(high);
                
                if(list.valueJson[nextSelect.step].next.length) {
                    if(nextSelect.call > list.valueJson[nextSelect.step].next.length)
                        nextSelect.call = list.valueJson[nextSelect.step].next.length;
                } else {
                    nextSelect.call = 0;
                }
                nextSelect.update();
            };
            
            inputOld.onmouseup = function() {
                if(nextSelect.call != 0) 
                    if(nextSelect.call > 1)
                        nextSelect.call -= 1;
                nextSelect.update();
            };
            
            inputNex.onmouseup = function() {
                if(nextSelect.call < list.valueJson[nextSelect.step].next.length)
                    nextSelect.call += 1;
                nextSelect.update();
            };
            
            nextSelect.chg  = function(id) {
                nextSelect.call = id + 1;
                nextSelect.update();
            };
            
            gSelect.update = function() {
                gSelect.innerHTML = "";
                
                var size = 100 / list.valueJson[gSelect.step].next.length;
                var div;
                
                
                if(nextSelect.call > 0) 
                    for(var i = 0; i < list.valueJson[gSelect.step].next.length; i++) {
                        div = document.createElement("div");
                        div.style.width = size + "%";
                        div.dataset.id = i+1;
                        
                        if(i == nextSelect.call - 1)
                            div.className = 'on';
                        
                        div.onclick = function() {
                            var n = document.getElementById("next-step-Select");
                            n.call = parseInt(this.dataset.id);
                            n.update();
                        };
                        
                        gSelect.appendChild(div);
                    }
                else
                    gSelect.innerHTML = '<div style="width:100%;" class="off"></div>';
                
            };

        }
        
        var button = document.getElementById("workflow-header-steps");
        
        button.addEventListener('click', function() {

            if(document.getElementById("step-List")){
                var valueJson = document.getElementById("step-List").valueJson.slice();

                backJson = [];

                for(var i = 0; i < valueJson.length; i++){

                    var next = valueJson[i].next.slice();
                    var object = window.helper.clone(valueJson[i]);

                    object.next = next;

                    backJson.push(object);
                }
            }

            cleanPreview();
            
            var modal = document.getElementById("modal-steps-div");
            modal.dataset.state = "show";

            var area = document.createElement("div");
            area.id = "hidden-area";
            document.body.appendChild(area);
            window.helper.show(area, 1000);
            window.onresize();
            
        });
        
        document.getElementById("step-NewStep").onclick = function() {
            var modal = document.getElementById("modal-steps-div");
            var list = document.getElementById("step-List");
            var num  = modal.newStep();
            list.value = num;
            modal.changeStep(num);
        };
        
        document.getElementById("step-RemoveStep").onmouseup = function() {
            var modal = document.getElementById("modal-steps-div");
            var list = document.getElementById("step-List");
            
            if(list.valueJson.length > 1) {
                var value = list.value;
                var high = list.valueJson.splice(0, list.value);
                var low  = list.valueJson.splice(1, list.valueJson.length);
                list.valueJson = high.concat(low);

                for(var i = 0; i < list.valueJson.length; i++) {
                    list.valueJson[i].id = i;
                }

                if(value > list.valueJson.length - 1)
                    list.value = list.valueJson.length - 1;
                else
                    list.value = value;
                
                modal.changeStep(list.value);
            } else {
                list.valueJson = [];
                modal.changeStep(-1);
            }
            
            
        };
        
        document.getElementById("step-Accept").onclick = function() {

            if(validateNameSteps() === ''){ 
                var modal = document.getElementById("modal-steps-div");
                modal.dataset.state = "hidden";

                var area = document.getElementById("hidden-area");
                window.helper.hide(area, 1000);
                window.workFlowEdit.changeTexture();
                window.workFlowEdit.fillStep();
                cleanPreview();
            } else {
                window.alert(validateNameSteps());
            }
        };

        document.getElementById("step-Cancel").onclick = function() {

            var list = document.getElementById("step-List");
            var modal = document.getElementById("modal-steps-div");
            
            modal.dataset.state = "hidden";
            cleanPreview();

            if(backJson){

                var list = document.getElementById("step-List");
                list.valueJson = backJson.slice();
                list.update();

                if(list.valueJson.length > 0)
                    document.getElementById("modal-steps-div").changeStep(0);
            }

            var area = document.getElementById("hidden-area");
            window.helper.hide(area, 1000);
        };

        function validateNameSteps(){

            var list = document.getElementById("step-List");
            var msj = '';

            if(list.valueJson.length > 0){
                for(var i = 0; i < list.valueJson.length; i++) {
                    var name = list.valueJson[i].title;
                    if(name === "")
                        msj += 'The step '+ (i + 1) +' must have a name. \n';
                }
            }

            return msj;
        }
        
        window.onresize();
        var modal = document.getElementById("modal-steps-div");
        modal.changeStep(modal.newStep());
        document.getElementById("step-RemoveStep").onmouseup();
    }

    function workflowPreview(_step) {

        var step = window.helper.clone(_step);

        //if(!step.element)
            step.element = window.helper.searchElement(
                (step.platfrm || step.suprlay) + '/' + step.layer + '/' + step.name
            );

        var fillBox = function(ctx, image) {

            ctx.drawImage(image, 0, 0, 300, 150);

            if(step.element !== -1){ 

                var mesh = window.helper.getSpecificTile(step.element).mesh;

                var texture = mesh.levels[0].object.material.map.image;

                var img = document.createElement('img');

                img.src = texture.toDataURL("image/png");

                img.onload = function() {
                    ctx.drawImage(img, 65, 27, 85, 98);
                };
            }

            //ID
            var Nodeid = parseInt(step.id) + 1;
            Nodeid = (Nodeid < 10) ? '0' + Nodeid.toString() : Nodeid.toString();

            var size = 37;
            ctx.font = size + 'px Arial';
            ctx.fillStyle = '#000000';
            window.helper.drawText(Nodeid, 16, 90, ctx, 76, size);
            ctx.fillStyle = '#FFFFFF';

            //Title
            size = 8;
            ctx.font = 'bold ' + size + 'px Arial';
            window.helper.drawText(step.title, 151, 40, ctx, 100, size);

            //Description
            size = 6;
            ctx.font = size + 'px Arial';
            window.helper.drawText(step.desc, 151, 80, ctx, 100, size);
        };

        var canvas = document.getElementById('step-Preview');
        var ctx = canvas.getContext('2d');
        cleanPreview();
        var size = 12;
        ctx.fillStyle = '#FFFFFF';

        var image = document.createElement('img');

        ctx.font = size + 'px Arial';

        image.onload = function() {
            fillBox(ctx, image);
        };

        image.src = "images/workflow/stepBox.png";

    }

    function cleanPreview(){

        var canvas = document.getElementById('step-Preview');
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }


    
}
//var URL = "get_plugins.php";
//var URL = "http://52.11.156.16:3000/repo/comps";

function getData() {
    animate();
    
    var url = window.API.getAPIUrl("comps");
    
    //url += "?env=development"; //When needed the development branch, for lab.fermat.org

    window.API.getCompsUser(function (list){ 

        window.loadMap(function() {

            window.tileManager.JsonTile(function() {

                window.preLoad(function() {

                    window.tileManager.fillTable(list);
                    TWEEN.removeAll();
                    window.logo.stopFade();
                    window.helper.hide('welcome', 1000, true);
                    init();

                });
            });
        });
    });

 
//Use when you don't want to connect to server
/*setTimeout(function(){
        var l = JSON.parse(testData);
        
        window.preLoad(function() {
            
            window.tileManager.JsonTile(function() {
    
                window.loadMap(function() {
                    tileManager.fillTable(l);

                    TWEEN.removeAll();
                    logo.stopFade();
                    init();
                });
            })
        });

    }, 6000);*/
}
/**
 * @author Isaias Taborda
 * function creates a guide to help inexperienced users navigate the site
 */
function Guide() {

	  this.objects = {
            mesh : []
    };

    var active = false;

    var self = this;
    
    var wide = (Math.floor(window.camera.aspectRatio * 10) !== Math.floor(40/3));
    
    var Z = 40000,
        SCALE = (wide) ? 28 : 16;

    this.addButton = function(){

        var text = 'Help',
            button = 'helpButton',
            side = 'left';

        window.buttonsManager.createButtons(button, text, null, null, null, side);
    }

    /**
     * @author Isaías Taborda
     * Create help text.
     * @param {String array}  text    Information text.
     * @param {Number}        width   Text box width.
     * @param {Number}        height  Text box height.
     * @param {Number}        posX    Objetive x position.
     * @param {Number}        posY    Objetive y position.
     */
    function createHelp(text, width, height, posX, posY) {

        var material = new THREE.MeshBasicMaterial( {map: null, side:THREE.FrontSide, transparent: true } ); 

        var mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            material
        );

        mesh.position.set(0,0,-10000);
        mesh.scale.set(SCALE, SCALE, SCALE);
        mesh.material.opacity = 1;

        window.scene.add(mesh);
        self.objects.mesh.push(mesh);

        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext('2d');
        context.globalAlpha = 0.90;
        context.fillStyle = "#10C6A9";
        roundRectangle(context, 0, 0, canvas.width, canvas.height);
        context.font = "Bold 40px Arial";
        context.fillStyle = "white";

        var size = text.length+1;
        var spacing = 0;
        for(var i=1; i < size; i++){
           var line = text.shift();
           context.fillText(line, 7, (35 * i) + spacing);
           spacing += 7;
        }

        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = THREE.NearestFilter;

        mesh.material.map = texture;
        mesh.material.needsUpdate = true;

        popUp(mesh, posX, posY,3500);

    }

    /**
     * @author Isaías Taborda
     * Creates a round corner rectangle for the text.
     * @param {Object}  ctx    Context.
     * @param {Number}  x      X-axis position.
     * @param {Number}  y      Y-axis position.
     * @param {Number}  width  Width size.
     * @param {Number}  heigth Height size.
     */
    function roundRectangle(ctx, x, y, width, height) {
      
      var radius = 10;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();       
    }

   /**
     * @author Isaías Taborda.
     * Animate Button.
     * @param {Object}     mesh         Text field.
     * @param {Number}     targetx      The objetive x position.
     * @param {Number}     targety      The objetive y position.
     * @param {Number} [duration=2000] Duration of the animation.
     */
    function popUp(mesh, targetX, targetY, duration) {

          var _duration = duration || 2000,
              x = targetX,
              y = targetY,
              z = Z;

          new TWEEN.Tween(mesh.position)
              .to({
                x : x,
                y : y,
                z : z 
              }, Math.random() * duration + duration)
              .easing(TWEEN.Easing.Exponential.InOut)
              .onUpdate(window.render)
              .start();

    }

    this.showHelp = function(){
        createHelp(["Use the blue arrows to", "navigate through the site."], 500, 95, -13000, 12000);
        createHelp(["You can zoom in, or zoom out, using the scroll", "wheel or by dragging your Mouse while holding", "down the S key and left click."], 910, 135, 7500, 12000);
        createHelp(["After you zoom in, hold down left", "click and drag your Mouse to pan", "across the page view."], 650, 135, -15000, 5000);
        createHelp(["Press the Esc key in any view to", "return to its starting position."], 625, 95, 15000, 5000);
    };

    /**
     * @author Isaías Taborda.
     * Eliminates the help text.
     */
    this.removeHelp = function(){
      var duration = 1000;
      var l = self.objects.mesh.length; 

        for(var i = 0; i < l; i++) {
          new TWEEN.Tween(self.objects.mesh[i].position)
            .to({
                x : 0,
                y : 0,
                z : -10000
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Bounce.In)
            .start();
        }

        setTimeout(function (){
          for(var i = 0; i < l; i++) {
              window.scene.remove(self.objects.mesh[i]); // this was separated so the canvas text animates before being deleted
          }
          self.objects.mesh = [];
        }, 3000);
  };
}
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
    var objects = [],
        dependencies = {
            root : []
        },
        positions = {
            table : [],
            stack : [],
            workFlow: []
        },
        arrowsPositions = {
            origin: [],
            stack: []
        },
        self = this,
        graph = {},
        arrows = [];

    var width = columnWidth * window.TILE_DIMENSION.width;
    var height = width * 443 / 1379;

    this.dep = dependencies;
    this.arrows = arrows;
    this.arrowPositions = arrowsPositions;

    var onClick = function(target) {
        if(window.actualView === 'workflows'){
            window.buttonsManager.removeAllButtons();
            onElementClickHeader(target.userData.id, objects);
        }
    };

    function onElementClickHeader(id, objects)
    {
        var duration = 1000;

        if(camera.getFocus() == null){
            var camTarget = objects[id].clone();
            camTarget.position.y -= 2500;

            window.camera.setFocus(camTarget, new THREE.Vector4(0, -2500, 9000, 1), duration);

        for(var i = 0; i < objects.length ; i++) {
                if(id !== i)
                    letAloneHeader(objects[i]);
            }

            helper.showBackButton();
        }

        window.workFlowManager.createColumHeaderFlow(objects[id]);
    }

    /**
     * @author Emmanuel Colina
     * let alone the header
     * @param {Object} objHeader Header target
     */

    function letAloneHeader(objHeader){
        var i, _duration = 2000,
            distance = camera.getMaxDistance() * 2,
            out = window.viewManager.translateToSection('workflows', new THREE.Vector3(0, 0, distance));

        var target;

        var animate = function(object, target, dur) {

            new TWEEN.Tween(object.position)
                .to({
                    x: target.x,
                    y: target.y,
                    z: target.z
                }, dur)
                .easing(TWEEN.Easing.Exponential.InOut)
                .onComplete(function() {
                    object.userData.flying = false;
                })
                .start();
        };

        target = out;
        objHeader.userData.flying = true;
        animate(objHeader, target, Math.random() * _duration + _duration);
    }

    // Public method

    this.getPositionHeaderViewInFlow = function(){
        return positions.workFlow;
    };
    /**
     * @author Emmanuel Colina
     * @lastmodifiedBy Miguel Celedon
     * Create the Arrows (dependences)
     */

    this.createArrows = function(startX,startY,endX,endY) {

        var POSITION_X = 1700;
        var POSITION_Y = 200;
        var POSITION_Z = 44700;

        //camera.resetPosition();

        endY = endY - 300;

        var from = new THREE.Vector3(startX, startY, 0);

        var to = new THREE.Vector3(endX, endY, 0);

        var direction = to.clone().sub(from);

        var length = direction.length();

        var arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, 0XF26662, 550, 300);

        var objectStack = new THREE.Object3D();
        var objectOrigin = new THREE.Object3D();

        arrowHelper.position.x = arrowHelper.position.x - POSITION_X;
        arrowHelper.position.y = arrowHelper.position.y - POSITION_Y;
        arrowHelper.position.z = POSITION_Z;

        objectStack.position.copy(arrowHelper.position);
        objectStack.rotation.copy(arrowHelper.rotation);
        arrowsPositions.stack.push(objectStack);

        arrowHelper.line.material.opacity = 0;
        arrowHelper.line.material.transparent = true;

        arrowHelper.cone.material.opacity = 0;
        arrowHelper.cone.material.transparent = true;


        var startingPosition = window.helper.getOutOfScreenPoint(0);
        arrowHelper.position.copy(viewManager.translateToSection('stack', startingPosition));
        arrowHelper.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);

        objectOrigin.position.copy(arrowHelper.position);
        objectOrigin.rotation.copy(arrowHelper.rotation);
        arrowsPositions.origin.push(objectOrigin);

        scene.add(arrowHelper);
        arrows.push(arrowHelper);
    };

    /**
     * @author Isaias Taborda
     * Deletes the arrows in the graph when the user leaves the stack view
     * so they can be drawn from scrath if the user comes back to this view
     * @param {Number} [duration=5000] Duration in milliseconds for the animation
     */
    this.deleteArrows = function(duration) {
        var limit = arrows.length;

        for(var i = 0; i < limit; i++) {

            new TWEEN.Tween(arrows[i].position)
            .to({
                x : arrowsPositions.origin[i].position.x,
                y : arrowsPositions.origin[i].position.y,
                z : arrowsPositions.origin[i].position.z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();

            new TWEEN.Tween(arrows[i].rotation)
            .to({
                x : arrowsPositions.origin[i].rotation.x,
                y : arrowsPositions.origin[i].rotation.y,
                z : arrowsPositions.origin[i].rotation.z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();
        }

        setTimeout(function(){
            arrowsPositions.origin = [];
            arrowsPositions.stack = [];
            for(i = 0; i < limit; i++){
                window.scene.remove(arrows[i]);
            }
            arrows = [];
        }, duration);
    };

    /**
     * @author Miguel Celedon
     * @lastmodifiedBy Miguel Celedon
     * Arranges the headers by dependency
     * @param {Number} [duration=2000] Duration in milliseconds for the animation
     */
    this.transformStack = function(duration) {
        var _duration = duration || 2000;


        createEdges();
        self.moveToPosition(duration, duration / 2);

        var i, l;

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
        .to({}, duration * 3)
        .onUpdate(render)
        .start();
    };

    /**
     * @author Emmanuel Colina
     * Arranges the headers by dependency
     * @param {Number} [duration=2000] Duration in milliseconds for the animation
     */
    this.transformWorkFlow = function(duration) {
        var _duration = duration || 2000;

        var i, l;

        for(i = 0, l = objects.length; i < l; i++) {
            new TWEEN.Tween(objects[i].position)
            .to({
                x : positions.workFlow[i].position.x,
                y : positions.workFlow[i].position.y,
                z : positions.workFlow[i].position.z
            }, _duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }

        new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate(render)
        .start();
    };

    /**
     * @author Emmanuel Colina
     * Hide the headers
     */
    this.hidetransformWorkFlow = function(duration) {
        var i, j,
            position;

        for(i = 0; i < objects.length; i++) {

            position = window.helper.getOutOfScreenPoint(0);

            new TWEEN.Tween(objects[i].position)
            .to({x : position.x, y : position.y, z : position.z}, duration)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();
        }
    };

    /**
     * @author Simón Oroño
     * Retrieves the node associated with an object
     */
    function getObjectNode(id) {
        for (var i = 0; i < graph.nodes.length; i++) {
            if (graph.nodes[i].id === id) {
                return graph.nodes[i];
            }
        }

        return null;
    }

    /**
     * @author Emmanuel Colina
     * @lastmodifiedBy Isaias Taborda
     * @lastmodifiedBy Simón Oroño
     * Calculates the stack target position
     */
    var calculateStackPositions = function() {
        var i, obj, node;
        var nodesInLevel = {};
        var nodesAlreadyProcessedInLevel = {};

        /*objects.sort(function(a, b) {
            return (a === b) ? 0 : ((a > b) ? 1 : -1);
        });*/

        var initialX = -20000;
        var initialY = -15000;
        var separationX = width + 1500;
        var separationY = 6000.0;
        var positionZ = 45000;

        for (i = 0; i < graph.nodes.length; i++) {
            node = graph.nodes[i];

            // We calculate how much nodes there are for each level
            if (!(node.level in nodesInLevel)) {
                nodesInLevel[node.level] = 0;
                nodesAlreadyProcessedInLevel[node.level] = 0;
            } else {
                nodesInLevel[node.level] += 1;
            }
        }

        // Send all objects to the center
        for(i = 0; i < objects.length; i++) {
            obj = new THREE.Object3D();
            obj.name = positions.table[i].name;
            positions.stack.push(obj);
        }

        for (i = 0; i < objects.length; i++) {
            node = getObjectNode(objects[i].name);

            var levelDifference = nodesInLevel[0] - nodesInLevel[node.level];
            var margin = (levelDifference / 2.0) * (separationX);

            positions.stack[i].position.x = initialX + (separationX * nodesAlreadyProcessedInLevel[node.level]) + margin;
            positions.stack[i].position.y = initialY + (separationY * node.level);
            positions.stack[i].position.z = positionZ;

            nodesAlreadyProcessedInLevel[node.level] += 1;
        }

        //Transport all headers to the stack section
        for(i = 0; i < positions.stack.length; i++) {
            positions.stack[i].position.copy(window.viewManager.translateToSection('stack', positions.stack[i].position));
        }
    };

    /**
     * @author Emmanuel Colina
     * @lastmodifiedBy Miguel Celedon
     * Paint the dependences
     */
    var createEdges = function() {
        var startX, startY, endX, endY;
        var i, j;

        for (i = 0; i < graph.edges.length; i++) {
            startX = 0;
            startY = 0;
            endX = 0;
            endY = 0;

            for (j = 0; j < objects.length; j++) {
                if (graph.edges[i].from === objects[j].name) {
                    startX = positions.stack[j].position.x;
                    startY = positions.stack[j].position.y;
                }

                if (graph.edges[i].to === objects[j].name) {
                    endX = positions.stack[j].position.x;
                    endY = positions.stack[j].position.y;
                }
            }

            self.createArrows(startX, startY, endX, endY);
        }
    };

    /**
     * @author Emmanuel Colina
     * @lastmodifiedBy Miguel Celedon
     * Arranges the headers in the table
     * @param {Number} [duration=2000] Duration of the animation
     */
    this.flyOut = function(duration){

        var _duration = duration || 2000, i, l;

        for(i = 0, l = arrows.length; i < l; i++) {

            new TWEEN.Tween(arrows[i].position)
            .to({
                x : arrowsPositions.origin[i].position.x,
                y : arrowsPositions.origin[i].position.y,
                z : arrowsPositions.origin[i].position.z
            }, Math.random() * _duration + _duration)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();

             new TWEEN.Tween(arrows[i].rotation)
            .to({
                x : arrowsPositions.origin[i].rotation.x,
                y : arrowsPositions.origin[i].rotation.y,
                z : arrowsPositions.origin[i].rotation.z
            }, Math.random() * _duration + _duration)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();

            helper.hideObject(arrows[i].line, false, _duration);
            helper.hideObject(arrows[i].cone, false, _duration);
        }

        new TWEEN.Tween(this)
        .to({}, _duration * 2)
        .onUpdate(render)
        .start();

        arrows = [];
    };

    /**
     * @author Emmanuel Colina
     * @lastmodifiedBy Miguel Celedon
     *  Arranges the headers in the table
     * @param {Number} [duration=2000] Duration of the animation
     * @param {Number} [delay=0]       Delay of the animation
     */
    this.moveToPosition = function(duration, delay){

        var _duration = duration || 2000,
            i, l;

        delay = (delay !== undefined) ? delay : 0;

        for(i = 0, l = arrows.length; i < l; i++) {

            helper.showMaterial(arrows[i].line.material, Math.random() * _duration + _duration, TWEEN.Easing.Exponential.InOut, delay);
            helper.showMaterial(arrows[i].cone.material, Math.random() * _duration + _duration, TWEEN.Easing.Exponential.InOut, delay);

            new TWEEN.Tween(arrows[i].position)
            .to({
                x : arrowsPositions.stack[i].position.x,
                y : arrowsPositions.stack[i].position.y,
                z : arrowsPositions.stack[i].position.z
            }, Math.random() * _duration + _duration)
            .easing(TWEEN.Easing.Cubic.InOut)
            .delay(delay)
            .start();

            new TWEEN.Tween(arrows[i].rotation)
            .to({
                x : arrowsPositions.stack[i].rotation.x,
                y : arrowsPositions.stack[i].rotation.y,
                z : arrowsPositions.stack[i].rotation.z
            }, Math.random() * _duration + _duration)
            .easing(TWEEN.Easing.Cubic.InOut)
            .delay(delay)
            .start();
        }
    };

    /**
     * @author Miguel Celedon
     * @lastmodifiedBy Miguel Celedon
     * Arranges the headers in the table
     * @param {Number} [duration=2000] Duration of the animation
     */

    this.transformTable = function(duration) {
        var _duration = duration || 2000,
            i, l;

        self.flyOut();

        self.showHeaders(_duration);

        new TWEEN.Tween(this)
            .to({}, _duration * 2)
            .onUpdate(render)
            .start();
    };

    /**
     * Shows the headers as a fade
     * @param {Number} duration Milliseconds of fading
     */
    this.showHeaders = function(duration) {
        var i, j;

        for(i = 0; i < objects.length; i++) {

            new TWEEN.Tween(objects[i].position)
            .to({
                x : positions.table[i].position.x,
                y : positions.table[i].position.y,
                z : positions.table[i].position.z
            }, duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();


            for(j = 0; j < objects[i].levels.length; j++) {
                new TWEEN.Tween(objects[i].levels[j].object.material)
                .to({opacity : 1, needsUpdate : true}, duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
            }
        }
    };

    /**
     * Hides the headers (but donesn't delete them)
     * @param {Number} duration Milliseconds to fade
     */
    this.hideHeaders = function(duration) {
        var i, j,
            position;

        for(i = 0; i < objects.length; i++) {

            position = window.helper.getOutOfScreenPoint(0);

            new TWEEN.Tween(objects[i].position)
            .to({x : position.x, y : position.y, z : position.z}, duration)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();

            for(j = 0; j < objects[i].levels.length; j++) {

                new TWEEN.Tween(objects[i].levels[j].object.material)
                .to({opacity : 0, needsUpdate : true}, duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
            }
        }
    };

    // Initialization code
    //=========================================================

    /**
     * @author Miguel Celedon
     * @lastmodifiedBy Miguel Celedon
     * Creates the dependency graph
     * @returns {Object} Object containing the data and options
     */
    var buildGraph = function() {

        var data, edges = [], nodes = [], options, level = 0, pending = {};

        var trace = function(root, parent, _level, _nodes, _edges) {

            if(parent)
                pending[parent] = true;

            var i, l, child,
                lookup = function(x) {
                    return x.id == child;
                };

            for(i = 0, l = root.length; i < l; i++) {

                child = root[i];

                if(_level !== 0)
                    _edges.push({from : parent, to : child});

                if($.grep(_nodes, lookup).length === 0)
                {
                    _nodes.push({
                        id : child,
                        image : 'images/headers/svg/' + child + '_logo.svg',
                        level : _level
                    });
                }

                if(pending[child] === undefined)
                    trace(dependencies[child], child, _level + 1, _nodes, _edges);
            }
        };

        trace(dependencies.root, null, level, nodes, edges);

        data = {
            edges : edges,
            nodes : nodes
        };

        graph = data;
    };

    /**
     * @author Emmanuel Colina
     * Calculate the position header
     */

    var headersPositionsViewWorkFlow = function() {

        var group, headerData, objectHeaderInWFlowGroup, slayer, column;

        for(group in window.platforms){
            if(window.platforms.hasOwnProperty(group) && group !== 'size'){
                headerData = window.platforms[group];
                column = headerData.index;


                objectHeaderInWFlowGroup = new THREE.Object3D();

                objectHeaderInWFlowGroup.position.x = (width * (column - (groupsQtty - 1) / 2) + ((column - 1) * window.TILE_DIMENSION.width)) + 10000;
                objectHeaderInWFlowGroup.position.y = ((layersQtty + 10) * window.TILE_DIMENSION.height) / 2;
                objectHeaderInWFlowGroup.name = group;

                objectHeaderInWFlowGroup.position.copy(window.viewManager.translateToSection('workflows', objectHeaderInWFlowGroup.position));
                positions.workFlow.push(objectHeaderInWFlowGroup);
            }
        }
        for(slayer in superLayers){
            if(window.superLayers.hasOwnProperty(slayer) && slayer !== 'size'){
                headerData = window.superLayers[slayer];

                column = headerData.index + 1;

                objectHeaderInWFlowGroup = new THREE.Object3D();

                objectHeaderInWFlowGroup.position.x = (width * (column - (groupsQtty - 1) / 2) + ((column - 1) * window.TILE_DIMENSION.width)) - 15000;
                objectHeaderInWFlowGroup.position.y = ((layersQtty + 10) * window.TILE_DIMENSION.height) / 2;
                objectHeaderInWFlowGroup.name = slayer;

                objectHeaderInWFlowGroup.position.copy(window.viewManager.translateToSection('workflows', objectHeaderInWFlowGroup.position));
                positions.workFlow.push(objectHeaderInWFlowGroup);
            }
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
                else
                    dependencies.root.push(child);

                dependencies[child] = dependencies[child] || [];
            }

        function createHeader(group, width, height, index) {

            var source,
                levels = [
                    ['high', 0],
                    ['medium', 8000],
                    ['small', 16000]],
                i, l,
                header = new THREE.LOD();

            for(i = 0, l = levels.length; i < l; i++) {

                source = 'images/headers/' + levels[i][0] + '/' + group + '_logo.png';

                var object = new THREE.Mesh(
                    new THREE.PlaneBufferGeometry(width, height),
                    new THREE.MeshBasicMaterial({transparent : true, opacity : 0})
                    );

                object.name = group;
                object.userData = {
                    id: index,
                    onClick : onClick
                };

                helper.applyTexture(source, object);

                header.addLevel(object, levels[i][1]);
            }

            return header;
        }

        var src;

        for(group in window.platforms) {
            if(window.platforms.hasOwnProperty(group) && group !== 'size') {

                headerData = window.platforms[group];
                column = headerData.index;

                object = createHeader(group, width, height, column);

                object.position.copy(window.viewManager.translateToSection('table', window.helper.getOutOfScreenPoint(0)));
                object.name = group;

                scene.add(object);
                objects.push(object);

                object = new THREE.Object3D();

                object.position.x = width * (column - (groupsQtty - 1) / 2) + ((column - 1) * window.TILE_DIMENSION.width);
                object.position.y = ((layersQtty + 10) * window.TILE_DIMENSION.height) / 2;
                object.name = group;

                object.position.copy(window.viewManager.translateToSection('table', object.position));

                positions.table.push(object);

                createChildren(group, headerData.dependsOn);
            }
        }

        for(slayer in superLayers) {
            if(window.superLayers.hasOwnProperty(slayer) && slayer !== 'size') {
                headerData = window.superLayers[slayer];
                row = window.platforms.size() + headerData.index;
                object = createHeader(slayer, width, height, row);
                object.position.copy(window.viewManager.translateToSection('table', window.helper.getOutOfScreenPoint(0)));
                object.name = slayer;
                scene.add(object);
                objects.push(object);
                object = new THREE.Object3D();
                object.position.x = -(((groupsQtty + 1) * width / 2) + window.TILE_DIMENSION.width);
                object.position.y = (-(superLayerPosition[headerData.index]) - (superLayerMaxHeight / 2) + (layersQtty / 2)) * window.TILE_DIMENSION.height;
                object.name = slayer;
                object.position.copy(window.viewManager.translateToSection('table', object.position));
                positions.table.push(object);
                createChildren(slayer, headerData.dependsOn);
            }
        }

        buildGraph();
        calculateStackPositions();
        headersPositionsViewWorkFlow();
    };

    initialize();
    //=========================================================
}

/**
 * Static object with help functions commonly used
 */
function Helper() {

    var self = this;
    
    this.ENV = 'production';

    this.SERVER = 'http://api.fermat.org';

    switch(window.location.href.match("//[a-z0-9]*")[0].replace("//", '')) {
        case "dev":
            self.ENV = 'production';
            break;
        case "lab":
            self.ENV = 'development';
            break;
        case "3d":
            self.ENV = 'testing';
            break;
    }

    /**
     * Hides an element vanishing it and then eliminating it from the DOM
     * @param {DOMElement} element         The element to eliminate
     * @param {Number}     [duration=1000] Duration of the fade animation
     * @param {Boolean}    [keep=false]     If set true, don't remove the element, just dissapear
     */
    this.hide = function(element, duration, keep, callback) {

        var dur = duration || 1000,
            el = element;

        if(typeof(el) === "string")
            el = document.getElementById(element);

        if(el) {
            $(el).fadeTo(duration, 0, function() {
                if(keep) {
                    el.style.display = 'none';
                    el.style.opacity = 0;
                    el.style.transition = 'display 0s 2s, opacity 2s linear';
                }
                else
                    $(el).remove();

                if(typeof(callback) === 'function')
                    callback();
            });
        }

    };

    this.hideButtons = function(){

        if($('#developerButton') != null)
          window.helper.hide($('#developerButton'), 1000);
        if($('#showFlows') != null)
          window.helper.hide($('#showFlows'), 1000);
        if($('#showScreenshots') != null)
          window.helper.hide($('#showScreenshots'), 1000);
    };

    /**
     * @author Miguel Celedon
     *
     * Shows an HTML element as a fade in
     * @param {Object} element         DOMElement to show
     * @param {Number} [duration=1000] Duration of animation
     */
    this.show = function(element, duration) {

        duration = duration || 1000;

        if(typeof(element) === "string")
            element = document.getElementById(element);

        $(element).fadeTo(duration, 1, function() {
                $(element).show();
        });
    };

    /**
     * Shows a material with transparency on
     * @param {Object} material                                Material to change its opacity
     * @param {Number} [duration=2000]                         Duration of animation
     * @param {Object} [easing=TWEEN.Easing.Exponential.InOut] Easing of the animation
     * @param {delay}  [delay=0]
     */
    this.showMaterial = function(material, duration, easing, delay) {

        if(material && typeof material.opacity !== 'undefined') {

            duration = duration || 2000;
            easing = (typeof easing !== 'undefined') ? easing : TWEEN.Easing.Exponential.InOut;
            delay = (typeof delay !== 'undefined') ? delay : 0;

            new TWEEN.Tween(material)
                .to({opacity : 1}, duration)
                .easing(easing)
                .onUpdate(function() { this.needsUpdate = true; })
                .delay(delay)
                .start();
        }
    };

    /**
     * Deletes or hides the object
     * @param {Object}  object          The mesh to hide
     * @param {Boolean} [keep=true]     If false, delete the object from scene
     * @param {Number}  [duration=2000] Duration of animation
     */
    this.hideObject = function(object, keep, duration) {

        duration = duration || 2000;
        keep = (typeof keep === 'boolean') ? keep : true;

        new TWEEN.Tween(object.material)
            .to({opacity : 0}, duration)
            .onUpdate(function() { this.needsUpdate = true; })
            .onComplete(function() {
              if(!keep)
                window.scene.remove(object);
            })
            .start();
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

        if(date == null)
          return null;

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

        for(var i = 0; i < words.length; i++){
            result += words[i].charAt(0).toUpperCase() + words[i].slice(1) + " ";
        }

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

        if(words.length == 1) { //if N = 1, use whole word or 3 first letters

            if(words[0].length <= 4)
                code = this.capFirstLetter(words[0]);
            else
                code = this.capFirstLetter(words[0].slice(0, 3));
        }
        else if(words.length == 2) { //if N = 2 use first cap letter, and second letter

            code += words[0].charAt(0).toUpperCase() + words[0].charAt(1);
            code += words[1].charAt(0).toUpperCase() + words[1].charAt(1);
        }
        else { //if N => 3 use the N (up to 4) letters caps

            var max = (words.length < 4) ? words.length : 4;

            for(var i = 0; i < max; i++){
                code += words[i].charAt(0).toUpperCase();
            }
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

        if(_group && _type && _layer && _name) {
            return _group + "/" + _type + "/" + _layer + "/" +
                _root + "-" + _group.split('_').join('-').toLowerCase() + "-" + _type.split('_').join('-') + "-" + _layer.split('_').join('-') + "-" + _name + "-bitdubai";
        }
        else
            return null;
    };

    /**
     * Loads a texture and applies it to the given mesh
     * @param {String}   source     Address of the image to load
     * @param {Mesh}     object     Mesh to apply the texture
     * @param {Function} [callback] Function to call when texture gets loaded, with mesh as parameter
     */
    this.applyTexture = function(source, object, callback) {

        if(source != null && object != null) {

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
                }
            );
        }
    };

    /**
     * Draws a text supporting word wrap
     * @param   {String} text       Text to draw
     * @param   {Number} x          X position
     * @param   {Number} y          Y position
     * @param   {Object} context    Canvas context
     * @param   {Number} maxWidth   Max width of text
     * @param   {Number} lineHeight Actual line height
     * @returns {Number} The Y coordinate of the next line
     */
    this.drawText = function(text, x, y, context, maxWidth, lineHeight) {

        if(text) {
            var words = text.split(' ');
            var line = '';

            for(var n = 0; n < words.length; n++) {
              var testLine = line + words[n] + ' ';
              var metrics = context.measureText(testLine);
              var testWidth = metrics.width;
              if(testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
              }
              else
                line = testLine;
            }
            context.fillText(line, x, y);

            return y + lineHeight;
        }

        return 0;
    };

    /**
     * Searchs an element given its full name
     * @param   {String} elementFullName Name of element in format [group]/[layer]/[name]
     * @returns {Number} The ID of the element in the table
     */
    this.searchElement = function(elementFullName) {

        if(typeof elementFullName !== 'string' || elementFullName === 'undefined/undefined/undefined')
            return -1;

        var group,
            components = elementFullName.split('/');

        if(components.length === 3) {

            for(var i = 0; i < window.tilesQtty.length; i++){

                var tile = window.helper.getSpecificTile(window.tilesQtty[i]).data;

                group = tile.platform || window.layers[tile.layer].super_layer;

                if(group && group.toLowerCase() === components[0].toLowerCase() &&
                   tile.layer.toLowerCase() === components[1].toLowerCase() &&
                   tile.name.toLowerCase() === components[2].toLowerCase())
                    return window.tilesQtty[i];
            }
        }

        return -1;
    };

    /**
     * Gets a point randomly chosen out of the screen
     * @author Miguel Celedon
     * @param   {number}        [z=0]         The desired Z
     * @param   {string}        [view='home'] The view of the relative center
     * @returns {THREE.Vector3} A new vector with the point position
     */
    this.getOutOfScreenPoint = function(z, view) {

        z = (typeof z !== "undefined") ? z : 0;
        view = (typeof view !== "undefined") ? view : 'home';

        var away = window.camera.getMaxDistance() * 4;
        var point = new THREE.Vector3(0, 0, z);

        point.x = Math.random() * away + away * ((Math.floor(Math.random() * 10) % 2) * -1);
        point.y = Math.random() * away + away * ((Math.floor(Math.random() * 10) % 2) * -1);

        point = window.viewManager.translateToSection(view, point);

        return point;
    };

    /**
     * Checks whether the given vector's components are numbers
     * @author Miguel Celedon
     * @param   {object}  vector The instance to check
     * @returns {boolean} True if the vector is valid, false otherwise
     */
    this.isValidVector = function(vector) {

        var valid = true;

        if(!vector)
            valid = false;
        else if(isNaN(vector.x) || isNaN(vector.y) || isNaN(vector.z))
            valid = false;

        return valid;
    };

    this.showBackButton = function() {
        window.helper.show('backButton');
    };

    this.hideBackButton = function() {
        window.helper.hide('backButton', 1000, true);
    };

    /**
     * Creates an empty tween which calls render() every update
     * @author Miguel Celedon
     * @param {number} [duration=2000] Duration of the tween
     */
    this.forceTweenRender = function(duration) {

        duration = (typeof duration !== "undefined") ? duration : 2000;

        new TWEEN.Tween(window)
        .to({}, duration)
        .onUpdate(window.render)
        .start();
    };

    this.getCenterView = function(view){

        var newCenter = new THREE.Vector3(0, 0, 0);

        newCenter = window.viewManager.translateToSection(view, newCenter);

        return newCenter;

    };

    this.fillTarget = function(x, y, z, view){

        var object3D = new THREE.Object3D();

        var target = {
                show : {},
                hide : {}
            };

        object3D.position.x = Math.random() * 80000 - 40000;
        object3D.position.y = Math.random() * 80000 - 40000;
        object3D.position.z = 80000 * 2;

        object3D.position.copy(window.viewManager.translateToSection(view, object3D.position));

        target.hide.position = new THREE.Vector3(object3D.position.x, object3D.position.y, object3D.position.z);
        target.hide.rotation = new THREE.Vector3(Math.random() * 180, Math.random() * 180, Math.random() * 180);

        target.show.position = new THREE.Vector3(x, y, z);
        target.show.rotation = new THREE.Vector3(0, 0, 0);

        return target;
    };

    this.getSpecificTile = function(_id){

        var id = _id.split("_");

        return window.TABLE[id[0]].layers[id[1]].objects[id[2]];

    };

    this.getLastValueArray = function(array){

        var value = array[array.length - 1];

        return value;
    };

    this.getCountObject = function(object){

        var count = 0;

        for(var i in object){
            count++;
        }

        return count;
    };

    this.getPositionYLayer = function(layer){

        var index = window.layers[layer].index;

        return window.tileManager.dimensions.layerPositions[index];
    };

    /**
     * Build and URL based on the address, wildcards and GET parameters
     * @param   {string} base   The URL address
     * @param   {Object} params The key=value pairs of the GET parameters and wildcards
     * @returns {string} Parsed and replaced URL
     */
    this.buildURL = function(base, params) {

        var result = base;
        var areParams = (result.indexOf('?') !== -1);   //If result has a '?', then there are already params and must append with &

        var param = null;
        
        if(params == null) params = {};
        
        params.env = self.ENV;

        //Search for wildcards parameters
        do {

            param = result.match(':[a-z0-9-zA-Z-_]+');

            if(param !== null) {
                var paramName = param[0].replace(':', '');

                if(params.hasOwnProperty(paramName) && params[paramName] !== undefined) {

                    result = result.replace(param, params[paramName]);
                    delete(params[paramName]);

                }
            }
        } while(param !== null);

        //Process the GET parameters
        for(var key in params) {
            if(params.hasOwnProperty(key) && params[key] !== '') {

                if(areParams === false)
                    result += "?";
                else
                    result += "&";

                result += key + ((params[key] !== undefined) ? ("=" + params[key]) : (''));

                areParams = true;
            }
        }

        return result;
    };
    
    /**
     * Makes a deep copy of an object
     * @author Miguelcldn
     * @lastmodifiedBy Ricardo Delgado
     * @param   {Object} obj The source
     * @returns {Object} A deep copy of obj
     */
    this.clone = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };

}


function Loader() {

    /**
     * [getStamp description]
     * @method getStamp
     * @return {[type]} [description]
     */
    function getStamp() {
        var img = document.createElement("img");
        img.className = 'stamp';
        img.src = 'images/alt_not_found.png';
        img.alt = 'Not Found';
        img.style.width = '90%';
        //img.style.margin = '35% 0 0 0';
        //img.style["margin-right"] = '80%';
        img.style.left = '5%';
        img.style.top = '40%';
        img.style.position = 'absolute';
        return img;
    }

    /**
     * check all elements in table
     * @method findThemAll
     */
    this.findThemAll = function() {
        for(var i = 0, l = table.length; i < l; i++) {
            if(!table[i].found && table[i].code_level == "concept") {
                var strIndex = "#" + i;
                $(strIndex).append(getStamp());
            }
        }
    };
}
/**
 * @author Emmanuel Colina
 * @lastmodifiedBy Miguel Celedon
 * function create a logo (wallet) and charge your textures
 */
function Logo(){
    
    var self = this;

    var POSITION_Z = 35000,
        SCALE = 24;
    
    var logo = createLogo(1000, 1000, "images/fermat_logo.png", new THREE.Vector3(0, 0, POSITION_Z));
    this.logo = logo;
    
    function createLogo(width, height, texture, position) {
        
        var mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(width, height),
            new THREE.MeshBasicMaterial({ side: THREE.FrontSide, transparent : true, opacity : 0, color : 0xFFFFFF}));
        helper.applyTexture(texture, mesh);
        
        mesh.scale.set(SCALE, SCALE, SCALE);
        mesh.position.copy(position);
        scene.add(mesh);
        
        return mesh;
    }
    
    /**
     * Starts the logo fade animation
     * @param {Number} [duration=1000] The duration of the fade
     * @author Miguel Celedon
     */
    this.startFade = function(duration) {
        
        var _duration = duration || 1500;

        var tween1 = new TWEEN.Tween(logo.material)
        .to({ opacity : 1, needsUpdate : true}, _duration)
        .onUpdate(render);
        
        var tween2 = new TWEEN.Tween(logo.material)
        .to({ opacity : 0.05, needsUpdate : true}, _duration)
        .onUpdate(render);

        tween1.chain(tween2);
        tween2.chain(tween1);

        tween1.start();
    };
    
    /**
     * Stops the fade animation
     * @param {Number} [duration=1000] The duration of the fade
     * @author Miguel Celedon
     */
    this.stopFade = function(duration) {
        
        var _duration = duration || 1000;

        var tweenstop = new TWEEN.Tween(logo.material)
        .to({ opacity : 1, needsUpdate : true}, _duration)
        .onUpdate(render)
        .start();
    };
}

/**
 * @author Ricardo Delgado
 * Create, modify and read all the necessary elements to create magazines.
 */
function Magazine() {
		
    window.PDFJS.disableWorker = true;

    var MAGAZINE = null,
        SCALE = null,
        WIDTH = window.innerWidth * 0.64,
        HEIGHT = (WIDTH * 0.5) * 1.21,
        DOC = null,
        LOAD = null,
        CONTENT = null;

    var viewMagazine = {

            book : { 
				file : "books/fermat-book-big.pdf",
				coverFront : "images/magazine/book/cover-front.jpg",
				coverFrontInside : "images/magazine/book/cover-front-inside.jpg",
				coverBack : "images/magazine/book/cover-back.jpg",
				coverBackInside : "images/magazine/book/cover-back-inside.jpg",
				scale : ((WIDTH * 0.482) * 0.00154)
				},
            readme : { 
				file : "books/fermat-readme-big.pdf",
				coverFront : "images/magazine/readme/cover-front.png",
				coverFrontInside : "images/magazine/readme/cover-front-inside.png",
				coverBack : "images/magazine/readme/cover-back.png",
				coverBackInside : "images/magazine/readme/cover-back-inside.png",
				scale : ((WIDTH * 0.482) * 0.00155)
				},
            whitepaper : { 
				file : "books/fermat-whitepaper-big.pdf",
				coverFront : "images/magazine/whitepaper/cover-front.jpg",
				coverFrontInside : "images/magazine/whitepaper/cover-front-inside.jpg",
				coverBack : "images/magazine/whitepaper/cover-back.jpg",
				coverBackInside : "images/magazine/whitepaper/cover-back-inside.jpg",
				scale : ((WIDTH * 0.482) * 0.00155)
				}
			};
		
    /**
     * @author Ricardo Delgado
     * Creates and starts all the functions for creating magazine.
     * @param {String} load Name of the magazine to create.
     */
    this.init = function(load){
				
        LOAD = load;

        if(load === 'book'){

            $.ajax({url: 'books/tableContent.html'}).done(function(pageHtml) {
							
                $('#container').append(pageHtml);

                $('#table').hide();

                CONTENT = parseInt($("#table li").size());
            });
        }

        window.PDFJS.getDocument(viewMagazine[load].file).then(function (doc) {

            DOC = doc;

            SCALE = viewMagazine[load].scale;

            addItems();

            addCss();

            configMagazine();

            coverPage(load);
						
            if(load === 'book')
				addTableContent();
						 
            for(var i = 1; i <= DOC.numPages; i++)
				addPage(i); 
						
            pageCompensate();

            backCoverPage(load);

            actionMagazine();

            addCss();

            positionMagazine();

        });

    };
		
    /**
     * @author Ricardo Delgado
     * Encourages and removes the magazine.
     */
    this.remove = function(){

        var flipbook = document.getElementById('flipbook-viewport'),
            positionHide = {x: (Math.random() + 1) * 5000, y: (Math.random() + 1) * 5000};

        animateMagazine(flipbook, positionHide);

        window.helper.hide(flipbook, 1500, false);

        window.Hash.go("").update();

        DOC = null;
		
    };
    
    /**
     * @author Ricardo Delgado
     * Add the special features of the magazine.
     */ 	
    this.actionSpecial = function(){
        
        if(!MAGAZINE.data().zoomIn){

            if(2 < MAGAZINE.turn('page')){ 

                MAGAZINE.turn("page", 2);
                MAGAZINE.turn("previous");
                navigationUrl("");
            }
        }

        zoomHandle(-1);

    };
    
    /**
     * @author Ricardo Delgado
     * Start adding all the settings for the magazine.
     */
    function configMagazine(){

        MAGAZINE.turn({
					
            width : WIDTH,

            height : HEIGHT,

            elevation: 80,

            gradients: true,

            autoCenter: false,

            acceleration: true

        });

    }

    /**
     * @author Ricardo Delgado
     * Creates all the elements (div) needed to magazine.
     */
    function addItems(){

        var page = $('<div />'),
            flipbook = $('<div />', {"class": "flipbook"}).append(page),
            viewport = $('<div />', {"class": "flipbook-viewport", "id": "flipbook-viewport"}).append(flipbook);

        $('#container').append(viewport);

        MAGAZINE = $('.flipbook');

    }

    /**
     * @author Ricardo Delgado
     * It sets the dimensions of the elements.
     */
    function addCss(){

        $('.flipbook').css({
				"width": WIDTH,
				"height": HEIGHT,
				"left": (WIDTH * 0.49) * -1,
				"top": (HEIGHT * 0.40) * -1
				});

        $('.flipbook .hard').css({
				"width": WIDTH * 0.5,
				"height": HEIGHT
				});

        $('.flipbook .own-size').css({
				"width": WIDTH * 0.482,
				"height": HEIGHT - 18
				});

        $('.table-contents li').css({
				"font-size": WIDTH * 0.013,
				"line-height": 1.5,
				"list-style":"none"
				});

        $('.table-contents a').css({
				"padding-right": WIDTH * 0.018
				});

        $('#contents1, #contents2').css({
				"font-size": WIDTH * 0.028
				});
				
		}
		
    /**
     * @author Ricardo Delgado
     * Creates and adds the cover and inside cover of the magazine.
     * @param {String} load Name of the magazine to create.
     */    
    function coverPage(load){
				
        var _class,
            cover,
            backCover;

        _class = "hard";

        cover = $('<div />', { 
					"class": _class,
					"id" : 'p'+ 1,
					"style" : "background-image:url("+viewMagazine[load].coverFront+")"
					});

        MAGAZINE.turn("addPage", cover, 1);

        backCover = $('<div />', { 
						"class": _class,
						"id" : 'p'+ 2,
						"style" : "background-image:url("+viewMagazine[load].coverFrontInside+")"
						});

        MAGAZINE.turn("addPage", backCover, 2);
				
    }
	 
    /**
     * @author Ricardo Delgado
     * Creates and adds the counter-cover and internal cover of the magazine.
     * @param {String} load Name of the magazine to create.
     */  
    function backCoverPage(load){

		var page = MAGAZINE.turn('pages') + 1,
			_class = "hard fixed",
			cover,
			backCover;

		backCover = $('<div />', { 
						"class": _class,
						"id" : 'pn',
						"style" : "background-image:url("+viewMagazine[load].coverBackInside+")"
						});

		MAGAZINE.turn("addPage", backCover, page); 

		page = MAGAZINE.turn('pages') + 1;

		_class = "hard";

		cover = $('<div />', { 
					"class": _class,
					"id" : 'pf',
					"style" : "background-image:url("+viewMagazine[load].coverBack+")"
					});

		MAGAZINE.turn("addPage", cover, page);
	
	}

    /**
     * @author Ricardo Delgado
     * Creates and adds all pages of pdf.
     * @param {Numer} page Number of the page to add.
     */  
    function addPage(page){

        var canvas,
            ctx,
            element,
			_class = "own-size",
            newPage = MAGAZINE.turn('pages') + 1;

        canvas = document.createElement('canvas');
        canvas.width  = WIDTH * 0.482;
        canvas.height = HEIGHT - 18;

        ctx = canvas.getContext("2d");

        renderPage(page, ctx);

        element = $('<div />', { 
                    "class": _class,
                    'id' : 'p'+ newPage
                    }).append(canvas);

        MAGAZINE.turn("addPage", element, newPage);

    }
		
    /**
     * @author Ricardo Delgado
     * Creates and adds an Compensate page magazine.
     */  
    function addPageCompensate(){

        var canvas,
            element,
            _class = "own-size",
            newPage = MAGAZINE.turn('pages') + 1;

        canvas = document.createElement('canvas');
        canvas.width  = WIDTH * 0.482;
        canvas.height = HEIGHT - 18;

        element = $('<div />', { 
				"class": _class,
                'id' : 'p'+ newPage
                }).append(canvas);

        MAGAZINE.turn("addPage", element, newPage);

    }
    
    /**
     * @author Ricardo Delgado
     * Table of contents of the book is added.
     */ 
    function addTableContent(){

        addTable(1);

        if(CONTENT > 24)
            addTable(2);

        $('#table').remove();
		
    }
    
    /**
     * @author Ricardo Delgado
     * The table of contents is added to the book.
     * @param {Numer}  apge Page number reading.
     */ 
    function addTable(page){

        var canvas,
            element,
            div,
            _class = "own-size",
            newPage = MAGAZINE.turn('pages') + 1;

        canvas = document.createElement('canvas');
        canvas.width  = WIDTH * 0.482;
        canvas.height = HEIGHT - 18;
        canvas.style.position = "relative";
        div = document.createElement('div');
        div.width  = WIDTH * 0.482;
        div.height = HEIGHT - 18;
        div.id = "content"+page;
        div.style.position = "absolute";
        div.style.zIndex = 0;
        div.style.top = 0;
        div.style.left = 0;

        element = $('<div />', { 
                        "class": _class,
                        'id' : 'p'+ newPage
                        }).append(canvas);

        element.append(div);

        MAGAZINE.turn("addPage", element, newPage);

        $('#content'+page).append(addContent(page));

    }
    
    /**
     * @author Ricardo Delgado
     * Content is added to the table.
     * @param {Numer}  apge Page number reading.
     */ 
    function addContent(page){

        var i = 1,
            end = 24,
            div = $('<div />', {"class": "table-contents"}),
            title = $('<h1 />', {"id": "contents"+page}).html($('#title').text()),
            ul = $('<ul />');

        if(page === 2){
            i = 25;
            end = 49;
        }

        for(i; i <= end; i++){
            ul.append($('#l-'+i));
        }

        div.append(title);
        div.append(ul);

        return div;

    }
    
    /**
     * @author Ricardo Delgado
     * Page offset is added to the journal.
     */ 
    function pageCompensate(){

        if(LOAD === 'book'){

            if(CONTENT <= 24){

                if(DOC.numPages % 2 === 0)
                    addPageCompensate(); 
            }
            else{

                if(DOC.numPages % 2 !== 0)
                    addPageCompensate();
            }
        }
        else{

            if(DOC.numPages % 2 !== 0)
                addPageCompensate(); 
        }

    }
		
    /**
     * @author Ricardo Delgado
     * Read and add PDF page to canvas.
     * @param {Numer}  num Page number reading.
     * @param {Object} ctx CTX of canvas.
     */  
    function renderPage(num, ctx){

        var viewport,
            renderContext;

        DOC.getPage(num).then(function (page){

            viewport = page.getViewport(SCALE);

            renderContext = {       
                    canvasContext: ctx,
                     viewport: viewport
            };

            page.render(renderContext);

        });

    }
		
    /**
     * @author Ricardo Delgado
     * Add the special features of the magazine.
     */ 
    function actionMagazine(){

        window.Hash.on('^' + LOAD + '/page\/([0-9]*)$', {

            yep: function(path, parts) {

                var factor = 2;

                if(LOAD === 'book'){

                    if(CONTENT > 24)
                        factor = 4;
                    else
                        factor = 3;
                }

                var page = parseInt(parts[1]) + factor;

                if(parts[1] !== undefined) {

                    if(MAGAZINE.turn('is')){

                        if(MAGAZINE.turn("hasPage", page)){ 

                            MAGAZINE.turn('page', page);
                            navigationUrl(parts[1]);
                        }
                    }
                }       
            }
        });
        
        MAGAZINE.bind("turning", function(event, page, view) {

            var magazine = $(this);

            if(page >= 2)
                $('#p2').addClass('fixed');
            else
                $('#p2').removeClass('fixed');

            if(page < magazine.turn('pages'))
                $('#pn').addClass('fixed');
            else
                $('#pn').removeClass('fixed');

            if(page >= 4)
                navigationUrl(page - 4);
            else
                navigationUrl("");
        }); 

        navigationUrl("");

        ConfigZoom();

    }
    
    /**
     * @author Ricardo Delgado
     * The product is controlled by the url.
     * @param {Numer}  num Page number.
     */  		
    function navigationUrl(page){

        if(page === 0)
            page = 1;

        window.Hash.go(LOAD + '/page/' + page).update();

    }
		
    /**
     * @author Ricardo Delgado
     * Believes zoom settings magazine.
     */ 
    function ConfigZoom(){

        var flipbook = document.getElementById("flipbook-viewport");

        if(flipbook.addEventListener) {

            flipbook.addEventListener("mousewheel", MouseWheelHandler, false);
            flipbook.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
        }

        function MouseWheelHandler(e) {

            var _e = window.event || e; 
            var delta = Math.max(-1, Math.min(1, (_e.wheelDelta || -_e.detail)));

            zoomHandle(delta);

            return false;
        }

    }
		
    /**
     * @author Ricardo Delgado
     * Zoom determines the value received.
     */ 
    function zoomHandle(delta) {

        if(MAGAZINE.data().zoomIn){ 
            
            if(delta < 0)
                zoomOut();
        }
        else{
            
            if(delta > 0)
                zoomThis();
        }

    }
		
    /**
     * @author Ricardo Delgado
     * Zooming magazine.
     */ 
    function zoomThis() {

        var element = document.getElementById('flipbook-viewport');
        var positionShow = {x : window.innerWidth * 0.5, y : (window.innerHeight * 0.5) - 60};
        animateMagazine(element, positionShow, 2500);

        MAGAZINE.transform('scale('+1.25+', '+1.25+')');
        MAGAZINE.data().zoomIn = true;
        MAGAZINE.turn('resize');
        MAGAZINE.turn('disable', true);

    }
				
    /**
     * @author Ricardo Delgado
     * Remove the magazine zoom.
     */ 
    function zoomOut() {

        var element = document.getElementById('flipbook-viewport');
        var positionShow = {x : window.innerWidth * 0.5, y : (window.innerHeight * 0.5)};
        animateMagazine(element, positionShow, 2500);

        MAGAZINE.transform('scale('+1+', '+1+')');
        MAGAZINE.data().zoomIn = false;
        MAGAZINE.turn('resize');
        MAGAZINE.turn('disable', false);

    }
		
    /**
     * @author Ricardo Delgado
     * Calculates the position of the magazine for animation.
     */ 
	function positionMagazine(){

        var element = document.getElementById('flipbook-viewport');

        var positionShow = {x : window.innerWidth * 0.5, y : window.innerHeight * 0.5};

        element.style.left = (Math.random() + 1) * 3000 + 'px';
        element.style.top = (Math.random() + 1) * 3000 + 'px';

        setTimeout(function() {
            animateMagazine(element, positionShow);
        }, 1500);
		
    }
		
    /**
     * @author Ricardo Delgado
     * Makes the entry or exit animation magazine.
     * @param {Object} element         elemento.
     * @param {Array}  target          The objetive position.
     * @param {Number} [duration=3000] Duration of the animation.
     */ 
    function animateMagazine(element, target, duration) {

        var _duration = duration || 3000,
            position = {x : element.getBoundingClientRect().left, y : element.getBoundingClientRect().top};

        new TWEEN.Tween(position)
                .to({x : target.x, y : target.y}, _duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .onUpdate(update)
                .start();

        function update() {
                element.style.left = position.x + 'px';
                element.style.top = position.y + 'px';
        }

    }

}
var map = {};

/**
 * @author Miguel Celedon
 * Loads the map (json version)
 * @param {Function} callback Function to call when finished
 */
function loadMap(callback){
    
    $.get("json/config_map.json", {}, function(json) {
        window.map = json;
        callback();
    });
}
function NetworkViewer() {
    
    BaseNetworkViewer.call(this);
    
    this.childNetwork = null;
}

NetworkViewer.prototype = Object.create(BaseNetworkViewer.prototype);
NetworkViewer.prototype.constructor = NetworkViewer;

/**
 * @override
 * Loads the data and configures camera
 * @author Miguel Celedon
 */
NetworkViewer.prototype.load = function() {
    
    //Ask for nodes
    $.ajax({
        url : window.API.getAPIUrl("servers"),
        method: "GET",
        context: this
    }).success(function(networkNodes) {
        
        this.NET_RADIOUS = this.NET_RADIOUS * (networkNodes.length - 1);
        this.drawNodes(networkNodes);
        this.configureCamera();
        
    }).error(function(request, error) {
        
        window.console.log("Error: " + error);
        window.alert("Error, please check the console and inform on github");
    });

};

/**
 * @override
 * Unloads and undraws everything and closes its children
 * @author Miguel Celedon
 */
NetworkViewer.prototype.unload = function() {
    
    if(this.childNetwork)
        this.close();
    
    var that = this;
    this.hide();

    setTimeout(function() {
        BaseNetworkViewer.prototype.unload.call(that);
    }, 2000);
    
};

/**
 * @override
 * To be executed when a nodes is clicked
 * @author Miguel Celedon
 * @param {object} clickedNode The clicked node
 */
NetworkViewer.prototype.onNodeClick = function(clickedNode) {
    
    if(this.childNetwork === null) {
        
        TWEEN.removeAll();
        
        BaseNetworkViewer.prototype.onNodeClick.call(this, clickedNode);

        this.hide([clickedNode.userData.id]);
        
        this.childNetwork = new ClientsViewer(clickedNode);
        
        this.open();
    }
};

/**
 * @override
 * Called when the function needs to show its details
 * @author Miguel Celedon
 */
NetworkViewer.prototype.open = function() {
    
    if(this.childNetwork)
        this.childNetwork.load();
    
};

/**
 * @override
 * Called when needed to hide the details
 * @author Miguel Celedon
 */
NetworkViewer.prototype.close = function() {
    
    if(this.childNetwork !== null) {
        
        this.childNetwork.close();
        this.childNetwork.unload();
        this.childNetwork = null;
    }
};

/**
 * @override
 * Draws the nodes in the network
 * @author Miguel Celedon
 * @param {Array} networkNodes Array of nodes to draw
 */
NetworkViewer.prototype.drawNodes = function(networkNodes) {

    for(var i = 0; i < networkNodes.length; i++) {

        var position = new THREE.Vector3(
            (Math.random() * 2 - 1) * this.NET_RADIOUS,
            (Math.random() * 2 - 1) * this.NET_RADIOUS,
            ((Math.random() * 2 - 1) * this.NET_RADIOUS));
        
        position = window.viewManager.translateToSection('network', position);

        var sprite = this.createNode(networkNodes[i], position);

        sprite.scale.set(1000, 1000, 1.0);

        window.scene.add(sprite);
    }

    this.createEdges();
};

/**
 * @override
 * Set the camera transition to get closer to the graph
 * @author Miguel Celedon
 */
NetworkViewer.prototype.configureCamera = function() {
    
    var self = this;
    var position = window.viewManager.translateToSection('network', new THREE.Vector3(0,0,0));
    setTimeout(function() {
        window.camera.move(position.x, position.y, self.NET_RADIOUS + 10000, 2000);
        
        self.show.call(self);
        
    }, 5000);

    setTimeout(function() {
        self.setCameraTarget();
    }, 7500);
};

/**
 * @override
 * Resets the network and unload its children
 * @author Miguel Celedon
 */
NetworkViewer.prototype.reset = function() {
    
    BaseNetworkViewer.prototype.reset.call(this);
    
    this.close();
};

/**
 * Closes and unloads the child, if the child is open, closes it
 * @author Miguel Celedon
 * @returns {object} The reference to itself, if there was no children I'll return null
 */
NetworkViewer.prototype.closeChild = function() {
    
    var self = null;
    
    if(this.childNetwork !== null) {
        
        //If the child is closed we need the parent to reset focus
        var parent = this.childNetwork.parentNode;
        
        this.childNetwork = this.childNetwork.closeChild();
        self = this;
        
        //If closed, reset focus
        if(this.childNetwork !== null)
            BaseNetworkViewer.prototype.onNodeClick.call(this, parent);
    }
    
    //Finally
    if(this.childNetwork === null)
    {
        this.reset();
        self = null;
    }
    
    return self;
};
// add all image paths to this array
function preLoad(onLoadAll) {
    
    var finished = false;
    
    var progressBar = {
        max : 0,
        loaded : 0
    };
    
    var updateBar = function() {
        
        var percnt = ((progressBar.loaded * 100) / progressBar.max) >> 0;
        $("#progress-bar").width(percnt + '%');
    };
    
    var loadImage = function(img) {
        
        var e = document.createElement('img');

        e.onload = function() {

            progressBar.loaded++;
            updateBar();

            if(progressBar.loaded >= progressBar.max) {
                // once we get here, we are pretty much done, so redirect to the actual page
                if(!finished) {
                    finished = true;
                    helper.hide('progress-bar', 1000, false);
                    onLoadAll();
                }
            }
        };
        
        e.onerror = e.onload;
        
        // this will trigger your browser loading the image (and caching it)
        e.src = img;
        };
    
    //Preload images
    $.ajax({
        url: "./json/images.json",
        success: function(images) {
            'use strict';

            progressBar.max = images.length;

            var i = 0;

            while(i < images.length) {
                loadImage(images[i]);
                i++;
            }
        }
    });
    
    //Preload fonts
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    ctx.font = '12px Canaro';
    ctx.fillText('.', 0, 0);
}
/**
 * @author Ricardo Delgado
 * Create screenshots of android with your images and functions.
 */
function ScreenshotsAndroid() {

	// Public Variables
    this.objects = {
			mesh : [],
			target : [],
			texture : [],
			title : { mesh : {},
					  texture : {}
					}			
		};
		
    // Private Variables
	var self = this,
		POSITION_X = 231,
		CONTROL = {},
		SCREENSHOTS = {},
		GROUP = {};

    var action = { state : false, mesh : null };

	var onClick = function(target) {
		change(target.userData.id);
		window.buttonsManager.removeAllButtons();
	};

	this.getScreenshots = function(){
		return SCREENSHOTS;
	};

	this.changePositionScreenshots = function(id, x, y){

		for(var t in SCREENSHOTS){

			if(SCREENSHOTS[t].id === id && SCREENSHOTS[t].show === true){

				SCREENSHOTS[t].position = new THREE.Vector3(x, y, 0);

				for(var i = 0; i < self.objects.mesh.length; i++){

					if(self.objects.mesh[i].userData.wallet === SCREENSHOTS[t].name){

						var mesh = self.objects.mesh[i];

						var target = {x : x, y : y + 240, z : 0};

						self.objects.target[i].x = target.x;
						self.objects.target[i].y = target.y;
						self.objects.target[i].z = target.z;

						animate(mesh, target, true);
					}
				}
			}
		}
	};

	this.deleteScreenshots = function(id){

		var newObjects = {};

		for(var t in SCREENSHOTS){

			if(SCREENSHOTS[t].id === id){

				for(var i = 0; i < self.objects.mesh.length; i++){

					if(SCREENSHOTS[t].name === self.objects.mesh[i].userData.wallet){

						var mesh = self.objects.mesh[i];

						var target = self.objects.target[i];

						self.objects.mesh.splice(i,1);
						self.objects.target.splice(i,1);

						animate(mesh, target, false, 1000, function(){

							window.scene.remove(mesh);
						 }); 
					}
				}
			}
			else
				newObjects[t] = SCREENSHOTS[t];
		}

		SCREENSHOTS = newObjects;

	};

	this.hidePositionScreenshots = function(newGroup, newLayer){

		var layer = window.CLI.query(window.layers,function(el){return (el.super_layer === false);});

		if(typeof window.platforms[newGroup] !== 'undefined'){

			if(newLayer === layer[0] || newLayer === layer[1] || newLayer === layer[2]){

				for(var t in SCREENSHOTS){

					var id = SCREENSHOTS[t].id;
					var data = id.split("_");

					if(data[0] === newGroup && data[1] === 'Sub App'){

						for(var i = 0; i < self.objects.mesh.length; i++){

							if(self.objects.mesh[i].userData.wallet === SCREENSHOTS[t].name){

								var mesh = self.objects.mesh[i];

								self.objects.target[i].z = 160000;

								animate(mesh, self.objects.target[i], false);
							}
						}
					}
				}
			}
		}
	};

    // Public method
    this.setGroup = function(_group, _layer) {

    	if(typeof GROUP[_group] === 'undefined')
        	GROUP[_group] = [];
            
        GROUP[_group].push(_layer);
    };

    this.showButtonScreenshot = function(id){

    	if(typeof SCREENSHOTS[id] !== 'undefined'){

    		window.buttonsManager.createButtons('showScreenshots', 'View Screenshots', function(){
    			
    			window.buttonsManager.removeAllButtons();
    			showScreenshotsButton(id);
    		});
    	}	
    };

	/**
	* @author Ricardo Delgado
	* Initialization screenshots.
	*/
	this.init = function() {

        $.get("json/screenshots.json", {}, function(json) {

	        for(var _group in json){

	        	for(var _layer in json[_group]){

	        		for(var _wallet in json[_group][_layer]){

        				for(var i = 0; i < window.TABLE[_group].layers[_layer].objects.length; i++){

        					var id = _group + "_" + _layer + "_" + i;
                            
                            var tile = window.helper.getSpecificTile(id).data;        

	        				if(tile.type === "Plugin" || tile.type === "Android"){ 

		        				if(tile.name === _wallet){
		        					
		        					var name = json[_group][_layer][_wallet].name,
		        						position = window.helper.getSpecificTile(id).target.show.position,
		        						_id = _group + "_" + _layer + "_" + name,
		        						show = false,
		        						screenshots = {};

		        					if(_layer === "Sub App" && GROUP[_group][0] === "Sub App")
		        						show = true;

	        						for(var _screen in json[_group][_layer][_wallet].screenshots){
										screenshots[_screen] = json[_group][_layer][_wallet].screenshots[_screen];
									}

									fillScreenshots(id, _id, position, name, show, screenshots);
		        				}
		        			}
	        			}
	        		}
	        	}
	        }
	        setScreenshot();
    	});
	};
    
    	/**
	* @author Ricardo Delgado
	* Wallet hidden from view.
	*/ 
	this.hide = function() {

		var ignore;

		if(action.state)
			ignore = action.mesh;

		for(var i = 0; i < self.objects.mesh.length; i++) { 

			if(i != ignore)  
				animate(self.objects.mesh[i], self.objects.target[i], false, 800);
		}
	}; 

	/**
	* @author Ricardo Delgado
	* Show wallet sight.
	*/ 
	this.show = function() {

        if(action.state)
			resetTexture(action.mesh);
		else {
			
			for(var i = 0; i < self.objects.mesh.length; i++) {

				animate(self.objects.mesh[i], self.objects.target[i], true, 1500);
			}
		}
	};
    
    // Private method
    /**
	* @author Ricardo Delgado
	* Screenshots settings show.
	*/ 
    function setScreenshot(){
        
        var cant = 0,
			lost = "";

		for(var id in SCREENSHOTS){

			var name = SCREENSHOTS[id].name,
				position = SCREENSHOTS[id].position,
				show = SCREENSHOTS[id].show;

			CONTROL[name] = {};

			addWallet(id, name);

			addMesh(position, name, show);
            
            addTextureTitle(name);

			lost = name;

			cant++;	
		}

		if(cant < 4){

			var random = Math.random() * 80000,
				_position = {x : random, y : random};
			for(cant; cant <= 4; cant++)
				addMesh('1', _position , lost, false);
		}

		addTitle();

	}

    /**
	* @author Ricardo Delgado
	* Variable filled SCREENSHOTS.
    * @param {String}  id   Wallet id
    * @param {number}  position   End position of the plane in the x axis.
    * @param {String}   wallet     Wallet group to which it belongs.
    * @param {Array}  screenshots  All routes screenshot.
	*/ 
	function fillScreenshots(id, _id, position, name, show, screenshots){

		SCREENSHOTS[id] = {};
		SCREENSHOTS[id].name = name;
		SCREENSHOTS[id].position = position;
		SCREENSHOTS[id].show = show;		
		SCREENSHOTS[id].screenshots = screenshots;
		SCREENSHOTS[id].id = _id;
	}

	/**
	* @author Ricardo Delgado
	* Each drawing screenshots of wallet.
	* @param {String}  wallet   Wallet draw. 
	*/
	function addWallet(id, wallet) {

		var cant = 0,
			total = 4;

		for(var c in SCREENSHOTS[id].screenshots){
			cant++;
		}

		if(cant <= 4)
			total = cant;

		for(var i = 1; i <= total; i++) {
			addTextureWallet(id, wallet, i);
		}
	}

	/**
	* @author Ricardo Delgado
	* Search for a wallet in specific in the variable self.objects.texture.
	* @param {String}  wallet   Group wallet to find.
	* @param {Number}    id     Wallet identifier. 
	*/
	function searchWallet(wallet, id) {

		var i = 0;

		while(self.objects.texture[i].wallet != wallet || self.objects.texture[i].id != id) {
			i++ ;
		}  

		return self.objects.texture[i].image;
	}

	/**
	* @author Ricardo Delgado
	* The plans necessary for the wallet are added, each level is for a group of wallet.
	* @param {number}  _position    End position of the plane in the x axis.
	* @param {String}    wallet     Wallet group to which it belongs.
	*/   
	function addMesh(_position, wallet, state) {

		var id = self.objects.mesh.length,
			pz = 80000 * 2,
			rx = Math.random() * 180,
			ry = Math.random() * 180,
			rz = Math.random() * 180,
			x = _position.x,
			y = 0,
			z = 0,
			_texture = null; 

        if(state){ 
            _texture = searchWallet(wallet, 1);
            y = window.tileManager.dimensions.layerPositions[3] + 240;
        }
        else{ 
        	y = _position.y;
            z = pz;
        }
			
		var mesh = new THREE.Mesh(
					new THREE.PlaneBufferGeometry(50, 80),
					new THREE.MeshBasicMaterial({ map:_texture, side: THREE.FrontSide, transparent: true })
					);

		mesh.material.needsUpdate = true;

		mesh.userData = {
			id : id,
			wallet : wallet,
			onClick : onClick
		};

		var _target = window.helper.fillTarget(x, y, z, 'table');

		mesh.material.opacity = 1;

		mesh.scale.set(4, 4, 4);

		var target = { x : x, y : y, z : z,
					   px : _target.hide.position.x, py : _target.hide.position.y, pz : _target.hide.position.z,
					   rx : rx, ry : ry, rz : rz };

		mesh.position.copy(_target.hide.position);
		mesh.rotation.set(rx, ry, rz);

		window.scene.add(mesh);

		self.objects.target.push(target);

		self.objects.mesh.push(mesh);
	}

	/**
	* @author Ricardo Delgado
	* Add the title of the group focused wallet.
	* @param {String}    text    Behalf of the wallet.
	*/ 
	function addTitle() {

		var px = Math.random() * 80000 - 40000,
			py = Math.random() * 80000 - 40000,
			pz = 80000 * 2,
			rx = Math.random() * 180,
			ry = Math.random() * 180,
			rz = Math.random() * 180,
			texture = null;
			
		var mesh = new THREE.Mesh(
					new THREE.PlaneGeometry(70, 15),
					new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide, transparent: true })
					);

		mesh.material.needsUpdate = true;

		mesh.material.opacity = 1;

		mesh.scale.set(4, 4, 4);

		var target = { px : px, py : py, pz : pz,
					   rx : rx, ry : ry, rz : rz };

		mesh.position.set(px, py, pz);
		mesh.rotation.set(rx, ry, rz);

		window.scene.add(mesh);

		self.objects.title.mesh = {
						mesh : mesh,
						target : target
						};
	}

	/**
	* @author Ricardo Delgado
	* Add the title of the group focused wallet.
	* @param {String}    Wallet    Behalf of the wallet.
	*/ 
	function addTextureTitle(wallet){

		var canvas,
			ctx,
			texture,
			text = wallet;

		canvas = document.createElement('canvas');
		canvas.width  = 600;
		canvas.height = 200;
		var middle = canvas.width / 2;
		ctx = canvas.getContext("2d");
		ctx.textAlign = 'center';
		ctx.font="bold 40px Arial";
		ctx.fillText(text, middle, 100);

		texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;  
		texture.minFilter = THREE.NearestFilter;

		self.objects.title.texture[wallet] = texture;
	}

	/**
	* @author Ricardo Delgado
	* Wallet drawn and added required.
	* @param {String}    wallet    Wallet draw.
	* @param {String}      i       Group identifier wallet.
	*/ 
	function addTextureWallet(_id, wallet, i) {

		var _texture,
			image,
			cant = 0,
			place;

		for(var f in SCREENSHOTS[_id].screenshots){
			cant++;
		}

		place = Math.floor(Math.random()* cant + 1);

		if(CONTROL[wallet]["picture"+place] === undefined){

			CONTROL[wallet]["picture"+place] = place;

			image = new THREE.ImageUtils.loadTexture(SCREENSHOTS[_id].screenshots['Screenshots_'+place]);
			image.needsUpdate = true;  
			image.minFilter = THREE.NearestFilter;

			_texture = { id : i, wallet : wallet, image : image };

			self.objects.texture.push(_texture);

		}
		else
			addTextureWallet(_id, wallet, i);
	}

	/**
	* @author Ricardo Delgado
	* Load the title of the selected wallet.
	* @param {String}    Wallet    Behalf of the wallet.
	* @param {object}     mesh     Wallet.	
	*/ 
	function showTitle(wallet, mesh) {

		var _mesh = self.objects.title.mesh.mesh,
			target = {};

		target = { x: mesh.position.x, y : mesh.position.y + 240, z : mesh.position.z };

		_mesh.material.map = self.objects.title.texture[wallet]; 
		_mesh.material.needsUpdate = true;

		animate(_mesh, target, true, 2000);
	}

	/**
	* @author Ricardo Delgado
	* Wallet focus and draw the other planes in the same group wallet.
	* @param {Number}    id    Wallet identifier focus.
	*/ 
	
	function change(id) {

		var duration = 2000;
		var focus = parseInt(id);

		if(window.camera.getFocus() === null) {

			action.state = true; action.mesh = id;

			window.tileManager.letAlone();

			window.camera.setFocus(self.objects.mesh[focus], new THREE.Vector4(0, 0, window.TILE_DIMENSION.width - window.TILE_SPACING, 1), duration);
			
			window.headers.hideHeaders(duration);
			
			window.helper.showBackButton();

			positionFocus(id);
		}
	}

	function showScreenshotsButton(_id){

		var wallet = SCREENSHOTS[_id].name,
			position = SCREENSHOTS[_id].position,
			id = 0,
			mesh = null,
            target = {};
            

		for(var i = 0; i < self.objects.mesh.length; i++){
			if(self.objects.mesh[i].userData.wallet === wallet){
				id = i;
				mesh = self.objects.mesh[i];
			}
		}

		action.state = true; action.mesh = id;

		window.tileManager.letAlone();

		target = { x: position.x, y : position.y, z : 0 };

		animate(mesh, target, true, 1000, function(){
	   			window.camera.enable();
	   			window.camera.setFocus(mesh, new THREE.Vector4(0, 0, window.TILE_DIMENSION.width - window.TILE_SPACING, 1), 1000);
	   			positionFocus(id);
			});

	}

	/**
	* @author Ricardo Delgado
	* Screenshots account total has a wallet.
	* @param {String}    Wallet    Wallet counting.
	*/ 
	function countControl(wallet){

		var sum = 0;
		
		for(var i in CONTROL[wallet]){
			sum++;
		}

		return sum;
	}

	/**
	* @author Ricardo Delgado
	* Accommodate the wallet.
	* @param {Number}    id    Identifier reference wallet.
	*/ 
	function positionFocus(id) {

		var ignore = id,
			mesh = self.objects.mesh[id],
			wallet = mesh.userData.wallet,
			target = {},
			count = 1,
			_countControl = countControl(wallet),
			x = POSITION_X;

		showTitle(wallet, mesh);
			
		target = { x: mesh.position.x - (x / 2), y : mesh.position.y, z : mesh.position.z };
        
		if(_countControl > 3)
			animate(mesh, target, true, 1000);

		setTimeout(function() { loadTexture(wallet, ignore); }, 500);

		setTimeout(function() { 

			for(var i = 0; i < 4; i++) { 

				if(count < 4){ 

					if(count < _countControl){

						if(i != ignore) { 

							var _mesh = self.objects.mesh[i];

							if(_countControl > 3){ 

								if(x === POSITION_X)
									x = x * 2;
								else if(x > POSITION_X)
									x = (x / 2) * -1;
								else
									x = POSITION_X;

							}
							else{

								if(count === 1)
									x = x;
								else
									x = x * -1;
							}

							count++;

							target = { x: mesh.position.x + x, y : mesh.position.y, z : mesh.position.z };

							animate(_mesh, target, true, 2000);

						}
					} 
				}            
			}
		}, 1500);
	}

	/**
	* @author Ricardo Delgado
	* Texture change of plans regarding the group focused wallet.
	* @param {String}    wallet    Behalf of the wallet.
	* @param {Number}    ignore    Id focused wallet.
	*/ 
	function loadTexture(wallet, ignore) {

		var id = 1,
			_mesh,
			count = 1,
			_countControl = countControl(wallet);

		for(var i = 0; i < 4; i++) { 

			if(count < 4){ 

				if(count < _countControl){

					if(i != ignore) { 

						id = id + 1 ;

						_mesh = self.objects.mesh[i];
						_mesh.material.map = searchWallet(wallet, id); 
						_mesh.material.needsUpdate = true;

						count++;
					}
				}
			}
		} 
	}

	/**
	* @author Ricardo Delgado
	* Change texture of the planes to the original state.
	* @param {Number}    ignore    Id focused wallet.
	*/   
	function resetTexture(ignore) {

		var title = self.objects.title.mesh.mesh, 
			_mesh;

		self.hide(); 

		animate(title, self.objects.title.mesh.target, false, 1000, function() {   

			for(var i = 0; i < self.objects.mesh.length; i++) { 

				if(i != ignore) { 

					_mesh = self.objects.mesh[i];
					_mesh.material.map = searchWallet(_mesh.userData.wallet, 1); 
					_mesh.material.needsUpdate = true;
				}
			} 

			action.state = false;

			self.show();  

		});
	}

	/**
	* @author Ricardo Delgado
	* Animation and out of the wallet.
	* @param {object}     mesh     Wallet.
	* @param {Number}    target    Coordinates wallet.
	* @param {Boolean}   state     Status wallet.
	* @param {Number}   duration   Animation length.
	*/ 
	function animate(mesh, target, state, duration, callback){

		var _duration = duration || 2000,
			x,
			y,
			z,
			rx,
			ry,
			rz;

		if(state) {

		   x = target.x;
		   y = target.y;
		   z = target.z;

		   rx = 0;
		   ry = 0;
		   rz = 0;
		} 
		else {

		   x = target.px;
		   y = target.py;
		   z = target.pz;
		   
		   rx = target.rx;
		   ry = target.ry;
		   rz = target.rz; 
		}  

		_duration = Math.random() * _duration + _duration;

		new TWEEN.Tween(mesh.position)
			.to({x : x, y : y, z : z}, _duration)
			.easing(TWEEN.Easing.Exponential.InOut)
			.start();

		new TWEEN.Tween(mesh.rotation)
			.to({x: rx, y: ry, z: rz}, _duration + 500)
			.easing(TWEEN.Easing.Exponential.InOut)
			.onComplete(function() {
                    if(callback != null && typeof(callback) === 'function')
                        callback();   
                })
			.start();
    }

}
function ServicesViewer(parentNode) {
    
    BaseNetworkViewer.call(this);
    
    this.parentNode = parentNode;
    this.childNetwork = null;
}

ServicesViewer.prototype = Object.create(BaseNetworkViewer.prototype);
ServicesViewer.prototype.constructor = ServicesViewer;

/**
 * @override
 * Executed when a node is clicked, moves the camera and draw its childs
 * @author Miguel Celedon
 * @param {object} clickedNode The clicked node
 */
ServicesViewer.prototype.onNodeClick = function(clickedNode) {
    
    if(this.childNetwork === null) {
        
        BaseNetworkViewer.prototype.onNodeClick.call(this, clickedNode);

        this.hide([clickedNode.userData.id], clickedNode.userData.id);
        
        //this.childNetwork = new ServicesViewer(clickedNode);
        this.childNetwork = {};
        
        this.open();
    }
};

/**
 * Draws the nodes in the network
 * @author Miguel Celedon
 * @param {Array} networkNodes Array of nodes to draw
 */
ServicesViewer.prototype.drawNodes = function(networkNodes) {

    for(var i = 0; i < networkNodes.length; i++) {

        var halfRadious = this.NET_RADIOUS / 2;
        
        var position = new THREE.Vector3(
            Math.random() * this.NET_RADIOUS,
            - (Math.random() * halfRadious + halfRadious),
            Math.random() * this.NET_RADIOUS);
        
        position.add(this.parentNode.position);

        var sprite = this.createNode(networkNodes[i], position);

        sprite.scale.set(1000, 1000, 1.0);

        window.scene.add(sprite);
    }

    this.createEdges();
    
    this.show();
};

ServicesViewer.prototype.test_load = function() {
    
    var networkNodes = [];
    var NUM_NODES = 5;
    var TYPES = ['actor'];
    
    for(var i = 0; i < NUM_NODES; i++) {
        
        var node = {
            id : i,
            edges : [{id : this.parentNode.userData.id}],
            subType : TYPES[Math.floor(Math.random() * 10) % 2]
        };
        
        networkNodes.push(node);
    }
    
    return networkNodes;
    
};

ServicesViewer.prototype.createEdges = function() {
    
    for(var nodeID in this.nodes) {
        
        var origin = this.nodes[nodeID].sprite.position;
        var dest = this.parentNode.position;
        
        var lineGeo = new THREE.Geometry();
        lineGeo.vertices.push(origin, dest);

        var line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({color : 0x00ff00, transparent : true, opacity : 0}));

        scene.add(line);
        
        this.edges.push({
            from : nodeID,
            to : this.parentNode.userData.id,
            line : line
        });
    }
    
    //Not needed now
    //BaseNetworkViewer.prototype.createEdges.call(this);
};

/**
 * Hide edges except the one connecting to the parent
 * @author Miguel Celedon
 * @param   {string}      clickedID The ID of the clicked node to except its edge hiding
 * @returns {TWEEN.Tween} The first in the tween chain
 */
ServicesViewer.prototype.hideEdges = function(clickedID) {
    
    var edgeID = this.edgeExists(this.parentNode.userData.id, clickedID);
    
    return BaseNetworkViewer.prototype.hideEdges.call(this, [edgeID]);
    
};

/**
 * Closes and unloads the child, if the child is open, closes it
 * @author Miguel Celedon
 * @returns {object} The reference to itself, if there was no children I'll return null
 */
ServicesViewer.prototype.closeChild = function() {
    
    var self = null;
    
    if(this.childNetwork !== null){
        
        //TODO: Change for a call to childNetwork.closeChild() to keep the chain
        this.childNetwork = null;
        
        self = this;
        
        //If direct child is closed, show its brothers
        if(this.childNetwork === null)
            this.reset();
    }
    else {
        this.close();
        this.unload();
    }
    
    return self;
    
};
function Session() {

    var self = this;
    var isLogin;
    var api_key = "56a10473b27e63185c6970d6";
    var axs_key;
    this.usr = {};
    var code;
    var clientID = "d00a7c7d4489139327e4";
    switch (window.location.href.match("//[a-z0-9]*")[0].replace("//", '')) {
        case "dev":
            clientID = 'd00a7c7d4489139327e4';
            break;
        case "lab":
            clientID = 'f98fdd310fe6284f5416';
            break;
        case "3d":
            clientID = '1d65cbed13dbd026bec8';
            break;
    }

    this.getIsLogin = function() {
        return isLogin;
    };

    this.getUserLogin = function() {
        return self.usr;
    };

    /**
     * @author Ricardo Delgado
     */
    this.displayLoginButton = function(display) {

        if (window.session.getIsLogin()) {

            if (display) {

                window.helper.show('logout', 2000);
                window.helper.show('containerLogin', 2000);
            } else {

                window.helper.hide('logout', 2000, true);
                window.helper.hide('containerLogin', 2000, true);
            }
        } else {

            if (display)
                window.helper.show('login', 2000);
            else
                window.helper.hide('login', 2000, true);
        }

    };

    /**
     * @author Ricardo Delgado
     */
    this.useTestData = function() {
    };

    /**
     * Login with github and gets the authorization code
     */
    this.getAuthCode = function() { //CLientID: c25e3b3b1eb9aa35c773 - Web
        var url = helper.buildURL("https://github.com/login/oauth/authorize", {
            client_id: clientID
        }); //ClientID: f079f2a8fa65313179d5 - localhost
        url += "&redirect_uri=" + window.location.href;
        window.location.href = url;
    };

    /**
     * Ago logout and delete the token
     */
    this.logout = function() {

        var url_logout = window.API.getAPIUrl("logout", {
            axs_key: axs_key,
            api_key: api_key
        });
        console.log("url: " + url_logout);
        $.ajax({
            url: url_logout,
            type: "GET",
            headers: {
                'Accept': 'application/json'
            }
        }).success(function(data) {
            console.log("Logout", data);
            if (data !== undefined) {
                if (data === true) {
                    isLogin = false;
                    $("#login").fadeIn(2000);
                    $("#logout").fadeOut(2000);
                    self.usr = undefined;
                }
            }
        });
        deleteToken();
    };

    this.init = function() {

        var cookie = getToken();

        if (cookie._id !== "") {
            self.login(true, cookie);
        } else {
            code = window.location.search.replace(/.+code=/, '');

            if ((code !== "" && code.indexOf("/") < 0))
                self.login(false);
            else
                window.getData();
        }

    };

    /**
     * Logged to the user and returns the token
     */
    this.login = function(option, cookie) {

        if (!option) {

            var url = window.API.getAPIUrl("login", {
                code: code,
                api_key: api_key
            });
            console.log("url: " + url);

            $.ajax({
                url: url,
                type: "GET",
                headers: {
                    'Accept': 'application/json'
                }
            }).success(function(tkn) {
                self.usr = tkn._usr_id;
                axs_key = tkn.axs_key;
                window.console.dir(tkn);

                if (self.usr !== undefined) {
                    isLogin = true;

                    self.usr.axs_key = axs_key;

                    console.log("Logueado Completamente: " + self.usr.name);

                    $("#login").fadeOut(2000);
                    $("#logout").fadeIn(2000);

                    drawUser(self.usr);
                    setToken(tkn);

                    window.getData();
                }
                
                else{ 
                    console.log("Error:", tkn);
                    window.alert("Error: Could not login to Github, please inform at https://github.com/Fermat-ORG/fermat-org/issues");
                }
            });
        } else {
            self.usr = cookie._usr_id;
            axs_key = self.usr.axs_key;

            isLogin = true;

            self.usr.axs_key = axs_key;

            console.log("Logueado Completamente: " + self.usr.name);

            $("#login").fadeOut(2000);
            $("#logout").fadeIn(2000);

            drawUser(self.usr);

            window.getData();
        }
    };

    function drawUser(user) {
        var texture;

        texture = createTextureUser(user);
        var meshUserLogin = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(230, 120),
            new THREE.MeshBasicMaterial({
                transparent: true,
                color: 0xFFFFFF
            }));

        meshUserLogin.material.map = texture;
        meshUserLogin.material.needsUpdate = true;
        meshUserLogin.scale.set(75, 75, 75);
        meshUserLogin.position.y = 28500;
        meshUserLogin.position.x = 50000;
        //scene.add(meshUserLogin);
    }

    function createTextureUser(user) {

        var canvas = document.createElement('canvas');
        canvas.width = 183 * 5;
        canvas.height = 92 * 5;
        canvas.style.height = '100px';
        canvas.id = "canvasLogin";

        document.getElementById('containerLogin').appendChild(canvas);
        var ctx = canvas.getContext('2d');
        ctx.globalAlpha = 0;
        ctx.fillStyle = "#FFFFFF";
        ctx.globalAlpha = 1;

        var texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.LinearFilter;

        var pic = {
            src: user.avatar_url,
            alpha: 0.8
        };
        pic.x = 26.5;
        pic.y = 40;
        pic.w = 84 * 1.9;
        pic.h = 84 * 1.9;

        var nameUser = {
            text: user.name,
            font: 'bold ' + 50 + 'px Arial'
        };
        nameUser.x = 120 * 2;
        nameUser.y = 135;
        nameUser.color = "#000000";

        var data = [pic, nameUser];

        drawPictureUser(data, ctx, texture);

        return texture;
    }

    function drawPictureUser(data, ctx, texture) {

        var image = new Image();
        var actual = data.shift();

        if (actual.src && actual.src != 'undefined') {

            image.onload = function() {


                if (actual.alpha)
                    ctx.globalAlpha = actual.alpha;

                ctx.drawImage(image, actual.x, actual.y, actual.w, actual.h);
                if (texture)
                    texture.needsUpdate = true;

                ctx.globalAlpha = 1;

                if (data.length !== 0) {

                    if (data[0].text)
                        drawTextUser(data, ctx, texture);
                    else
                        drawPictureUser(data, ctx, texture);
                }
            };

            image.onerror = function() {
                if (data.length !== 0) {
                    if (data[0].text)
                        drawTextUser(data, ctx, texture);
                    else
                        drawPictureUser(data, ctx, texture);
                }
            };

            image.crossOrigin = "anonymous";
            image.src = actual.src;
        } else {
            if (data.length !== 0) {
                if (data[0].text)
                    drawTextUser(data, ctx, texture);
                else
                    drawPictureUser(data, ctx, texture);
            }
        }
    }

    function drawTextUser(data, ctx, texture) {

        var actual = data.shift();

        if (actual.color)
            ctx.fillStyle = actual.color;

        ctx.font = actual.font;

        if (actual.constraint)
            if (actual.wrap)
                helper.drawText(actual.text, actual.x, actual.y, ctx, actual.constraint, actual.lineHeight);
            else
                ctx.fillText(actual.text, actual.x, actual.y, actual.constraint);
        else
            ctx.fillText(actual.text, actual.x, actual.y);

        if (texture)
            texture.needsUpdate = true;

        ctx.fillStyle = "#FFFFFF";

        if (data.length !== 0) {

            if (data[0].text)
                drawTextUser(data, ctx, texture);
            else
                drawPictureUser(data, ctx, texture);
        }
    }

    function setToken(tkn) {
        setCookie("id", tkn._id, 7);
        setCookie("key", tkn.axs_key, 7);
        setCookie("update", tkn.upd_at, 7);
        setCookie("v", tkn._usr_id.__v, 7);
        setCookie("avatar", tkn._usr_id.avatar_url, 7);
        setCookie("email", tkn._usr_id.email, 7);
        setCookie("github", tkn._usr_id.github_tkn, 7);
        setCookie("name", tkn._usr_id.name, 7);
        setCookie("usrnm", tkn._usr_id.usrnm, 7);
    }

    function deleteToken() {
        deleteCookie("id");
        deleteCookie("key");
        deleteCookie("update");
        deleteCookie("v");
        deleteCookie("avatar");
        deleteCookie("email");
        deleteCookie("github");
        deleteCookie("name");
        deleteCookie("usrnm");
    }

    function getToken() {
        var tkn = {
            _id: getCookie("id"),
            _usr_id: {
                __v: getCookie("v"),
                _id: getCookie("id"),
                avatar_url: getCookie("avatar"),
                axs_key: getCookie("key"),
                email: getCookie("email"),
                github_tkn: getCookie("github"),
                name: getCookie("name"),
                upd_at: getCookie("update"),
                usrnm: getCookie("usrnm")
            },
            axs_key: getCookie("key"),
            upd_at: getCookie("update")
        };

        return tkn;
    }

    function setCookie(name, value, days) {
        var d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + "; " + expires;
    }

    function getCookie(name) {
        var cname = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ')
                c = c.substring(1);
            if (c.indexOf(cname) === 0)
                return c.substring(cname.length, c.length);
        }
        return "";
    }

    function deleteCookie(name) {
        var expires = "expires=Thu, 20 Dec 2012 00:00:00 UTC";
        document.cookie = name + "=; " + expires;
    }
}

function SignLayer(){

	var objects = [],
		positions = {
            lastTarget : [],
            target : []
        },
        self = this;

    /**
     * Creates a flow box and when texture is loaded, calls fillBox
     * @param   {String}     src     The texture to load
     * @param   {Function}   fillBox Function to call after load, receives context and image
     * @returns {THREE.Mesh} The created plane with the drawed texture
     * @author Emmanuel Colina
     */

    function createBoxSignLayer(src, fillBox, width, height) {
        
        var canvas = document.createElement('canvas');
        canvas.height = height;
        canvas.width = width;
        var ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#000000'; 
        
        var image = document.createElement('img');
        var texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.LinearFilter;
        
        image.onload = function() {
            fillBox(ctx, image);
            texture.needsUpdate = true;
        };
        
        image.src = src;
        
        var mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(width, height),
            new THREE.MeshBasicMaterial({color : 0xFFFFFF, map : texture, transparent : true})
        );
        
        return mesh;
    }

    /**
 	* @author Emmanuel Colina
 	* @param   {x}                  position X    
    * @param   {y}                  position Y
    * @param   {titleSign} [string] sign layer     
 	* function create a Sign Layer
 	*/
	this.createSignLayer = function(x, y, titleSign, _group){
		var mesh;
		var source = "images/sign/sign.png";

        window.screenshotsAndroid.setGroup(_group, titleSign);

            if(typeof TABLE[_group].x === 'undefined')
                TABLE[_group].x = x;

		var fillBox = function(ctx, image) {
            
            ctx.drawImage(image, 0, 0);
            
            //sign
            var size = 40;

                ctx.font = 'bold ' + size + 'px Arial';

            window.helper.drawText(titleSign, 50, 80, ctx, 700, size);
        };

        mesh = createBoxSignLayer(source, fillBox, 720, 140);
        mesh.name = _group.concat(titleSign);
		mesh = self.setPositionSignLayer(mesh, x , y);
		window.scene.add(mesh);
	};

    /**
    * @author Isaias Taborda
    * @param   {_group}    [string] sign layer's group    
    * @param   {titleSign} [string] sign layer's name 
    * @returns {boolean}    
    * checks if a Sign Layer has been drawn
    */
    this.findSignLayer = function(group, titleSign){
        var objectsSize = objects.length;
        for(var i=0; i<objectsSize; i++) {
            if(objects[i].name === group.concat(titleSign))
                return true;
        }

        return false;
    }

    /**
    * @author Isaias Taborda
    * @param   {_group}    [string] sign layer's group    
    * @param   {titleSign} [string] sign layer's name     
    * function delete a Sign Layer
    */
    this.deleteSignLayer = function(_group, titleSign){
        var objectsSize = objects.length;
        for(var i=0; i<objectsSize; i++) {
            if(objects[i].name === _group.concat(titleSign)) {
                this.removeSignLayer(i);
                setTimeout(function(){
                    window.scene.remove(objects[i]);
                    objects.splice(i,1);
                    positions.target.splice(i,1);
                    positions.lastTarget.splice(i,1);
                }, 5000);
                break;
            }
        }
    };

    this.removeSignLayer = function(pos){
        var duration = 5000;
        new TWEEN.Tween(objects[pos].position)
            .to({
                x : positions.lastTarget[pos].x,
                y : positions.lastTarget[pos].y,
                z : positions.lastTarget[pos].z
            },duration)
            .easing(TWEEN.Easing.Bounce.In)
            .start();
    };

	/**
 	* @author Emmanuel Colina
 	* @param   {mesh} Mesh object
 	* @param   {x}   position X    
    * @param   {y}   position Y
 	* function set position Layer
 	*/

	this.setPositionSignLayer = function(mesh, x, y){

		var object, object2;

		mesh.position.x = Math.random() * 990000;
        mesh.position.y = Math.random() * 990000;
        mesh.position.z = 80000 * 2;
            
        mesh.position.copy(window.viewManager.translateToSection('table', mesh.position));
		objects.push(mesh);

		object2 = new THREE.Vector3();
		object2.x = mesh.position.x ;
		object2.y = mesh.position.y ;

		positions.lastTarget.push(object2);

		object = new THREE.Vector3();
		object.x = x - 500;
		object.y = y;

		positions.target.push(object);

		return mesh;
	};

	this.transformSignLayer = function(){
		
		var duration = 3000;

		for(var i = 0, l = objects.length; i < l; i++) {
            new TWEEN.Tween(objects[i].position)
            .to({
                x : positions.target[i].x,
                y : positions.target[i].y,
                z : positions.target[i].z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
	};

	this.letAloneSignLayer = function(){

		var duration = 3000;
            
        for(var i = 0, l = objects.length; i < l; i++) {
        	new TWEEN.Tween(objects[i].position)
            .to({
                x : positions.lastTarget[i].x,
                y : positions.lastTarget[i].y,
                z : positions.lastTarget[i].z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
	};
}

/**
 * @author Ricardo Delgado
 */
function TableEdit() {

    var tileWidth = window.TILE_DIMENSION.width - window.TILE_SPACING,
        tileHeight = window.TILE_DIMENSION.height - window.TILE_SPACING;

    var self = this;

    this.formerName = null;

    /**
     * @author Ricardo Delgado
     */

    this.addButton = function(_id){

        var id = _id || null,
            text = 'Edit Component',
            button = 'buttonFermatEdit',
            side = null,
            callback = null;

        if(id === null){

            if(!window.session.getIsLogin()){
            
                callback = function(){ 
                    window.session.getAuthCode();
                };
            }
            else{

                callback = function(){ 

                    window.fieldsEdit.actions.type = "insert";

                    window.buttonsManager.removeAllButtons();

                    window.session.displayLoginButton(false);

                    drawTile(null, addAllFilds);
                };

            }

            window.session.displayLoginButton(true);

            text = 'Add New Component';
            button = 'buttonFermatNew';
            side = 'left';

            window.buttonsManager.createButtons(button, text, callback, null, null, side);

        }
        else{

            if(!window.session.getIsLogin()){
            
                callback = function(){ 
                    window.session.getAuthCode();
                };
            }
            else{

                callback = function(){

                    validateLock(id, function(){ 

                        window.fieldsEdit.actions.type = "update";
                        window.buttonsManager.removeAllButtons(); 
                        addAllFilds();
                        fillFields(id);
                        drawTile(id);
                    });
                };
            }

            window.session.displayLoginButton(false);

            window.buttonsManager.createButtons(button, text, callback, null, null, side);

            if(!window.session.getIsLogin()){
            
                callback = function(){ 
                    window.session.getAuthCode();
                };
            }
            else{ 

                callback = function(){

                    validateLock(id, function(){ 
                        
                        if(window.confirm("Are you sure you want to remove this component?"))           
                            deleteTile(id);
                    });                
                };
            }

            text = 'Delete Component';
            button = 'buttonFermatDelete';
            side = 'right';

            window.buttonsManager.createButtons(button, text, callback, null, null, side);
        }   
    
    };

    function addAllFilds(){

        window.fieldsEdit.createFieldTableEdit();
    }

    // Start editing
    function fillFields(id){

        var tile = window.helper.clone(window.helper.getSpecificTile(id).data);

        window.fieldsEdit.actualTile = window.helper.clone(tile);

        if(tile.platform !== undefined)
            document.getElementById('select-Group').value = tile.platform;
        else
            document.getElementById('select-Group').value = window.layers[tile.layer].super_layer;

        window.fieldsEdit.changeLayer(document.getElementById('select-Group').value);

        if(tile.layer !== undefined)        
            document.getElementById('select-layer').value = tile.layer;

        if(tile.type !== undefined)
            document.getElementById('select-Type').value = tile.type;
        
        if(tile.difficulty !== undefined)
            document.getElementById('select-Difficulty').value = tile.difficulty; 

        if(tile.code_level !== undefined)
            document.getElementById('select-State').value = tile.code_level; 

        if(tile.name !== undefined) {
            document.getElementById('imput-Name').value = tile.name;       
            self.formerName = tile.name;
        }
        
        if(tile.devs !== undefined) 
            document.getElementById('modal-devs').value = tile.devs.slice(0);
        
        if(tile.description !== undefined)
            document.getElementById('modal-desc-textarea').value = tile.description;
    }

    function createElement() {

        var newCenter = window.helper.getCenterView('table');

        var y = window.helper.getLastValueArray(window.tileManager.dimensions.layerPositions) + (window.TILE_DIMENSION.height * 2);

        var mesh = new THREE.Mesh(
                   new THREE.PlaneBufferGeometry(tileWidth, tileHeight),
                   new THREE.MeshBasicMaterial({
                            side: THREE.DoubleSide,
                            transparent : true,
                            map : null
                        })
                );

        var target = window.helper.fillTarget(newCenter.x, y, newCenter.z, 'table');

        mesh.position.copy(target.hide.position);

        mesh.rotation.copy(target.hide.rotation);

        mesh.renderOrder = 1;

        window.scene.add(mesh);

        window.fieldsEdit.objects.tile.mesh = mesh;

        window.fieldsEdit.objects.tile.target = target;
    }

    function drawTile(id, callback){

        if(window.fieldsEdit.objects.tile.mesh === null)
            createElement();

        var mesh = window.fieldsEdit.objects.tile.mesh;
        
        var exit = null;

        if(window.fieldsEdit.actions.type === "insert") {

            exit = function(){
                window.camera.resetPosition();
            };

            window.fieldsEdit.actions.exit = exit;

            animate(mesh, window.fieldsEdit.objects.tile.target.show, 1000, function(){ 

                window.camera.setFocus(mesh, new THREE.Vector4(0, 0, tileWidth, 1), 2000);

                if(typeof(callback) === 'function')
                    callback(); 
                
                self.changeTexture();

                window.camera.disable(); 

                window.helper.showBackButton();

            });
        }
        else{

            exit = function(){
                window.camera.resetPosition();
            };

            window.fieldsEdit.actions.exit = exit;

            self.changeTexture();

            animate(mesh, window.fieldsEdit.objects.tile.target.show, 1000, function(){ 

                window.camera.setFocus(mesh, new THREE.Vector4(0, 0, tileWidth, 1), 1500);

                window.tileManager.transform(false, 1000);
                window.signLayer.transformSignLayer();

                setTimeout( function() {
                    var data = helper.getSpecificTile(id);
                    animate(data.mesh, data.target.hide, 1000);
                }, 2000 );

            });

        }
    } 

    this.changeTexture = function(){

        var table = null,
            scale = 5,
            mesh = null;

        table = fillTable();

        mesh = window.fieldsEdit.objects.tile.mesh;

        mesh.material.map = window.tileManager.createTexture(null, 'high', tileWidth, tileHeight, scale, table); 
        mesh.material.needsUpdate = true; 

    };

    this.deleteMesh = function(){

        var mesh = window.fieldsEdit.objects.tile.mesh;

        if(mesh != null){ 

            animate(mesh, window.fieldsEdit.objects.tile.target.hide, 1500, function(){ 
                    window.scene.remove(mesh);
                });

            window.fieldsEdit.objects.tile.mesh = null;
        }
    };
    // end

    //Save Tile
    this.saveTile = function(){

        if(validateFields() === ''){ 

            var table = fillTable();

            window.fieldsEdit.disabledButtonSave(true);
            
            if(window.fieldsEdit.actions.type === "insert")
                createTile(table);
            else if(window.fieldsEdit.actions.type === "update")
                modifyTile(table);
        }
        else{
             window.alert(validateFields());
        }
    };

    function validateFields(){
        var msj = '';

        var name = document.getElementById('imput-Name');

        if(name.value === ""){
            msj += 'The component must have a name \n';
            name.focus();
        }

        return msj;
    }
    // end

    //tile action
    function createTile(_table){

        var params = getParamsData(_table);  

        window.API.postRoutesEdit('tableEdit', 'insert', params, null,
            function(res){ 

                _table.id = res._id;

                postParamsDev(_table, function(table){

                    window.camera.loseFocus();
                    window.camera.enable();
                        
                    var x, y, z;

                    var platform = table.platform || window.layers[table.layer].super_layer,
                        layer = table.layer,
                        object = { 
                            mesh : null,
                            data : {},
                            target : {},
                            id : null
                        };

                    if(typeof window.TABLE[platform].layers[layer] === 'undefined'){ 
                        window.TABLE[platform].layers[layer] = {   
                            objects : [],
                            y : y 
                        };
                    }

                    var count = window.TABLE[platform].layers[layer].objects.length;

                    object.id = platform + '_' + layer + '_' + count;

                    var mesh = window.tileManager.createElement(object.id, table);

                    var lastObject = helper.getLastValueArray(window.TABLE[platform].layers[layer].objects);

                    x = 0;

                    if(!lastObject)
                        x = window.TABLE[platform].x;
                    else
                        x = lastObject.target.show.position.x + window.TILE_DIMENSION.width;

                    var index = window.layers[layer].index;

                    y = window.tileManager.dimensions.layerPositions[index];

                    z = 0;

                    var target = helper.fillTarget(x, y, z, 'table');

                    mesh.position.copy(target.hide.position);
                    mesh.rotation.copy(target.hide.rotation);

                    window.scene.add(mesh);

                    object.mesh = mesh;
                    object.data = table;
                    object.target = target;

                    window.camera.move(target.show.position.x, target.show.position.y, target.show.position.z + 8000, 4000);

                    animate(mesh, target.show, 4500, function(){

                       window.screenshotsAndroid.hidePositionScreenshots(platform, layer); 
                       window.tileManager.updateElementsByGroup();
                    });
                            
                    window.TABLE[platform].layers[layer].objects.push(object);

                });
            },
            function(){
                window.alert('There is already a component with that name in this group and layer, please use another one');
                window.fieldsEdit.disabledButtonSave(false);
            });

        function getParamsData(table){

            var param = { };

            var newLayer = table.layer,
                newGroup = table.platform || window.layers[table.layer].super_layer;

            if(typeof window.platforms[newGroup] !== "undefined"){
                param.platfrm_id = window.platforms[newGroup]._id;
                param.suprlay_id = null;
            }
            else{
                param.suprlay_id = window.superLayers[newGroup]._id;
                param.platfrm_id = null;
            }
            
            param.layer_id = window.layers[newLayer]._id;
            
            param.name = table.name;

            param.type = table.type.toLowerCase();

            param.difficulty = parseInt(table.difficulty);

            param.code_level = table.code_level.toLowerCase();

            param.scrnshts = false;

            if(table.repo_dir){
                param.found = true;
                param.repo_dir = table.repo_dir;
            }
            else{
                param.found = false;
                param.repo_dir = "root";
            }

            if(table.description)
                param.description = table.description;
            else
                param.description = "pending";

            return param;
        }

        function postParamsDev(table, callback){

            var devs = table.devs;

            var newDevs = [];

            postDevs(devs);

            function postDevs(devs){

                if(devs.length > 0){ 

                    var dataPost = {
                                comp_id : table.id
                            };

                    var param = {};

                    param.dev_id = devs[0].dev._id;
                    param.percnt = devs[0].percnt;
                    param.role = devs[0].role;
                    param.scope = devs[0].scope;

                    window.API.postRoutesEdit('tableEdit', 'insert dev', param, dataPost,
                        function(res){

                            devs[0]._id = res._id;

                            newDevs.push(devs[0]);
                            
                            devs.splice(0,1);

                            postDevs(devs);

                        });
                }
                else{

                    table.devs = newDevs;

                    callback(table);
                }
            }
        }
    }

    function modifyTile(_table){ 

        var params = getParamsData(_table);

        var dataPost = {
                comp_id : window.fieldsEdit.actualTile.id
            };

        window.API.postRoutesEdit('tableEdit', 'update', params, dataPost,
            function(res){ 

                _table.id = window.fieldsEdit.actualTile.id;

                postParamsDev(_table, function(table){

                    var oldTile = window.helper.clone(window.fieldsEdit.actualTile),
                        newLayer = table.layer,
                        newGroup = table.platform || window.layers[table.layer].super_layer,
                        oldLayer = oldTile.layer,
                        oldGroup = oldTile.platform || window.layers[oldTile.layer].super_layer;
                        

                    window.camera.loseFocus();
                    window.camera.enable();

                    var arrayObject = window.TABLE[oldGroup].layers[oldLayer].objects.slice(0);

                    for(var i = 0; i < arrayObject.length; i++){
                        
                        if(arrayObject[i].data.author === oldTile.author && arrayObject[i].data.name === oldTile.name){

                            window.scene.remove(arrayObject[i].mesh);
                            
                        }
                    }

                    var positionCameraX = window.TABLE[oldGroup].x,
                        positionCameraY = helper.getPositionYLayer(oldLayer);

                    window.camera.move(positionCameraX, positionCameraY, 8000, 2000);

                    setTimeout( function() {

                        if(newGroup !== oldGroup || newLayer !== oldLayer)
                            change();
                        else
                            notChange();

                    }, 2000 );

                    function change(){

                        window.TABLE[oldGroup].layers[oldLayer].objects = [];
                        var idScreenshot = oldGroup + "_" + oldLayer + "_" + oldTile.name;

                        window.screenshotsAndroid.deleteScreenshots(idScreenshot);
               
                        for(var i = 0; i < arrayObject.length; i++){
                            
                            if(arrayObject[i].data.author === oldTile.author && arrayObject[i].data.name === oldTile.name){

                                arrayObject.splice(i,1);
                            }
                        }

                        window.TABLE[oldGroup].layers[oldLayer].objects = modifyRowTable(arrayObject, oldGroup, oldLayer);

                        setTimeout( function() { 

                            positionCameraX = window.TABLE[newGroup].x;
                            positionCameraY = window.helper.getPositionYLayer(newLayer);
                            camera.move(positionCameraX, positionCameraY,8000, 2000);
                            createNewElementTile(table);
                            window.screenshotsAndroid.hidePositionScreenshots(newGroup, newLayer);
                            window.tileManager.updateElementsByGroup();

                        }, 2000 );

                    }

                    function notChange(){

                        var arrayObject = window.TABLE[oldGroup].layers[oldLayer].objects;
                        var target = null;
                        var _ID = null;
                        var id = 0;

                        var idScreenshot = oldGroup + "_" + oldLayer + "_" + oldTile.name;

                        if(oldTile.name !== table.name)
                            window.screenshotsAndroid.deleteScreenshots(idScreenshot);

                        for(var i = 0; i < arrayObject.length; i++){
                            
                            if(arrayObject[i].data.author === oldTile.author && arrayObject[i].data.name === oldTile.name){

                                id = i;
                                window.TABLE[oldGroup].layers[oldLayer].objects[i].data = table;
                                target = window.TABLE[oldGroup].layers[oldLayer].objects[i].target;
                                _ID = window.TABLE[oldGroup].layers[oldLayer].objects[i].id;
                            }
                        }

                        var mesh = window.tileManager.createElement(_ID, table);

                        window.TABLE[oldGroup].layers[oldLayer].objects[id].mesh = mesh;

                        window.scene.add(mesh);
                        
                        animate(mesh, target.show, 2000,function(){
                            window.screenshotsAndroid.hidePositionScreenshots(oldGroup, oldLayer); 
                        });

                    }

                });

        },
        function(){
            window.alert('There is already a component with that name in this group and layer, please use another one');
            
            window.fieldsEdit.disabledButtonSave(false);
        });

        function getParamsData(table){

            var param = {};

            var newLayer = table.layer,
                newGroup = table.platform || window.layers[table.layer].super_layer,
                oldLayer = window.fieldsEdit.actualTile.layer,
                oldGroup = window.fieldsEdit.actualTile.platform || window.layers[window.fieldsEdit.actualTile.layer].super_layer;

            if(typeof window.platforms[newGroup] !== "undefined"){ 
                param.platfrm_id = window.platforms[newGroup]._id;
                param.suprlay_id = null;
            }
            else{
                param.suprlay_id = window.superLayers[newGroup]._id;
                param.platfrm_id = null;
            }

            if(newLayer !== oldLayer)
                param.layer_id = window.layers[newLayer]._id;
            
            if(table.name !== window.fieldsEdit.actualTile.name)
                param.name = table.name;

            if(table.type !== window.fieldsEdit.actualTile.type)
                param.type = table.type.toLowerCase();

            if(table.difficulty !== window.fieldsEdit.actualTile.difficulty)
                param.difficulty = parseInt(table.difficulty);

            if(table.code_level !== window.fieldsEdit.actualTile.code_level)
                param.code_level = table.code_level.toLowerCase();

            if(table.description !== window.fieldsEdit.actualTile.description)
                param.description = table.description;

            if(table.repo_dir.toLowerCase() !== window.fieldsEdit.actualTile.repo_dir.toLowerCase()) 
                param.repo_dir = table.repo_dir;
            
            param.found = true;

            return param;
        }

        function postParamsDev(table, callback){

            var newDevs = table.devs.slice(0),
                oldDevs = window.fieldsEdit.actualTile.devs.slice(0),
                newTableDevs = [],
                config = { 
                        insert :{
                            devs : [],
                            route : 'insert dev'
                        },
                        update : {
                            devs : [],
                            route : 'update dev'
                        },
                        delete :{
                            devs : [],
                            route : 'delete dev'
                        }
                    };

            fillDevs(newDevs, oldDevs, 'insert');

            postDevs('delete',config.delete.devs.slice(0), function(){

                postDevs('update',config.update.devs.slice(0), function(){

                    postDevs('insert',config.insert.devs.slice(0), function(){

                        table.devs = newTableDevs;
                        
                        callback(table);
                    });
                });
            });

            function fillDevs(newDevs, oldDevs, task){
                
                function find_Dev(_index) {
                    if(_index._id === oldDevs[f]._id)
                        return _index;            
                }

                if(newDevs.length > 0){

                    if(task === 'insert'){

                        var array = [];

                        for(var i = 0; i < newDevs.length; i++){

                            if(!newDevs[i]._id)
                                config.insert.devs.push(newDevs[i]);
                            else
                                array.push(newDevs[i]);
                        }

                        fillDevs(array, oldDevs, 'update');
                    }
                    else if(task === 'update'){

                        if(oldDevs.length > 0){
                            

                            for(var f = 0; f < oldDevs.length; f++){

                                var t = newDevs.find(find_Dev);
                                
                                if(t){

                                    if(t.role!= oldDevs[f].role ||
                                       t.scope != oldDevs[f].scope ||
                                       t.percnt.toString() != oldDevs[f].percnt.toString()){
                                        
                                        config.update.devs.push(t);                                      
                                    }
                                    else{
                                        newTableDevs.push(oldDevs[f]);
                                    }
                                }
                                else{

                                    config.delete.devs.push(oldDevs[f]);                                  
                                }
                            }
                        }
                    }
                }
                else{

                    for(var l = 0; l < oldDevs.length; l++){
                        config.delete.devs.push(oldDevs[l]);
                    }
                }
            }

            function postDevs(task, array, callback){

                if(array.length > 0){

                    var dataPost = {
                                comp_id : table.id
                            };

                    var param = {};

                    if(task === 'update' || task === 'delete')
                        dataPost.devs_id = array[0]._id;

                    param.dev_id = array[0].dev._id;
                    param.percnt = array[0].percnt;
                    param.role = array[0].role;

                    if(param.role !== 'maintainer')
                        param.scope = array[0].scope;
                    else
                        param.scope = 'default';

                    window.API.postRoutesEdit('tableEdit', config[task].route, param, dataPost,
                        function(res){

                            if(task !== 'delete'){ 

                                array[0]._id = res._id;

                                newTableDevs.push(array[0]);
                            }
                            
                            array.splice(0,1);

                            postDevs(task, array, callback);

                        },
                        function(){
                            window.fieldsEdit.disabledButtonSave(false);
                        });
                
                }
                else{

                    callback();
                }
            }
        
        }
    }

    function deleteTile(id){

        var table = window.helper.getSpecificTile(id).data;

        var dataPost = {
                comp_id : table.id
            };

        window.API.postRoutesEdit('tableEdit', 'delete', false, dataPost,
            function(res){ 

                var oldLayer = table.layer,
                    oldGroup = table.platform || window.layers[table.layer].super_layer,
                    arrayObject = window.TABLE[oldGroup].layers[oldLayer].objects,
                    idScreenshot = oldGroup + "_" + oldLayer + "_" + table.name;

                window.screenshotsAndroid.deleteScreenshots(idScreenshot);

                var positionCameraX = window.TABLE[oldGroup].x,
                    positionCameraY = helper.getPositionYLayer(oldLayer);

                window.camera.loseFocus();
                window.camera.enable();

                window.tileManager.transform(false, 1000);
                window.headers.transformTable(1000);
                window.signLayer.transformSignLayer();

                window.camera.move(positionCameraX, positionCameraY, 8000, 2000);

                setTimeout( function() {

                    window.TABLE[oldGroup].layers[oldLayer].objects = [];
               
                    id = id.split("_");

                    id = parseInt(id[2]);

                    var mesh = arrayObject[id].mesh;

                    var target =  window.helper.fillTarget(0, 0, 160000, 'table');

                    animate(mesh, target.hide, 1500, function(){
                        window.scene.remove(mesh);
                    });

                    arrayObject.splice(id, 1);

                    window.TABLE[oldGroup].layers[oldLayer].objects = modifyRowTable(arrayObject, oldGroup, oldLayer);

                    window.tileManager.updateElementsByGroup();

                }, 3500 );

        });
    }
    //

    //Tools
    function createNewElementTile(table){

        var x, y, z;

        var platform = table.platform || window.layers[table.layer].super_layer,
            layer = table.layer,
            object = { 
                mesh : null,
                data : {},
                target : {},
                id : null
            };

        if(typeof window.TABLE[platform].layers[layer] === 'undefined'){ 
            window.TABLE[platform].layers[layer] = {   
                objects : [],
                y : window.helper.getPositionYLayer(layer)
            };
        }

        var lastObject = helper.getLastValueArray(window.TABLE[platform].layers[layer].objects);

        var count = window.TABLE[platform].layers[layer].objects.length;

        object.id = platform + '_' + layer + '_' + count;

        var mesh = window.tileManager.createElement(object.id, table);
    
        x = 0;

        if(!lastObject)
            x = window.TABLE[platform].x;
        else
            x = lastObject.target.show.position.x + window.TILE_DIMENSION.width;

        y = window.helper.getPositionYLayer(layer);

        z = 0;

        var target = helper.fillTarget(x, y, z, 'table');

        mesh.position.copy(target.hide.position);
        mesh.rotation.set(target.hide.rotation.x, target.hide.rotation.y, target.hide.rotation.z);

        window.scene.add(mesh);

        object.mesh = mesh;
        object.data = table;
        object.target = target;

        animate(mesh, target.show, 2500);
                
        window.TABLE[platform].layers[layer].objects.push(object);
    }

    function validateLock(_id, callback){

        var id = window.helper.getSpecificTile(_id).data.id;

        var dataPost = {
                comp_id : id
            };

        window.API.postValidateLock('tableEdit', dataPost,
            function(res){ 

                if(typeof(callback) === 'function')
                    callback();
            },
            function(res){

                window.alert("This component is currently being modified by someone else, please try again in about 3 minutes");
            }
        );
    }

    function fillTable(){

        var table = {platform : undefined},
            data = {},
            group = document.getElementById(window.fieldsEdit.objects.idFields.group).value,
            layer = document.getElementById(window.fieldsEdit.objects.idFields.layer).value,
            platformID = helper.getCountObject(window.platforms) - 1,
            layerID = 0,
            superLayer = false,
            _author;

        if(window.platforms[group]){
            table.platform = group;
            platformID = window.platforms[group].index;
        }
        else{
            window.superLayer = group;
        }

        if(window.layers[layer])
            window.layerID = layers[layer].index;

        table.layer = layer;
        table.type = document.getElementById(window.fieldsEdit.objects.idFields.type).value;
        table.code_level = document.getElementById(window.fieldsEdit.objects.idFields.state).value;
        table.difficulty = document.getElementById(window.fieldsEdit.objects.idFields.difficulty).value;
        table.name = document.getElementById(window.fieldsEdit.objects.idFields.name).value;
        table.code = helper.getCode(document.getElementById(window.fieldsEdit.objects.idFields.name).value);
        table.description = document.getElementById("modal-desc-textarea").value;
        table.found = true;
        table.platformID = platformID;
        table.layerID = layerID;
        table.superLayer = superLayer;

        var dir = group+"/"+table.type.toLowerCase()+"/"+layer.toLowerCase()+"/";

        while(dir.match(' ') !== null) 
           dir = dir.replace(' ', '_');

        dir = dir + "fermat-"+group.toLowerCase()+"-"+table.type.toLowerCase()+"-"+layer.toLowerCase()+"-"+table.name.toLowerCase()+"-bitdubai";
        
        while(dir.match(' ') !== null) 
           dir = dir.replace(' ', '-');

        table.repo_dir = dir;

        var devs = document.getElementById("modal-devs").value;
        
        table.devs = devs.slice(0);

        _author = getBestDev(table.devs, "author");

        table.picture = _author.avatar_url ? _author.avatar_url : undefined;
        table.author = _author.usrnm ? _author.usrnm : undefined;
        table.authorRealName = _author.name ? _author.name : undefined;
        table.authorEmail = _author.email ? _author.email : undefined;

        var _maintainer = getBestDev(table.devs, "maintainer");

        table.maintainer = _maintainer.usrnm ? _maintainer.usrnm : undefined;
        table.maintainerPicture = _maintainer.avatar_url ? _maintainer.avatar_url : undefined;
        table.maintainerRealName = _maintainer.name ? _maintainer.name : undefined;
        
        return table;
    }

    function modifyRowTable(arrayObject, oldGroup, oldLayer){

        var newArrayObject = [];

        for(var t = 0; t < arrayObject.length; t++){

            var data = arrayObject[t].data,
                mesh = arrayObject[t].mesh,
                target = null,
                object = { 
                    mesh : null,
                    data : {},
                    target : {},
                    id : null
                };
                
            var x = 0, y = 0, z = 0;

            var lastObject = helper.getLastValueArray(newArrayObject);

            var count = newArrayObject.length;

            object.id = oldGroup + '_' + oldLayer + '_' + count;

            for(var i = 0; i < mesh.levels.length; i++)
                mesh.levels[i].object.userData.id = object.id;

            x = 0;

            if(!lastObject)
                x = window.TABLE[oldGroup].x;
            else
                x = lastObject.target.show.position.x + window.TILE_DIMENSION.width;

            y = window.helper.getPositionYLayer(oldLayer);

            z = 0;

            var idScreenshots = oldGroup + "_" + oldLayer + "_" + data.name;

            window.screenshotsAndroid.changePositionScreenshots(idScreenshots, x, y);
            
            target = window.helper.fillTarget(x, y, z, 'table');

            object.mesh = mesh;
            object.data = data;
            object.target = target;

            animate(object.mesh, target.show, 1500);

            newArrayObject.push(object);
        }

        return newArrayObject;
    }

    function getBestDev(_devs, role) {
        
        var dev = {};
        if (_devs) {
            var _dev = {};
            dev.percnt = 0;
            for (var i = 0, l = _devs.length; i < l; i++) {
                _dev = _devs[i];
                
                if((role === 'author' && _dev.role === 'author' && _dev.scope === 'implementation') ||
                   (role === 'maintainer' && _dev.role === 'maintainer')) {
                
                    if (_dev.percnt >= dev.percnt) {
                        
                        dev.percnt = _dev.percnt;
                        dev.usrnm = _dev.dev.usrnm;
                        dev.name = _dev.dev.name;
                        dev.email = _dev.dev.email;
                        dev.avatar_url = _dev.dev.avatar_url;
                    }
                }
            }
        }
        return dev;
    }

    function animate(mesh, target, duration, callback){

        var _duration = duration || 2000,
            x = target.position.x,
            y = target.position.y,
            z = target.position.z,
            rx = target.rotation.x,
            ry = target.rotation.y,
            rz = target.rotation.z; 

        _duration = Math.random() * _duration + _duration;

        new TWEEN.Tween(mesh.position)
            .to({x : x, y : y, z : z}, _duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        new TWEEN.Tween(mesh.rotation)
            .to({x: rx, y: ry, z: rz}, _duration + 500)
            .easing(TWEEN.Easing.Exponential.InOut)
            .onComplete(function () {
                    if(typeof(callback) === 'function')
                        callback();   
                })
            .start();
    }
    
}
/**
 * Controls how tiles behaves
 */
function TileManager() {

    var MAX_TILE_DETAIL_SCALE = 5;
    if (window.location.hash === '#low') {
        MAX_TILE_DETAIL_SCALE = 2;
    }

    this.dimensions = {};
    this.elementsByGroup = [];
    this.levels = {
        'high': 1000,
        'medium': 2500,
        'small': 5000,
        'mini': 10000
    };

    var jsonTile = {};
    var self = this;
    var groupsQtty;
    var _firstLayer;
    var layersQtty;
    var section = [];
    var columnWidth = 0;
    var layerPosition = [];
    var superLayerMaxHeight = 0;
    var superLayerPosition = [];
    var qualities = {};

    var onClick = function(target) {
        if(window.actualView === 'table')
            window.onElementClick(target.userData.id);
    };

    this.JsonTile = function(callback){
        $.get("json/config_tile.json", {}, function(json) {
            jsonTile = json;
            qualities = jsonTile.qualities;
            callback();
        });
    };

    /**
     * Pre-computes the space layout for next draw
     */
    this.preComputeLayout = function () {

        var SUPER_LAYER_SEPARATION = 3;

        var section_size = [],
            superLayerHeight = 0,
            isSuperLayer = [],
            i, actualSuperLayerName = '';

        //Initialize
        for (var key in layers) {
            if (key == "size") continue;

            var id = layers[key].index;

            if(layers[key].super_layer !== actualSuperLayerName) {
                superLayerHeight = 0;
                actualSuperLayerName = layers[key].super_layer;
            }

            if (layers[key].super_layer) {

                section[id] = 0;
                section_size[id] = 0;
                superLayerHeight++;

                if (superLayerMaxHeight < superLayerHeight) superLayerMaxHeight = superLayerHeight;
            }
            else {

                var newLayer = [];

                for (i = 0; i < groupsQtty; i++)
                    newLayer.push(0);

                section_size[id] = newLayer;
                section[id] = newLayer.slice(0); //Use a copy
            }

            isSuperLayer.push(false);
        }

        for (var j = 0; j <= groupsQtty; j++) {

            self.elementsByGroup.push([]);
        }

        //Set sections sizes

        for(var platfrm in window.TABLE){

            for (var layer in window.TABLE[platfrm].layers){

                for(i = 0; i < window.TABLE[platfrm].layers[layer].objects.length; i++){

                    var tile = window.TABLE[platfrm].layers[layer].objects[i];

                    var r = tile.data.layerID;

                    var c = tile.data.platformID;
                    var idT = tile.id;


                    self.elementsByGroup[c].push(idT);

                    if (layers[tile.data.layer].super_layer) {

                        section_size[r]++;
                        isSuperLayer[r] = layers[tile.data.layer].super_layer;
                    } else {

                        section_size[r][c]++;
                        if (section_size[r][c] > columnWidth) columnWidth = section_size[r][c];
                    }

                }
            }
        }

        //Set row height

        var actualHeight = 0;
        var remainingSpace = superLayerMaxHeight;
        var inSuperLayer = false;
        var actualSuperLayer = -1;

        actualSuperLayerName = false;

        for (i = 0; i < layersQtty; i++) {

            if(isSuperLayer[i] !== actualSuperLayerName) {

                actualHeight += remainingSpace + 1;
                remainingSpace = superLayerMaxHeight;

                if(isSuperLayer[i]) {
                    actualSuperLayer++;
                    inSuperLayer = false;
                }

                actualSuperLayerName = isSuperLayer[i];
            }

            if (isSuperLayer[i]) {

                if (!inSuperLayer) {
                    actualHeight += SUPER_LAYER_SEPARATION;

                    if (superLayerPosition[actualSuperLayer] === undefined) {
                        superLayerPosition[actualSuperLayer] = actualHeight;
                    }
                }

                inSuperLayer = true;
                actualHeight++;
                remainingSpace--;
            } else {

                if (inSuperLayer) {

                    actualHeight += remainingSpace + 1;
                    remainingSpace = superLayerMaxHeight;
                }

                inSuperLayer = false;
                actualHeight++;
            }

            if(actualHeight == 6)   //Separates GUI section
                actualHeight += 2;

            layerPosition[i] = actualHeight;
        }
    };

    this.fillTable = function (list) {
        var _suprlays = list.suprlays,
            _platfrms = list.platfrms,
            _layers = list.layers,
            _comps = list.comps,
            i, l, code, name;

        for (i = 0, l = _suprlays.length; i < l; i++) {
            code = _suprlays[i].code;
            window.superLayers[code] = {};
            window.superLayers[code].name = _suprlays[i].name;
            window.superLayers[code].index = _suprlays[i].order;
            window.superLayers[code]._id = _suprlays[i]._id;
            window.superLayers[code].dependsOn = _suprlays[i].deps;
            window.TABLE[code] = {
                layers : {},
                ID: _suprlays[i]._id,
                isSlayer: code
            };
        }

        for (i = 0, l = _platfrms.length; i < l; i++) {
            code = _platfrms[i].code;
            window.platforms[code] = {};
            window.platforms[code].index = _platfrms[i].order;
            window.platforms[code].dependsOn = _platfrms[i].deps;
            window.platforms[code]._id = _platfrms[i]._id;
            window.TABLE[code] = {
                layers : {},
                ID: _platfrms[i]._id,
                isSlayer: false
            };
        }

        for (i = 0, l = _layers.length; i < l; i++) {
            name = helper.capFirstLetter(_layers[i].name);
            window.layers[name] = {};
            //TODO: Temp fix of the server
            window.layers[name].super_layer = (_layers[i].suprlay !== "false") ? _layers[i].suprlay : false;
            window.layers[name].index = _layers[i].order;
            window.layers[name]._id = _layers[i]._id;
        }

        var buildElement = function (e) {

            var _comp = _comps[e];

            var _platfrm = getSPL(_comp._platfrm_id, _platfrms);
            var _layer = getSPL(_comp._layer_id, _layers);

            var layerID = _layer.order;
            layerID = (layerID === undefined) ? layers.size() : layerID;

            var platformID = _platfrm ? _platfrm.order : undefined;
            platformID = (platformID === undefined) ? window.platforms.size() : platformID;

            var _author = getBestDev(_comp.devs, "author");
            var _maintainer = getBestDev(_comp.devs, "maintainer");

            _layer = helper.capFirstLetter(_layer.name);

            var element = {
            	id: _comp._id,
                platform: _platfrm ? _platfrm.code : undefined,
                platformID: platformID,
                superLayer : layers[_layer].super_layer,
                code: helper.getCode(_comp.name),
                name: helper.capFirstLetter(_comp.name),
                layer: _layer,
                layerID: layerID,
                type: helper.capFirstLetter(_comp.type),
                picture: _author.avatar_url ? _author.avatar_url : undefined,
                author: _author.usrnm ? _author.usrnm : undefined,
                authorRealName: _author.name ? _author.name : undefined,
                authorEmail: _author.email ? _author.email : undefined,
                maintainer : _maintainer.usrnm ? _maintainer.usrnm : undefined,
                maintainerPicture : _maintainer.avatar_url ? _maintainer.avatar_url : undefined,
                maintainerRealName : _maintainer.name ? _maintainer.name : undefined,
                difficulty: _comp.difficulty,
                code_level: _comp.code_level ? _comp.code_level : undefined,
                life_cycle: _comp.life_cycle,
                found: _comp.found,
                devs: _comp.devs,
                repo_dir: _comp.repo_dir,
                description: _comp.description
            };
            return element;
        };

        for (i = 0, l = _comps.length; i < l; i++) {

            var element = buildElement(i);

            //An element is always inside a platform or a superlayer
            //TODO: Temp fix of the server
            var group = element.platform || ((element.superLayer !== "false") ? element.superLayer : false),
                layer = element.layer;

            if(typeof window.TABLE[group] === 'undefined'){
                window.TABLE[group] = {
                    layers : {},
                    ID: element.platformID,
                    isSlayer: element.superLayer
                };
            }

            if(typeof window.TABLE[group].layers[layer] === 'undefined'){
                window.TABLE[group].layers[layer] = {
                    objects : [],
                    y : 0,
                    ID: element.layerID
                };
            }

            var lastObject = window.TABLE[group].layers[layer].objects.length;
            var count = lastObject;


            var objectTile = {
                mesh : null,
                data : element,
                target : {},
                id: group + '_' + layer + '_' + count
            };


            window.tilesQtty.push(objectTile.id);

            window.TABLE[group].layers[layer].objects.push(objectTile);

        }

        groupsQtty = _platfrms.length;
        layersQtty = list.layers.length;
        _firstLayer = _layers[0].order;
    };

    /**
     * Creates the tile texture
     * @param   {Number} id         ID in the table
     * @param   {String} quality    The quality of the picture as folder in the images dir
     * @param   {Number} tileWidth  Width of the tile
     * @param   {Number} tileHeight Height of the tile
     * @param   {Number} scale      Scale of the pictures, the bigger, the better but heavier
     * @returns {Object} The drawn texture
     */
    this.createTexture = function (id, quality, tileWidth, tileHeight, scale, _table) {

        var tile = _table || window.helper.getSpecificTile(id).data;

        var state = tile.code_level,
            difficulty = Math.ceil(tile.difficulty / 2),
            group = tile.platform || window.layers[tile.layer].super_layer,
            type = tile.type,
            picture = tile.picture,
            base = 'images/tiles/';

        var canvas = document.createElement('canvas');
        canvas.width = tileWidth * scale;
        canvas.height = tileHeight * scale;

        var middle = canvas.width / 2;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = 'center';

        var texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.LinearFilter;

        var pic = {
                src: picture || base + 'buster.png'
            },
            portrait = {
                src: base + 'portrait/' + quality + '/' + state + '.png',
                x: jsonTile.global.portrait.x,
                y: jsonTile.global.portrait.y,
                w: jsonTile.global.portrait.w * tileWidth * scale,
                h: jsonTile.global.portrait.h * tileHeight * scale,
                skip: qualities[(jsonTile.global.portrait.minQuality || 'mini')] > qualities[quality]
            },
            groupIcon = {
                src: base + 'icons/group/' + quality + '/icon_' + group + '.png',
                w: jsonTile.global.groupIcon.w * scale,
                h: jsonTile.global.groupIcon.h * scale,
                skip: qualities[(jsonTile.global.groupIcon.minQuality || 'mini')] > qualities[quality]
            },
            typeIcon = {
                src: base + 'icons/type/' + quality + '/' + type.toLowerCase() + '_logo.png',
                w: jsonTile.global.typeIcon.w * scale,
                h: jsonTile.global.typeIcon.h * scale,
                skip: qualities[(jsonTile.global.typeIcon.minQuality || 'mini')] > qualities[quality]
            },
            ring = {
                src: base + 'rings/' + quality + '/' + state + '_diff_' + difficulty + '.png',
                skip: qualities[(jsonTile.global.ring.minQuality || 'mini')] > qualities[quality]
            },
            codeText = {
                text: tile.code,
                font: (jsonTile.global.codeText.font * scale) + "px Arial",
                skip: qualities[(jsonTile.global.codeText.minQuality || 'mini')] > qualities[quality]
            },
            nameText = {
                text: tile.name,
                font: (jsonTile.global.nameText.font * scale) + 'px Arial',
                skip: qualities[(jsonTile.global.nameText.minQuality || 'mini')] > qualities[quality]
            },
            layerText = {
                text: tile.layer,
                font: (jsonTile.global.layerText.font * scale) + 'px Arial',
                skip: qualities[(jsonTile.global.layerText.minQuality || 'mini')] > qualities[quality]
            },
            authorText = {
                text: tile.authorRealName || tile.author || '',
                font: (jsonTile.global.authorText.font * scale) + 'px Arial',
                skip: qualities[(jsonTile.global.authorText.minQuality || 'mini')] > qualities[quality]
            },
            picMaintainer = {
                src: tile.maintainerPicture || base + 'buster.png',
                skip: qualities[(jsonTile.concept.picMaintainer.minQuality || 'mini')] > qualities[quality]
            },
            maintainer = {
                text: 'Maintainer',
                font: (jsonTile.global.maintainer.font * scale) + 'px Arial',
                color: "#FFFFFF",
                skip: qualities[(jsonTile.global.maintainer.minQuality || 'mini')] > qualities[quality]
            },
            nameMaintainer = {
                text: tile.maintainerRealName || tile.maintainer || '',
                font: (jsonTile.global.nameMaintainer.font * scale) + 'px Arial',
                color: "#FFFFFF",
                skip: qualities[(jsonTile.global.nameMaintainer.minQuality || 'mini')] > qualities[quality]
            },
            userMaintainer = {
                text: tile.maintainer || 'No Maintainer yet',
                font: (jsonTile.global.userMaintainer.font * scale) + 'px Arial',
                color: "#E2E2E2",
                skip: qualities[(jsonTile.concept.userMaintainer.minQuality || 'mini')] > qualities[quality]
            };

            pic.x = jsonTile[state].pic.x * scale;
            pic.y = jsonTile[state].pic.y * scale;
            pic.w = jsonTile[state].pic.w * scale;
            pic.h = jsonTile[state].pic.h * scale;

            groupIcon.x = jsonTile[state].groupIcon.x * scale;
            groupIcon.y = jsonTile[state].groupIcon.y * scale;

            typeIcon.x = jsonTile[state].typeIcon.x * scale;
            typeIcon.y = jsonTile[state].typeIcon.y * scale;

            ring.x = jsonTile[state].ring.x * scale;
            ring.y = jsonTile[state].ring.y * scale;
            ring.w = jsonTile[state].ring.w * scale;
            ring.h = jsonTile[state].ring.h * scale;

            codeText.x = middle;
            codeText.y = jsonTile[state].codeText.y * scale;

            nameText.x = middle;
            nameText.y = jsonTile[state].nameText.y * scale;
            nameText.font = (jsonTile[state].nameText.font * scale) + 'px Arial';

            layerText.x = middle;
            layerText.y = jsonTile[state].layerText.y * scale;

            authorText.x = middle;
            authorText.y = jsonTile[state].authorText.y * scale;

            picMaintainer.x = jsonTile[state].picMaintainer.x * scale;
            picMaintainer.y = jsonTile[state].picMaintainer.y * scale;
            picMaintainer.w = jsonTile[state].picMaintainer.w * scale;
            picMaintainer.h = jsonTile[state].picMaintainer.h * scale;

            maintainer.x = jsonTile[state].maintainer.x * scale;
            maintainer.y = jsonTile[state].maintainer.y * scale;

            nameMaintainer.x = jsonTile[state].nameMaintainer.x * scale;
            nameMaintainer.y = jsonTile[state].nameMaintainer.y * scale;

            userMaintainer.x = jsonTile[state].userMaintainer.x * scale;
            userMaintainer.y = jsonTile[state].userMaintainer.y * scale;

            if(typeof jsonTile[state].layerText.color  !== 'undefined')
                layerText.color = jsonTile[state].layerText.color;

            if(typeof jsonTile[state].nameText.color  !== 'undefined')
                nameText.color = jsonTile[state].nameText.color;

            if(state === "production"){
                codeText.x = jsonTile[state].codeText.x * scale;
                layerText.x = jsonTile[state].layerText.x * scale;
                authorText.x = jsonTile[state].authorText.x * scale;

                nameText.x = jsonTile[state].nameText.x * scale;
                nameText.constraint = jsonTile[state].nameText.constraint * scale;
                nameText.lineHeight = jsonTile[state].nameText.lineHeight * scale;
                nameText.wrap = true;
            }

        if (state == "concept" || state == "production")
            ring.src = base + 'rings/' + quality + '/linear_diff_' + difficulty + '.png';

        if (difficulty === 0)
            ring = {};

        var data = [
            pic,
            picMaintainer,
            portrait,
            groupIcon,
            typeIcon,
            ring,
            codeText,
            nameText,
            layerText,
            authorText,
            maintainer,
            nameMaintainer,
            userMaintainer
        ];

        if ( tile.found !== true ) {

            var stamp = {
                src: 'images/alt_not_found.png',
                x: 0,
                y: 0,
                w: tileWidth * scale,
                h: tileHeight * scale
            };

            data.push(stamp);

        }

        drawPicture(data, ctx, texture);

        return texture;
    };

    /**
     * Creates a Tile
     * @param   {Number}     i ID of the tile (index in table)
     * @returns {DOMElement} The drawable element that represents the tile
     */

    this.createElement = function (id, _table) {

        var mesh,
            element = new THREE.LOD(),
            texture,
            tileWidth = window.TILE_DIMENSION.width - window.TILE_SPACING,
            tileHeight = window.TILE_DIMENSION.height - window.TILE_SPACING,
            scale = 2,
            table = _table || null;

        
        for(var level in this.levels) {

            if (level === 'high') scale = MAX_TILE_DETAIL_SCALE;
            else scale = 1;

            texture = self.createTexture(id, level, tileWidth, tileHeight, scale, table);

            mesh = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(tileWidth, tileHeight),
                new THREE.MeshBasicMaterial({
                    side: THREE.DoubleSide,
                    transparent : true,
                    map : texture
                })
            );

            mesh.userData = {
                id: id,
                onClick : onClick
            };
            mesh.renderOrder = 1;
            element.addLevel(mesh, this.levels[level]);
            element.userData = {
                flying: false
            };
        }

        return element;
    };

    /**
     * Converts the table in another form
     * @param {Array}  goal     Member of ViewManager.targets
     * @param {Number} duration Milliseconds of animation
     */
    this.transform = function (ordered, duration) {

        var i, l, j,
            DELAY = 500;

        duration = duration || 2000;
        ordered = ordered || false;

        //TWEEN.removeAll();

        var animate = function(object, target, delay) {

            delay = delay || 0;

             var move = new TWEEN.Tween(object.position)
                        .to({
                            x: target.position.x,
                            y: target.position.y,
                            z: target.position.z
                        }, Math.random() * duration + duration)
                        .easing(TWEEN.Easing.Exponential.InOut)
                        .delay(delay)
                        .onComplete(function() { object.userData.flying = false; });

            var rotation = new TWEEN.Tween(object.rotation)
                            .to({
                                x: target.rotation.x,
                                y: target.rotation.y,
                                z: target.rotation.z
                            }, Math.random() * duration + duration)
                            .delay(delay)
                            .easing(TWEEN.Easing.Exponential.InOut);

            move.onStart(function() { rotation.start(); });

            return move;
        };

        if(ordered === true) {

            for(i = 0; i < self.elementsByGroup.length; i++) {

                var k = (i + self.elementsByGroup.length - 1) % (self.elementsByGroup.length);
                var delay = i * DELAY;

                for(j = 0; j < self.elementsByGroup[k].length; j++) {

                    var index = self.elementsByGroup[k][j];

                    var target = window.helper.getSpecificTile(index);

                    var animation = animate(target.mesh, target.target.show, delay);

                    animation.start();
                }
            }
        }
        else {

            for(var r = 0; r < window.tilesQtty.length; r++){

                var tile = window.helper.getSpecificTile(window.tilesQtty[r]);

                animate(tile.mesh, tile.target.show, 0).start();
            }
        }

        if(window.actualView === 'table') {
            if(!window.headersUp) {
                headers.showHeaders(duration);
                window.headersUp = true;
            }
        }


        new TWEEN.Tween(this)
            .to({}, duration * 2 + self.elementsByGroup * DELAY)
            .onUpdate(render)
            .start();

        setTimeout(window.screenshotsAndroid.show, duration);
    };

    /**
     * Goes back to last target set in last transform
     */
    this.rollBack = function () {

        window.camera.enable();
        window.camera.loseFocus();

        window.helper.show('container', 2000);

        window.workFlowManager.getActualFlow();

        self.transform();

        //window.changeView(self.lastTargets);
    };

    /**
     * Inits and draws the table, also creates the Dimensions object
     */
    this.drawTable = function () {

        this.preComputeLayout();

        var layerCoordinates = [];

        var signRow = null,
            signColumn = null;

        for(var i = 0; i < window.tilesQtty.length; i++){

            var id = window.tilesQtty[i];

            var mesh = this.createElement(id);

            scene.add(mesh);

            window.helper.getSpecificTile(id).mesh = mesh;

            var object = new THREE.Object3D();

            //Row (Y)
            var tile = window.helper.getSpecificTile(id).data;

            var group = tile.platform || window.layers[tile.layer].super_layer;

            var row = tile.layerID;

            if (layers[tile.layer].super_layer) {

                object.position.x = ((section[row]) * window.TILE_DIMENSION.width) - (columnWidth * groupsQtty * window.TILE_DIMENSION.width / 2);

                section[row]++;

            } else {

                //Column (X)
                var column = tile.platformID;

                object.position.x = (((column * (columnWidth) + section[row][column]) + column) * window.TILE_DIMENSION.width) - (columnWidth * groupsQtty * window.TILE_DIMENSION.width / 2);

                section[row][column]++;
            }


            object.position.y = -((layerPosition[row]) * window.TILE_DIMENSION.height) + (layersQtty * window.TILE_DIMENSION.height / 2);

            if(typeof layerCoordinates[row] === 'undefined')
                layerCoordinates[row] = object.position.y;


            /*start Positioning tiles*/

            object.position.copy(window.viewManager.translateToSection('table', object.position));

            if(layers[tile.layer].super_layer){

                if(typeof window.TABLE[layers[tile.layer].super_layer].x === 'undefined')
                    window.TABLE[layers[tile.layer].super_layer].x = object.position.x;

            }

            var target = window.helper.fillTarget(object.position.x, object.position.y, object.position.z, 'table');

            window.helper.getSpecificTile(id).target = target;

            mesh.position.copy(target.hide.position);

            mesh.rotation.set(target.hide.rotation.x, target.hide.rotation.y, target.hide.rotation.z);

            /*End*/
            if(!window.signLayer.findSignLayer(group, tile.layer)){
                if(i === 0 ){ //entra a la primera
                    window.signLayer.createSignLayer(object.position.x, object.position.y, tile.layer, group);
                    signRow = tile.layerID;
                    signColumn = tile.platformID;
                    window.TABLE[group].layers[tile.layer].y = object.position.y;
                }

                if(tile.layerID !== signRow && tile.platformID === signColumn && layers[tile.layer].super_layer === false){ // solo cambio de filas
                    window.signLayer.createSignLayer(object.position.x, object.position.y, tile.layer, group);
                    signRow = tile.layerID;
                    signColumn = tile.platformID;
                    window.TABLE[group].layers[tile.layer].y = object.position.y;
                }

                else if(signColumn !== tile.platformID && layers[tile.layer].super_layer === false){ //cambio de columna
                    window.signLayer.createSignLayer(object.position.x, object.position.y, tile.layer, group);
                    signRow = tile.layerID;
                    signColumn = tile.platformID;
                    window.TABLE[group].layers[tile.layer].y = object.position.y;
                }
            }
        }

        this.dimensions = {
            columnWidth: columnWidth,
            superLayerMaxHeight: superLayerMaxHeight,
            groupsQtty: groupsQtty,
            layersQtty: layersQtty,
            superLayerPosition: superLayerPosition,
            layerPositions : layerCoordinates
        };
    };

    /**
     * Takes away all the tiles except the one with the id
     * @param {Array}  [ids]           The IDs to let alone
     * @param {Number} [duration=2000] Duration of the animation
     */
    this.letAlone = function (ids, duration) {

        var i, _duration = duration || 2000,
            distance = camera.getMaxDistance() * 2,
            out = window.viewManager.translateToSection('table', new THREE.Vector3(0, 0, distance));

        //TWEEN.removeAll();

        var target;

        var animate = function (object, target, dur) {

            new TWEEN.Tween(object.position)
                .to({
                    x: target.x,
                    y: target.y,
                    z: target.z
                }, dur)
                .easing(TWEEN.Easing.Exponential.InOut)
                .onComplete(function () {
                    object.userData.flying = false;
                })
                .start();

        };

        for(i = 0; i < window.tilesQtty.length; i++){

            var tile = window.helper.getSpecificTile(window.tilesQtty[i]);

            if (ids === tile.id) {
                target =  tile.target.show.position;
            }
            else {
                target = out;
                tile.mesh.userData.flying = true;
            }

            animate(tile.mesh, target, Math.random() * _duration + _duration);
        }

        new TWEEN.Tween(this)
            .to({}, _duration * 2)
            .onUpdate(render)
            .start();

        window.screenshotsAndroid.hide();
        window.signLayer.letAloneSignLayer();
    };

    this.updateElementsByGroup = function(){

        self.elementsByGroup = [];

        window.tilesQtty = [];

        var i = 0;

        for (var j = 0; j <= groupsQtty; j++) {

            self.elementsByGroup.push([]);
        }

        for(var platform in window.TABLE){

            for(var layer in window.TABLE[platform].layers){

                for(i = 0; i < window.TABLE[platform].layers[layer].objects.length; i++){

                    var tile = window.TABLE[platform].layers[layer].objects[i];

                    var c = tile.data.platformID;
                    var id = tile.id;

                    window.tilesQtty.push(id);

                    self.elementsByGroup[c].push(id);

                }
            }
        }
    };

    //Private methods

    /**
     * Draws a picture in canvas
     * @param {Array}  data    The options of the picture
     * @param {Object} ctx     Canvas context
     * @param {Object} texture The texture object to update
     */
    function drawPicture(data, ctx, texture) {

        var image = new Image();
        var actual = data.shift();

        if (actual && actual.src && actual.src != 'undefined') {

            image.onload = function () {

                if (!actual.skip) {
                    ctx.drawImage(image, actual.x, actual.y, actual.w, actual.h);
                }
                if (texture)
                    texture.needsUpdate = true;

                if (data.length !== 0) {

                    if (data[0].text)
                        drawText(data, ctx, texture);
                    else
                        drawPicture(data, ctx, texture);
                }
            };

            image.onerror = function () {
                if (data.length !== 0) {
                    if (data[0].text)
                        drawText(data, ctx, texture);
                    else
                        drawPicture(data, ctx, texture);
                }
            };

            image.crossOrigin = "anonymous";
            image.src = actual.src;
        } else {
            if (data.length !== 0) {
                if (data[0].text)
                    drawText(data, ctx, texture);
                else
                    drawPicture(data, ctx, texture);
            }
        }
    }

    /**
     * Draws a texture in canvas
     * @param {Array}  data    Options of the texture
     * @param {Object} ctx     Canvas Context
     * @param {Object} texture Texture to update
     */
    function drawText(data, ctx, texture) {

        var actual = data.shift();

        //TODO: Set Roboto typo

        if (!actual.skip) {
            if (actual.color)
                ctx.fillStyle = actual.color;

            ctx.font = actual.font;

            if (actual.constraint)
                if (actual.wrap)
                    helper.drawText(actual.text, actual.x, actual.y, ctx, actual.constraint, actual.lineHeight);
                else
                    ctx.fillText(actual.text, actual.x, actual.y, actual.constraint);
            else
                ctx.fillText(actual.text, actual.x, actual.y);
        }

        if (texture)
            texture.needsUpdate = true;

        ctx.fillStyle = "#FFFFFF";

        if (data.length !== 0){

          if(data[0].text)
            drawText(data, ctx, texture);
          else
            drawPicture(data, ctx, texture);
        }
    }

    function getSPL(_id, _SPLArray) {
        if (_id) {
            for (var i = 0, l = _SPLArray.length; i < l; i++) {
                if (_SPLArray[i]._id + '' == _id + '') {
                    return _SPLArray[i];
                }
            }
        } else {
            return null;
        }
    }

    /**
     * Gets the best developer in the given role
     * @param   {Array}  _devs The array of developers
     * @param   {string} role  The role to look for
     * @returns {object} The best developer by the given criteria
     */
    function getBestDev(_devs, role) {
        var dev = {};
        if (_devs) {
            var _dev = {};
            dev.percnt = 0;
            for (var i = 0, l = _devs.length; i < l; i++) {
                _dev = _devs[i];

                if((role === 'author' && _dev.role === 'author' && _dev.scope === 'implementation') ||
                   (role === 'maintainer' && _dev.role === 'maintainer')) {

                    if (_dev.percnt >= dev.percnt) {

                        dev.percnt = _dev.percnt;
                        dev.usrnm = _dev.dev.usrnm;
                        dev.name = _dev.dev.name;
                        dev.email = _dev.dev.email;
                        dev.avatar_url = _dev.dev.avatar_url;
                    }
                }
            }
        }
        return dev;
    }
}


/**
 * @class Timeline
 *
 * @param {Array}  tasks     An array of numbers containing all task ids
 * @param {Object} [container] Container of the created timeline
 */
function Timeline(tasks, container) {
    
    // Constants
    var CONCEPT_COLOR = 'rgba(170,170,170,1)',
        DEVEL_COLOR = 'rgba(234,123,97,1)',
        QA_COLOR = 'rgba(194,194,57,1)';
    
    // Public properties
    this.groups = [];
    this.items = [];
    this.container = container;
    
    var id = 0;
    
    for(var i = 0, tl = tasks.length; i < tl; i++) {
        
        var task = window.helper.getSpecificTile(tasks[i]).data;
        
        if(task != null && task.life_cycle != null) {
            
            if(task.life_cycle.length !== 0){

                var schedule = task.life_cycle,
                    tile, wrap,
                    lastTarget = helper.parseDate(schedule[0].reached),
                    lastReached = lastTarget;
                
                var canvas = document.createElement('canvas');
                var oldCanvas = objects[tasks[i]].children[0].material.map.image;
                canvas.width = oldCanvas.width;
                canvas.height = oldCanvas.height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(oldCanvas, 0, 0);
                
                tile = canvas;
                tile.style.position = 'relative';
                tile.style.display = 'inline-block';
                
                this.groups.push({
                    id : i,
                    content : tile
                });
                
                // First status marks the start point, not needed here
                for(var j = 1, sl = schedule.length; j < sl; j++) {
                    
                    var itemColor,
                        end,
                        item;
                        
                    switch(schedule[j-1].name) {
                        case "Concept":
                            itemColor = CONCEPT_COLOR; break;
                        case "Development":
                            itemColor = DEVEL_COLOR; break;
                        case "QA":
                            itemColor = QA_COLOR; break;
                    }
                    
                    
                    // Planned
                    if(schedule[j].target !== '') {
                        
                        end = helper.parseDate(schedule[j].target);
                        
                        item = {
                            id : id++,
                            content : schedule[j-1].name + ' (plan)',
                            start : lastTarget,
                            end : end,
                            group: i,
                            subgroup: 'plan',
                            style: 'background-color:' + itemColor
                        };
                        
                        this.items.push(item);
                        
                        lastTarget = end;
                    }
                    
                    // Real
                    if(schedule[j].reached !== '') {
                        
                        end = helper.parseDate(schedule[j].reached);
                        
                        item = {
                            id : id++,
                            content : schedule[j-1].name + ' (real)',
                            start : lastReached,
                            end : end,
                            group: i,
                            subgroup: 'real',
                            style: 'background-color:' + itemColor
                        };
                        
                        this.items.push(item);
                        
                        lastReached = end;
                    }
                }
            }
        }
    }
}


/**
 * Hides and destroys the timeline
 * @param {Number} [duration=1000] Duration of fading in milliseconds
 */
Timeline.prototype.hide = function(duration) {
    
    var _duration = duration || 1000;
    
    $('#timelineContainer').fadeTo(_duration, 0, function() { $('#timelineContainer').remove(); });
};


/**
 * Shows the timeline in it's given container, if it was null, creates one at the bottom
 * @param {Number} [duration=2000] Duration of fading in milliseconds
 */
Timeline.prototype.show = function(duration) {
    
    var _duration = duration || 2000;
    
    if(this.groups.length !== 0) {
        
        if(this.container == null) {
            this.container = document.createElement('div');
            this.container.id = 'timelineContainer';
            this.container.style.position = 'absolute';
            this.container.style.left = '0px';
            this.container.style.right = '0px';
            this.container.style.bottom = '0px';
            this.container.style.height = '25%';
            this.container.style.overflowY = 'auto';
            this.container.style.borderStyle = 'ridge';
            this.container.style.opacity = 0;
            $('#container').append(this.container);
        }
        
        var timeline = new vis.Timeline(this.container);
        timeline.setOptions({ 
            editable : false,
            minHeight : '100%',
            stack : false,
            align : 'center'
        });
        timeline.setGroups(this.groups);
        timeline.setItems(this.items);
        
        $(this.container).fadeTo(_duration, 1);
    }
};
//global variables
var tilesQtty = [],
    TABLE = {},
    camera,
    scene = new THREE.Scene(),
    renderer,
    actualView,
    stats = null,
    headersUp = false,
    currentRender = "start",
//Class
    tileManager = new TileManager(),
    helper = new Helper(),
    logo = new Logo(),
    signLayer = new SignLayer(),
    developer = new Developer(),
    API = new API(),
    workFlowEdit = null,
    session = null,
    tableEdit = null,
    fieldsEdit = null,
    browserManager = null,
    screenshotsAndroid = null,
    headers = null,
    workFlowManager = null,
    viewManager = null,
    magazine = null,
    networkViewer = null,
    buttonsManager = null,
    guide = null;
//Global constants
var TILE_DIMENSION = {
    width : 231,
    height : 140
},
    TILE_SPACING = 20;

currentRender = createScene(currentRender, currentRender);
session = new Session();
session.init();
guide = new Guide();


$('#login').click(function() {
        window.session.getAuthCode();
});

$('#logout').click(function() {
        window.session.logout();
        document.getElementById("containerLogin").style.display = "none";
});

/**
 * Creates the rendering environment
 */
function createScene(current, option){

    var change = false;
    if(option !== "canvas" && webglAvailable() && window.currentRender !== "webgl") {
        renderer = new THREE.WebGLRenderer({antialias : true, alpha : true}); //Logarithmic depth buffer disabled due to sprite - zbuffer issue
        current = "webgl";
        change = true;
    }
    else {
        if((option === "start" || option === "canvas") && window.currentRender !== "canvas") {
            renderer = new THREE.CanvasRenderer({antialias : true, alpha : true});
            current = "canvas";
            change = true;
        }
    }

    if(change) {

        var light = new THREE.AmbientLight(0xFFFFFF);
        scene.add(light);

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.id = "canvas";
        renderer.setClearColor(0xFFFFFF);
        //renderer.setClearColor(0x313131);//Mode Test.
        document.getElementById('container').appendChild(renderer.domElement);

        camera = new Camera(new THREE.Vector3(0, 0, 90000),
            renderer,
            render);
    }

    if(window.currentRender === "start")
        logo.startFade();
    if(currentRender !== "start") {
        if(change)
            console.log("Switching rendering to",current);
        else if(currentRender !== option)
            console.log("Rendering switch failed");
        else
            console.log("Already rendering with",currentRender);
    }

    return current;
}


function webglAvailable() {
    try {
        var canvas = document.createElement('canvas');

        //Force boolean cast
        return !!(window.WebGLRenderingContext &&
                  (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    }
    catch(e) {
        return false;
    }
}

/**
 * Starts everything after receiving the json from the server
 */
function init() {

    browserManager = new BrowserManager();
    screenshotsAndroid = new ScreenshotsAndroid();
    magazine = new Magazine();
    workFlowManager = new WorkFlowManager();
    buttonsManager = new ButtonsManager();
    fieldsEdit = new FieldsEdit();
    tableEdit = new TableEdit();
    workFlowEdit = new WorkFlowEdit();

    //View Manager
    viewManager = new ViewManager();

    // table
    tileManager.drawTable();

    // ScreenshotsAndroid
    screenshotsAndroid.init();

    // BrowserManager
    browserManager.init();

    var dimensions = tileManager.dimensions;

    // groups icons
    headers = new Headers(dimensions.columnWidth, dimensions.superLayerMaxHeight, dimensions.groupsQtty,
                          dimensions.layersQtty, dimensions.superLayerPosition);

    // uncomment for testing
    //create_stats();

    $('#backButton').click(function() {

        if(viewManager.views[window.actualView])
            viewManager.views[window.actualView].backButton();

    });

    $('#container').click(onClick);

    //Disabled Menu
    //initMenu();

    setTimeout(function() { initPage(); }, 500);

    setTimeout(function (){
        guide.active = true;
        if(actualView === 'home'){
            guide.showHelp();
        }
    }, 15000);

    /*setTimeout(function() {
        var loader = new Loader();
        loader.findThemAll();
    }, 2000);*/

    //TWEEN.removeAll();
}

/**
 * @author Miguel Celedon
 * @lastmodifiedBy Emmanuel Colina
 * @lastmodifiedBy Ricardo Delgado
 * Changes the actual state of the viewer
 * @param {String} name The name of the target state
 */
function goToView(targetView) {

    var newCenter = new THREE.Vector3(0, 0, 0);
    var transition = 5000;

    newCenter = viewManager.translateToSection(targetView, newCenter);
    camera.moving = true;
    camera.move(newCenter.x, newCenter.y, camera.getMaxDistance(), transition, true);
    camera.lockPan();

    setTimeout(function() { camera.moving = false; }, transition);

    if(window.map.views[targetView] != null) {
        if(actualView != targetView){

            if(actualView)
                viewManager.views[actualView].exit();

            viewManager.views[targetView].enter();
        }

        actualView = targetView;
    }
    else
        goToView(window.map.start);
}

/**
 * @author Ricardo Delgado
 * Load the page url.
 */
function initPage() {

    window.Hash.on('^[a-zA-Z]*$', {
        yep: function(path, parts) {

            var view = parts[0];

            if(window.actualView !== undefined && window.actualView !== ""){

                if(view !== undefined && view !== ""  && view !== 'canvas' && view !== 'webgl'){

                    if(window.map.views[view].enabled !== undefined && window.map.views[view].enabled)
                        goToView(view);
                }
                else if(path === 'canvas' || path === 'webgl'){
                    currentRender = createScene(currentRender,path);
                }
            }
            else
                goToView(window.location.hash.slice(1));
        }
    });

}

function initMenu() {

    var button = document.getElementById('table');
    button.addEventListener('click', function(event) {

        changeView();

    }, false);
}


function changeView() {

    window.camera.enable();
    window.camera.loseFocus();

    window.helper.show('container', 2000);

    window.workFlowManager.getActualFlow();

    window.headers.transformTable(1500);

    window.tileManager.transform(1500);

}

/**
 * Triggered when the user clicks a tile
 * @param {Number} id The ID (position on table) of the element
 */
function onElementClick(id) {

    var focus = window.helper.getSpecificTile(id).mesh;

    if(window.camera.getFocus() == null) {

        window.tileManager.letAlone(id, 2000);

        focus.getObjectForDistance(0).visible = true;

        window.headers.hideHeaders(2000);

        window.camera.setFocus(focus, new THREE.Vector4(0, 0, window.TILE_DIMENSION.width - window.TILE_SPACING, 1), 2000);

        window.buttonsManager.removeAllButtons();

        setTimeout(function() {

            window.tileManager.letAlone(id, 1000);

            focus.getObjectForDistance(0).visible = true;

            window.headers.hideHeaders(1000);

            window.camera.setFocus(focus, new THREE.Vector4(0, 0, window.TILE_DIMENSION.width - window.TILE_SPACING, 1), 1000);

            window.helper.showBackButton();

            window.buttonsManager.actionButtons(id, function(){
                showDeveloper(id);
            });

        }, 3000);

        window.camera.disable();
    }

    function showDeveloper(id) {

        var tile = window.helper.getSpecificTile(id).data;

        var section = 0;
        var center = window.helper.getSpecificTile(id).mesh.position;

        developer.getDeveloper();

        var duration = 750,
            l = developer.findDeveloper(tile.author);

        new TWEEN.Tween(l.position)
        .to({
            x : center.x-290,
            y : center.y+400,
            z : center.z
        }, Math.random() * duration + duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();

        for(var i = 0; i < window.tilesQtty.length; i++){

            var _tile = window.helper.getSpecificTile(window.tilesQtty[i]).data;

            var mesh =  window.helper.getSpecificTile(window.tilesQtty[i]).mesh;

            if(_tile.author == tile.author) {

                new TWEEN.Tween(mesh.position)
                .to({x : center.x + (section % 5) * window.TILE_DIMENSION.width - 750, y : center.y - Math.floor(section / 5) * window.TILE_DIMENSION.height, z : 0}, 2000)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();

                section += 1;
            }
        }

        camera.enable();
        camera.move(center.x-300, center.y, center.z + window.TILE_DIMENSION.width * 11);
    }

}

/**
 * Generic event when user clicks in 3D space
 * @param {Object} e Event data
 */

function onClick(e) {

    var mouse = new THREE.Vector2(0, 0),
        clicked = [];

    if(!camera.dragging) {

        //Obtain normalized click location (-1...1)
        mouse.x = ((e.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width) * 2 - 1;
        mouse.y = - ((e.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1;

        //window.alert("Clicked on (" + mouse.x + ", " + mouse.y + ")");

        clicked = camera.rayCast(mouse, scene.children);

        //If at least one element got clicked, process the first which is NOT a line
        if(clicked && clicked.length > 0) {

            for(var i = 0; i < clicked.length; i++) {

                if(clicked[i].object.userData.onClick && !(clicked[i].object instanceof THREE.Line)) {

                    clicked[i].object.userData.onClick(clicked[i].object);
                    break;
                }
            }
        }
    }
}

function animate() {

    requestAnimationFrame(animate);

    TWEEN.update();

    camera.update();

    if(stats)
        stats.update();
}

function create_stats(){

    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left    = '0px';
    stats.domElement.style.top   = '0px';
    stats.domElement.style.display  = 'block';
    var contai = document.getElementById("container");
    contai.appendChild(stats.domElement);

    }

function render() {

    //renderer.render( scene, camera );
    camera.render(renderer, scene);
}


/**
 * Responsible for drawing the p2p network
 * @author Miguel Celedon
 */
function ViewManager() {
    
    var SECTION_SIZE = window.MAX_DISTANCE * 1.5;
    
    this.views = {};
    
    var self = this;
    
    /**
     * Convert a vector to the relative coordiantes of a section
     * @author Miguel Celedon
     * @param   {String}        sectionName The name of the section
     * @param   {Object}        vector      The original vector
     * @returns {THREE.Vector3} A new vector with the positions relative to the section center
     */
    this.translateToSection = function(sectionName, vector) {
        
    //    if(window.map.views[sectionName].title !== "Render") {
            sectionName = window.map.views[sectionName] || window.map.start;
            var section = sectionName.section || [0, 0];
            var newVector = vector.clone();
        
            if(typeof section !== 'undefined') {
        
                newVector.x = vector.x + section[0] * SECTION_SIZE;
                newVector.y = vector.y + section[1] * SECTION_SIZE;
            }
        
            return newVector;
    //    }
    };
    
    /**
     * Creates the structure of the transition functions depending of the view
     * @author Miguel Celedon
     * @lastmodifiedBy Emmanuel Colina
     * @lastmodifiedBy Ricardo Delgado
     * @param   {String} view The name of the view to process
     * @returns {Object} An object containing all the possible functions that can be called
     */
    function setTransition(view) {
        
        var transition = 5000;
        var actions = {},
            enter = null, exit = null, reset = null, zoom = null, backButton = null;
        
        if(window.map.views[view].enabled === true) {
        
            switch(view) {

                case 'table':
                    enter = function() {

                        window.tableEdit.addButton();

                        window.tileManager.transform(true, 3000 + transition);
                        
                        setTimeout(function(){
                            window.signLayer.transformSignLayer();
                         }, 9500);
                        
                        //Special: If coming from home, delay the animation
                        if(window.actualView === 'home')
                            transition = transition + 3000;

                        window.headers.transformTable(transition);

                        window.developer.delete();
                    };
                    
                    backButton = function() {
                        
                        window.changeView();
            
                        setTimeout(function(){
                            window.signLayer.transformSignLayer();
                        }, 2500);

                        window.developer.delete();
                    };                    
                    
                    exit = function() {
                        window.tileManager.rollBack();

                        buttonsManager.removeAllButtons();
                    };

                    reset = function() {
                        window.tileManager.rollBack();

                        window.headers.transformTable(2000);

                        setTimeout(function(){
                            window.signLayer.transformSignLayer();
                         }, 3000);
                    };

                    break;
                case 'stack':
                    enter = function() {

                        if(!window.headersUp) {
                            headers.showHeaders(transition);
                            window.headersUp = true;
                        }
                        window.headers.transformStack(transition);

                        window.helper.hideBackButton();

                    };

                    exit = function() {
                        window.headers.deleteArrows(transition);
                    };

                    break;
                case 'home':
                    enter = function() {
                        window.logo.stopFade(2000);
                        //window.guide.addButton();
                    };
                    
                    exit = function() {
                        
                        //window.buttonsManager.removeAllButtons();

                        if(window.guide.active){
                            window.guide.removeHelp();
                            window.guide.active = false;
                        }
                    };
                    break;
                case 'book':
                case 'readme':
                case 'whitepaper':
                    enter = function() {
                        setTimeout(function(){
                            window.magazine.init(view);
                        }, 2000);    
                    };
                    
                    reset = function() {
                        window.magazine.actionSpecial();
                    };

                    exit = function() {
                        window.magazine.remove();
                    };

                    break;
                case 'workflows': 
                    enter = function() {
                        if(!window.headersUp) {
                            headers.showHeaders(transition);
                            window.headersUp = true;
                        }
                        window.workFlowManager.getHeaderFLow();
                        window.headers.transformWorkFlow(transition);
                        window.workFlowEdit.addButton(); 
                    };
                    
                    backButton = reset = function() {

                        window.workFlowManager.showWorkFlow();
                    };

                    exit = function() {
                        window.buttonsManager.removeAllButtons();
                        window.workFlowManager.deleteAllWorkFlows();
                    };
                    break;
                case 'network':
                    enter = function() {
                        window.networkViewer = new NetworkViewer();
                        window.networkViewer.load();
                        
                    };
                    
                    exit = function() {
                        window.networkViewer.unload();
                        window.networkViewer = null;
                        
                        window.camera.disableFreeMode();
                        window.camera.freeView = false;
                    };
                    
                    zoom = function() {
                        
                        window.camera.enableFreeMode();
                        window.helper.showBackButton();
                        
                        if(window.networkViewer)
                            window.networkViewer.setCameraTarget();
                    };
                    
                    reset = function() {
                        if(window.networkViewer)
                            window.networkViewer.reset();
                        
                        window.helper.hideBackButton();
                        window.camera.resetPosition();
                    };
                    
                    backButton = function() {
                        
                        if(window.networkViewer && window.networkViewer.closeChild() === null) {
                            reset();
                        }
                    };
                    
                    break;
                case 'developers':
                    enter = function(){
                        window.developer.getDeveloper();

                        setTimeout(function(){
                            window.developer.animateDeveloper();
                        }, 2500);        
                    };
                    
                    backButton = reset = function() {
                        //setTimeout(function(){
                            window.developer.animateDeveloper();
                        //}, 2000);
                        
                        window.changeView();
                    };

                    exit = function() {
                        window.developer.delete();
                    };

                    break;
                default:
                    break;
            }
        }
        
        actions = {
            enter : enter || function(){},
            exit : exit || function(){},
            reset : reset || function(){},
            zoom : zoom || function(){},
            backButton : backButton || function(){}
        };
        
        return actions;
    }
    
    /**
     * Create a basic skeleton of the views, with exit, enter and reset functions as empty
     * @author Miguel Celedon
     */
    function initViews() {
        
        for(var view in window.map.views) {
            self.views[view] = setTransition(view);
        }
    }
    
    initViews();
}
function Workflow(flow) {

    var BOX_WIDTH = 825,
        BOX_HEIGHT = 188,
        X_OFFSET = -312, //Because lines don't come from the center
        ROW_SPACING = 350,
        COLUMN_SPACING = 900,
        HEADER_WIDTH = 825,
        HEADER_HEIGHT = 238;

    var self = this;

    var used = [];

    var objectsFlow = {
            mesh : [],
            position :{
                target : [],
                origin : []
            } 
    },
        objectsStep = {
            mesh : [],
            position :{
                target : [],
                origin : []
            }
    };

    this.stepsTest = objectsStep;

    this.flow = flow || [];

    this.action = false;

    this.objects = objectsFlow.mesh;

    this.positions = objectsFlow.position;

    initFlow();

    this.countFlowElement = function(){
        initFlow();
    };

    var onClick = function(target) {

        if(window.actualView === 'workflows'){
            window.workFlowManager.onElementClickHeaderFlow(target.userData.id);
            self.action = true;
        }
    };

    // Public method

    /**
     * Draws the flow
     * @lastmodifiedBy Emmanuel Colina
     * @lastmodifiedBy Ricardo Delgado
     * @param   {Number}  initialX Position where to start
     * @param   {Number}  initialY Position where to start
     */
    this.draw = function(initialX, initialY, initialZ, indice, id) {

        var title = self.createTitleBox(self.flow.name, self.flow.desc),
            origin = window.helper.getOutOfScreenPoint(0),
            target = new THREE.Vector3(initialX, initialY + window.TILE_DIMENSION.height * 2, initialZ);

        title.userData = {
                id: id,
                onClick : onClick
        };

        objectsFlow.position.origin.push(origin);
        objectsFlow.position.target.push(target);

        title.position.copy(origin);

        objectsFlow.mesh.push(title);

        window.scene.add(title);

        if(indice === 0){

            for(var i = 0, l = self.flow.steps.length; i < l; i++){
                self.drawTree(self.flow.steps[i], initialX + COLUMN_SPACING * i, initialY, 0);
            }

            new TWEEN.Tween(this)
                .to({}, 8000)
                .easing(TWEEN.Easing.Cubic.Out)
                .onUpdate(window.render)
                .start();

            self.showAllFlow();
            self.showSteps();
        }

        else if(indice === 1)
            self.showAllFlow();
    };

    this.drawEdit = function(initialX, initialY, initialZ, id) {

        var title = self.createTitleBox(self.flow.name, self.flow.desc),
            origin = window.helper.getOutOfScreenPoint(0),
            target = new THREE.Vector3(initialX, initialY , initialZ);

        title.userData = {
                id: id,
                onClick : onClick
        };

        objectsFlow.position.origin.push(origin);
        objectsFlow.position.target.push(target);

        title.position.copy(origin);

        objectsFlow.mesh.push(title);

        window.scene.add(title);

        self.showAllFlow();
    };

    /**
     * @author Miguel Celedon
     * @lastmodifiedBy Ricardo Delgado
     * @lastmodifiedBy Emmanuel Colina
     * Recursively draw the flow tree
     * @param {Object} root The root of the tree
     * @param {Number} x    X position of the root
     * @param {Number} y    Y position of the root
     */

    this.drawTree = function(root, x, y, z) {

        var TYPE = {
            async : 0xFF0000,
            direct: 0x0000FF
        };

        if(typeof root.drawn === 'undefined'){

            drawStep(root, x, y, z);

            var childCount = root.next.length,
                startX = x - 0.5 * (childCount - 1) * COLUMN_SPACING;

            if(childCount !== 0){

                var color = TYPE[root.next[0].type];

                if(root.next[0].type === "direct call")
                    color = (color !== undefined) ? color : TYPE.direct;
                else
                    color = (color !== undefined) ? color : TYPE.async;

                var lineGeo,
                    lineMat, 
                    rootPoint,
                    rootLine,
                    origin;           

                lineGeo = new THREE.BufferGeometry();

                lineMat = new THREE.LineBasicMaterial({color : color}); 

                rootPoint = new THREE.Vector3(x + X_OFFSET, y - ROW_SPACING / 2, -1);

                var vertexPositions = [
                    [x + X_OFFSET, y, -1],
                    [ x + X_OFFSET, y - ROW_SPACING / 2, -1]
                ];
                
                var vertices = new Float32Array(vertexPositions.length * 3);

                for(var j = 0; j < vertexPositions.length; j++)
                {
                    vertices[j*3 + 0] = vertexPositions[j][0];
                    vertices[j*3 + 1] = vertexPositions[j][1];
                    vertices[j*3 + 2] = vertexPositions[j][2];
                }

                lineGeo.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

                rootLine = new THREE.Line(lineGeo, lineMat);
                origin = helper.getOutOfScreenPoint(-1);
                rootLine.position.copy(origin);
                objectsStep.position.origin.push(origin);
                objectsStep.position.target.push(new THREE.Vector3(0, 0, 0));

                objectsStep.mesh.push(rootLine);
                window.scene.add(rootLine);

                var nextX, 
                    nextY, 
                    childLine, 
                    child, 
                    i, 
                    isLoop, 
                    nextZ = z;

                for(i = 0; i < childCount; i++) {

                    child = getStep(root.next[i].id);

                    isLoop = (typeof child.drawn !== 'undefined');


                    nextX = startX + i * COLUMN_SPACING;

                    if(isLoop) {

                        var gradient = new THREE.Color(color);

                        gradient.r = Math.max(gradient.r, 0.5);
                        gradient.g = Math.max(gradient.g, 0.5);
                        gradient.b = Math.max(gradient.b, 0.5); 

                        lineMat = new THREE.LineBasicMaterial({color : gradient.getHex()}); //gradient
                        nextY = child.drawn.y;

                        if(nextX !== rootPoint.x && colides(nextX, root))
                            nextX += (childCount + 1) * COLUMN_SPACING;
                    }
                    else {
                        lineMat = new THREE.LineBasicMaterial({color : color});
                        nextY = y - ROW_SPACING;
                    }

                    lineGeo = new THREE.Geometry();
                    lineGeo.vertices.push(
                            rootPoint,
                            new THREE.Vector3(nextX + X_OFFSET, rootPoint.y, -1),
                            new THREE.Vector3(nextX + X_OFFSET, nextY, -1)
                        );

                    if(isLoop) {

                        lineGeo.vertices[2].setY(nextY + ROW_SPACING * 0.25);

                        lineGeo.vertices.push(
                            new THREE.Vector3(child.drawn.x + X_OFFSET, child.drawn.y + ROW_SPACING * 0.25, -1)
                        );
                    }

                    childLine = new THREE.Line(lineGeo, lineMat);
                    //childLine.position.z = 80000;

                    origin = helper.getOutOfScreenPoint(-1);
                    childLine.position.copy(origin);
                    objectsStep.position.origin.push(origin);
                    objectsStep.position.target.push(new THREE.Vector3(0, 0, 0));

                    objectsStep.mesh.push(childLine);
                    window.scene.add(childLine);

                    self.drawTree(child, nextX, nextY, nextZ);
                }
            }
        }
    };
    
    /**
     * @author Emmanuel Colina
     * @lastmodifiedBy Ricardo Delgado
     * Takes away all the tiles except the one with the id
     */
    this.letAloneHeaderFlow = function() {

        animateFlows('steps', 'origin', false);
        animateFlows('flow', 'origin', true);
    };

    /**
     * @author Ricardo Delgado
     * Displays all flow in the table.
     */
    this.showAllFlow = function() {

        animateFlows('flow', 'target', true, 2500);
    };

    /**
     * @author Ricardo Delgado
     * It shows all the steps of the flow.
     */
    this.showSteps = function() {

        animateFlows('steps', 'target', true, 3000);
    };

    /**
     * @author Ricardo Delgado.
     * Deletes all objects related to the flow.
     */
    this.deleteAll = function() {

        animateFlows('steps', 'origin', false);
        animateFlows('flow', 'origin', false);  
    };

    /**
     * @author Ricardo Delgado.
     * Deletes all step related to the flow.
     */    
    this.deleteStep = function() {

        window.tileManager.letAlone();
        animateFlows('steps', 'origin', false, 3000);
    };

    //Private methods

    /**
     * @lastmodifiedBy Ricardo Delgado
     * Draws a single step
     * @param {Object} node The information of the step
     * @param {Number} x    X position
     * @param {Number} y    Y position
     */
    function drawStep(node, x, y, _z) {

        var z = _z || 0,
            tile,
            stepBox,
            origin,
            target,
            tilePosition = new THREE.Vector3(x - 108, y - 2, z + 1);

        if(node.element !== -1) {

            if(typeof used[node.element] !== 'undefined') {

                tile = window.helper.getSpecificTile(node.element).mesh.clone();
                tile.isClone = true;

                objectsStep.position.origin.push(window.helper.getOutOfScreenPoint(1));
                objectsStep.position.target.push(tilePosition);

                objectsStep.mesh.push(tile);
                window.scene.add(tile);
            }
            else {

                tile = window.helper.getSpecificTile(node.element).mesh;
                used[node.element] = true;

                new TWEEN.Tween(tile.position)
                .to({x : tilePosition.x, y : tilePosition.y, z : tilePosition.z}, 7000)
                .easing(TWEEN.Easing.Cubic.Out)
                .start();

                new TWEEN.Tween(tile.rotation)
                .to({x: 0, y: 0, z: 0}, 7000)
                .easing(TWEEN.Easing.Cubic.Out)
                .start();
            }


        }

        stepBox = createStepBox(node);

        origin = window.helper.getOutOfScreenPoint(0);

        target = new THREE.Vector3(x, y, z);

        objectsStep.position.origin.push(origin);
        objectsStep.position.target.push(target);

        stepBox.position.copy(origin);

        objectsStep.mesh.push(stepBox);
        scene.add(stepBox);

        node.drawn = {
            x : x,
            y : y
        };
    }

    /**
     * Check if the line collides a block
     * @param   {Number}  x    Position to check
     * @param   {Object}  from Object where the line starts
     * @returns {Boolean} true if collision is detected
     */

    function colides(x, from) {

        var actual;

        for(var i = 0; i < self.flow.steps.length; i++) {
            actual = self.flow.steps[i];

            if(actual.drawn && actual.drawn.x === x && actual !== from)
                return true;
        }

        return false;
    }


    /**
     * @author Miguel Celedon
     * Creates a flow box and when texture is loaded, calls fillBox
     * @param   {String}     src     The texture to load
     * @param   {Function}   fillBox Function to call after load, receives context and image
     * @returns {THREE.Mesh} The created plane with the drawed texture
     */
    function createFlowBox(src, fillBox, width, height, _switch) {

        var canvas = document.createElement('canvas');
        canvas.height = height;
        canvas.width = width;
        var ctx = canvas.getContext('2d');
        var size = 12;
        ctx.fillStyle = '#FFFFFF';

        var image = document.createElement('img');
        var texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.NearestFilter;

        ctx.font = size + 'px Arial';

        image.onload = function() {
            fillBox(ctx, image);
            texture.needsUpdate = true;
        };

        image.src = src;

        if(_switch)
            return texture;
        else{
            var mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(width, height),
            new THREE.MeshBasicMaterial({color : 0xFFFFFF, map : texture, transparent : true})
            );
            return mesh;
        }
    }

    /**
     * Creates a single step box
     * @param {Object} node The node to draw
     * @author Miguel Celedon
     */
    function createStepBox(node) {

        var fillBox = function(ctx, image) {

            ctx.drawImage(image, 0, 0);

            //ID
            var Nodeid = parseInt(node.id) + 1;
            Nodeid = (Nodeid < 10) ? '0' + Nodeid.toString() : Nodeid.toString();

            var size = 83;
            ctx.font = size + 'px Arial';
            ctx.fillStyle = '#000000';
            window.helper.drawText(Nodeid, 57, 130, ctx, 76, size);
            ctx.fillStyle = '#FFFFFF';

            //Title
            size = 18;
            ctx.font = 'bold ' + size + 'px Arial';
            window.helper.drawText(node.title, 421, 59, ctx, 250, size);

            //Description
            size = 12;
            ctx.font = size + 'px Arial';
            window.helper.drawText(node.desc, 421, 114, ctx, 250, size);
        };

        return createFlowBox('images/workflow/stepBox.png', fillBox, BOX_WIDTH, BOX_HEIGHT);
    }

    /**
     * Creates the title box
     * @param {String} title The title of the box
     * @param {String} desc  The description of the whole process
     * @author Miguel Celedon
     */
    this.createTitleBox = function(title, desc, _switch) {

        var fillBox = function(ctx, image) {

            ctx.drawImage(image, 0, 0);

            //Title
            var size = 24;
            ctx.font = 'bold ' + size + 'px Arial';
            window.helper.drawText(title, 190, 61, ctx, 400, size);

            //Description
            size = 17;
            ctx.font = size + 'px Arial';
            window.helper.drawText(desc, 190, 126, ctx, 550, size);
        };

        return createFlowBox('images/workflow/titleBox.png', fillBox, HEADER_WIDTH, HEADER_HEIGHT, _switch);
    };

    /**
     * @author Ricardo Delgado.
     * Creates the animation for all flow there.
     * @param   {Object}    objects     .     
     * @param   {String}     target     He says the goal should take the flow.
     * @param   {Boolean}    visible    visible of the object.
     * @param   {Number}    duration    Animation length.
     */
    function animateFlows(objects, target, visible, duration, callback){

        var _duration = duration || 2000,
            _target,
            _objects,
            object;

        if(objects === 'steps'){

            _objects = objectsStep;

            if(!visible){

                used = [];

                objectsStep = { mesh : [], position :{ target : [], origin : [] } };

                for(var _i = 0, _l = self.flow.steps.length; _i < _l; _i++){
                    delete self.flow.steps[_i].drawn;
                }
            }
        }
        else{

            _objects = objectsFlow;

            if(!visible){

                used = [];

                objectsFlow = { mesh : [], position :{ target : [], origin : [] } };

            }
        }

        for(var i = 0, l = _objects.mesh.length; i < l; i++){

            _target = _objects.position[target][i];
            object = _objects.mesh[i];
            moveObject(object, _target, _duration, visible);
        }

        function moveObject(object, target, duration, visible) {

            new TWEEN.Tween(object.position)
                .to({
                    x: target.x,
                    y: target.y,
                    z: target.z
                }, duration)
                .easing(TWEEN.Easing.Cubic.Out)
                .onComplete(function() {
                    if(!visible)
                        window.scene.remove(object);    
                })
                .start();
        }


    }

    /**
     * Looks for the node related to that step
     * @param   {Number} id The id of the step
     * @returns {Object} The node found or null otherwise
     * @author Miguel Celedon
     */
    function getStep(id) {

        var i, l, actual;

        for(i = 0, l = self.flow.steps.length; i < l; i++) {

            actual = self.flow.steps[i];

            //Should not be done, the id in 'next' and in each step should be the same type (strings)
            if(actual.id == id)
                return actual;
        }

        return null;
    }

    //-----------------------------------------------------------------------------

    function initFlow(){

        var i, l;

        for(i = 0, l = self.flow.steps.length; i < l; i++) {

            var element = self.flow.steps[i];

            self.flow.steps[i].element = helper.searchElement(
                (element.platfrm || element.suprlay) + '/' + element.layer + '/' + element.name
            );
        }
    }

}
function WorkFlowEdit() {

    var self = this;

    var classFlow = null;

    this.addButton = function(_id){

        var id = null,
            text = 'Edit WorkFlow',
            button = 'buttonWorkFlowEdit',
            side = null,
            callback = null;

        if(typeof _id === 'number')
            id = _id;

        if(id === null){

            if(!window.session.getIsLogin()){
            
                callback = function(){ 
                    window.session.getAuthCode();
                };
            }
            else{

                callback = function(){ 

                    window.fieldsEdit.actions.type = "insert";

                    window.buttonsManager.removeAllButtons();

                    window.session.displayLoginButton(false);

                    drawHeaderFlow(null);
                };

            }

            window.session.displayLoginButton(true);

            text = 'Add New WorkFlow';
            button = 'buttonWorkFlowNew';
            side = 'left';
            
            window.buttonsManager.createButtons(button, text, callback, null, null, side);

        }
        else{

            if(!window.session.getIsLogin()){
            
                callback = function(){ 
                    window.session.getAuthCode();
                };
            }
            else{

                callback = function(){

                    validateLock(id, function(){ 

                        window.fieldsEdit.actions.type = "update";
                        window.buttonsManager.removeAllButtons(); 
                        drawHeaderFlow(id, function(){
                            window.fieldsEdit.createFieldWorkFlowEdit();
                        });
                    });
                };
            }

            window.session.displayLoginButton(false);

            window.buttonsManager.createButtons(button, text, callback, null, null, side);

            if(!window.session.getIsLogin()){
            
                callback = function(){ 
                    window.session.getAuthCode();
                };
            }
            else{ 

                callback = function(){

                    validateLock(id, function(){ 

                        if(window.confirm("Are you sure you want to remove this process?"))           
                            deleteWorkFlow(id);
                    });                
                };
            }

            text = 'Delete WorkFlow';
            button = 'buttonWorkFlowDelete';
            side = 'right';
            
            window.buttonsManager.createButtons(button, text, callback, null, null, side);
        }   
    
    };

    this.changeTexture = function(){
        
        var flow = window.fieldsEdit.getData();

        var texture = classFlow.createTitleBox(flow.name, flow.desc, true);

        var mesh = window.fieldsEdit.objects.tile.mesh;

        mesh.material.map = texture;

        mesh.material.needsUpdate = true; 
    };

    this.fillStep = function(){

        var flow = window.fieldsEdit.getData();

        classFlow.deleteStep();

        var target = window.fieldsEdit.objects.tile.target.show;

        classFlow.flow = flow;

        classFlow.countFlowElement();

        for (var i = 0; i < flow.steps.length; i++) {
            classFlow.drawTree(flow.steps[i], target.position.x + 900 * i, target.position.y - 211, 0);
        }

        classFlow.showSteps();

    };

    this.save = function(){

        if(validateFields() === ''){ 

            window.fieldsEdit.disabledButtonSave(true);
            
            if(window.fieldsEdit.actions.type === "insert")
                createWorkFlow();
            else if(window.fieldsEdit.actions.type === "update")
                modifyWorkFlow();
        }
        else{
             window.alert(validateFields());
        }
    };

    function createElement(){

        var mesh = classFlow.createTitleBox();

        var newCenter = window.helper.getCenterView('workflows');

        var y = getPositionY() - 500;
        
        var target = window.helper.fillTarget(newCenter.x, y, newCenter.z, 'workflows');

        mesh.position.copy(target.hide.position);

        mesh.rotation.copy(target.hide.rotation);

        mesh.renderOrder = 1;

        mesh.material.needsUpdate = true;

        window.scene.add(mesh);

        window.fieldsEdit.objects.tile.mesh = mesh;

        window.fieldsEdit.objects.tile.target = target;
    }

    function getPositionY(){

        var newCenter = window.helper.getCenterView('workflows');

        var Ymin = newCenter.y;

        for(var i = 0; i < window.workFlowManager.getObjHeaderFlow().length; i++){

            var y = window.workFlowManager.getObjHeaderFlow()[i].positions.target[0].y;

            if(Ymin === 0){
                Ymin = y;
            }
            else 
            if(Ymin > y){ 
                    Ymin = y;
            }
        }

        return Ymin;
    }

    function drawHeaderFlow(id, callback){ 

        var flow = null,
            mesh = null;

        if(window.fieldsEdit.actions.type === "insert"){

            window.fieldsEdit.createFieldWorkFlowEdit();

            flow = window.fieldsEdit.getData();

            classFlow = new Workflow(flow);

            createElement();

            mesh = window.fieldsEdit.objects.tile.mesh;

            window.fieldsEdit.actions.exit = function(){

                classFlow.deleteStep();

                classFlow = null;

                window.camera.resetPosition();

            };

            animate(mesh, window.fieldsEdit.objects.tile.target.show, 1000, function(){ 

                window.camera.setFocus(mesh, new THREE.Vector4(0, 0, 950, 1), 2000);

                if(typeof(callback) === 'function')
                    callback();

                window.helper.showBackButton();

            });
        }
        else if(window.fieldsEdit.actions.type === "update"){

            var workFlow = window.workFlowManager.getObjHeaderFlow()[id];

            workFlow.deleteStep();

            flow = workFlow.flow;

            flow = window.helper.clone(flow);

            classFlow = new Workflow(flow);

            createElement();

            mesh = window.fieldsEdit.objects.tile.mesh;

            window.fieldsEdit.actions.exit = function(){

                classFlow.deleteStep();

                classFlow = null;

                window.camera.resetPosition();

            };

            animate(mesh, window.fieldsEdit.objects.tile.target.show, 1000, function(){ 

                window.camera.setFocus(mesh, new THREE.Vector4(0, 0, 950, 1), 2000);

                if(typeof(callback) === 'function')
                    callback();

                fillFields(id);

                self.changeTexture();

                self.fillStep();

                window.headers.transformWorkFlow(2000);

                var allWorkFlow = window.workFlowManager.getObjHeaderFlow();

                for(var i = 0; i < allWorkFlow.length ; i++) {

                    if(allWorkFlow[i].action){

                        allWorkFlow[i].deleteStep();
                        allWorkFlow[i].action = false;
                        allWorkFlow[i].showAllFlow();
                    }
                    else
                        allWorkFlow[i].showAllFlow();
                }

                window.helper.showBackButton();

            });
            
        }
    }

    function validateFields(){

        var msj = '';

        var name = document.getElementById('workflow-header-title');

        if(name.value === ""){
            msj += 'The workFlow must have a name \n';
            name.focus();
        }

        return msj;
    }

    //workFlow action

    function createWorkFlow(){

        var flow = window.fieldsEdit.getData();

        var params = getParamsData(flow);  

        window.API.postRoutesEdit('wolkFlowEdit', 'insert', params, null,
            function(res){ 

                flow._id = res._id;

                postParamsSteps(flow, function(flow){ 

                    addWorkFlow(flow, 3000);

                    classFlow.deleteStep();

                    classFlow = null;

                    window.camera.loseFocus();

                });  
            },
            function(){

                window.fieldsEdit.disabledButtonSave(false);    
            });

        function getParamsData(flow){

            var param = { };

            param.platfrm = flow.platfrm;
            
            param.name = flow.name;

            param.prev = "null";

            param.next = "null";

            if(flow.desc)
                param.desc = flow.desc;
            else
                param.desc = "pending";

            return param;
        }

        function postParamsSteps(flow, callback){

            var steps = flow.steps.slice();

            var newSteps = [];

            var dataPost = {
                    proc_id : flow._id
                };

            postSteps(steps);

            function postSteps(steps){

                if(steps.length > 0){ 

                    var param = {};

                    param.type = steps[0].type;
                    param.comp_id = getIdSpecificTile(steps[0].name);
                    param.title = steps[0].title;
                    if(steps[0].desc)
                        param.desc = steps[0].desc;
                    else
                        param.desc = "pending";
                    param.order = steps[0].id;

                    if(steps[0].next.length > 0)
                        param.next = steps[0].next;

                    window.API.postRoutesEdit('wolkFlowEdit', 'insert step', param, dataPost,
                        function(res){

                            steps[0]._id = res._id;

                            newSteps.push(steps[0]);
                            
                            steps.splice(0,1);

                            postSteps(steps);

                        });
                }
                else{

                    flow.steps = newSteps;

                    callback(flow);
                }
            }
        }

    }

    function addWorkFlow(flow, duration){

        var newFlow = new Workflow(flow);

        var _target = new THREE.Vector3();

        var target = null,
            find = false,
            id = window.workFlowManager.getObjHeaderFlow().length;

        for(var i = 0; i < window.workFlowManager.getObjHeaderFlow().length; i++){

            if(window.workFlowManager.getObjHeaderFlow()[i].flow.platfrm === flow.platfrm){

                target = window.workFlowManager.getObjHeaderFlow()[i].positions.target[0];

                find = true;

                if(target.y < _target.y)
                    _target.copy(target);
            }
        }
        if(find === false){ 
            for(var j = 0; j < window.headers.getPositionHeaderViewInFlow().length; j++){
                if(window.headers.getPositionHeaderViewInFlow()[j].name === flow.platfrm){
                    _target =  window.headers.getPositionHeaderViewInFlow()[j].position;
                }
            }
        }

        _target = window.helper.clone(_target);
       
        if(find === true){
            _target.y = _target.y - 500;
        }
        else{
            _target.x = _target.x - 1500;
            _target.y = _target.y - 2200;
        }

        window.camera.move(_target.x, _target.y, 8000, duration);

        setTimeout( function() {

            newFlow.drawEdit(_target.x, _target.y, _target.z, id);
            
            window.workFlowManager.getObjHeaderFlow().push(newFlow);

        }, duration);

    }

    function modifyWorkFlow(){ 

        var newFlow = window.fieldsEdit.getData();

        var params = getParamsData(newFlow);

        var dataPost = {
                proc_id : window.fieldsEdit.actualFlow._id
            };

        window.API.postRoutesEdit('wolkFlowEdit', 'update', params, dataPost,
            function(res){ 

                newFlow._id = window.fieldsEdit.actualFlow._id;

                postParamsStep(newFlow, function(newFlow){

                    var oldFlow = window.helper.clone(window.fieldsEdit.actualFlow),
                        oldGroup = oldFlow.platfrm,
                        newGroup = newFlow.platfrm,
                        id = window.fieldsEdit.actualFlow.id,
                        target = window.helper.fillTarget(0, 0, 160000, 'workflows'),
                        workFlow = window.workFlowManager.getObjHeaderFlow()[id],
                        mesh = workFlow.objects[0];
                        
                    window.camera.loseFocus();

                    classFlow.deleteStep();

                    classFlow = null;

                    var positionCameraX = workFlow.positions.target[0].x,
                        positionCameraY = workFlow.positions.target[0].y;

                    window.camera.move(positionCameraX, positionCameraY, 8000, 2000);

                    setTimeout( function() {

                        if(newGroup !== oldGroup)
                            change();
                        else
                            notChange();

                    }, 1500 );

                    function change(){

                        window.workFlowManager.getObjHeaderFlow().splice(id, 1);

                        animate(mesh, target.hide, 800, function(){

                            window.scene.remove(mesh);

                            updateWorkFlow(workFlow.flow.platfrm);

                            setTimeout( function() {

                                addWorkFlow(newFlow, 2000);

                            }, 2500 );

                        });
                    }

                    function notChange(){

                        var texture = workFlow.createTitleBox(newFlow.name, newFlow.desc, true);

                        animate(mesh, target.hide, 1000, function(){

                            mesh.material.map = texture;

                            mesh.material.needsUpdate = true;

                            target = window.helper.fillTarget(workFlow.positions.target[0].x, workFlow.positions.target[0].y, 0, 'workflows');

                            animate(mesh, target.show, 1000, function(){

                                workFlow.flow.name = newFlow.name;

                                workFlow.flow.desc = newFlow.desc;

                                workFlow.flow.platfrm = newFlow.platfrm;

                                workFlow.flow.steps = newFlow.steps;

                                workFlow.countFlowElement();
                            });
                        });
                    }

                });

        },
        function(){
            window.fieldsEdit.disabledButtonSave(false);
        });

        function getParamsData(flow){

            var param = {};

            param.platfrm = flow.platfrm;
            
            param.name = flow.name;

            param.prev = "null";

            param.next = "null";

            if(flow.desc)
                param.desc = flow.desc;
            else
                param.desc = "pending";

            return param;
        }

        function postParamsStep(flow, callback){

            var newSteps = flow.steps.slice(),
                oldSteps = window.fieldsEdit.actualFlow.steps.slice(),
                newFlowSteps = newSteps.slice(),
                config = { 
                        insert :{
                            steps : [],
                            route : 'insert step'
                        },
                        update : {
                            steps : [],
                            route : 'update step'
                        },
                        delete :{
                            steps : [],
                            route : 'delete step'
                        }
                    };

            fillSteps(newSteps, oldSteps);

            postSteps('delete',config.delete.steps.slice(0), function(){

                postSteps('update',config.update.steps.slice(0), function(){

                    postSteps('insert',config.insert.steps.slice(0), function(){

                        flow.steps = newFlowSteps;
                        
                        callback(flow);
                    });
                });
            });

            function fillSteps(newSteps, oldSteps){ 

                var difference,
                    i;   

                if(newSteps.length > oldSteps.length){

                    difference = (newSteps.length - (newSteps.length - oldSteps.length)) - 1;

                    for(i = 0; i < newSteps.length; i++){

                        if(i > difference){
                            config.insert.steps.push(newSteps[i]);  
                        }
                        else{

                            if(newSteps[i].title.toLowerCase() !== oldSteps[i].title.toLowerCase() ||
                               newSteps[i].desc.toLowerCase() !== oldSteps[i].desc.toLowerCase() ||
                               newSteps[i].name.toLowerCase() !== oldSteps[i].name.toLowerCase()){

                                newSteps[i]._id = oldSteps[i]._id;
                                config.update.steps.push(newSteps[i]);
                            }
                            else if(newSteps[i].next.length !== oldSteps[i].next.length){

                                newSteps[i]._id = oldSteps[i]._id;
                                config.update.steps.push(newSteps[i]);
                            }
                            else if(newSteps[i].next.length !== 0){

                                for(var t = 0; t < newSteps[i].next.length; t++){

                                    if(newSteps[i].next[t].id !== oldSteps[i].next[t].id ||
                                       newSteps[i].next[t].type !== oldSteps[i].next[t].type){
                                        newSteps[i]._id = oldSteps[i]._id;
                                        config.update.steps.push(newSteps[i]);
                                    }
                                }
                            }
                        }
                    }
                }
                else if(newSteps.length === oldSteps.length){

                    for(i = 0; i < newSteps.length; i++){

                        if(newSteps[i].title.toLowerCase() !== oldSteps[i].title.toLowerCase() ||
                           newSteps[i].desc.toLowerCase() !== oldSteps[i].desc.toLowerCase() ||
                           newSteps[i].name.toLowerCase() !== oldSteps[i].name.toLowerCase() ){

                            newSteps[i]._id = oldSteps[i]._id;
                            config.update.steps.push(newSteps[i]);
                        }
                        else if(newSteps[i].next.length !== oldSteps[i].next.length){

                            newSteps[i]._id = oldSteps[i]._id;
                            config.update.steps.push(newSteps[i]);
                        }
                        else if(newSteps[i].next.length !== 0){

                            for(var t = 0; t < newSteps[i].next.length; t++){

                                if(newSteps[i].next[t].id !== oldSteps[i].next[t].id ||
                                   newSteps[i].next[t].type !== oldSteps[i].next[t].type){
                                    newSteps[i]._id = oldSteps[i]._id;
                                    config.update.steps.push(newSteps[i]);
                                }
                            }
                        }
                    }
                }
                else if(newSteps.length < oldSteps.length){

                    difference = (oldSteps.length - (oldSteps.length - newSteps.length)) - 1;

                    for(i = 0; i < oldSteps.length; i++){

                        if(i > difference){
                            config.delete.steps.push(oldSteps[i]);  
                            
                        }
                        else{ 

                            if(newSteps[i].title.toLowerCase() !== oldSteps[i].title.toLowerCase() ||
                               newSteps[i].desc.toLowerCase()!== oldSteps[i].desc.toLowerCase() ||
                               newSteps[i].name.toLowerCase()!== oldSteps[i].name.toLowerCase() ){

                                newSteps[i]._id = oldSteps[i]._id;
                                config.update.steps.push(newSteps[i]);
                            }
                            else if(newSteps[i].next.length !== oldSteps[i].next.length){

                                newSteps[i]._id = oldSteps[i]._id;
                                config.update.steps.push(newSteps[i]);
                            }
                            else if(newSteps[i].next.length !== 0){

                                for(var t = 0; t < newSteps[i].next.length; t++){

                                    if(newSteps[i].next[t].id !== oldSteps[i].next[t].id ||
                                       newSteps[i].next[t].type !== oldSteps[i].next[t].type){
                                        newSteps[i]._id = oldSteps[i]._id;
                                        config.update.steps.push(newSteps[i]);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            function postSteps(task, array, callback){

                if(array.length > 0){

                    var dataPost = {
                            proc_id : window.fieldsEdit.actualFlow._id
                        };

                    var param = {};

                    if(task === 'update' || task === 'delete')
                        dataPost.steps_id = array[0]._id;

                    if(task !== 'delete'){ 

                        param.type = array[0].type;
                        param.comp_id = getIdSpecificTile(array[0].name);
                        param.title = array[0].title;
                        if(array[0].desc)
                            param.desc = array[0].desc;
                        else
                            param.desc = "pending";
                        param.order = array[0].id;

                        if(task === 'update'){

                            param.next = array[0].next;
                        }
                        else{

                            if(array[0].next.length > 0)
                                param.next = array[0].next;
                        }
                    }

                    window.API.postRoutesEdit('wolkFlowEdit', config[task].route, param, dataPost,
                        function(res){

                            if(task !== 'delete'){ 

                                array[0]._id = res._id;

                                newFlowSteps[array[0].id]._id = array[0]._id;
                            }
                            
                            array.splice(0,1);

                            postSteps(task, array, callback);

                        },
                        function(){
                            window.fieldsEdit.disabledButtonSave(false);
                        });
                }
                else{

                    callback();
                }
            }
        
        }
    }

    function deleteWorkFlow(id){

        var workFlow = window.workFlowManager.getObjHeaderFlow()[id];

        var dataPost = {
                proc_id : workFlow.flow._id
            };

        window.API.postRoutesEdit('wolkFlowEdit', 'delete', false, dataPost,
            function(res){
        
                window.workFlowManager.showWorkFlow();

                window.workFlowManager.getObjHeaderFlow().splice(id, 1);

                window.camera.move(workFlow.positions.target[0].x, workFlow.positions.target[0].y, 8000, 2000);

                setTimeout(function(){

                    var target =  window.helper.fillTarget(0, 0, 160000, 'workflows');
                    var mesh = workFlow.objects[0];

                    animate(mesh, target.hide, 1500, function(){
                            window.scene.remove(mesh);
                            updateWorkFlow(workFlow.flow.platfrm);
                        });
                    
                }, 2500);
            });
    }

    function updateWorkFlow(platform){

        var positionInit = null,
            ArrayPosition = [];

        for(var j = 0; j < window.headers.getPositionHeaderViewInFlow().length; j++){

            if(window.headers.getPositionHeaderViewInFlow()[j].name === platform){

                positionInit =  window.headers.getPositionHeaderViewInFlow()[j].position;
            }
        }

        for(var i = 0; i < window.workFlowManager.getObjHeaderFlow().length; i++){

            var workFlow = window.workFlowManager.getObjHeaderFlow()[i];

            var mesh = workFlow.objects[0];

            mesh.userData.id = i;

            if(workFlow.flow.platfrm === platform){

                if(ArrayPosition.length > 0){

                    workFlow.positions.target[0].y = window.helper.getLastValueArray(ArrayPosition).y - 500;
                }
                else{

                    workFlow.positions.target[0].x = positionInit.x - 1500;
                    workFlow.positions.target[0].y = positionInit.y - 2200;
                }

                ArrayPosition.push(workFlow.positions.target[0]);

                var target = window.helper.fillTarget(workFlow.positions.target[0].x, workFlow.positions.target[0].y, 0, 'workflows');

                animate(workFlow.objects[0], target.show, 1000);
            }
        }
    }

    function validateLock(_id, callback){

        var id = window.workFlowManager.getObjHeaderFlow()[_id].flow._id;

        var dataPost = {
                proc_id : id
            };

        window.API.postValidateLock('wolkFlowEdit', dataPost,
            function(res){ 

                if(typeof(callback) === 'function')
                    callback();
            },
            function(res){

                window.alert("This workFlow is currently being modified by someone else, please try again in about 3 minutes");
            }
        );
    }

    function getIdSpecificTile(name){

        for(var platfrm in window.TABLE){

            for (var layer in window.TABLE[platfrm].layers){

                for(var i = 0; i < window.TABLE[platfrm].layers[layer].objects.length; i++){
                    
                    var tile = window.TABLE[platfrm].layers[layer].objects[i].data; 
                    
                    if(tile.name.toLowerCase() === name.toLowerCase())
                        return tile.id;
                }   
            }        
        } 
    }

    function fillFields(id){

        var flow = classFlow.flow;

        flow = window.helper.clone(flow);

        window.fieldsEdit.actualFlow = window.helper.clone(flow);

        var steps = flow.steps;

        for(var i = 0; i < steps.length; i++){

            if(steps[i].element !== -1){

                var data = window.helper.getSpecificTile(steps[i].element).data;

                steps[i].layer = data.layer;
                steps[i].name = data.name;
            }
        }

        var list = document.getElementById("step-List");

        list.valueJson = steps.slice();

        window.fieldsEdit.actualFlow.id = id;

        if(flow.platfrm !== undefined)
            document.getElementById("workflow-header-plataform").value = flow.platfrm;

        if(flow.name !== undefined)
            document.getElementById("workflow-header-title").value = flow.name;
        
        if(flow.desc !== undefined)
            document.getElementById("modal-desc-textarea").value = flow.desc;

        list.update();

        if(steps.length > 0)
            document.getElementById("modal-steps-div").changeStep(0);
        
    }

    function animate(mesh, target, duration, callback){

        var _duration = duration || 2000,
            x = target.position.x,
            y = target.position.y,
            z = target.position.z,
            rx = target.rotation.x,
            ry = target.rotation.y,
            rz = target.rotation.z; 

        _duration = Math.random() * _duration + _duration;

        new TWEEN.Tween(mesh.position)
            .to({x : x, y : y, z : z}, _duration)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();

        new TWEEN.Tween(mesh.rotation)
            .to({x: rx, y: ry, z: rz}, _duration + 500)
            .easing(TWEEN.Easing.Cubic.Out)
            .onComplete(function () {
                    if(typeof(callback) === 'function')
                        callback();   
                })
            .start();
    }
}
/**
 * Represents a flow of actions related to some tiles
 * @param   {Object}  flow The objects that describes the flow including a set of steps
 */
function WorkFlowManager(){

    // Private Variables
    var headerFlow = [],
        positionHeaderFlow = [],
        actualFlow = null;

    // Public method
    this.getObjHeaderFlow = function(){ 
        return headerFlow;
    };

    this.getpositionHeaderFlow = function(){ 
        return positionHeaderFlow;
    };
    /**
     * @author Emmanuel Colina
     * Set position for each Header Flow
     * @param {Object} header target
     */

    this.createColumHeaderFlow = function(header){

        var countElement = 0,
            obj,
            ids = [],
            position = [],
            center;

        for(var i = 0; i < headerFlow.length; i++) {
            if(header.name === headerFlow[i].flow.platfrm){
                countElement = countElement + 1;
                ids.push(i);
            }
        }

        center = new THREE.Vector3();
        center.copy(header.position);
        center.y = center.y - 2700;

        if(countElement === 1)
            position.push(center);
        else if(countElement === 2) {

            center.x = center.x - 500;

            for(var k = 0; k < countElement; k++) {

                obj = new THREE.Vector3();

                obj.x = center.x;
                obj.y = center.y;

                position.push(obj);

                center.x = center.x + 1000;
            }
        }
        else if(countElement > 2){

            var mid;

            mid = Math.round(countElement / 2);

            for(var x = mid; x > 0; x--) {

                center.x = center.x - 3500;
            }

            for(var j = 0; j < countElement; j++){

                obj = new THREE.Vector3();

                obj.x = center.x + 1000;
                obj.y = center.y;

                position.push(obj);

                center.x = center.x + 4000;
            }
        }

        letAloneColumHeaderFlow(ids);
        setPositionColumHeaderFlow(ids, position);
        drawColumHeaderFlow(ids, position);
    };

    /**
    * @author Emmanuel Colina
    * @lastmodifiedBy Ricardo Delgado
    * Delete All the actual view to table
    */
    this.deleteAllWorkFlows = function(){

        var _duration = 2000;

        if(headerFlow){
            for(var i = 0; i < headerFlow.length; i++) {

                headerFlow[i].deleteAll();
                window.helper.hideObject(headerFlow[i].objects[0], false, _duration);
                window.scene.remove(headerFlow[i]);
            }
        }

        headerFlow = [];
    };

    this.getActualFlow = function(){

        if(actualFlow) {
            for(var i = 0; i < actualFlow.length; i++) {
                actualFlow[i].deleteAll();
            }
            actualFlow = null;
        }
    };

    this.getAndShowFlows = function(id) {

        var element = window.helper.getSpecificTile(id).data;

        var button = window.buttonsManager.createButtons('showFlows', 'Loading flows...');

        var params = {
            group : (element.platform || element.superLayer),
            layer : element.layer,
            component : element.name
        };
        var url = window.API.getAPIUrl("procs", params);

        $.ajax({
            url: url,
            method: "GET"
        }).success(
            function(processes) {
                var p = processes,
                    flows = [];

                for(var i = 0; i < p.length; i++) {

                    flows.push(new Workflow(p[i]));
                }

                if(flows.length > 0) {
                    button.innerHTML = 'Show Workflows';
                    button.addEventListener('click', function() {
                        showFlow(flows);
                        window.buttonsManager.removeAllButtons();
                    });
                }
                else
                    window.buttonsManager.deleteButton('showFlows');
            }
        );
    };

    this.showWorkFlow = function() {

        if(window.camera.getFocus() !== null) {

            window.camera.loseFocus();

            window.headers.transformWorkFlow(2000);

            for(var i = 0; i < headerFlow.length ; i++) {

                if(headerFlow[i].action){

                    headerFlow[i].deleteStep();
                    headerFlow[i].action = false;
                    headerFlow[i].showAllFlow();
                }
                else
                    headerFlow[i].showAllFlow();
            }

            window.helper.hideBackButton();
        }
    };

    /**
     * @author Emmanuel Colina
     * Get the headers flows
     */
    this.getHeaderFLow = function() {

        var url = window.API.getAPIUrl("procs");

        $.ajax({
            url: url,
            method: "GET"
        }).success(
            function(processes) {
                var p = processes, objectHeaderInWFlowGroup;

                for(var i = 0; i < p.length; i++){
                    
                    if(window.platforms[p[i].platfrm] || window.superLayers[p[i].platfrm])
                        headerFlow.push(new Workflow(p[i]));
                }
                objectHeaderInWFlowGroup = window.headers.getPositionHeaderViewInFlow();
                calculatePositionHeaderFLow(headerFlow, objectHeaderInWFlowGroup);
            }
        );
    };

    // Private method

    /**
     * @author Emmanuel Colina
     *
     */

    this.onElementClickHeaderFlow = function(id) {

        var duration = 1000;

        if(window.camera.getFocus() == null) {

            var camTarget = headerFlow[id].objects[0].clone();
            camTarget.position.y -= 850;

            window.camera.setFocus(camTarget, new THREE.Vector4(0, -850, 2600, 1),duration);

            for(var i = 0; i < headerFlow.length ; i++) {
                if(id !== i)
                    headerFlow[i].letAloneHeaderFlow();
            }

            headers.hidetransformWorkFlow(duration);

            setTimeout(function() {
                for(var i = 0; i < headerFlow[id].flow.steps.length; i++) {
                    headerFlow[id].drawTree(headerFlow[id].flow.steps[i], headerFlow[id].positions.target[0].x + 900 * i, headerFlow[id].positions.target[0].y - 211, 0);
                }
               headerFlow[id].showSteps();
            }, 1000);

            window.buttonsManager.removeAllButtons();
            window.helper.showBackButton();
            window.workFlowEdit.addButton(id);
        }
    };

    /**
     * @author Emmanuel Colina
     * Calculate the headers flows
     */
    function calculatePositionHeaderFLow(headerFlow, objectHeaderInWFlowGroup) {

        var position, indice = 1;
        var find = false;

        for(var i = 0; i < objectHeaderInWFlowGroup.length; i++) {

            for(var j = 0; j < headerFlow.length; j++) {

                if(objectHeaderInWFlowGroup[i].name === headerFlow[j].flow.platfrm){

                    if(find === false){

                        position = new THREE.Vector3();

                        position.x = objectHeaderInWFlowGroup[i].position.x - 1500;

                        position.y = objectHeaderInWFlowGroup[i].position.y - 2500;

                        positionHeaderFlow.push(position);

                        headerFlow[j].draw(position.x, position.y, 0, indice, j);

                        find = true;
                    }
                    else{

                        position = new THREE.Vector3();

                        position.x = objectHeaderInWFlowGroup[i].position.x - 1500;

                        position.y = positionHeaderFlow[positionHeaderFlow.length - 1].y - 500;

                        headerFlow[j].draw(position.x, position.y, 0, indice, j);

                        positionHeaderFlow.push(position);
                    }
                }
            }
            find = false;
        }
    }

    //Should draw ONLY one flow at a time
    function showFlow(flows) {

        var position = window.camera.getFocus().position;
        var indice = 0;

        window.camera.enable();
        window.camera.move(position.x, position.y, position.z + window.TILE_DIMENSION.width * 5);

        setTimeout(function() {

            actualFlow = [];

            for(var i = 0; i < flows.length; i++) {
                actualFlow.push(flows[i]);
                flows[i].draw(position.x, position.y, 0, indice, i);

                //Dummy, set distance between flows
                position.x += window.TILE_DIMENSION.width * 10;
            }

        }, 1500);
    }

    /**
     * @author Emmanuel Colina
     * let alone the header flow
     * @param {Object} ids id of header flow
     */
    function letAloneColumHeaderFlow(ids){

        var find = false;

        for(var p = 0; p < headerFlow.length ; p++) {

            for(var q = 0; q < ids.length; q++){
                if(ids[q] === p)
                    find = true;
            }
            if(find === false)
                headerFlow[p].letAloneHeaderFlow();

            find = false;
        }
    }

    /**
     * @author Emmanuel Colina
     * set position to header flow
     * @param {Object} ids id of header flow
     * @param {Object} position of header flow
     */
    function setPositionColumHeaderFlow(ids, position){

        var duration = 3000;

        for(var i = 0, l = ids.length; i < l; i++) {
            new TWEEN.Tween(headerFlow[ids[i]].objects[0].position)
            .to({
                x : position[i].x,
                y : position[i].y,
                z : position[i].z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
    }

    /**
     * @author Emmanuel Colina
     * draw header flow
     * @param {Object} ids id of header flow
     * @param {Object} position of header flow
     */
    function drawColumHeaderFlow(ids, position){

        for(var m = 0; m < ids.length; m++) {
            for(var k = 0; k < headerFlow[ids[m]].flow.steps.length; k++) {
                    headerFlow[ids[m]].drawTree(headerFlow[ids[m]].flow.steps[k], position[m].x + 900 * k, position[m].y - 211, 0);
            }

            headerFlow[ids[m]].showSteps();
            headerFlow[ids[m]].action = true;
        }
    }
}
