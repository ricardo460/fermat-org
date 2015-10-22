
var tileManager = new TileManager();
//var URL = "get_plugins.php";
//var URL = "http://52.11.156.16:3000/repo/comps";

function getData() {
    
    animate();
    
   /*$.ajax({
        url: "http://52.11.156.16:3000/repo/comps",
        method: "GET"
    }).success(
        function(lists) {
        
            window.loadMap();
            
            tileManager.fillTable(lists);

            TWEEN.removeAll();

            logo.stopFade();

            init();
        });*/
    
    
    setTimeout(function(){
        var l = JSON.parse(testData);
        
        window.loadMap();

        tileManager.fillTable(l);

        TWEEN.removeAll();

        logo.stopFade();

        init();

    }, 6000);
}