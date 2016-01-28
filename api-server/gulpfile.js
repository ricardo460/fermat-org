var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
gulp.task('lint', function () {
	return gulp.src([
		'bin/*',
		'lib/**/*.js',
		'modules/**/*.js',
		'routes/**/*.js',
		'!node_modules/**/*',
		'*.js'
	]).pipe(jshint({
		'undef': true,
		'unused': false,
		//todo: true,
		//this: true,
		'node': true,
		'nomen': true,
		//vars: true,
		'plusplus': false,
		//stupid: false,
		'latedef': true,
		//unparam: true
	})).pipe(jshint.reporter(stylish));
});
gulp.task('watch', function () {
	gulp.watch([
		'bin/*',
		'lib/**/*.js',
		'modules/**/*.js',
		'routes/**/*.js',
		'!node_modules/**/*',
		'*.js'
	], ['lint']);
});