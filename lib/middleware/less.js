'use strict';

var concatGlob = require('../util/concat-glob');
var less = require('less');

module.exports = function (route) {
  return function (req, res) {

    concatGlob(route.files, function (err, file) {
      if (err) return res.status(500).send('Internal Server Error: ' + err);

      // render less
      less.render(file.source, route.options, function (err, output) {
        if (err) return res.status(500).send('Internal Server Error: ' + err);
        res.end(output.css);
      });
    });

  };
};
