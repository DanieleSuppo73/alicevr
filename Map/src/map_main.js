import {
    dispatcher
} from "../../lib/dispatcher.js"

import * as cities from "../lib/cities.js";





////////////////////////
/// INIT
////////////////////////
function init() {
    console.log("START")

  
    dispatcher.sendMessage("mapReady", 100);




    // cities.loadAuto();
};




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