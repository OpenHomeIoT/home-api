const { series, task } = require("gulp");
const rimraf = require("rimraf");
const nodemon = require("gulp-nodemon");

const build = require("./task/build");
const db = require("./task/db");

task("clean", function(done) {
  rimraf("./build", done);
});
task("clean:db", db.cleanDatabases);
task("build:dev", series("clean", db.makeDBDirectory, build.developBuild));
task("build:prod", series("clean", db.makeDBDirectory, build.build));
task("start:debug", series("build:dev", function(done) {
  nodemon({
    script: "./build/index.js",
    nodeArgs: ["--inspect-brk=9774"],
    ext: "js html css",
    env: { "NODE_ENV": "development" },
    tasks: ["build:dev"],
    watch: ["src"],
    done: done
  });
}));
task("start", series("build:dev", function(done) {
  nodemon({
    script: "./build/index.js",
    ext: 'js html css',
    env: { "NODE_ENV": "development" },
    tasks: ["build:dev"],
    watch: ["src"],
    quiet: true,
    done: done
  });
}));
