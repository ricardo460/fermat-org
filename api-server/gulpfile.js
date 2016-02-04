var gulp = require('gulp');
var jshint = require('gulp-jshint');
//
gulp.task('jslint', function () {
	return gulp.src([
		'bin/*',
		'lib/**/*.{js,json}',
		'modules/**/*.{js,json}',
		'routes/**/*.{js,json}',
		'!node_modules/**/*',
		'*.{js,json}'
	]).pipe(jshint({
		'undef': true,
		'unused': false,
		'node': true,
		'nomen': true,
		'plusplus': false,
		'latedef': true
	})).pipe(jshint.reporter('jshint-stylish'));
	//.pipe(jshint.reporter('fail'))
	//.pipe(gulp.dest('dist'));
});
//
gulp.task('watch', function () {
	gulp.watch([
		'bin/*',
		'lib/**/*.{js,json}',
		'modules/**/*.{js,json}',
		'routes/**/*.{js,json}',
		'!node_modules/**/*',
		'*.{js,json}'
	], ['jslint']);
});