import {
    dispatcher
} from "../../../lib/dispatcher.js";
import Loader from "./Loader.js";
import Map from "../Map.js";
import StartPoint from "./extensions/StartPoint.js";
import Ellipse from "../entities/Ellipse.js";
import Point from "../entities/Point.js";
import * as jsUtils from "../../../lib/jsUtils.js";
import * as entityUtils from "../utils/entity_utils.js";




export default class Player {

    static init(video) {

        /* create markers */
        markers = jsUtils.arrayOfObjectsCloneAndIncrease(video.markers);
        markers[markers.length - 1].timecode += 1000; /// add 100 sec to last marker
        
        /* create the proxy 
        for the 1st time!*/
        if (!Player.radarProxy) Player.radarProxy = Point.draw(video.boundingSphere.center, "PROXY");

        /* remove start points */
        for (let i = 0; i < Player.startPoints.length; i++) {
            Map.viewer.entities.remove(Player.startPoints[i].entity);
        }
        
        Player.radar = null;
        Player.startPoints = [];
        spIndex = 0;
        
        let track = Loader.root.getAssetByClass("Track", video);

        if (typeof track !== "undefined") {
            gpx = track.tracks;

            /* create radar */
            Player.radar = Ellipse.draw(video.boundingSphere.center, "RADAR");
        } else {
            /* create radar */
            Player.radar = Ellipse.draw(video.boundingSphere.center, "POSITION");
            createStartPoints();
        }

        

        /* create start points */
        // for (let i = 0; i < Player.startPoints.length; i++) {
        //     Map.viewer.entities.remove(Player.startPoints[i].entity);
        // }
        // Player.startPoints = [];
        // spIndex = 0;
        // createStartPoints();
    };


    static reset(callback = null) {
        console.log("PLAYER RESET")
        Player.playing = false;
        markerIndex = null;
        idle = true;

        if (Player.radar.opacity > 0){
            entityUtils.fadeOut(Player.radar);
        }
        if (moveRadarLerp) {
            clearInterval(moveRadarLerp);
            moveRadarLerp = null;
        }
        if (Map.viewer.trackedEntity){
            Map.viewer.trackedEntity = null;
        }
        if (callback) callback();
    };


    static showStartPoints() {
        let interval = 0;
        for (let i = 0; i < Player.startPoints.length; i++) {
            interval += 250;
            setTimeout(function () {
                Player.startPoints[i].entity.utils.fade(1);
            }, interval);
        }
    };

    static hideStartPoints() {
        for (let i = 0; i < Player.startPoints.length; i++) {
            Player.startPoints[i].entity.utils.fade(0);
        }
    };
};

Player.radarProxy = null;
Player.radar = null;
Player.startPoints = [];
Player.playing = false;






/*****************
messages receivers
******************/
dispatcher.receiveMessage("playerStarted", () => {
    Player.hideStartPoints();
});
dispatcher.receiveMessage("playerPlaying", (data) => {
    check(data.time);
    Player.playing = true;
    Player.radar.ellipse.stRotation = Cesium.Math.toRadians(data.angle) + radarHeading;
});
dispatcher.receiveMessage("playerPaused", (data) => {
    Player.playing = false;
    Player.radar.ellipse.stRotation = Cesium.Math.toRadians(data.angle) + radarHeading;
});
dispatcher.receiveMessage("playerSeeking", () => {
    markerIndex = null;
    Player.playing = false;
});
dispatcher.receiveMessage("playerEnded", () => {
    Player.reset();
});




/********
variables
*********/
var markers = null;
var markerIndex = null;
var gpx = [];
var moveRadarLerp = null;
var radarLinked = true;
var idle = true;
var radarHeading = 0;


/*******************
check for new marker
********************/
const check = time => {
    if (markers && Player.playing) {
        const y = markerIndex ? markerIndex : 0;
        for (let i = y; i < markers.length; i++) {
            if (time >= markers[i].timecode && time < markers[i + 1].timecode &&
                markerIndex !== i) {

                /* when a marker is reached */
                markerIndex = i;
                // onFoundMarkerIndex(i);
                getMarkerPosition(markerIndex, time)
                    .then((values) => {

                        const gpxFound = values[0];
                        const wpIndex = values[1];
                        const position = values[2];
                        console.log(gpxFound + " - " + wpIndex + " - " + position)

                        /* lerp position */
                        if (gpxFound && wpIndex) {
                            Map.viewer.trackedEntity = null;
                            lerp(gpxFound, wpIndex);
                        }

                        /* or simply jump the radar
                        without lerp */
                        else {
                            Player.radarProxy.position = position;
                            entityUtils.fadeOut(Player.radar, () => {
                                Player.radar.position = Player.radarProxy.position._value;
                                entityUtils.fadeIn(Player.radar);
                            });
                            jump();
                        }
                    })
                break;
            };
        };
    };
};




