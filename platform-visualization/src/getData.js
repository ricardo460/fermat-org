
var viewManager = new ViewManager();

function getData() {
    $.ajax({
        url: "get_plugins.php",
        method: "GET"
    }).success(
        function(lists) {
            var l = JSON.parse(lists);
            viewManager.fillTable(l);
            $('#splash').fadeTo(2000, 0, function() {
                $('#splash').remove();
                init();
                //setTimeout(animate, 500);
                animate();
            });
        }
    );

    /*var l = JSON.parse(testData);

        viewManager.fillTable(l);

        $('#splash').fadeTo(2000, 0, function() {
                $('#splash').remove();
                init();
                //setTimeout( animate, 500);
                animate();
            });*/
}