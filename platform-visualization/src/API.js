/**
 * Static object with help functions commonly used
 */
function API() {

    var self = this;

    this.listDevs = {};

    this.getCompsUser = function(callback){

        var url = "";

        var list = {};

        var param;

        //window.session.useTestData();

        if(window.session.getIsLogin()){

            var usr = window.helper.clone(window.session.getUserLogin());

            url = window.helper.SERVER + "/v1/repo/usrs/"+usr._id+"/";

            param = {
                env : window.helper.ENV,
                axs_key : usr.axs_key
            };

            var port = window.helper.buildURL('', param);

            callAjax('comps', port, function(route, res){

               list[route] = res;

                callAjax('layers', port,function(route, res){

                    list[route] = res;

                    callAjax('platfrms', port,function(route, res){

                        list[route] = res;

                        callAjax('suprlays', port,function(route, res){

                            list[route] = res;

                            url = self.getAPIUrl("user");

                            callAjax('', '',function(route, res){

                                self.listDevs = res;

                                callback(list);

                            });
                        });
                    });
                });
            });
        }
        else{

            url = self.getAPIUrl("comps");

            callAjax('', '',function(route, res){

                list = res;

                url = self.getAPIUrl("user");

                callAjax('', '',function(route, res){

                    self.listDevs = res;

                    callback(list);

                });
            });
        }

        function callAjax(route, port, callback){

            $.ajax({
                url: url + route + port,
                method: "GET"
            }).success (
                function (res) {

                    if(typeof(callback) === 'function')
                        callback(route, res);

                });
        }

    };

    this.postRoutesEdit = function(type, route, params, data, doneCallback, failCallback){

        var method = "",
            setup = {},
            usr = window.helper.clone(window.session.getUserLogin()),
            param,
            url;

        param = {
                usrs : usr._id,
                env : window.helper.ENV,
                axs_key : usr.axs_key
            };

        for(var i in data)
            param[i] = data[i];

        route = type + " " + route;

        if(route.match('insert'))
            method = "POST";
        else if(route.match('update'))
            method = "PUT";
        else
            method = "DELETE";

        setup.method = method;
        setup.url = self.getAPIUrl(route, param);
        setup.headers = {
            "Content-Type": "application/json"
             };

        if(params)
            setup.data = params;

        makeCorsRequest(setup.url, setup.method, setup.data,
            function(res){

                switch(route) {

                    case "tableEdit insert":

                        if(res._id){

                            if(typeof(doneCallback) === 'function')
                                doneCallback(res);
                        }
                        else{

                            window.alert('There is already a component with that name in this group and layer, please use another one');

                            if(typeof(failCallback) === 'function')
                                failCallback(res);
                        }

                        break;
                    case "tableEdit update":

                        if(!exists("[component]")){

                            if(typeof(doneCallback) === 'function')
                                doneCallback(res);
                        }
                        else{

                            var name = document.getElementById('imput-Name').value;

                            if(window.fieldsEdit.actualTile.name.toLowerCase() === name.toLowerCase()){

                                if(typeof(doneCallback) === 'function')
                                    doneCallback(res);
                            }
                            else{

                                window.alert('There is already a component with that name in this group and layer, please use another one');

                                if(typeof(failCallback) === 'function')
                                    failCallback(res);
                            }
                        }

                        break;
                    case "wolkFlowEdit insert":

                        if(res._id){

                            if(typeof(doneCallback) === 'function')
                                doneCallback(res);
                        }
                        else{

                            if(typeof(failCallback) === 'function')
                                failCallback(res);
                        }

                        break;
                    case "wolkFlowEdit update":

                            doneCallback(res);
                        
                        break;

                    default:
                            if(typeof(doneCallback) === 'function')
                                    doneCallback(res);
                        break;
                }

            },
            function(res){

                if(typeof(failCallback) === 'function')
                    failCallback(res);
            }
        );

    };

    this.postValidateLock = function(route, data, doneCallback, failCallback){

        var msj = "Component",
            usr = window.helper.clone(window.session.getUserLogin()),
            param = {};

        if(route === "wolkFlowEdit")
            msj = "WolkFlow";

        param = {
                usrs : usr._id,
                env : window.helper.ENV,
                axs_key : usr.axs_key
            };

        for(var i in data)
            param[i] = data[i];

        route = route + " get";

        $.ajax({
            url:  self.getAPIUrl(route, param),
            method: 'GET',
            dataType: 'json',
            success:  function (res) {

                if(res._id)
                    doneCallback();
                else
                    failCallback();
            },
            error: function(res){

                if(res.status === 423){
                    window.alert("This " + msj + " is currently being modified by someone else, please try again in about 3 minutes");
                }
                else if(res.status === 404){
                    window.alert(msj + " not found");
                }
            }
        });
    };

    var makeCorsRequest = function(url, method, params, success, error) {

        //TODO: DELETE THIS IF
        if((method === "PUT" || method === "POST") && !url.match("/comps-devs/") && exists("[Component]")) {
            error();
        }
        else {
            var xhr = createCORSRequest(url, method);

            xhr.setRequestHeader('Content-type','application/json; charset=utf-8');

              if(!xhr) {
                window.alert('CORS not supported');
                return;
              }

            xhr.onload = function() {

                var res = null;

                if(method !== 'DELETE')
                    res = JSON.parse(xhr.responseText);

                success(res);

            };

            xhr.onerror = function() {

                error(arguments);

            };

            if(typeof params !== 'undefined'){

                var data = JSON.stringify(params);

                xhr.send(data);
            }
            else
                xhr.send();
        }

        function createCORSRequest(url, method) {

            var xhr = new XMLHttpRequest();

            if("withCredentials" in xhr)
                xhr.open(method, url, true);
            else
                xhr = null;

            return xhr;
        }
    };

    /**
     * Returns the route of the API server
     * @author Miguel Celedon
     * @param   {string} route The name of the route to get
     * @returns {string} The URL related to the requested route
     */
    this.getAPIUrl = function(route, params) {

        var tail = "";

        switch(route) {

            case "comps":
                tail = "/v1/repo/comps";
                break;
            case "procs":
                tail = "/v1/repo/procs";
                break;
            case "servers":
                tail = "/v1/net/servrs";
                break;
            case "nodes":
                tail = "/v1/net/nodes/:server/childrn";
                break;
            case "login":
                tail = "/v1/auth/login";
                break;
            case "logout":
                tail = "/v1/auth/logout";
                break;
            case "user":
                tail = "/v1/repo/devs";
                break;

            case "tableEdit insert":
                tail = "/v1/repo/usrs/:usrs/comps";
                break;
            case "tableEdit get":
            case 'tableEdit update':
            case 'tableEdit delete':
                tail = "/v1/repo/usrs/:usrs/comps/:comp_id";
                break;
            case "tableEdit insert dev":
                tail = "/v1/repo/usrs/:usrs/comps/:comp_id/comp-devs";
                break;
            case "tableEdit delete dev":
            case "tableEdit update dev":
                tail = "/v1/repo/usrs/:usrs/comps/:comp_id/comp-devs/:devs_id";
                break;

            case "wolkFlowEdit insert":
                tail = "/v1/repo/usrs/:usrs/procs";
                break;
            case "wolkFlowEdit get":    
            case "wolkFlowEdit update":
            case "wolkFlowEdit delete":
                tail = "/v1/repo/usrs/:usrs/procs/:proc_id";
                break;
            case "wolkFlowEdit insert step":
                tail = "/v1/repo/usrs/:usrs/procs/:proc_id/steps";
                break;
            case "wolkFlowEdit delete step":
            case "wolkFlowEdit update step":
                tail = "/v1/repo/usrs/:usrs/procs/:proc_id/steps/:steps_id";
                break;
        }

        return window.helper.buildURL(window.helper.SERVER + tail, params);
    };

    /**
     * TODO: MUST BE DELETED
     * @author Miguelcldn
     * @param {Object} data Post Data
     */
    function exists() { 

        if(window.actualView === 'table'){ 
        
            var group = $("#select-Group").val();
            var layer = $("#select-layer").val();
            var name = $("#imput-Name").val().toLowerCase();
            var type = $("#select-Type").val();
            var location;

            if(!window.TABLE[group].layers[layer])
                return false;
            else
                location = window.TABLE[group].layers[layer].objects;
            

            if(window.tableEdit.formerName){ 

                if(window.tableEdit.formerName.toLowerCase() === name) 
                    return false;
            }
            
            for(var i = 0; i < location.length; i++) {

                if(location[i].data.name.toLowerCase() === name && location[i].data.type === type) {
                    return true;
                }
            }
            
            return false;
        } 
        else{

            return false;
        }
    }
}
