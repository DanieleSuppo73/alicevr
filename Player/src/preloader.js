const preloader = {
    id: "videoPlayer-preloader",
    images: {
        failed: "images/preloader-failed.png",
    },
    timeout: 20000,
    startup: function () {
        $("#" + this.id).children('img').hide();

        let Obj = this;
        let time = 0;
        let sampleInterval = 100;
        let waitForVP = setInterval(function () {
            time += sampleInterval;

            /// show loading spinner after 2 sec
            console.log(time)
            if (time >= 2000){
                console.log("SHOW SPINNER")
                $("#" + Obj.id).children('img').show();
            }

            /// break after timeout
            if (time > preloader.timeout){
                console.log("BREAK!!!!!!!!!!!!")
                $("#" + Obj.id).children('img').attr("src", Obj.images.failed);
                clearInterval(waitForVP);
            }

            if (typeof videoPlayer !== "undefined") {
                clearInterval(waitForVP);
                videoPlayer.onReadyHandlers.push(function () {
                    preloader.hide();
                });
            }
        }, sampleInterval);
    },
    hide: function () {
        $("#" + this.id).fadeOut();
    },
}

preloader.startup();