'use strict';

module.exports = function (route) {
  return function (req, res, next) {
    if (req.url === route.name) {
      res.redirect(route.target);
    } else {
      next();
    }
  };
};
