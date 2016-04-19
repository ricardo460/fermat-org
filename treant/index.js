var map,
    markClusterer;

/**
 * Draws the Google Map
 * @author Miguelcldn
 */
function drawMap() {
    'use strict';
    
    window.map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 14.1847114, lng: -12.1965342},
        zoom: 3
    });
    
    window.markClusterer = new MarkerClusterer(window.map);
    
    drawNodes();
}

/**
 * Draws the Fermat Nodes
 * @author Miguelcldn
 */
function drawNodes() {
    'use strict';
    
    //Ask for servers and/or clients
}