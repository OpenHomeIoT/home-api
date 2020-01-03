const { series, task } = require("gulp");
const rimraf = require("rimraf");

const build = require("./task/build");
const db = require("./task/db");

task("clean", function(done) {
  rimraf("./dist", done);
});
task("clean:db", db.cleanDatabases);
task("build:dev", series("clean", db.makeDBDirectory, build.developBuild));
task("build:prod", series("clean", db.makeDBDirectory, build.build));
