
//global variables
var user_data = getUserID(),
    axs_key = '',
    environment = '',
    current = 'platform',
    request = 'add',
    referenceName = '',
    referenceId = '',
    referenceCode = '',
    referenceOrder = '',
    usertype = 'designer',
    perm = 77000;
//global constants
var SERVER = 'api.fermat.org';

function init() {
    //if(user_data._id === ''){
        //window.alert("Error. Please login first or request authorization to use this module");
        //window.location.replace(window.location.href.replace(window.location.pathname, ''));
    //}
    //else{
        $('#type').prop('disabled', true);
        $('#add').prop('disabled', true);

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

        environment = 'development';
        axs_key = user_data.axs_key;
        checkPermissions();

        updateList('layer',true);
        updateList('platform',true);
        updateList('superlayer',true);

        sel();

        $(document).ready(function() {

            $('#type').change(function() {
                current = this.value;
                sel();
            });

            $('#perm-link').click(function(event) {
                location.href = 'perm';
            });

            $('#type').bind('keydown', function(event) {
                if(event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                    current = this.value;
                    sel();
                }
            });

            $('#layerSuperLayer').change(function() {
                $("#layerOrder").empty();
                if(document.getElementById("layerSuperLayer").value === "false")
                    retrieveData("layer", "layers", false);
                else
                    retrieveData("layer", "layers", document.getElementById("layerSuperLayer").value);
            });

            $('#layerSuperLayer').bind('keydown', function(event) {
                if(event.key === 'ArrowUp' || event.key === 'ArrowDown'){
                    $("#layerOrder").empty();
                    if(document.getElementById("layerSuperLayer").value === "false")
                        retrieveData("layer", "layers", false);
                    else
                        retrieveData("layer", "layers", document.getElementById("layerSuperLayer").value);
                }
            });

            $('#submitLayer').click(function() {
                verify(current,request);
            });

            $('#submitGroup').click(function() {
                verify(current,request);
            });
        });
    //}
}

function deleteStructure(element, type){

    if(confirm("Are you sure you want to remove the " + element.name + "? (Removing this " + type + " will delete all of it's associated components)") === true){

        var url;

        switch(type) {
            case "layer":
                url = getRoute("layers", "delete", element.id);
                break;
            case "platform":
                url = getRoute("platfrms", "delete", element.id);
                break;
            case "superlayer":
                url = getRoute("suprlays", "delete", element.id);
                break;
        }

        sendRequest(url, 'DELETE', null, type);

        $('#type').prop('disabled', true);
        $('#add').prop('disabled', true);
        hideLists();
        document.getElementById('spinner').style.display = 'block';

        setTimeout(function (){
            updateList(type, true);
        }, 3000);

        clearGroupForm(usertype);
        clearLayerForm();
    }
}

function modifyStructure(element, type){

    add('modify');
    var url;

    request = 'modify';

    switch(type) {
        case "layer":
            url = getRoute("layers", "update", element.id);
            break;
        case "platform":
            url = getRoute("platfrms", "update", element.id);
            break;
        case "superlayer":
            url = getRoute("suprlays", "update", element.id);
            break;
    }

    $.ajax({
        url: url,
        method: "GET"
    }).success (
        function (res) {

            referenceName = res.name;
            referenceOrder = res.order;
            referenceId = element.id;

            if(type === 'layer'){

                document.getElementById('nextName').style.display = 'block';
                document.getElementById("layerName").value = res.name.capitalize();
                document.getElementById("layerLang").value = res.lang;

                $("#layerOrder").empty();

                if(res.suprlay === false){
                    document.getElementById("layerSuperLayer").value = "false";
                    retrieveData("layer", "layers", false);
                }
                else{
                    document.getElementById("layerSuperLayer").value = res.suprlay;
                    retrieveData("layer", "layers", document.getElementById("layerSuperLayer").value);
                }

                findPosition(type, res.order);
            }
            else{
                if(usertype === 'developer'){
                    document.getElementById("groupCode").value = res.code;
                    document.getElementById("groupName").value = res.name.capitalize();

                    var list = document.getElementById("groupDeps"),
                        l = list.options.length;

                    for(var e in res.deps){
                        for(var i = 0; i < l; i++){
                            if(res.deps[e] === list.options[i].value)
                                list.options[i].selected = 'true';
                        }
                    }
                    retrieveData(current, current, null);
                    referenceCode = res.code;

                    findPosition(type, res.order);
                }
                else{
                    document.getElementById("desCode").value = res.code;
                    document.getElementById("desName").value = res.name.capitalize();
                }
            }
        }
    );

}

