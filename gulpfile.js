const gulp = require('gulp');
const ts = require('gulp-typescript');
const nodemon = require('gulp-nodemon');
const del = require('del');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');

const tsProject = ts.createProject('./tsconfig.json');

function cleanTypeScript() {
    return del([
        'dist/cron/**/*',
    ]);
};

function typescriptFiles() {
    return gulp.src('./src/**/*.ts')
        .pipe(tsProject())
        .on('error', function () { })
        .pipe(gulp.dest('dist'));
};

function watcher() {
    gulp.watch('./src/**/*.ts', processTypeScript);
}

const processTypeScript = gulp.series(cleanTypeScript, typescriptFiles);

let defaultTask;
if (process.env.NODE_ENV === 'production') {
    defaultTask = gulp.series(processTypeScript);
} else {
    defaultTask = gulp.series(processTypeScript, watcher);
}

gulp.task('default', defaultTask);