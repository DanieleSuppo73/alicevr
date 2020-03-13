export const Clappr_player = {
    posterFolder: "../data/poster/",
    player: null,
    plugin360: null,
    oldAsset: null,

    isStarted: false,
    isPlaying: false,
    isPaused: false,
    isSeeking: false,

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
        if (this.player) {
            return this.player.getCurrentTime();
        } else {
            console.error("Error - try to get time from player not defined")
        }
    },

    get angle(){
        let angle = ((this.plugin360.viewer.controls.theta / this.defTheta) - 1) * -90;
        return angle;
    },

    play: function() {
        if (this.player && !this.isPlaying) {
            this.player.play();
        }
    },

    pause: function() {
        if (this.player) {
            this.player.pause();
        }
    },

    stop: function() {
        if (this.player) {
            this.player.stop();
        }
    },

    seek: function (time) {
        this.player.seek(time);
    },


    //////////////////////////////////////////
    /// load
    //////////////////////////////////////////
    load: function (asset) {

        let assetToLoad = asset ? asset : this.oldAsset;
        this.oldAsset = asset;

        let url = assetToLoad.videoUrl;

        if (typeof url === "undefined" || url === "" || !url) {
            console.error("ERROR: video url is not defined!")
            alert("ERROR: video url is not defined!");
            return;
        }

        this.isStarted = false;
        this.isPlaying = false;
        this.isPaused = false;


        /// destroy old video
        if (this.player) {
            this.player.destroy();
            console.log("new video is requested to load");
        }


        /// get the poster image,
        /// and catch when it's ready
        let poster = null;
        if (assetToLoad.poster) {
            poster = this.posterFolder + assetToLoad.poster;

            console.log("loading poster......................")

            /// we actually use the onLoad function on the poster
            /// to catch when the viewport is ready to show.
            /// Ideally this should be replaced by some "READY"
            /// listener on the Clappr
            let posterImg = new Image();
            posterImg.src = poster;
            posterImg.onload = function () {
                for (let i in this.onReadyHandlers) this.onReadyHandlers[i](assetToLoad);
            }
        } else {
            console.warn("There's no POSTER image for this video!")
            let vp = this;
            setTimeout(function () {
                for (let i in vp.onReadyHandlers) vp.onReadyHandlers[i](assetToLoad);
            }, 500)

        }


        
        /// create a new Clappr instance
        this.player = new Clappr.Player({
            source: url,
            plugins: {
                container: [Video360],
            },
            parentId: "#Clappr-container",
            events: {
                onError: function (error) {
                    console.error(error)
                    alert(error);
                },
            },
            width: "100%",
            height: "100%",
            poster: poster,
        });


        /// get plugin360 as reference to get the view angle
        this.plugin360 = this.player.core.containers[0].plugins.find(p => p.name == "Video360");

        /// disable click to pause for 360 video
        this.player.getPlugin('click_to_pause').disable();

        /// listeners
        let vp = this;
        vp.player.listenTo(vp.player, Clappr.Events.PLAYER_PLAY, () => {

            if (vp.isSeeking) {
                vp.isSeeking = false;
                vp.isPlaying = true;
                console.log("video is playing again from seek");

            } else {
                if (vp.isPaused) {
                    vp.isPaused = false;
                    vp.isPlaying = true;
                    console.log("video is playing again from pause");
                } else {
                    vp.isPlaying = true;
                    console.log("video started");
                }
            }

            if (!vp.isStarted) {
                vp.isStarted = true;

                for (let i in vp.onStartedHandlers) vp.onStartedHandlers[i]();
            }
        });


        vp.player.listenTo(vp.player, Clappr.Events.PLAYER_PAUSE, () => {
            vp.isPlaying = false;
            vp.isPaused = true;

            for (let i in vp.onPausedHandlers) vp.onPausedHandlers[i]();
            console.log("video is paused");
        });


        vp.player.listenTo(vp.player, Clappr.Events.PLAYER_SEEK, () => {
            vp.isSeeking = true;
            vp.isPlaying = false;

            for (let i in vp.onSeekedHandlers) vp.onSeekedHandlers[i]();
            console.log("video is seeking");
        });


        vp.player.listenTo(vp.player, Clappr.Events.PLAYER_ENDED, () => {
            vp.isStarted = false;
            vp.isSeeking = false;
            vp.isPlaying = false;
            vp.isFinished = true;

            for (let i in vp.onEndedHandlers) vp.onEndedHandlers[i]();
            console.log("Video ended");
        });
    },
};
