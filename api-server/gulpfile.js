var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
//
gulp.task('jslint', function () {
	return gulp.src([
		'bin/*',
		'lib/**/*.js*',
		'modules/**/*.js*',
		'routes/**/*.js*',
		'!node_modules/**/*',
		'*.js*'
	]).pipe(jshint({
		'undef': true,
		'unused': false,
		'node': true,
		'nomen': true,
		'plusplus': false,
		'latedef': true
	})).pipe(jshint.reporter(stylish));
});
//
gulp.task('watch', function () {
	gulp.watch([
		'bin/*',
		'lib/**/*.js*',
		'modules/**/*.js*',
		'routes/**/*.js*',
		'!node_modules/**/*',
		'*.js*'
	], ['jslint']);
});