import {
    dispatcher
} from "../../lib/dispatcher.js";
import Map from "../lib/Map.js";
import * as cities from "../lib/add-on/cities.js";
import Loader from "../lib/managers/Loader.js"
import AssetManager from "../lib/managers/AssetManager.js"
import Player from "../lib/managers/Player.js"
import Ellipse from '../lib/entities/Ellipse.js';
import Preloader from "../lib/UI/Preloader.js";









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
    // const idToLoad = "1570451964288";
    const idToLoad = "main";
    Loader.load(idToLoad, () => {
        console.log(Loader.root.asset)


        AssetManager.init();

        // /// DEBUG : show circle
        // Ellipse.draw(Loader.root.asset.boundingSphere.center, "ORANGE", Loader.root.asset.boundingSphere.radius);
        // Ellipse.draw(Loader.root.asset.boundingSphere.center, "BLUE", 100);


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