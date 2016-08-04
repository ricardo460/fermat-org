/**
 * Static object with help functions commonly used
 */
class API {

    listDevs = {};

    getCompsUser(callback: (Object) => void): void {

        let url: string;
        let list = {};
        let param = {
            env: '',
            axs_key: ''
        };

        //window.session.useTestData();

        if (window.session.getIsLogin() && !window.disconnected) {
            let usr = Helper.clone(window.session.getUserLogin());
            url = Helper.SERVER + "/v1/repo/usrs/" + usr._id + "/";

            param = {
                env: Constants.API_ENV,
                axs_key: usr.axs_key
            };

            let port = Helper.buildURL('', param);

            callAjax('comps', port, (route: string, res: Object) => {
                list[route] = res;
                callAjax('layers', port, (route: string, res: Object) => {
                    list[route] = res;
                    callAjax('platfrms', port, (route: string, res: Object) => {
                        list[route] = res;
                        callAjax('suprlays', port, (route: string, res: Object) => {
                            list[route] = res;
                            url = this.getAPIUrl("user");
                            callAjax('', '', (route: string, res: Object) => {
                                this.listDevs = res;
                                callback(list);
                            });
                        });
                    });
                });
            });
        }
        else {
            if (!window.disconnected)
                url = this.getAPIUrl("comps");
            else
                url = 'json/testData/comps.json';

            callAjax('', '', (route: string, res: Object) => {
                list = res;
                if (!window.disconnected)
                    url = this.getAPIUrl("user");
                else
                    url = 'json/testData/devs.json';

                callAjax('', '', (route: string, res: Object) => {
                    this.listDevs = res;
                    callback(list);
                });
            });
        }

        function callAjax(route: string, port: string, callback: (string, Object) => void) {
            let URL = url + route + port;
            if (window.disconnected)
                URL = url;

            $.ajax({
                url: URL,
                method: "GET"
            }).done((res) => {
                if (typeof (callback) === 'function')
                    callback(route, res);
            });
        }

    };

    postRoutesEdit(type: string, route: string, params: Object, data: Object, doneCallback: (Object) => void, failCallback: (Object) => void): void {

        let method = "",
            setup = {
                method: '',
                url: '',
                headers: {},
                data: null
            },
            usr = Helper.clone(window.session.getUserLogin()),
            url: string;

        let param = {
            usrs: usr._id,
            env: Constants.API_ENV,
            axs_key: usr.axs_key
        };

        for (let i in data)
            param[i] = data[i];

        route = type + " " + route;

        if (route.match('insert'))
            method = "POST";
        else if (route.match('update'))
            method = "PUT";
        else
            method = "DELETE";

        setup.method = method;
        setup.url = this.getAPIUrl(route, param);
        setup.headers = {
            "Content-Type": "application/json"
        };

        if (params)
            setup.data = params;

        this.makeCorsRequest(setup.url, setup.method, setup.data,
            (res) => {

                switch (route) {

                    case "tableEdit insert":
                        if (res) {
                            if (res._id) {
                                if (typeof (doneCallback) === 'function')
                                    doneCallback(res);
                            }
                            else {
                                window.alert('There is already a component with that name in this group and layer, please use another one');
                                if (typeof (failCallback) === 'function')
                                    failCallback(res);
                            }
                        }
                        else {
                            if (typeof (failCallback) === 'function')
                                failCallback(res);
                        }
                        break;
                    case "tableEdit update":
                        if (!this.selectedComponentExists()) {
                            if (typeof (doneCallback) === 'function')
                                doneCallback(res);
                        }
                        else {
                            let name = (document.getElementById('imput-Name') as HTMLInputElement).value;
                            if (window.fieldsEdit.actualTile.name.toLowerCase() === name.toLowerCase()) {
                                if (typeof (doneCallback) === 'function')
                                    doneCallback(res);
                            }
                            else {
                                window.alert('There is already a component with that name in this group and layer, please use another one');
                                if (typeof (failCallback) === 'function')
                                    failCallback(res);
                            }
                        }
                        break;
                    case "wolkFlowEdit insert":
                        if (res) {
                            if (res._id) {
                                if (typeof (doneCallback) === 'function')
                                    doneCallback(res);
                            }
                            else {
                                if (typeof (failCallback) === 'function')
                                    failCallback(res);
                            }
                        }
                        else {
                            if (typeof (failCallback) === 'function')
                                failCallback(res);
                        }
                        break;
                    case "wolkFlowEdit update":
                        doneCallback(res);
                        break;
                    default:
                        if (typeof (doneCallback) === 'function')
                            doneCallback(res);
                        break;
                }
            },
            (res) => {
                if (typeof (failCallback) === 'function')
                    failCallback(res);
            }
        );
    };

