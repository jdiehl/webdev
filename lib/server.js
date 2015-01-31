'use strict';

var fs = require('fs');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var livereload = require('./livereload');

// load app
module.exports = function (config, done) {
  var app = express();

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
    var middleware = require('./middleware/' + route.type);
    app.use(route.path || '', middleware(route));
  });

  // start listening
  var server = app.listen(config.port || 3000, done);

  // setup livereload server
  if (config.livereload) {
    livereload(config.livereload, function (err) {
      if (err) return console.error('Could not start livereload server:', err);
    });
  }

  return server;
};
