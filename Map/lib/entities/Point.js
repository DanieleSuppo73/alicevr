import Map from "../Map.js";


function getPropertiesFromCategory(category) {
    let properties = {
        pixelSize: 10,
        color: new Cesium.Cartesian3(1, 1, 1),
        opacity: 1,
        outlineColor: new Cesium.Cartesian3(1, 1, 1),
        outlineWidth: 0,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        translucencyByDistance: null,   
    };

    switch (category) {
        case "PROXY":
            properties.color = new Cesium.Cartesian3(0.5, 0.5, 0.5);
            properties.opacity = 0;
            break;

        case "STARTING-POINT":
            properties.color = new Cesium.Cartesian3(0.08, 1.0, 0.94);
            properties.opacity = 0;
            properties.outlineColor = new Cesium.Cartesian3(0, 0, 0);
            properties.outlineWidth = 1;
            properties.translucencyByDistance = new Cesium.NearFarScalar(75000, 0, 25000, 1);
            break;
    }


    return properties;
};





export default class Point {

    /// DRAW
    static draw(position, category, collection = null) {

        const properties = getPropertiesFromCategory(category)

        const entity = Map.viewer.entities.add({
            category: category,
            position: position,
            color: properties.color,
            outlineColor: properties.outlineColor,
            opacity: properties.opacity,
            point: {
                pixelSize: properties.pixelSize,
                // color: properties.color,
                color: new Cesium.CallbackProperty(function () {
                    return new Cesium.Color(entity.color.x, entity.color.y, entity.color.z, entity.opacity)
                }, false),
                // outlineColor: properties.outlineColor,
                outlineColor: new Cesium.CallbackProperty(function () {
                    return new Cesium.Color(entity.outlineColor.x, entity.outlineColor.y, entity.outlineColor.z, entity.opacity)
                }, false),
                outlineWidth: properties.outlineWidth,
                disableDepthTestDistance: properties.disableDepthTestDistance,
                translucencyByDistance : properties.translucencyByDistance,
            }
        });


        if (collection) collection.push(entity);
        return entity;
    };


    /// REMOVE
    static remove(entity) {
        Map.viewer.entities.remove(entity);
    };
};