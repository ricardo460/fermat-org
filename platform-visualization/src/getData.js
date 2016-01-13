var tileManager = new TileManager();
//var URL = "get_plugins.php";
//var URL = "http://52.11.156.16:3000/repo/comps";

function getData() {
    animate();
    
    var url = window.helper.getAPIUrl("comps");
    
    //url += "?env=development"; //When needed the development branch, for lab.fermat.org
    
 $.ajax({
        url: url,
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

//Use when you don't want to connect to server
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