function findPosition(type, order){

    var url;

    switch(type) {
        case "layer":
            url = getRoute("layers", "retrieve");
            break;
        case "platform":
            url = getRoute("platfrms", "retrieve");
            break;
        case "superlayer":
            url = getRoute("suprlays", "retrieve");
            break;
    }

    $.ajax({
        url: url,
        method: "GET"
    }).success (
        function (res) {
             var l = res.length;

             for(var i = 0; i < l; i++){
                if(res[i].order === order && order === 1){
                    if(type === "layer"){
                            if(res[1].suprlay !== false)
                                document.getElementById("layerNext").innerHTML = "Currently: Above - " + res[1].name.capitalize() + " (In Superlayer: " + res[1].suprlay + ")";
                            else
                                document.getElementById("layerNext").innerHTML = "Currently: Above - " + res[1].name.capitalize() + " (In no Superlayer)";
                    }
                    else{
                        document.getElementById("groupOrder").value = res[1].order;
                        document.getElementById("groupPos").value = "before";
                    }
                }
                else{
                    if(res[i].order === order){
                        if(type === "layer"){
                            if(res[i-1].suprlay !== false)
                                document.getElementById("layerNext").innerHTML = "Currently: Below - " + res[i-1].name.capitalize() + " (In Superlayer: " + res[i-1].suprlay + ")";
                            else
                                document.getElementById("layerNext").innerHTML = "Currently: Below - " + res[i-1].name.capitalize() + " (In no Superlayer)";
                        }
                        else{
                            document.getElementById("groupOrder").value = res[i-1].order;
                            document.getElementById("groupPos").value = "after";
                        }
                    }
                }
             }
        }
    );
}

function updateList(list, refresh){
    var table;
    $('#perm').addClass('hidden');
    if(list === 'layer'){
        table = document.getElementById("layerList");
        while(table.rows.length > 1) {
            table.deleteRow(1);
        }
        $("#layerOrder").empty();
        retrieveData("layer", null);

        if(document.getElementById("layerSuperLayer").value === "false")
            retrieveData("layer", "layers", false);
        else
            retrieveData("layer", "layers", document.getElementById("layerSuperLayer").value);
    }
    else if(list === 'platform'){
        table = document.getElementById("platformList");
        while(table.rows.length > 1) {
            table.deleteRow(1);
        }
        $("#groupOrder").empty();
        $("#groupDeps").empty();
        retrieveData("platform", null);
        retrieveData("superlayer", "platform", null);
    }
    else{
        table = document.getElementById("superlayerList");
        while(table.rows.length > 1) {
            table.deleteRow(1);
        }
        $("#layerSuperLayer").empty();
        $("#groupOrder").empty();
        $("#groupDeps").empty();
        retrieveData("superlayer", null);
        retrieveData("platform", "superlayer", null);
        retrieveData("superlayer", "layers", null);
    }

    if(refresh){
        setTimeout(function (){
                document.getElementById('spinner').style.display = 'none';
                sel();
                $('#type').prop('disabled', false);
                $('#add').prop('disabled', false);
                tagPermissions("platform");
                tagPermissions("superlayer");
                tagPermissions("layer");
                $('#perm').removeClass('hidden');
        }, 2000);
    }
}

