// Uses some ideas from https://gist.github.com/kevinSuttle/c8b198aaa30349088c35

var gulp = require('gulp');
var pkg = require('./package.json');
var common = require('./common/common');

var del           = require('del'),
    sass          = require('gulp-sass'),
    sourcemaps    = require('gulp-sourcemaps'),
    autoprefixer  = require('gulp-autoprefixer'),
    browserSync   = require('browser-sync'),
    reload        = browserSync.reload,
    tap           = require('gulp-tap'),
    runSequence   = require('run-sequence').use(gulp),
    exec          = require('child_process').exec,
    nodemon       = require('gulp-nodemon');

// Auto load all gulp plugins
var plug = require('gulp-load-plugins')();

// Paths
var paths = {
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
var _ = plug.loadUtils(['colors', 'env', 'log', 'date']);

// Create comments for minified files
var commentHeader = common.createComments(_);

// TASKS
// ----------------------------

// Js linter -- currently not used!
gulp.task('jshint', function() {
  return gulp.src(paths.source.jsMain)
             .pipe(plug.jshint('.jshintrc'))
             .pipe(plug.jshint.reporter('jshint-stylish'));
});

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
                 file.path = file.path.replace(/\.js$/, '.min.js');  // using gulp-tap to create a .min.js file with same name in same folder
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

gulp.task('build', function(cb) {
  runSequence('clean',
              ['css', 'js'],
              cb);
});

gulp.task('nodemon', function(cb) {
  var called = false;
  return nodemon({ script : pkg.main, ext : 'js vash ejs jade', ignore : ['./client/**', './logs/**'] }).on('start', function() {
    if (!called) {
      _.log(_.colors.green('Starting nodemon..'));
      called = true;
      cb();
    }
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
});

gulp.task('default', function(cb) {
  runSequence('build', 'watch', cb);
});

gulp.task('serveprod', function() {
  connect.server({
    root: paths.source.root,
    port: process.env.PORT || 5000, // localhost:5000
    livereload: false
  });
});

gulp.task('heroku:production', function(){
  runSequence('clean', 'js')
})