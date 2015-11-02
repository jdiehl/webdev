'use strict';

var extend = require('util')._extend;
var url = require('url');
var spawn = require('child_process').spawn;
var proxy = require('express-http-proxy');

function spawnChildProcess(route) {
  var args = route.run.split(' ');
  var cmd = args[0];
  args = args.splice(1);

  function log() {
    var msg = ['[' + cmd + ']'];
    Array.prototype.forEach.call(arguments, function (arg) { msg.push(arg ? arg.toString().replace(/\n$/, '') : ''); });
    console.log.apply(null, msg);
  }

  var options = {
    cwd: route.cwd,
    env: extend(process.env, route.env)
  };
  var childProcess = spawn(cmd, args, options);
  childProcess.stdout.on('data', log);
  childProcess.stderr.on('data', log);
  childProcess.on('exit', log.bind(null, 'did exit:'));
}

module.exports = function (route) {
  var options = route.options || {};
  var target = url.parse(route.target);
  if (target.path[target.path.length - 1] === '/') target.path = target.path.substr(0, target.path.length - 1);
  if (!target.host) throw 'Invalid target ' + route.target;

  // run server
  if (route.run) spawnChildProcess(route);

  // prefix the path from the target to any requests
  options.forwardPath = function (req) {
    console.log(target.path, req.url);
    return target.path + req.url;
  };

  // conver the target to something the proxy understands
  var host = target.protocol + '//' + target.host;
  return proxy(host, options);
};
