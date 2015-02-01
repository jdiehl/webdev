'use strict';

var tinylr = require('tiny-lr');
var gaze = require('gaze');

module.exports = function (files, port, done) {

  // set up livereload server
  var server = tinylr();

  // throttled reload
  var reloadFiles = {};
  var reloadTimeout;
  function reload(file) {
    reloadFiles[file] = true;
    clearTimeout(reloadTimeout);
    reloadTimeout = setTimeout(function () {
      server.changed({ body: { files: Object.keys(reloadFiles) }});
      reloadFiles = {};
    }, 50);
  }

  // set up file watchers
  files.forEach(function (file) {
    gaze(file, function (err, watcher) {
      if (err) return console.error('Could not set up file watcher for', file, ':', err);
      // listen for all events: changed, deleted, added
      watcher.on('all', function (event, file) {
        reload(file);
      });

    });
  });

  // start listening
  server.listen(port || 35729, done);

  return server;
};
