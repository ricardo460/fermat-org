var tileManager = new TileManager();
//var URL = "get_plugins.php";
//var URL = "http://52.11.156.16:3000/repo/comps";

function getData() {
    animate();
    
 $.ajax({
        url: "http://52.35.117.6:3000/repo/comps?access_token=561fd1a5032e0c5f7e20387d",
        //url: "http://52.35.117.6:3000/repo/comps?access_token=561fd1a5032e0c5f7e20387d&env=development",
        method: "GET"
    }).success(
        function (lists) {
        
            window.loadMap(function() {
        
                window.preLoad(function() {
                    tileManager.fillTable(lists);

                    TWEEN.removeAll();
                    window.logo.stopFade();
                    init();
                });
            });
        });

/*setTimeout(function(){
        var l = JSON.parse(testData);
        
        window.preLoad(function() {
        
                window.loadMap(function() {
                    tileManager.fillTable(l);

                    TWEEN.removeAll();
                    logo.stopFade();
                    init();
                });
            });

    }, 6000);*/
}