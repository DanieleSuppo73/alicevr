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
        Player.radar = null;
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

                    /* draw RADAR if not exist */
                    if (!Player.radar) {
                        const position = gpxFound.positions[wpIndex];
                        Player.radar = Ellipse.draw(position, "TEST");
                        Player.radar.opacity = 0;
                    }

                    map.viewer.trackedEntity = null;
                    moveMap(gpxFound, wpIndex);
                    break;
                };
            };
        };


        /* use "longitude" and "latitude" 
        properties of the marker */
    } else {

    }


}





const jumpMap = (heading = null, pitch = null, range = null) => {

    /* create boundingsphere around new position */
    const pos = Player.radarProxy.position._value;
    const boundingSphere = new Cesium.BoundingSphere(pos, 1000);

    let h = heading ? heading : map.viewer.scene.camera.heading;
    let p = pitch ? pitch : -0.52;
    let r = range ? range : 500;

    // if (!videoMarkers.firstReached) videoMarkers.firstReached = true;

    map.viewer.trackedEntity = Player.radarProxy;
    map.viewer.camera.flyToBoundingSphere(boundingSphere, {
        offset: new Cesium.HeadingPitchRange(h, p, r),
    });
}




const moveMap = (gpxFound, wpIndex) => {
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
                Player.radarProxy.position = radarPos;

                if (!map.viewer.trackedEntity) {

                    /// this code will be executed every time a new marker is reached,
                    /// or when we seek the video.
                    /// I don't know exactly when it's called but it work...

                    // /// get the heading from initPos - endPos
                    // let heading = getHeadingPitchFromPoints(initPos, endPos);

                    // /// unlink the placeholder, fade out, link again and fade in
                    // mapPlaceholder.linkedEntity = null;
                    // mapPlaceholder.fadeOut(null, function () {
                    //     mapPlaceholder.heading = heading;
                    //     mapPlaceholder.linkedEntity = cameraTarget;
                    //     mapPlaceholder.fadeIn();
                    // })

                    // if (cameraLinkButton.isLinked) {
                    // jumpMap(heading);
                    // }
                    radarLinked = false;
                    entityUtils.fadeOut(Player.radar, () => {
                        Player.radar.center = Player.radarProxy.position._value;
                        entityUtils.fadeIn(Player.radar);
                        radarLinked = true;
                    });
                    jumpMap();

                } else {
                    if (radarLinked)
                        Player.radar.center = Player.radarProxy.position._value;
                }

            } else {
                moveMap(gpxFound, wpIndex + 1);
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