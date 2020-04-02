import Map from "../../Map.js";
import Point from "../../entities/Point.js";
import * as entityUtils from "../../utils/entity_utils.js";

export default class StartPoint {
    constructor(position, timecode) {
        this.timecode = timecode;
        this.position = position;
        this.entity = null;
        this.fader = null;
        this.setup();
    }
    setup() {
        this.entity = Point.draw(this.position, "STARTING-POINT");
        this.entity.timecode = this.timecode;
        this.fader = new entityUtils.Fader(this.entity);
    }
};


Map.onOverEntity.push((entity) => {
    console.log(entity.id.category);

    if (entity.id.category = "STARTING-POINT") {
        console.log("CI SEI SOPRA!")
    }
});


// function onThisHover(entity) {
//     if (entity.id.name !== "videoStartingPoint") return;
//     entity.id.billboard.width = videoStartingPointsOnMap.maxSize;
//     entity.id.billboard.height = videoStartingPointsOnMap.maxSize;
//     entity.id.billboard.image = videoStartingPointsOnMap.imageOver;
// }

// function onThisExit(entity) {
//     if (entity.id.name !== "videoStartingPoint") return;
//     entity.id.billboard.width = new Cesium.CallbackProperty(setSizeOnCameraHeight, false),
//         entity.id.billboard.height = new Cesium.CallbackProperty(setSizeOnCameraHeight, false),
//         entity.id.billboard.image = imgFolder + videoStartingPointsOnMap.image;
// }

// function onThisPicked(entity) {
//     if (entity.id.name !== "videoStartingPoint") return;


//     dispatcher.sendMessage({
//         command: "videoPlayerSeek",
//         time: entity.id.time
//     });

//     dispatcher.sendMessage({
//         command: "videoPlayerPlay",
//     })
// }





// /// subscribe to the handlers
// onPicketAssetHandler.push(videoStartingPointsOnMap.load);
// map.onOverEntityHandlers.push(onThisHover);
// map.onExitEntityHandlers.push(onThisExit);
// map.onLeftClickEntityHandlers.push(onThisPicked);