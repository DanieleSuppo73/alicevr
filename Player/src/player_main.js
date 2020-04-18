import {
    dispatcher
} from "../../lib/dispatcher.js";
import Clappr_player from "../lib/Clappr_player.js";
import OmniVirt_player from "../lib/OmniVirt_player.js";
import * as overlay from "../lib/overlay.js";
import * as subtitles from "../lib/subtitles.js";





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
    overlay.showOnReady();
});

player.onStartedHandlers.push(function () {
    dispatcher.sendMessage("playerStarted");
    overlay.showOnPlay();
});

player.onPausedHandlers.push(function () {
    dispatcher.sendMessage("playerPaused");
});

player.onSeekedHandlers.push(function () {
    dispatcher.sendMessage("playerSeeking");
    subtitles.restart();
});

player.onEndedHandlers.push(function () {
    dispatcher.sendMessage("playerEnded");
    overlay.showOnReady();
});






//////////////////////////////////////////////
/// receive messages
//////////////////////////////////////////////
dispatcher.receiveMessage("rootAssetClicked", function (asset) {
    overlay.slideShow(asset);
});

dispatcher.receiveMessage("videoAssetClicked", function (asset) {
    console.log("videoAssetClicked received message");
    player.load(asset);
    overlay.load(player, asset);
    subtitles.load(asset);
    console.log(asset)
});

dispatcher.receiveMessage("videoPlayerPlay", function () {
    player.play();
});

dispatcher.receiveMessage("videoPlayerSeek", function (time) {
    player.seek(time);
});







setInterval(() => {

    if (player.isStarted) {

        //////////////////////////////////////////////
        /// send message during playback
        //////////////////////////////////////////////
        let time = player.time;
        let angle = player.angle;
        dispatcher.sendMessage("playerPlaying", {
            time: time,
            angle: angle,
        });


        //////////////////////////////////////////////
        /// rotate overlay viewAngle
        //////////////////////////////////////////////
        overlay.viewAngle.rotate(angle);



        //////////////////////////////////////////////
        /// check for subtitles
        //////////////////////////////////////////////
        subtitles.check(time);

    }
}, 200);







////////////////////////////////////////// DEBUG
let asset = {
    videoUrl: "https://player.vimeo.com/external/347803220.m3u8?s=61a66fd483813c89da138ac578628ca68bb65fe3",
    videoUrl_1: "43236",
    subtitles: "coppi_subtitles.xml",
    title: "Titolo di prova",
    description: "Per debug"
}



// player.load(asset)
// overlay.load(player, asset);
// subtitles.load(asset);