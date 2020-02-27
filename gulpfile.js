const { src, dest, watch, series } = require("gulp");
const pug = require("gulp-pug");
const sass = require("gulp-sass");
const browserSync = require("browser-sync").create();
const babel = require("gulp-babel");
const babelMinify = require("gulp-babel-minify");
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("gulp-autoprefixer");
const gulpif = require("gulp-if");
const cleanCSS = require("gulp-clean-css");
const include = require("gulp-include");
const imagemin = require("gulp-imagemin");
let build = false;

// Compile pug files into HTML
function html() {
  return src("src/pug/*.pug")
    .pipe(pug())
    .pipe(dest("dist"));
}

// Compile Js
function js() {
  return src("src/js/main.js")
    .pipe(include())
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ["@babel/env"]
      })
    )
    .pipe(gulpif(build, babelMinify()))
    .pipe(sourcemaps.write())
    .pipe(dest("dist/js"))
    .pipe(browserSync.stream());
}

const sassConfig = {
  includePaths: ["src/scss"],
  errLogToConsole: true,
  outputStyle: "nested",
  onError: browserSync.notify
};

// Compile sass files into CSS
function styles() {
  return src("src/scss/main.scss")
    .pipe(sourcemaps.init())
    .pipe(sass(sassConfig))
    .pipe(autoprefixer())
    .pipe(gulpif(build, cleanCSS()))
    .pipe(sourcemaps.write())
    .pipe(dest("dist/css"))
    .pipe(browserSync.stream());
}

// Copy fonts
function fonts() {
  return src("src/assets/fonts/*").pipe(dest("dist/assets/fonts/"));
}
// copy images or minimise them
function images() {
  return src("src/assets/images/**/*")
    .pipe(gulpif(build, imagemin()))
    .pipe(dest("dist/images"));
}

async function turnBuildOn() {
  build = true;
}

async function turnBuildOff() {
  build = false;
}

// Serve and watch sass/pug/js files for changes
function watchAndServe() {
  browserSync.init({
    server: "dist"
  });
  watch("src/scss/**/*.scss", styles);
  watch("src/pug/**/*.pug", html);
  watch("src/js/**/*.js", js);
  watch("src/assets/fonts/*", fonts);
  watch("src/assets/images/**/*", images);
  watch("dist/*.html").on("change", browserSync.reload);
}

exports.html = html;
exports.styles = styles;
exports.watch = watchAndServe;
exports.build = series(turnBuildOn, html, styles, js, fonts, images);
exports.default = series(
  turnBuildOff,
  html,
  styles,
  js,
  fonts,
  images,
  watchAndServe
);
