var gulp = require('gulp'),
	es = require('event-stream'),
	concat = require('gulp-concat'),
	sass = require('gulp-ruby-sass'),
	targetCssDir = 'styles',
	gutil = require('gulp-util'),
	autoprefix = require('gulp-autoprefixer');



// CSS e SASS
gulp.task('css', function(){

	var vendorCSS = gulp.src(['node_modules/bootstrap/**/*.css','node_modules/leaflet-editinosm/**/*.css'] );
	var mySASS = sass('sass/main.sass', { style: 'compressed' }).on('error', gutil.log);
	
	return es.concat(vendorCSS,mySASS)
	.pipe(concat('styles.css'))
	.pipe(autoprefix('last 2 version'))
	.pipe(gulp.dest(targetCssDir));
});



// gulp.task('sass', function () {
// 	return sass('sass/*.scss')	
// 	.pipe(gulp.dest('dest'));
// });

// var es = require('event-stream'),
// concat = require('gulp-concat');

// // CSS e SASS
// gulp.task('css', function(){
// 	var vendorFiles = gulp.src('/glob/for/vendor/files');
// 	var appFiles = gulp.src(sassDir + '/main.scss')
// 	.pipe(sass({ style: 'compressed' }).on('error', gutil.log));

// 	return es.concat(vendorFiles, appFiles)
// 	.pipe(concat('output-file-name.css'))
// 	.pipe(autoprefix('last 10 version'))
// 	.pipe(gulp.dest(targetCssDir));
// });