import * as cities from "../lib/cities.js";

import {
    coveredArea
} from "../lib/utils/isCoveredArea.js"



////////////////////////
/// INIT
////////////////////////
function init() {
    console.log("START")
    
    cities.loadAuto();




    // let bigCoveredArea = new coveredArea();

    // viewer.camera.changed.addEventListener(() => {
    //     console.log(bigCoveredArea.isCovered())
    // });
};




////////////////////////
/// wait for map ready
////////////////////////
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


