/**
 * 
 */

var app = require('http').createServer(handler)
, io = require('socket.io').listen(app)
, url = require('url')

var msg = require('./msg.js');

app.listen(8080);

function handler (req, res) {
// parse URL
var requestURL = url.parse(req.url, true);


var operator = requestURL.query.operator;
console.error(requestURL.query.operator);

data = requestURL.query;

// if there is a message, send it
if(operator)
    sendMessage(JSON.stringify(data));

// end the response
res.writeHead(200, {'Content-Type': 'text/plain'});
res.end("");


console.error(data);
}

function sendMessage(message) {
io.sockets.emit('notification', {'message': message});
}


