'use strict';

var map,
    layers = [],
    elements = {
        NETWORK_NODE :{
            layers : [],
            state : true
        },
        NETWORK_CLIENT :{
            layers : [],
            state : true
        }
    },
    view,
    actorTypes = {},
    overlay;

$(document).ready(main);

/**
 * Action by clicking on the map
 * @author Ricardo Delgado
 */
function setListener(){

    var closer = document.getElementById('popup-closer');

    window.map.on('click', function(evt) {

        var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer){
                                return feature;
                        });

        if(feature){

            if(feature.get('features').length){ 

                if(feature.get('features').length < 2){

                    var data = feature.get('features')[0];

                    var node = {
                        title : data.get('title'),
                        coordinates : data.get('coordinates'),
                        properties : data.get('info')
                    }

                    drawDetails(node);
                    var geometry = feature.getGeometry();
                    var coord = geometry.getCoordinates();
                    overlay.setPosition(coord);
                }
            }
        }
    });

    closer.onclick = function() {
        clearLine();
        overlay.setPosition(undefined);
        closer.blur();
        return false;
    };

    var exportPNGElement = document.getElementById('export-png');

    if(exportPNGElement){ 

        if ('download' in exportPNGElement) {
            exportPNGElement.addEventListener('click', function() {
                
                map.once('postcompose', function(event) {
                    var canvas = event.context.canvas;
                    exportPNGElement.href = canvas.toDataURL('image/png');
                });

                map.renderSync();
            }, false);
        }
    }
}

/**
 * Erases all lines
 * @author Ricardo Delgado.
 */
function clearLine(){

    var layers = window.map.getLayers().getArray();

    while (layers.length > 2) {

        window.map.removeLayer(layers[2]);
        layers = map.getLayers().getArray();
    }
}

/**
 * creates connections with lines
 * @author Ricardo Delgado.
 * @param {array} lines lines to create
 */
function connectMarkers(lines) {
    
    var layerLines = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [new ol.Feature({
                    geometry: new ol.geom.MultiLineString(lines)
                })]
            }),
            style : new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#1A48EE',
                    width: 2
                })
            })
        });

    map.addLayer(layerLines);
}

/**
 * Draws the control panel
 * @author Miguelcldn
 * @returns {DOMObject} The div of the control panel
 */
function createControlPanel() {
    
    var createFilter = function(id, caption) {
        return '' + 
            '<td onclick="toggleFilter(\'' + id + '\')")"><div id="' + id + '-Filter">' +
            '<img id="' + id + '-logo" src="img/markers/' + id + '.svg"/>' +
            '<span id="' + id + '-caption">' + caption +
            '</span></div></td>';
    };
    
    // Create a div to hold the control.
    var controlDiv = document.createElement('div');
    controlDiv.className = 'controlDiv ol-unselectable ol-control';

    // Set CSS for the control border
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Options';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    
    /*controlText.innerHTML = '<input type="checkbox" value="NETWORK_NODE" checked onChange="toggleFilter(this)">Nodes</input><br>' +
        '<input type="checkbox" value="NETWORK_CLIENT" onChange="toggleFilter(this)">Clients</input><br>' + 
        '<input type="checkbox" value="actors" onChange="toggleFilter(this)">Actors</input>';*/
    
    //Create the filter options
    var options = "<table class='filter'>";
    
    options += "<tr>";
    options += createFilter('NETWORK_NODE', 'Nodes');
    options += createFilter('NETWORK_CLIENT', 'Devices');
    options += "</tr>";
    
    var pair = false;
    for(var i = 0; i < actorTypes.length; i++) {
        
        var actor = actorTypes[i];
        
        if(!pair) options += "<tr>";
        
        options += createFilter(actor.code, actor.label);
        
        if(pair) options += "</tr>";
        
        pair = !pair;
    }
    
    options += "<tr>";
    options += "<td onclick='toggleFilter(\"ALL\")'><div style='padding-left:30px'>All</div></td>";
    options += "<td onclick='toggleFilter(\"NONE\")'><div style='padding-left:30px'>None</div></td>";
    options += "</tr>";
    
    options += "</table>";
    
    controlText.innerHTML = options;
    controlUI.appendChild(controlText);
    
    return controlDiv;
}

