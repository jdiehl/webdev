'use strict';

var gaze = require('gaze');

module.exports = function (files, make, reload) {

  // set up watchers
  files.forEach(function (file) {
    if (file) gaze(file, function (err, watcher) {
      if (err) return console.error('Could not set up file watcher for', file, ':', err);

      // watch all changes
      watcher.on('all', function (event, file) {
        if (!make) return reload(file);

        // run the make function
        make(function (err) {
          if (!err) reload(file);
        });

      });

    });
  });

  // run make preemptively
  if (make) make(function () {});
};
