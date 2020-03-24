import Asset from "./../base/Asset.js";
import gpxParser from "../../../utils/gpxParser.js";
import Polyline from "../../../entity/Polyline.js";



export default class Gpx {
    constructor(input, parent, category) {
        this.category = category;
        this.gpxFolder = "data/gpx/";
        this.gpx_url = null;
        this.boundingSphere = null;
        this.positions = [];
        this.times = [];
        this.data = null;
        this.entity = null;
        this.setup(input, parent);
    };

    /* setup */
    setup(input, parent) {

        Asset.boundingSphereLoading++;

        switch (this.category) {

            case "TRACK":
                /* create parameters */
                const xmlElem = input;
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
                this.gpx_url = `${this.gpxFolder}${this.gpx_url}`;
                Gpx.loadTxt(this.gpx_url)
                    .then((txt) => {
                        this.parseAndCreate(txt, parent);
                    });
                break;



            case "ROUTE":
                const txt = input;
                this.parseAndCreate(txt, parent);
                break;
        }
    };


    /* parse GPX from txt */
    parseAndCreate(txt, parent) {
        this.data = new gpxParser();
        this.data.parse(txt, () => {

            let points = [];
            if (this.data.waypoints.length !== 0) points = this.data.waypoints; /// for regular gpx
            else points = this.data.routes[0].points; /// for routes from API

            /// push 1st point
            this.positions.push(Cesium.Cartesian3.fromDegrees(points[0].lon, points[0].lat));
            if (typeof points[0].time !== "undefined"){
                if (points[0].time)
                this.times.push(new Date(Date.parse(points[0].time)).getTime());
            }
            

            /// check distance for all others points
            for (let i = 1; i < points.length; i++) {
                const pos1 = Cesium.Cartesian3.fromDegrees(points[i].lon, points[i].lat);
                const pos2 = Cesium.Cartesian3.fromDegrees(points[i - 1].lon, points[i - 1].lat);
                const dist = Cesium.Cartesian3.distance(pos1, pos2)

                if (dist > 5) {
                    /// push point
                    this.positions.push(pos1);
                    if (typeof points[i].time !== "undefined"){
                        if (points[i].time)
                        this.times.push(new Date(Date.parse(points[i].time)).getTime());
                    }
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
        });
    };



    /* STATIC
    load text file from url */
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