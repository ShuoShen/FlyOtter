    var state_before_latest_server_action = null;
    var latest_server_action_data = null; 
    var debounce_timeout = 100;
    var shouldNotify = true;
    var paused = true;
    var socket = io.connect('http://localhost:8080');
    
    var ID_PREFIX = 'assignid=';
    var rid;// = Math.floor(Math.random() * UNIVERSE);
    console.error(msg);
    socket.on('notification', function (data) {
        // start with assignid
        var message = data.message;
        if (message.indexOf(ID_PREFIX) == 0)
        {
            rid = message.substring(ID_PREFIX.length, message.length);
            return;
        }
        data = JSON.parse(message);
        if (data.clientId === rid) {
            return;
        }
        state_before_latest_server_action = getState(player);

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

    function createMessage(ack_msg_id, rid, state) {

        var message = {
                clientTime: Date.now() / 1000,
                clientId: rid,
                playerTime: state.playerTime,
                playerState: state.playerState,
            };
        if (ack_msg_id) {
            message.ackMsgID = ack_msg_id;
            message.msgType = msg.MsgType.ACK;
        } else {
            message.msgType = msg.MsgType.REQUEST;
        }
        return message;
    }
    
    function applyActionToState(state, action_data) {
        if (state === null || action_data === null) {
            return null;
        } else {
            // clone the state;
            state = JSON.parse(JSON.stringify(state));
            action = parseInt(action_data.playerAction);
            if (action === player_action.PlayerAction.PLAY) {
                state.playerState = player_state.PlayerState.PLAYING;
            } else if (action === player_action.PlayerAction.PAUSE) {
                state.playerState = player_state.PlayerState.PAUSED;
            } else if (action === player_action.PlayerAction.SEEK) {
                state.playerTime = action_data.playerTime;
            }
            return state;
        }
    }
    
    function applyActionToPlayer(data, player) {
        latest_server_action_data = data; 
            
        switch (data.playerAction) {
        case player_action.PlayerAction.PLAY:
            player.playVideo();
            break;
        case player_action.PlayerAction.PAUSE:
            player.pauseVideo();
            break;
        case player_action.PlayerAction.SEEK:
            player.seekTo(data.playerTime);
            break;
        }
    }
    
    /** 
     * returns true if state are deemed to be same
     * @param old_state
     * @param new_state
     * @returns {Boolean}
     */
    function compareStates(old_state, new_state, only_compare_time) {
        // TODO (shen) hack and dangerous
        var is_buffering = old_state.playerState === player_state.PlayerState.BUFFERING || 
            new_state.playerState === player_state.PlayerState.BUFFERING; 

        if (old_state.playerState === new_state.playerState || is_buffering || only_compare_time) {
            return Math.abs(old_state.playerTime - new_state.playerTime) <= 3 * debounce_timeout; 
        } else {
            return false;
        }
    }
    
    function getState(player) {
        if (player === null) {
            return null;
        }
        var state = {
                playerState: player.getPlayerState(),
                playerTime: player.getCurrentTime(),
            };
        return state;
    }

    function notifyServer(msg) {
        var msg_str = '';
        var i = 0; 
        for (var key in msg) {
            msg_str += (i++) ? '&' : '?';
            msg_str += key + '=' + msg[key];
        }

console.error(msg_str);
        $.post('http://localhost:8080/' + msg_str, 
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
        
        new_state = applyActionToState(
                state_before_latest_server_action, 
                latest_server_action_data);
        actual_state = getState(player);
        
        // new_state === null means there was no action 
        // if actual state is different from new state, then it's probably triggered by user action
        // if compared states are the same, then acknowledge, otherwise report current state to server
        var message;
        if (new_state === null) {
           message = createMessage(false, rid, actual_state); 
        } else if (!compareStates(actual_state, new_state)) {  
        // dirty code: if the actual state is same as expected, then we have two scenarios

            if (latest_server_action_data.playerAction == player_action.PlayerAction.SEEK &&
                (compareStates(actual_state, new_state, true) || 
                    compareStates(actual_state, state_before_latest_server_action, true)) && 
                actual_state.playerState == player_state.PlayerState.PAUSED
            ) {
                // it's a seek event: the final states have the same player time as expected or
                // the same player time as before the event and now it's paused. 
                // in this case, don't have enough knowledge to tell if it's an acknowledge
                // because youtube has weird pause-pause-(play) pattern upon an actual seek event
                // we will wait for further event to trigger
                return;
            } else {
                message = createMessage(false, rid, actual_state);
            }
        } else { // acknowlege
            message = createMessage(latest_server_action_data.msgID, rid, actual_state);
        }
        
        notifyServer(message);
        
        /**
         *  clear the action and state. 
         */
        state_before_latest_server_action = latest_server_action_data = false;

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
            //playerVars: { 'autoplay': 1, 'controls': 0 },
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
