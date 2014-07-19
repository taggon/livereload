{View} = require 'atom'
livereload = require 'livereload'

defaultPort = 35729

module.exports =
class LivereloadView extends View
  server: null # livereload server
  port: defaultPort
  tooltip: ''

  @content: ->
    @div class: 'status-stats inline-block livereload', =>
      @a outlet: 'scriptLink', href: '#'

  initialize: (serializeState) ->
    atom.workspaceView.command 'livereload:toggle', => @toggle()
    @attach()
    # little hack to show dynamic tooltip text
    @scriptLink
      .setTooltip ''
      .data 'bs.tooltip'
        .options.title = => @tooltip

  # Returns an object that can be retrieved when package is activated
  serialize: ->

  # Tear down any state and detach
  destroy: ->
    @detach()
    @closeServer()

  attach: ->
    {statusBar} = atom.workspaceView
    if statusBar?
      statusBar.prependRight this

    # add event
    @scriptLink
      .on 'click', (event) =>
        event.preventDefault()
        atom.clipboard.write event.target.getAttribute 'url'
        @tooltip = 'URL copied'
        @scriptLink.tooltip 'show'
      .on 'mouseenter', (event) =>
        @tooltip = 'Click to copy the URL to clipboard'
        @scriptLink.tooltip 'show'
      .on 'mouseleave', (event) =>
        @scriptLink.tooltip 'hide'

  startServer: ->
    @find('a').text('LiveReload: ...').removeAttr('title').removeAttr('url')

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
        @find 'a'
             .text "LiveReload: #{@port}"
             .attr 'url', "http://localhost:#{@port}/livereload.js"

    if path = atom.project.getPath()
      @server.watch path

  closeServer: ->
    try
      @server.config.server.close () =>
        @find 'a'
             .text ''
             .removeAttr 'url'
        @server = null

  toggle: ->
    if @server
      @closeServer()
    else
      @startServer()
