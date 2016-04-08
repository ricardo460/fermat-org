//global variables
var user_data = '',
    axs_key = '',
    environment = 'production',
    current = 'layer',
    request = 'add',
    referenceName = '',
    referenceId = '',
    referenceCode = '';
//global constants
var SERVER = 'http://api.fermat.org';

function init() {

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

    environment = 'testing';

    user_data = testData();
    axs_key = user_data.axs_key;

    updateList('layer');
    updateList('platform');
    updateList('superlayer');

    $(document).ready(function() {

        $('#type').change(function() {
            current = this.value;
            sel();
        });

        $('#type').bind('keydown', function(event) {
            if(event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                current = this.value;
                sel();
            }
        });

        $('#submitLayer').click(function() {
            verify(current,request);
        });

        $('#submitGroup').click(function() {
            //verify(current,request);
        });

        clearGroupForm();
        clearLayerForm();
        sel();
        $('#type').prop('disabled', false);
        $('#add').prop('disabled', false);
    });
}

function deleteStructure(element, type){
    
    if(confirm("Are you sure you want to remove the " + element.name + "?") === true){
        
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

        $.ajax({
            url: url,
            method: "GET"
        }).success (
            function (res) {
                updateData(type, res.order, 'delete');
            }
        );

        sendRequest(url, 'DELETE');

        setTimeout(function (){
            updateList(type);
        }, 2000);
    }
}

