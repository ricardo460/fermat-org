var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var apidoc = require('gulp-apidoc');
var nodemon = require('gulp-nodemon');
var ignore = require('gulp-ignore');
var rimraf = require('gulp-rimraf');
//
process.setMaxListeners(0);
//
var src_files = [
    'bin/*',
	'lib/**/*.{js,json}',
	'modules/**/*.{js,json}',
	'!node_modules/**/*',
	'routes/**/*.{js,json}',
	'test/**/*.{js,json}',
	'*.{js,json}'
];
// jslint task for source files and tests that don't require database connection
gulp.task('jslint', function () {
	return gulp.src(src_files).pipe(jshint({
		'undef': true,
		'unused': false,
		'node': true,
		'nomen': true,
		'plusplus': false,
		'latedef': true
	})).pipe(jshint.reporter('jshint-stylish'));
});
// mocha tests task for files that don't require database connection
gulp.task('mocha', ['jslint'], function () {
	return gulp.src(['test/**/*.{js,json}'], {
			read: false
		}).pipe(jshint.reporter('jshint-stylish')) //
		.pipe(mocha()) // 
		.once('end', function () {
			process.exit();
		});
});
// apidoc task that generates route documentation
gulp.task('apidoc', function (done) {
	apidoc({
		src: "routes/",
		dest: "apidoc/"
	}, done);
});
// clean folder task
gulp.task('clean', function () {
	return gulp.src(['build'], {
			read: false
		}) // much faster 
		//.pipe(ignore('build')) //
		.pipe(rimraf({
			force: true
		}));
});
// build task
gulp.task('build', ['clean', 'apidoc'], function () {
	gulp.src(['apidoc/**/*', 'assets/**/*', 'bin/**/*', 'cache/**/*', 'lib/**/*', 'modules/**/*', 'public/**/*', 'routes/**/*', 'views/**/*', '*.{js,json,sh}']).pipe(ignore(['deploy.json', '.gitignore', 'README.md'])).pipe(gulp.dest('build'));
});
// watch files changes
gulp.task('watch', function () {
	gulp.watch(src_files, ['jslint']);
});
// nodemon watch runs and refreshes the server when a file is modified
gulp.task('nodemon', function () {
	nodemon({
		script: 'bin/www',
		ext: 'js html json',
		watch: src_files,
		ignore: ['test/**/*'],
		env: {
			'NODE_ENV': 'development'
		}
	});
});