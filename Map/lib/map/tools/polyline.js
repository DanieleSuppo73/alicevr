// import {
//     dispatcher
// } from "../../../../lib/dispatcher.js"
import map from "../map.js";



/// set the range
var minRange = 0;
var maxRange = 0;


function updateRange() {
    minRange = map.range;
    maxRange = minRange * 4;
    console.log(map.range)
}



map.onReady.push(function(){
    updateRange();

    map.camera.changed.addEventListener(() => {
        updateRange();
    });
});



function updateOpacity(){
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
};



function updateWidth(){
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
};




export function drawPolyline(positions, category, collection = null) {

    let properties = getPropertiesFromCategory(category)

    let entity = map.viewer.entities.add({
        category: category,
        polyline: {
            positions: positions,
            clampToGround: properties.clampToGround,

            width: properties.width,


            material: new Cesium.PolylineOutlineMaterialProperty({
                color: Cesium.Color.ORANGE,
                outlineWidth: 2,
                outlineColor: Cesium.Color.BLACK
            }),

            show: properties.show,


        }
    });


    if (collection) collection.push(entity);

    // /// register the listener to camerachanged, 
    // /// to update this label opacity
    // map.camera.changed.addEventListener(() => {
    //     updateOpacity(entity);
    // });

    // /// update opacity immediately
    // updateOpacity(entity);

    


    
};




function getPropertiesFromCategory(category) {
    let properties = {
        clampToGround: true,
        width: 5,
        outlineWidth: 2,
        fillColor: new Cesium.Cartesian3(1, 1, 1),
        outlineColor: new Cesium.Cartesian3(0, 0, 0),
        minDistance: 50000,
        maxDistance: 800000,
        show: true,
    };

    switch (category) {
        case "TRACK":
            properties.width = 5;
            properties.outlineWidth = 2;
            properties.minDistance = 800000;
            properties.maxDistance = 2000000;
            break;

    }

    return properties;
}