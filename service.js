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
last_player_time = 0;

last_server_time = Date.now();

function handler (req, res) {
    // parse URL
    var requestURL = url.parse(req.url, true);


    var msgType = requestURL.query.msgType;
    console.error('received message ' + JSON.stringify(requestURL.query));

    data = requestURL.query;




    // if the message is to request
    if (msgType == msg.MsgType.REQUEST) {
        
        var message = {
            msgType: msg.MsgType.ACTION,
            clientId: data.clientId,
            playerTime: data.playerTime
        };
        var server_expected_time = last_player_time;

        if (current_state == state.PlayerState.PLAYING) {
            //console.error((Date.now()-last_server_time) / 1000);
            server_expected_time = (Date.now()-last_server_time) / 1000 + last_player_time;
        }
        last_player_time = parseInt(data.playerTime);
        last_server_time = Date.now();
        console.error("server_expected_time: "+server_expected_time);
        console.error("last_player_time: "+last_player_time);
        console.error("last_server_time: "+last_server_time);
        if (Math.abs(data.playerTime-server_expected_time) > SEEK_THRESHOLD) {
            //consider as seek.
            message.playerAction = action.PlayerAction.SEEK;
        }
        else
        {
            var player_state = parseInt(data.playerState);

            switch (player_state) {
                case state.PlayerState.PLAYING:
                    message.playerAction = action.PlayerAction.PLAY;
                    current_state = state.PlayerState.PLAYING;
                    break;
                case state.PlayerState.PAUSED:
                    message.playerAction= action.PlayerAction.PAUSE;
                    current_state = state.PlayerState.PAUSED;
                    break;
                default:
                    break;
            }
        }
        sendMessage(message);
    }
    // ack latency check
    else if (msgType == msg.MsgType.ACK) {
        latency[data.clientId] = (Date.now()-data.timestamp)/2;
    }

    // end the response
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("");

}

function sendMessage(message) {

    var msg_id = Math.floor(Math.random() * 10000);
    message.msgID = msg_id;

    var msg_str = JSON.stringify(message);

    if (message.playerAction == action.PlayerAction.SEEK) {
        console.error("=====================");
    }
    console.error('sending message ' + msg_str);

    io.sockets.emit('notification', {'message': msg_str});
}

io.on('connection', function(socket){
    console.log('a user connected');
});

setInterval(function checkLatency() {
    var message = {
        msgType: msg.MsgType.CHECK_LATENCY,
        timestamp: Date.now()
    };
 //   sendMessage(message);
}, 300000);

