
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

            TWEEN.removeAll();

            logo.stopFade();

            init();
        });
    
    
    /*setTimeout(function(){
        var l = JSON.parse(testData);

        viewManager.fillTable(l);

        TWEEN.removeAll();

        logo.stopFade();

        init();

    }, 6000);*/

    //Simulacion pre carga y post carga de logo
    /*$('#idCanvas').fadeTo(6000, 0, function() {
        $('#idCanvas').remove();
        TWEEN.removeAll();
        init();
        //setTimeout( animate, 500);
        animate();
    });*/
}