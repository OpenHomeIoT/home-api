const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");

const DB_DIR = path.join(process.cwd(), ".db/");

function cleanDatabases(done) {
  rimraf(DB_DIR, done);
}

function makeDBDirectory(done) {
  if (!fs.existsSync(DB_DIR))
    fs.mkdirSync(DB_DIR);
  done();
}

cleanDatabases.displayName = "Clean Databases";
makeDBDirectory.displayName = "Make Database Directory";

exports.cleanDatabases = cleanDatabases;
exports.makeDBDirectory = makeDBDirectory;
