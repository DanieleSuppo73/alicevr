import Asset from "./base/Asset.js";
import {
    gpxParser
} from "../../utils/gpxParser.js"
import Polyline from "../../entity/Polyline.js";



/* the single track */
class TrackElement {
    constructor(xmlElem, container) {
        this.gpxFolder = "data/gpx/";
        this.gpx_url = null;
        this.boundingSphere = null;
        this.positions = [];
        this.times = [];
        this.gpx = null;
        this.entity = null;
        this.setup(xmlElem, container);
    };

    /* setup */
    setup(xmlElem, container) {

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

        /* set the url */
        this.gpx_url = `${this.gpxFolder}${this.gpx_url}`;


        /* load GPX */
        TrackElement.loadTxt(this.gpx_url)
            .then((txt) => {

                /* parse GPX */
                this.gpx = new gpxParser();
                this.gpx.parse(txt, () => {

                    /// push 1st point
                    this.positions.push(Cesium.Cartesian3.fromDegrees(this.gpx.waypoints[0].lon, this.gpx.waypoints[0].lat));
                    if (this.gpx.waypoints[0].time)
                        this.times.push(new Date(Date.parse(this.gpx.waypoints[0].time)).getTime());

                    /// check distance for all others points
                    for (let i = 1; i < this.gpx.waypoints.length; i++) {
                        const pos1 = Cesium.Cartesian3.fromDegrees(this.gpx.waypoints[i].lon, this.gpx.waypoints[i].lat);
                        const pos2 = Cesium.Cartesian3.fromDegrees(this.gpx.waypoints[i - 1].lon, this.gpx.waypoints[i - 1].lat);
                        const dist = Cesium.Cartesian3.distance(pos1, pos2)

                        if (dist > 5) {
                            /// push point
                            this.positions.push(pos1);
                            if (this.gpx.waypoints[i].time)
                                this.times.push(new Date(Date.parse(this.gpx.waypoints[i].time)).getTime());
                        };
                    };

                    // /// draw the polyline
                    // this.entity = Polyline.draw(this.positions, "TRACK");

                    /* create bounding sphere from positions */
                    this.boundingSphere = new Cesium.BoundingSphere.fromPoints(this.positions);

                    /* add this boundingSphere to the container */
                    container.setBoundingSphere(this.boundingSphere);


                    // /// when all tracks are loaded end callback
                    // Track.loadingCount--;
                    // if (Track.loadingCount === 0) {
                    //     console.log("FINITO");
                    //     callback();
                    // }
                })
            });
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







/* the Class tracks container */
export default class Track extends Asset {
    constructor(id, xml) {
        super(id);
        this.tracks = [];
        this.setup(xml);
    };

    setup(xml) {
        let xmlElements = xml.getElementsByTagName("track");
        for (let i = 0; i < xmlElements.length; i++) {
            this.tracks[i] = new TrackElement(xmlElements[i], this);
        };
    };

    // setBoundingSphere(bdReceived) {
    //     this.boundingSphere = this.boundingSphere ?
    //         Cesium.BoundingSphere.union(bdReceived, this.boundingSphere) :
    //         bdReceived;
    // };
};








//////////////////////////
/////// STATIC
//////////////////////////

/// counter
Track.loadingCount = 0;