    postValidateLock(route: string, data: Object, doneCallback: () => void, failCallback: () => void): void {

        let msj = "Component",
            usr = Helper.clone(window.session.getUserLogin());

        if (route === "wolkFlowEdit")
            msj = "WolkFlow";

        let param = {
            usrs: usr._id,
            env: Constants.API_ENV,
            axs_key: usr.axs_key
        };

        for (let i in data)
            param[i] = data[i];

        route = route + " get";

        $.ajax({
            url: this.getAPIUrl(route, param),
            method: 'GET',
            dataType: 'json',
            success: (res) => {

                if (res._id)
                    doneCallback();
                else
                    failCallback();
            },
            error: (res) => {

                if (res.status === 423) {
                    window.alert("This " + msj + " is currently being modified by someone else, please try again in about 3 minutes");
                }
                else if (res.status === 404) {
                    window.alert(msj + " not found");
                }
            }
        });
    };

    makeCorsRequest(url: string, method: string, params: Object, success: (Object) => void, error: (Object?) => void) {

        //TODO: DELETE THIS IF
        if ((method === "PUT" || method === "POST") && !url.match("/comps-devs/") && this.selectedComponentExists()) {
            error();
        }
        else {
            let xhr = createCORSRequest(url, method);

            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

            if (!xhr) {
                window.alert('CORS not supported');
                return;
            }

            xhr.onload = () => {
                let res = null;

                if (method !== 'DELETE') {
                    //if(xhr.responseText.match("_id[a-z0-9-A-Z0-9]*"))
                    res = JSON.parse(xhr.responseText);
                    /*else 
                        window.alert(xhr.responseText);*/
                }
                success(res);
            };
            xhr.onerror = function () {
                error(arguments);
            };

            if (typeof params !== 'undefined') {
                let data = JSON.stringify(params);
                xhr.send(data);
            }
            else
                xhr.send();
        }

        function createCORSRequest(url, method) {

            let xhr = new XMLHttpRequest();

            if ("withCredentials" in xhr)
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
    getAPIUrl(route: string, params?: Object): string {
        return Helper.getAPIUrl(route, params);
    };

    /**
     * @author Miguelcldn
     * @lastmodifiedBy Ricardo Delgado
     * @param {Object} data Post Data
     */
    selectedComponentExists(): boolean {

        if (window.actualView === 'table') {

            let group = $("#select-Group").val();
            let layer = $("#select-layer").val();
            let name = $("#imput-Name").val().toLowerCase();
            let type = $("#select-Type").val();
            let location;

            if (!window.TABLE[group].layers[layer])
                return false;
            else
                location = window.TABLE[group].layers[layer].objects;

            if (window.fieldsEdit.actualTile) {
                if (window.fieldsEdit.actualTile.name.toLowerCase() === name.toLowerCase())
                    return false;
            }

            for (let i = 0; i < location.length; i++) {
                if (location[i].data.name.toLowerCase() === name.toLowerCase() && location[i].data.type === type) {
                    return true;
                }
            }

            return false;
        }
        else {
            return false;
        }
    }
}
