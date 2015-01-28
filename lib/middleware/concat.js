'use strict';

var concatGlob = require('../util/concat-glob');

module.exports = function (route) {
  return function (req, res) {

    concatGlob(route.files, route.sourceMap, function (err, file) {
      if (err) return res.status(500).send('Internal Server Error: ' + err);
      res.end(file.toString());
    });

  };
};
