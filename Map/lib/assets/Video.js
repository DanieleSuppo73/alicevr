import Asset from "./Asset.js";
import Billboard from "../entities/Billboard.js";
import * as jsUtils from "../../../lib/jsUtils.js";
import * as entityUtils from "../utils/entity_utils.js";


export default class Video extends Asset {
    constructor(id, xml, parent = null) {
        super(id, parent);
        this.entity = null;
        this.entityOver = null;
        this.markers = [];
        this.setup(xml);
    };

    setup(xml) {

        const keys = ["owner", "title", "description", "date", "video_url1", "video_url2",
            "location", "poster_url", "markers_url", "subtitles_url"
        ];

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            this[key] = null;
            if (xml.getElementsByTagName(key).length > 0) {
                if (xml.getElementsByTagName(key)[0].childNodes.length > 0) {
                    this[key] = xml.getElementsByTagName(key)[0].childNodes[0].nodeValue;
                }
            }
        };

        /* load markers */
        if (this.markers_url) {
            Asset.boundingSphereLoading++;
            console.log(Asset.boundingSphereLoading)

            const coordForBoundigSphere = [];
            const keys = ["longitude", "latitude", "title", "gpxTime", "timecode", "trackToFollow"];

            jsUtils.loadXml(`../data/xml/${this.markers_url}`)
                .then((xml) => {

                    /* create marker */
                    let xmlElem = xml.getElementsByTagName("marker");
                    for (let i = 0; i < xmlElem.length; i++) {
                        let elem = {};
                        for (let ii = 0; ii < keys.length; ii++) {
                            let key = keys[ii]
                            elem[key] = null;
                            if (xmlElem[i].getElementsByTagName(key).length > 0) {
                                if (xmlElem[i].getElementsByTagName(key)[0].childNodes.length > 0) {
                                    elem[key] = xmlElem[i].getElementsByTagName(key)[0].childNodes[0].nodeValue;
                                };
                            };
                        };
                        if (elem.timecode) elem.timecode = jsUtils.convertTimeCodeToSeconds(elem.timecode);
                        if (elem.gpxTime) elem.gpxTime = new Date(Date.parse(elem.gpxTime)).getTime();
                        if (elem.trackToFollow) elem.trackToFollow = parseInt(elem.trackToFollow) - 1;

                        this.markers[i] = elem;

                        /* get coordinates for this video
                        boundingSphere from longitude-latitude
                        (it means that this video has no tracks) */
                        if (elem.longitude && elem.latitude && !elem.gpxTime) {
                            coordForBoundigSphere.push(elem.longitude, elem.latitude)
                        };
                    };

                    if (coordForBoundigSphere.length > 0) {
                        let positions = Cesium.Cartesian3.fromDegreesArray(coordForBoundigSphere);
                        let boundingSphere = new Cesium.BoundingSphere.fromPoints(positions);
                        Asset.boundingSphereLoading--;
                        this.addBoundingSphere(boundingSphere);
                    } else Asset.boundingSphereLoading--;
                });
        };
    };

    /* extend default */
    addBoundingSphere(bdReceived) {
        super.addBoundingSphere(bdReceived);

        /* set default placeholder */
        const asset = { id: this.id };
        if (!this.entity) {
            this.entity = Billboard.draw(this.boundingSphere.center, "PLACEHOLDER-VIDEO");
            this.entity.asset = asset;
            this.entity.utils = new entityUtils.Utils(this.entity);

        } else {
            this.entity.position = this.boundingSphere.center;
        }

        /* set over placeholder */
        if (!this.entityOver) {
            this.entityOver = Billboard.draw(this.boundingSphere.center, "PLACEHOLDER-VIDEO-OVER");
            this.entityOver.asset = asset;
            this.entityOver.utils = new entityUtils.Utils(this.entityOver);

        } else {
            this.entityOver.position = this.boundingSphere.center;
        }
    };
}