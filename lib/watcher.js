'use strict';

var gaze = require('gaze');
var async = require('async');
var glob = require('glob');
var livereload = require('./livereload');

function sortFileSets(input) {
  var output = [];
  var delimiterRegExp = new RegExp('/', 'g');
  input.forEach(function (files) {
    output = output.concat(files.sort(function (a, b) {
      var ma = a.match(delimiterRegExp);
      var la = ma ? ma.length : 0;
      var mb = b.match(delimiterRegExp);
      var lb = mb ? mb.length : 0;
      var diff = la - lb;
      if (diff === 0) return a === b ? 0 : (a > b ? 1 : -1);
      return diff > 0 ? 1 : -1;
    }));
  });
  return output;
}

module.exports = function (filePatterns, make) {

  function makeAndReload(event, file) {
    if (make) {
      async.map(filePatterns, glob, function (err, fileSets) {
        if (err) return;
        var files = sortFileSets(fileSets);
        make(files, function (err) {
          if (!err) livereload.changed(file);
        });
      });
    } else {
      livereload.changed(file);
    }
  }

  // set up watchers
  filePatterns.forEach(function (filePattern) {
    if (filePattern) gaze(filePattern, function (err, watcher) {
      if (err) return console.error('Could not set up file watcher for', filePattern, ':', err);
      watcher.on('all', makeAndReload);
    });
  });

  // run make preemptively
  makeAndReload();

};
