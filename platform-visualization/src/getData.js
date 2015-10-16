
var viewManager = new ViewManager();
//var URL = "get_plugins.php";
//var URL = "http://52.11.156.16:3000/repo/comps";

function getData() {
    
    animate();
    
    $.ajax({
        url: "http://52.11.156.16:3000/repo/comps",
        method: "GET"
    }).success(
        function(lists) {
            viewManager.fillTable(lists);
            browserManager.createButton();
            TWEEN.removeAll();

            logo.stopFade();

            init();
        });
    
    
    /*setTimeout(function(){
        var l = JSON.parse(testData);

        viewManager.fillTable(l);
    browserManager.createButton();
        TWEEN.removeAll();

        logo.stopFade();

        init();

    }, 6000);*/
}