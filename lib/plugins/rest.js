/*jshint evil: true*/
'use strict';

var path = require('path');
var Nedb = require('nedb');

// simple string to native-type conversion middleware
function typeConvert(obj, onlyDate) {
  var i, res;
  if (typeof obj === 'object') {
    for (i in obj) {
      if (obj.hasOwnProperty(i)) {
        obj[i] = typeConvert(obj[i], onlyDate);
      }
    }
  } else if (typeof obj === 'string') {
    if (!onlyDate && obj.match(/^([0-9.]+|true|false|undefined|null)$/)) {
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

function count(db, query, body, done) {
  db.count(query, done);
}

// find multiple documents
function find(db, query, body, done) {
  db.find(query, done);
}

// find a single document
function findOne(db, query, body, done) {
  db.findOne(query, done);
}

// update one or more documents
function update(db, query, body, done) {
  body._updated = body._updated || new Date().toJSON();
  db.update(query, body, { multi: true }, function (err, count) {
    done(err, count > 0 ? '' : undefined);
  });
}

// create a new document
function insert(db, query, body, done) {
  body._created = body._created || new Date().toJSON();
  body._updated = body._updated || new Date().toJSON();
  db.insert(body, done);
}

// remove one or more documents
function remove(db, query, body, done) {
  db.remove(query, { multi: true }, done);
}

// determine the appropriate database action depending on the method and id
function getAction(method, id) {
  switch (method) {
    case 'COUNT':
      return count;
    case 'GET':
      return id ? findOne : find;
    case 'PUT':
      return update;
    case 'POST':
      return id ? update : insert;
    case 'DELETE':
      return remove;
  }
}

module.exports = function (route) {
  var root = path.join(process.cwd(), route.store);
  var db = {};

  return function (req, res) {

    // read and prepare request
    var pathList = req.path.split('/');
    var entity = pathList[1];
    var id = pathList[2];
    var query = typeConvert(req.query) || {};
    var body = typeConvert(req.body, true);
    if (id) query._id = id;

    // prepare the entity store
    if (!db[entity]) {
      db[entity] = new Nedb({ autoload: true, filename: path.join(root, entity + '.db') });
      db[entity].persistence.setAutocompactionInterval(route.autocompactionInterval || 60000);
    }

    // perform the action
    var action = getAction(req.method, id);
    action(db[entity], query, body, function (err, data) {
      if (err) {
        if (typeof err === 'number') return res.sendStatus(err).end();
        return res.status(500).end('Internal Server Error: ' + err);
      }
      if (data === undefined || data === null) return res.sendStatus(404).end();
      if (typeof data === 'object') return res.json(data).end();
      if (data) res.send(data.toString());
      res.end();
    });
  };
};
