    var shouldNotify = true;
    var paused = true;
    var socket = io.connect('http://localhost:8080');
    var UNIVERSE = 100000;
    var rid = Math.floor(Math.random() * UNIVERSE);
    socket.on('notification', function (data) {
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


    function notifyServer(operator, seekToTime, arg) {
        if (!shouldNotify) {
            shouldNotify = true;
            return;
        }
        console.error('http://localhost:8080/?operator=' + operator + '&rid=' + rid + '&stt=' + seekToTime);
        $.post('http://localhost:8080/?operator=' + operator + '&rid=' + rid + '&stt=' + seekToTime + '&arg=' + arg, function(a) {}); 
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

    // 5. The API calls this function when the player's state changes.
    //    The function indicates that when playing a video (state=1),
    //    the player should play for six seconds and then stop.
    function onPlayerStateChange(event) {
        
        console.error(event);
        /*

        -1 – unstarted
        0 – ended
        1 – playing
        2 – paused
        3 – buffering
        5 – video cued
        */
        
        switch(event.data) {
        case 2:
            if (!paused)
            {
                paused = true;
                notifyServer('pause');
            }
            else
            {
                console.error(player.getCurrentTime());
                notifyServer('seek', player.getCurrentTime());
            }
            break;
        case 1:
            notifyServer('play');
            if (paused)
            {
                paused = false;
            }
            break;
        default:
            break;
        }

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
   
