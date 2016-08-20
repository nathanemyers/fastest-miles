var fs = require('fs');

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var usemin = require('gulp-usemin');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var babel = require('gulp-babel');
var polyfill = require('babel-polyfill');
var compass = require('gulp-compass');
var replace = require('gulp-replace');
var scp = require('gulp-scp2');

var secret = JSON.parse(fs.readFileSync('secret.json', 'utf8'));

var dataUrl = secret.dataUrl;
var assetUrl = secret.assetUrl;

gulp.task('deploy', ['build'], function() {
  return gulp.src('dist/')
    .pipe(scp({
      host: secret.server,
      username: secret.username,
      password: secret.password,
      dest: secret.serverDestination
    }))
    .on('error', function(err) {
      console.log(err);
    });
});

gulp.task('build', ['moveData', 'moveAssets', 'compileSass'], function() {
  return gulp.src(['src/index.html'])
    .pipe(usemin({
      css: [minifyCss()],
      libjs: [uglify()],
      js: [
        replace('\.\.\/data', dataUrl), 
        replace('\.\.\/assets', assetUrl), 
        //babel({presets: 'es2015'}), 
        //uglify()
      ]
    }))
  .pipe(gulp.dest('dist/'));
});

gulp.task('compileSass', function() {
  return gulp.src('src/sass/*.scss')
    .pipe(compass({
      config_file: './config.rb',
      css: 'src/stylesheets',
      sass: 'src/sass'
    }))
    .pipe(gulp.dest('src/stylesheets/'));
});

gulp.task('moveData', function() {
  return gulp.src('data/*.csv')
    .pipe(gulp.dest('dist/data/'));
});

gulp.task('moveAssets', function() {
  return gulp.src('assets/*.svg')
    .pipe(gulp.dest('dist/assets/'));
});

