import {
    Maf
} from "../../../../lib/Maf.js"


export function fadeIn(entity, callback = null, time = null) {
    console.log("fade in")
    if (entity.opacity !== 1)
        fadeFunc(entity, 0, 1, callback, time);
    else {
        if (callback) callback();
    }
};

export function fadeOut(entity, callback = null, time = null) {
    console.log("fade out")
    if (entity.opacity !== 0)
        fadeFunc(entity, 1, 0, callback, time);
    else {
        if (callback) callback();
    }
};

export function show(entity) {
    entity.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, 1.0);
};

export function hide(entity) {
    entity.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, 0.0);
};

var lerp = null;

function fadeFunc(entity, from, to, callback, time) {
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