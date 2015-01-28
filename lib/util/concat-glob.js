'use strict';

var fs = require('fs');
var async = require('async');
var glob = require('glob');

function flatten(array) {
  return Array.prototype.concat.apply([], array);
}

module.exports = function (patterns, done) {

  // glob files
  async.map(patterns, glob, function (err, files) {
    if (err) return done(err);

    // flatten files
    files = flatten(files);

    // read files
    async.map(files, fs.readFile, function (err, contents) {
      if (err) return done(err);

      // concat files
      var content = contents.join('\n');
      done(undefined, content);

    });
  });
};
