import {
    Clappr_player
} from "../lib/Clappr_player.js"
import {
    OmniVirt_player
} from "../lib/OmniVirt_player.js"
import * as overlay from "../lib/overlay.js"
import {
    dispatcher
} from "../../lib/dispatcher.js"




//////////////////////////////////////////////
/// Swap player on platform
//////////////////////////////////////////////
let player;
if (WURFL.complete_device_name === "Microsoft Edge" || WURFL.complete_device_name === "Apple iPhone") {
    player = OmniVirt_player;
    $("#Clappr-container").remove();
    $("#poster-textContainer").css("max-height", "27%");
    $("#poster-textContainer").css("bottom", "60px");
} else {
    player = Clappr_player;
    $("#OmniVirt-container").remove();
}






//////////////////////////////////////////////
/// register handlers
//////////////////////////////////////////////
player.onReadyHandlers.push(function () {
    $("#videoPlayer-preloader").fadeOut();
    overlay.init(player);
});

player.onStartedHandlers.push(function () {
    dispatcher.sendMessage("started");
    overlay.showDuringPlayback();
});

player.onPausedHandlers.push(function () {
    dispatcher.sendMessage("paused");
});

player.onSeekedHandlers.push(function () {
    dispatcher.sendMessage("seeking");
});

player.onEndedHandlers.push(function () {
    dispatcher.sendMessage("ended");
});






//////////////////////////////////////////////
/// receive messages
//////////////////////////////////////////////
dispatcher.receiveMessage("onVideoAssetClicked", function () {
    console.log("onVideoAssetClicked received message");
    videoPlayer.load(msg.asset);
});
dispatcher.receiveMessage("videoPlayerPlay", function () {
    videoPlayer.play();
});
dispatcher.receiveMessage("videoPlayerSeek", function (time) {
    videoPlayer.seek(time);
});







setInterval(() => {

    if (player.isStarted) {

        //////////////////////////////////////////////
        /// send message during playback
        //////////////////////////////////////////////
        dispatcher.sendMessage("playerPlaying", {
            time: player.time,
            angle: player.angle,
        });


        //////////////////////////////////////////////
        /// rotate overlay viewAngle
        //////////////////////////////////////////////
        overlay.viewAngle.rotate(player.angle);

    }
}, 200);







////////////////////////////////////////// DEBUG
let asset = {
    videoUrl: "https://player.vimeo.com/external/355816026.m3u8?s=95add46cf3c7efa7ee281230ef12daf0b5562d26",
    videoUrl_1: "43237"
}
player.load(asset)