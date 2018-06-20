'use strict';

var fs = require('fs');
var path = require('path');
var async = require('async');
var SourceMapGenerator = require('source-map').SourceMapGenerator;

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
    Buffer.from(generator.toString()).toString('base64');
}

module.exports = function (route) {
  var error;
  var output;

  function make(files, done) {
    async.map(files, readFile, function (err, files) {
      if (err) {
        error = err;
        return done(err);
      }
      output = concat(files, route.sourceMap);
      done(undefined, output);
    });
  }

  var contentType = route.contentType || 'text/javascript';
  function middleware(req, res) {
    if (error) return res.status(500).end('Internal Server Error: ' + error);
    res.set('Content-Type', contentType);
    res.set('Content-Length', Buffer.byteLength(output));
    res.end(output);
  }

  return {
    make: make,
    middleware: middleware
  };
};
