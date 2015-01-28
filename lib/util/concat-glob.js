'use strict';

var fs = require('fs');
var path = require('path');
var async = require('async');
var glob = require('glob');
var SourceMapGenerator = require('source-map').SourceMapGenerator;

function flatten(array) {
  return Array.prototype.concat.apply([], array);
}

function countLines(string) {
  if (!string) return 0;
  return (string.match(/\n/g) || []).length + 1;
}

function readFile(file, done) {
  fs.readFile(file, function (err, content) {
    if (err) return done(err);
    done(undefined, { file: file, content: content.toString() });
  });
}

function concat(files, options) {
  var source = '';
  var generator = new SourceMapGenerator({ file: '', sourceRoot: options.root });
  var line = 0;

  files.forEach(function (file) {
    var count = countLines(file.content);
    var filePath = options.base ? path.relative(options.base, file.file) : file.file;

    // generate the source mapping
    for (var i = 1; i <= count; i++) {
      generator.addMapping({
        source: filePath,
        original: { line: i, column: 0 },
        generated: { line: line + i, column: 0 }
      });
    }

    // add the source content to the map
    generator.setSourceContent(filePath, file.content);

    // append the file content to the generated source
    source += file.content + '\n';
    line += count;
  });

  return {
    source: source,
    map: generator,
    toString: function () {
      /*jshint validthis: true*/
      return this.source + '\n//# sourceMappingURL=data:application/json;base64,' +
        new Buffer(this.map.toString()).toString('base64');
    }
  };
}

module.exports = function (patterns, sourceMapOptions, done) {
  if (typeof sourceMapOptions === 'function') {
    done = sourceMapOptions;
    sourceMapOptions = {};
  }

  async.map(patterns, glob, function (err, files) {
    if (err) return done(err);

    // flatten files
    files = flatten(files);
    async.map(files, readFile, function (err, files) {
      if (err) return done(err);
      var output = concat(files, sourceMapOptions);
      done(undefined, output);
    });
  });
};
