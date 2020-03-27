import {
    dispatcher
} from "../../../../lib/dispatcher.js";
import Loader from "../managers/Loader.js";
import Ellipse from "../entity/Ellipse.js";
import Billboard from "../entity/Billboard.js";
import * as jsUtils from "../../../../lib/jsUtils.js";
import map from "../map.js";


export default class Player {
    static init() {
        let video = Loader.root.asset;
        let t = Loader.root.getAssetByClass("Track", video);
        markers = jsUtils.arrayOfObjectsCloneAndIncrease(video.markers);
        markers[markers.length - 1].timecode += 1000; /// add 100 sec to last marker
        gpx = t.tracks;
    };
};
Player.radar = null;




/*****************
messages receivers
******************/
dispatcher.receiveMessage("playerPlaying", (data) => {
    check(data.time);
    playerPlaying = true;
});
dispatcher.receiveMessage("playerPaused", () => {
    playerPlaying = false;
});
dispatcher.receiveMessage("playerSeeking", () => {
    foundIndex = null;
});




/********
variables
*********/
var markers = null;
var foundIndex = null;
var gpx = [];
var moveRadarLerp = null;
var playerPlaying = false;
var radarAngle = 0;




/*******************
check for new marker
********************/
const check = time => {
    if (markers && playerPlaying) {
        const y = foundIndex ? foundIndex : 0;
        for (let i = y; i < markers.length; i++) {
            if (time >= markers[i].timecode && time < markers[i + 1].timecode &&
                foundIndex !== i)
            {
                /* when a marker is reached */
                foundIndex = i;
                onFoundMarkerIndex(i);
                break;
            };
        };
    };
};





/*********************
on new marker detected
**********************/
const onFoundMarkerIndex = i => {

    /* get the position from
    the gpx array of the video */
    if (markers[i].gpxTime) {
        const gpxTime = markers[i].gpxTime;

        for (let i = 0; i < gpx.length; i++) {
            for (let ii = 0; ii < gpx[i].times.length - 1; ii++) {
                if (gpxTime >= gpx[i].times[ii] && gpxTime < gpx[i].times[ii + 1]) {

                    let gpxFound = gpx[i];
                    let wpIndex = gpxTime - gpxFound.times[ii] <
                        gpxFound.times[ii + 1] - gpxTime ?
                        ii : ii + 1;
                   
                    /* draw RADAR if not exist */
                    if (!Player.radar) {
                        const position = gpxFound.positions[wpIndex];
                        // Player.radar = Ellipse.draw(position, "RADAR");
                        Player.radar = Billboard.draw(position, "TEST");
                        flyAndLinkCameraToEntity();
                    } 

                    moveRadar(gpxFound, wpIndex);
                    break;
                };
            };
        };


    /* use "longitude" and "latitude" 
    properties of the marker */
    } else {

    }


}





function flyAndLinkCameraToEntity(heading, pitch, range) {

    console.log("flyAndLinkCameraToEntity")

    /// create boundingsphere around billboard
    // var billboardPos = mapPlaceholder.entity.position._value;
    var billboardPos = Player.radar.position._value;


    var boundingSphere = new Cesium.BoundingSphere(billboardPos, 1000);

    let h = typeof heading === "undefined" ? map.viewer.scene.camera.heading : heading;

    let p;
    if (typeof pitch === "undefined") {
        p =  -0.52;
    } else p = pitch;

    let r;
    if (typeof range === "undefined") {
        r = 500;
    } else r = range;

    // if (!videoMarkers.firstReached) videoMarkers.firstReached = true;

    // viewer.trackedEntity = mapPlaceholder.entity;
    map.viewer.trackedEntity = Player.radar;
    map.viewer.camera.flyToBoundingSphere(boundingSphere, {
        offset: new Cesium.HeadingPitchRange(h, p, r),

    });
}



















const moveRadar = (gpxFound, wpIndex) => {
    if (moveRadarLerp) {
        clearInterval(moveRadarLerp);
        moveRadarLerp = null;
    };
    const initPos = gpxFound.positions[wpIndex];
    const endPos = gpxFound.positions[wpIndex + 1];
    let radarPos = new Cesium.Cartesian3();

    // /// we want to update the placeholder rotation
    // /// at least every time the lerp is started
    // if (!newMarkerReached)
    //     mapPlaceholder.heading = getHeadingPitchFromPoints(initPos, endPos);
    // else newMarkerReached = false;


    const getLerpTime = () => {
        /* constant velocity if the provided .gpx file
        don't have time data for the waypoints) */
        if (gpxFound.times.length === 0) {
            const dist = Cesium.Cartesian3.distance(initPos, endPos);
            const speed = 240; /// milliseconds for 1 meter @ 15Km/h
            return (speed * dist);
        };
        /* velocity from gpx times */
        return (gpxFound.times[wpIndex + 1] - gpxFound.times[wpIndex]);
    };
    const lerpTime = getLerpTime();
    

    /* the lerp
    interval routine */
    const sampleInterval = 50;
    let t = 0;
    moveRadarLerp = setInterval(() => {
        if (playerPlaying) {
            t += sampleInterval;
            if (t < lerpTime) {
                let lerpValue = t / lerpTime;
                Cesium.Cartesian3.lerp(initPos, endPos, lerpValue, radarPos)
                Player.radar.position = radarPos;
            } else {
                moveRadar(gpxFound, wpIndex + 1);
            }
        };
    }, sampleInterval);
};


















///////////////////////////////////////////////////////////////////////////////////////////////////////
var play = true
var time = 0;
var samplerate = 1000;
var fakePlayer = () => {
    setInterval(() => {
        if (play) {
            time += 1000 / samplerate;
            dispatcher.sendMessage("playerPlaying", {
                time: time,
                angle: 0,
            });
        }
    }, samplerate);
};
window.play = fakePlayer;
window.stop = function(){
    play = false;
}



setInterval(function(){
    console.log(map.viewer.trackedEntity)
}, 3000)