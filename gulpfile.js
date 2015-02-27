var gulp = require('gulp');
var es = require('event-stream');
var concat = require('gulp-concat');
var ugliMin= require('gulp-uglifyjs');
var sass = require('gulp-ruby-sass');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var autoprefix = require('gulp-autoprefixer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');



/*--CSS e SASS--*/
gulp.task('css', function(){

	var vendorCSS = gulp.src(['node_modules/bootstrap/**/*.css','node_modules/leaflet-editinosm/**/*.css'] );
	var mySASS = sass('app/sass/main.sass', { style: 'compressed' }).on('error', gutil.log);
	
	return es.concat(vendorCSS,mySASS)
	.pipe(concat('styles.css'))
	.pipe(autoprefix('last 2 version'))
	.pipe(gulp.dest('app/styles'));
});


/*--Javascript--*/

// JS-vendor
gulp.task('js-vendor', function(){
	
	return gulp.src('./app/vendor/*.js')
	.pipe(ugliMin())
	.pipe(rename('bundleUno.js'))
	.pipe(gulp.dest('./app/scripts/'));
});

// Broweserify
var getBundleName = function () {
  var version = require('./package.json').version;
  var name = require('./package.json').name;
  return version + '.' + name + '.' + 'min';
};

gulp.task('js', function() {

  var bundler = browserify({
    entries: ['./app/scripts/main.js'],
    debug: true
  });

  var bundle = function() {
    return bundler
      .bundle()
      .pipe(source(getBundleName() + '.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./app/scripts/dest'));
  };

  return bundle();
});

