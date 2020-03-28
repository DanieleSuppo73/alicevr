import {
    dispatcher
} from "../../../../lib/dispatcher.js";
import Loader from "../managers/Loader.js";
import Ellipse from "../entity/Ellipse.js";
import * as jsUtils from "../../../../lib/jsUtils.js";
import map from "../map.js";
import * as entityUtils from "../../../lib/map/utils/entity_utils.js";


export default class Player {
    static init() {
        let video = Loader.root.asset;
        let t = Loader.root.getAssetByClass("Track", video);
        markers = jsUtils.arrayOfObjectsCloneAndIncrease(video.markers);
        markers[markers.length - 1].timecode += 1000; /// add 100 sec to last marker
        gpx = t.tracks;


        Player.radarProxy = map.viewer.entities.add({
            position: new Cesium.Cartesian3(0, 0, 0),
            point: {
                pixelSize: 10,
                color: new Cesium.Color(1, 0.9, 0, 0),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            }
        });


       
        let pos = gpx[0].positions[0];
        Player.radar = Ellipse.draw(pos, "RADAR");
        // Player.radar.show = false;


    };
};
Player.radarProxy = null;
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
dispatcher.receiveMessage("playerEnded", () => {
    foundIndex = null;
    entityUtils.fadeOut(Player.radar, () => {
        Player.radar.show = false;
        idle = true;
    });
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
var radarLinked = true;
var idle = true;



/*******************
check for new marker
********************/
const check = time => {
    if (markers && playerPlaying) {
        const y = foundIndex ? foundIndex : 0;
        for (let i = y; i < markers.length; i++) {
            if (time >= markers[i].timecode && time < markers[i + 1].timecode &&
                foundIndex !== i) {
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

                    map.viewer.trackedEntity = null;
                    lerp(gpxFound, wpIndex);
                    break;
                };
            };
        };
    }

    /* use "longitude" and "latitude" 
    properties of the marker */
    else {

    }


}




/*****************
jump to new marker position
******************/
const jump = (heading) => {

    /* create boundingsphere around new position */
    const pos = Player.radarProxy.position._value;
    const boundingSphere = new Cesium.BoundingSphere(pos, 1000);

    let h = heading ? heading : map.viewer.scene.camera.heading;
    let p = idle ? -0.52 : map.viewer.scene.camera.pitch;
    let r = idle ? 500 : map.range;
    let easingFunction = idle ? Cesium.EasingFunction.QUADRACTIC_IN_OUT : null;

    map.viewer.trackedEntity = Player.radarProxy;
    map.viewer.camera.flyToBoundingSphere(boundingSphere, {
        offset: new Cesium.HeadingPitchRange(h, p, r),
        easingFunction: easingFunction,
    });

    if (idle) idle = false;
}




const lerp = (gpxFound, wpIndex) => {
    if (moveRadarLerp) {
        clearInterval(moveRadarLerp);
        moveRadarLerp = null;
    };
    const initPos = gpxFound.positions[wpIndex];
    const endPos = gpxFound.positions[wpIndex + 1];
    const travelHeading = map.getHeadingPitchFromPoints(initPos, endPos);

    let radarPos = new Cesium.Cartesian3();

    /* rotate the texture of the RADAR */
    if (map.viewer.trackedEntity || idle)
        Player.radar.ellipse.stRotation = travelHeading;


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
                Cesium.Cartesian3.lerp(initPos, endPos, lerpValue, radarPos);
                Player.radarProxy.position = radarPos;

                /* when a new marker is reached */
                if (!map.viewer.trackedEntity) {

                    // if (cameraLinkButton.isLinked) {
                    // jump(heading);
                    // }
                    radarLinked = false;
                    entityUtils.fadeOut(Player.radar, () => {
                        Player.radar.center = Player.radarProxy.position._value;
                        Player.radar.show = true;
                        entityUtils.fadeIn(Player.radar);
                        radarLinked = true;
                    });
                    jump(travelHeading);

                } else {
                    if (radarLinked)
                        Player.radar.center = Player.radarProxy.position._value;
                }

            } else {
                lerp(gpxFound, wpIndex + 1);
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
window.stop = function () {
    console.log("STOP")
    playerPlaying = false;
}