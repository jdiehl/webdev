'use strict';

var tinylr = require('tiny-lr');

module.exports = function (port, done) {
  if (port && typeof port !== 'number') {
    console.error('Invalid configuration option: livereload should be a port number');
    port = undefined;
  }

  // set up livereload server
  var server = tinylr();

  // reload
  server.reload = function (file) {
    server.changed({ body: { files: [file] }});
  };

  // start listening
  server.listen(port || 35729, done);

  return server;
};
