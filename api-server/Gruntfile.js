var dirs = [
    'bin/*',
    'lib/**/*.js',
    'modules/**/*.js',
    'routes/**/*.js'
];

module.exports = function(grunt) {
    grunt.initConfig({
        watch: {
            scripts: {
                files: dirs,
                tasks: ['jshint'],
                options: {
                    spawn: false,
                },
            },
        },
        jshint: {
            all: dirs
        },
        jslint: { // configure the task
            // lint your project's server code
            server: {
                src: dirs,
                directives: { // example directives
                    node: true,
                    todo: true
                },
                options: {
                    edition: 'latest', // specify an edition of jslint or use 'dir/mycustom-jslint.js' for own path
                    junit: 'out/server-junit.xml', // write the output to a JUnit XML
                    log: 'out/server-lint.log',
                    jslintXml: 'out/server-jslint.xml',
                    errorsOnly: true, // only display errors
                    failOnError: false, // defaults to true
                    checkstyle: 'out/server-checkstyle.xml' // write a checkstyle-XML
                }
            }//,
            // lint your project's client code
            //client: {
                //src: [
                    //'client/**/*.js'
                //],
                //directives: {
                    //browser: true,
                    //predef: [
                        //'jQuery'
                    //]
                //},
                //options: {
                    //junit: 'out/client-junit.xml'
                //}
            //}
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jslint');
    grunt.registerTask('default', ['watch']);

};