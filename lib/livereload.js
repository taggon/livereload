"use babel";

import LivereloadView from './livereload-view';
import {CompositeDisposable} from 'atom';

export default {
  livereloadView: null,

  config: {
    port: {
      title: 'Port Number',
      type: 'integer',
      default: 35729
    },
    exts : {
      title: 'Additional Extensions',
      description: 'The server will watch these comma-separated extensions as well as the defaults.',
      type: 'string',
      default: 'html, css, js, png, gif, jpg, php, php5, py, rb, erb, coffee'
    },
    exclusions: {
      title: 'Additional Exclusions',
      description: 'The server will ignore these path in addition to the defaults.',
      type: 'string',
      default: '.DS_Store, .gitignore, .git/, .svn/, .hg/'
    },
    applyJSLive: {
      title: 'Apply JavaScript Live',
      type: 'boolean',
      description: 'If checked, LiveReload will reload JS files in the background instead of reloading the page.',
      default: false
    },
    applyCSSLive: {
      title: 'Apply CSS Live',
      type: 'boolean',
      description: 'If checked, LiveReload will reload CSS files in the background instead of refreshing the page.',
      default: true
    },
    useHTTPS: {
      title: 'Use HTTPS Protocol',
      type: 'boolean',
      default: false
    }
  },

  activate(state) {
    this.livereloadView = new LivereloadView();
    this.livereloadView.initialize(state);
    this.livereloadView.attach();
  },

  deactivate() {
    if (this.statusBarTile) {
      this.statusBarTile.destory();
    }
    this.statusBarTile = null;
    this.livereloadView.detach();
    this.livereloadView.destroy();
  },

  serialize() {
    return { livereloadViewState: this.livereloadView.serialize() };
  },

  consumeStatusBar(statusBar) {
    this.statusBarTile = statusBar.addRightTile({item:this.livereloadView, priority:100});
  }
};
