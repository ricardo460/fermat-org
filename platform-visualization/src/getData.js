var tileManager = new TileManager();
//var URL = "get_plugins.php";
//var URL = "http://52.11.156.16:3000/repo/comps";

function getData() {
    animate();
    $.ajax({
        url: "http://52.11.156.16:3000/repo/comps?access_token=561fd1a5032e0c5f7e20387d",
        method: "GET"
    }).success(
        function (lists) {
            tileManager.fillTable(lists);
            window.browserManager.createButton();
            TWEEN.removeAll();
            logo.stopFade();
            init();
        });
/*setTimeout(function(){
        var l = JSON.parse(testData);

        tileManager.fillTable(l);
    browserManager.createButton();
        TWEEN.removeAll();

        logo.stopFade();

        init();

    }, 6000);*/
}