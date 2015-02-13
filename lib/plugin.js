'use strict';

var liveReload = require('./livereload');
var watcher = require('./watcher');
var path = require('path');
var plugins = require('require-all')(__dirname + '/plugins');

module.exports = function (app, route) {
  if (!plugins[route.type]) throw 'Invalid route type: ' + route.type;

  // ensure that files is an array
  if (route.files && !(route.files instanceof Array)) route.files = [route.files];

  // create the plugin
  var plugin = plugins[route.type](route);

  // install the plugin
  if (plugin.install) {
    plugin.install(app);
  } else {
    app.use(route.path || '', plugin.middleware ? plugin.middleware : plugin);
  }

  // install a watcher
  var files = route.files;
  if (!files && route.watch && route.root) files = [path.join(route.root, '**/*')];
  if (files) watcher(files, plugin.make, liveReload.changed);
};
