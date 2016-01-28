var supertest = require("supertest");
var should = require("should");
var server = supertest.agent("http://localhost:3000");
//var auth = require("../../../herlpers/v1/auth")
var pathTest = "v1/repo/usrs/1/comps"



describe("COMP",function(){

  // #1 should return home page

  it("#GET listLayers",function(done){

    // calling home page api
    server
    .get(pathTest+"/")
    .expect("Content-type",/json/)
    .expect(200) // THis is HTTP response
    .end(function(err,res){
        console.log(err);
        console.log(res);


      // HTTP status should be 200
      res.status.should.equal(200);
      // Error key should be false.
      res.body.error.should.equal(false);
      done();
    });
  });

});