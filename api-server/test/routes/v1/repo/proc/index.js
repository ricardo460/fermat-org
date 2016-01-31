var supertest = require("supertest");
var should = require("should");
var mongoose = require("mongoose");
var server = supertest.agent("http://localhost:3002");
var procMod = require("../../../../../modules/repository/process");
var compMod = require("../../../../../modules/repository/component");
//var auth = require("../../../herlpers/v1/auth")
var dataHelper = require("../../../../helpers/v1/dataHelper");
var pathTest = "/v1/repo/usrs/1/procs"

mongoose.connect('mongodb://localhost/fermat-org-dev');

describe("PROC",function(){

  var proc;
  var stepIds = [];


  beforeEach(function(done){
    //add some test data
    var dataProc = dataHelper.generateDataProc();
    stepIds = [];

    procMod.insOrUpdProc(dataProc.platfrm, dataProc.name, dataProc.desc, dataProc.prev, dataProc.next, function(err_proc, res_proc){

        if (err_proc) return console.log(err_comp);

        var dataComp = dataHelper.generateDataComp();

        compMod.insOrUpdComp(dataComp.platfrm_id, dataComp.suprlay_id, dataComp.layer_id, dataComp.name, dataComp.type, dataComp.description, dataComp.difficulty, dataComp.code_level, dataComp.repo_dir, dataComp.scrnshts, dataComp.found, function(err_comp, res_comp){

            proc = res_proc;

            var loopStep=function(i){
                if(i<2){

                    var dataStep = dataHelper.generateDataStep();
                    procMod.insertStep(proc._id, res_comp._id, dataStep.type, dataStep.title, dataStep.desc, dataStep.order, function(err_step, res_step){

                        if (err_step) return console.log(err_step);
                        stepIds.push(res_step._id);
                        i = i+1;
                        loopStep(i);
                    });

                } else {

                    done();

                }
            }
            loopStep(0);

        });

    });

  });



  it("#POST addStep",function(done){

    var dataStep = dataHelper.generateDataStep();

    server
    .post(pathTest+"/"+proc._id+"/steps")
    .send(dataStep)
    .expect("Content-type",/json/)
    .expect(200) // This is HTTP response
    .end(function(err,res){

      if (err) return done(err);

      res.body._proc_id.should.equal(proc._id.toString());
      res.body._comp_id.should.equal(dataStep.comp_id);
      res.body.type.should.equal(dataStep.type.toLowerCase());
      res.body.title.should.equal(dataStep.title);
      res.body.desc.should.equal(dataStep.desc);
      res.body.order.should.equal(dataStep.order);
      res.body.should.have.property('_id');
      res.status.should.equal(200);

      return done();
    });

  });

  it("#PUT uptStep",function(done){

    var dataStep = dataHelper.generateDataStep();

    server
    .put(pathTest+"/"+proc._id+"/steps/"+stepIds[0])
    .send(dataStep)
    .expect("Content-type",/json/)
    .expect(200) // This is HTTP response
    .end(function(err, res){

        if (err) return done(err);

        res.body._comp_id.should.equal(dataStep.comp_id);
        res.body.type.should.equal(dataStep.type);
        res.body.title.should.equal(dataStep.title);
        res.body.desc.should.equal(dataStep.desc);
        res.body.order.should.equal(dataStep.order);
        res.status.should.equal(200);

      return done();
    });

  });

});