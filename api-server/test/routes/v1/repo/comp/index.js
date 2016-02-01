var supertest = require("supertest");
var should = require("should");
var mongoose = require("mongoose");
var server = supertest.agent("http://localhost:3002");
//var auth = require("../../../herlpers/v1/auth")
var dataHelper = require("../../../../helpers/v1/dataHelper");
var compMod = require("../../../../../modules/repository/component");
var compServ = require("../../../../../modules/repository/component/services/comp");
var pathTest = "/v1/repo/usrs/1/comps"

mongoose.connect('mongodb://localhost/fermat-org-dev');

describe("COMP",function(){

  var comp;
  var compDevIds = [];
  var statusIds = [];

  beforeEach(function(done){
    //add some test data
    var dataComp = dataHelper.generateDataComp();
    statusIds = [];
    compDevIds = [];

    compMod.insOrUpdComp(dataComp.platfrm_id, dataComp.suprlay_id, dataComp.layer_id, dataComp.name, dataComp.type, dataComp.description, dataComp.difficulty, dataComp.code_level, dataComp.repo_dir, dataComp.scrnshts, dataComp.found, function(err_comp, res_com){

        if (err_comp) return console.log(err_comp);
        comp = res_com;

        var loopCompDev=function(i){
          if(i<2){
            var dataCompDev = dataHelper.generateDataCompDev();
            compMod.insOrUpdCompDev(comp._id, dataCompDev.dev_id, dataCompDev.role, dataCompDev.scope, dataCompDev.percnt, function(err_comp_dev, res_comp_dev){

              if (err_comp_dev) return console.log(err_comp_dev);

              compServ.pushDevToCompById(comp._id, res_comp_dev._id, function(err_push_dev, res_push_dev){


                compDevIds.push(res_comp_dev._id);
                i = i+1;
                loopCompDev(i);

              });


            });

          } else {

            var loopLifeCicle = function(j){

              if(j<2){

                var dataLifeCicle = dataHelper.generateDataLifeCicle();
                compMod.insOrUpdStatus(comp._id, dataLifeCicle.name, dataLifeCicle.target, dataLifeCicle.reached, function(err_status, res_status){

                  if (err_status) return console.log(err_status);

                  compServ.pushStatusToCompLifeCycleById(comp._id, res_status._id, function(err_push_status, res_push_status){

                    statusIds.push(res_status._id);
                    j = j+1;
                    loopLifeCicle(j);

                  });

                });

              } else {
                done();
              }
            };
            loopLifeCicle(0);
          }
        }
        loopCompDev(0);
    });

  });

  it("#GET listComps",function(done){

    server
    .get(pathTest+"/")
    .expect("Content-type",/json/)
    .expect(200) // This is HTTP response
    .end(function(err,res){
      if (err) return done(err);

      res.status.should.equal(200);

      return done();
    });
  });

  it("#GET getComp",function(done){

    server
    .get(pathTest+"/"+comp._id)
    .expect("Content-type",/json/)
    .expect(200) // This is HTTP response
    .end(function(err,res){
      if (err) return done(err);

      res.body._id.should.equal(comp._id.toString());
      res.status.should.equal(200);

      return done();
    });
  });

  it("#POST addComp",function(done){

    var dataComp = dataHelper.generateDataComp();

    server
    .post(pathTest+"/")
    .send(dataComp)
    .expect("Content-type",/json/)
    .expect(201) // This is HTTP response
    .end(function(err,res){

      if (err) return done(err);

      res.body.should.have.property('_id');

      return done();
    });

  });

  it("#PUT uptComp",function(done){

    var dataComp = dataHelper.generateDataComp();

    server
    .put(pathTest+"/"+comp._id)
    .send(dataComp)
    .expect("Content-type",/json/)
    .expect(200) // This is HTTP response
    .end(function(err,res){

      if (err) return done(err);

      res.body._platfrm_id.should.equal(dataComp.platfrm_id);
      res.body._suprlay_id.should.equal(dataComp.suprlay_id);
      res.body._layer_id.should.equal(dataComp.layer_id);
      res.body.name.should.equal(dataComp.name);
      res.body.type.should.equal(dataComp.type);
      res.body.description.should.equal(dataComp.description);
      res.body.difficulty.should.equal(dataComp.difficulty);
      res.body.code_level.should.equal(dataComp.code_level);
      res.body.repo_dir.should.equal(dataComp.repo_dir);
      res.body.scrnshts.should.equal(dataComp.scrnshts);
      res.body.found.should.equal(dataComp.found);

      return done();
    });

  });

  it("#DELETE delComp",function(done){

    server
    .delete(pathTest+"/"+comp._id)
    .expect(204) // This is HTTP response
    .end(function(err,res){

      if (err) return done(err);

      return done();
    });

  });

  it("#POST addLifeCiclesToComp",function(done){

    var dataLifeCicle = dataHelper.generateDataLifeCicle();
    server
    .post(pathTest+"/"+comp._id+"/life-cicles")
    .send(dataLifeCicle)
    .expect("Content-type",/json/)
    .expect(201) // This is HTTP response
    .end(function(err,res){

      if (err) return done(err);

      return done();
    });

  });

  it("#POST addCompDev",function(done){

    var dataCompDev = dataHelper.generateDataCompDev();
    server
    .post(pathTest+"/"+comp._id+"/comp-devs")
    .send(dataCompDev)
    .expect("Content-type",/json/)
    .expect(201) // This is HTTP response
    .end(function(err,res){
      if (err) return done(err);

      res.body._comp_id.should.equal(comp._id.toString());
      res.body._dev_id.should.equal(dataCompDev.dev_id);
      res.body.role.should.equal(dataCompDev.role);
      res.body.percnt.should.equal(dataCompDev.percnt);
      res.body.should.have.property('_id');
      return done();
    });

  });

  it("#PUT uptCompDev",function(done){

    var dataCompDev = dataHelper.generateDataCompDev();
    server
    .put(pathTest+"/"+comp._id+"/comp-devs/"+compDevIds[0])
    .send(dataCompDev)
    .expect("Content-type",/json/)
    .expect(200) // This is HTTP response
    .end(function(err,res){

      if (err) return done(err);

      res.body._comp_id.should.equal(comp._id.toString());
      res.body._dev_id.should.equal(dataCompDev.dev_id);
      res.body.role.should.equal(dataCompDev.role);
      res.body.percnt.should.equal(dataCompDev.percnt);
      return done();
    });

  });

  it("#DELETE delCompDev",function(done){

    var dataCompDev = dataHelper.generateDataCompDev();
    server
    .delete(pathTest+"/"+comp._id+"/comp-devs/"+compDevIds[0])
    .expect(204) // This is HTTP response
    .end(function(err,res){

      if (err) return done(err);

      return done();
    });

  });

});