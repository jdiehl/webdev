'use strict';

var concatGlob = require('../util/concat-glob');

module.exports = function (route) {
  return function (req, res) {

    concatGlob(route.files, function (err, content) {
      if (err) return res.sendStatus(500).end();
      res.end(content);
    });

  };
};
