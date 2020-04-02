import Map from "../Map.js";


function getPropertiesFromCategory(category) {
    let properties = {
        rotation: 0,
        show: true,
        pixelOffset: new Cesium.Cartesian2(0, 0),
        eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 0.0),
        alignedAxis: Cesium.Cartesian3.ZERO,
        horizontalOrigin: Cesium.VerticalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scale: 1,
        color: Cesium.Color.WHITE,
        translucencyByDistance: null,


    };

    switch (category) {
        case "PLACEHOLDER":
            properties.image = "images/billboards/icon_placeholder-video.svg";
            properties.width = 50;
            properties.height = 50;
            properties.translucencyByDistance = new Cesium.NearFarScalar(60000, 0, 200000, 1)
            break;

        case "MUSEUM":
            properties.image = "images/billboards/mausoleum.png";
            properties.width = 25;
            properties.height = 25;
            properties.translucencyByDistance = new Cesium.NearFarScalar(80000, 0, 17000, 1)
            break;

        case "TEST":
            properties.image = "images/billboards/test.svg";
            properties.width = 25;
            properties.height = 25;
            properties.heightReference = Cesium.HeightReference.NONE;
            break;

        case "PROXY":
            properties.width = 25;
            properties.height = 25;
            properties.heightReference = Cesium.HeightReference.NONE;
            properties.color = Cesium.Color.RED.withAlpha(0);
            break;

        case "RADAR":
            properties.width = 25;
            properties.height = 25;
            properties.heightReference = Cesium.HeightReference.NONE;
            break;
    }

    return properties;
};





export default class Billboard {

    /// DRAW
    static draw(position, category, collection = null) {

        const properties = getPropertiesFromCategory(category)

        let entity;

        switch (category) {

            case "RADAR":
                entity = Map.viewer.entities.add({
                    opacity: 0, /// default value at start
                    position: position,
                    category: category,
                    billboard: {
                        image: properties.image,
                        show: properties.show,
                        horizontalOrigin: properties.horizontalOrigin,
                        verticalOrigin: properties.verticalOrigin,
                        scale: properties.scale,
                        color: new Cesium.CallbackProperty(function () {
                            return new Cesium.Color(entity.color.x, entity.color.y, entity.color.z, entity.opacity)
                        }, false),
                        width: properties.width,
                        height: properties.height,
                        heightReference: properties.heightReference,
                        disableDepthTestDistance: properties.disableDepthTestDistance,
                    }
                });
                break;

            default:
                entity = Map.viewer.entities.add({
                    opacity: 1, /// default value at start
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
                        heightReference: properties.heightReference,
                        disableDepthTestDistance: properties.disableDepthTestDistance,
                        translucencyByDistance: properties.translucencyByDistance,
                    }
                });
        }


        if (collection) collection.push(entity);
        return entity;
    };


    /// REMOVE
    static remove(entity) {
        Map.viewer.entities.remove(entity);
    };
};