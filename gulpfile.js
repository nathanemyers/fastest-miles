var gulp = require('gulp');
var uglify = require('gulp-uglify');
var usemin = require('gulp-usemin');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var babel = require('gulp-babel');
var compass = require('gulp-compass');

gulp.task('build', ['moveData', 'moveAssets', 'compileSass'], function() {
  return gulp.src(['index.html'])
    .pipe(usemin({
      css: [minifyCss()],
      libjs: [uglify()],
      js: [babel({presets: 'es2015'}), uglify()]
    }))
  .pipe(gulp.dest('dist/'));
});

gulp.task('compileSass', function() {
  return gulp.src('sass/*.scss')
    .pipe(compass({
      config_file: './config.rb'
    }))
    .pipe(gulp.dest('stylesheets/'));
});

gulp.task('moveData', function() {
  return gulp.src('data/*.csv')
    .pipe(gulp.dest('dist/data/'));
});

gulp.task('moveAssets', function() {
  return gulp.src('assets/*.svg')
    .pipe(gulp.dest('dist/assets/'));
});

