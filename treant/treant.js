'use strict';

var map,
    markClusterer,
    nodes = [],
    clients = [],
    infoWindow = null;

$(document).ready(main);

function main() {
    $("#showHistoryBtn").click(showHistory);
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
    
    getNodes();
}

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
 * Calls the API server for the nodes data
 * @author Miguelcldn
 */
function getNodes() {
    
    $.ajax({
        url : window.helper.getAPIUrl("servers"),
        method: "GET",
        crossDomain: true,
        success : function(list) {
            createNodes(list);
            //createClients(list);
        },
        error : function(request, error) {
            window.alert("Could not retrieve the data, see console for details.");
            window.console.dir(error);
        }
    });
    
//    createNodes(loadTestData());
//    createClients(loadTestData());
}

function createClients(list) {
    var setListener = function(node) {
        node.marker.addListener('click', function() {drawDetails(node);});
    };
    
    for(var i = 0; i < list.length; i++) {
        var node = list[i];
        
        var marker = new google.maps.Marker({
            label : "Client",
            position : {lat : node.extra.location.latitude, lng : node.extra.location.longitude}
        });
        
        node.marker = marker;
        clients.push(node);
        
        setListener(node);
    }
}

/**
 * Draws the Fermat Nodes
 * @author Miguelcldn
 * @param {Array} list Response from the server
 */
function createNodes(list) {
    
    var setListener = function(node) {
        node.marker.addListener('click', function() {drawDetails(node);});
    };
    
    for(var i = 0; i < list.length; i++) {
        var node = list[i];
        
        var marker = new google.maps.Marker({
            label : "Node",
            position : {lat : node.extra.location.latitude, lng : node.extra.location.longitude}
        });
        
        node.marker = marker;
        nodes.push(node);
        markClusterer.addMarker(marker);
        
        setListener(node);
    }
}

/**
 * Draws the node details in the map
 * @author Miguelcldn
 * @param {Object} node The node
 */
function drawDetails(node) {
    
    if(infoWindow !== null) infoWindow.close();
    
    var content = "";
    
    if(node.marker.label === "Node") {
        content = "<div>" +
        "<strong>IP:</strong> " + node.extra.location.ip + "<br/>" +
        "<strong>Registered client connections:</strong> " + node.extra.current.registeredClientConnection + "<br/>" +
        "</div>";
    }
    else {
        content = "<div>" +
        "<strong>IP:</strong> " + node.extra.location.ip + "<br/>" +
        "</div>";
    }
    
    infoWindow = new google.maps.InfoWindow({
        content : content
    });
    
    infoWindow.open(map, node.marker);
}

function showHistory() {
    
    $("#loadingSpinner").css('display', 'block');
    
    $.ajax({
        url: window.helper.getAPIUrl("history"),
        method: "GET",
        success: createGraphic,
        error: function(r, error) {
            window.alert("Could not retrieve the data, see console for details.");
            window.console.dir(error);
        }
    });
}

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

function clearMarkers(list) {
    
    for(var i = 0; i < list.length; i++) {
        markClusterer.removeMarker(list[i].marker, true);
    }
    
    markClusterer.resetViewport();
    markClusterer.redraw();
}

function showMarkers(list) {
    for(var i = 0; i < list.length; i++) {
        markClusterer.addMarker(list[i].marker, true);
    }
    
    markClusterer.resetViewport();
    markClusterer.redraw();
}

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
    controlText.innerHTML = '<input type="checkbox" value="nodes" checked onChange="onOptionChanged(this)">Nodes</input><br>'+
        '<input type="checkbox" value="clients" onChange="onOptionChanged(this)">Clients</input>';
    controlUI.appendChild(controlText);
    
    return controlDiv;
}

function onOptionChanged(cb) {
    var list = (cb.value === "nodes") ? window.nodes : window.clients,
        action = (cb.checked === true) ? showMarkers : clearMarkers;
    
    action(list);
}