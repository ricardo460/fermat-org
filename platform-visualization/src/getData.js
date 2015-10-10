
var viewManager = new ViewManager();
var URL = "get_plugins.php";
//var URL = "http://52.11.156.16:3000/repo/comps";

function getData() {
    /*$.ajax({
        url: URL,
        method: "GET"
    }).success(
        function(lists) {
            //console.dir(lists);
            //var l = JSON.parse(lists);
            viewManager.fillTable(lists);
            $('#splash').fadeTo(2000, 0, function() {
                $('#splash').remove();
                init();
                //setTimeout(animate, 500);
                animate();
            });
        }
    );*/

    
    animate();
    setTimeout(function(){
        var l = JSON.parse(testData);

        viewManager.fillTable(l);

        TWEEN.removeAll();

        logo.animatestopWalletLogo();
        logo.animatestopFarmatlogo();

        init();

    }, 6000);

    //Simulacion pre carga y post carga de logo
    /*$('#idCanvas').fadeTo(6000, 0, function() {
        $('#idCanvas').remove();
        TWEEN.removeAll();
        init();
        //setTimeout( animate, 500);
        animate();
    });*/
}