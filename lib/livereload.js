"use babel";

import {CompositeDisposable} from 'atom';
import LivereloadView from './livereload-view';
import config from './config';
import Server from './server';
import options from '../options.json';

function createView() {
  var view = this.view = new LivereloadView();

  view.addEventListener('toggle', () => {
    var server = this.server;
    if (server.activated) {
      // turning off the server
      [view.url, view.text, view.tooltip] = ['', '...', 'Stopping LiveReload server...'];
      server.stop( () => {
	[view.url, view.text, view.tooltip] = ['', 'Off', 'LiveReload server is currently turned off.'];
	server.unwatch();
      });
    } else {
      // turning on the server
      [view.url, view.text, view.tooltip] = ['', '...', 'Starting LiveReload server...'];
      server.start( () => {
	view.url = (server.config.useHTTPS ? 'https' : 'http') + `://localhost:${server.config.port}/livereload.js`;
	view.text = server.config.port;
	view.tooltip = 'Click to copy the URL to clipboard';

	let paths = atom.project.getPaths();
	server.watch(paths);
      });
    }
  });

  return view;
}

export default {
  view: null,
  server: null,
  activated: false,
  config: options,

  activate(state) {
    this.server = new Server(config());
    this.server.on('newport', (oldPort, newPort) => {
	this.view.tooltip = `Trying port ${newPort}...`;
    });

    this.view = createView.call(this);
    this.view.initialize(state);
    this.view.attach();
  },

  deactivate() {
    if (this.statusBarTile) this.statusBarTile.destory();
    this.statusBarTile = null;

    this.view.detach();
    this.view.destroy();

    if (this.server) {
      this.server.stop( () => { this.server = null } );
    }
  },

  serialize() {
    return { activated: !!this.server  };
  },

  consumeStatusBar(statusBar) {
    this.statusBarTile = statusBar.addRightTile({item:this.view, priority:100});
  }
};
