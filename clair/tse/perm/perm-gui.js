var user_data = getUserID(),
    axs_key = '',
    environment = '';
//global constants
var SERVER = 'http://api.fermat.org';

function init() {
    if(user_data._id === ''){
        window.alert("Error. Please login first or request authorization to use this module");
        window.location.replace(window.location.href.replace(window.location.pathname, ''));
    }
    else{

        switch(window.location.href.match("//[a-z0-9]*")[0].replace("//", '')) {
            case "dev":
                environment = 'production';
                break;
            case "lab":
                environment = 'development';
                break;
            case "3d":
                environment = 'testing';
                break;
        }

        environment = 'production';
        axs_key = user_data.axs_key;

        getUsers();

        setTimeout(function (){
                document.getElementById('spinner').style.display = 'none';
                $('#users').removeClass('hidden');
        }, 3000);
    }
}

function getUsers(){

    var url = getRoute('users');

    $.ajax({
        url: url,
        method: "GET"
    }).success (
        function (res) {
            fillTable(res);
        }
    );
}

function fillTable(data){

    var i,
        l = data.length;

    for(i = 0; i < l; i++){
        if(data[i].name !== null)
            $('#users').append("<tr><td>" + data[i].usrnm + "</td><td>" + data[i].name + "</td><td>" + "<button id='" + i + "' name='perm: " + data[i].usrnm + "' onclick=''>Modify</button>" + "</td></tr>");
        else
            $('#users').append("<tr><td>" + data[i].usrnm + "</td><td>" + "</td><td>" + "<button id='" + i + "' name='perm: " + data[i].usrnm + "' onclick=''>Modify</button>" + "</td></tr>");
    }
}

function getRoute(route){

    var tail = "",
        param,
        url;

    if(route === 'users')
        tail = "/v1/repo/devs";
    
    param = {
        env : environment,
        axs_key : axs_key
    };

    url = SERVER.replace('http://', '') + tail;
    url = 'http://' + self.buildURL(url, param);
    return url;
}

    /**
     * Build and URL based on the address, wildcards and GET parameters
     * @param   {string} base   The URL address
     * @param   {Object} params The key=value pairs of the GET parameters and wildcards
     * @returns {string} Parsed and replaced URL
     */
function buildURL(base, params) {

        var result = base;
        var areParams = (result.indexOf('?') !== -1);   //If result has a '?', then there are already params and must append with &

        var param = null;

        if(params == null) params = {};

        params.env = environment;

        //Search for wildcards parameters
        do {

            param = result.match(':[a-z0-9]+');

            if(param !== null) {
                var paramName = param[0].replace(':', '');

                if(params.hasOwnProperty(paramName) && params[paramName] !== undefined) {

                    result = result.replace(param, params[paramName]);
                    delete(params[paramName]);

                }
            }
        } while(param !== null);

        //Process the GET parameters
        for(var key in params) {
            if(params.hasOwnProperty(key) && params[key] !== '') {

                if(areParams === false)
                    result += "?";
                else
                    result += "&";

                result += key + ((params[key] !== undefined) ? ("=" + params[key]) : (''));

                areParams = true;
            }
        }

        return result;
}

function getUserID() {
        var _usr_id = {
                __v : getCookie("v"),
                _id : '571a619a3f372f8e2574f0d1',
                avatar_url : getCookie("avatar"),
                axs_key : '571a619a3f372f8e2574f0cf',
                email : getCookie("email"),
                github_tkn : getCookie("github"),
                name : getCookie("name"),
                upd_at : getCookie("update"),
                usrnm : getCookie("usrnm")
        };
        return _usr_id;
    }

function getCookie(name) {
        var cname = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while(c.charAt(0) === ' ')
                c = c.substring(1);
            if(c.indexOf(cname) === 0)
                return c.substring(cname.length, c.length);
        }
        return "";
}

String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

init();
