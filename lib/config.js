"use babel";

import _ from 'lodash';

const DEFAULT_EXTS = 'html css js png gif jpg php php5 py rb erb coffee'.split(' ');
const DEFAULT_EXCLUSIONS = '.DS_Store .gitignore .git/ .svn/ .hg/'.split(' ');

export default function config() {
  var custom = {
    // port number
    port: atom.config.get('livereload.port'),

    // use HTTPS
    https: atom.config.get('livereload.useHTTPS') ? {} : null,

    // applyJSLive
    applyJSLive: atom.config.get('livereload.applyJSLive'),

    // applyCSSLive
    applyCSSLive: atom.config.get('livereload.applyCSSLive'),

    // delay for update
    delayForUpdate: atom.config.get('livereload.delayForUpdate')
  };

  // exts
  let exts = atom.config.get('livereload.exts').split(',').map( ext => ext.trim() );
  custom.exts = _.chain(exts).concat(DEFAULT_EXTS).uniq().value();

  let exclusions = atom.config.get('livereload.exclusions').split(',').map( ex => ex.trim() );
  custom.exclusions = _.chain(exclusions).concat(DEFAULT_EXCLUSIONS).uniq().map( pattern => { return new RegExp(pattern.replace(/([.\\\/])/g, '\\$1' )) } ).value();

  return custom;
}
