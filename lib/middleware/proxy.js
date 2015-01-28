'use strict';

var proxy = require('express-http-proxy');
var url = require('url');
var path = require('path');

module.exports = function (route) {
  var options = route.options || {};
  var target = url.parse(route.target);
  if (!target.host) throw 'Invalid target ' + route.target;

  // prefix the path from the target to any requests
  options.forwardPath = function (req) {
    console.log(req);
    return path.join(target.path, req.url.substr(1));
  };

  // conver the target to something the proxy understands
  var host = target.protocol + '//' + target.host;
  return proxy(host, options);
};
