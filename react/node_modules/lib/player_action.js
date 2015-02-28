/**
 * 
 */

(function(exports){
    exports.PlayerAction = Object.freeze({
        PLAY: 0,
        PAUSE: 1,
        SEEK: 2,
        STOP: 3,
    });

})(typeof exports === 'undefined'? this['player_action']={}: exports);
