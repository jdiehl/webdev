'use strict';

var fs = require('fs');
var path = require('path');

function detectPlatform(req) {
  if (req.connection.remoteAddress === '::1') return false;
  var ua = req.headers['user-agent'];
  if (/(iPhone|iPad)/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return false;
}

function cordovaPath(platform) {
  switch (platform) {
    case 'ios': return 'platforms/ios/www';
    case 'android': return 'platforms/android/assets/www';
  }
}

module.exports = function () {

  return function (req, res, next) {
    var platform = detectPlatform(req);

    // no mobile platform -> only serve an empty /cordova.js file
    if (!platform) {
      if (req.url === '/cordova.js') return res.send();
      next();
    }

    // mobile platform -> serve cordova platform files
    var filePath = cordovaPath(platform) + req._parsedUrl.path;
    if (path.sep !== '/') filePath.replace('/', path.sep);
    fs.readFile(filePath, function (err, buffer) {
      if (err) return next();
      res.send(buffer);
    });
  };

};
