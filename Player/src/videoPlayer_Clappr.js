const videoPlayer = {
    posterFolder: "../data/poster/",
    player: null,
    plugin360: null,
    oldAsset: null,

    isStarted: false,
    isPlaying: false,
    isPaused: false,
    isSeeking: false,

    angle: 0,
    oldAngle: 0,

    onReadyHandlers: [],
    onStartedHandlers: [],
    onPausedHandlers: [],
    onSeekedHandlers: [],
    onEndedHandlers: [],

    defTheta: 1.5707963267948966,
    defPhi: 0,

    message: {
        command: 'onVideoPlayerStatus',
        status: null,
        time: null,
        angle: 0,
    },

    get time() {
        if (videoPlayer.player) {
            return videoPlayer.player.getCurrentTime();
        } else {
            console.error("Error - try to get time from player not defined")
        }
    },

    play: () => {
        if (!videoPlayer.isPlaying) {
            videoPlayer.player.play();
        }
    },

    pause: () => {
        if (videoPlayer.player) {
            videoPlayer.player.pause();
        }
    },

    stop: () => {
        if (videoPlayer.player) {
            videoPlayer.player.stop();
        }
    },

    seek: (time) => {
        videoPlayer.player.seek(time);
    },


    //////////////////////////////////////////
    /// load
    //////////////////////////////////////////
    load: function (asset) {

        console.log("VIDEOPLAYER LOAD")
        let assetToLoad = asset ? asset : this.oldAsset;
        this.oldAsset = asset;

        let url = assetToLoad.videoUrl;

        if (typeof url === "undefined" || url === "" || !url) {
            console.error("ERROR: video url is not defined!")
            alert("ERROR: Omnivirt video url is not defined!");
            return;
        }

        videoPlayer.isStarted = false;
        videoPlayer.isPlaying = false;
        videoPlayer.isPaused = false;


        /// destroy old video
        if (videoPlayer.player !== null) {
            videoPlayer.player.destroy();
            console.log("new video is requested to load");
        }


        /// get the poster image,
        /// and catch when it's ready
        let poster = null;
        if (assetToLoad.poster) {
            poster = videoPlayer.posterFolder + assetToLoad.poster;

            console.log("loading poster......................")

            /// we actually use the onLoad function on the poster
            /// to catch when the viewport is ready to show.
            /// Ideally this should be replaced by some "READY"
            /// listener on the Clappr
            let posterImg = new Image();
            posterImg.src = poster;
            posterImg.onload = function () {
                for (let i in videoPlayer.onReadyHandlers) videoPlayer.onReadyHandlers[i](assetToLoad);
                console.log("poster is ready... videoPlayer.onReadyHandlers")
            }
        } else {
            console.warn("There's no POSTER image for this video!")
            setTimeout(function () {
                for (let i in videoPlayer.onReadyHandlers) videoPlayer.onReadyHandlers[i](assetToLoad);
            }, 500)

        }



        /// create a new Clappr instance
        videoPlayer.player = new Clappr.Player({
            source: url,
            plugins: {
                container: [Video360],
            },
            parentId: "#Clappr-container",
            // events: {
            //     onReady: function () {
            //         for (let i in videoPlayer.onReadyHandlers) videoPlayer.onReadyHandlers[i](asset);
            //         console.log("videoPlayer is ready")
            //     },
            // },
            width: "100%",
            height: "100%",
            poster: poster,
        });


        /// get plugin360 as reference to get the view angle
        videoPlayer.plugin360 = videoPlayer.player.core.containers[0].plugins.find(p => p.name == "Video360");

        /// disable click to pause for 360 video
        videoPlayer.player.getPlugin('click_to_pause').disable();

        /// listeners
        videoPlayer.player.listenTo(videoPlayer.player, Clappr.Events.PLAYER_PLAY, () => {

            if (videoPlayer.isSeeking) {
                videoPlayer.isSeeking = false;
                videoPlayer.isPlaying = true;
                // console.log("video is playing again from seek");

            } else {
                if (videoPlayer.isPaused) {
                    videoPlayer.isPaused = false;
                    videoPlayer.isPlaying = true;
                    // console.log("video is playing again from pause");
                } else {
                    videoPlayer.isPlaying = true;
                    // console.log("video started");
                }
            }

            if (!videoPlayer.isStarted) {
                videoPlayer.isStarted = true;
                /// execute subscribed functions
                for (let i in videoPlayer.onStartedHandlers) videoPlayer.onStartedHandlers[i]();
                console.log("-------VP STARTED")
                videoPlayer.message.status = "started";
                dispatcher.sendMessage(videoPlayer.message);
            }
        });


        videoPlayer.player.listenTo(videoPlayer.player, Clappr.Events.PLAYER_PAUSE, () => {
            videoPlayer.isPlaying = false;
            videoPlayer.isPaused = true;

            /// execute subscribed functions
            for (let i in videoPlayer.onPausedHandlers) videoPlayer.onPausedHandlers[i]();

            // console.log("video is paused");
            videoPlayer.message.status = "paused";
            dispatcher.sendMessage(videoPlayer.message);
        });


        videoPlayer.player.listenTo(videoPlayer.player, Clappr.Events.PLAYER_SEEK, () => {
            videoPlayer.isSeeking = true;
            videoPlayer.isPlaying = false;

            /// execute subscribed functions
            for (let i in videoPlayer.onSeekedHandlers) videoPlayer.onSeekedHandlers[i]();

            console.log("video is seeking");
            videoPlayer.message.status = "seeking";
            dispatcher.sendMessage(videoPlayer.message);
        });


        videoPlayer.player.listenTo(videoPlayer.player, Clappr.Events.PLAYER_ENDED, () => {
            videoPlayer.isStarted = false;
            videoPlayer.isSeeking = false;
            videoPlayer.isPlaying = false;
            videoPlayer.isFinished = true;

            /// execute subscribed functions
            for (let i in videoPlayer.onEndedHandlers) videoPlayer.onEndedHandlers[i]();

            console.log("Video ended");
            videoPlayer.message.status = "ended";
            dispatcher.sendMessage(videoPlayer.message);
        });
    },
};



