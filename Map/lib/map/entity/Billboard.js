import map from "../map.js";
// import {
//     Maf
// } from "../../../../lib/Maf.js"



// function updateOpacity(entity) {
//     if (map.ready){
//         let minRange = map.range;
//         let maxRange = minRange * 4;
//         let pos = entity.position._value;
//         let dist = Cesium.Cartesian3.distance(map.viewer.camera.positionWC,
//             pos);

//         /// get multiplier by min-max range
//         let rangeMult = 1 - Maf.inverseLerp(minRange, maxRange,
//             Cesium.Math.clamp(dist, minRange, maxRange));

//         /// get multiplier by min-max distance
//         let distMult = 1 - Maf.inverseLerp(entity.minDistance, entity
//             .maxDistance,
//             Cesium.Math.clamp(dist, entity.minDistance, entity.maxDistance));

//         entity.opacity = rangeMult * distMult;
//     }
//     else{
//         entity.opacity = 1;
//     }
// }




function getPropertiesFromCategory(category) {
    let properties = {
        rotation: 0,
        show: true,
        pixelOffset: new Cesium.Cartesian2(0, 0),
        eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 0.0),
        alignedAxis: Cesium.Cartesian3.ZERO,
        horizontalOrigin: Cesium.VerticalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        heightReference: Cesium.HeightReference.NONE,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scale: 1,
        color: Cesium.Color.WHITE,
        translucencyByDistance: null,
        // minDistance: 50000,
        // maxDistance: 800000,

    };

    switch (category) {
        case "PLACEHOLDER":
            properties.image = "Map/images/billboards/icon_placeholder-video.svg";
            // properties.minDistance = 800000;
            // properties.maxDistance = 2000000;
            properties.width = 50;
            properties.height = 50;
            properties.translucencyByDistance = new Cesium.NearFarScalar(60000, 0, 200000, 1)
            break;

        case "MUSEUM":
            properties.image = "Map/images/billboards/monument.svg";
            properties.width = 30;
            properties.height = 30;
            properties.translucencyByDistance = new Cesium.NearFarScalar(60000, 0, 200000, 1)
            break;

    }

    return properties;
};





export default class Billboard {

    /// DRAW
    static draw(position, category, collection = null) {

        const properties = getPropertiesFromCategory(category)

        const entity = map.viewer.entities.add({
            opacity: 1, /// default value at start
            minDistance: properties.minDistance,
            maxDistance: properties.maxDistance,
            position: position,
            category: category,
            billboard: {
                image: properties.image,
                show: properties.show,
                pixelOffset: properties.pixelOffset,
                eyeOffset: properties.eyeOffset,
                horizontalOrigin: properties.horizontalOrigin,
                verticalOrigin: properties.verticalOrigin,
                scale: properties.scale,
                color: properties.color,
                rotation: properties.rotation,
                alignedAxis: properties.alignedAxis,
                width: properties.width,
                height: properties.height,
                disableDepthTestDistance: properties.disableDepthTestDistance,
                translucencyByDistance: properties.translucencyByDistance,
            }
        });
        if (collection) collection.push(entity);


        // /// register the listener to camerachanged, 
        // /// to update this billboard opacity
        // map.camera.changed.addEventListener(() => {
        //     updateOpacity(entity);
        // });

        // /// update opacity immediately
        // updateOpacity(entity);

        return entity;
    };


    /// REMOVE
    static remove(entity) {

        map.viewer.entities.remove(entity);
    };
};