import {
    dispatcher
} from "../../lib/dispatcher.js";
import Map from "../lib/Map.js";
import * as cities from "../lib/add-on/cities.js";
import Loader from "../lib/managers/Loader.js"
import Player from "../lib/managers/Player.js"
import Ellipse from '../lib/entities/Ellipse.js';
import Preloader from "../lib/UI/Preloader.js";


let selectedAsset = null;




/*******************************************
*********** ON MAP STARTED
*******************************************/
Map.onStarted.push(() => {

    /* init preloader DIV */
    Preloader.init();

    /* load main asset */
    // const idToLoad = "1573827877573";
    // const idToLoad = "1579530506349";
    // const idToLoad = "1573827851085";
    const idToLoad = "1570451964288";
    Loader.load(idToLoad, () => {
        console.log(Loader.root.asset)



        // /// DEBUG : show circle
        // Ellipse.draw(Loader.root.asset.boundingSphere.center, "ORANGE", Loader.root.asset.boundingSphere.radius);
        // Ellipse.draw(Loader.root.asset.boundingSphere.center, "BLUE", 100);


        /* go there */
        let range = 140000;
        Map.camera.flyToBoundingSphere(Loader.root.asset.boundingSphere, {
            offset: new Cesium.HeadingPitchRange(0, -1.47, range),
            duration: 0,
        });


        /* load cities from boundingsphere position - radius */
        // cities.init(Loader.root.asset.boundingSphere.center, range);
    });
})






/*******************************************
*********** ON MAP READY
*******************************************/
Map.onReady.push(function () {

    dispatcher.sendMessage("mapReady");

    /* change Map changed sensitivity */
    Map.camera.percentageChanged = 0.3; /// default 0.5



    if (Loader.root.asset.constructor.name === "Video") {
        Player.init(Loader.root.asset);

       
        
        
        
        
        
        
        
        
        
        
        
        
        const timeBeforeFly = 2000;
        setTimeout(() => {
            Map.camera.flyToBoundingSphere(Loader.root.asset.boundingSphere, {
                offset: new Cesium.HeadingPitchRange(0, -0.5, Loader.root.asset.boundingSphere.radius * 2),
                complete: function () {
                    console.log("FLYING COMPLETE");

                    Player.showStartPoints();

                    Map.fixCamera(Loader.root.asset.boundingSphere.center);
                    rotateCamera();
                },
                duration: 8,
                easingFunction: Cesium.EasingFunction.QUADRACTIC_IN_OUT,
            });

        }, timeBeforeFly)

    }









})


// function onSelectedAsset() {
//     Player.init();
// }



const onPlay = () => {

    console.log("PLAY")
    Map.unfixCamera();
    clearInterval(rotate);

    /// fake player
    var time = 0;
    var samplerate = 250;
    setInterval(() => {
        time += samplerate / 1000;
        dispatcher.sendMessage("playerPlaying", {
            time: time,
            angle: 0,
        });
    }, samplerate);
}





window.play = onPlay;

window.hide = Player.hideStartPoints;
window.show = Player.showStartPoints;




//////////////////////////////////////////////
/// receive messages
//////////////////////////////////////////////
dispatcher.receiveMessage("playerPlaying", (data) => {

    /// rotate placeholder texture with player angle
    // placeholder.ellipse.stRotation = Cesium.Math.toRadians(data.angle);
});





//////////////////////////////////////////////
/// INIT
//////////////////////////////////////////////
Map.init();











////////////////////////////////////////// DEBUG


let rotate = null;


// Map.onDown.push(function () {
//     if (rotate) {
//         Map.unlinkCamera();
//         clearInterval(rotate);
//         rotate = null;
//     }

// })




function rotateCamera() {
    // Map.fixCamera(Loader.root.boundingSphere.center);
    rotate = setInterval(function () {
        Map.camera.rotateLeft(0.0015);
    }, 50);
};

window.rotateCamera = function () {
    rotateCamera();
}

window.unlink = function () {
    Map.unlinkCamera();
}