//////////////////////////////////////////////////////////
/// send videoPlayer Status message around the world
//////////////////////////////////////////////////////////
setInterval(function () {
    if (videoPlayer.isPlaying) {
        videoPlayer.message.status = "playing";
        videoPlayer.message.time = videoPlayer.player.getCurrentTime();
        videoPlayer.message.angle = videoPlayer.angle;
        dispatcher.sendMessage(videoPlayer.message);
    }
    /// we do this to not change everything in videomarkers...
    else if(!videoPlayer.isPlaying && videoPlayer.isStarted){
        if (videoPlayer.angle !== videoPlayer.oldAngle){
            videoPlayer.oldAngle = videoPlayer.angle;
            videoPlayer.message.status = "";
            videoPlayer.message.angle = videoPlayer.angle;
            dispatcher.sendMessage(videoPlayer.message);
        }
    }
}, 100)




//////////////////////////////////////////////////////////
/// receiver from Dispatcher.js
//////////////////////////////////////////////////////////
dispatcher.receiveMessage(function (msg) {
    if (msg.command === "onVideoAssetClicked") {
        // console.log("onVideoAssetClicked received message");
        videoPlayer.load(msg.asset);
    }
    if (msg.command === "videoPlayerPlay") {
        videoPlayer.play();
    }
    if (msg.command === "videoPlayerSeek") {
        videoPlayer.seek(msg.time);
    }
});







// // DEBUG
// let asset = {
//     videoUrl: "https://player.vimeo.com/external/355816026.m3u8?s=95add46cf3c7efa7ee281230ef12daf0b5562d26"
// }
// videoPlayer.load(asset)