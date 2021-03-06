const { src, dest } = require("gulp");
const babel = require("gulp-babel");
const sourcemaps = require("gulp-sourcemaps");
const inject = require("gulp-inject-string");

function build() {
  return src("src/**/*.js")
  .pipe(babel())
  .pipe(inject.replace("process.env.NODE_ENV", '"production"'))
  .pipe(dest("build/"));
}

function developBuild() {
  return src("src/**/*.js", { base: "src" })
  .pipe(sourcemaps.init())
  .pipe(babel({
    presets: ["@babel/preset-env"],
  }))
  .pipe(sourcemaps.write(".", { includeContent: false, sourceRoot: "../src" }))
  .pipe(dest("build/"));
}


build.displayName = "Build for Production";
developBuild.displayName = "Build for Development";

exports.build = build;
exports.developBuild = developBuild;
