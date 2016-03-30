//global variables
var USERDATA = '',
	AXS_KEY = '',
    ENV = 'production';
//global constants
var SERVER = 'http://api.fermat.org';

function init() {

    switch(window.location.href.match("//[a-z0-9]*")[0].replace("//", '')) {
        case "dev":
            ENV = 'production';
            break;
        case "lab":
            ENV = 'development';
            break;
        case "3d":
            ENV = 'testing';
            break;
    }

    USERDATA = getUserID();
    AXS_KEY = USERDATA.axs_key;

    $(document).ready(function() {
        var current = '';

        function getActiveForm() {
            if (current === 'layer') {
                return $('#layerForm');
            } else {
                return $('#spForm');
            }
        }

        function sel() {
            if (current === 'superlayer') {
                $('#listLayer').addClass('hidden');
                $('#listSuperlayer').removeClass('hidden');
                $('#listPlatform').addClass('hidden');
            } else if (current === 'platform') {
                $('#listLayer').addClass('hidden');
                $('#listSuperlayer').addClass('hidden');
                $('#listPlatform').removeClass('hidden');
            } else {
                $('#listLayer').removeClass('hidden');
                $('#listSuperlayer').addClass('hidden');
                $('#listPlatform').addClass('hidden');
            }
        }

        function clearSpForm() {
            $('#spCode').html('');
            $('#spName').html('');
            $('#spLogo').html('');
            $('#spOrder').html('');
        }

        function clearLayerForm() {
            $('#layerName').html('');
            $('#layerSuperlayer').html('');
            $('#layerOrder').html('');
        }

        function hideLists() {
            $('#listLayer').addClass('hidden');
            $('#listSuperlayer').addClass('hidden');
            $('#listPlatform').addClass('hidden');
        }

        function showForm(id) {
            $(id).removeClass('hidden');
        }

        function hideForm(id) {
            $(id).addClass('hidden');
        }

        $('#type').change(function() {
            current = this.value;
            sel();
        });

        $('#type').bind('keydown', function(event) {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                current = this.value;
                sel();
            }
        });

        $('#add').click(function() {
            hideLists();
            $('#type').prop('disabled', true);
            $('#add').prop('disabled', true);

            if (current === 'layer') {
                showForm('#layerForm');
                clearLayerForm();
            } else {
                showForm('#spForm');
                clearSpForm();
            }
        });

        $('#cancel').click(function() {
            clearSpForm();
            clearLayerForm();
            hideForm(getActiveForm());
        });

        clearSpForm();
        clearLayerForm();
        current = $('#type').value;
        sel();
        $('#type').prop('disabled', false);
        $('#add').prop('disabled', false);
    });
}

function retrieveData(repo){

    var data;
    if(repo === 'layers'){

    }
    else if(repo === 'platfrms'){

    }
    else{

    }
    return data;
}

function layerRoutes(route){

    var tail = "",
        method = "",
        setup = {},
        param,
        data = retrievedata('layers'),
        url;

        switch(route) {

            case "insert":
                method = "POST";
                tail = "/v1/repo/usrs/" + USERDATA._id + "/layers";
                break;
            case "delete":
                method = "DELETE";
                tail = "/v1/repo/usrs/" + USERDATA._id + "/layers/" + data.layer_id;
                break;
            case "update":
                method = "PUT";
                tail = "/v1/repo/usrs/" + USERDATA._id + "/layers/" + data.layer_id;
                break;
        }

        param = {
                env : ENV,
                axs_key : AXS_KEY
            };

        url = SERVER.replace('http://', '') + tail;

        setup.method = method;
        setup.url = 'http://' + self.buildURL(url, param);
        setup.headers = {
            "Content-Type": "application/json"
             };

}

function platformRoutes(route){

    var tail = "",
        method = "",
        setup = {},
        param,
        data = retrievedata('platfrms'),
        url;

        switch(route) {

            case "insert":
                method = "POST";
                tail = "/v1/repo/usrs/" + USERDATA._id + "/platfrms";
                break;
            case "delete":
                method = "DELETE";
                tail = "/v1/repo/usrs/" + USERDATA._id + "/platfrms/" + data.platfrm_id;
                break;
            case "update":
                method = "PUT";
                tail = "/v1/repo/usrs/" + USERDATA._id + "/platfrms/" + data.platfrm_id;
                break;
        }

        param = {
                env : ENV,
                axs_key : AXS_KEY
            };

        url = SERVER.replace('http://', '') + tail;

        url = 'http://' + self.buildURL(url, param);

}

function superLayerRoutes(route){

    var tail = "",
        method = "",
        setup = {},
        param,
        data = retrievedata('suprlays'),
        url;

        switch(route) {

            case "insert":
                method = "POST";
                tail = "/v1/repo/usrs/" + USERDATA._id + "/suprlays";
                break;
            case "delete":
                method = "DELETE";
                tail = "/v1/repo/usrs/" + USERDATA._id + "/suprlays/" + data.suprlay_id;
                break;
            case "update":
                method = "PUT";
                tail = "/v1/repo/usrs/" + USERDATA._id + "/suprlays/" + data.suprlay_id;
                break;
        }

        param = {
                env : ENV,
                axs_key : AXS_KEY
            };

        url = SERVER.replace('http://', '') + tail;

        setup.method = method;
        setup.url = 'http://' + self.buildURL(url, param);
        setup.headers = {
            "Content-Type": "application/json"
             };

}

function verify(url, repo, data){

    var proceed = true;

    $.ajax({
        url: url,
        method: "GET"
    }).success (
        function (res) {
            var i,
            l = res.length;

            if(repo === "layers"){
                for(i = 0; i < l; i++) {
                    if(res[i].name === data.name){
                        window.alert('Layer name in use');
                        proceed = false;
                    }
                }
            }
            else{
                for(i = 0; i < l; i++) {
                    if(res[i].name === data.name){
                        window.alert('Group name in use');
                        proceed = false;
                    }
                    if(res[i].code === data.code){
                        window.alert('Group code in use');
                        proceed = false;
                    }
                    if(res[i].logo === data.logo){
                        window.alert('Group logo in use');
                        proceed = false;
                    }
                }
            }
        }
    );
    return proceed;
}

function sendStructure(url, method, data){

    if(method !== 'DELETE'){
        $.ajax({
            url: url,
            method: method,
            data: data
        }).success (
            function (res) {
                window.alert('Success');
            }
        );
    }
    else
    {
        $.ajax({
            url: url,
            method: "DELETE"
        }).success (
            function (res) {
                window.alert('Success');
            }
        );
    }
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
        
        params.env = ENV;

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

function testData() {
    var _usr_id = {
        __v:0,
        _id:"",
        avatar_url:"",
        axs_key:"",
        email:"",
        github_tkn:"",
        name:"",
        upd_at:"",
        usrnm:"",
    };
    return _usr_id;
}

function getUserID() {
        var _usr_id = {
                __v : getCookie("v"),
                _id : getCookie("id"),
                avatar_url : getCookie("avatar"),
                axs_key : getCookie("key"),
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

init();