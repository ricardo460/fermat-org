var faker = require('faker');
var mongoose = require("mongoose");

exports.generateDataComp = function(){

    return {
        "platfrm_id" : mongoose.Types.ObjectId(),
        "suprlay_id" :  mongoose.Types.ObjectId(),
        "layer_id" :  mongoose.Types.ObjectId(),
        "name" : faker.name.firstName(),
        "type" : "addon",
        "description": faker.lorem.sentence(),
        "difficulty": 5,
        "code_level": faker.lorem.sentence(),
        "repo_dir": "root",
        "scrnshts": false,
        "found": false
    };

};

exports.generateDataCompDev = function(){
    return {
        "comp_id" : mongoose.Types.ObjectId(),
        "dev_id" :  mongoose.Types.ObjectId(),
        "role" : faker.name.firstName(),
        "scope": faker.name.firstName(),
        "percnt": 50
    };

};

exports.generateDataLifeCicle = function(){
    return {
        "comp_id" : mongoose.Types.ObjectId(),
        "name" : faker.name.firstName(),
        "target": Date(),
        "reached": Date()
    };
};