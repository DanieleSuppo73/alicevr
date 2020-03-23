import Asset from "./base/Asset.js";
import gpxParser from "../../utils/gpxParser.js";
import Polyline from "../../entity/Polyline.js";



export default class Gpx {
    constructor(xmlElem, parent, category = null) {
        this.category = category;
        this.gpxFolder = "data/gpx/";
        this.gpx_url = null;
        this.boundingSphere = null;
        this.positions = [];
        this.times = [];
        this.data = null;
        this.entity = null;
        this.setup(xmlElem, parent);
    };

    /* setup */
    setup(xmlElem, parent) {

        Asset.boundingSphereLoading++;

        /* create parameters */
        const keys = ["title", "description", "gpx_url"];
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i]
            this[key] = null;
            if (xmlElem.getElementsByTagName(key).length > 0) {
                if (xmlElem.getElementsByTagName(key)[0].childNodes.length > 0) {
                    this[key] = xmlElem.getElementsByTagName(key)[0].childNodes[0].nodeValue;
                }
            };
        };

        /* load GPX from file */
        if (this.gpx_url) {
            this.gpx_url = `${this.gpxFolder}${this.gpx_url}`;

            Gpx.loadTxt(this.gpx_url)
                .then((txt) => {

                    /* parse GPX */
                    this.data = new gpxParser();
                    this.data.parse(txt, () => {

                        /// push 1st point
                        this.positions.push(Cesium.Cartesian3.fromDegrees(this.data.waypoints[0].lon, this.data.waypoints[0].lat));
                        if (this.data.waypoints[0].time)
                            this.times.push(new Date(Date.parse(this.data.waypoints[0].time)).getTime());

                        /// check distance for all others points
                        for (let i = 1; i < this.data.waypoints.length; i++) {
                            const pos1 = Cesium.Cartesian3.fromDegrees(this.data.waypoints[i].lon, this.data.waypoints[i].lat);
                            const pos2 = Cesium.Cartesian3.fromDegrees(this.data.waypoints[i - 1].lon, this.data.waypoints[i - 1].lat);
                            const dist = Cesium.Cartesian3.distance(pos1, pos2)

                            if (dist > 5) {
                                /// push point
                                this.positions.push(pos1);
                                if (this.data.waypoints[i].time)
                                    this.times.push(new Date(Date.parse(this.data.waypoints[i].time)).getTime());
                            };
                        };

                        /* draw the polyline */
                        this.entity = Polyline.draw(this.positions, this.category);

                        /* create bounding sphere from positions */
                        this.boundingSphere = new Cesium.BoundingSphere.fromPoints(this.positions);


                        Asset.boundingSphereLoading--;
                        parent.loading = parent._loading - 1;

                        /* add this boundingSphere to the parent */
                        parent.addBoundingSphere(this.boundingSphere);
                    })
                });
        };
    };






    /* STATIC */
    /* load text file from url */
    static loadTxt(url) {
        return new Promise(function (resolve) {
            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    resolve(xhttp.responseText);
                };
            };
            xhttp.open("GET", url, true);
            xhttp.send();
        });
    };
};