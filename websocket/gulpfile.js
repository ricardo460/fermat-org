// npm install --save-dev gulp gulp-jshint gulp-mocha gulp-nodemon gulp-ignore gulp-rimraf jshint-stylish
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var nodemon = require('gulp-nodemon');
var ignore = require('gulp-ignore');
var rimraf = require('gulp-rimraf');
var src_files = ['*.{js,json}'];
//
process.setMaxListeners(0);
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
gulp.task('build', ['clean'], function () {
	gulp.src(['*.json', '*.js']).pipe(ignore('flightplan.js')).pipe(ignore('gulpfile.js')).pipe(ignore('deploy.json')).pipe(gulp.dest('build'));
});
// watch files changes
gulp.task('watch', function () {
	gulp.watch(src_files, ['jslint']);
});
// nodemon watch runs and refreshes the server when a file is modified
gulp.task('nodemon', function () {
	nodemon({
		script: 'server.js',
		ext: 'js html json',
		watch: src_files,
		env: {
			'NODE_ENV': 'development'
		}
	});
});