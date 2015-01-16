/**
 * 
 */

var app = require('http').createServer(handler)
, io = require('socket.io').listen(app)
, url = require('url')

var msg = require('./msg.js');
var state = require('./player_state.js');
var action = require('./player_action.js');

var last_player_time; //in seconds
var last_server_time;
var latency = {};
var current_state;
var SEEK_THRESHOLD = 1;

app.listen(8080);

function handler (req, res) {
    // parse URL
    var requestURL = url.parse(req.url, true);


    var msgType = requestURL.query.msgType;
    console.error(requestURL.query.msgType);

    data = requestURL.query;
    
    // if the message is to request
    if (msgType === msg.MsgType.REQUEST) {
        var message = 'msgType=' + msg.MsgType.ACTION 
                    + '&clientId=' + data.clientId 
                    + '&playerTime=' + data.playerTime
                    + '&playerAction=';
        var server_expected_time = last_player_time;
        if (current_state === playerState.PlayerState.PLAYING) {
            server_expected_time = (Date.now()-last_server_time) + last_player_time;
        }
        last_player_time = data.playerTime;
        last_server_time = Date.now();
        if (Math.abs(data.playerTime-server_expected_time) > SEEK_THRESHOLD) {
            //consider as seek.
            message += action.PlayerAction.SEEK;
        }
        else switch (data.playerState) {
            case state.PLAYING:
                message += action.PlayerAction.PLAY;
                current_state = playerState.PlayerState.PLAYING;
                break;
            case state.PAUSED:
                message += action.PlayerAction.PAUSE;
                current_state = playerState.PlayerState.PAUSED;
                break;
            default:
                break;
        }
        sendMessage(JSON.stringify(message));
    }
    // ack latency check
    else if (msgType === msg.MsgType.ACK) {
        latency[data.clientId] = (Date.now()-data.timestamp)/2;
    }

    // end the response
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("");

    console.error(data);
}

function sendMessage(message) {
    io.sockets.emit('notification', {'message': message});
}

io.on('connection', function(socket){
    console.log('a user connected');
});

setInterval(function checkLatency() {
    sendMessage(JSON.stringify('msgType=' + msg.MsgType.CHECK_LATENCY
                             + '&timestamp=' + Date.now()));
}, 3000);

