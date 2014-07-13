{View} = require 'atom'
livereload = require 'livereload'

defaultPort = 35729

module.exports =
class LivereloadView extends View
  server: null # livereload server
  port: defaultPort

  @content: ->
    @div class: 'status-stats inline-block livereload', =>
      @a ''

  initialize: (serializeState) ->
    atom.workspaceView.command 'livereload:toggle', => @toggle()
    @attach()

  # Returns an object that can be retrieved when package is activated
  serialize: ->

  # Tear down any state and detach
  destroy: ->
    @detach()
    @closeServer()

  attach: ->
    statusbar = atom.workspaceView.statusBar
    statusbar.prependRight this

  startServer: ->
    @find('a').text('LiveReload: ...').removeAttr('title').removeAttr('href')

    @server = livereload.createServer {
      port: @port,
      exclusions: ['.DS_Store']
    }

    @server.config.server
      .on 'error', (err) =>
        if err.code == 'EADDRINUSE'
          console.log "LiveReload: port #{@port} already in use. Trying port #{++@port}..."

          try @server.close()
          @server = null

          setTimeout @startServer.bind(@), 1000
      .on 'listening', () =>
        console.log "LiveReload: listening on port #{@port}."

        @port = defaultPort
        @find('a')
          .text("LiveReload: #{@port}")
          .attr('href', "http://localhost:#{@port}/livereload.js")

    if path = atom.project.getPath()
      @server.watch path

  closeServer: ->
    try
      @server.config.server.close () =>
        @find('a').text('').removeAttr('href')
        @server = null

  toggle: ->
    if @server
      @closeServer()
    else
      @startServer()
