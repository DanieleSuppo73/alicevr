import {
    Maf
} from "../../../../lib/Maf.js"


export function fadeIn(entity, callback = null, time = null) {
    if (entity.opacity !== 1)
        fade(entity, 0, 1, callback, time);
    // this.isVisible = true;
};

export function fadeOut(entity, callback = null, time = null) {
    if (entity.opacity !== 0)
        fade(entity, 1, 0, callback, time);
    // this.isVisible = false;
};

export function show(entity) {
    this.entity.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, 1.0);
    // this.isVisible = true;
};

export function hide(entity) {
    this.entity.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, 0.0);
    // this.isVisible = false;
};

var lerp = null;

function fade(entity, from, to, callback, time) {
    let lerpTime = time ? time : 1000; /// default fade time
    let sampleInterval = 50;
    let initTime = 0;
    if (lerp) {
        clearInterval(lerp);
        lerp = null;
    }
    lerp = setInterval(function () {
        initTime += sampleInterval;
        if (initTime <= lerpTime) {
            let t = initTime / lerpTime;
            entity.opacity = Maf.lerp(from, to, t);
        } else {
            clearInterval(lerp);
            entity.opacity = to;
            if (callback) callback();
        }
    }, sampleInterval)
};