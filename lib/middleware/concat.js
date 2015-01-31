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
  options = options || {};
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

    // append the file content to the generated source
    source += file.content + '\n';
    line += count;
  });

  return source + '\n//# sourceMappingURL=data:application/json;base64,' +
    new Buffer(generator.toString()).toString('base64');
}

module.exports = function (route) {
  var contentType = route.contentType || 'text/javascript';
  return function (req, res) {
    var files = route.files;
    if (!(files instanceof Array)) files = [files];

    async.map(files, glob, function (err, files) {
      if (err) return res.status(500).send('Internal Server Error: ' + err);

      // flatten files
      files = flatten(files);
      async.map(files, readFile, function (err, files) {
        if (err) return res.status(500).send('Internal Server Error: ' + err);
        var output = concat(files, route.sourceMap);
        res.set('Content-Length', Buffer.byteLength(output));
        res.set('Content-Type', contentType);
        res.end(output);
      });
    });

  };
};
