import {
    dispatcher
} from "../../lib/dispatcher.js";

import map from "../lib/map/map.js";

import * as cities from "../lib/cities.js";
import * as pointsOfInterest from "../lib/pointsOfInterest.js";

// import {
//     gpxParser
// } from "../lib/gpxParser.js"


















//////////////////////////////////////////
/// ON MAP READY
//////////////////////////////////////////
function onMapReady(){
    dispatcher.sendMessage("mapReady");
    cities.loadAuto();
    // pointsOfInterest.loadFromFile(asset);
}





//////////////////////////////////////////
/// INIT
//////////////////////////////////////////
map.onReady.push(function () {
    console.log("YEEEEE")
    onMapReady();
})

function init() {
    map.init();
};




init();




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








let asset = {
    videoUrl: "https://player.vimeo.com/external/347803220.m3u8?s=61a66fd483813c89da138ac578628ca68bb65fe3",
    videoUrl_1: "43236",
    subtitles: "coppi_subtitles.xml",
    title: "Titolo di prova",
    description: "Per debug",
    POI: "delta_POI.xml"
}


