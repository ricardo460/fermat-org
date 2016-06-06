var user_data = getUserID(),
    axs_key = '',
    environment = '',
    perm = 00000,
    userList;
//global constants
var SERVER = 'http://api.fermat.org';

function init() {
    //if(user_data._id === ''){
        //window.alert("Error. Please login first or request authorization to use this module");
        //window.location.replace(window.location.href.replace(window.location.pathname, ''));
    //}
    //else{

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

        $('#perm-link').click(function(event) {
            location.href = '../';
        });

        environment = 'development';
        axs_key = user_data.axs_key;
        checkPermissions();

        getUsers();

        setTimeout(function (){
                document.getElementById('spinner').style.display = 'none';
                $('#users').removeClass('hidden');
                tagPermissions("platform");
                tagPermissions("superlayer");
                tagPermissions("layer");
                $('#perm').removeClass('hidden');
        }, 7000);
    //}
}

function getUsers(){

    var url = getRoute('users');

    $.ajax({
        url: url,
        method: "GET"
    }).success (
        function (res) {
            userList = res;
            for(var i = 0; i < userList.length; i++)
                if(userList[i].usrnm !== user_data.usrnm)
                    verifyUser(userList[i].usrnm);
        }
    );
}

function verifyUser(user){
    var url = getRoute('perm');
    $.ajax({
        url: url,
        method: "POST",
        data: {
            usrnm: user
        }
    }).success (
        function (res) {
            if(comparePermissions(res.perm))
                fillTable(res);
        }
    );
}

function comparePermissions(code){
    var digit,
        codeDigit;

    digit = Math.floor((perm % 11000) / 100);
    codeDigit = Math.floor((code % 11000) / 100);
    if(validatePermission(digit, null, false, codeDigit))
        return true;
    else
        digit = Math.floor((perm % 11100) / 10);
        codeDigit = Math.floor((code % 11100) / 10);
        if(validatePermission(digit, null, false, codeDigit))
            return true;
        else
            digit = Math.floor(perm % 11110);
            codeDigit = Math.floor(code % 11110);
            if(validatePermission(digit, null, false, codeDigit))
                return true;
            else
                return false;
}

function fillTable(data){
    if(data.name !== null)
        $('#users').append("<tr><td>" + data.usrnm + "</td><td>" + data.name + "</td><td>" + "<button id='" + data._id + "' name='perm: " + data.usrnm + "' onclick=''>Modify</button>" + "</td></tr>");
    else
        $('#users').append("<tr><td>" + data.usrnm + "</td><td>" + "</td><td>" + "<button id='" + data._id + "' name='perm: " + data.usrnm + "' onclick=''>Modify</button>" + "</td></tr>");
}

function getRoute(route){

    var tail = "",
        param,
        url;

    if(route === 'users')
        tail = "/v1/user/users";
    else
        tail = "/v1/user/";

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
        _id : '570e4b43019d61dc4dea1f3a',
        avatar_url : getCookie("avatar"),
        axs_key : '570e4b43019d61dc4dea1f3f',
        email : getCookie("email"),
        github_tkn : getCookie("github"),
        name : getCookie("name"),
        upd_at : getCookie("update"),
        usrnm : 'isatab'
    };
    return _usr_id;
}

function checkPermissions() {
    var url = getRoute('perm');

    $.ajax({
        url: url,
        method: "POST",
        data: {
            usrnm: user_data.usrnm
        }
    }).success(
        function(res) {
            perm = parseInt(res.perm);
            return perm;
        }
    );
}

function tagPermissions(structure) {
    var digit;

    if(structure === "platform"){
        digit = Math.floor((perm % 11000) / 100);
        validatePermission(digit, structure, true);
    }
    else if(structure === "superlayer"){
        digit = Math.floor((perm % 11100) / 10);
        validatePermission(digit, structure, true);
    }
    else if(structure === "layer"){
        digit = Math.floor((perm % 11110));
        validatePermission(digit, structure, true);
    }
}

function validatePermission(digit, structure, setTag, compareDigit) {
    if(digit % 2 === 1)
        if(setTag === true)
            document.getElementById("tag-"+structure+"-del").className += "label label-success";
        else
            if(compareDigit % 2 === 0)
                return true;
    else
        if(setTag === true)
            document.getElementById("tag-"+structure+"-del").className += "label label-danger";

    digit = Math.floor(digit / 2);

    if(digit % 2 === 1)
        if(setTag === true)
            document.getElementById("tag-"+structure+"-mod").className += "label label-success";
        else{
            compareDigit = Math.floor(compareDigit / 2);
            if(compareDigit % 2 === 0)
                return true;
        }
    else
        if(setTag === true)
            document.getElementById("tag-"+structure+"-mod").className += "label label-danger";

    if(Math.floor(digit / 2) === 1)
        if(setTag === true)
            document.getElementById("tag-"+structure+"-add").className += "label label-success";
        else
            if(Math.floor(compareDigit / 2) === 0)
                return true;
    else
        if(setTag === true)
            document.getElementById("tag-"+structure+"-add").className += "label label-danger";
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