function modifyStructure(element, type){
    
    add();
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
            if(type === 'layer'){
                
                document.getElementById('nextName').style.display = 'block';
                document.getElementById('nextPos').style.display = 'block';
                document.getElementById('nextSuperlayer').style.display = 'block';
                document.getElementById("layerName").value = res.name.capitalize();
                document.getElementById("layerLang").value = res.lang;
                
                referenceName = res.name.capitalize();
                referenceId = element.id;

                if(res.suprlay === false)
                    document.getElementById("layerSuperLayer").value = "false";
                else
                    document.getElementById("layerSuperLayer").value = res.suprlay;

                findPosition(type, res.order);
            }
            else{

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
                referenceName = res.name.capitalize();
                referenceId = element.id;
                referenceCode = res.code;

                findPosition(type, res.order);
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
                if(res[i].order === order && order === 0){
                    if(type === "layer"){
                        document.getElementById("layerNextName").value = res[1].name.capitalize();
                        document.getElementById("layerNextPos").value = "Before";
                            if(res[1].suprlay !== false)
                                document.getElementById("layerNextSuperlayer").value = "Superlayer: " + res[1].suprlay;
                            else
                                document.getElementById("layerNextSuperlayer").value = "No superlayer";
                    }
                    else{
                        document.getElementById("groupOrder").value = res[1].order;
                        document.getElementById("groupPos").value = "before";
                    }
                }
                else{
                    if(res[i].order === order){
                        if(type === "layer"){
                            document.getElementById("layerNextName").value = res[i-1].name.capitalize();
                            document.getElementById("layerNextPos").value = "After";
                            if(res[i-1].suprlay !== false)
                                document.getElementById("layerNextSuperlayer").value = "Superlayer: " + res[i-1].suprlay;
                            else
                                document.getElementById("layerNextSuperlayer").value = "No superlayer";
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

function updateList(list){
    if(list === 'layer'){
        $("#layerList").empty();
        $("#layerOrder").empty();
        retrieveData("layers", null);
        retrieveData("layers", "layers", false);
    }
    else if(list === 'platform'){
        $("#platformList").empty();
        $("groupOrder").empty();
        retrieveData("platforms", null);
        retrieveData("platforms", "groups", null);
    }
    else{
        $("#superlayerList").empty();
        $("#layerSuperLayer").empty();
        $("#groupOrder").empty();
        retrieveData("superlayers", null);
        retrieveData("superlayers", "groups", null);
        retrieveData("superlayers", "layers", null);
    }
}

function add(){
    hideLists();
    $('#type').prop('disabled', true);
    $('#add').prop('disabled', true);

    if(current === 'layer') {
        showForm('#layerForm');
        clearLayerForm();
    } else {
        if(current === 'platform')
            retrieveData("platforms", "group", null);
        else
            retrieveData("superlayers", "group", null);
        showForm('#groupForm');
        clearGroupForm();
    }
}

function cancel() {
    clearGroupForm();
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
        return $('#groupForm');
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

function clearGroupForm() {
    $('#groupCode').html('');
    $('#groupName').html('');
    $('#groupOrder').html('');
}

function clearLayerForm() {
    $('#layerName').html('');
    $('#layerNextName').html('');
    $('#layerNextPos').html('');
    $('#layerNextSuperlayer').html('');
    document.getElementById('nextName').style.display = 'none';
    document.getElementById('nextPos').style.display = 'none';
    document.getElementById('nextSuperlayer').style.display = 'none';
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

function updateData(list, position, mode){

    var url;

    switch(list) {
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
        method: "GET",
        contentType: "application/json",
        dataType: "json"
    }).success (
        function (res) {

            var l = res.length - 1;

            if(mode === 'insert'){
                for(i = l; i > position; i--){
                    switch(list) {
                        case "layers":
                            url = getRoute("layers", "update", res[i]._id);
                            break;
                        case "platforms":
                            url = getRoute("platfrms", "update", res[i]._id);
                            break;
                        case "superlayers":
                            url = getRoute("suprlays", "update", res[i]._id);
                            break;
                    }
                    res[i].order = parseInt(res[i].order) + 1;
                    console.log("update");
                    sendRequest(url, 'UPDATE', res[i]);
                }
            }
            else{
                for(i = position + 1; i < l; i++){
                    switch(list) {
                        case "layers":
                            url = getRoute("layers", "update", res[i]._id);
                            break;
                        case "platforms":
                            url = getRoute("platfrms", "update", res[i]._id);
                            break;
                        case "superlayers":
                            url = getRoute("suprlays", "update", res[i]._id);
                            break;
                    }
                    res[i].order = res[i].order - 1;
                    console.log("update");
                    sendRequest(url, 'UPDATE', res[i]);
                }
            }
        }
    );
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
                    setFields(res, form, repo);
        }
    );
}

function setFields(data, form, type){

    var l = data.length;

    for(var i = 0; i < l; i++){
        if(form === "layers"){
            if(type === "superlayers")
                $("#layerSuperLayer").append($("<option></option>").val(data[i].code).html(data[i].code + " - " + data[i].name.capitalize()));
            if(type === "layers")
                if(data[i].suprlay !== false)
                    $("#layerOrder").append($("<option></option>").val(data[i].order).html(data[i].suprlay + " - " + data[i].name.capitalize()));
                else
                    $("#layerOrder").append($("<option></option>").val(data[i].order).html("No superlayer - " + data[i].name.capitalize()));
        }
        if(form === "group")
            $("#groupOrder").append($("<option></option>").val(data[i].order).html(data[i].code + " - " + data[i].name.capitalize()));
        if(form === "groups")
            $("#groupDeps").append($("<option></option>").val(data[i].code).html(data[i].code + " - " + data[i].name.capitalize()));
    }
}

function fillTable(repo, data){

    var i,
        l = data.length;

    for(i = 0; i < l; i++){
        if(repo === "layers"){
            if(data[i].suprlay !== false)
                $('#layerList').append("<tr><th>" + data[i].name.capitalize() + "</th><th>" + data[i].lang.capitalize() + "</th><th>" + data[i].suprlay + "</th><th>" + data[i].order + "</th><th>" + "<button id='" + data[i]._id + "' name='layer: " + data[i].name.capitalize() + "' onclick='modifyStructure(this," + '"layer"' + ")'>Modify</button>" + "<button id='" + data[i]._id + "' name='layer: " + data[i].name.capitalize() + "' onclick='deleteStructure(this," + '"layer"' + ")'>Delete</button>" + "</th></tr>");
            else
                $('#layerList').append("<tr><th>" + data[i].name.capitalize() + "</th><th>" + data[i].lang.capitalize() + "</th><th>" + "</th><th>" + data[i].order + "</th><th>" + "<button id='" + data[i]._id + "' name='layer: " + data[i].name.capitalize() + "' onclick='modifyStructure(this," + '"layer"' + ")'>Modify</button>" + "<button id='" + data[i]._id + "' name='layer: " + data[i].name.capitalize() + "' onclick='deleteStructure(this," + '"layer"' + ")'>Delete</button>" + "</th></tr>");
        }
        //else if(repo === "platforms")
            //$('#platformList').append("<tr><th>" + data[i].code + "</th><th>" + data[i].name.capitalize() + "</th><th>" + data[i].order + "</th><th>" + data[i].deps + "</th><th>" + "<button id='" + data[i]._id + "' name='layer: " + data[i].name.capitalize() + "' onclick='modifyStructure(this," + '"platform"' + ")'>Modify</button>" + "<button id='" + data[i]._id + "' name='platform: " + data[i].name.capitalize() + "' onclick='deleteStructure(this," + '"platform"' + ")'>Delete</button>" + "</th></tr>");
        //else
            //$('#superlayerList').append("<tr><th>" + data[i].code + "</th><th>" + data[i].name.capitalize() + "</th><th>" + data[i].order + "</th><th>" + "<button id='" + data[i]._id + "' name='layer: " + data[i].name.capitalize() + "' onclick='modifyStructure(this," + '"superlayer"' + ")'>Modify</button>" + "<button id='" + data[i]._id + "' name='superlayer: " + data[i].name.capitalize() + "' onclick='deleteStructure(this," + '"superlayer"' + ")'>Delete</button>" + "</th></tr>");
    }
}

function getRoute(form, route, id){

    var tail = "",
        param,
        url;

    if(route === 'insert' || route === 'retrieve')
        tail = "/v1/repo/usrs/" + user_data._id + "/" + form;
    else
        tail = "/v1/repo/usrs/" + user_data._id + "/"+ form +"/" + id;

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
        elements,
        proceed = true;


    if(request === "add"){
        if(form === "layer"){

            list = document.getElementById('layerList');
            elements = list.getElementsByTagName('th');

            for(i = 0, l = elements.length; i < l; i+=5){
                if((data.name.toLowerCase()).capitalize() === elements[i].innerHTML){
                    window.alert('Layer name in use');
                    return false;
                }
            }

            if(proceed){
                url = getRoute("layers", "insert");
                updateData(form, data.order, 'insert');
                sendRequest(url, 'POST', data);
            }
                
            updateList(form);
        }
        else{

            if(form === 'platform'){
                list = document.getElementById('platformList');
                url = getRoute("platfrms", "insert");
            }
            else{
                list = document.getElementById('superlayerList');
                url = getRoute("suprlays", "insert");
            }
            elements = list.getElementsByTagName('th');

            var repo;

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
                updateData(form, data.order, 'insert');
                sendRequest(url, 'PUT', data);
            }
            
            updateList(form);
        }
    }
    else{
        if(form === "layer"){

            list = document.getElementById('layerList');
            elements = list.getElementsByTagName('th');

            for(i = 0, l = elements.length; i < l; i+=5){
                if((data.name.toLowerCase()).capitalize() === elements[i].innerHTML && (data.name.toLowerCase()).capitalize() !== referenceName){
                    window.alert('Layer name in use');
                    return false;
                }
            }

            if(proceed){
                url = getRoute("layers", "update", referenceId);
                updateData(form, data.order, 'insert');
                sendRequest(url, 'PUT', data);
            }
                
            updateList(form);
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
            elements = list.getElementsByTagName('th');

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
                updateData(form, data.order, 'insert');
                sendRequest(url, 'PUT', data);
            }
            
            updateList(form);
        }
    }
}

function sendRequest(url, method, data){

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
                name:document.getElementById('layerName').value,
                lang:document.getElementById('layerLang').value,
                suprlay:superlayer,
                order:order
            };
        }
        else{
            data = {
                layer_id:referenceId,
                name:document.getElementById('layerName').value,
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
                name:document.getElementById('groupName').value,
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
                    name:document.getElementById('groupName').value,
                    logo:document.getElementById('groupCode').value + "_logo.png",
                    deps:$('#groupDeps').val(),
                    order:order
                };
            }
            else{
                data = {
                    suprlay_id:referenceId,
                    code:document.getElementById('groupCode').value,
                    name:document.getElementById('groupName').value,
                    logo:document.getElementById('groupCode').value + "_logo.png",
                    deps:$('#groupDeps').val(),
                    order:order
                };
            }
        }
    }

    return data;
}

function testData() {
    var _usr_id = {
        __v:0,
        _id:"56eb1b6442fbd3173fc1ecbd",
        avatar_url:"https://avatars.githubusercontent.com/u/17053960?v=3",
        axs_key:"56f40028d4a836556cb6c50a",
        email:"isaiasve30@hotmail.com",
        github_tkn:"2cf121cb74335cbd049f8626698b6e4f459e4925",
        name:"Isaías Taborda",
        upd_at:"56eb1b6442fbd3173fc1ecbc",
        usrnm:"isatab",
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

String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

init();