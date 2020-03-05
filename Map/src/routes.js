let routes = [];
class route {
    constructor(polyline) {
        this.polyline = polyline;
    }
}



let routesCameraHeight = 0;
let routesWidth = 6;
let CCC = 0;
let waitForMapReady = null;

function loadRoutes(asset) {

    if (waitForMapReady) clearInterval(waitForMapReady);
    waitForMapReady = setInterval(function () {

        if (map.isReady) {
            clearInterval(waitForMapReady);
            waitForMapReady = null;

            CCC = 0;

            let subObj = [];

            /// clear
            for (let i in routes) {
                viewer.entities.remove(routes[i].polyline);
            };
            routes = [];
            subObj = [];

            /// find all 'track' assets nested into this asset
            getAssetRecursive(asset, false, 'track', false, (result) => {
                // tracks.push(result.track);
                subObj.push(result);
            });

            if (subObj.length > 1) {
                if (asset.routes)
                    readRouteXml(asset.routes, subObj);
                else
                    loadAllRoutesFromApi(subObj);
            }
        }

    }, 100);
}




let isRouteVisible = layersToggle.showLayers;


function toggleRoutesVisibility(value) {
    isRouteVisible = value;
    for (let i in routes) {
        routes[i].polyline.show = value;
        routes[i].polyline.polyline.show = value;
    }
}




function loadAllRoutesFromXml(allRoutes, subObj) {

    let startLng;
    let startLat;
    let start = allRoutes[CCC].getElementsByTagName("start");
    
    let id = start[0].getElementsByTagName("id")[0].childNodes[0].nodeValue;
    let wp = start[0].getElementsByTagName("wp")[0].childNodes[0].nodeValue;

    for (let iii in subObj) {
        if (subObj[iii].id === id) {

            if (wp === "start") wp = 0;
            if (wp === "end") wp = subObj[iii].track.gpx.waypoints.length - 1;

            startLng = subObj[iii].track.gpx.waypoints[wp].lon;
            startLat = subObj[iii].track.gpx.waypoints[wp].lat;

        }
    }





    let endLng;
    let endLat;
    let end = allRoutes[CCC].getElementsByTagName("end");
    
    id = end[0].getElementsByTagName("id")[0].childNodes[0].nodeValue;
    wp = end[0].getElementsByTagName("wp")[0].childNodes[0].nodeValue;

    for (let iii in subObj) {
        if (subObj[iii].id === id) {

            if (wp === "start") wp = 0;
            if (wp === "end") wp = subObj[iii].track.gpx.waypoints.length - 1;

            endLng = subObj[iii].track.gpx.waypoints[wp].lon;
            endLat = subObj[iii].track.gpx.waypoints[wp].lat;

        }
    }




    if (!startLng || !startLat || !endLng || !endLat) {
        console.error("Not found")
    } else {
        loadRouteFromApi(startLng, startLat, endLng, endLat, function () {
            /// go for next route...
            if (CCC + 1 < allRoutes.length) {
                CCC++;
                loadAllRoutesFromXml(allRoutes, subObj);
            }
        })
    }
}





function loadAllRoutesFromApi(subObj) {
    let lastWpIndex = subObj[CCC].track.gpx.waypoints.length - 1;
    let startLng = subObj[CCC].track.gpx.waypoints[lastWpIndex].lon;
    let startLat = subObj[CCC].track.gpx.waypoints[lastWpIndex].lat;

    let endLng = subObj[CCC + 1].track.gpx.waypoints[0].lon;
    let endLat = subObj[CCC + 1].track.gpx.waypoints[0].lat;


    loadRouteFromApi(startLng, startLat, endLng, endLat, function () {
        /// go for next route...
        if (CCC + 1 < subObj.length) {
            // console.log("GO FOR NEXT")
            CCC++;
            loadAllRoutesFromApi(subObj);
        }

    })
}





function readRouteXml(url, subObj) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {

            /// read XML file
            let xmlDoc = this.responseXML;
            let allRoutes = xmlDoc.getElementsByTagName("route");
            loadAllRoutesFromXml(allRoutes, subObj);
        }
    };
    xhttp.open("GET", "../data/xml/" + url, true);
    xhttp.send();
}






function loadRouteFromApi(startLng, startLat, endLng, endLat, callbak = null) {

    const body = '{"coordinates":[[' + startLng + "," + startLat + "],[" + endLng + "," + endLat + "]]}";
    // console.log(body)

    const params = {
        locomotion: ["driving-car", "cycling-regular", "cycling-electric"]
    }



    let request = new XMLHttpRequest();

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

            for (let i in array) {
                coordinates.push(array[i].lon, array[i].lat); // push without elevation
            }

            let Obj = {
                coordinates: []
            }
            Obj.coordinates = coordinates;

            /// add the height, sampled from the terrain
            insertHeightInCoordinates(Obj, () => {


                /// get Cartesian3 positions from coordinates
                let cartesianPositions = Cesium.Cartesian3.fromDegreesArrayHeights(Obj.coordinates);

                let polyline = viewer.entities.add({
                    polyline: {
                        positions: cartesianPositions,
                        clampToGround: false,

                        width: new Cesium.CallbackProperty(function () {
                            return tracksWidth;
                        }, false),

                        
                        material: new Cesium.PolylineOutlineMaterialProperty({
                            color: new Cesium.CallbackProperty(function () {
                                return new Cesium.Color(0.26, 0.52, 0.96, tracksOpacity)
                            }),
                            outlineWidth: 2,
                            outlineColor: new Cesium.CallbackProperty(function () {
                                return new Cesium.Color(0, 0, 0, tracksOpacity)
                            }),
                        }),

                        show: isRouteVisible,
                    }
                });



                let p = new route(polyline);
                routes.push(p);

                if (callbak) callbak();
            });
        }
    };



    request.send(body);
}




/// load the routes when the asset is selected
main.onSelectedAssetHandlers.push(loadRoutes);

layersToggle.layersToggleHandlers.push(toggleRoutesVisibility);