/**
 * Draws the vis.js graphic
 * @author Miguelcldn
 * @param {Array} data The data to feed the dataset
 */
function createGraphic(data) {
    
    $("#loadingSpinner").css('display', 'none');
    
    var container = document.getElementById("historyGraphic");
    var groups = new vis.DataSet();
    var items = [];
    
    container.innerHTML = "";
    
    groups.add({id : 0, content: "Nodes"});
    groups.add({id : 1, content: "Devices"});
    
    for(var i = 0; i < data.length; i++) {
        var element = data[i];
        items.push({x: new Date(element.time), y: element.servers, group: 0});
        items.push({x: new Date(element.time), y: element.clients, group: 1});
    }
    
    var dataSet = new vis.DataSet(items);
    var options = {
        //style: 'bar',
        //stack: true,
        start: Date.now() - (3600 * 1000 * 20),
        end: Date.now(),
        drawPoints: false,
        orientation: 'top',
        dataAxis: {
            icons: false,
            left: {
                range: {
                    min: 0
                },
                title: {
                    text: "Connections"
                }
            }
        },
        legend: {
            enabled: true,
            left: {
                position: 'top-right'
            }
        },
        barChart: {
            width: 50,
            align: 'center',
            sideBySide: true
        }
    };
    
    var graph = new vis.Graph2d(container, dataSet, groups, options);
}

/**
 * Hides all markers from the map
 * @author Ricardo Delgado.
 * @param {Array} list The list of elements to hide
 */
function clearMarkers(list) {
    
    if(list === undefined) return;

    list.state = false;

    updateMarkers();
}


/**
 * updates all map markers.
 * @author Ricardo Delgado.
 */
function updateMarkers(){

    var features = [];

    for(var _layer in window.elements){

        if(window.elements[_layer].state)
            features = features.concat(window.elements[_layer].layers);
    }

    var layers = window.map.getLayers().getArray();

    if(layers.length > 0){

        while (layers.length > 1) {

            window.map.removeLayer(layers[1]);
            layers = window.map.getLayers().getArray();
        }

        window.map.addLayer(createLayer(features));
    }
    else{
        window.map.addLayer(createLayer(features));
    }
}

/**
 * creates the layer with the markers to the map
 * @author Ricardo Delgado.
 * @param {object} features It contains the map markers.
 * @returns {ol.layer.Vector} new layer to the map.
 */
function createLayer(features){

    var clusterSource = new ol.source.Cluster({
            distance: 40,
            source: new ol.source.Vector({ features: features })
    });

    var layer = new ol.layer.Vector({
                    source: clusterSource,
                    style: function(feature) {
                        return iconClusters(feature);
                    }
                });

    return layer;

    function iconClusters(features){

        var cluster = features.get('features');

        var size = cluster.length;

        var style;

        if(size > 1){

            var url;

            if(size <= 9)
                url = "img/markers/m1.png";
            else if(size >= 10 && size <= 24)
                url = "img/markers/m2.png";
            else if(size >= 25 && size <= 49)
                url = "img/markers/m3.png";
            else if(size >= 50 && size <= 149)
                url = "img/markers/m4.png";
            else
                url = "img/markers/m5.png";

            style = new ol.style.Style({
                image: new ol.style.Icon({
                        src: url,
                        scale: 1.5
                    }),
                text: new ol.style.Text({
                        text: size.toString(),
                        fill: new ol.style.Fill({
                        color: '#fff'
                    })
                })
            });
        }
        else{
            
            var url = cluster[0].get('icon');

            style = new ol.style.Style({
                image: new ol.style.Icon({
                        src: url,
                        scale: 0.25
                    })
                });
        }

        return style;
    }
}

/**
 * Creates the differents actor markers
 * @author Miguelcldn
 * @param {Array} actors The list of actors to extract the actors
 */
