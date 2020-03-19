import map from "../map.js";



var fixedHalfRadius = 0;
var semiAngle = 2 * Math.PI / 180;
var getFixedRadiusInterval = null;

// function getFixedRadius() {
//     const camPos = map.camera.positionWC;
//     const pos = entity.position._value;
//     const dist = Cesium.Cartesian3.distance(pos, camPos);
//     fixedHalfRadius = dist * Math.tan(semiAngle);
// }





function getPropertiesFromCategory(category) {
    let properties = {
        radius: 50,
        height: 50,
        opacity: 1,
        color: new Cesium.Cartesian3(1, 1, 1),
    };

    if (category) {
        switch (category) {
            case "PLACEHOLDER":
                properties.width = 5;
                properties.outlineWidth = 2;
                properties.color = new Cesium.Cartesian3(0.08, 1.0, 0.94);
                break;


        }
    }

    return properties;
}




export function drawEllipse(position, category = null, radius = null, collection = null) {

    let properties = getPropertiesFromCategory(category);

    const imgUrl = "Map/images/billboard_radar.svg";

    const entity = map.viewer.entities.add({
        position: position,
        color: properties.color,
        opacity: properties.opacity,
        category: category,
        ellipse: {
            // semiMinorAxis: 50.0,
            semiMinorAxis: new Cesium.CallbackProperty(function () {
                return fixedHalfRadius;
            }, false),
            // semiMajorAxis: 50.0,
            semiMajorAxis: new Cesium.CallbackProperty(function () {
                return fixedHalfRadius;
            }, false),
            height: properties.height,
            // material: Cesium.Color.RED,
            material: new Cesium.ImageMaterialProperty({
                image: imgUrl,
                // color: Cesium.Color.WHITE.withAlpha(1.0),
                // color: new Cesium.CallbackProperty(function () {
                //     return Cesium.Color.WHITE.withAlpha(1.0);
                // }, false),
                color: new Cesium.CallbackProperty(function () {
                    return new Cesium.Color(entity.color.x, entity.color.y, entity.color.z, entity.opacity)
                }, false),
                transparent: true,
            }),
        }
    });


    /// update radius to keep it fixed
    if (!getFixedRadiusInterval) {
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




export function removeEllipse(entity) {
    map.viewer.entities.remove(entity);

    /// clear interval
    if (getFixedRadiusInterval) clearInterval(getFixedRadiusInterval);
    getFixedRadiusInterval = null;
}