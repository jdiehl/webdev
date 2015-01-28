'use strict';

var express = require('express');

// load app
module.exports = function (config) {
  var app = express();

  // set up middleware for routes
  if (config.routes) config.routes.forEach(function (route) {
    if (!route.type) throw 'Missing route type';
    var middleware = require('./middleware/' + route.type);
    app.use(route.name || '', middleware(route));
  });

  // start listening
  var server = app.listen(config.port || 3000, function (err) {
    if (err) return console.error('Could not start server:', err);
    console.log('webdev server listening on port', server.address().port);
  });

  return server;
};
