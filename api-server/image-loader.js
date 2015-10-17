var fs = require('fs');
var path = require('path');
var winston = require('winston');

var filename;

var images = [];

var walkDir = function (directoryName) {
    'use strict';
    var files = fs.readdirSync(directoryName);

    var walkFile = function (i) {
        if (i < files.length) {
            filename = files[i];
            var fullPath = path.join(directoryName, filename);
            var file = fs.statSync(fullPath);
            if (file.isDirectory()) {
                walkDir(fullPath);
                walkFile(++i);
            } else {
                if (fullPath.indexOf(".jpg") > -1 || fullPath.indexOf(".jpeg") > -1 || fullPath.indexOf(".png") > -1 || fullPath.indexOf(".gif") > -1) {
                    var strFile = fullPath.replace('../platform-visualization', '.');
                    images.push(strFile);
                }
                walkFile(++i);
            }
        }
    };
    walkFile(0);
};

var root = '../platform-visualization/images';

walkDir(root);
var imagesStr = JSON.stringify(images.sort());

fs.writeFile('../platform-visualization/images.json', imagesStr, {
    flags: 'w'
}, function (err) {
    'use strict';
    if (err) {
        winston.log('info', 'Error reading or parsing file cache', err);
    }
});