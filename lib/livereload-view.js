"use babel";

import {CompositeDisposable} from 'atom';
import livereload from 'livereload';
import _ from 'lodash';

const DEFAULT_EXTS = 'html css js png gif jpg php php5 py rb erb coffee'.split(' ');
const DEFAULT_EXCLUSIONS = '.git/ .svn/ .hg/'.split(' ');

class LivereloadView extends HTMLDivElement {
  server = null;
  subscriptions = null;
  tooltipText = 'hello';

  initialize(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // add content
    this.innerHTML = '<a href="#" data-url></a>';
    this.firstChild.addEventListener('click', (event) => this.handleClick(event), false);

    this.classList.add('livereload-status', 'inline-block');
  }

  loadConfig() {
    let ret = {};

    // port number
    ret.port = atom.config.get('livereload.port');

    // use HTTPS
    ret.https = atom.config.get('livereload.useHTTPS') ? {} : null;

    // applyJSLive and applyCSSLive
    ret.applyJSLive = atom.config.get('livereload.applyJSLive');
    ret.applyCSSLive = atom.config.get('livereload.applyCSSLive');

    // exts
    let exts = atom.config.get('livereload.exts').split(',').map( ext => ext.trim() );
    exts = _.difference(exts, DEFAULT_EXTS);
    exts = _.uniq(exts);
    ret.exts = exts;

    let exclusions = atom.config.get('livereload.exclusions').split(',').map( ex => ex.trim() );
    exclusions = exclusions.concat(['.DS_Store', '.gitignore']);
    exclusions = _.difference(exclusions, DEFAULT_EXCLUSIONS);
    exclusions = _.uniq(exclusions);
    ret.exclusions = exclusions;

    return ret;
  }

  attach() {
    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add( 'atom-workspace', { 'livereload:toggle': this.toggle.bind(this) } )
    );

    // tooltip
    this.subscriptions.add(
      atom.tooltips.add( this, {title: () => this.tooltipText} )
    );
  }

  detach() {
    this.subscriptions.dispose();
  }

  serialize() {

  }

  destroy() {
    try { this.detach() } catch(e){};

    this.subscriptions = null;
    this.remove();
  }

  toggle() {
    if (this.server) {
      this.closeServer();
    } else {
      this.startServer();
    }
  }

  handleClick(event) {
    event.preventDefault();
    if (this.firstChild.dataset.url) {
      atom.clipboard.write(this.firstChild.dataset.url, 'url');
    }
  }

  startServer() {
    this.firstChild.dataset.url = '';
    this.firstChild.textContent = 'LiveReload: ...';

    // load configurations
    let config = this.loadConfig();

    // create a server
    this.server = livereload.createServer(config);

    this.server.config.server
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          this.tooltipText = `Trying port ${config.port+1}...`;
          console.log(`LiveReload: port ${config.port} already in use. Trying port ${config.port+1}...`);
          config.port++;

          try { this.server.close(); } catch(e) {};
          this.server = null;

          setTimeout( this.startServer.bind(this), 1000 );
        }
      })
      .on('listening', () => {
        console.log(`LiveReload: listening on port ${config.port}.`);

        this.firstChild.textContent = `LiveReload: ${config.port}`;
        this.tooltipText = 'Click to copy the URL to clipboard';
        this.firstChild.dataset.url = (config.useHTTPS ? 'https':'http') + `://localhost:${config.port}/livereload.js`;

        let paths = atom.project.getPaths();
        this.server.watch(paths);
      });
  }

  closeServer() {
    this.firstChild.textContent = 'LiveReload: Off';
    this.server.config.server.close();
    this.server = null;
  }
}

var LivereloadViewTag = document.registerElement('livereload-status-bar', {prototype:LivereloadView.prototype});

export default LivereloadViewTag;
