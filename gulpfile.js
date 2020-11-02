const gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    sass        = require('gulp-sass'),
    cleanCSS = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    imagemin = require('gulp-imagemin'),
    jsmin = require('gulp-jsmin'),
    buffer = require('vinyl-buffer'),
    log = require('gulplog'),
    babel = require('gulp-babel');

gulp.task('browserify', function () {
    const b = browserify({
      entries: 'src/js/account.js',
      debug: true
    });
  
    return b.bundle()
        .pipe(source('account.bundle.js'))
        .pipe(buffer())
        .pipe(jsmin())
        .pipe(babel({
            presets: ["@babel/preset-env"],
            plugins: ["@babel/plugin-transform-regenerator"]
        }))
        .on('error', log.error)
        .pipe(gulp.dest('src/js'));
});

gulp.task('js', function() {
    return gulp.src('src/**/*.js', {ignore: 'src/js/account.js'})
        .pipe(babel({
            presets: ["@babel/preset-env"],
            plugins: ["@babel/plugin-transform-regenerator"]
        }))
        .pipe(jsmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/'));
});

gulp.task('styles', function() {
    return gulp.src('src/sass/**/*.+(scss|sass)')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(autoprefixer())
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
});

gulp.task('imagemin', function() {
    return gulp.src('src/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'));
});

gulp.task('watch', function() {
    gulp.watch("src/sass/**/*.+(scss|sass)", gulp.parallel('styles'));
    gulp.watch("src/js/*.", gulp.parallel('js', 'browserify'));
});


gulp.task('default', gulp.parallel('watch', 'styles', 'browserify', 'js', 'imagemin'));