function clearReference(){
    referenceName = '';
    referenceId = '';
    referenceCode = '';
    referenceOrder = '';
}

function add(option){

    if(option !== 'modify'){
        clearReference();
        if(current === 'layer')
            retrieveData(current, 'layers', false);
        else
            retrieveData(current, current, null);
    }

    hideLists();
    $('#type').prop('disabled', true);
    $('#add').prop('disabled', true);

    if(current === 'layer') {
        showForm('#layerForm');
        clearLayerForm();
    } else {
        if(usertype === 'developer'){
            clearGroupForm(usertype);
            showForm('#groupForm');
        }
        else{
            showForm('#desForm');
        }
    }
    request = 'add';
}

function cancel() {
    clearGroupForm(usertype);
    clearLayerForm();
    hideForm(getActiveForm());
    $('#type').prop('disabled', false);
    $('#add').prop('disabled', false);
    sel();
}

function getActiveForm() {
    if(current === 'layer') {
        return $('#layerForm');
    } else {
        if(usertype === 'developer')
            return $('#groupForm');
        else
            return $('#desForm');
    }
}

function sel() {
    if(current === 'superlayer') {
        $('#layerList').addClass('hidden');
        $('#superlayerList').removeClass('hidden');
        $('#platformList').addClass('hidden');
    } else if (current === 'platform') {
        $('#layerList').addClass('hidden');
        $('#superlayerList').addClass('hidden');
        $('#platformList').removeClass('hidden');
    } else {
        $('#layerList').removeClass('hidden');
        $('#superlayerList').addClass('hidden');
        $('#platformList').addClass('hidden');
    }
}

function clearGroupForm(type) {
    if(type === 'developer'){
        document.getElementById('groupCode').value = '';
        document.getElementById('groupName').value = '';
        document.getElementById('groupDeps').value = '';
        $("#groupOrder").empty();
    }
    else{
        document.getElementById('desCode').value = '';
        document.getElementById('desName').value = '';
        document.getElementById('desHeader').value = '';
        document.getElementById('desIcon').value = '';
    }
}

function clearLayerForm() {
    document.getElementById('layerName').value = '';
    document.getElementById('layerNext').innerHTML = '';
    document.getElementById('nextName').style.display = 'none';
    $("#layerOrder").empty();
}

function hideLists() {
    $('#layerList').addClass('hidden');
    $('#superlayerList').addClass('hidden');
    $('#platformList').addClass('hidden');
}

function showForm(id) {
    $(id).removeClass('hidden');
}

function hideForm(id) {
    $(id).addClass('hidden');
}

function retrieveData(repo, form, code){

    var url;

    switch(repo) {
        case "layer":
            url = getRoute("layers", "retrieve");
            break;
        case "platform":
            url = getRoute("platfrms", "retrieve");
            break;
        case "superlayer":
            url = getRoute("suprlays", "retrieve");
            break;
    }

    $.ajax({
        url: url,
        method: "GET"
    }).success (
        function (res) {
            if(form === null)
                fillTable(repo, res);
            else
                if(code === null)
                    setFields(res, form, repo);
                else
                    setFields(res, form, repo, code);
        }
    );
}

function setFields(data, form, type, superlayer){

    var l = data.length;

    for(var i = 0; i < l; i++){
        if(form === "layers"){
            if(type === "superlayer"){
                if(i === 0){
                    $("#layerSuperLayer").append($("<option></option>").val("false").html("No"));
                }
                $("#layerSuperLayer").append($("<option></option>").val(data[i].code).html(data[i].code + " - " + data[i].name.capitalize()));
            }
            if(type === "layer")
                if(data[i].suprlay === superlayer && data[i].name !== referenceName)
                    $("#layerOrder").append($("<option></option>").val(data[i].order).html(data[i].name.capitalize()));
        }
        else{
            if(data[i].name !== referenceName){
                if(form === type)
                    $("#groupOrder").append($("<option></option>").val(data[i].order).html(data[i].code + " - " + data[i].name.capitalize()));
                $("#groupDeps").append($("<option></option>").val(data[i].code).html(data[i].code + " - " + data[i].name.capitalize()));
            }
        }
    }
}

