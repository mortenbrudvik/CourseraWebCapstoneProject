var gulp = require('gulp');
var mainBowerFiles = require('main-bower-files');
var del = require('del');
var replace = require('gulp-replace');

var config = {
    paths: {
        html: {
            src:  ["./app/**/*.html", "!./app/bower_components/**", "!./app/index.html"],
            dest: "www"
        },
        javascript: {
            src:  ["./app/scripts/**/*.js"],
            dest: "www/scripts"
        },
        css: {
            src: ["./app/css/**/*.css"],
            dest: "www/css"
        },
        images: {
            src: ["./app/images/**"],
            dest: "www/images"
        },
        sounds: {
            src: ["./app/sounds/**"],
            dest: "www/sounds"
        },
        bower: {
            dest: "www/libs"
        }

    }
};

// Clean
gulp.task('clean', function() {
    return del(['www']);
});

gulp.task("html", function(){
    return gulp.src(config.paths.html.src)
        //.pipe(minifyHTML())
        .pipe(gulp.dest(config.paths.html.dest));
});

gulp.task("html", function(){
    return gulp.src(config.paths.html.src)
        .pipe(gulp.dest(config.paths.html.dest));
});

gulp.task("scripts", function(){
    return gulp.src(config.paths.javascript.src)
        //.pipe(uglify())
        //.pipe(concat("app.min.js"))
        .pipe(gulp.dest(config.paths.javascript.dest));
});

gulp.task("css", function(){
    return gulp.src(config.paths.css.src)
        //.pipe(cssmin())
        .pipe(gulp.dest(config.paths.css.dest));
});

gulp.task("images", function(){
    return gulp.src(config.paths.images.src)
        //.pipe(cssmin())
        .pipe(gulp.dest(config.paths.images.dest));
});

gulp.task("sounds", function(){
    return gulp.src(config.paths.sounds.src)
        //.pipe(cssmin())
        .pipe(gulp.dest(config.paths.sounds.dest));
});


gulp.task("bower", function(){
    return gulp.src(mainBowerFiles(), {base: "app/bower_components"})
        .pipe(gulp.dest(config.paths.bower.dest));
});


gulp.task('rename', function(){
  gulp.src(['./app/index.html'])
    .pipe(replace('bower_components', 'libs'))
    .pipe(gulp.dest('www/'));
});


gulp.task("default",
['clean'], function() {
    gulp.start("html", "scripts", "css", "bower", "images", "sounds", "rename");
});
