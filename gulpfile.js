// Getting dependencies
var gulp          = require('gulp'),
    livereload    = require('gulp-livereload'),
    uglify        = require('gulp-uglify'),
    concat        = require('gulp-concat'),
    plumber       = require('gulp-plumber'),
    sourcemaps    = require('gulp-sourcemaps'),
    autoprefixer  = require('gulp-autoprefixer'),
    sass          = require('gulp-sass'),
    babel         = require('gulp-babel'),
    rename        = require('gulp-rename'),
    del           = require('del'),
    size          = require('gulp-size'),
    zip           = require('gulp-zip'),
    htmlmin       = require('gulp-htmlmin');

// Image minification plugins
var jpegoptim     = require('imagemin-jpegoptim'),
    pngquant      = require('imagemin-pngquant'),
    optipng       = require('imagemin-optipng'),
    svgo          = require('imagemin-svgo');

// File paths
var HTML_SRC        = './src/**/*.html',
    HTML_DEST       = './dist/',
    SCRIPTS_SRC     = './src/js/**/*.js',
    SCRIPTS_DEST    = './dist/js/',
    STYLES_SRC      = './src/css/**/*.scss',
    STYLES_DEST     = './dist/css/',
    IMAGES_SRC      = './src/img/**/*.{png,jpeg,jpg,jpe,gjpe,gif,svg}',
    IMAGES_DEST     = './dist/img/',
    SRC             = './src/',
    DEST            = './dist/';

// HTML
gulp.task('html', function() {
    return gulp.src(HTML_SRC)
        .pipe(gulp.dest(HTML_DEST))
        .pipe(livereload());
});

gulp.task('html-prod', function() {
    return gulp.src(HTML_SRC)
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest(HTML_DEST));
});

// STYLES
gulp.task('styles', function() {
    return gulp.src(STYLES_SRC)
        .pipe(plumber(function(err) {
            console.log(err);
            this.emit('end');
        }))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(sourcemaps.write())
        .pipe(rename('creative.css'))
        .pipe(gulp.dest(STYLES_DEST))
        .pipe(livereload());
});

// STYLES-PROD
gulp.task('styles-prod', function() {
    return gulp.src(STYLES_SRC)
    .pipe(autoprefixer())
    .pipe(sass({
        outputStyle: 'compressed'
    }))
    .pipe(rename('creative.css'))
    .pipe(gulp.dest(STYLES_DEST));
});

// SCRIPTS
gulp.task('scripts', function() {
    return gulp.src(SCRIPTS_SRC)
        .pipe(plumber(function(err) {
            console.log(err);
            this.emit('end');
        }))
        .pipe(sourcemaps.init())
        // .pipe(babel({
        //     presets: ['es2015']
        // }))
        .pipe(uglify())
        .pipe(concat('creative.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(SCRIPTS_DEST))
        .pipe(livereload());
});

// SCRIPTS-PROD
gulp.task('scripts-prod', function() {
    return gulp.src(SCRIPTS_SRC)
        .pipe(uglify())
        .pipe(concat('creative.js'))
        .pipe(gulp.dest(SCRIPTS_DEST));
});

// IMAGES
gulp.task('images', function() {
    return gulp.src(IMAGES_SRC)
        .pipe(plumber(function(err) {
            console.log(err);
            this.emit('end');
        }))
        .pipe(size({
        title: 'Uncompressed images'
        }))
        .pipe(pngquant({
        quality: '65-80'
        })())
        .pipe(optipng({
        optimizationLevel: 3
        })())
        .pipe(jpegoptim({
        max: 70
        })())
        .pipe(svgo()())
        .pipe(size({
        title: 'Compressed images'
        }))
        .pipe(gulp.dest(IMAGES_DEST))
        .pipe(livereload());
});

// CLEAN
gulp.task('clean', function() {
  return del.sync([
    DEST
  ]);
});

// DEFAULT
gulp.task('default', ['clean', 'html', 'styles', 'scripts', 'images'], function() {

});

// WATCH
gulp.task('watch', ['default'], function() {
    require('./server.js');
    livereload.listen();
    gulp.watch(HTML_SRC, ['html']);
    gulp.watch(STYLES_SRC, ['styles']);
    gulp.watch(SCRIPTS_SRC, ['scripts']);
    gulp.watch(IMAGES_SRC, ['images']);
});

// PROD
gulp.task('prod', ['clean', 'html-prod', 'styles-prod', 'scripts-prod', 'images'], function() {

});

// EXPORT
gulp.task('export', ['prod'], function() {
    return gulp.src('dist/**/*')
        .pipe(zip('bookeep.zip'))
        .pipe(gulp.dest('./'));
});
