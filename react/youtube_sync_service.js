
var app = require('http').createServer(handler)
, io = require('socket.io').listen(app)
, url = require('url')

var msg = require('./node_modules/lib/player_state.js');

app.listen(8989);

console.error('Start listening');

function handler (req, res) {}