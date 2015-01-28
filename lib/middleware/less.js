'use strict';

var concatGlob = require('../util/concat-glob');
var less = require('less');

module.exports = function (route) {
  return function (req, res) {

    concatGlob(route.files, function (err, content) {
      if (err) return res.sendStatus(500).end();

      // render less
      less.render(content, route.options, function (err, output) {
        if (err) return res.sendStatus(500).end();
        res.end(output.css);
      });
    });

  };
};
