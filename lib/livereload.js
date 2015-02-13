'use strict';

var tinylr = require('tiny-lr');

exports.start = function (port, done) {
  if (port && typeof port !== 'number') return done('port should be a number');
  exports.server = tinylr();
  exports.server.listen(port || 35729, done);
};

exports.stop = function (done) {
  if (!exports.server) return;
  exports.server.close(done);
  exports.server = undefined;
};

exports.changed = function (files) {
  if (!exports.server) return;
  exports.server.changed({ body: { files: files }});
};
