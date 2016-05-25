'use strict';

var map,
    markClusterer,
    elements = {
        nodes : [],
        clients : [],
        actors : {}
    },
    infoWindow = null,
    actorTypes = {};

$(document).ready(main);

/**
 * Draws the control panel
 * @author Miguelcldn
 * @returns {DOMObject} The div of the control panel
 */
function createControlPanel() {
    // Create a div to hold the control.
    var controlDiv = document.createElement('div');

    // Set CSS for the control border
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.cursor = 'pointer';
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
    controlText.innerHTML = '<input type="checkbox" value="nodes" checked onChange="onOptionChanged(this)">Nodes</input><br>' +
        '<input type="checkbox" value="clients" onChange="onOptionChanged(this)">Clients</input>';
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
    groups.add({id : 1, content: "Clients"});
    
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
 * @author Miguelcldn
 * @param {Array} list The list of elements to hide
 */
function clearMarkers(list) {
    
    for(var i = 0; i < list.length; i++) {
        if(list[i].marker !== undefined)
            markClusterer.removeMarker(list[i].marker, true);
    }
    
    markClusterer.resetViewport();
    markClusterer.redraw();
}

/**
 * Creates the differents actor markers
 * @author Miguelcldn
 * @param {Array} clients The list of clients to extract the actors
 */
function createActors(clients) {
    
    var actorsList = {};
    
    var setListener = function(act) {
        act.marker.addListener('click', function() {drawDetails(act);});
    };
    
    for(var i = 0; i < clients.length; i++) {
        
        var comps = clients[i].extra.comps;
        
        if(comps) {
            for(var j = 0; j < comps.length; j++) {
                
                var comp = comps[i];
                
                if(comp.location) {
                    
                    var actorType = ((comp.networkServiceType !== "UNDEFINED") ? comp.networkServiceType : comp.platformComponentType) || "UNDEFINED";
                    var title = window.helper.fromMACRO_CASE(actorType);
                    var actorHasMarker = actorTypes.clients.actors.indexOf(actorType) != -1;
                    var url = "img/actors/";
                    
                    if(actorHasMarker) {
                        url += actorType;
                    }
                    else {
                        url += "generic";
                        window.console.log("Found generic actor: " + actorType);
                    }
                    
                    url += ".svg";
                    
                    
                    var marker = new google.maps.Marker({
                        title : title,
                        position : {lat : comp.location.latitude, lng : comp.location.longitude},
                        icon : {
                            url : url,
                            scaledSize: new google.maps.Size(30, 30)
                        }
                    });
                    
                    var actor = {
                        indentityPublicKey : comp.identityPublicKey,
                        networkServiceType : comp.networkServiceType,
                        type : actorType
                    };
                    
                    if(comp.extraData) actor.extraData = JSON.parse(comp.extraData);
                    if(comp.alias) actor.alias = comp.alias;
                    
                    actor.marker = marker;
                    
                    if(window.elements.actors[actorType] !== undefined) window.elements.actors[actorType] = [];
                    
                    window.elements.actors[actorType].push(actor);
                    setListener(actor);
                }
            }
        }
    }
}

/**
 * Draws the Fermat Nodes
 * @author Miguelcldn
 * @param {Array} list Response from the server
 */
function createMarkers(list, title) {
    
    var newNodes = [];
    
    var setListener = function(node) {
        node.marker.addListener('click', function() {drawDetails(node);});
    };
    
    for(var i = 0; i < list.length; i++) {
        var node = list[i];
        
        if(node.extra !== undefined && node.extra.location !== undefined && node.extra.location.latitude !== undefined && node.extra.location.longitude !== undefined) {
            var marker = new google.maps.Marker({
                title : title,
                position : {lat : node.extra.location.latitude, lng : node.extra.location.longitude},
                icon : {
                    url : "img/test.svg",
                    scaledSize: new google.maps.Size(30, 30)
                },
            });
            
            node.marker = marker;
            setListener(node);
        }
        
        
        newNodes.push(node);
    }
    
    return newNodes;
}

/**
 * Draws the node details in the map
 * @author Miguelcldn
 * @param {Object} node The node
 */
function drawDetails(node) {
    
    if(infoWindow !== null) infoWindow.close();
    
    var content = "";
    var details = null;
    
    content += "<div class='info-window'>";
    
    if(node.marker.title === "Node") {
        content = "<strong>IP:</strong> " + node.extra.location.ip + "<br/>" +
        "<strong>Clients:</strong> " + node.extra.current.registeredClientConnection + "<br/><br/>";
        
        details = node.extra.current.registeredNetworkServiceDetail;
        
        if(details) {
            
            content += "<strong>Network Services:</strong><br/>";
            
            content += "<table>";
            for(var ns in details) {
                content += "<tr><td>-" + window.helper.fromMACRO_CASE(ns) + ": " + details[ns] + "</td></tr>";
            }
            content += "</table>";
        }
    }
    else if(node.marker.title === "Client") {
        
        if(node.extra.location.ip)
            content += "<strong>IP:</strong> " + node.extra.location.ip + "<br/>";
        
        details = node.extra.comps;
        
        if(details && details.length !== 0) {
            
            content += "<strong>Network Services:</strong><br/>";
            
            for(var i = 0; i < details.length; i++) {
                if(details[i].networkServiceType !== "UNDEFINED")
                    content += "-" + window.helper.fromMACRO_CASE(details[i].networkServiceType) + "<br/>";
            }
        }
    }
    else if(actorTypes.clients.actors.indexOf(node.marker.title) != -1) {
        content += "<strong>" + node.type + "</strong><br/>";
        
        if(node.alias) content += node.alias + "<br/>";
        if(node.extraData) {
            if(node.extraData.PHRASE) content += "Phrase: " + node.extraData.PHRASE + "<br/>";
            if(node.extraData.AVATAR_IMG) content += ""; //Show profile picture;
        }
    }
    else {
        content = "No details available";
    }
    
    content += "</div>";
    
    infoWindow = new google.maps.InfoWindow({
        content : content
    });
    
    infoWindow.open(map, node.marker);
    
}

/**
 * Draws the Google Map
 * @author Miguelcldn
 */
function drawMap() {
    
    window.map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 14.695393959866866, lng: 9.029051737500042},
        zoom: 2
    });
    
    window.markClusterer = new MarkerClusterer(window.map);
    window.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(createControlPanel());
    
    //Load the config file before loading anything else
    $.ajax({
        url: "json/actorTypes.json",
        method: "GET",
        crossDomain: true,
        success: function(list) {
            window.actorTypes = list;
            getNodes();
        },
        error: function(request, error) {
            window.alert("Could not retrieve the data, see console for details.");
            window.console.dir(error);
        }
        
    });
}

