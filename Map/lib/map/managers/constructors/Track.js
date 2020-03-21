import {
    gpxParser
} from "../../utils/gpxParser.js"

import Polyline from "../../entity/Polyline.js";



export default class Track {

    constructor(id) {
        this.id = id;
        this.gpx_url = null;
        this.positions = [];
        this.times = [];
        this.gpx = null;
        this.entity = null;
        this.boundingSphere = null;
    };

    loadGpx(asset, callback) {
        Track.loadingCount++;
        const self = this;
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {

                self.gpx = new gpxParser();

                self.gpx.parse(xhttp.responseText, () => {

                    /// push 1st point
                    self.positions.push(Cesium.Cartesian3.fromDegrees(self.gpx.waypoints[0].lon, self.gpx.waypoints[0].lat));
                    if (self.gpx.waypoints[0].time)
                        self.times.push(new Date(Date.parse(self.gpx.waypoints[0].time)).getTime());

                    /// check distance for all others points
                    for (let i = 1; i < self.gpx.waypoints.length; i++) {
                        const pos1 = Cesium.Cartesian3.fromDegrees(self.gpx.waypoints[i].lon, self.gpx.waypoints[i].lat);
                        const pos2 = Cesium.Cartesian3.fromDegrees(self.gpx.waypoints[i - 1].lon, self.gpx.waypoints[i - 1].lat);
                        const dist = Cesium.Cartesian3.distance(pos1, pos2)

                        if (dist > 5) {
                            /// push point
                            self.positions.push(pos1);
                            if (self.gpx.waypoints[i].time)
                                self.times.push(new Date(Date.parse(self.gpx.waypoints[i].time)).getTime());

                        }
                    };

                    /// draw the polyline
                    self.entity = Polyline.draw(self.positions, "TRACK");

                    /// return this boundingSphere to the Asset
                    self.boundingSphere = new Cesium.BoundingSphere.fromPoints(self.positions);

                    /// add this boundingSphere to the Asset
                    asset.boundingSphere = asset.boundingSphere ?
                        Cesium.BoundingSphere.union(asset.boundingSphere, self.boundingSphere) :
                        self.boundingSphere;

                    /// add this track to the Asset
                    asset.tracks.push(self);

                    /// when all tracks are loaded end callback
                    Track.loadingCount--;
                    if (Track.loadingCount === 0) {
                        console.log("FINITO");
                        callback();
                    }
                })
            }
        };
        xhttp.open("GET", `data/gpx/${this.gpx_url}`, true);
        xhttp.send();
    }
};


//////////////////////////
/////// STATIC
//////////////////////////

/// counter
Track.loadingCount = 0;

/// load the XML file with all the tracks
Track.loadXml = function (asset, callback) {
    asset.tracks = [];
    const xmlUrl = `data/xml/${asset.tracks_url}`;
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            const xml = xhttp.responseXML;

            let elements = xml.getElementsByTagName("track");
            const keys = ["title", "description", "gpx_url"];

            for (let i = 0; i < elements.length; i++) {

                let elem = elements[i];
                let track = new Track(asset.id);

                for (let ii = 0; ii < keys.length; ii++) {
                    let key = keys[ii]
                    // elem[key] = null;
                    if (elem.getElementsByTagName(key).length > 0) {
                        if (elem.getElementsByTagName(key)[0].childNodes.length > 0) {
                            track[key] = elem.getElementsByTagName(key)[0].childNodes[0].nodeValue;
                        }
                    }
                };
                track.loadGpx(asset, callback);
            };
        }
    };
    xhttp.open("GET", xmlUrl, true);
    xhttp.send();
};