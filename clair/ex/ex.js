$(document).ready(function() {
    var getRoute = function() {
        var param = {
            environment: API_ENV
        };
        var url = window.helper.SERVER.replace('http://', '') + '/v1/ex/ticker';
        url = 'http://' + window.helper.buildURL(url, param);
        return url;
    }

    var isNumber = function(num) {
        return !isNaN(num);
    }

    $("#sub").click(function() {
        var price = document.getElementById('price').value;
        var pass = document.getElementById("pass").value;

        if (!isNumber(price)) {
            alert("Price must be a number");
            return;
        }
        if (pass.length === 0) {
            alert("A password is required");
            return;
        }

        $.ajax({
            method: 'POST',
            url: getRoute(),
            data: {
                'price': price,
                'pass': pass
            }
        }).success(function(res) {
            alert("Exchange modified succesfully");
        }).error(function(res) {
            alert(res.responseJSON.message || "Error");
        });
    });
});
