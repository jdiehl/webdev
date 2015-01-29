'use strict';

module.exports = function () {
  return function (req, res, next) {
    console.log(new Date().toJSON(), req.method, req.url);
    next();
  };
};
