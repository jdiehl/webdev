/*jshint evil: true*/
'use strict';

// simple string to native-type conversion middleware
function convert(obj, onlyDate) {
  var i, res;
  if (typeof obj === 'object') {
    for (i in obj) {
      if (obj.hasOwnProperty(i)) {
        obj[i] = convert(obj[i], onlyDate);
      }
    }
  } else if (typeof obj === 'string') {
    if (!onlyDate && obj.match(/^([0-9]+|[0-9]*\.[0-9]+|true|false|undefined|null)$/)) {
      obj = eval(obj);
    } else {
      res = obj.match(/^"?(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)"?$/);
      if (res) {
        obj = new Date(res[1]);
      }
    }
  }
  return obj;
}

module.exports = function () {
  return function (req, res, next) {
    if (req.body) {

      // convert only dates if the content-type is JSON
      var contentType = req.headers['content-type'] || '';
      req.body = convert(req.body, contentType.substr(0, 16) === 'application/json');

    }
    if (req.query) req.query = convert(req.query);
    next();
  };
};
