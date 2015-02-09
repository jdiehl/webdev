'use strict';

var url = require('url');
var path = require('path');
var spawn = require('child_process').spawn;
var proxy = require('express-http-proxy');

function spawnChildProcess(run) {
  var args = run.split(' ');
  var cmd = args[0];
  args = args.splice(1);

  function log() {
    var msg = ['[' + cmd + ']'];
    Array.prototype.forEach.call(arguments, function (arg) { msg.push(arg.toString().replace(/\n$/, '')); });
    console.log.apply(null, msg);
  }

  var childProcess = spawn(cmd, args);
  childProcess.stdout.on('data', log);
  childProcess.stderr.on('data', log);
  childProcess.on('exit', log.bind(null, 'did exit:'));
}

module.exports = function (route) {
  var options = route.options || {};
  var target = url.parse(route.target);
  if (!target.host) throw 'Invalid target ' + route.target;

  // run server
  if (route.run) spawnChildProcess(route.run);

  // prefix the path from the target to any requests
  options.forwardPath = function (req) {
    return path.join(target.path, req.url.substr(1));
  };

  // conver the target to something the proxy understands
  var host = target.protocol + '//' + target.host;
  return proxy(host, options);
};
