# NodeJS Web Development Server

## Installation

    npm i -g webdev

## Usage

    webdev

## Configuration

Create the file `webdev.json` in your project root and configure it using the following structure:

* `log`: enable verbose logging via [morgan](https://github.com/expressjs/morgan)
** `format`: [format](https://github.com/expressjs/morgan#predefined-formats) to use (default: `dev`)
** `path`: write log to file instead of console
* `port`: specify the port to run the server on (default: `3000`)
* `livereload`: the port of the livereload server (default: `35729`)
* `routes`: the routes of the webdev server
** `path`: the path of the route
** `type`: the route type (see belows for a list of possible types)
** ...: additional configuration options depending on the type

## Example Configuration

```json
{
  "log": {
    "format": "dev",
    "path": "webdev.log"
  },
  "port": 80,
  "routes": [{
    "path": "/",
    "type": "static",
    "root": "public/"
  },{
    "path": "/bower_components",
    "type": "static",
    "root": "bower_components/"
  },{
    "path": "/app",
    "type": "static",
    "root": "app/",
    "watch": true
  },{
    "path": "/app.js",
    "type": "concat",
    "files": ["app/**/*.js"]
  },{
    "path": "/app.css",
    "type": "less",
    "files": ["app/**/*.less"]
  }]
}
```

## Route Types

### static

The static route maps all contents of a directory to the given path.

Configuration options:

* `root`: the root path of the directory, relative to where webdev is run
* `watch`: watch the contents of the rooth path and trigger livereload events (do not use this on large folders such as `node_modules` or `bower_components`!)

### concat

The concat route combines multiple files into a single file. The files are delimited with a `\n` character and a sourcemap is generated.

Configuration options:

* `files`: list of [glob](https://github.com/isaacs/node-glob) patterns
* `contentType`: content type to deliver (default: text/javascript)

### less

The less route compiles multiple less files into a single css file. The output is process with the autoprefixer plugin.

Configuration options:

* `files`: list of [glob](https://github.com/isaacs/node-glob) patterns

### text

The text route responds to the given url with a static text.

Configuration options:

* `text`: the text to send

Example:

```
{
  "path": "/greet.js",
  "type": "text",
  "text": "alert('Hello World!');",
  "contentType": "text/javascript"
}
```

### redirect

The redirect route redirects the browser to a different url.

Configuration options:

* `target`: target url to redirect to

Example:

```
{
  "path": "/",
  "type": "redirect",
  "target": "/app"
}
```

### proxy

The proxy route forwards all requests to the specified target machine.

Configuration options:

* `target`: the proxy url
* `run`: optional shell script to execute to launch the server
* `cwd`: directory to execute the run script in
* `env`: environment variables for the run script

Example:

```
{
  "path": "/api",
  "type": "proxy",
  "target": "http://127.0.0.1:1337/ws",
  "run": "nodemon server.js",
  "cwd": "myserver/",
  "env": {
    "port": 8000
  }
}
```

### rest

The rest route creates a mock-backend that accepts RESTful requests to query and manipulate documents. The documents are stored persistently in [nedb](https://github.com/louischatriot/nedb) databases.

Configuration options:

* `store`: path to store the databases

### cordova

The cordova route serves the appropriate cordova files to mobile devices.

Example:

```
{
  "path": "/",
  "type": "cordova"
}
```
