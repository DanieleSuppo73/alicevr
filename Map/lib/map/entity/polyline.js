import map from "../map.js";
import {
    Maf
} from "../../../../lib/Maf.js"



/// set the range
var minRange = 25000;
var maxRange = 75000;
var globalOpacity = 0;
var globalWidth = 1;



map.onReady.push(function () {
    update();

    map.camera.changed.addEventListener(() => {
        update();
    });
});



function update() {
    let r = Maf.clamp(map.range, minRange, maxRange);
    globalOpacity = Maf.inverseLerp(maxRange, minRange, r);
    globalWidth = Maf.inverseLerp(maxRange * 2, minRange, r);
};





function getPropertiesFromCategory(category) {
    let properties = {
        clampToGround: true,
        width: 5,
        outlineWidth: 2,
        opacity: 1,
        color: new Cesium.Cartesian3(1, 1, 1),
        outlineColor: new Cesium.Cartesian3(0, 0, 0),
        show: true,
    };

    if (category) {
        switch (category) {
            case "TRACK":
                properties.width = 5;
                properties.outlineWidth = 2;
                properties.color = new Cesium.Cartesian3(0.08, 1.0, 0.94);
                break;

            case "ROUTE":
                properties.width = 5;
                properties.outlineWidth = 2;
                properties.color = new Cesium.Cartesian3(0.08, 1.0, 0.94);
                break;

            case "TRANSPARENT":
                properties.opacity = 0;
                properties.width = 25;
                properties.outlineWidth = 0;
                break;
        }
    }
    return properties;
}





export default class Polyline {

    /// DRAW
    static draw(positions, category = null, collection = null,
        onOverFunc = null, onExitFunc = null, onClickFunc = null) {

        const properties = getPropertiesFromCategory(category);

        const entity = map.viewer.entities.add({
            opacity: properties.opacity, /// change this value to set the opacity individually
            color: properties.color,
            outlineColor: properties.outlineColor,
            width: properties.width,
            category: category,
            polyline: {
                positions: positions,
                clampToGround: properties.clampToGround,
                width: properties.width,

                //// tooo slow.....
                // width: new Cesium.CallbackProperty(function () {
                //     return entity.width * globalWidth;
                // }, false),

                material: new Cesium.PolylineOutlineMaterialProperty({
                    color: new Cesium.CallbackProperty(function () {
                        return new Cesium.Color(entity.color.x, entity.color.y, entity.color.z, entity.opacity * globalOpacity)
                    }),
                    outlineWidth: properties.outlineWidth,
                    outlineColor: new Cesium.CallbackProperty(function () {
                        return new Cesium.Color(entity.outlineColor.x, entity.outlineColor.y, entity.outlineColor.z, entity.opacity * globalOpacity)
                    }),
                }),
                show: properties.show,
            }
        });

        if (collection) collection.push(entity);
        if (onOverFunc) map.onOverEntity.push(onOverFunc);
        if (onExitFunc) map.onExitEntity.push(onExitFunc);
        if (onClickFunc) map.onClickEntity.push(onClickFunc);

        return entity;
    }
};