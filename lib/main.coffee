EventHandler = require './event_handler'
AtomShare    = require './atom_share'
WebSocket    = require 'ws'
NewSessionView = require './new-session-view'
SessionView = require './session-view'

module.exports =
  ### Public ###

  version: require('../package.json').version
  # The default remote pair settings
  # Internal: The default configuration properties for the package.
  config:
    serverAddress:
      title: 'Server address'
      type: 'string'
      default: 'localhost'
    serverPort:
      title: 'Server port number'
      type: 'integer'
      default: 3000

  setDefaultValues: ->
    @address = atom.config.get('atom-remote-pair.serverAddress')
    @portNumber = atom.config.get('atom-remote-pair.serverPort')

  createSocketConnection: ->
    new WebSocket("http://#{@address}:#{@portNumber}")

  activate: ->
    @setDefaultValues()
    atom.workspaceView.command "atom-remote-pair:connect", => @startSession()
    atom.workspaceView.command "atom-remote-pair:disconnect", => @deactivate()

  startSession: ->
    @view = new NewSessionView()
    @view.show()

    @view.on 'core:confirm', =>
      @sessionStatusView = new SessionView
      @sessionStatusView.show(@view.miniEditor.getText())  

      @connect(@view.miniEditor.getText())
    

  connect: (sessionId)->

    @ws ?= @createSocketConnection()

    @ws.on "open", =>
      console.log("Connected")

      @atom_share = new AtomShare(@ws)
      @atom_share.start(sessionId)

      @event_handler = new EventHandler(@ws)
      @event_handler.listen()

    @ws.on 'error', (e) =>
      @ws.close()
      @ws = null

  deactivate: ->
    @sessionStatusView.hide()
    @ws.close()
    @ws = null
    @event_handler.subscriptions.dispose()
    @atom_share.subscriptions.dispose()
