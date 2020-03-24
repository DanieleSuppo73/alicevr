import Asset from "./base/Asset.js";
import Gpx from "./extensions/Gpx.js";
import * as jsUtils from "../../../../../lib/jsUtils.js";


export default class Route extends Asset {
    constructor(id, xml, parent = null) {
        super(id, parent);
        this.routes = [];
        this.setup(xml);
    };

    setup(xml) {

        console.log("SETUP")

        /* sometimes "Asset.root" is not immediately available,
        so we must check when it's available */
        const waitRoot = () =>
        new Promise(resolve => setTimeout(() => {
            if (Asset.root) resolve();
            else {
                setTimeout(() => {
                    resolve(waitRoot());
                }, 0);
            }
        }, 50));


        waitRoot().then(() => {

            let parent = Asset.root.getAssetById(this.parentId);
            let track = Asset.root.getAssetByClass("Track", parent);
            if (track) {
                /* wait for Track asset ready */
                jsUtils.waitObjectProperty(track, "ready", true).then(() => {

                    /* if there are routes defined,
                    get routes start-end from file */
                    if (xml.getElementsByTagName("route").length > 0) {
                        let xmlElements = xml.getElementsByTagName("route");


                    }

                    /* else, automatically create routes
                    from start-end of each Track element */
                    else {
                        console.log("NO ROUTES");
                        this.n = 0;
                        this.getStartEndPointsAutomatically(track.tracks);
                    }
                });
            };
        });

        // let xmlElements = xml.getElementsByTagName("route");
        // for (let i = 0; i < xmlElements.length; i++) {
        //     this.tracks[i] = new TrackElement(xmlElements[i], this);
        // };
    };

    getStartEndPointsAutomatically(tracks) {
        if (this.n < tracks.length - 1) {

            const waypoints_A = tracks[this.n].data.waypoints;
            const lng_A = waypoints_A[waypoints_A.length - 1].lon;
            const lat_A = waypoints_A[waypoints_A.length - 1].lat;

            const waypoints_B = tracks[this.n + 1].data.waypoints;
            const lng_B = waypoints_B[0].lon;
            const lat_B = waypoints_B[0].lat;

            APIrequest(lng_A, lat_A, lng_B, lat_B)
                .then((responseText) => {

                    /* create a new Gpx Class object */
                    this.routes[this.n] = new Gpx(responseText, this, "ROUTE");

                    this.n++;
                    this.getStartEndPointsAutomatically(tracks);
                })
                .catch((error) => {
                    console.log('Some error has occured' + error);
                });


        } else {
            console.log("FINITO!!")
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
