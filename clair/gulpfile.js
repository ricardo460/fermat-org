//*****************************************
//*THIS FILE MIGHT BE NOT NECESARY ANYMORE*
//*****************************************


// Include gulp
var gulp = require('gulp');
// Include plugins
var concat = require('gulp-concat');
var tsconfig = require('gulp-tsconfig-update');
var exec = require('gulp-exec');

// Concatenate JS Files
gulp.task('build', function() {
    gulp.src('.')
    .pipe(exec('tsc'))
    .pipe(exec.reporter());
});

gulp.task('build-tsconfig', function() {
    gulp.src(['src/*.ts', 'src/*.d.js', 'src/*.js', '../typings/index.d.ts'])
    .pipe(tsconfig());
});

// Default task
gulp.task('default', ['build', 'watch']);

gulp.task('watch', function() {
    gulp.watch(['src/*.ts', 'src/*.js'], ['build']);
    gulp.watch('tsconfig.json', ['build-tsconfig']);
});