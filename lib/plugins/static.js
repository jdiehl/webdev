'use strict';

var path = require('path');
var express = require('express');

module.exports = function (route) {

  var root = path.join(process.cwd(), route.root);
  return express.static(root, route.options);
};
