var React = require('react');
var youtube = require('youtube-iframe-player');
var Progress = require('react-progressbar');
var Dom = require('domquery');
var PlayerState = require('lib/player_state');

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
     var rect = p2.getDOMNode().getBoundingClientRect();1
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
	  console.error(progress);
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

  onPlayerControlClick: function(evt) {
     switch(this.state.player.getPlayerState()) {
       case -1:
       case 0:
       case 2:
         this.state.player.playVideo();
       break;
       default:
         this.state.player.pauseVideo();
       break;
     }
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
  },

  onPlayerStateChange: function() {
  }
});

youtube.init(function() {
    React.render(
	<YoutubePlayer/>,
	document.getElementById('my_youtube_wrapper')
    );
});

module.exports = YoutubePlayerWrapper;


