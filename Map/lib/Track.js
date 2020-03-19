import {
    gpxParser
} from "./gpxParser.js"

import {
    drawPolyline,
} from "./map/entity/polyline.js";



class Track {
    constructor(asset) {
        this.url = `data/gpx/${asset.gpx}`;
        this.positions = [];
        this.times = [];
        this.gpx = null;
        this.entity = null;
        this.boundingSphere = null;
    }

    load(callback = null) {
        const _this = this;
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {

                _this.gpx = new gpxParser();

                _this.gpx.parse(xhttp.responseText, () => {

                    /// push 1st point
                    _this.positions.push(Cesium.Cartesian3.fromDegrees(_this.gpx.waypoints[0].lon, _this.gpx.waypoints[0].lat));
                    if (_this.gpx.waypoints[0].time)
                        _this.times.push(new Date(Date.parse(_this.gpx.waypoints[0].time)).getTime());

                    /// check distance for all others points
                    for (let i = 1; i < _this.gpx.waypoints.length; i++) {
                        const pos1 = Cesium.Cartesian3.fromDegrees(_this.gpx.waypoints[i].lon, _this.gpx.waypoints[i].lat);
                        const pos2 = Cesium.Cartesian3.fromDegrees(_this.gpx.waypoints[i - 1].lon, _this.gpx.waypoints[i - 1].lat);
                        const dist = Cesium.Cartesian3.distance(pos1, pos2)

                        if (dist > 5) {
                            /// push point
                            _this.positions.push(pos1);
                            if (_this.gpx.waypoints[i].time)
                                _this.times.push(new Date(Date.parse(_this.gpx.waypoints[i].time)).getTime());

                        }
                    };

                    /// draw the polyline
                    _this.entity = drawPolyline(_this.positions, "TRACK");

                    /// create the boundingsphere from positions
                    _this.boundingSphere = new Cesium.BoundingSphere.fromPoints(_this.positions);

                    if (callback) callback();
                })
            }
        };
        xhttp.open("GET", this.url, true);
        xhttp.send();
    }
};


export default Track;