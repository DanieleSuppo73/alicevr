import Asset from "./base/Asset.js";
import Gpx from "./Gpx.js";
import * as Utils from "../../../../../lib/Utils.js";





/* the Route Class -- container for RouteElements */
export default class Route extends Asset {
    constructor(id, xml, parent = null) {
        super(id, parent);
        this.routes = [];
        this.setup(xml);
    };

    setup(xml) {

        let parent = Asset.root.getAssetById(this.parentId);
        let track = Asset.root.getAssetByClass("Track", parent);
        if (track) {
            /* wait for Track asset ready */
            Utils.waitProperty(track, "ready", true)
                .then(() => {

                    /* get routes start-end from file */
                    if (xml.getElementsByTagName("route").length > 0) {
                        let xmlElements = xml.getElementsByTagName("route");


                    }

                    /* automatically create routes
                    from start-end of each Track element */
                    else {
                        console.log("NO ROUTES")
                    }
                });
        };









        // let xmlElements = xml.getElementsByTagName("route");
        // for (let i = 0; i < xmlElements.length; i++) {
        //     this.tracks[i] = new TrackElement(xmlElements[i], this);
        // };
    };
};





/**************************
 API request
from openrouteservice.org
***************************/
function request(startLng, startLat, endLng, endLat, callbak = null) {
    const body = '{"coordinates":[[' + startLng + "," + startLat + "],[" + endLng + "," + endLat + "]]}";
    const params = {
        locomotion: ["driving-car", "cycling-regular", "cycling-electric"]
    };
    const request = new XMLHttpRequest();
    request.open('POST', "https://api.openrouteservice.org/v2/directions/" + params.locomotion[0] + "/gpx");
    request.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', '5b3ce3597851110001cf6248691b8140d76d4c55b8effcc3d91d4aad');
    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            // console.log('Status:', this.status);
            // console.log('Headers:', this.getAllResponseHeaders());
            // console.log('Body:', this.responseText);

            var gpxRoute = new gpxParser();
            gpxRoute.parse(this.responseText);

            var array = gpxRoute.routes[0].points;
            var coordinates = [];

            // console.log(array[0]);

            // for (let i in array) {
            //     coordinates.push(array[i].lon, array[i].lat); // push without elevation
            // }

            // let Obj = {
            //     coordinates: []
            // }
            // Obj.coordinates = coordinates;

            // /// add the height, sampled from the terrain
            // insertHeightInCoordinates(Obj, () => {


            //     /// get Cartesian3 positions from coordinates
            //     let cartesianPositions = Cesium.Cartesian3.fromDegreesArrayHeights(Obj.coordinates);

            //     let polyline = viewer.entities.add({
            //         polyline: {
            //             positions: cartesianPositions,
            //             clampToGround: false,

            //             width: new Cesium.CallbackProperty(function () {
            //                 return tracksWidth;
            //             }, false),


            //             material: new Cesium.PolylineOutlineMaterialProperty({
            //                 color: new Cesium.CallbackProperty(function () {
            //                     return new Cesium.Color(0.26, 0.52, 0.96, tracksOpacity)
            //                 }),
            //                 outlineWidth: 2,
            //                 outlineColor: new Cesium.CallbackProperty(function () {
            //                     return new Cesium.Color(0, 0, 0, tracksOpacity)
            //                 }),
            //             }),

            //             show: isRouteVisible,
            //         }
            //     });



            //     let p = new route(polyline);
            //     routes.push(p);

                if (callbak) callbak();
            // });
        }
    };
    request.send(body);
}