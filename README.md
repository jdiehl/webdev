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
* `livereload`: enable the [live reload](https://github.com/mklabs/tiny-lr) server
** `watch`: array of file patterns to watch for changes for the live reload server
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
  "livereload": {
    "watch": ["app/**/*", "public/**/*"]
  },
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
    "root": "app/"
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

### concat

The concat route combines multiple files into a single file. The files are delimited with a `\n` character and a sourcemap is generated.

Configuration options:

* `files`: list of [glob](https://github.com/isaacs/node-glob) patterns

### less

The less route compiles multiple less files into a single css file. The output is process with the autoprefixer plugin.

Configuration options:

* `files`: list of [glob](https://github.com/isaacs/node-glob) patterns

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

Example:

```
{
  "path": "/api",
  "type": "proxy",
  "target": "http://127.0.0.1:1337/ws"
}
```
