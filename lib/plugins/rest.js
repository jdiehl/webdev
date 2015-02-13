/*jshint evil: true*/
'use strict';

var path = require('path');
var Nedb = require('nedb');
var bodyParser = require('body-parser');

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

// convert middleware
function convertMiddleware(req, res, next) {
  if (req.body) {
    // convert only dates if the content-type is JSON
    var contentType = req.headers['content-type'] || '';
    req.body = convert(req.body, contentType.substr(0, 16) === 'application/json');
  }
  if (req.query) req.query = convert(req.query);
  next();
}

var actions = {

  // count documents
  count: function (db, req, done) {
    db.count(req.query, done);
  },

  // find multiple documents
  find: function (db, req, done) {
    var query = req.query;
    var $sort = query.$sort;
    var $skip = query.$skip;
    var $limit = query.$limit;
    delete query.$sort;
    delete query.$skip;
    delete query.$limit;

    // find
    var res = db.find(query);

    // sort
    if (typeof $sort === 'string') {
      var key = $sort;
      $sort = {};
      $sort[key] = 1;
    }
    if ($sort) res = res.sort($sort);

    // skip / limit
    if ($skip) res = res.skip(parseInt($skip));
    if ($limit) res = res.limit(parseInt($limit));

    res.exec(done);
  },

  // find a single document
  findOne: function (db, req, done) {
    db.findOne(req.query, done);
  },

  // update one or more documents
  update: function (db, req, done) {
    var body = req.body;
    body._updated = body._updated || new Date();
    db.update(req.query, body, { multi: true }, function (err, count) {
      if (err) return done(err);
      if (count === 0) return done(err, undefined);
      db[req.query._id ? 'findOne' : 'find'](req.query, done);
    });
  },

  // create a new document
  insert: function (db, req, done) {
    var body = req.body;
    body._created = body._created || new Date();
    body._updated = body._updated || new Date();
    db.insert(body, done);
  },

  // remove one or more documents
  remove: function (db, req, done) {
    db.remove(req.query, { multi: true }, done);
  }
};

// determine the appropriate database action depending on the method and id
function getActionName(method, id) {
  switch (method) {
    case 'COUNT':
      return 'count';
    case 'GET':
      return id ? 'findOne' : 'find';
    case 'PUT':
      return 'update';
    case 'POST':
      return id ? 'update' : 'insert';
    case 'DELETE':
      return 'remove';
  }
}

// trigger a custom action
function callAction(actionName, route, req, entity, db, done) {
  var action = actions[actionName].bind(null, db[entity], req);

  var script = route.before;
  if (script && typeof script !== 'string') script = script[entity];
  if (typeof script !== 'string') return action(done);
  script = require(path.join(process.cwd(), script));
  if (script[actionName]) script = script[actionName];
  if (typeof script !== 'function') return action(done);
  script(req, db, action, done);
}

module.exports = function (route) {
  var root = path.join(process.cwd(), route.store || 'data');
  var db = {};

  function middleware(req, res) {

    // set cache control
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', 0);

    // read and prepare request
    var pathList = req.path.split('/');
    var entity = pathList[1];
    var id = pathList[2];
    if (id) req.query._id = id;

    // prepare the entity store
    if (!db[entity]) {
      db[entity] = new Nedb({ autoload: true, filename: path.join(root, entity + '.db') });
      db[entity].persistence.setAutocompactionInterval(route.autocompactionInterval || 60000);
    }

    // determine the action to perform
    var actionName = getActionName(req.method, id);

    // perform the action
    callAction(actionName, route, req, entity, db, function (err, data) {
      if (err) {
        if (typeof err === 'number') return res.sendStatus(err).end();
        return res.status(500).end('Internal Server Error: ' + err);
      }

      if (data === undefined || data === null) return res.sendStatus(404).end();
      if (typeof data === 'object') return res.json(data).end();
      if (data) res.send(data.toString());
      res.end();
    });
  }

  function install(app) {
    app.use(route.path, bodyParser.json());
    app.use(route.path, bodyParser.urlencoded({ extended: true }));
    app.use(route.path, convertMiddleware);
    app.use(route.path, middleware);
  }

  return {
    install: install
  };
};
