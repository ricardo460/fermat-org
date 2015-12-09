function ClientsViewer(parentNode) {
    
    BaseNetworkViewer.call(this);
}

ClientsViewer.prototype = Object.create(BaseNetworkViewer.prototype);
ClientsViewer.prototype.constructor = ClientsViewer;