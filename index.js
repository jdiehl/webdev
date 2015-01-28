#!/usr/bin/env node
'use strict';

var path = require('path');
var createServer = require('./lib/server');
var config = require(path.join(process.cwd(), 'webdev.json'));

var server = createServer(config, function (err) {
  if (err) return console.error('Could not start server:', err);
  console.log('webdev server listening on port', server.address().port);
});
