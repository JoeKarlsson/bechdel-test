'use strict';

const gulp          = require('gulp');
const pkg           = require('./package.json');
const common        = require('./common/common');
const del           = require('del');
const sass          = require('gulp-sass');
const sourcemaps    = require('gulp-sourcemaps');
const autoprefixer  = require('gulp-autoprefixer');
const browserSync   = require('browser-sync');
const reload        = browserSync.reload;
const tap           = require('gulp-tap');
const runSequence   = require('run-sequence').use(gulp);
const exec          = require('child_process').exec;
const connect       = require('gulp-connect');
const nodemon       = require('gulp-nodemon');
const concat        = require('gulp-concat');
const babel         = require('gulp-babel');


// Auto load all gulp plugins
const plug = require('gulp-load-plugins')();

// Paths
const paths = {
  source : {
    root : './client',
    css : [
        './client/css/**/*.css',
        '!./client/css/**/*.min.css'
    ],
    sass : [
        './client/scss',
        './client/lib/github/zurb/bower-foundation@5.5.2/scss'
    ],
    sassMain : './client/scss/app.scss',
    js : './client/**/*.js',
    jsMain : './client/app.js'
  },
  dest : {
    css : './client/css',
    cssMain : 'app.min.css',
    jsMain : './client/app.min.js'
  }
};

// Load common utils
const _ = plug.loadUtils(['colors', 'env', 'log', 'date']);

// Create comments for minified files
const commentHeader = common.createComments(_);

// TASKS
// ----------------------------

// uses jspm to create a self-executing bundle at /client/app.js
gulp.task('jspmBundle', function(cb) {
  exec('jspm bundle-sfx app/main ' + paths.source.jsMain, function(err) {
    if (err) return cb(err);
    cb();
  });
});

// js minify & header injection
gulp.task('js', ['jspmBundle'], function() {
  return gulp.src(paths.source.jsMain)
             .pipe(plug.size({ showFiles : true }))
             .pipe(plug.uglify())
             .pipe(plug.header(commentHeader))
               .pipe(tap(function(file,t) {

                // using gulp-tap to create a .min.js file with same name in same folder
                 file.path = file.path.replace(/\.js$/, '.min.js');
               }))
               .pipe(gulp.dest(paths.source.root))
               .pipe(plug.size({ showFiles : true }));
});

// converting sass to css
gulp.task('sass', function() {
  return gulp.src(paths.source.sassMain)
               .pipe(sass({
                 includePaths : paths.source.sass,
                 outputStyle : 'nested'
               }, { errLogToConsole : true }))
               .pipe(autoprefixer())
               .pipe(gulp.dest(paths.dest.css));
});

// css minify & bundling
gulp.task('css', ['sass'], function() {
  return gulp.src(paths.source.css)
             .pipe(plug.size({ showFiles : true }))
             .pipe(sourcemaps.init())
             .pipe(plug.minifyCss({}))
             .pipe(plug.concat(paths.dest.cssMain))
             .pipe(plug.header(commentHeader))
             .pipe(sourcemaps.write('.'))
             .pipe(gulp.dest(paths.dest.css))
             .pipe(plug.size({ showFiles : true }));
});

gulp.task('clean', function(cb) {
  del([paths.dest.css, paths.source.root + '/app*'], function(err, paths) {
    var msg = 'Deleted files/folders:\n' + paths.join('\n');
    _.log(_.colors.yellow(msg));

    cb();
  });
});

gulp.task('babel', function () {
  return gulp.src("src/**/*.js")
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist"));
});

gulp.task('build', function(cb) {
  runSequence('clean',
              ['css', 'js'],
              ['babel'],
              cb);
});

gulp.task('nodemon', function(cb) {
  var called = false;
  return nodemon({ script : pkg.main, ext : 'js', ignore : ['./client/**', './dist/**'] }).on('start', function() {
    if (!called) {
      _.log(_.colors.green('Starting nodemon..'));
      called = true;
      cb();
    }
  })
  .on('restart', function () {
    console.log('Server restarted!')
  });
});

gulp.task('browser-sync', ['nodemon'], function() {
  browserSync({
    proxy : 'http://localhost:5000'
  });
});

function reportChange(event) {
  _.log('File ' + _.colors.green(event.path) + ' was ' + _.colors.yellow(event.type) + ', running tasks...');
}

gulp.task('watch', ['browser-sync'], function() {
  gulp.watch(paths.source.sassMain, ['sass', reload({ stream : true })]).on('change', reportChange);
  gulp.watch(paths.source.js, ['', reload]).on('change', reportChange);
  gulp.watch("src/**/*.js", ['babel']).on('change', reportChange);
});

gulp.task('default', function(cb) {
  runSequence('build', 'watch', cb);
});


gulp.task('heroku:production', function() {
  runSequence('clean', ['css', 'start:production']);
})

gulp.task('start:production', function () {
  nodemon({
    script : 'server.js',
    ext : 'js html'
  })
})