'use strict';

var express = require('express');
var livereload = require('./livereload');

// load app
module.exports = function (config, done) {
  var app = express();

  // set up middleware for routes
  if (config.routes) config.routes.forEach(function (route) {
    if (!route.type) throw 'Missing route type';
    var middleware = require('./middleware/' + route.type);
    app.use(route.name || '', middleware(route));
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
