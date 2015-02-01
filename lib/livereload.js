'use strict';

var tinylr = require('tiny-lr');

module.exports = function (port, done) {
  if (port && typeof port !== 'number') {
    console.error('Invalid configuration option: livereload should be a port number');
    port = undefined;
  }

  // set up livereload server
  var server = tinylr();

  // throttled reload
  var reloadFiles = {};
  var reloadTimeout;
  server.reload = function (file) {
    reloadFiles[file] = true;
    clearTimeout(reloadTimeout);
    reloadTimeout = setTimeout(function () {
      server.changed({ body: { files: Object.keys(reloadFiles) }});
      reloadFiles = {};
    }, 50);
  };

  // start listening
  server.listen(port || 35729, done);

  return server;
};
