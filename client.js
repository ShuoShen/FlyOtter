    var shouldNotify = true;
    var socket = io.connect('http://localhost:8080');
	var UNIVERSE = 100000;
	var rid = Math.floor(Math.random() * UNIVERSE);
	socket.on('notification', function (data) {
		console.error('hello notification');
	    var msg = JSON.parse(data.message);
	    console.error(msg);
	    if (msg.rid == rid) {
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
	    }
	});
	
	
	function notifyServer(operator) {
    	if (!shouldNotify) {
    		shouldNotify = true;
    		return;
    	}
		
		$.post('http://localhost:8080/?operator=' + operator + '&rid=' + rid, function(a) {}); 
	}
	
	
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
            pauseVideo();
            break;
    	case 1:
    		playVideo();
    		break;
    	}

    }
    
    function pauseVideo() {
    	console.error('pausing');
    	player.pauseVideo();
        notifyServer('pause');
    }
    
    function stopVideo() {
        player.stopVideo();
        notifyServer('stop');
    }
    
    function playVideo() {
    	player.playVideo();
    	notifyServer('play');
    }
   