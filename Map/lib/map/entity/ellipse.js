import map from "../map.js";



var fixedHalfRadius = 0;
var semiAngle = 2 * Math.PI / 180;
var getFixedRadiusInterval = null;




function getPropertiesFromCategory(category, radius) {
    let properties = {
        semiMinorAxis: radius,
        semiMajorAxis: radius,
        height: 50,
        opacity: 1,
        color: new Cesium.Cartesian3(1, 1, 1),
    };

    if (category) {
        switch (category) {

            case "PLACEHOLDER":
                properties.semiMinorAxis = new Cesium.CallbackProperty(function () {
                    return fixedHalfRadius;
                }, false);
                properties.semiMajorAxis = new Cesium.CallbackProperty(function () {
                    return fixedHalfRadius;
                }, false);
                properties.image = "Map/images/billboard_radar.svg";
                break;

            case "RED_TRANSPARENT":
                properties.color = new Cesium.Cartesian3(1, 0, 0);
                properties.opacity = 0.3;
                break;

            case "GREEN_TRANSPARENT":
                properties.color = new Cesium.Cartesian3(0, 1, 0);
                properties.opacity = 0.3;
                break;

            case "BLUE_TRANSPARENT":
                properties.color = new Cesium.Cartesian3(0, 0, 1);
                properties.opacity = 0.3;
                break;

        }
    }
    return properties;
};






export default class Ellipse {

    /// DRAW
    static draw(position, category = null, radius = null, collection = null) {

        let properties = getPropertiesFromCategory(category, radius);
        const entity = map.viewer.entities.add({
            position: position,
            color: properties.color,
            opacity: properties.opacity,
            category: category,
            ellipse: {
                semiMinorAxis: properties.semiMinorAxis,
                semiMajorAxis: properties.semiMajorAxis,
                height: properties.height,
                material: new Cesium.ImageMaterialProperty({
                    image: properties.image,
                    color: new Cesium.CallbackProperty(function () {
                        return new Cesium.Color(entity.color.x, entity.color.y, entity.color.z, entity.opacity)
                    }, false),
                    transparent: true,
                }),
                stRotation: 0,
            }
        });


        /// update radius to keep it fixed
        if (category === "PLACEHOLDER" && !getFixedRadiusInterval) {
            getFixedRadiusInterval = setInterval(function () {
                const camPos = map.camera.positionWC;
                const pos = entity.position._value;
                const dist = Cesium.Cartesian3.distance(pos, camPos);
                fixedHalfRadius = dist * Math.tan(semiAngle);
            }, 10);
        }

        if (collection) collection.push(entity);

        return entity;
    };




    /// REMOVE
    static remove(entity) {

        map.viewer.entities.remove(entity);

        /// clear interval
        if (getFixedRadiusInterval) clearInterval(getFixedRadiusInterval);
        getFixedRadiusInterval = null;
    };
};