const mapPlaceholder = {
    params: {
        image: "images/billboard_radar.svg",
        size: 100,
        defPos: new Cesium.Cartesian3(0, 0, 0),
    },

    videoplayerHeading: 0,
    _heading: 0,
    get heading() {
        return this._heading;
    },
    set heading(value) {
        this._heading = value;
    },

    entity: null,
    isVisible: false,

    fadeIn: function () {
        this.fade(0, 1);
        this.isVisible = true;

    },

    fadeOut: function () {
        this.fade(1, 0);
        this.isVisible = false;
    },

    show: function () {
        this.entity.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, 1.0);
        this.isVisible = true;
    },

    hide: function () {
        this.entity.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, 0.0);
        this.isVisible = false;
    },

    fade: function (from, to) {
        if (!this.entity) return;
        let lerpTime = 1000;
        let sampleInterval = 50;
        let initTime = 0;
        let billboard = this.entity.billboard;
        let lerp = setInterval(function () {
            initTime += sampleInterval;
            if (initTime <= lerpTime) {
                let t = initTime / lerpTime;
                let op = Math.lerp(from, to, t);
                billboard.color = new Cesium.Color(1.0, 1.0, 1.0, op);
            } else {
                clearInterval(lerp);
            }
        }, sampleInterval)
    },
}



//////////////////////////
/// startup
//////////////////////////
let mapPlaceholderStart = setInterval(function () {
    if (typeof viewer !== "undefined") {
        clearInterval(mapPlaceholderStart);

        mapPlaceholder.entity = viewer.entities.add({
            position: mapPlaceholder.params.defPos,
            billboard: {
                image: mapPlaceholder.params.image,
                width: mapPlaceholder.params.size,
                height: mapPlaceholder.params.size,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                rotation: new Cesium.CallbackProperty(function () {
                    return viewer.camera.heading - mapPlaceholder.heading -
                        mapPlaceholder.videoplayerHeading;
                })
            }
        });

        mapPlaceholder.hide();

    }
}, 100);




//////////////////////////////////////////////////////////
/// receiver from Dispatcher.js
//////////////////////////////////////////////////////////
if (window.addEventListener) window.addEventListener("message", addVideoplayerHeading, false);
else window.attachEvent("onmessage", addVideoplayerHeading);


function addVideoplayerHeading(evt) {
    let message = evt.data;
    if (message.command === "onVideoPlayerStatus") {
        mapPlaceholder.videoplayerHeading = Cesium.Math.toRadians(message.angle);
    }
}