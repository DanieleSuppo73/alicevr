import Map from "../../Map.js";
// import Point from "../../entities/Point.js";
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
        this.entity = Map.viewer.entities.add({
            category: "STARTING-POINT",
            position: this.position,
            color: StartPoint.color,
            outlineColor: StartPoint.outlineColor,
            opacity: 0,
            selectable: false,
            point: {
                pixelSize: 9,
                color: new Cesium.CallbackProperty(() => {
                    return new Cesium.Color(this.entity.color.x, this.entity.color.y, this.entity.color.z, this.entity.opacity)
                }, false),
                outlineColor: new Cesium.CallbackProperty(() => {
                    return new Cesium.Color(this.entity.outlineColor.x, this.entity.outlineColor.y, this.entity.outlineColor.z, this.entity.opacity)
                }, false),
                outlineWidth: 1,
                translucencyByDistance : new Cesium.NearFarScalar(75000, 0, 25000, 1),
            }
        });

        this.entity.timecode = this.timecode;
        this.entity.utils = new entityUtils.Utils(this.entity);
    }
};

StartPoint.color = new Cesium.Cartesian3(0.26, 0.52, 0.96);
StartPoint.overColor = new Cesium.Cartesian3(1, 0.85, 0);
StartPoint.outlineColor = new Cesium.Cartesian3(1, 1, 1);
StartPoint.clicked = null;


// Map.onOverEntity.push((entity) => {
//     if (entity.id.category === "STARTING-POINT") {
//         console.log("CI SEI SOPRA!")
//         entity.id.color = StartPoint.overColor;
//     }
// });


// Map.onExitEntity.push((entity) => {
//     if (entity.id.category === "STARTING-POINT") {
//         if (entity !== StartPoint.clicked){
//             entity.id.color = StartPoint.color;
//         }
//     }
// });


// Map.onClickEntity.push((entity) => {
//     if (entity.id.category === "STARTING-POINT") {
//         console.log(entity.id.timecode)
//         StartPoint.clicked = entity;
//     }
// });




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