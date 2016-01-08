var modDoc = require('./modules/repository/doc');
var loader = require('./modules/network/lib/loader.js');
var db = require('./db');
loader.getNetwork(function () {
    console.log(arguments);
});
/*modDoc.generateBookPdf(function (err, res) {
            if (err) {
                console.log('error', err);
            } else {
                console.log('info', 'Books are generated');
            }
        });

modDoc.getPaperPdf(undefined,function (err, res) {
            if (err) {
                console.log('error', err);
            } else {
                console.log('info', 'Paper are generated');
            }
        });

modDoc.getPaperPdf('big',function (err, res) {
            if (err) {
                console.log('error', err);
            } else {
                console.log('info', 'Paper big are generated');
            }
        });

modDoc.getReadmePdf(undefined,function (err, res) {
            if (err) {
                console.log('error', err);
            } else {
                console.log('info', 'Readme are generated');
            }
        });

modDoc.getReadmePdf('big',function (err, res) {
            if (err) {
                console.log('error', err);
            } else {
                console.log('info', 'Readme big are generated');
            }
        }); */