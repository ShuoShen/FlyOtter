/**
 * 
 */

(function(exports){
    exports.MsgType = Object.freeze({
        CHECK_LATENCY: 1, 
        REQUEST: 2, 
        ACK: 3,
        ACTION: 4,
    });

})(typeof exports === 'undefined'? this['msg']={}: exports);