function createActors(actors) {
    
    var actorsList = {};

    var features = [];
    
    for(var i = 0; i < actors.length; i++) {
        
        var actor = actors[i];

        if(actor.location) {

            var actorType = actor.actorType;
            var actorHasMarker = searchActor(actorType) != -1;
            var title = (actorHasMarker) ? actorTypes[searchActor(actorType)].label : actorType;
            var url = "img/markers/";

            if(actorHasMarker) {

                url += actorType;

                url += ".svg";
                
                if(actor.location.latitude === 0 && actor.location.longitude === 0) {
                    actor.location = randomizeLocation(actor.location, 45, 120);
                }else{
                    actor.location = randomizeLocation(actor.location);
                }

                var coordinates = ol.proj.fromLonLat([actor.location.lng, actor.location.lat]);

                var list = (actorHasMarker) ? actorType : "OTHER";

                if(actorsList[list] === undefined) {
                    actorsList[list] = [];
                }

                actorsList[list].push(new ol.Feature({ 
                    geometry: new ol.geom.Point(coordinates),
                    title: title,
                    info: actor,
                    coordinates : coordinates,
                    icon: url
                }));  
            }
        }
    }

    for(var type in actorsList){

        if(window.elements[type] === undefined)
            window.elements[type] = { layers : [], state : true};

        window.elements[type].layers = actorsList[type];
    }
}

/**
 * Draws the Fermat Nodes
 * @author Miguelcldn
 * @param {Array} list Response from the server.
 * @param {string} title loading data.
 */
function createMarkers(list, title) {
    
    var features = [];
    
    for(var i = 0; i < list.length; i++) {
        var node = list[i];
		var url = (title === 'Node') ? "NETWORK_NODE.svg" : "NETWORK_CLIENT.svg";
        var location = node.location;
        
        if(location !== undefined && location.latitude !== undefined && location.longitude !== undefined) {
        
            if(location.latitude === 0 && location.longitude === 0) {
                location = randomizeLocation(location, 45, 120);
            }else {
                location = randomizeLocation(location, 0.1);
            }

            var coordinates = ol.proj.fromLonLat([location.lng, location.lat]);

            features.push(new ol.Feature({ 
                geometry: new ol.geom.Point(coordinates),
                title: title,
                info: node,
                coordinates : coordinates,
                icon: 'img/markers/'+url
            }));
        }
    }
    
    return features;
}

/**
 * Draws the node details in the map
 * @author Miguelcldn
 * @param {Object} node The node
 */
function drawDetails(node) {

    clearLine();
    
    var content = "";
    var details = null;
 
    if(node.title === "Node") {

        content += "<strong>IP:</strong> " + node.properties.lastIP + "<br/>" +
        "<strong>Clients:</strong> " + node.properties.conectedClients + "<br/><br/>";
        
        details = node.properties.networkServices;
        
        if(details) {
            
            content += "<strong>Network Services:</strong><br/>";
            
            content += "<table>";
            for(var ns in details) {
                content += "<tr><td>-" + window.helper.fromMACRO_CASE(ns) + ": " + details[ns] + "</td></tr>";
            }
            content += "</table>";
        }
        
        setClientsFocus(node);
    }
    else if(node.title === "Device") {
        
        /*Don't show ip
        if(node.extra.location.ip)
            content += "<strong>IP:</strong> " + node.extra.location.ip + "<br/>";*/
        
        details = node.properties.networkServices;
        
        if(details && details.length !== 0) {
            
            content += "<strong>Network Services:</strong><br/>";
            
            for(var i = 0; i < details.length; i++) {
                content += "-" + window.helper.fromMACRO_CASE(details[i]) + "<br/>";
            }
        }

        setServersFocus(node);
    }
    else if(searchActor(node.title) != -1) {
        content += "<strong>" + node.title + "</strong><br/>";
        
        if(node.properties.profile) {
            if(node.properties.profile.name) content += node.properties.profile.name + "<br/>";
            if(node.properties.profile.phrase) content += "Phrase: " + node.properties.profile.phrase + "<br/>";
            if(node.properties.profile.picture) {
                var mimeType = guessImageMime(node.properties.profile.picture);
                content += "<img class='profile-pic' src='data:" + mimeType + ";base64," + node.properties.profile.picture + "'/>";
            }
        }
    }
    else {
        content += "<strong>" + node.title + "</strong><br>No details available";
    }
    
    document.getElementById("popup-content").innerHTML = content;
    
}

/**
 * Draws the OpenLayers Map
 * @author Miguelcldn
 */
