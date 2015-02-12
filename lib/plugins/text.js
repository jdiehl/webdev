'use strict';

module.exports = function (route) {
  return function (req, res, next) {
    if (req.originalUrl === route.path) {
      if (route.status) res.status(route.status);
      res.end(route.text);
    } else {
      next();
    }
  };
};
