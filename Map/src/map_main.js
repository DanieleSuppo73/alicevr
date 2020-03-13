import {
    dispatcher
} from "../../lib/dispatcher.js"

import * as cities from "../lib/cities.js";





////////////////////////
/// INIT
////////////////////////
function init() {
    dispatcher.sendMessage("mapReady");
    cities.loadAuto();
};





// //////////////////////////////
// /// startup the map
// //////////////////////////////
// Cesium.Ion.defaultAccessToken =
//     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZDU1NWMyOC00YjFkLTQ5OTUtODg5Yy0zZDRlNGI1NTg3ZjciLCJpZCI6MTUxNTgsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjcyNDQ4NjR9.WDQmliwvLOArHiI9n4ET2TBELHRsGofW1unvSsbuyR8';
// var viewer = new Cesium.Viewer('cesiumContainer', {
//     imageryProvider: new Cesium.MapboxImageryProvider({
//         mapId: 'mapbox.satellite',
//         accessToken: 'pk.eyJ1IjoiZGFuaWVsZXN1cHBvIiwiYSI6ImNqb2owbHp2YjAwODYzcW8xaWdhcGp1ancifQ.JvNWYw_cL6rV7ymuEbeTCw'
//     }),
//     terrainProvider: Cesium.createWorldTerrain(),
//     animation: false,
//     baseLayerPicker: false,
//     fullscreenButton: false,
//     geocoder: false,
//     homeButton: false,
//     infoBox: false,
//     sceneModePicker: false,
//     timeline: false,
//     navigationHelpButton: false,
//     useBrowserRecommendedResolution: false, /// change this to improve rendering speed on mobile
// });

// viewer.scene.globe.maximumScreenSpaceError = 4;






//////////////////////////////
/// wait for the map loaded
//////////////////////////////
let ready = false;
(function () {
    function t() {
        if (typeof viewer === "undefined") {
            setTimeout(t, 250);
        } else {
            viewer.scene.globe.tileLoadProgressEvent.addEventListener((value) => {
                if (!ready && value === 0) {
                    ready = true;
                    init();
                }
            });
        }
    };
    t();
})();