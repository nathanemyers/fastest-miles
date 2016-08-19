var gulp = require('gulp');
var uglify = require('gulp-uglify');
var usemin = require('gulp-usemin');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var babel = require('gulp-babel');

gulp.task('build', function() {
  return gulp.src(['index.html'])
    .pipe(usemin({
      css: [minifyCss()],
      libjs: [uglify()],
      js: [babel({presets: 'es2015'}), uglify()]
    }))
  .pipe(gulp.dest('dist/'));
});

gulp.task('moveData', function() {
  return gulp.src('data/*.csv')
    .pipe(gulp.dest('dist/data/'));
});
