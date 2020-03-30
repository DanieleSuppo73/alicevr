import Asset from "./Asset.js";
import Loader from "../managers/Loader.js";
import Gpx from "./extensions/Gpx.js";
import * as jsUtils from "../../../lib/jsUtils.js";


export default class Route extends Asset {
    constructor(id, xml, parent = null) {
        super(id, parent);
        this.routes = [];
        this.setup(xml);
    };

    setup(xml) {

        let parent = Loader.root.getAssetById(this.parentId);
        let track = Loader.root.getAssetByClass("Track", parent);
        if (track) {
            /* wait for Track asset ready */
            jsUtils.waitObjectProperty(track, "ready", true).then(() => {
                this.n = 0;
                this.getStartEndPoints(track.tracks, xml);
            });
        };
    };

    getStartEndPoints(tracks, xml) {
        if (this.n < tracks.length - 1) {

            let waypoints_A;
            let waypoints_B;
            let lng_A, lat_A, lng_B, lat_B;

            /* if there are routes defined,
            get routes start-end from file */
            if (xml.getElementsByTagName("route").length > 0) {
                const xmlElements = xml.getElementsByTagName("route");

                const A = xmlElements[this.n].getElementsByTagName("start");
                const trA = parseInt(A[0].getElementsByTagName("track")[0].childNodes[0].nodeValue) - 1;
                let wpA = A[0].getElementsByTagName("wp")[0].childNodes[0].nodeValue;

                waypoints_A = tracks[trA].data.waypoints;

                if (wpA === "start") wpA = 0;
                if (wpA === "end") wpA = waypoints_A.length - 1;

                lng_A = waypoints_A[wpA].lon;
                lat_A = waypoints_A[wpA].lat;

                const B = xmlElements[this.n].getElementsByTagName("end");
                const trB = parseInt(B[0].getElementsByTagName("track")[0].childNodes[0].nodeValue) - 1;
                let wpB = B[0].getElementsByTagName("wp")[0].childNodes[0].nodeValue;

                waypoints_B = tracks[trB].data.waypoints;

                if (wpB === "start") wpB = 0;
                if (wpB === "end") wpB = waypoints_B.length - 1;

                lng_B = waypoints_B[wpB].lon;
                lat_B = waypoints_B[wpB].lat;
            }


            /* else get start-end
            from start-end of each Track element */
            else {
                waypoints_A = tracks[this.n].data.waypoints;
                waypoints_B = tracks[this.n + 1].data.waypoints;

                lng_A = waypoints_A[waypoints_A.length - 1].lon;
                lat_A = waypoints_A[waypoints_A.length - 1].lat;
                lng_B = waypoints_B[0].lon;
                lat_B = waypoints_B[0].lat;
            }


            APIrequest(lng_A, lat_A, lng_B, lat_B)
                .then((responseText) => {

                    /* create a new Gpx Class object */
                    this.routes[this.n] = new Gpx(responseText, this, "ROUTE");

                    this.n++;
                    this.getStartEndPoints(tracks, xml);
                })
                .catch((error) => {
                    console.log('Some error has occured' + error);
                });
        } else {
            delete this.n;
        }
    };
};




/**************************
 API request
from openrouteservice.org
***************************/
function APIrequest(startLng, startLat, endLng, endLat) {
    return new Promise((resolve, reject) => {
        const body = '{"coordinates":[[' + startLng + "," + startLat + "],[" + endLng + "," + endLat + "]]}";
        const params = {
            locomotion: ["driving-car", "cycling-regular", "cycling-electric"]
        };
        const request = new XMLHttpRequest();
        request.open('POST', `https://api.openrouteservice.org/v2/directions/${params.locomotion[0]}/gpx`);
        request.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');
        request.setRequestHeader('Content-Type', 'application/json');
        request.setRequestHeader('Authorization', '5b3ce3597851110001cf6248691b8140d76d4c55b8effcc3d91d4aad');
        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    resolve(this.responseText);
                } else {
                    reject(this.status);
                }
            }
        };
        request.send(body);
    });
};