function drawMap() {
    
    layers.push(new ol.layer.Tile({ source: new ol.source.BingMaps({
        key: 'AkGbxXx6tDWf1swIhPJyoAVp06H0s0gDTYslNWWHZ6RoPqMpB9ld5FY1WutX8UoF',
        imagerySet: 'Road'
      })
    }));


    view = new ol.View({ center: [0, 0], zoom: 3 });

    var container = document.createElement('div');

    container.id = 'nsWindow';
    container.className = 'ol-popup';

    var content = '<a id="popup-closer" class="ol-popup-closer"></a>'+
                    '<div id="popup-content"></div>'

    container.innerHTML = content;


    overlay = new ol.Overlay(({
        element: container,
        autoPan: true,
        autoPanAnimation: {
          duration: 250
        }
      }));

    map = new ol.Map({
        layers: layers,
        target: 'map',
        overlays: [overlay],
        renderer: 'canvas',
        controls: ol.control.defaults().extend([
          new ol.control.FullScreen()
        ]),
        view: view
    });
    
    //Load the config file before loading anything else
    $.ajax({
        url: "json/actorTypes.json",
        method: "GET",
        crossDomain: true,
        success: function(list) {

            window.actorTypes = list.actors;

            for(var i = 0; i < actorTypes.length; i++) {
                elements[actorTypes[i].code] = {layers : [], state : true};
            }

            getNodes();
        },
        error: function(request, error) {
            window.alert("Could not retrieve the data, see console for details.");
            window.console.dir(error);
        }
        
    });
}

/**
 * Gets the actors from a server
 * @author Miguelcldn
 * @param {Array} nodeList The list of servers
 * @param {Function} callback Function to call when finished
 */
function getActors(nodeList, callback) {
    var success = function(list) {
        createActors(list);
        callback();
    };
    var error = function(request, error) {
        window.alert("Could not retrieve the data, see console for details.");
        window.console.dir(error);
        success([]);
    };
    
    for(var i = 0; i < nodeList.length; i++) {
    
        $.ajax({
            url : window.helper.getAPIUrl("actors", {serv_id : nodeList[i]._id}),
            //url : "json/dummyClients.json",
            method: "GET",
            crossDomain: true,
            success : success,
            error : error
        });
    }
}

/**
 * Based on the nodes IDs, load the clients
 * @author Miguelcldn
 * @param {Array} nodeList Array of nodes to extract the IDs
 * @param {Function} callback Function to call when finished
 */
function getClients(nodeList, callback) {
    
    var success = function(list) {
        window.elements.NETWORK_CLIENT.layers = createMarkers(list, "Device");
        callback();
    };
    var error = function(request, error) {
        window.alert("Could not retrieve the data, see console for details.");
        window.console.dir(error);
        success([]);
    };
    
    for(var i = 0; i < nodeList.length; i++) {
    
        $.ajax({
            url : window.helper.getAPIUrl("clients", {serv_id : nodeList[i]._id}),
            //url : "json/dummyClients.json",
            method: "GET",
            crossDomain: true,
            success : success,
            error : error
        });
    }

   document.body.appendChild(createControlPanel());
}

/**
 * Calls the API server for the nodes data
 * @author Miguelcldn
 */
function getNodes() {
    
    $.ajax({
        url : window.helper.getAPIUrl("servers"),
        //url : "json/dummyServrs.json",
        method: "GET",
        crossDomain: true,
        success : function(list) {

            window.elements.NETWORK_NODE.layers = createMarkers(list, "Node");

            getClients(list, function(){
                getActors(list,function(){
                    updateMarkers();
                    setListener();
                });
            });
        },
        error : function(request, error) {
            window.alert("Could not retrieve the data, see console for details.");
            window.console.dir(error);
        }
    });
}

/**
 * Guesses the image's mime-type
 * @author Miguelcldn
 * @param   {string} data The base64-encoded string
 * @returns {string} The mime-type
 */
function guessImageMime(data){
    if(data.charAt(0)=='/') { return "image/jpeg"; }
    else if(data.charAt(0)=='R') { return "image/gif"; }
    else if(data.charAt(0)=='i') { return "image/png"; }
}

/**
 * Entry point
 * @author Miguelcldn
 */
function main() {
    $("#showHistoryBtn").click(showHistory);
    drawMap();
}

