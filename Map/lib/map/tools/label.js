import {
    stringDivider
} from "../../../../lib/stringDivider.js"
import map from "../map.js";



// /// set the range
// let minRange = 0;
// let maxRange = 0;


// function updateRange() {
//     minRange = map.range;
//     maxRange = minRange * 4;
// }


// map.onReady.push(function(){
//     updateRange();

//     map.camera.changed.addEventListener(() => {
//         updateRange();
//     });
// });



function updateOpacity(entity){
    let minRange = map.range;
    let maxRange = minRange * 4;
    let pos = entity.position._value;
    let dist = Cesium.Cartesian3.distance(map.viewer.camera.positionWC,
        pos);

    /// get multiplier by min-max range
    let rangeMult = 1 - Math.inverseLerp(minRange, maxRange,
        Cesium.Math.clamp(dist, minRange, maxRange));

    /// get multiplier by min-max distance
    let distMult = 1 - Math.inverseLerp(entity.minDistance, entity
        .maxDistance,
        Cesium.Math.clamp(dist, entity.minDistance, entity.maxDistance));

    entity.opacity = rangeMult * distMult;
}




function getPropertiesFromCategory(category) {
    let properties = {
        font: "300 15px Roboto",
        outlineWidth: 2,
        fillColor: new Cesium.Cartesian3(1, 1, 1),
        outlineColor: new Cesium.Cartesian3(0, 0, 0),
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        heightReference: Cesium.HeightReference.NONE,
        pixelOffset: new Cesium.Cartesian2(0, -5),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        minDistance: 50000,
        maxDistance: 800000,
    };

    switch (category) {
        case "A1":
            properties.font = "700 20px Roboto";
            properties.outlineWidth = 2;
            properties.minDistance = 800000;
            properties.maxDistance = 2000000;
            break;
        case "A2":
            properties.font = "700 18px Roboto";
            properties.outlineWidth = 2;
            // properties.fillColor = new Cesium.Cartesian3(.2, .5, .9);
            properties.minDistance = 170000;
            properties.maxDistance = 800000;
            break;
        case "A3":
            properties.font = "500 16px Roboto";
            properties.outlineWidth = 2;
            properties.fillColor = new Cesium.Cartesian3(.9, .5, .2);
            properties.minDistance = 130000;
            properties.maxDistance = 500000;
            break;
        case "A4":
            properties.font = "500 14px Roboto";
            properties.outlineWidth = 2;
            properties.fillColor = new Cesium.Cartesian3(0, 1, 1);
            properties.minDistance = 60000;
            properties.maxDistance = 100000;
            break;
        case "A5":
            properties.font = "500 14px Roboto";
            properties.outlineWidth = 2;
            // properties.fillColor = new Cesium.Cartesian3(1, 1, 1);
            properties.minDistance = 35000;
            properties.maxDistance = 75000;
            break;
        case "BIG_PARK":
            properties.font = "500 15px Roboto";
            properties.outlineWidth = 2;
            properties.fillColor = new Cesium.Cartesian3(0.5, 1, 0.5);
            properties.minDistance = 170000;
            properties.maxDistance = 800000;
            break;
    }

    return properties;
};







export function drawLabel(position, text, category, collection = null) {

    let properties = getPropertiesFromCategory(category)

    if (text.length > 15) text = stringDivider(text, 15);

    var entity = map.viewer.entities.add({
        opacity: 0, /// default value at start
        minDistance: properties.minDistance,
        maxDistance: properties.maxDistance,
        fillColor: properties.fillColor,
        outlineColor: properties.outlineColor,
        position: position,
        category: category,
        label: {
            text: text,
            font: properties.font,
            fillColor: new Cesium.CallbackProperty(function () {
                return new Cesium.Color(entity.fillColor.x, entity.fillColor.y, entity.fillColor.z, entity.opacity)
            }, false),
            outlineColor: new Cesium.CallbackProperty(function () {
                return new Cesium.Color(entity.outlineColor.x, entity.outlineColor.y, entity.outlineColor.z, entity.opacity)
            }, false),
            outlineWidth: properties.outlineWidth,
            style: properties.style,
            verticalOrigin: properties.verticalOrigin,
            heightReference: properties.heightReference,
            pixelOffset: properties.pixelOffset,
            disableDepthTestDistance: properties.disableDepthTestDistance,
        }
    });
    if (collection) collection.push(entity);


    /// register the listener to camerachanged, 
    /// to update this label opacity
    map.camera.changed.addEventListener(() => {
        updateOpacity(entity);
    });

    /// update opacity immediately
    updateOpacity(entity);
};



export function removeLabel (entity){
    map.viewer.entities.remove(entity);
}





