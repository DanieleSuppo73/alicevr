import {
    dispatcher
} from "../../lib/dispatcher.js";

import map from "../lib/map/map.js";

import * as cities from "../lib/map/add-on/cities.js";


import Track from "../lib/map/managers/constructors/Track.js"

import Loader from "../lib/map/managers/Loader.js"





// import * as entityTools from "../lib/map/utils/entity_utils.js";




import Ellipse from '../lib/map/entity/Ellipse.js';







// let asset1 = {
//     POI: "delta_POI.xml",
//     gpx: "activity_4446943983.gpx",
// }

// let asset2 = {
//     // POI: "delta_POI.xml",
//     gpx: "activity_4446944479.gpx",
// }

// let asset3 = {
//     // POI: "delta_POI.xml",
//     gpx: "activity_4447053939.gpx",
// }




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


    Loader.load("1570451964288", () => {

        console.log(Loader.root.asset)

        // // /// DEBUG : show circle
        // map.disableCulling();
        // Ellipse.draw(Loader.root.boundingSphere.center, "GREEN_TRANSPARENT", Loader.root.boundingSphere.radius);


        /// go there
        let range = 140000;
        map.camera.flyToBoundingSphere(Loader.root.asset.boundingSphere, {
            offset: new Cesium.HeadingPitchRange(0, -1.47, range),
            duration: 0,
        });






        /// load cities from boundingsphere position / radius
        // cities.init(Loader.root.asset.boundingSphere.center, range);


    });

})



//////////////////////////////////////////////
/// ON MAP READY
//////////////////////////////////////////////
map.onReady.push(function () {

    /// SEND MAP READY MESSAGE
    // dispatcher.sendMessage("mapReady");

    const mapChangeSensitivity = 0.3; /// default 0.5
    map.camera.percentageChanged = mapChangeSensitivity;


    // /// fly

    // console.log(Loader.root.boundingSphere)

  

    // map.camera.flyToBoundingSphere(Loader.root.asset.boundingSphere, {
    //     // offset: offset,
    //     complete: function () {
    //         console.log("FLYING COMPLETE");
    //         map.fixCamera(Loader.root.asset.boundingSphere.center);
    //         rotateCamera();

    //     },
    //     duration: 8,
    //     easingFunction: Cesium.EasingFunction.QUADRACTIC_IN_OUT,
    // });



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

// Loader.load("1570451964288");








////////////////////////////////////////// DEBUG


let rotate = null;


map.onDown.push(function () {
    if (rotate) {
        map.unlinkCamera();
        clearInterval(rotate);
        rotate = null;
    }

})




function rotateCamera() {
    // map.fixCamera(Loader.root.boundingSphere.center);
    rotate = setInterval(function () {
        map.camera.rotateLeft(0.0025);
    }, 50);
};

window.rotateCamera = function () {
    rotateCamera();
}

window.unlink = function () {
    map.unlinkCamera();
}