function fillTable(repo, data){

    var i,
        l = data.length;

    for(i = 0; i < l; i++){
        if(repo === "layer"){
            if(data[i].suprlay !== false)
                $('#layerList').append("<tr><td>" + data[i].name.capitalize() + "</td><td>" + data[i].lang.capitalize() + "</td><td>" + data[i].suprlay + "</td><td>" + data[i].order + "</td><td>" + "<button id='" + data[i]._id + "' name='layer: " + data[i].name.capitalize() + "' onclick='modifyStructure(this," + '"layer"' + ")'>Modify</button>" + "<button id='" + data[i]._id + "' name='layer: " + data[i].name.capitalize() + "' onclick='deleteStructure(this," + '"layer"' + ")'>Delete</button>" + "</td></tr>");
            else
                $('#layerList').append("<tr><td>" + data[i].name.capitalize() + "</td><td>" + data[i].lang.capitalize() + "</td><td>" + "</td><td>" + data[i].order + "</td><td>" + "<button id='" + data[i]._id + "' name='layer: " + data[i].name.capitalize() + "' onclick='modifyStructure(this," + '"layer"' + ")'>Modify</button>" + "<button id='" + data[i]._id + "' name='layer: " + data[i].name.capitalize() + "' onclick='deleteStructure(this," + '"layer"' + ")'>Delete</button>" + "</td></tr>");
        }
        else if(repo === "platform")
            $('#platformList').append("<tr><td>" + data[i].code + "</td><td>" + data[i].name.capitalize() + "</td><td>" + data[i].order + "</td><td>" + data[i].deps + "</td><td>" + "<button id='" + data[i]._id + "' name='layer: " + data[i].name.capitalize() + "' onclick='modifyStructure(this," + '"platform"' + ")'>Modify</button>" + "<button id='" + data[i]._id + "' name='platform: " + data[i].name.capitalize() + "' onclick='deleteStructure(this," + '"platform"' + ")'>Delete</button>" + "</td></tr>");
        else
            $('#superlayerList').append("<tr><td>" + data[i].code + "</td><td>" + data[i].name.capitalize() + "</td><td>" + data[i].order + "</td><td>" + "<button id='" + data[i]._id + "' name='layer: " + data[i].name.capitalize() + "' onclick='modifyStructure(this," + '"superlayer"' + ")'>Modify</button>" + "<button id='" + data[i]._id + "' name='superlayer: " + data[i].name.capitalize() + "' onclick='deleteStructure(this," + '"superlayer"' + ")'>Delete</button>" + "</td></tr>");
    }
}

