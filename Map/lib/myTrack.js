import {
    gpxParser
} from "./gpxParser.js"

import {
    drawPolyline,
} from "./map/tools/polyline.js";




export function load(asset) {

    const positions = [];
    const times = [];




    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {

            const gpx = new gpxParser();

            gpx.parse(xhttp.responseText, () => {

                /// push 1st point
                positions.push(Cesium.Cartesian3.fromDegrees(gpx.waypoints[0].lon, gpx.waypoints[0].lat));
                if (gpx.waypoints[0].time)
                    times.push(new Date(Date.parse(gpx.waypoints[0].time)).getTime());

                /// check distance for all others points
                for (let i = 1; i < gpx.waypoints.length; i++) {
                    const pos1 = Cesium.Cartesian3.fromDegrees(gpx.waypoints[i].lon, gpx.waypoints[i].lat);
                    const pos2 = Cesium.Cartesian3.fromDegrees(gpx.waypoints[i - 1].lon, gpx.waypoints[i - 1].lat);
                    const dist = Cesium.Cartesian3.distance(pos1, pos2)

                    if (dist > 5) {
                        /// push point
                        positions.push(pos1);
                        if (gpx.waypoints[i].time)
                            times.push(new Date(Date.parse(gpx.waypoints[i].time)).getTime());

                    }
                };

                // for (let pos of positions){
                //     console.log(pos)
                // };
                // for (let t of times){
                //     console.log(t)
                // };


                drawPolyline(positions, "TRACK")


            })


        }
    };
    xhttp.open("GET", `data/gpx/${asset.gpx}`, true);
    xhttp.send();
}