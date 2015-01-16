/**
 * 
 */

(function(exports){
    exports.PlayerState = Object.freeze({
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        VIDEO_CUED: 5
    });

})(typeof exports === 'undefined'? this['player_state']={}: exports);
