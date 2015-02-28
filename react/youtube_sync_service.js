
var app = require('http').createServer(handler)
, io = require('socket.io').listen(app)
, url = require('url')

var msg = require('./node_modules/lib/msg.js');
var state = require('./node_modules/lib/player_state.js');
var action = require('./node_modules/lib/player_action.js');

var last_player_time; //in seconds
var last_server_time;
var latency = {};
var current_state = state.PAUSED;
var SEEK_THRESHOLD = 1;

app.listen(8989);

console.error('Start listening');

last_player_time = 0;

last_server_time = Date.now();

function handler (req, res) {
    if (req.method == 'POST') {
        
        req.on('data', function (data) {
            //console.error('POST! ' + data);
            console.error('received message ' + data);
            var data = JSON.parse(data);
            // Too much POST data, kill the connection!
            if (data.length > 1e6)
                request.connection.destroy();
            var msgType = data.msgType;
            // if the message is to request
            if (msgType == msg.MsgType.REQUEST) {
                data.msgType = msg.MsgType.ACTION;
                /*var message = {
                    msgType: msg.MsgType.ACTION,
                    clientId: data.clientId,
                    playerTime: data.playerTime,
                    playerAction: data.playerAction
                };
                var server_expected_time = last_player_time;

                if (current_state == state.PLAYING) {
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
                    message.playerAction = action.SEEK;
                }
                else
                {
                    var player_state = parseInt(data.playerState);

                    switch (player_state) {
                        case state.PLAYING:
                            message.playerAction = action.PLAY;
                            current_state = state.PLAYING;
                            break;
                        case state.PAUSED:
                            message.playerAction= action.PAUSE;
                            current_state = state.PAUSED;
                            break;
                        default:
                            break;
                    }
                }*/
                sendMessage(data);
            }
            // ack latency check
            else if (msgType == msg.MsgType.ACK) {
                latency[data.clientId] = (Date.now()-data.timestamp)/2;
            }

            // end the response
            res.writeHead(200, {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': 'http://localhost:8080',
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS'});
            res.end("");
        });
        req.on('end', function () {
            //var post = qs.parse(body);

            // use post['blah'], etc.
        });
    }
}

function sendMessage(message) {

    var msg_id = Math.floor(Math.random() * 10000);
    message.msgID = msg_id;

    var msg_str = JSON.stringify(message);

    if (message.playerAction == action.SEEK) {
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

