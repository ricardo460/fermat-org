'use strict';

var map,
    markClusterer,
    nodes = [],
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
        center: {lat: 45.64875223755158, lng: 5.864989237500002},
        zoom: 2
    });
    
    window.markClusterer = new MarkerClusterer(window.map);
    
    getNodes();
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
        success : drawNodes,
        error : function(request, error) {
            window.alert("Could not retrieve the data, see console for details.");
            window.console.dir(error);
        }
    });
}

/**
 * Draws the Fermat Nodes
 * @author Miguelcldn
 * @param {Array} list Response from the server
 */
function drawNodes(list) {
    
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
    
    infoWindow = new google.maps.InfoWindow({
        content : "<div>" +
        "<strong>IP:</strong> " + node.extra.location.ip + "<br/>" +
        "<strong>Registered client connections:</strong> " + node.extra.current.registeredClientConnection + "<br/>" +
        "</div>"
    });
    
    infoWindow.open(map, node.marker);
}

function showHistory() {
    
}