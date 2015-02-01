'use strict';

module.exports = function (route) {
  return function (req, res, next) {
    if (req.url === route.path) {
      res.redirect(route.target);
    } else {
      next();
    }
  };
};
