export function drawLabel(position, text, category = null, collection = null) {

    let properties = getPropertiesFromCategory(category)

    let entity = viewer.entities.add({
        position: position,
        label: {
            text: text,
            font: properties.font,
            fillColor: properties.fillColor,
            outlineColor: properties.outlineColor,
            outlineWidth: properties.outlineWidth,
            style: properties.style,
            verticalOrigin: properties.verticalOrigin,
            heightReference: properties.heightReference,
            pixelOffset: properties.pixelOffset,
            translucencyByDistance: properties.translucencyByDistance,
            disableDepthTestDistance: properties.disableDepthTestDistance,
        }
    });
    if (collection) collection.push(entity);
};




function getPropertiesFromCategory(category) {
    let properties = {
        font: "300 15px Roboto",
        outlineWidth: 2,
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        heightReference: Cesium.HeightReference.NONE,
        pixelOffset: new Cesium.Cartesian2(0, -5),
        translucencyByDistance: new Cesium.NearFarScalar(50000, 1.0,
            800000, 0.0),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
    };

    switch (category) {
        case "A1":
            properties.font = "500 24px Acumin-bold";
            properties.outlineWidth = 4;
            break;
        case "A2":
            properties.font = "500 19px Roboto";
            properties.outlineWidth = 4;
            break;
        case "A3":
            properties.font = "500 15px Roboto";
            properties.outlineWidth = 3;
            break;
        case "A4":
            properties.font = "400 13px Roboto";
            properties.outlineWidth = 2;
            break;
    }

    return properties;
}