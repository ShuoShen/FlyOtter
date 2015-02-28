var React = require('react');
var youtube = require('youtube-iframe-player');
var Progress = require('react-progressbar');
var Dom = require('domquery');
var PlayerState = require('lib/player_state');
var msg = require('lib/msg');
var io = require('lib/socket.io');
//var request = require('request');
//var querystring = require('querystring');
var http = require('http');
var UNIVERSE = 100000;
var rid = Math.floor(Math.random() * UNIVERSE);
var socket = io.connect('http://localhost:8989');
socket.on('notification', function (data) {
    data = JSON.parse(data.message);
    if (parseInt(data.clientId) === rid) {
        return;
    }
    
    // TODO(shen) apply the action here
    switch(data.msgType) {
    case msg.MsgType.CHECK_LATENCY:
        notifyServer(createMessage(true, rid));
        break;
    case msg.MsgType.ACTION:
        applyActionToPlayer(data, player);
        break;
    }
    
    return;
});
require('./style.css');

var YoutubePlayerWrapper = React.createClass({
    render: function() {
        console.error(PlayerState.ENDED);
        return (
          <div>
          <div id="my_youtube_wrapper" />
          </div>
        );
    }
});

var YoutubePlayer = React.createClass({
    propTypes: {
        height: React.PropTypes.number,
        width: React.PropTypes.number
    },

    getDefaultProps: function() {
        return {
            height: 390,
            width: 640
        };
    },   

    getInitialState: function() {
        return {
            'playerProgress': 0
        };
    },

    tick: function() {
        if (this.state.player) {
            var player = this.state.player;
            var current_time = player.getCurrentTime();
            var duration = player.getDuration();
            var progress = current_time / duration * 100;
            // buffering or paused
            if (player.getPlayerState() !== 3 && player.getPlayerState() !== 2) {
                this.setState({
                    'playerProgress' : progress
                });
            }
        }
    },

    update: function() {
        // TODO(shen) 
        // 0. get the youtube_player div or iframe, and get its parent's div
        var player_div = Dom('#youtube_player');
        if (!player_div) {
            return; 
        }

        var parent_div = player_div.parent();
        var p2 = this.refs.parent;

        if(!p2) {
            return;
        }
        var rect = p2.getDOMNode().getBoundingClientRect();
        player_div.style({
            'width' : this.props.width + 'px',
            'height': this.props.height + 'px',
            'left': rect.left  + 'px',
            'top': rect.top + 'px',
        });

        parent_div.style({
            'width' : this.props.width + 'px',
            'height': this.props.height + 'px',
        });

//     console.error(player_div.parent());

     // 1. make sure the iframe's size is correct. set its width and height, make sure its parent has the same width and height
     // 2. update its top and left according to the position of its parent
    },
    
    render: function() {
        var progress = 0;
        if (this.state) {
            progress = this.state.playerProgress;
            //console.error(progress);
        }

        this.update();

        return (
            <div>
            <h1> hello world youtube  </h1>
            <div ref='parent' className="container">
            <div id='youtube_player'> </div>
            <div id="player_control" className={this.state.opaque ? 'opaque' : ''}
            onClick={this.onPlayerControlClick}
            onMouseOver={this.onMouseOver}
            onMouseOut={this.onMouseOut}
            > </div>
            <Progress onProgressChange={this._handleProgressChange} completed={progress}/>
            </div>
            </div>
        );
    },

    _handleProgressChange: function(percent) {

        var player = this.state.player;
        if (player) {
            player.seekTo(percent * player.getDuration() / 100);
        }
        this.setState({
            playerProgress: percent,
        });
    },

    onMouseOut: function() {
        this.setState({
            opaque:false
        });                
    },

    onMouseOver: function(evt, varv) {
        this.setState({
            opaque: true
        });
    },

    createMessage: function (ack_msg_id, rid, state) {

        var message = {
            clientTime: Date.now() / 1000,
            clientId: rid,
            playerTime: this.state.player.getCurrentTime(),
            playerState: this.state.player.getPlayerState(),
        };
        if (ack_msg_id) {
            message.ackMsgID = ack_msg_id;
            message.msgType = msg.MsgType.ACK;
        } else {
            message.msgType = msg.MsgType.REQUEST;
        }
        return message;
    },


    onPlayerControlClick: function(evt) {
        switch(this.state.player.getPlayerState()) {
            case -1:
            case 0:
            case 2:
                this.state.player.playVideo();
                message = this.createMessage(false, rid); 
                this.notifyServer(message);
            break;
        default:
            this.state.player.pauseVideo();
        break;
        }
    },

    postData:function(data) {
        // Build the post string from an object
        var post_data = JSON.stringify(data);

          // An object of options to indicate where to post to
        var post_options = {
            host: 'localhost',
            port: '8989',
            method: 'POST',
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length
            }
        };

            // Set up the request
        var post_req = http.request(post_options, function(res) {
            //res.setEncoding('utf8');
            res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
            });
        });

        // post the data
        post_req.write(post_data);
        post_req.end();

    },
  /*handleCommentSubmit: function(comment) {
    $.ajax({
      url: 'http://localhost:8989/',
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },*/
    notifyServer: function (msg) {
        /*var msg_str = '';
        var i = 0; 
        for (var key in msg) {
            msg_str += (i++) ? '&' : '?';
            msg_str += key + '=' + msg[key];
        }*/

        console.error(msg);
        //this.handleCommentSubmit(msg_str);
        this.postData(msg);
        //$.post('http://localhost:8989/' + msg_str, 
                //function(a) {});
        /*request.post(
          'http://localhost:8989/',
          { json: msg },
          function (error, response, body) {
              if (!error && response.statusCode == 200) {
                  console.log(body)
              }
          }
        )*/
    },

    componentDidMount: function() {
        if (!this.state.player && YT.Player) {
            this.setState({
                player: new YT.Player('youtube_player', {
                    height: this.props.height,
                    width: this.props.width,
                    videoId: 'M7lc1UVf-VE',
                    events: {
                        'onReady': this.onPlayerReady,
                        'onStateChange': this.onPlayerStateChange
                    },
                playerVars: { 'autoplay': 0, 'controls': 0 }
                })
            });
        }
        this.interval = setInterval(this.tick, 1000);
    },
  
    onPlayerStateChange: function() {
        message = this.createMessage(false, rid, PlayerState.PLAYING); 
        this.notifyServer(message);
    },
});

youtube.init(function() {
    React.render(
        <YoutubePlayer/>,
        document.getElementById('my_youtube_wrapper')
    );
});

module.exports = YoutubePlayerWrapper;


