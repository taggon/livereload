"use babel";

import EventEmitter from 'events';
import livereload from 'livereload';
import http from 'http';
import https from 'https';
import url from 'url';
import fs from 'fs';
import _ from 'lodash';

const _server = livereload.createServer();
const ServerType = _server.constructor;

_server.config.server.on('error', function(){}).close();

class Server extends ServerType {
  paths = [];
  watcher = null;

  constructor(config) {
    // inherits ServerType
    super(config);

    // ...and EventEmitter
    EventEmitter.call(this);

    this.paths = [];
  }

  start(callback) {
    var app = null;

    if (this.config.https === null) {
      app = http.createServer(this.handleRequest);
    } else {
      app = https.createServer(this.config.https, this.handleRequest);
    }
    app.on('error', err => {
      if (err.code === 'EADDRINUSE') {
	let port = ++this.config.port;

	setTimeout(this.start.bind(this, callback), 1000);

	this.emit('newport', port-1, port);
	this.debug(`LiveReload: port ${port-1} already in use. Trying port ${port}...`);
      }
    });

    app.on('listening', () => {
      this.debug(`LiveReload: listening on port ${this.config.port}.`);
      this.emit('start');

      if (typeof callback === 'function') callback();
    });

    this.config.server = app;

    this.listen();
  }

  stop(callback) {
    if (this.config.server) {
      this.config.server.close();
      this.config.server = null;
    }

    if (typeof callback === 'function') callback();
  }

  watch(paths) {
    this.paths = paths.filter( path => !/^atom\:\/\//.test(path) );

    if (this.paths.length < 1) return;

    if (this.watcher) this.watcher.close();
    super.watch(this.paths);
  }

  unwatch() {
    if (this.watcher) {
      this.watcher.unwatch(this.paths);
      this.watcher.close();
      this.watcher = null;
    }
  }

  refresh(path) {
    setTimeout( () => super.refresh(path), this.config.delayForUpdate );
  }

  handleRequest(req, res) {
    if (url.parse(req.url).pathname === '/livereload.js') {
      res.writeHead(200, {'Content-Type': 'text/javascript'});
      res.end(fs.readFileSync(__dirname + '/../node_modules/livereload/ext/livereload.js'));
    } else {
      res.writeHead(404);
      res.end('Page Not Found');
    }
  }

  get activated() {
    return !!(this.config && this.config.server);
  }
}

_.assign(Server.prototype, EventEmitter.prototype);

export default Server;