function getRoute(form, route, id){

    var tail = "",
        param,
        url;

    if(route === 'insert' || route === 'retrieve')
        tail = "/v1/repo/usrs/" + user_data._id + "/" + form;
    else if(route === 'update' || route === 'delete')
        tail = "/v1/repo/usrs/" + user_data._id + "/" + form + "/" + id;
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

function verify(form, request){

    var url,
        data = getData(form, request),
        i,
        j,
        l,
        list,
        repo,
        elements,
        nameChange = false;
        proceed = true;


    if(request === "add"){
        if(form === "layer"){

            list = document.getElementById('layerList');
            elements = list.getElementsByTagName('td');

            for(i = 0, l = elements.length; i < l; i+=5){
                if(data.name === elements[i].innerHTML.toLowerCase()){
                    window.alert('Layer name in use');
                    return false;
                }
            }

            if(proceed){
                url = getRoute("layers", "insert");
                sendRequest(url, 'POST', data, form);
                updateList('layer', false);
                clearLayerForm();
            }
        }
        else{
            var data;

            if(form === 'platform'){
                list = document.getElementById('platformList');
                url = getRoute("platfrms", "insert");

                if (usertype === "designer") {
                    code = document.getElementsById('desCode').value;
                    if (/^[A-Z]{3}$/.exec(code) === null) {
                        alert('Erroneous code');
                        return; // Do another thing
                    }

                    header = document.getElementById('desHeader')[0];
                    icon = document.getElementById('desIcon')[0];

                    var headerData = new FormData();
                    var iconData = new FormData();
                    headerData.append('img', header);
                    headerData.append('type', 'header');
                    headerData.append('code', code);

                    iconData.append('img', icon);
                    iconData.append('type', 'icon');
                    iconData.append('code', code);

                    $.ajax({
                        type: 'POST',
                        url: 'http://url1',
                        data: headerData
                    }).success(function () {

                    });

                    $.ajax({
                        type: 'POST',
                        url: 'http://url2',
                        data: iconData
                    }).success(function () {

                    });
                } else {

                }
            }
            else{
                list = document.getElementById('superlayerList');
                url = getRoute("suprlays", "insert");

                if (usertype === "designer") {

                } else {

                }
            }
            elements = list.getElementsByTagName('td');

            if(form === 'platform'){
                j = 5;
                repo = "platfrms";
            }
            else{
                j = 4;
                repo = "suprlays";
            }

            for(i = 0, l = elements.length; i < l; i+=j){
                if(data.code.toUpperCase() === elements[i].innerHTML){
                    window.alert('Code in use');
                    return false;
                }
                if((data.name.toLowerCase()).capitalize() === elements[i+1].innerHTML){
                    window.alert('Name in use');
                    return false;
                }
            }

            if(proceed){
                url = getRoute(repo, "insert");
                sendRequest(url, 'POST', data, form);
                updateList(form, false);
                clearGroupForm(usertype);
                retrieveData(current, current, null);
            }
        }
    }
    else{
        if(form === "layer"){

            list = document.getElementById('layerList');
            elements = list.getElementsByTagName('td');

            for(i = 0, l = elements.length; i < l; i+=5){
                if(data.name === elements[i].innerHTML.toLowerCase() && data.name !== referenceName){
                    window.alert('Layer name in use');
                    return false;
                }
            }

            if(proceed){
                if(data.order > referenceOrder)
                    data.order--;

                url = getRoute("layers", "update", referenceId);
                sendRequest(url, 'PUT', data, form);

                cancel();

                $('#type').prop('disabled', true);
                $('#add').prop('disabled', true);
                hideLists();
                document.getElementById('spinner').style.display = 'block';

                setTimeout(function (){
                    updateList(form, true);
                }, 3000);

                clearGroupForm();
                clearLayerForm();
            }
        }
        else{

            if(form === 'platform'){
                list = document.getElementById('platformList');
                url = getRoute("platfrms","insert");
            }
            else{
                list = document.getElementById('superlayerList');
                url = getRoute("suprlays","insert");
            }
            elements = list.getElementsByTagName('td');

            if(form === 'platform'){
                j = 5;
                repo = "platfrms";
            }
            else{
                j = 4;
                repo = "suprlays";
            }

            for(i = 0, l = elements.length; i < l; i+=j){
                if(data.code.toUpperCase() === elements[i].innerHTML && data.code.toUpperCase() !== referenceCode){
                    window.alert('Code in use');
                    return false;
                }
                if((data.name.toLowerCase()).capitalize() === elements[i+1].innerHTML && (data.name.toLowerCase()).capitalize() !== referenceName){
                    window.alert('Name in use');
                    return false;
                }
            }

            if(proceed){
                url = getRoute(repo, "insert");
                sendRequest(url, 'PUT', data, form);

                cancel();
                $('#type').prop('disabled', true);
                $('#add').prop('disabled', true);
                hideLists();
                document.getElementById('spinner').style.display = 'block';

                setTimeout(function (){
                    updateList(form, true);
                }, 3000);

                clearGroupForm(usertype);
                retrieveData(current, current, null);
                clearLayerForm();
            }
        }
    }
}

function sendRequest(url, method, data, type){

    if(method !== 'DELETE'){
        $.ajax({
            url: url,
            method: method,
            data: data
        }).success (
            function (res) {
                if(method === 'POST')
                    window.alert('New ' + type + ' created successfully.');
                else
                    window.alert(type + ' information has been modified.');
            }
        ).error (
            function (xhr, status, error) {
                window.alert(xhr.responseText);
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
                window.alert('The ' + type + ' has been completely removed.');
            }
        ).error (
            function (xhr, status, error) {
                window.alert(xhr.responseText);
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

function getData(form, request) {

    if(form === 'layer'){
        if(document.getElementById('layerPos').value === "before")
            order = document.getElementById('layerOrder').value;
        else
            order = parseInt(document.getElementById('layerOrder').value) + 1;

        if(order === -1)
            order = 0;
        var superlayer;

        if(document.getElementById('layerSuperLayer').value === 'false')
            superlayer = false;
        else
            superlayer = document.getElementById('layerSuperLayer').value;

        if(request === 'add'){
            data = {
                name:document.getElementById('layerName').value.toLowerCase(),
                lang:document.getElementById('layerLang').value,
                suprlay:superlayer,
                order:order
            };
        }
        else{
            data = {
                layer_id:referenceId,
                name:document.getElementById('layerName').value.toLowerCase(),
                lang:document.getElementById('layerLang').value,
                suprlay:superlayer,
                order:order
            };
        }
    }
    else{
        if(document.getElementById('groupPos').value === "before")
            order = document.getElementById('groupOrder').value;
        else
            order = parseInt(document.getElementById('groupOrder').value) + 1;

        if(order === -1)
            order = 0;

        if(form === 'platform')
            url = getRoute("platfrms", "retrieve");
        else
            url = getRoute("suprlays", "retrieve");

        if(request === 'add'){
            data = {
                code:document.getElementById('groupCode').value,
                name:document.getElementById('groupName').value.toLowerCase(),
                logo:document.getElementById('groupCode').value + "_logo.png",
                deps:$('#groupDeps').val(),
                order:order
            };
        }
        else{
            if(form === 'platform'){
                data = {
                    platfrm_id:referenceId,
                    code:document.getElementById('groupCode').value,
                    name:document.getElementById('groupName').value.toLowerCase(),
                    logo:document.getElementById('groupCode').value + "_logo.png",
                    deps:$('#groupDeps').val(),
                    order:order
                };
            }
            else{
                data = {
                    suprlay_id:referenceId,
                    code:document.getElementById('groupCode').value,
                    name:document.getElementById('groupName').value.toLowerCase(),
                    logo:document.getElementById('groupCode').value + "_logo.png",
                    deps:$('#groupDeps').val(),
                    order:order
                };
            }
        }
    }

    return data;
}

function getUserID() {
    var _usr_id = {
         __v : getCookie("v"),
        _id : '56f19f0a301492726c80881a',
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
    var url = getRoute(null, 'perm');

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
        setTag(digit, structure);
    }
    else if(structure === "superlayer"){
        digit = Math.floor((perm % 11100) / 10);
        setTag(digit, structure);
    }
    else if(structure === "layer"){
        digit = Math.floor((perm % 11110));
        setTag(digit, structure);
    }
}

function setTag(digit, structure) {
    console.log(digit+structure);
    if(digit % 2 === 1)
        document.getElementById("tag-"+structure+"-del").className += "label label-success";
    else
        document.getElementById("tag-"+structure+"-del").className += "label label-danger";

    digit = Math.floor(digit / 2);

    if(digit % 2 === 1)
        document.getElementById("tag-"+structure+"-mod").className += "label label-success";
    else
        document.getElementById("tag-"+structure+"-mod").className += "label label-danger";

    if(Math.floor(digit / 2) === 1)
        document.getElementById("tag-"+structure+"-add").className += "label label-success";
    else
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
