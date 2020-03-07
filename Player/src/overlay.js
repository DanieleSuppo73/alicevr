const overlay = {};


overlay.poster = {
    id: "videoPlayer-poster",
    show: function (asset) {
        $('#videoPlayer-overlay').fadeOut(0);
        $('#videoPlayer_viewAngle').fadeOut(0);
        $("#" + this.id).fadeIn();
        $('#poster-title').text(asset.title);
        $('#poster-description').text(asset.description);
    },
    hide: function () {
        $("#" + this.id).fadeOut();
    }
}


overlay.icon360 = {
    id: "icon-360",
    show: function () {
        $("#" + this.id).fadeIn(0);
    },  
    hide: function () {
        $("#" + this.id).fadeOut();
    }
}


overlay.icon360big = {
    id: "icon-360-big",
    show: function () {
        $("#" + this.id).attr("src", "images/icon_360-anim-big.gif");
        $("#" + this.id).fadeIn();
        let _id = this.id;
        setTimeout(function () {
            $("#" + _id).fadeOut();
        }, 6000)
    },
    hide: function () {
        $("#" + this.id).fadeOut(0);
    }
}


overlay.viewAngle = {
    id: "videoPlayer_viewAngle",
    show: function () {
        $("#" + this.id).fadeIn();
    },
    hide: function () {
        $("#" + this.id).fadeOut(0);
    },
}


overlay.viewAngle.over = {
    id: "videoPlayer_viewAngle-over",
    show: function () {
        $("#" + this.id).fadeIn();
    },
    hide: function () {
        $("#" + this.id).fadeOut();
    },
}



overlay.viewAngle.update = setInterval(function () {
    if (typeof videoPlayer !== "undefined" && videoPlayer.plugin360) {

        let rotDegrees = ((videoPlayer.plugin360.viewer.controls.theta / videoPlayer.defTheta) - 1) * -90;
        let $viewCone = $("#videoPlayer_viewAngle-cone");

        // For webkit browsers: e.g. Chrome
        $viewCone.css({
            WebkitTransform: 'rotate(' + rotDegrees + 'deg)'
        });
        // For Mozilla browser: e.g. Firefox
        $viewCone.css({
            '-moz-transform': 'rotate(' + rotDegrees + 'deg)'
        });

        videoPlayer.angle = rotDegrees;
    }
}, 100);





overlay.viewAngle.resetCamera = function () {
    let initTheta = videoPlayer.plugin360.viewer.controls.theta;
    let initPhi = videoPlayer.plugin360.viewer.controls.phi;

    if (initTheta === videoPlayer.defTheta && initPhi === videoPlayer.defPhi)
        return;

    let lerpTime = 2000;
    let sampleInterval = lerpTime / 50;
    let initTime = 0;
    let lerp = setInterval(function () {

        initTime += sampleInterval;
        if (initTime < lerpTime) {

            let t = initTime / lerpTime;
            t = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

            let theta = Math.lerp(initTheta, videoPlayer.defTheta, t);
            let phi = Math.lerp(initPhi, videoPlayer.defPhi, t);

            videoPlayer.plugin360.viewer.controls.theta = theta;
            videoPlayer.plugin360.viewer.controls.phi = phi;

        } else {
            clearInterval(lerp);
            videoPlayer.plugin360.viewer.controls.theta = videoPlayer.defTheta;
            videoPlayer.plugin360.viewer.controls.phi = videoPlayer.defPhi;
        }
    }, sampleInterval)
}





overlay.viewArrows = {
    id: "videoPlayer_viewArrows",
    isActive: false,
    rotInterval: null,
    increment: 0,

    show: function () {
        if (this.isActive)
            $("#" + this.id).fadeIn();
    },

    hide: function (time) {
        $("#" + this.id).fadeOut(time);
    },

    right_ON: function (div) {
        $(div).find("img:first").fadeIn();
        if (this.rotInterval) {
            clearInterval(this.rotInterval);
            this.rotInterval = null;
        }

        /// smooth acceleration
        let t = 1;
        increment = 0;
        this.rotInterval = setInterval(function () {
            t += 0.00002;
            let t1 = (t * t) - 1;
            increment = Math.clamp(t1, 0, 0.007)
            videoPlayer.plugin360.viewer.controls.theta -= increment;
        }, 10);
    },

    right_OFF: function (div) {
        $(div).find("img:first").fadeOut();
        if (this.rotInterval) {
            clearInterval(this.rotInterval);
            this.rotInterval = null;
        }

        /// smooth deceleration
        let lerpTime = 1000;
        let sampleInterval = lerpTime / 50;
        let initTime = 0;
        let lerp = setInterval(function () {
            initTime += sampleInterval;
            if (initTime < lerpTime) {
                let t = initTime / lerpTime;
                t = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                let inc = Math.lerp(increment, 0, t);
                videoPlayer.plugin360.viewer.controls.theta -= inc;
            } else {
                clearInterval(lerp);
            }
        }, sampleInterval)

    },

    left_ON: function (div) {
        $(div).find("img:first").fadeIn();
        if (this.rotInterval) {
            clearInterval(this.rotInterval);
            this.rotInterval = null;
        }

        /// smooth acceleration
        let t = 1;
        increment = 0;
        this.rotInterval = setInterval(function () {
            t += 0.00002;
            let t1 = (t * t) - 1;
            increment = Math.clamp(t1, 0, 0.007)
            videoPlayer.plugin360.viewer.controls.theta += increment;
        }, 10);
    },

    left_OFF: function (div) {
        $(div).find("img:first").fadeOut();
        if (this.rotInterval) {
            clearInterval(this.rotInterval);
            this.rotInterval = null;
        }

        /// smooth deceleration
        let lerpTime = 1000;
        let sampleInterval = lerpTime / 50;
        let initTime = 0;
        let lerp = setInterval(function () {
            initTime += sampleInterval;
            if (initTime < lerpTime) {
                let t = initTime / lerpTime;
                t = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                let inc = Math.lerp(increment, 0, t);
                videoPlayer.plugin360.viewer.controls.theta += inc;
            } else {
                clearInterval(lerp);
            }
        }, sampleInterval)
    },
}






// overlay.oldTime = null;
// overlay.time = function (time) {

//     if (overlay.oldTime) {
//         let diff = Math.abs(time - this.oldTime) / 1000; //sec
//         if (diff < 120) return;
//     }

//     overlay.oldTime = time;

//     var d = new Date(time)
//     var hh = d.getHours();
//     var mm = d.getMinutes();

//     $('#time').fadeIn();
//     $('#time').find('p').text(hh + ":" + mm);

//     setTimeout(function () {
//         $('#time').fadeOut();
//     }, 4000)
// }




//////////////////////////////////////////////////////////
/// functions registered on videoplayer handlers
//////////////////////////////////////////////////////////
overlay.videoPlayerHandlers = setInterval(function () {
    if (typeof videoPlayer !== "undefined") {
        clearInterval(overlay.videoPlayerHandlers);

        videoPlayer.onReadyHandlers.push(function (asset) {
            // overlay.preloader.hide();
            overlay.poster.show(asset);
            overlay.icon360.show();
            overlay.icon360big.hide();
            overlay.viewAngle.hide();
            overlay.viewAngle.over.hide();
            overlay.viewArrows.isActive = false;
            overlay.viewArrows.hide(0);
        });

        videoPlayer.onStartedHandlers.push(function () {
            overlay.poster.hide();
            overlay.icon360.hide();
            overlay.icon360big.show();
            overlay.viewAngle.show();
            overlay.viewArrows.isActive = isMobile ? false : true;
        });
    }

}, 100)