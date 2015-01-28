'use strict';

var path = require('path');
var express = require('express');

module.exports = function (route) {
  return function (req, res, next) { next() };
};
