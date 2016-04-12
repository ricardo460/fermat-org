var fs = require('fs');
var request = require('request');
var js2xmlparser = require("js2xmlparser");
var host = "http://localhost:8000/v1/"
var axs_token = ""
var usr_id = "qweqweqwe32132"

//get superlayers
request(host + "repo/usrs/"+usr_id+"/suprlays", function (error, response, body) {
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
        request(host + "repo/usrs/"+usr_id+"/layers", function (error, response, body) {
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
                    request(host + "repo/usrs/"+usr_id+"/platfrms", function (error, response, body) {
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
                                request(host + "repo/usrs/"+usr_id+"/comps", function (error, response, body) {
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
                                            request(host + "repo/usrs/"+usr_id+"/procs", function (error, response, body) {
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