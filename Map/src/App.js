import {
    dispatcher
} from "../../lib/dispatcher.js";

import map from "../lib/map/map.js";

import * as cities from "../lib/map/add-on/cities.js";
// import * as pointsOfInterest from "../lib/map/add-on/pointsOfInterest.js";

import Track from "../lib/map/managers/constructors/Track.js"

import Loader from "../lib/map/managers/Loader.js"





import * as entityTools from "../lib/map/utils/entity_utils.js";




import Ellipse from '../lib/map/entity/Ellipse.js';







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
//////////////////////////////////////////////
/// ON MAP STARTED
//////////////////////////////////////////////
map.onStarted.push(function () {

    // var TR1 = new Track(asset1.gpx);
    // TR1.load((boundingSphere) => {
    //     placeholder = drawEllipse(boundingSphere.center, "PLACEHOLDER");
    // });
    // var TR2 = new Track(asset2.gpx);
    // TR2.load();
    // var TR3 = new Track(asset3.gpx);
    // TR3.load();


    Loader.init(() => {

        /// DEBUG : show circle
        Ellipse.draw(Loader.root.boundingSphere.center, "GREEN_TRANSPARENT", Loader.root.boundingSphere.radius);

        map.camera.flyToBoundingSphere(Loader.root.boundingSphere, {
            offset: new Cesium.HeadingPitchRange(0, -1.47, 140000),
            duration: 0,
        });
    });

})



//////////////////////////////////////////////
/// ON MAP READY
//////////////////////////////////////////////
map.onReady.push(function () {

    /// SEND MAP READY MESSAGE
    // dispatcher.sendMessage("mapReady");

    /// LOAD CITIES
    cities.loadAuto();

    /// LOAD POINTS OF INTEREST
    // pointsOfInterest.loadFromFile(asset);

    const mapChangeSensitivity = 0.3; /// default 0.5
    map.camera.percentageChanged = mapChangeSensitivity;
})






//////////////////////////////////////////////
/// receive messages
//////////////////////////////////////////////
dispatcher.receiveMessage("playerPlaying", (data) => {

    /// rotate placeholder texture with player angle
    placeholder.ellipse.stRotation = Cesium.Math.toRadians(data.angle);
});





//////////////////////////////////////////////
/// INIT
//////////////////////////////////////////////
map.init();







////////////////////////////////////////// DEBUG



// var center = new Cesium.Cartesian3(4410146, 966816, 4490121);
// // var radius = 6885;
// var radius = 50000;
// var boundingSphere = new Cesium.BoundingSphere(center, radius);
// map.camera.flyToBoundingSphere(boundingSphere, {
//     offset: new Cesium.HeadingPitchRange(0, -1.47, 140000),
//     duration: 0,
//     complete: function () {
//         console.log("DONE")
//     }
// });



// function zoomIn() {
//     boundingSphere.radius = 7000;
//     map.camera.flyToBoundingSphere(boundingSphere, {
//         // offset: offset,
//         complete: function () {
//             console.log("FLYING COMPLETE")
//         },
//         duration: 8,
//         easingFunction: Cesium.EasingFunction.QUADRACTIC_IN_OUT,
//     });
// }

// window.zoomIn = zoomIn;

// window.removePlaceholder = function () {
//     removeEllipse(placeholder);
// }

// window.fadeIn = function () {
//     entityTools.fadeIn(placeholder)
// }

// window.fadeOut = function () {
//     entityTools.fadeOut(placeholder)
// }