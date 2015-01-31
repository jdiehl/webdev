'use strict';

var async = require('async');
var glob = require('glob');
var less = require('less');
var LessAutoprefixer = require('less-plugin-autoprefix');

function flatten(array) {
  return Array.prototype.concat.apply([], array);
}

module.exports = function (route) {
  return function (req, res) {
    var files = route.files;
    if (!(files instanceof Array)) files = [files];

    async.map(files, glob, function (err, files) {
      if (err) return res.status(500).end('Internal Server Error: ' + err);

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
      less.render(source, options, function (err, output) {
        if (err) return res.status(500).send('Internal Server Error: ' + err);
        res.set('Content-Length', Buffer.byteLength(output.css));
        res.end(output.css);
      });
    });

  };
};
