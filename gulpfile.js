const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("postcss-csso");
const rename = require("gulp-rename");
const htmlmin = require("gulp-htmlmin");
const terser = require("gulp-terser");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");
const cssmin = require("gulp-clean-css")
const concat = require("gulp-concat")

// Styles

const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
      .pipe(less())
      .pipe(postcss([autoprefixer()]))
      .pipe(cssmin({compatibility: 'ie8'}))
      .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;
// html

const html = () => {
  return gulp.src("source/**/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
}

exports.html = html;

//js

const js = (done) => {
  return gulp.src("source/js/*.js")
    .pipe(sourcemap.init())
      .pipe(terser())
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/js"))
    .pipe(sync.stream()),
    done();
}

exports.js = js;

//Images

const image = () => {
  return gulp.src(["source/img/**/*.{png,jpg,svg}","!source/img/icons/*","!source/img/sprite.svg"])
  .pipe(imagemin([
    imagemin.mozjpeg({progressive: true}),
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest("build/img"));
}

const copyImages = (done) => {
  return gulp.src(["source/img/**/*.{png,jpg,svg}","!source/img/icons/*","!source/img/sprite.svg"])
    .pipe(gulp.dest("build/img")),
    done();
}


exports.image = image;
exports.image = copyImages;

//webp

const createWebp = (done) => {
  return gulp.src("source/img/**/*.{png,jpg}")
  .pipe(webp({quality: 80}))
  .pipe(gulp.dest("build/img")),
  done();
}

exports.createWebp = createWebp;


// Sprite

const sprite = () => {
  return gulp.src("source/img/icons/*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
}

exports.sprite = sprite;

// Copy

const copy = (done) => {
  gulp.src([
    "source/fonts/*.{woff2,woff}",
    "source/img/*.png",
    "source/*.ico",
    "source/img/**/*.svg",
    "!source/img/sprite.svg",
    "!source/img/icons/*.svg",
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
  done();
}

exports.copy = copy;

//copy Normalize

const copyNormalize = (done) => {
  del("build/css/normalize.css")
  gulp.src([
    "source/css/*.css",
  ])
  .pipe(gulp.dest("build/css"));
  done();
}

exports.copyNormalize = copyNormalize;
// Clean

const clean = () => {
  return del("build");
};

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;


// Reload

const reload = (done) => {
  sync.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series(styles, copyNormalize));
  gulp.watch("source/js/*.js", gulp.series(js));
  gulp.watch("source/*.html", gulp.series(html, reload, copyNormalize));
}

// Build

const build = gulp.series(
  clean,
  image,
  copy,
  gulp.parallel(
    styles,
    html,
    js,
    sprite,
    createWebp
  )
);

exports.build = build;

// Default

exports.default = gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    js,
    sprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  ));
