AtomLivereloadView = require './atom-livereload-view'

module.exports =
  atomLivereloadView: null

  activate: (state) ->
    @atomLivereloadView = new AtomLivereloadView

  deactivate: ->
    @atomLivereloadView.destroy()

  serialize: ->
    AtomLivereloadView: @atomLivereloadView.serialize()

  toggle: ->
    @atomLivereloadView.toggle()
