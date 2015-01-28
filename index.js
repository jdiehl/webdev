#!/usr/bin/env node
'use strict';

var path = require('path');
var server = require('./lib/server');
var config = require(path.join(process.cwd(), 'webdev.json'));

server(config);
