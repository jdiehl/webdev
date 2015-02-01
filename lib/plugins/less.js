'use strict';

var async = require('async');
var glob = require('glob');
var less = require('less');
var LessAutoprefixer = require('less-plugin-autoprefix');

function flatten(array) {
  return Array.prototype.concat.apply([], array);
}

function errorToString(err) {
  if (err.type === 'Parse') return 'Parse error in ' + err.filename + ':' + err.line + ' - ' + err.message;
  return 'Internal Server Error: ' + err;
}

module.exports = function (route) {
  var output;
  function make(done) {
    if (output) return done(undefined, output);
    async.map(route.files, glob, function (err, files) {
      if (err) return done(err);

      // flatten files
      files = flatten(files);

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
        if (result) output = result.css;
        done(err, output);
      });
    });
  }

  function invalidate(done) {
    output = undefined;
    make(done);
  }

  function middleware(req, res) {
    make(function (err, output) {
      if (err) return res.status(500).end(errorToString(err));
      res.set('Content-Type', 'text/css');
      res.set('Content-Length', Buffer.byteLength(output));
      res.end(output);
    });
  }

  return {
    make: invalidate,
    middleware: middleware
  };
};
