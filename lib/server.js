'use strict';

var fs = require('fs');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var livereload = require('./livereload');
var watcher = require('./watcher');

// load app
module.exports = function (config, done) {
  var app = express();

  // setup livereload server
  var reloadServer = livereload(config.livereload, function (err) {
    if (err) return console.error('Could not start livereload server:', err);
    console.log('livereload server listening on port', reloadServer.port);
  });

  // body parser
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // logging
  if (config.log) {
    if (typeof config.log === 'string') config.log = { format: config.log };
    if (typeof config.log !== 'object') config.log = { format: 'dev' };
    var options = {};
    if (config.log.path) options.stream = fs.createWriteStream(config.log.path, {flags: 'a'});
    app.use(morgan(config.log.format, options));
  }

  // set up middleware for routes
  if (config.routes) config.routes.forEach(function (route) {
    if (!route.type) throw 'Missing route type';

    // convert files to array if necessary
    if (route.files && !(route.files instanceof Array)) route.files = [route.files];

    // select and set up the plugin based on type
    var plugin = require('./plugins/' + route.type)(route);
    if (typeof plugin === 'function') plugin = { middleware: plugin };
    app.use(route.path || '', plugin.middleware);

    // install a watcher
    watcher(route, plugin.make, reloadServer.reload);
  });

  // start listening
  var server = app.listen(config.port || 3000, done);

  return server;
};
