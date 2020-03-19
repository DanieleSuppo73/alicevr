import {
    dispatcher
} from "../../lib/dispatcher.js";

import map from "../lib/map/map.js";

import * as cities from "../lib/cities.js";
import * as pointsOfInterest from "../lib/pointsOfInterest.js";

import Track from "../lib/Track.js"




import {
    drawEllipse, removeEllipse
} from "../lib/map/entity/ellipse.js";




let asset1 = {
    POI: "delta_POI.xml",
    gpx: "activity_4446943983.gpx",
}

let asset2 = {
    // POI: "delta_POI.xml",
    gpx: "activity_4446944479.gpx",
}

let asset3 = {
    // POI: "delta_POI.xml",
    gpx: "activity_4447053939.gpx",
}




var placeholder;
//////////////////////////////////////////
/// ON MAP STARTED
//////////////////////////////////////////
map.onStarted.push(function () {

    var TR1 = new Track(asset1);
    TR1.load(() => {
        placeholder = drawEllipse(TR1.boundingSphere.center)
    });
    var TR2 = new Track(asset2);
    TR2.load();
    var TR3 = new Track(asset3);
    TR3.load();

})



//////////////////////////////////////////
/// ON MAP READY
//////////////////////////////////////////
map.onReady.push(function () {

    /// SEND MAP READY MESSAGE
    dispatcher.sendMessage("mapReady");

    /// LOAD CITIES
    // cities.loadAuto();

    /// LOAD POINTS OF INTEREST
    // pointsOfInterest.loadFromFile(asset);

    const mapChangeSensitivity = 0.3; /// default 0.5
    map.camera.percentageChanged = mapChangeSensitivity;
})







//////////////////////////////////////////
/// INIT
//////////////////////////////////////////
map.init();







////////////////////////////////////////// DEBUG



var center = new Cesium.Cartesian3(4410146, 966816, 4490121);
// var radius = 6885;
var radius = 50000;
var boundingSphere = new Cesium.BoundingSphere(center, radius);
map.camera.flyToBoundingSphere(boundingSphere, {
    offset: new Cesium.HeadingPitchRange(0, -1.47, 140000),
    duration: 0,
    complete: function () {
        console.log("DONE")
        map.isReady = true;
    }
});



function zoomIn() {
    boundingSphere.radius = 7000;
    map.camera.flyToBoundingSphere(boundingSphere, {
        // offset: offset,
        complete: function () {
            console.log("FLYING COMPLETE")
        },
        duration: 8,
        easingFunction: Cesium.EasingFunction.QUADRACTIC_IN_OUT,
    });
}

window.zoomIn = zoomIn;

window.removePlaceholder = function(){
    removeEllipse(placeholder);
}