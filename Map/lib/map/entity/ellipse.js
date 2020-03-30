import map from "../map.js";



const semiAngle = 2 * Math.PI / 180;





function getPropertiesFromCategory(category, radius) {
    let properties = {
        semiMinorAxis: radius,
        semiMajorAxis: radius,
        height: 0,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        opacity: 1,
        color: new Cesium.Cartesian3(1, 1, 1),
        category: category,
        image: null,
    };

    if (category) {
        switch (category) {

            case "RADAR":
                properties.semiMinorAxis = new Cesium.CallbackProperty(function () {
                    let dist = Cesium.Cartesian3.distance(map.camera.positionWC, entity.center);
                    return dist * Math.tan(semiAngle) * 3;
                }, false);
                properties.semiMajorAxis = new Cesium.CallbackProperty(function () {
                    let dist = Cesium.Cartesian3.distance(map.camera.positionWC, entity.center);
                    return dist * Math.tan(semiAngle) * 3;
                }, false);
                properties.semiMinorAxis = 100;
                properties.semiMajorAxis = 100;
                properties.image = "Map/images/billboards/radar.svg";
                properties.opacity = 0;
                break;

            case "POSITION":
                properties.semiMinorAxis = new Cesium.CallbackProperty(function () {
                    let dist = Cesium.Cartesian3.distance(map.camera.positionWC, entity.center);
                    return dist * Math.tan(semiAngle) * 3;
                }, false);
                properties.semiMajorAxis = new Cesium.CallbackProperty(function () {
                    let dist = Cesium.Cartesian3.distance(map.camera.positionWC, entity.center);
                    return dist * Math.tan(semiAngle) * 3;
                }, false);
                properties.semiMinorAxis = 100;
                properties.semiMajorAxis = 100;
                properties.image = "Map/images/billboards/position.svg";
                properties.opacity = 0;
                break;

            case "RED_TRANSPARENT":
                properties.color = new Cesium.Cartesian3(1, 0, 0);
                properties.opacity = 0.2;
                break;

            case "GREEN_TRANSPARENT":
                properties.color = new Cesium.Cartesian3(0, 1, 0);
                properties.opacity = 0.2;
                break;

            case "BLUE_TRANSPARENT":
                properties.color = new Cesium.Cartesian3(0, 0, 1);
                properties.opacity = 0.2;
                break;

            case "TEST":
                properties.semiMinorAxis = 100;
                properties.semiMajorAxis = 100;
                properties.image = "Map/images/billboards/test.svg";
                break;
        }
    }
    return properties;
};






export default class Ellipse {

    static draw(pos, category, radius = null, collection = null) {

        let entity;


        if (category === "RADAR" || category === "POSITION") {
            let properties = getPropertiesFromCategory(category, radius);

            entity = map.viewer.entities.add({
                center: pos,
                size: 2,
                position: new Cesium.CallbackProperty(function () {
                    return entity.center;
                }, false),
                color: properties.color,
                opacity: properties.opacity,
                category: category,
                ellipse: {
                    semiMinorAxis: new Cesium.CallbackProperty(function () {
                        let dist = Cesium.Cartesian3.distance(map.camera.positionWC, entity.center);
                        return dist * Math.tan(semiAngle) * entity.size;
                    }, false),
                    semiMajorAxis: new Cesium.CallbackProperty(function () {
                        let dist = Cesium.Cartesian3.distance(map.camera.positionWC, entity.center);
                        return dist * Math.tan(semiAngle) * entity.size;
                    }, false),
                    height: properties.height,
                    material: new Cesium.ImageMaterialProperty({
                        image: properties.image,
                        color: new Cesium.CallbackProperty(function () {
                            return new Cesium.Color(entity.color.x, entity.color.y, entity.color.z, entity.opacity)
                        }, false),
                        transparent: true,
                    }),
                    stRotation: 0,
                    heightReference: properties.heightReference,
                }
            });
        }







        if (collection) collection.push(entity);
        return entity;
    };



    static remove(entity) {
        map.viewer.entities.remove(entity);
    };
};