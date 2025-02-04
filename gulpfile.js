var gulp = require('gulp');
var ts = require('gulp-typescript');
var shell = require('gulp-shell');
var del = require('del');
var merge = require('merge2');
var sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var jasmine = require('gulp-jasmine');

gulp.task('cleanscripts', function(){
    return del(['dev-build/scripts/**/*.js','dev-build/scripts/**/*.js.map', 'dev-build/scripts/**/*.d.ts']);
});

gulp.task('cleanprodscripts', function(){
    return del(['prod-build/scripts/**/*.js', 'prod-build/scripts/**/*.d.ts']);
});

gulp.task('cleanspecs', function(){
    return del(['dev-build/spec/**/*.js', 'dev-build/spec/**/*.d.ts']);
});

gulp.task('compilescripts', function(){
    var tsScriptsProject = ts.createProject('scripts/tsconfig.json');
    var tsResult = tsScriptsProject.src('**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(ts(tsScriptsProject));
    return merge([ 
                 tsResult.dts.pipe(gulp.dest('')),  
                 tsResult.js.pipe(sourcemaps.write()).pipe(gulp.dest(''))
              ]);
});

gulp.task('buildprodscripts',['cleanprodscripts'], function(){
    var tsScriptsProject = ts.createProject('scripts/prod.tsconfig.json');
    var tsResult = tsScriptsProject.src('**/*.ts')
        .pipe(ts(tsScriptsProject));
       
    return merge([ 
                tsResult.dts.pipe(gulp.dest('')),  
                tsResult.js.pipe(uglify()).pipe(gulp.dest(''))
             ]);
});

gulp.task('compilespecs', function(){
    var tsSpecProject = ts.createProject('spec/tsconfig.json');
    var tsResult = tsSpecProject.src('**/*.ts')
        .pipe(ts(tsSpecProject));
    return tsResult.pipe(gulp.dest(''));
});

gulp.task('concatwithcode', function(){
    return gulp.src(['dev-build/scripts/TypeSharp.js', 'dev-build/spec/TypeSharpSpecs.js'])
    .pipe(concat('specfile.js'))
    .pipe(gulp.dest('dev-build/spec/')); 
});

gulp.task('cleanall',['cleanscripts','cleanspecs']);

gulp.task('runspecs', function(){
   return gulp.src('dev-build/spec/specfile.js')
   .pipe(jasmine());
});
 
gulp.task('executetests', function(){
    runSequence(['cleanscripts', 'cleanspecs'], 'compilescripts', 'compilespecs', 'concatwithcode','runspecs')
});

gulp.task('buildscripts', function() {
    runSequence('cleanscripts','compilescripts');
});
 
gulp.task('buildspecs', function() {
    runSequence( 'cleanspecs','compilespecs', 'concatwithcode');
});

gulp.task('buildall', function(){
  runSequence(['cleanscripts','cleanspecs'],'compilescripts','compilespecs', 'concatwithcode')  
});
 