/*******************
create start points on map
********************/
var spIndex = 0;
const spMinDist = 500; /// meters
const createStartPoints = () => {
    getMarkerPosition(spIndex, null)
        .then((values) => {
            const gpxFound = values[0];
            const wpIndex = values[1];
            const position = values[2];

            const pos = position ? position : gpxFound.positions[wpIndex];
            const timecode = markers[spIndex].timecode;

            let minDist = 99999;
            if (spIndex > 0) {
                /// check for nearby points to avoid overlapping
                for (let i = 0; i < Player.startPoints.length; i++) {
                    const dist = Cesium.Cartesian3.distance(pos, Player.startPoints[i].position);
                    if (dist < minDist) {
                        minDist = dist;
                    }
                }
            }
            if (minDist >= spMinDist) {
                Player.startPoints.push(new StartPoint(pos, timecode));
            }
            if (spIndex < markers.length - 1) {
                spIndex++;
                createStartPoints();
            }
        })
};




/*******************

********************/
const getMarkerPosition = (index, time) => {
    return new Promise((resolve) => {

        var gpxFound = null;
        var wpIndex = null;
        var position = null;

        /* get the Cartesian position from
        the gpx time, if provided */
        if (markers[index].gpxTime) {
            const gpxTime = markers[index].gpxTime;

            for (let i = 0; i < gpx.length; i++) {
                for (let ii = 0; ii < gpx[i].times.length - 1; ii++) {
                    if (gpxTime >= gpx[i].times[ii] && gpxTime < gpx[i].times[ii + 1]) {

                        gpxFound = gpx[i];
                        wpIndex = gpxTime - gpxFound.times[ii] <
                            gpxFound.times[ii + 1] - gpxTime ?
                            ii : ii + 1;

                        resolve([gpxFound, wpIndex, position]);
                    };
                };
            };
        }



        /* or get the Cartesian position from
        the gpx longitude and latitude */
        else {

            /* create position */
            const lonLatArray = [markers[index].longitude, markers[index].latitude];
            Map.addHeightToCoordinatesAndReturnCartesians(lonLatArray, 5, (cartesians) => {
                position = cartesians[0];

                /* if in markers has been
                specified a track to follow */
                if (markers[index].trackToFollow) {

                    gpxFound = gpx[markers[index].trackToFollow];
                    /// find the nearest waypoint
                    let minDist = 9999999;
                    wpIndex = 0;
                    for (let i = 0; i < gpxFound.positions.length; i++) {
                        const dist = Cesium.Cartesian3.distance(position, gpxFound.positions[i]);
                        if (dist < minDist) {
                            minDist = dist;
                            wpIndex = i;
                        }
                    }
                }
                resolve([gpxFound, wpIndex, position]);
            });
        };

    });
};





/*****************
jump to new marker position
******************/
const jump = (heading = null) => {

    /* create boundingsphere around new position */
    const pos = Player.radarProxy.position._value;
    const boundingSphere = new Cesium.BoundingSphere(pos, 1000);

    let h = heading ? heading : Map.viewer.scene.camera.heading;
    let p = idle ? -0.52 : Map.viewer.scene.camera.pitch;
    let r = idle ? 500 : Map.range;
    let easingFunction = idle ? Cesium.EasingFunction.QUADRACTIC_IN_OUT : null;

    if (heading) Map.viewer.trackedEntity = Player.radarProxy;
    Map.viewer.camera.flyToBoundingSphere(boundingSphere, {
        offset: new Cesium.HeadingPitchRange(h, p, r),
        easingFunction: easingFunction,
    });

    if (idle) idle = false;
}




/*****************
lerp the radar position
******************/
const lerp = (gpxFound, wpIndex) => {
    if (moveRadarLerp) {
        clearInterval(moveRadarLerp);
        moveRadarLerp = null;
    };
    const initPos = gpxFound.positions[wpIndex];
    const endPos = gpxFound.positions[wpIndex + 1];



    const travelHeading = Map.getHeadingPitchFromPoints(initPos, endPos);

    let position = new Cesium.Cartesian3();

    // /* rotate the texture of the RADAR */
    if (Map.viewer.trackedEntity || idle) radarHeading = travelHeading;




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
        if (Player.playing) {
            t += sampleInterval;
            if (t < lerpTime) {
                let lerpValue = t / lerpTime;
                Cesium.Cartesian3.lerp(initPos, endPos, lerpValue, position);
                Player.radarProxy.position = position;

                /* when a new marker is reached */
                if (!Map.viewer.trackedEntity) {

                    // if (cameraLinkButton.isLinked) {
                    // jump(heading);
                    // }
                    radarLinked = false;
                    entityUtils.fadeOut(Player.radar, () => {
                        Player.radar.center = Player.radarProxy.position._value;
                        radarHeading = travelHeading;
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