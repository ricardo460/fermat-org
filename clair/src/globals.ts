class Globals{
    layers = Constants.layers;
    platforms = Constants.platforms;
    superLayers = Constants.superLayers;
    map: Map;
    tilesQtty = [];
    TABLE = {};
    camera;
    scene = new THREE.Scene();
    renderer;
    actualView;
    stats = null;
    headersUp = false;
    currentRender = "start";
    disconnected = false;
    //Class
    tileManager;
    logo;
    signLayer;
    developer;
    api;
    workFlowEdit = null;
    session = null;
    tableEdit = null;
    fieldsEdit = null;
    browserManager = null;
    screenshotsAndroid = null;
    headers: Headers = null;
    workFlowManager = null;
    viewManager = null;
    networkViewer = null;
    buttonsManager = null;
    guide = null;
    dragManager = null;
    //Global constants
    TILE_DIMENSION = {
        width : 231,
        height : 140
    };
    TILE_SPACING = 20;

    init() {
        this.tileManager = new TileManager();
        this.logo = new Logo();
        this.signLayer = new SignLayer();
        this.developer = new Developer();
        this.api = new API();
    }
};