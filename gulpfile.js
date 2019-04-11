"use strict";

var gulp = require('gulp'),
	jade = require('gulp-jade'),
	sass = require('gulp-sass'),
	plumber = require('gulp-plumber'),
	postcss = require('gulp-postcss'),
	autoprefixer = require('autoprefixer'),
	server = require('browser-sync'),
	minify = require('gulp-csso'),
	rename = require('gulp-rename'),
	imagemin = require('gulp-imagemin'),
	svgstore = require('gulp-svgstore'),
	svgmin = require('gulp-svgmin'),
	del = require('del'),
	hash = require('gulp-rev-append'),
	gcmq = require('gulp-group-css-media-queries'),
	jsmin = require('gulp-jsmin');


gulp.task('clean', function() {
	return del('build/*');
});

gulp.task('copy', function() {
	return gulp.src([
		'src/fonts/**/*.{woff,woff2}'
	], {
		base: 'src'
	})
	.pipe(gulp.dest('build'));
});

gulp.task('imagemin', function() {
	return gulp.src('src/img/**/*.{png,jpg,gif}')
		.pipe(imagemin([
			imagemin.optipng({optimizationLevel: 3}),
			imagemin.jpegtran({progressive: true})
		]))
	.pipe(gulp.dest('build/img'));
});

gulp.task('svgsprite', function(){
	return gulp.src('src/img/*.svg')
		.pipe(svgmin())
		.pipe(svgstore({
			inlineSvg: true
		}))
		.pipe(rename('svg_sprite.svg'))
		.pipe(gulp.dest('build/img'));
});

gulp.task('jade', function(done) {
	gulp.src(['src/jade/*.jade'])
		.pipe(plumber())
		.pipe(jade())
		.pipe(gulp.dest('build/'))
		.pipe(server.reload({stream: true}));
	done();
});

gulp.task('style', function(done) {
	gulp.src(['src/sass/*.scss', '!src/sass/mixins.scss', '!src/sass/normalize.scss', '!src/sass/variable.scss'])
		.pipe(plumber())
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(postcss([
			autoprefixer(
				{browsers: [
				"last 1 version",
				"last 2 Chrome versions",
				"last 2 Firefox versions",
				"last 2 Opera versions",
				"last 2 Edge versions"],
				grid: true
			})
		]))
		.pipe(gcmq())
		.pipe(minify())
		.pipe(gulp.dest('build/css'))
		.pipe(server.reload({stream: true}));
	done();
});

gulp.task('script', function(done) {
	gulp.src('src/js/*.js')
		.pipe(plumber())
		.pipe(jsmin())
		.pipe(gulp.dest('build/js/'))
		.pipe(server.reload({stream: true}));
	done();
});

gulp.task('hash', function(done) {
	gulp.src('build/*.html')
		.pipe(hash())
		.pipe(gulp.dest('build'));
	done();
});

gulp.task('watcher', function(done) {
	server.init({
		server: 'build'
	});
	gulp.watch('src/sass/**/*.scss', gulp.series('style', 'hash'));
	gulp.watch('src/**/*.jade', gulp.series('jade', 'hash'));
	gulp.watch('src/js/*.js', gulp.series('script', 'hash'));
	done();
});

gulp.task('build', gulp.series('clean', 'copy', 'jade', 'style', 'script', 'imagemin', 'svgsprite', 'hash', function (done) {
    done();
}));