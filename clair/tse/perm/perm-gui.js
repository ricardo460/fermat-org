var user_data = getUserID(),
    axs_key = '',
    environment = '',
    perm = 00000,
    usertype = 'developer',
    reference,
    userList;

function init() {
    //if(user_data._id === ''){
        //window.alert("Error. Please login first or request authorization to use this module");
        //window.location.replace(window.location.href.replace(window.location.pathname, ''));
    //}
    //else{
        environment = API_ENV;
        $('#perm-link').click(function(event) {
            location.href = '../';
        });

        checkPermissions();
        environment = 'development';
        axs_key = user_data.axs_key;

        updateUserList(true);

        $('#changePermissions').click(function() {
                verify();
        });
    //}
}

function updateUserList(reload){
    var table = document.getElementById("users");
    while(table.rows.length > 1) {
        table.deleteRow(1);
    }
    getUsers();

    if(reload !== true){
        setTimeout(function (){
            document.getElementById('spinner').style.display = 'none';
            $('#users').removeClass('hidden');
            tagPermissions("platform");
            tagPermissions("superlayer");
            tagPermissions("layer");
            $('#perm').removeClass('hidden');
        }, 7000);
    }
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
    var url = getRoute('perm', user);

    console.log(url);

    $.ajax({
        url: url,
        method: "POST",
        data: {
            'usrnm': user
        }
    }).success (
        function (res) {
            console.log(user + " " + res.perm + res);
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
        $('#users').append("<tr><td>" + data.usrnm + "</td><td>" + data.name + "</td><td>" + "<button id='" + data.usrnm + "' name=" + data.usrnm + " onclick='modifyPermissions(this)'>Modify</button>" + "</td></tr>");
    else
        $('#users').append("<tr><td>" + data.usrnm + "</td><td>" + "</td><td>" + "<button id='" + data.usrnm + "' name=" + data.usrnm + " onclick='modifyPermissions(this)'>Modify</button>" + "</td></tr>");
}

function listVisibility(action){
    if(action === 'hide'){
        $('#users').addClass('hidden');
        $('#perm-form').removeClass('hidden');
    }
    else{
        $('#users').removeClass('hidden');
        $('#perm-form').addClass('hidden');
    }
}

function cancel(){
    listVisibility('show');
    document.getElementById("platform-add").disabled = false;
    document.getElementById("platform-mod").disabled = false;
    document.getElementById("platform-del").disabled = false;
    document.getElementById("sl-add").disabled = false;
    document.getElementById("sl-mod").disabled = false;
    document.getElementById("sl-del").disabled = false;
    document.getElementById("layer-add").disabled = false;
    document.getElementById("layer-mod").disabled = false;
    document.getElementById("layer-del").disabled = false;
    document.getElementById("platform-add").checked = false;
    document.getElementById("platform-mod").checked = false;
    document.getElementById("platform-del").checked = false;
    document.getElementById("sl-add").checked = false;
    document.getElementById("sl-mod").checked = false;
    document.getElementById("sl-del").checked = false;
    document.getElementById("layer-add").checked = false;
    document.getElementById("layer-mod").checked = false;
    document.getElementById("layer-del").checked = false;
}

function modifyPermissions(element){
    listVisibility('hide');
    reference = element.id;
    var url = getRoute('perm', element.id);

    $.ajax({
        url: url,
        method: "GET"
    }).success (
        function (res) {
            var digit,
                codeDigit,
                temp = parseInt(res.perm);

            digit = Math.floor((temp % 11000) / 100);
            codeDigit = Math.floor((perm % 11000) / 100);
            enable(digit, 'platform', codeDigit);

            digit = Math.floor((temp % 11100) / 10);
            codeDigit = Math.floor((perm % 11100) / 10);
            enable(digit, 'sl', codeDigit);

            digit = Math.floor((Math.floor(temp % 1000)) % 10);
            codeDigit = Math.floor((Math.floor(perm % 1000)) % 10);
            enable(digit, 'layer', codeDigit);
        }
    );
}

function enable(digit, structure, compareDigit) {
    if(digit % 2 === 1){
        document.getElementById(structure+"-del").checked = true;
        document.getElementById(structure+"-del").disabled = true;
    }
    else{
        if(compareDigit % 2 === 0)
            document.getElementById(structure+"-del").disabled = true;
    }

    digit = Math.floor(digit / 2);

    if(digit % 2 === 1){
        document.getElementById(structure+"-mod").checked = true;
        document.getElementById(structure+"-mod").disabled = true;
    }
    else{
        compareDigit = Math.floor(compareDigit / 2);
        if(compareDigit % 2 === 0)
            document.getElementById(structure+"-mod").disabled = true;
    }

    if(Math.floor(digit / 2) === 1){
        document.getElementById(structure+"-add").checked = true;
        document.getElementById(structure+"-add").disabled = true;
    }
    else{
        if(Math.floor(compareDigit / 2) === 0)
            document.getElementById(structure+"-add").disabled = true;
    }
}

function binaryToOctal(structure){
    var digit,
        digitAdd,
        digitMod,
        digitDel;

    if(document.getElementById(structure+"-add").checked)
        digitAdd = 1;
    else
        digitAdd = 0;

    if(document.getElementById(structure+"-mod").checked)
        digitMod = 1;
    else
        digitMod = 0;

    if(document.getElementById(structure+"-del").checked)
        digitDel = 1;
    else
        digitDel = 0;

    digit = (digitAdd * 4) + (digitMod * 2) + (digitDel * 1);
    return digit;
}

function verify(){
    var digitPlatform,
        digitSuperlayer,
        digitLayer,
        url;

    digitPlatform = binaryToOctal('platform');
    digitSuperlayer = binaryToOctal('sl');
    digitLayer = binaryToOctal('layer');

    url = getRoute('change', user_data._id);

    digitPlatform = (77000 + (digitPlatform * 100) + (digitSuperlayer * 10) + digitLayer);

    var data = {
        usrnm : reference,
        perm: digitPlatform.toString(),
        usr_id: user_data._id
    };

    console.log(data);
    console.log(url);

    $.ajax({
            url: url,
            method: "POST",
            data: data
    }).success (
        function (res) {
            window.alert("Permissions modified successfully");
            updateUserList();
            cancel();
        }
    ).error (
        function (xhr, status, error) {
            window.alert(xhr.responseText);
        }
    );
}

function getRoute(route, user){

    var tail = "",
        param,
        url;

    if(route === 'users')
        tail = "/v1/repo/devs";
    if(route === 'perm')
        tail = "/v1/user/users";
    if(route === 'change')
        tail = "/v1/user/" + user + "/changePerms";

    param = {
        env : environment,
        axs_key : axs_key
    };

    url = window.helper.SERVER.replace('http://', '') + tail;
    url = 'http://' + window.helper.buildURL(url, param);
    return url;
}

function getUserID() {
    var _usr_id = {
        __v : getCookie("v"),
        _id : '570e44e3019d61dc4de9f331',
        avatar_url : getCookie("avatar"),
        axs_key : '570e44e3019d61dc4de9f32f',
        email : getCookie("email"),
        github_tkn : getCookie("github"),
        name : getCookie("name"),
        upd_at : getCookie("update"),
        usrnm : 'isatab'
    };
    return _usr_id;
}

function checkPermissions() {
    var url = getRoute('perm', user_data.usrnm);

    $.ajax({
            url: url,
            method: "POST",
            data: {
                'usrnm': user_data.usrnm
            }
    }).success (
        function (res) {
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
