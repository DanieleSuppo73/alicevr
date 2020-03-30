import map from "../map.js";


function getPropertiesFromCategory(category) {
    let properties = {
        pixelSize: 10,
        color: new Cesium.Color(1, 1, 1, 1),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,

    };

    switch (category) {
        case "PROXY":
            properties.color = new Cesium.Color(1, 0.9, 0, 0);
            break;
    }

    return properties;
};





export default class Point {

    /// DRAW
    static draw(position, category, collection = null) {

        const properties = getPropertiesFromCategory(category)

        const entity = map.viewer.entities.add({
            position: position,
            point: {
                pixelSize: properties.pixelSize,
                color: properties.color,
                disableDepthTestDistance: properties.disableDepthTestDistance,
            }
        });


        if (collection) collection.push(entity);
        return entity;
    };


    /// REMOVE
    static remove(entity) {
        map.viewer.entities.remove(entity);
    };
};