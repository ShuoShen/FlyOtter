    var state_before_latest_server_action = null;
    var lastest_server_action = null; 
    var debounce_timeout = 100;
    var shouldNotify = true;
    var paused = true;
    var socket = io.connect('http://localhost:8080');
    var UNIVERSE = 100000;
    var rid = Math.floor(Math.random() * UNIVERSE);
    console.error(msg);
    socket.on('notification', function (data) {
        state_before_latest_server_action = getState(player);
        
        // action: {operator: ..., parameter}
        latest_server_action = data.request;
        
        // TODO(shen) apply the action here
        switch(data.msgType) {
        case msg.MessageType.CHECK_LATENCY:
            notifyServer(createMessage(true));
            break;
        case msg.MessageType.ACTION:
            applyActionToPlayer(data, player);
            break;
        }
        
        return;
        
        
        //console.error('hello notification');
        var msg = JSON.parse(data.message);
        console.error(msg);
        console.error(rid);
        if (Number(msg.rid) === rid) {
            return;
        }
        shouldNotify = false;
        switch(msg.operator) {
            case 'play':
                console.error('told to play');
                playVideo();
                break;
            case 'pause':
                console.error('told to pause');
                pauseVideo();
                break;
            case 'seek':
                console.error('told to seek');
                seekVideoTo(parseFloat(msg.stt));
                break;
            case 'load':
                console.error('load ' + msg.arg);
                player.loadVideoById(msg.arg);
                break;
            default:
                break;
        }
    });

    function createMessage(is_ack, rid, state) {
        if (is_ack) {
            return {
                msgType: msg.MessageType.ACK,
            };
        } else {
            return {
                msgType: msg.MessageType.REQUEST,
                clientId: rid,
                playerState: state.playerState,
                playerTime: state.playerTime,
            };
        }
    }
    
    function applyActionToState(state, action) {
        if (state === null || action === null) {
            return null;
        } else {
            
        }
    }
    
    function applyActionToPlayer(data, player) {
        latest_server_action = data.playerAction; 
            
        switch (data.playerAction) {
        case player_action.PLAYER_ACTION.PLAY:
            player.playVideo();
            break;
        case player_action.PLAYER_ACTION.PAUSE:
            player.pauseVideo();
            break;
        case player_action.PLAYER_ACTION.SEEK:
            player.seekVideoTo(data.playerTime);
            break;
        }
    }
    
    /** 
     * returns true if state are deemed to be same
     * @param old_state
     * @param new_state
     * @returns {Boolean}
     */
    function compareStates(old_state, new_state) {
        if (old_state.playerState === new_state.playerState) {
            return Math.abs(old_state.playerTime - new_state.playerTime) <= 2 * debounce_timeout; 
        } else {
            return false;
        }
    }
    
    function getState(player) {
        var state = {
                playerState: player.getPlayerState(),
                playerTime: player.getCurrentTime(),
            };
        return state;
    }

    function notifyServer(msg) {
        $.post('http://localhost:8080/?msgType=' + msg.msgType 
                + '&clientId=' + msg.clientId 
                + '&playerTime=' + msg.playerTime 
                + '&playerState=' + msg.playerState, 
                function(a) {}); 
    }

		// A $( document ).ready() block.
$( document ).ready(function() {
	console.log( "ready!" );
	var button = document.getElementById('btn');
	button.onclick =function(evt) {
		var input = document.getElementById('input');
		player.loadVideoById(input.value);
		notifyServer('load', 0, input.value);
	};
});

	
    // 2. This code loads the IFrame Player API code asynchronously.
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // 3. This function creates an <iframe> (and YouTube player)
    //    after the API code downloads.
    var player;
   
    // 5. The API calls this function when the player's state changes.
    //    The function indicates that when playing a video (state=1),
    //    the player should play for six seconds and then stop.
    var onPlayerStateChange = _.debounce(function (event) {
        
        console.error(event);
        
        /**
         * TODO apply the action to state and get a new state. compare it with the 
         * current state
         */
        
        new_state = applyActionToState(state_before_latest_server_action, latest_server_action);
        actual_state = getState(player);
        
        // new_state === null means there was no action 
        // if actual state is different from new state, then it's probably triggered by user action
        // if compared states are the same, then acknowledge, otherwise report current state to server
        if (new_state === null || !compareStates(actual_state, new_state)) {
            msg = createMessage(false, rid, actual_state);
        } else {
            msg = createMessage(true);
        }
        
        notifyServer(msg);
        
        /**
         *  clear the action and state. 
         */
        state_before_latest_server_action = latest_server_action = false;

       /*
        -1 – unstarted
        0 – ended
        1 – playing
        2 – paused
        3 – buffering
        5 – video cued
        */
        
        
//        switch(event.data) {
//        case 2:
//            if (!paused)
//            {
//                paused = true;
//                notifyServer('pause');
//            }
//            else
//            {
//                console.error(player.getCurrentTime());
//                notifyServer('seek', player.getCurrentTime());
//            }
//            break;
//        case 1:
//            notifyServer('play');
//            if (paused)
//            {
//                paused = false;
//            }
//            break;
//        default:
//            break;
//        }

    }, debounce_timeout);
    
    function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
            height: '390',
            width: '640',
            videoId: 'M7lc1UVf-VE',
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }

    // 4. The API will call this function when the video player is ready.
    function onPlayerReady(event) {
        //event.target.playVideo();
    }

    function pauseVideo() {
        //console.error('pausing');
        player.pauseVideo();
        
    }
    
    function stopVideo() {
        player.stopVideo();
        notifyServer('stop');
    }
    
    function playVideo() {
        player.playVideo();
    }

    function seekVideoTo(time) {
        console.error(time);
        player.seekTo(time);
    }
   
