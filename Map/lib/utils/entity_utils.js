import {
    Maf
} from "../../../lib/Maf.js"




export function remove(entity){
    Map.viewer.entities.remove(entity);
}


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






export function zoom(entity, to, callback = null, time = null) {
    let lerpTime = time ? time : 200; /// default zoom time
    let sampleInterval = 50;
    let initTime = 0;
    let from = entity.id.scale;
    if (lerp) {
        clearInterval(lerp);
        lerp = null;
    }
    lerp = setInterval(function () {
        initTime += sampleInterval;
        if (initTime <= lerpTime) {
            let t = initTime / lerpTime;
            entity.id.scale = Maf.lerp(from, to, t);
        } else {
            clearInterval(lerp);
            entity.id.scale = to;
            if (callback) callback();
        }
    }, sampleInterval)
}



var lerp = null;

function fadeFunc(entity, from, to, callback, time) {
    // console.log("FADE: " + entity.category + " - to:" + to)
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
            // console.log(entity.category + " - " + entity.opacity)
        } else {
            clearInterval(lerp);
            entity.opacity = to;
            if (callback) callback();
        }
    }, sampleInterval)
};





export class Utils {
    constructor(entity) {
        this.entity = entity;
        this.zoomLerp = null;
        this.fadeLerp = null;
        this.lerpTime = 200;
        this.sampleInterval = 50;
    };

    zoom(to, callback = null, time = null) {
        let lerpTime = time ? time : this.lerpTime;
        let initTime = 0;
        let from = this.entity.scale;
        if (this.zoomLerp) {
            clearInterval(this.zoomLerp);
            this.zoomLerp = null;
        }
        this.zoomLerp = setInterval(() => {
            initTime += this.sampleInterval;
            if (initTime <= lerpTime) {
                let t = initTime / lerpTime;
                this.entity.scale = Maf.lerp(from, to, t);
            } else {
                clearInterval(this.zoomLerp);
                this.zoomLerp = null;
                this.entity.scale = to;
                if (callback) callback();
            }
        }, this.sampleInterval)
    };

    fade(to, callback = null, time = null) {
        // console.log("FADE: " + this.entity.category + " - to:" + to)
        let lerpTime = time ? time : this.lerpTime;
        let initTime = 0;
        let from = this.entity.opacity;
        if (this.fadeLerp) {
            clearInterval(this.fadeLerp);
            this.fadeLerp = null;
        }
        this.fadeLerp = setInterval(() => {
            initTime += this.sampleInterval;
            if (initTime <= lerpTime) {
                let t = initTime / lerpTime;
                this.entity.opacity = Maf.lerp(from, to, t);
                // console.log(this.entity.category + " - " + this.entity.opacity)
            } else {
                clearInterval(this.fadeLerp);
                this.fadeLerp = null;
                this.entity.opacity = to;
                if (callback) callback();
            }
        }, this.sampleInterval)
    };

    setScale(value) {
        this.entity.scale = value;
    };

    setOpacity(value) {
        this.entity.opacity = value;
    };
}



