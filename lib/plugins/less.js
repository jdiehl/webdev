'use strict';

var less = require('less');
var LessAutoprefixer = require('less-plugin-autoprefix');

function errorToString(err) {
  if (err.type === 'Parse') return 'Parse error in ' + err.filename + ':' + err.line + ' - ' + err.message;
  return 'Internal Server Error: ' + err;
}

module.exports = function (route) {
  var error;
  var output;

  function make(files, done) {
    // create @imports
    var source = '';
    files.forEach(function (file) {
      source += '@import "' + file + '";\n';
    });

    // set up options
    var options = route.options || {};
    options.sourceMap = route.sourceMap || {};
    options.sourceMap.sourceMapFileInline = true;
    options.sourceMap.sourceMapBasepath = options.sourceMap.base;

    // set up autoprefixer
    var autoprefixPlugin = new LessAutoprefixer({ browsers: ['last 2 versions'] });
    options.plugins = [autoprefixPlugin];

    // render less
    less.render(source, options, function (err, result) {
      error = err;
      if (result) output = result.css;
      done(err, output);
    });
  }

  function middleware(req, res) {
    if (error) return res.status(500).end(errorToString(error));
    res.set('Content-Type', 'text/css');
    res.set('Content-Length', Buffer.byteLength(output));
    res.end(output);
  }

  return {
    make: make,
    middleware: middleware
  };
};
