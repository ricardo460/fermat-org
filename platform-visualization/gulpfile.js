// Include gulp
var gulp = require('gulp');
// Include plugins
var concat = require('gulp-concat');
var map = require('map-stream');
var jshint = require('gulp-jshint')

// Concatenate JS Files
gulp.task('scripts', function() {
    return gulp.src('src/*.js')
    .pipe(concat('main.js'))
    .pipe(gulp.dest('.'));
});

//Fail if jsHint fails
var exitOnJshintError = map(function (file, cb) {
  if (!file.jshint.success) {
    console.error('jshint failed');
    process.exit(1);
  }
});
gulp.task('lint', function() {
  gulp.src('main.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(exitOnJshintError);
});

// Default task
gulp.task('default', ['scripts', 'lint', 'watch']);

gulp.task('watch', function() {
    gulp.watch('src/*.js', ['scripts', 'lint']);
});