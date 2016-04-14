var fs = require('fs');
var request = require('request');
var js2xmlparser = require("js2xmlparser");
var host = "http://api.fermat.org/v1/";
var token = "";
var usr_id = "";
var env = "";
if (process.env.NODE_ENV == "development") {
    env = "development";
    token = "56c7895cc01a204369238c4b";
    usr_id = "56c7895cc01a204369238c43";
} else if (process.env.NODE_ENV == "production") {
    env = "production";
    token = "56c621557d20701f4148eaad";
    usr_id = "56c621557d20701f4148eaaa";
} else {
    env = "testing";
    token = "56d9946df87ede9a50462120";
    usr_id = "56d9946df87ede9a50462119";
}

//get superlayers
request(host + "repo/usrs/"+usr_id+"/suprlays?axs_key="+token+"&env="+env, function (error, response, body) {
  if (error) {
    console.log(error)
  } else {
    var json = {}
    json.suprlay = JSON.parse(body)
    fs.writeFile("./xmls/suprlays.xml", js2xmlparser("suprlays", json), function(err) {
        if(err) {
            return console.log(err);
        }
        //get layers
        request(host + "repo/usrs/"+usr_id+"/layers?axs_key="+token+"&env="+env, function (error, response, body) {
            if (error) {
                console.log(error)
            } else {
                var json = {}
                json.layer = JSON.parse(body)
                fs.writeFile("./xmls/layers.xml", js2xmlparser("layers", json), function(err) {
                    if(err) {
                        return console.log(err);
                    }
                    //get platforms
                    request(host + "repo/usrs/"+usr_id+"/platfrms?axs_key="+token+"&env="+env, function (error, response, body) {
                        if (error) {
                            console.log(error)
                        } else {
                            var json = {}
                            json.platform = JSON.parse(body)
                            fs.writeFile("./xmls/platforms.xml", js2xmlparser("platforms", json), function(err) {
                                if(err) {
                                    return console.log(err);
                                }
                                //get componentes
                                request(host + "repo/usrs/"+usr_id+"/comps?axs_key="+token+"&env="+env, function (error, response, body) {
                                    if (error) {
                                        console.log(error)
                                    } else {
                                        var json = {}
                                        json.comp = JSON.parse(body)
                                        var options = {
                                            "arrayMap": {
                                                "devs": "comp_dev",
                                                "life_cycle": "stage"
                                            }
                                        };
                                        fs.writeFile("./xmls/comps.xml", js2xmlparser("comps", json, options), function(err) {
                                            if(err) {
                                                return console.log(err);
                                            }
                                            //procs
                                            request(host + "repo/usrs/"+usr_id+"/procs?axs_key="+token+"&env="+env, function (error, response, body) {
                                                if (error) {
                                                    console.log(error)
                                                } else {
                                                    var json = {}
                                                    json.proc = JSON.parse(body)
                                                    var options = {
                                                        "arrayMap": {
                                                            "steps": "step"
                                                        }
                                                    };
                                                    fs.writeFile("./xmls/procs.xml", js2xmlparser("procs", json, options), function(err) {
                                                        if(err) {
                                                            return console.log(err);
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    }
                                });
                            });
                        }
                    });
                });
            }
        });
    });
  }
});