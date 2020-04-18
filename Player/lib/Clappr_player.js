const Clappr_player = {
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

    get duration(){
        console.log(this.player.getDuration())
        return this.player.getDuration();
    },
    
    get time() {
        if (this.player) {
            return this.player.getCurrentTime();
        } else {
            console.error("Error - try to get time from player not defined")
        }
    },

    get angle() {
        let angle = ((this.plugin360.viewer.controls.theta / this.defTheta) - 1) * -90;
        return angle;
    },

    play: function () {
        if (this.player && !this.isPlaying) {
            this.player.play();
        }
    },

    pause: function () {
        if (this.player) {
            this.player.pause();
        }
    },

    stop: function () {
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

        this.isStarted = false;
        this.isPlaying = false;
        this.isPaused = false;

        if (this.oldAsset === asset) {
            for (let i in this.onReadyHandlers) this.onReadyHandlers[i]();
        } else {
            this.oldAsset = asset;

            let url = asset.video_url1;

            /// get the poster image,
            if (asset.poster_url) {
                let poster = this.posterFolder + asset.poster_url;

                console.log("loading poster......................")

                let posterImg = new Image();
                posterImg.src = poster;
                posterImg.onload = () => {
                    this.setup(url, poster);
                }
            } else {
                this.setup(url);
            }
        }
    },

    setup: function (url, poster = null) {

        /// destroy old video
        if (this.player) {
            this.player.destroy();
            console.log("new video is requested to load");
        }


        /// create a new Clappr instance
        var playerElement = document.getElementById("Clappr-container");
        this.player = new Clappr.Player({
            source: url,
            plugins: {
                container: [Video360],
            },
            // parentId: "#Clappr-container",
            width: "100%",
            height: "100%",
            poster: poster,
        });


        /// listeners
        this.player.listenTo(this.player, Clappr.Events.PLAYER_READY, () => {
            console.log("video is ready");
            for (let i in this.onReadyHandlers) this.onReadyHandlers[i]();
        });


        this.player.listenTo(this.player, Clappr.Events.PLAYER_PLAY, () => {

            if (this.isSeeking) {
                this.isSeeking = false;
                this.isPlaying = true;
                console.log("video is playing again from seek");

            } else {
                if (this.isPaused) {
                    this.isPaused = false;
                    this.isPlaying = true;
                    console.log("video is playing again from pause");
                } else {
                    this.isPlaying = true;
                    console.log("video started");
                }
            }

            if (!this.isStarted) {
                this.isStarted = true;

                for (let i in this.onStartedHandlers) this.onStartedHandlers[i]();
            }
        });


        this.player.listenTo(this.player, Clappr.Events.PLAYER_PAUSE, () => {
            this.isPlaying = false;
            this.isPaused = true;

            for (let i in this.onPausedHandlers) this.onPausedHandlers[i]();
            console.log("video is paused");
        });


        this.player.listenTo(this.player, Clappr.Events.PLAYER_SEEK, () => {
            this.isSeeking = true;
            this.isPlaying = false;

            for (let i in this.onSeekedHandlers) this.onSeekedHandlers[i]();
            console.log("video is seeking");
        });


        this.player.listenTo(this.player, Clappr.Events.PLAYER_ENDED, () => {
            this.isStarted = false;
            this.isSeeking = false;
            this.isPlaying = false;
            this.isFinished = true;

            for (let i in this.onEndedHandlers) this.onEndedHandlers[i]();
            console.log("Video ended");
        });


        /// attach to parent element NOW (or ONREADY listener will not fire)
        this.player.attachTo(playerElement);

        /// get plugin360 as reference to get the view angle
        this.plugin360 = this.player.core.containers[0].plugins.find(p => p.name == "Video360");

        /// disable click to pause for 360 video
        this.player.getPlugin('click_to_pause').disable();

        window.dur = Clappr_player.player.getDuration();
    }
};


export default Clappr_player;


