'use strict';

var fs = require('fs');
var express = require('express');
var morgan = require('morgan');
var livereload = require('./livereload');
var plugin = require('./plugin');

// load app
module.exports = function (config, done) {
  var app = express();

  // setup livereload server
  livereload.start(config.livereload, function (err) {
    if (err) return console.error('Could not start livereload server:', err);
    console.log('livereload server listening on port', livereload.server.port);
  });

  // logging
  if (config.log) {
    if (typeof config.log === 'string') config.log = { format: config.log };
    if (typeof config.log !== 'object') config.log = { format: 'dev' };
    var options = {};
    if (config.log.path) options.stream = fs.createWriteStream(config.log.path, {flags: 'a'});
    app.use(morgan(config.log.format, options));
  }

  // install plugins for routes
  if (config.routes) config.routes.forEach(function (route) {
    plugin(app, route);
  });

  // start listening
  var server = app.listen(config.port || 3000, done);

  return server;
};