/**
 * Sets a random position of a point
 * @author Miguelcldn
 * @param   {object} location             The source location
 * @param   {number} [distance=1]         The radious or latitude range
 * @param   {number} [distanceX=distance] The longitude range
 * @returns {object} A LatLng literal
 */
function randomizeLocation(location, distance, distanceX) {
    
    distance = distance || 1;
    distanceX = distanceX || distance;
    
    return {
        lat : location.latitude + ((Math.random() * distance * 2- (distance))),
        lng : location.longitude + ((Math.random() * distanceX * 2 - (distanceX)))
    };
}

/**
 * Looks for an actor in the actors list
 * @author Miguelcldn
 * @param   {string} actorType The actor type code
 * @returns {number} The position of the actor in the list or -1 if not found
 */
function searchActor(actorType) {
    for(var p = 0; p < actorTypes.length; p++) {
        if(actorTypes[p].code === actorType || actorTypes[p].label === actorType) {
            return p;
        }
    }

    return -1;
}

/**
 * Links the clients with the server
 * @author Miguelcldn
 * @param {object} node The server to use as center
 */
function setClientsFocus(node) {

    if(window.elements.NETWORK_CLIENT.state){ 

        var lines = [];

        for(var i = 0; i < elements.NETWORK_CLIENT.layers.length; i++) {

            var client = window.elements.NETWORK_CLIENT.layers[i].get('info');
            
            if(client._serv_id === node.properties._id) {

                var cliLocation = window.elements.NETWORK_CLIENT.layers[i].get('coordinates');
                var serLocation = node.coordinates;
                lines.push([cliLocation, serLocation]);
            }
        }

        connectMarkers(lines);
    }
}

/**
 * Links the servers with the client
 * @author Miguelcldn
 * @param {object} client The client to use as center
 */
function setServersFocus(client) {

    if(window.elements.NETWORK_NODE.state){ 

        var lines = [];

        for(var i = 0; i < elements.NETWORK_NODE.layers.length; i++) {
            var server = elements.NETWORK_NODE.layers[i].get('info');
            
            if(server._id === client.properties._serv_id) {
                var serLocation = window.elements.NETWORK_NODE.layers[i].get('coordinates');
                var cliLocation = client.coordinates;
                lines.push([cliLocation, serLocation]);
            }
        }

        connectMarkers(lines);
    }
}

/**
 * Gets and shows the nodes history
 * @author Miguelcldn
 */
function showHistory() {
    
    $("#loadingSpinner").css('display', 'block');
    
    $.ajax({
        url: window.helper.getAPIUrl("history"),
        method: "GET",
        crossDomain: true,
        success: createGraphic,
        error: function(r, error) {
            window.alert("Could not retrieve the data, see console for details.");
            window.console.dir(error);
        }
    });
}

/**
 * Shows the markers in the map
 * @author Miguelcldn
 * @param {Array} list The list of elements to show
 */
function showMarkers(list) {
    
    if(list === undefined) return;
    
    list.state = true;

    updateMarkers();
}

/**
 * Hides or shows the nodes (Event)
 * @author Miguelcldn
 * @param {string}  id            The ID of the filter to toggle
 * @param {boolean} [forcedState] If provided, the forced state about enable/disable
 */
function toggleFilter(id, forcedState) {
    
    var list, caption, logo, enable, action, iterator;
    
    switch(id) {
        case 'ALL':
            
            for(iterator in window.elements) {
                toggleFilter(iterator, true);
            }
            break;
            
        case 'NONE':
            
            for(iterator in window.elements) {
                toggleFilter(iterator, false);
            }
            break;
            
        default:

            list = window.elements[id];
            caption = $('#' + id + '-caption');
            logo = $('#' + id + '-logo');
            enable = (forcedState === undefined) ? caption.hasClass('disabled') : forcedState;

            action = (enable) ? showMarkers : clearMarkers;
            var classOperation = '';

            if(forcedState === true) classOperation = 'removeClass';
            else if(forcedState === false) classOperation = 'addClass';
            else classOperation = 'toggleClass';
            
            caption[classOperation]('disabled');
            logo[classOperation]('disabled');

            action(list);
    }
    
    overlay.setPosition(undefined);
}

