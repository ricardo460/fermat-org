require('shelljs/global');

var getBook = function () {
    if (!which('git')) {
        echo('Sorry, this script requires git');
        exit(1);
    }

    if (!which('asciidoctor')) {
        echo('Sorry, this script requires asciidoctor');
        exit(1);
    }

    if (test('-d', './fermat')) {
        cd('fermat');
        if (exec('git reset --hard').code !== 0) {
            echo('Error: Git reset failed');
            exit(1);
        }
        if (exec('git pull').code !== 0) {
            echo('Error: Git pull failed');
            exit(1);
        }
        cd('fermat-documentation')
        if (exec('asciidoctor -d book documentation.asciidoc').code !== 0) {
            echo('Error: asciidoctor book failed');
            exit(1);
        } 
    } else {
        if (exec('git clone https://fuelusumar:21121734fractal@github.com/bitDubai/fermat.git').code !== 0) {
            echo('Error: Git clone failed');
            exit(1);
        }
        cd('fermat/fermat-documentation');
        if (exec('asciidoctor -d book documentation.asciidoc').code !== 0) {
            echo('Error: asciidoctor book failed');
            exit(1);
        } 
    }
};

exports.getBook = getBook;