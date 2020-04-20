import Asset from "./Asset.js";
import Label from "../entities/Label.js";
import Billboard from "../entities/Billboard.js";


export default class Point extends Asset {
    constructor(id, xml, parent = null) {
        super(id, parent);
        this.points = [];
        this.setup(xml);
    };

    setup(xml) {

        let xmlElem = xml.getElementsByTagName("point");
        for (let i = 0; i < xmlElem.length; i++) {

            const elem = {};
            const keys = ["longitude", "latitude", "type", "category", "title", "description"];

            for (let ii = 0; ii < keys.length; ii++) {

                let key = keys[ii]
                elem[key] = null;

                if (xmlElem[i].getElementsByTagName(key).length > 0) {
                    if (xmlElem[i].getElementsByTagName(key)[0].childNodes.length > 0) {
                        elem[key] = xmlElem[i].getElementsByTagName(key)[0].childNodes[0].nodeValue;
                    }
                };
            };

            const pos = Cesium.Cartesian3.fromDegrees(elem.longitude, elem.latitude);

            switch (elem.type) {
                case "LABEL":
                    elem.entity = Label.draw(pos, elem.title, elem.category);
                    break;

                case "BILLBOARD":
                    elem.entity = Billboard.draw(pos, elem.category);
                    break;
            };

            this.points[i] = elem;
        };
    };
};