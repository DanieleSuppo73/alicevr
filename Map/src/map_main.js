import {
    dispatcher
} from "../../lib/dispatcher.js";

import map from "../lib/map/map.js";

import * as cities from "../lib/cities.js";
import * as pointsOfInterest from "../lib/pointsOfInterest.js";

import *
as myTrack
from "../lib/myTrack.js"









let asset = {
    POI: "delta_POI.xml",
    gpx: "activity_4446943983.gpx",
}









//////////////////////////////////////////
/// ON MAP STARTED
//////////////////////////////////////////
map.onStarted.push(function () {

    myTrack.load(asset);
    
})



//////////////////////////////////////////
/// ON MAP READY
//////////////////////////////////////////
map.onReady.push(function () {

    // //// SEND MAP READY MESSAGE
    // dispatcher.sendMessage("mapReady");

    /// LOAD CITIES
    cities.loadAuto();

    // //// LOAD POINTS OF INTEREST
    // pointsOfInterest.loadFromFile(asset);
    
    map.camera.percentageChanged = 0.3;
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





