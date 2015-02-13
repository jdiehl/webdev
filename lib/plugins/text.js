'use strict';

module.exports = function (route) {
  return function (req, res, next) {
    if (req.originalUrl === route.path) {
      if (route.status) res.status(route.status);
      if (route.contentType) res.set('Content-Type', route.contentType);
      res.set('Content-Length', Buffer.byteLength(route.text));
      res.end(route.text);
    } else {
      next();
    }
  };
};
