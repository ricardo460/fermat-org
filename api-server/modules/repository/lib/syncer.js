require('shelljs/global');
var path = require('path');
var winston = require('winston');


var getBook = function () {
    'use strict';
    var env = process.env.NODE_ENV || 'development',
        folder = path.join(process.cwd(), 'cache', env),
        dir = path.join(folder, 'fermat');

    winston.log('info', 'Using %s as cache folder', folder);
    if (!which('git')) {
        echo('Sorry, this script requires git');
        exit(1);
    }

    if (!which('asciidoctor')) {
        echo('Sorry, this script requires asciidoctor');
        exit(1);
    }

    if (test('-d', dir)) {
        cd(dir);
        if (exec('git reset --hard').code !== 0) {
            echo('Error: Git reset failed');
            exit(1);
        }
        winston.log('info', 'Pulling repository');
        if (env === 'development') {
            if (exec('git checkout develop').code !== 0) {
                echo('Error: Git checkout failed');
                exit(1);
            }
            if (exec('git pull origin develop').code !== 0) {
                echo('Error: Git pull failed');
                exit(1);
            }
        } else {
            if (exec('git checkout master').code !== 0) {
                echo('Error: Git checkout failed');
                exit(1);
            }
            if (exec('git pull origin master').code !== 0) {
                echo('Error: Git pull failed');
                exit(1);
            }
        }
        cd('fermat-documentation');
        winston.log('info', 'Compiling documentation');
        if (exec('asciidoctor -d book documentation.asciidoc').code !== 0) {
            echo('Error: asciidoctor book failed');
            exit(1);
        }
    } else {
        cd(folder);
        winston.log('info', 'Cloning repository');
        if (exec('git clone https://fuelusumar:21121734fractal@github.com/bitDubai/fermat.git').code !== 0) {
            echo('Error: Git clone failed');
            exit(1);
        }
        if (env === 'development') {
            if (exec('git branch develop').code !== 0) {
                echo('Error: Git branch failed');
                exit(1);
            }
            if (exec('git checkout develop').code !== 0) {
                echo('Error: Git checkout failed');
                exit(1);
            }
            if (exec('git pull origin develop').code !== 0) {
                echo('Error: Git pull failed');
                exit(1);
            }
        }
        cd('fermat/fermat-documentation');
        winston.log('info', 'Compiling documentation');
        if (exec('asciidoctor -d book documentation.asciidoc').code !== 0) {
            echo('Error: asciidoctor book failed');
            exit(1);
        }
    }
};

exports.getBook = getBook;