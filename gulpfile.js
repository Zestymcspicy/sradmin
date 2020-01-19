const gulp = require('gulp');
const browserSync = require('browser-sync');

let server = browserSync.create();

function serve() {
  server.init({
    server: {
      baseDir: './',
    }
  })

  gulp.watch([
    '*.html',
    '*.js',
    '*.css'
  ]).on('change', server.reload);
}

exports.serve = serve;
