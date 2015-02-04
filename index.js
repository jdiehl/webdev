#!/usr/bin/env node
'use strict';

var fs = require('fs');
var info = require('./package.json');
var createServer = require('./lib/server');

function loadConfig(done) {
  fs.readFile('webdev.json', function (err, content) {
    if (err) return done(err);
    var config;
    try {
      config = JSON.parse(content);
    } catch (e) {
      return done(e);
    }
    done(undefined, config);
  });
}

loadConfig(function (err, config) {
  if (err) return console.error('Could not load configuration file webdev.json:', err);
  var server = createServer(config, function (err) {
    if (err) return console.error('Could not start server:', err);
    console.log('webdev v' + info.version + ' listening on port ' + server.address().port);
  });
});
