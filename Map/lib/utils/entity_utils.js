import {
    Maf
} from "../../../lib/Maf.js"


export function fadeIn(entity, callback = null, time = null) {
    if (entity.opacity !== 1)
        fadeFunc(entity, 0, 1, callback, time);
    else {
        if (callback) callback();
    }
};

export function fadeOut(entity, callback = null, time = null) {
    if (entity.opacity !== 0)
        fadeFunc(entity, 1, 0, callback, time);
    else {
        if (callback) callback();
    }
};

// export function show(entity) {
//     entity.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, 1.0);
// };

// export function hide(entity) {
//     entity.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, 0.0);
// };

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




export class Fader {
    constructor(entity) {
        this.entity = entity;
        this.lerp = null;
    }

    fadeIn(callback = null, time = null) {
        if (this.entity.opacity !== 1)
            this.fadeFunc(0, 1, callback, time);
        else {
            if (callback) callback();
        }
    };

    fadeOut(callback = null, time = null) {
        if (this.entity.opacity !== 0)
            this.fadeFunc(1, 0, callback, time);
        else {
            if (callback) callback();
        }
    };

    fadeFunc(from, to, callback, time) {
        let lerpTime = time ? time : 1000; /// default fade time
        let sampleInterval = 50;
        let initTime = 0;
        if (this.lerp) {
            clearInterval(lerp);
            this.lerp = null;
        }
        this.lerp = setInterval(() => {
            initTime += sampleInterval;
            if (initTime <= lerpTime) {
                let t = initTime / lerpTime;
                this.entity.opacity = Maf.lerp(from, to, t);
            } else {
                clearInterval(this.lerp);
                this.entity.opacity = to;
                if (callback) callback();
            }
        }, sampleInterval)
    };
}