'use strict';

var fs = require('fs');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var livereload = require('./livereload');

// load app
module.exports = function (config, done) {
  var app = express();
  var allFiles = [];

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

    // select and apply middleware based on type
    var middleware = require('./middleware/' + route.type);
    app.use(route.path || '', middleware(route));

    // collect files in allFiles
    if (route.root) allFiles.push(route.root);
    if (route.files) allFiles = allFiles.concat(route.files);
  });

  // start listening
  var server = app.listen(config.port || 3000, done);

  // setup livereload server
  var reloadServer = livereload(allFiles, config.livereload, function (err) {
    if (err) return console.error('Could not start livereload server:', err);
    console.log('livereload server listening on port', reloadServer.port);
  });

  return server;
};
