const videoPlayer = {

    isStarted: false,
    isPlaying: false,
    isPaused: false,
    isSeeking: false,

    duration: 0,
    time: -1,
    oldTime: -1,
    oldId: null,
    omniVirtIframe: null,
    asset: null,

    angle: 0,
    oldAngle: 0,

    onReadyHandlers: [],
    onStartedHandlers: [],
    onProgressChangedHandlers: [], /// handlers for video progress updated
    onSeekedHandlers: [], /// handlers for video has been seeked

    timeout: null,

    message: {
        command: 'onVideoPlayerStatus',
        status: null,
        time: null,
        angle: 0,
    },

   

    load: function (asset) {

        let url = asset.videoUrl_1;
        this.isStarted = false;
        this.isPlaying = false;
        this.isPaused = false;

        if (typeof url === "undefined" || url === "" || !url) {
            console.error("ERROR: video url is not defined!")
            alert("ERROR: Omnivirt video url is not defined!");
            return;
        }

        this.asset = asset;

        /// get id
        let id = 'ado-' + url;

        /// get previuos ID and change ID...
        let iframeId = this.oldId ? this.oldId : 'OmniVirt-container';
        this.omniVirtIframe = document.getElementById(iframeId);
        this.omniVirtIframe.id = id;

        this.oldId = id;
        this.isPlaying = false;

        document.getElementById(id).setAttribute("src",
            "//cdn.omnivirt.com/content/" + url + "?player=true&autoplay=false&referer=" + encodeURIComponent(
                window.location.href));
    },
    play: function () {
        OmniVirt.api.sendMessage('play', null, this.omniVirtIframe);
    },
    pause: function () {
        OmniVirt.api.sendMessage('pause', null, this.omniVirtIframe);
    },
    seek: function (time) {
        let percent = time / this.duration;
        OmniVirt.api.sendMessage('seek', percent, this.omniVirtIframe);
    }
};


OmniVirt.api.receiveMessage('loaded', function (eventName, data, instance) {
    // console.log('------ video loaded ------');
    for (let i in videoPlayer.onReadyHandlers) videoPlayer.onReadyHandlers[i](videoPlayer.asset);
});


OmniVirt.api.receiveMessage('duration', function (eventName, data, instance) {
    console.log('------ video duration: ' + data + ' ------');
    videoPlayer.duration = data;
});


OmniVirt.api.receiveMessage('started', function (eventName, data, instance) {
    videoPlayer.isStarted = true;
    // console.log('------ video is started ------')
    for (let i in videoPlayer.onStartedHandlers) videoPlayer.onStartedHandlers[i]();
    videoPlayer.message.status = "started";
    dispatcher.sendMessage(videoPlayer.message);

});


OmniVirt.api.receiveMessage('paused', function (eventName, data, instance) {
    videoPlayer.isPlaying = false;
    videoPlayer.isPaused = true;
    // console.log('------ video is paused ------')
    videoPlayer.message.status = "paused";
    dispatcher.sendMessage(videoPlayer.message);
});


OmniVirt.api.receiveMessage('ended', function (eventName, data, instance) {
    videoPlayer.isStarted = false;
    videoPlayer.isPlaying = false;
    // console.log('------ video is ended ------')
    videoPlayer.message.status = "ended";
    dispatcher.sendMessage(videoPlayer.message);
});


OmniVirt.api.receiveMessage('seeked', function (eventName, data, instance) {
    videoPlayer.isSeeking = true;
    console.log('------ video is seeked ------')
    videoPlayer.message.status = "seeking";
    dispatcher.sendMessage(videoPlayer.message);

    if (videoPlayer.timeout) clearTimeout(videoPlayer.timeout);

    /// wait 500ms before to flag bool as false
    videoPlayer.timeout = setTimeout(function () {
        videoPlayer.isSeeking = false;
        videoPlayer.timeout = null;
        for (let i in videoPlayer.onSeekedHandlers) {
            videoPlayer.onSeekedHandlers[i]();
        }
        console.log('------ video seeking ended ------')
    }, 500)
});



OmniVirt.api.receiveMessage('progress', function (eventName, data, instance) {
    videoPlayer.time = videoPlayer.duration * data;

    /// if the progress is updated...
    if (videoPlayer.time !== videoPlayer.oldTime && !videoPlayer.isSeeking) {
        videoPlayer.isPlaying = true;
        videoPlayer.oldTime = videoPlayer.time;

        /// call the handlers registered for video progress
        /// p.s. we use handlers instead of direct call to some function
        /// because we want to keep videoplayer
        /// separated from everything else, to be able to change it in the future
        for (let i in videoPlayer.onProgressChangedHandlers) {
            videoPlayer.onProgressChangedHandlers[i]();
        }

    } else {
        videoPlayer.isPlaying = false;
    }
});


OmniVirt.api.receiveMessage('longitude', function (eventName, data, instance) {
    videoPlayer.angle = data;
});


//////////////////////////////////////////////////////////
/// send videoPlayer Status message around the world
//////////////////////////////////////////////////////////
setInterval(function () {
    if (videoPlayer.isPlaying) {
        videoPlayer.message.status = "playing";
        videoPlayer.message.time = videoPlayer.time;
        videoPlayer.message.angle = videoPlayer.angle - 180;
        dispatcher.sendMessage(videoPlayer.message);
    }
    /// we do this to not change everything in videomarkers...
    else if(!videoPlayer.isPlaying && videoPlayer.isStarted){
        if (videoPlayer.angle !== videoPlayer.oldAngle){
            videoPlayer.oldAngle = videoPlayer.angle;
            videoPlayer.message.status = "";
            videoPlayer.message.angle = videoPlayer.angle - 180;
            dispatcher.sendMessage(videoPlayer.message);
        }
    }
}, 100)





//////////////////////////////////////////////////////////
/// receiver from Dispatcher.js
//////////////////////////////////////////////////////////
dispatcher.onMessage(function (msg) {
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