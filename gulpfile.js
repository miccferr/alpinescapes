var gulp = require('gulp'),
	es = require('event-stream'),
	concat = require('gulp-concat'),
	ugliMin= require('gulp-uglifyjs'),
	sass = require('gulp-ruby-sass'),
	rename = require('gulp-rename'),
	targetCssDir = 'styles',
	gutil = require('gulp-util'),
	autoprefix = require('gulp-autoprefixer');



// CSS e SASS
gulp.task('css', function(){

	var vendorCSS = gulp.src(['node_modules/bootstrap/**/*.css','node_modules/leaflet-editinosm/**/*.css'] );
	var mySASS = sass('app/sass/main.sass', { style: 'compressed' }).on('error', gutil.log);
	
	return es.concat(vendorCSS,mySASS)
	.pipe(concat('app/styles.css'))
	.pipe(autoprefix('last 2 version'))
	.pipe(gulp.dest(targetCssDir));
});


// JS uno
gulp.task('js-uno', function(){
	var vendorScripts = gulp.src('app/vendor/*.js'),	
		$ = require('jquery'),
		Modernizr = require('modernizr'),
		L = require('leaflet'),
		LEditinosm = require('leaflet-editinosm');
		
	return es.ugliMin(vendorFiles, $, Modernizr, L, LEditinosm)
	.pipe(gulp.rename('bundleUno.js'))
	.pipe(gulp.dest('app/scripts'));
});

// JS due
gulp.task('js-due',['js-uno'], function(){
	var bundleUno = gulp.src('app/scripts/bundleUno.js');
	var myScript = gulp.src('app/scripts/main.js')
	
	return es.ugliMin(bundleUno, myScript)
	.pipe(gulp.rename('bundleTot.js'))
	.pipe(gulp.dest('scripts'));

});
