# Remote Pairing package

Remote pair programming tool for Atom. Lag free! A fork off motepair with more features

![remote-pair](https://raw.githubusercontent.com/motepair/motepair/master/docs/motepair.gif)

### How it Works
We’ve done a basic integration with  [Share.js](http://sharejs.org/) to allow concurrent editing via OT and bind some Atom events to a websocket, like opening/closing/saving files.

### Installing

Use the Atom package manager, which can be found in the Settings view or
run `apm install motepair2` from the command line.


### Using
Open the project to start collaborating via the `Motepair2:connect` command
(you can trigger this command via Cmd+Shift+P).

Please make sure that peers to open the same project directory. This is a very important step as we rely on the relative project path to identify the correct file.

### Current Status
Features:
  - Insertion/Deletion.
  - Open/Close/Switch Files.
  - Save Files.
  - Selection
  - Remote Cursor
  - Gravatar
  - Go to Motepair settings to enable it. Just type your email than your pair will see your photo.
  - Encrypted Connection
  - Optional Mouse and Tab Following


Current Backlog:
  - Peers Indication
  - Directory validation

### Development
* Create a branch with your feature/fix.
* Add a specs
* Create a PR.

### Warning
The connection right now it is not encrypted if you have problems with that, please do not use it. That is part of the backlog.

Be aware that this package is still in development, so it can be unstable, we are working hard to make the Remote Pair programming a better experience to all.

Please, if you see any bug, don't hesitate and open a Issue, we need your help to improve the code and fix all the bugs.

Check out the [server repository](https://github.com/phara0h/motepair-server)

## Contributors

* [Leon Maia](http://github.com/leonmaia) ([@leonmaia](https://twitter.com/leonmaia))
* [Luiz Filho](http://github.com/luizbafilho) ([@luizbafilho](http://twitter.com/luizbafilho))
* [Jt Whissel](http://github.com/phara0h)
