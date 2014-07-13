LivereloadView = require './livereload-view'

module.exports =
  livereloadView: null

  activate: (state) ->
    @livereloadView = new LivereloadView

  deactivate: ->
    @livereloadView.destroy()

  serialize: ->
    LivereloadView: @livereloadView.serialize()

  toggle: ->
    @livereloadView.toggle()