function getActors(clientList) {
    var actorList = {};
    
    
}

/**
 * Based on the nodes IDs, load the clients
 * @author Miguelcldn
 * @param {Array} nodeList Array of nodes to extract the IDs
 */
function getClients(nodeList) {
    
    var success = function(list) {
        window.elements.clients = createMarkers(list, "Client");
        getActors(list);
    };
    
    var error = function(request, error) {
        window.alert("Could not retrieve the data, see console for details.");
        window.console.dir(error);
    };
    
    for(var i = 0; i < nodeList.length; i++) {
    
        $.ajax({
            //url : window.helper.getAPIUrl("clients", {serv_id : nodeList[i]._id}),
            url : "json/dummyClients.json",
            method: "GET",
            crossDomain: true,
            success : success,
            error : error
        });
    }
}

/**
 * Calls the API server for the nodes data
 * @author Miguelcldn
 */
function getNodes() {
    
    $.ajax({
        //url : window.helper.getAPIUrl("servers"),
        url : "json/dummyServrs.json",
        method: "GET",
        crossDomain: true,
        success : function(list) {
            window.elements.nodes = createMarkers(list, "Node");
            showMarkers(window.elements.nodes);
            getClients(list);
        },
        error : function(request, error) {
            window.alert("Could not retrieve the data, see console for details.");
            window.console.dir(error);
        }
    });
    
//    createMarkers(loadTestData());
//    createClients(loadTestData());
}

/**
 * Loads test data
 * @author Miguelcldn
 * @returns {object} The thest data
 */
function loadTestData() {
    var list = [],
        MAX_LAT = 50,
        MAX_LNG = 150,
        getLatLng = function() {
            return { latitude: Math.random() * MAX_LAT * 2.5 - MAX_LAT, longitude : Math.random() * MAX_LNG * 2 - MAX_LNG};
        },
        getIP = function() {
            return Math.floor(Math.random() * 255) +"."+ Math.floor(Math.random() * 255) +"."+ Math.floor(Math.random() * 255) +"."+ Math.floor(Math.random() * 255);
        },
        getNumber = function(){
            return Math.floor(Math.random() * 30);
        };
    
    for(var i = 0; i < 500; i++) {
        var location = getLatLng();
        location.ip = getIP();
        
        list.push({
            extra : {
                location : location,
                current : {
                    registeredClientConnection : getNumber()
                }
            }
        });
    }
    
    return list;
}

/**
 * Entry point
 * @author Miguelcldn
 */
function main() {
    $("#showHistoryBtn").click(showHistory);
}

/**
 * Hides or shows the nodes (Event)
 * @author Miguelcldn
 * @param {DOMObject} cb The combobox
 */
function onOptionChanged(cb) {
    var list = (cb.value === "nodes") ? window.elements.nodes : window.elements.clients,
        action = (cb.checked === true) ? showMarkers : clearMarkers;
    
    action(list);
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
    for(var i = 0; i < list.length; i++) {
        if(list[i].marker !== undefined)
            markClusterer.addMarker(list[i].marker, true);
    }
    
    markClusterer.resetViewport();
    markClusterer.redraw();
}